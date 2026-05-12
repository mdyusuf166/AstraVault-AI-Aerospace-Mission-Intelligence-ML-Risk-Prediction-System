from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

from train import DATA_PATH, METADATA_PATH, MISSION_MODEL_PATH, ROCKET_MODEL_PATH, train


def ensure_models() -> None:
    if not MISSION_MODEL_PATH.exists() or not ROCKET_MODEL_PATH.exists() or not METADATA_PATH.exists():
        train()


def load_metadata() -> dict[str, Any]:
    ensure_models()
    return json.loads(METADATA_PATH.read_text(encoding="utf-8"))


def load_mission_model() -> dict[str, Any]:
    ensure_models()
    return joblib.load(MISSION_MODEL_PATH)


def load_rocket_model() -> dict[str, Any]:
    ensure_models()
    return joblib.load(ROCKET_MODEL_PATH)


def mission_dataframe(payload: dict[str, Any]) -> pd.DataFrame:
    row = normalize_mission_payload(payload)
    artifact = load_mission_model()
    return pd.DataFrame([row], columns=artifact["features"])


def normalize_mission_payload(payload: dict[str, Any]) -> dict[str, Any]:
    total = float(payload.get("total_launches") or payload.get("totalLaunches") or 1)
    success = float(payload.get("successful_launches") or payload.get("successfulLaunches") or 0)
    partial = float(payload.get("partial_failures") or payload.get("partialFailures") or 0)
    rocket_reliability = payload.get("rocket_reliability", payload.get("rocketReliability"))
    if rocket_reliability is None:
        rocket_reliability = (success + partial * 0.45) / max(total, 1)

    return {
        "rocket_reliability": float(rocket_reliability),
        "organization_experience": float(payload.get("organization_experience", payload.get("organizationExperience", 0.6))),
        "launch_vehicle_history": float(payload.get("launch_vehicle_history", payload.get("launchVehicleHistory", 0.6))),
        "payload_mass_kg": float(payload.get("payload_mass_kg", payload.get("payloadMassKg", 1000))),
        "previous_failures": int(payload.get("previous_failures", payload.get("previousFailures", 0))),
        "launch_site_history": float(payload.get("launch_site_history", payload.get("launchSiteHistory", 0.75))),
        "crewed": int(bool(payload.get("crewed", payload.get("crewedStatus", False)))),
        "total_launches": int(total),
        "successful_launches": int(success),
        "failed_launches": int(payload.get("failed_launches", payload.get("failedLaunches", 0))),
        "partial_failures": int(partial),
        "orbit_type": str(payload.get("orbit_type", payload.get("orbitType", "LEO"))),
        "mission_type": str(payload.get("mission_type", payload.get("missionType", "SATELLITE_DEPLOYMENT"))),
        "destination": str(payload.get("destination", "Low Earth Orbit")),
        "budget_level": str(payload.get("budget_level", payload.get("budgetLevel", "MEDIUM"))),
        "reliability_priority": str(payload.get("reliability_priority", payload.get("reliabilityPriority", "HIGH"))),
    }


def risk_level(probability: float) -> str:
    if probability >= 0.82:
        return "LOW"
    if probability >= 0.62:
        return "MEDIUM"
    if probability >= 0.38:
        return "HIGH"
    return "CRITICAL"


def top_risk_factors(features: dict[str, Any], probability: float) -> list[str]:
    factors: list[str] = []
    if probability < 0.62:
        factors.append("Modeled success probability is below the mission readiness threshold.")
    if features["rocket_reliability"] < 0.72:
        factors.append("Rocket reliability is below mature operational levels.")
    if features["organization_experience"] < 0.65:
        factors.append("Organization experience score is limited for this mission profile.")
    if features["previous_failures"] > 0:
        factors.append("Previous mission failures increase inherited program risk.")
    if features["launch_site_history"] < 0.75:
        factors.append("Launch site history indicates elevated operational risk.")
    if features["payload_mass_kg"] > 12000:
        factors.append("Payload mass creates tighter launch vehicle performance margins.")
    if features["orbit_type"] in {"INTERPLANETARY", "SOLAR", "LUNAR"}:
        factors.append(f"{features['orbit_type']} trajectory increases navigation and operations complexity.")
    if features["crewed"] and probability < 0.8:
        factors.append("Crewed mission requires higher abort, redundancy, and recovery assurance.")
    return factors or ["No dominant risk factor detected from the provided features."]


def predict_mission_success(payload: dict[str, Any]) -> dict[str, Any]:
    artifact = load_mission_model()
    features = normalize_mission_payload(payload)
    frame = pd.DataFrame([features], columns=artifact["features"])
    probability = float(artifact["pipeline"].predict_proba(frame)[0][1])
    confidence = min(0.97, 0.58 + abs(probability - 0.5) * 0.78)
    factors = top_risk_factors(features, probability)
    return {
        "successProbability": round(probability, 4),
        "riskLevel": risk_level(probability),
        "confidenceScore": round(confidence, 4),
        "topRiskFactors": factors,
        "explanation": f"Mission readiness is {risk_level(probability).lower()} risk with {round(probability * 100)}% modeled success probability.",
        "modelVersion": artifact["modelVersion"],
    }


def training_data() -> pd.DataFrame:
    return pd.read_csv(DATA_PATH)


def rocket_reliability(payload: dict[str, Any]) -> dict[str, Any]:
    data = training_data()
    rocket_name = str(payload.get("rocket_name", payload.get("rocketName", ""))).strip()
    rocket_rows = data[data["rocket_name"].str.lower() == rocket_name.lower()] if rocket_name else data
    if rocket_rows.empty:
        rocket_rows = data

    total = int(payload.get("total_launches", payload.get("totalLaunches", rocket_rows["total_launches"].max())))
    successful = int(payload.get("successful_launches", payload.get("successfulLaunches", rocket_rows["successful_launches"].max())))
    failed = int(payload.get("failed_launches", payload.get("failedLaunches", rocket_rows["failed_launches"].max())))
    partial = int(payload.get("partial_failures", payload.get("partialFailures", rocket_rows["partial_failures"].max())))
    reliability = (successful + partial * 0.45) / max(total, 1)
    maturity = min(1.0, (total / 50) * 0.55 + reliability * 0.45)

    risk = "LOW" if reliability >= 0.9 and maturity >= 0.7 else "MEDIUM" if reliability >= 0.75 else "HIGH" if reliability >= 0.55 else "CRITICAL"
    return {
        "rocketName": rocket_name or str(rocket_rows.iloc[0]["rocket_name"]),
        "totalLaunches": total,
        "successfulLaunches": successful,
        "failedLaunches": failed,
        "partialFailures": partial,
        "reliabilityPercentage": round(reliability * 100, 2),
        "reliabilityScore": round(reliability, 4),
        "experimentalRiskLevel": risk,
        "riskLevel": risk,
        "rocketMaturityScore": round(maturity, 4),
        "modelVersion": load_metadata()["modelVersion"],
    }


def failure_patterns() -> dict[str, Any]:
    data = training_data()
    failures = data[data["status"].isin(["FAILURE", "PARTIAL"])].copy()
    failures["failure_category"] = failures["failure_category"].fillna("unknown")
    total = max(len(failures), 1)
    patterns = []
    descriptions = {
        "engine failure": "Propulsion anomaly or thrust shortfall during powered flight.",
        "staging failure": "Stage separation, hot-staging, or vehicle integration sequence anomaly.",
        "guidance failure": "Navigation, units, trajectory, or control logic issue.",
        "orbital insertion failure": "Upper-stage or spacecraft injection underperformance.",
        "landing failure": "Terminal descent, sensing, or touchdown sequence failure.",
        "communication failure": "Telemetry, command link, or blackout during critical operations.",
        "weather delay": "Weather constraints degraded launch availability or mission timeline.",
        "payload deployment failure": "Payload separation, deployment, or commissioning anomaly.",
    }
    for category, group in failures.groupby("failure_category"):
        patterns.append(
            {
                "category": category,
                "frequency": int(len(group)),
                "percentage": round((len(group) / total) * 100, 2),
                "description": descriptions.get(category, "Historical anomaly category detected in the training data."),
            }
        )
    patterns.sort(key=lambda item: item["frequency"], reverse=True)
    return {"patterns": patterns}


def recommend_launch_vehicle(payload: dict[str, Any]) -> dict[str, Any]:
    data = training_data()
    payload_mass = float(payload.get("payload_mass", payload.get("payloadMassKg", 1000)))
    orbit_type = str(payload.get("orbit_type", payload.get("orbitType", "LEO")))
    reliability_priority = str(payload.get("reliability_priority", payload.get("reliabilityPriority", "HIGH")))
    crewed = bool(payload.get("crewed", payload.get("crewedStatus", False)))

    candidates = []
    for rocket, group in data.groupby("rocket_name"):
        row = group.iloc[-1]
        reliability = (row["successful_launches"] + row["partial_failures"] * 0.45) / max(row["total_launches"], 1)
        mass_score = 1.0 if payload_mass < 5000 else 0.86 if payload_mass < 15000 else 0.68
        orbit_score = 1.0 if orbit_type in set(group["orbit_type"]) else 0.78
        crew_penalty = 0.12 if crewed and "CREW" not in set(group["mission_type"].astype(str)) else 0.0
        priority_weight = 0.65 if reliability_priority == "HIGH" else 0.5
        score = reliability * priority_weight + mass_score * 0.2 + orbit_score * 0.15 - crew_penalty
        candidates.append(
            {
                "rocket": rocket,
                "score": round(max(0, min(1, score)), 4),
                "estimatedRisk": risk_level(max(0, min(1, score))),
                "reason": f"{rocket} balances {round(reliability * 100)}% reliability with {orbit_type} mission fit.",
            }
        )
    candidates.sort(key=lambda item: item["score"], reverse=True)
    best = candidates[0]
    return {
        "recommendedRocket": best["rocket"],
        "reason": best["reason"],
        "alternativeRockets": candidates[1:4],
        "estimatedRisk": best["estimatedRisk"],
        "score": best["score"],
    }


def mission_risk_analysis(payload: dict[str, Any]) -> dict[str, Any]:
    features = normalize_mission_payload(payload)
    prediction = predict_mission_success(payload)
    technical = 1 - features["rocket_reliability"]
    operational = 1 - features["launch_site_history"]
    payload = min(1, features["payload_mass_kg"] / 25000)
    launch_vehicle = 1 - features["launch_vehicle_history"]
    orbital = 0.35 if features["orbit_type"] in {"LUNAR", "SOLAR", "INTERPLANETARY"} else 0.18
    org = 1 - features["organization_experience"]
    readiness = 1 - np.mean([technical, operational, payload, launch_vehicle, orbital, org])
    return {
        "technicalRisk": round(float(technical), 4),
        "operationalRisk": round(float(operational), 4),
        "payloadRisk": round(float(payload), 4),
        "launchVehicleRisk": round(float(launch_vehicle), 4),
        "orbitalRisk": round(float(orbital), 4),
        "organizationExperienceRisk": round(float(org), 4),
        "finalMissionReadinessScore": round(float(readiness), 4),
        "riskLevel": prediction["riskLevel"],
        "successProbability": prediction["successProbability"],
        "confidenceScore": prediction["confidenceScore"],
        "riskFactors": prediction["topRiskFactors"],
        "explanation": prediction["explanation"],
    }
