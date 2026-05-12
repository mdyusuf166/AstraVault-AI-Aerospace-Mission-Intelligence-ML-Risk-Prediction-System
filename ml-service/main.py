from __future__ import annotations

import math
from pathlib import Path
from typing import Any

import joblib
import pandas as pd
import psycopg2.extras
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from train import FEATURE_COLUMNS, MODEL_PATH, connect, fallback_rows, normalize_frame, train_model

app = FastAPI(
    title="AstraVault ML Service",
    version="0.1.0",
    description="Mission success prediction, rocket reliability, failure analysis, and launch vehicle recommendation service.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MissionFeatures(BaseModel):
    missionId: str | None = None
    missionName: str = "Proposed Mission"
    destination: str = "Low Earth Orbit"
    orbitType: str = "LEO"
    launchYear: int | None = None
    agency: str = "Unknown"
    company: str = "Unknown"
    rocketName: str = "Unknown"
    launchSiteCountry: str = "United States"
    costUsdMillions: float | None = None
    rocketPayloadLeoKg: float | None = None
    rocketPayloadGtoKg: float | None = None
    rocketActive: bool = True
    rocketReusable: bool = False
    vehicleReusable: bool = False
    payloadCount: int = 1
    crewCount: int = 0
    failureReportCount: int = 0
    siteLatitude: float | None = None
    siteLongitude: float | None = None


class LaunchRecommendationRequest(BaseModel):
    destination: str = "Low Earth Orbit"
    orbitType: str = "LEO"
    payloadMassKg: float = Field(default=1000, ge=0)
    requiresHumanRating: bool = False
    preferReusable: bool = True


class RocketRecommendation(BaseModel):
    rocketId: str | None
    rocketName: str
    score: float
    reliabilityScore: float
    confidence: float
    rationale: list[str]


class PredictionResponse(BaseModel):
    missionId: str | None
    missionName: str
    successProbability: float
    riskLevel: str
    confidence: float
    riskFactors: list[str]
    explanation: str
    modelVersion: str


def load_model() -> dict[str, Any]:
    if not Path(MODEL_PATH).exists():
        train_model()
    try:
        return joblib.load(MODEL_PATH)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"ML model is unavailable: {exc}") from exc


def mission_row_from_db(mission_id: str) -> dict[str, Any] | None:
    query = """
        SELECT
          m."id",
          m."name",
          m."destination",
          EXTRACT(YEAR FROM m."launchDate")::INT AS "launch_year",
          m."costUsdMillions" AS "cost_usd_millions",
          COALESCE(a."acronym", a."name", 'Unknown') AS "agency",
          COALESCE(c."name", 'Unknown') AS "company",
          r."name" AS "rocket_name",
          r."active" AS "rocket_active",
          r."reusable" AS "rocket_reusable",
          r."payloadLeoKg" AS "rocket_payload_leo_kg",
          r."payloadGtoKg" AS "rocket_payload_gto_kg",
          lv."reusable" AS "vehicle_reusable",
          ls."country" AS "launch_site_country",
          ls."latitude" AS "site_latitude",
          ls."longitude" AS "site_longitude",
          COALESCE(o."type"::TEXT, 'UNKNOWN') AS "orbit_type",
          (SELECT COUNT(*) FROM "Payload" p WHERE p."missionId" = m."id")::INT AS "payload_count",
          (SELECT COUNT(*) FROM "MissionCrew" mc WHERE mc."missionId" = m."id")::INT AS "crew_count",
          (SELECT COUNT(*) FROM "FailureReport" fr WHERE fr."missionId" = m."id")::INT AS "failure_report_count"
        FROM "Mission" m
        JOIN "LaunchVehicle" lv ON lv."id" = m."launchVehicleId"
        JOIN "Rocket" r ON r."id" = lv."rocketId"
        JOIN "LaunchSite" ls ON ls."id" = m."launchSiteId"
        LEFT JOIN "Agency" a ON a."id" = m."agencyId"
        LEFT JOIN "Company" c ON c."id" = m."companyId"
        LEFT JOIN "Orbit" o ON o."id" = m."orbitId"
        WHERE m."id" = %s
        LIMIT 1
    """
    try:
        with connect() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute(query, (mission_id,))
                row = cursor.fetchone()
                return dict(row) if row else None
    except Exception:
        return None


def features_to_row(features: MissionFeatures) -> dict[str, Any]:
    if features.missionId:
        db_row = mission_row_from_db(features.missionId)
        if db_row:
            return db_row

    return {
        "id": features.missionId,
        "name": features.missionName,
        "destination": features.destination,
        "launch_year": features.launchYear,
        "cost_usd_millions": features.costUsdMillions,
        "agency": features.agency,
        "company": features.company,
        "rocket_name": features.rocketName,
        "rocket_active": int(features.rocketActive),
        "rocket_reusable": int(features.rocketReusable),
        "rocket_payload_leo_kg": features.rocketPayloadLeoKg,
        "rocket_payload_gto_kg": features.rocketPayloadGtoKg,
        "vehicle_reusable": int(features.vehicleReusable),
        "payload_count": features.payloadCount,
        "crew_count": features.crewCount,
        "failure_report_count": features.failureReportCount,
        "launch_site_country": features.launchSiteCountry,
        "site_latitude": features.siteLatitude,
        "site_longitude": features.siteLongitude,
        "orbit_type": features.orbitType,
    }


def probability_for(row: dict[str, Any]) -> tuple[float, str]:
    artifact = load_model()
    frame = normalize_frame([row])
    probability = float(artifact["pipeline"].predict_proba(frame[FEATURE_COLUMNS])[0][1])
    return probability, artifact.get("model_version", "unknown")


def risk_level(probability: float) -> str:
    if probability >= 0.8:
        return "LOW"
    if probability >= 0.6:
        return "MODERATE"
    if probability >= 0.4:
        return "ELEVATED"
    return "HIGH"


def confidence(probability: float, row: dict[str, Any]) -> float:
    base = 0.55 + abs(probability - 0.5) * 0.7
    known_bonus = sum(1 for value in row.values() if value not in [None, "", "Unknown"]) / max(len(row), 1) * 0.15
    return round(min(0.96, base + known_bonus), 3)


def risk_factors(row: dict[str, Any], probability: float) -> list[str]:
    factors: list[str] = []
    if probability < 0.6:
        factors.append("Model probability is below the operational confidence band.")
    if int(row.get("failure_report_count") or 0) > 0:
        factors.append("Linked mission history includes failure reports or anomalies.")
    if not bool(row.get("rocket_active", True)):
        factors.append("Launch system is not currently active.")
    if row.get("orbit_type") in {"SUBORBITAL", "INTERPLANETARY", "SOLAR"}:
        factors.append(f"{row.get('orbit_type')} profile has elevated trajectory uncertainty in the training set.")
    if int(row.get("crew_count") or 0) > 0 and probability < 0.75:
        factors.append("Crewed mission profile requires tighter abort, redundancy, and recovery margins.")
    if (row.get("rocket_payload_leo_kg") is None) and (row.get("rocket_payload_gto_kg") is None):
        factors.append("Rocket payload capacity is incomplete, lowering model confidence.")
    if not factors:
        factors.append("No dominant risk factor was detected from the available mission features.")
    return factors


def explain(row: dict[str, Any], probability: float) -> str:
    level = risk_level(probability).lower()
    rocket = row.get("rocket_name") or "the selected vehicle"
    destination = row.get("destination") or "the target destination"
    return f"{rocket} for {destination} is assessed as {level} risk with a {round(probability * 100)}% modeled success probability."


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "modelReady": Path(MODEL_PATH).exists()}


@app.post("/predict-mission-success", response_model=PredictionResponse)
def predict_mission_success(features: MissionFeatures) -> PredictionResponse:
    row = features_to_row(features)
    probability, version = probability_for(row)
    return PredictionResponse(
        missionId=row.get("id"),
        missionName=row.get("name") or features.missionName,
        successProbability=round(probability, 4),
        riskLevel=risk_level(probability),
        confidence=confidence(probability, row),
        riskFactors=risk_factors(row, probability),
        explanation=explain(row, probability),
        modelVersion=version,
    )


def rocket_rows() -> list[dict[str, Any]]:
    query = """
      SELECT
        r."id",
        r."name",
        r."reusable",
        r."active",
        r."payloadLeoKg",
        r."payloadGtoKg",
        COUNT(m."id")::INT AS "launch_count",
        COUNT(m."id") FILTER (WHERE m."status" = 'SUCCESS')::INT AS "success_count",
        COUNT(m."id") FILTER (WHERE m."status" = 'FAILURE')::INT AS "failure_count",
        COUNT(m."id") FILTER (WHERE m."status" = 'PARTIAL')::INT AS "partial_count",
        MAX(o."type"::TEXT) AS "common_orbit"
      FROM "Rocket" r
      LEFT JOIN "LaunchVehicle" lv ON lv."rocketId" = r."id"
      LEFT JOIN "Mission" m ON m."launchVehicleId" = lv."id"
      LEFT JOIN "Orbit" o ON o."id" = m."orbitId"
      GROUP BY r."id"
      ORDER BY r."name" ASC
    """
    try:
        with connect() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute(query)
                return [dict(row) for row in cursor.fetchall()]
    except Exception:
        return fallback_rocket_rows()


def fallback_rocket_rows() -> list[dict[str, Any]]:
    rows = fallback_rows()
    by_rocket: dict[str, dict[str, Any]] = {}
    for row in rows:
        rocket = row["rocket_name"]
        record = by_rocket.setdefault(
            rocket,
            {
                "id": None,
                "name": rocket,
                "reusable": bool(row["rocket_reusable"]),
                "active": bool(row["rocket_active"]),
                "payloadLeoKg": row["rocket_payload_leo_kg"],
                "payloadGtoKg": row["rocket_payload_gto_kg"],
                "launch_count": 0,
                "success_count": 0,
                "failure_count": 0,
                "partial_count": 0,
                "common_orbit": row["orbit_type"],
            },
        )
        record["launch_count"] += 1
        if row["status"] == "SUCCESS":
            record["success_count"] += 1
        elif row["status"] == "FAILURE":
            record["failure_count"] += 1
        elif row["status"] == "PARTIAL":
            record["partial_count"] += 1
    return list(by_rocket.values())


def reliability_payload(row: dict[str, Any]) -> dict[str, Any]:
    launches = int(row.get("launch_count") or 0)
    successes = int(row.get("success_count") or 0)
    failures = int(row.get("failure_count") or 0)
    partials = int(row.get("partial_count") or 0)
    completed = max(successes + failures + partials, 1)
    score = (successes + partials * 0.45) / completed
    reliability_confidence = min(0.95, 0.45 + math.log1p(launches) / 5)
    factors = [
        f"{successes} successful outcomes across {launches} tracked launches.",
        f"{failures} failures and {partials} partial outcomes in the dataset.",
    ]
    if row.get("reusable"):
        factors.append("Reusable architecture improves operational learning rate.")
    if not row.get("active"):
        factors.append("Inactive rocket family lowers confidence for future recommendations.")
    return {
        "rocketId": row.get("id"),
        "rocketName": row.get("name"),
        "reliabilityScore": round(score, 4),
        "confidence": round(reliability_confidence, 3),
        "launchCount": launches,
        "successCount": successes,
        "failureCount": failures,
        "partialCount": partials,
        "factors": factors,
    }


@app.get("/rocket-reliability/{rocketId}")
def rocket_reliability(rocketId: str) -> dict[str, Any]:
    rows = rocket_rows()
    row = next((item for item in rows if item.get("id") == rocketId), None)
    if not row and rows:
        row = next((item for item in rows if item.get("name") == rocketId), None)
    if not row and rocketId == "demo":
        row = rows[0]
    if not row:
        raise HTTPException(status_code=404, detail="Rocket not found in mission dataset")
    return reliability_payload(row)


@app.post("/recommend-launch-vehicle")
def recommend_launch_vehicle(request: LaunchRecommendationRequest) -> dict[str, Any]:
    recommendations: list[RocketRecommendation] = []
    for row in rocket_rows():
        reliability = reliability_payload(row)
        payload_capacity = row.get("payloadGtoKg") if request.orbitType in {"GEO", "HEO"} else row.get("payloadLeoKg")
        payload_capacity = payload_capacity or row.get("payloadLeoKg") or 0
        payload_fit = 1.0 if payload_capacity >= request.payloadMassKg else max(0.0, payload_capacity / max(request.payloadMassKg, 1))
        reusable_bonus = 0.08 if request.preferReusable and row.get("reusable") else 0
        active_bonus = 0.1 if row.get("active") else -0.12
        crew_penalty = 0.1 if request.requiresHumanRating and reliability["launchCount"] < 2 else 0
        score = reliability["reliabilityScore"] * 0.58 + payload_fit * 0.24 + active_bonus + reusable_bonus - crew_penalty
        rationale = [
            f"{round(reliability['reliabilityScore'] * 100)}% reliability score.",
            f"Payload fit score {round(payload_fit * 100)}% for {request.payloadMassKg:g} kg.",
        ]
        if row.get("reusable"):
            rationale.append("Reusable vehicle family preferred for iterative launch operations.")
        if request.requiresHumanRating:
            rationale.append("Crewed requirement considered through launch history confidence.")
        recommendations.append(
            RocketRecommendation(
                rocketId=row.get("id"),
                rocketName=row.get("name"),
                score=round(max(0.0, min(1.0, score)), 4),
                reliabilityScore=reliability["reliabilityScore"],
                confidence=reliability["confidence"],
                rationale=rationale,
            )
        )
    recommendations.sort(key=lambda item: item.score, reverse=True)
    return {"recommendations": [item.model_dump() for item in recommendations[:5]]}


@app.get("/failure-patterns")
def failure_patterns() -> dict[str, Any]:
    query = """
      SELECT
        fr."phase",
        fr."rootCause",
        fr."impact",
        fr."severity",
        m."name" AS "mission_name",
        r."name" AS "rocket_name"
      FROM "FailureReport" fr
      JOIN "Mission" m ON m."id" = fr."missionId"
      JOIN "LaunchVehicle" lv ON lv."id" = m."launchVehicleId"
      JOIN "Rocket" r ON r."id" = lv."rocketId"
      ORDER BY fr."severity" DESC, fr."reportedAt" DESC
    """
    try:
        with connect() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute(query)
                rows = [dict(row) for row in cursor.fetchall()]
    except Exception:
        rows = [
            {
                "phase": "Ascent",
                "rootCause": "Booster propulsion anomaly",
                "impact": "Mission objective was not completed.",
                "severity": 4,
                "mission_name": "New Shepard NS-23",
                "rocket_name": "New Shepard",
            },
            {
                "phase": "Ascent",
                "rootCause": "Integrated vehicle control loss",
                "impact": "Starship test objective only partially completed.",
                "severity": 4,
                "mission_name": "Starship IFT-1",
                "rocket_name": "Starship",
            },
        ]

    grouped: dict[str, dict[str, Any]] = {}
    for row in rows:
        phase = row.get("phase") or "Unknown"
        pattern = grouped.setdefault(
            phase,
            {
                "patternType": "PHASE_CLUSTER",
                "title": f"{phase} anomaly concentration",
                "summary": "",
                "phase": phase,
                "severity": 0,
                "frequency": 0,
                "affectedSystems": set(),
                "recommendations": [
                    "Increase simulation coverage for this mission phase.",
                    "Add explicit readiness gates for propulsion, guidance, and telemetry.",
                ],
            },
        )
        pattern["frequency"] += 1
        pattern["severity"] = max(pattern["severity"], int(row.get("severity") or 3))
        pattern["affectedSystems"].add(row.get("rocket_name") or "Unknown")
    patterns = []
    for pattern in grouped.values():
        systems = sorted(pattern["affectedSystems"])
        pattern["affectedSystems"] = systems
        pattern["summary"] = f"{pattern['frequency']} tracked anomaly reports cluster in {pattern['phase']} across {', '.join(systems)}."
        patterns.append(pattern)
    patterns.sort(key=lambda item: (item["severity"], item["frequency"]), reverse=True)
    return {"patterns": patterns}


@app.post("/mission-risk-analysis")
def mission_risk_analysis(features: MissionFeatures) -> dict[str, Any]:
    prediction = predict_mission_success(features)
    return {
        "missionId": prediction.missionId,
        "missionName": prediction.missionName,
        "riskLevel": prediction.riskLevel,
        "successProbability": prediction.successProbability,
        "confidence": prediction.confidence,
        "riskFactors": prediction.riskFactors,
        "explanation": prediction.explanation,
        "mitigations": [
            "Validate launch vehicle family performance against similar orbit and payload profiles.",
            "Run additional mission simulations for the highest-risk flight phases.",
            "Review anomaly history and add explicit go/no-go criteria before launch readiness review.",
        ],
    }
