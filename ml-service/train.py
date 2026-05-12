from __future__ import annotations

import json
import os
import uuid
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import joblib
import pandas as pd
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

SERVICE_DIR = Path(__file__).resolve().parent
ROOT_DIR = SERVICE_DIR.parent
MODEL_PATH = SERVICE_DIR / "model.pkl"
MODEL_NAME = "astravault-mission-success"
MODEL_VERSION = "0.1.0"

NUMERIC_FEATURES = [
    "launch_year",
    "cost_usd_millions",
    "rocket_payload_leo_kg",
    "rocket_payload_gto_kg",
    "rocket_active",
    "rocket_reusable",
    "vehicle_reusable",
    "payload_count",
    "crew_count",
    "failure_report_count",
    "site_latitude",
    "site_longitude",
]

CATEGORICAL_FEATURES = [
    "destination",
    "orbit_type",
    "agency",
    "company",
    "rocket_name",
    "launch_site_country",
]

FEATURE_COLUMNS = NUMERIC_FEATURES + CATEGORICAL_FEATURES


def load_environment() -> None:
    load_dotenv(ROOT_DIR / ".env")
    load_dotenv(SERVICE_DIR / ".env")


def database_url() -> str | None:
    load_environment()
    url = os.getenv("DATABASE_URL")
    if not url:
        return None
    parts = urlsplit(url)
    query = [(key, value) for key, value in parse_qsl(parts.query, keep_blank_values=True) if key != "schema"]
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


def connect() -> psycopg2.extensions.connection:
    url = database_url()
    if not url:
        raise RuntimeError("DATABASE_URL is not set")
    return psycopg2.connect(url)


def fetch_mission_rows() -> list[dict[str, Any]]:
    query = """
        SELECT
          m."id",
          m."name",
          m."destination",
          m."status",
          EXTRACT(YEAR FROM m."launchDate")::INT AS "launch_year",
          m."costUsdMillions" AS "cost_usd_millions",
          COALESCE(a."acronym", a."name", 'Unknown') AS "agency",
          COALESCE(c."name", 'Unknown') AS "company",
          r."id" AS "rocket_id",
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
        WHERE m."status" IN ('SUCCESS', 'FAILURE', 'PARTIAL')
        ORDER BY m."launchDate" ASC NULLS LAST
    """
    with connect() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute(query)
            return [dict(row) for row in cursor.fetchall()]


def fallback_rows() -> list[dict[str, Any]]:
    return [
        seed_row("Apollo 11", "Moon", "SUCCESS", 1969, "NASA", "Unknown", "Saturn V", 0, 0, 140000, None, 0, 3, 1, 28.6084, -80.6043, "LUNAR"),
        seed_row("Crew Dragon Demo-2", "International Space Station", "SUCCESS", 2020, "NASA", "SpaceX", "Falcon 9", 1, 1, 22800, 8300, 1, 2, 1, 28.6084, -80.6043, "LEO"),
        seed_row("Artemis I", "Moon", "SUCCESS", 2022, "NASA", "Unknown", "Space Launch System", 1, 0, 95000, None, 0, 0, 1, 28.6272, -80.6209, "LUNAR"),
        seed_row("New Shepard NS-23", "Suborbital Space", "FAILURE", 2022, "Unknown", "Blue Origin", "New Shepard", 1, 1, None, None, 1, 0, 1, 31.4229, -104.7571, "SUBORBITAL", 1),
        seed_row("Starship Integrated Flight Test 1", "Suborbital Space", "FAILURE", 2023, "Unknown", "SpaceX", "Starship", 1, 1, 150000, None, 1, 0, 1, 25.9971, -97.1569, "SUBORBITAL", 1),
        seed_row("Starship Integrated Flight Test 2", "Suborbital Space", "PARTIAL", 2023, "Unknown", "SpaceX", "Starship", 1, 1, 150000, None, 1, 0, 1, 25.9971, -97.1569, "SUBORBITAL", 1),
        seed_row("Falcon Heavy Test Flight", "Heliocentric Orbit", "SUCCESS", 2018, "Unknown", "SpaceX", "Falcon Heavy", 1, 1, 63800, 26700, 1, 0, 1, 28.6084, -80.6043, "SOLAR"),
        seed_row("CAPSTONE", "Moon", "SUCCESS", 2022, "NASA", "Rocket Lab", "Electron", 1, 1, 320, None, 0, 0, 1, -39.2628, 177.8645, "LUNAR"),
    ]


def seed_row(
    name: str,
    destination: str,
    status: str,
    launch_year: int,
    agency: str,
    company: str,
    rocket_name: str,
    rocket_active: int,
    rocket_reusable: int,
    rocket_payload_leo_kg: int | None,
    rocket_payload_gto_kg: int | None,
    vehicle_reusable: int,
    crew_count: int,
    payload_count: int,
    site_latitude: float,
    site_longitude: float,
    orbit_type: str,
    failure_report_count: int = 0,
) -> dict[str, Any]:
    return {
        "id": None,
        "name": name,
        "destination": destination,
        "status": status,
        "launch_year": launch_year,
        "cost_usd_millions": 1200 if status == "SUCCESS" else 2500,
        "agency": agency,
        "company": company,
        "rocket_id": None,
        "rocket_name": rocket_name,
        "rocket_active": rocket_active,
        "rocket_reusable": rocket_reusable,
        "rocket_payload_leo_kg": rocket_payload_leo_kg,
        "rocket_payload_gto_kg": rocket_payload_gto_kg,
        "vehicle_reusable": vehicle_reusable,
        "payload_count": payload_count,
        "crew_count": crew_count,
        "failure_report_count": failure_report_count,
        "launch_site_country": "United States",
        "site_latitude": site_latitude,
        "site_longitude": site_longitude,
        "orbit_type": orbit_type,
    }


def training_rows() -> tuple[list[dict[str, Any]], str]:
    try:
        rows = fetch_mission_rows()
        if len(rows) >= 6:
            return rows, "postgres"
    except Exception as exc:
        print(f"Database training load unavailable: {exc}")
    return fallback_rows(), "fallback"


def normalize_frame(rows: list[dict[str, Any]]) -> pd.DataFrame:
    frame = pd.DataFrame(rows)
    for column in FEATURE_COLUMNS:
        if column not in frame:
            frame[column] = None
    for column in ["rocket_active", "rocket_reusable", "vehicle_reusable"]:
        frame[column] = frame[column].fillna(False).astype(int)
    return frame


def build_pipeline() -> Pipeline:
    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
        ]
    )
    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
            ("encoder", OneHotEncoder(handle_unknown="ignore")),
        ]
    )
    preprocessor = ColumnTransformer(
        transformers=[
            ("numeric", numeric_pipeline, NUMERIC_FEATURES),
            ("categorical", categorical_pipeline, CATEGORICAL_FEATURES),
        ]
    )
    classifier = RandomForestClassifier(
        n_estimators=160,
        max_depth=6,
        random_state=42,
        class_weight="balanced_subsample",
    )
    return Pipeline(steps=[("preprocessor", preprocessor), ("classifier", classifier)])


def train_model() -> dict[str, Any]:
    started = datetime.now(UTC)
    rows, source = training_rows()
    frame = normalize_frame(rows)
    labels = frame["status"].map(lambda value: 1 if value == "SUCCESS" else 0)
    features = frame[FEATURE_COLUMNS]

    pipeline = build_pipeline()
    metrics: dict[str, Any] = {"source": source, "rows": int(len(frame))}
    if len(frame) >= 8 and labels.nunique() > 1 and min(labels.value_counts()) >= 2:
        x_train, x_test, y_train, y_test = train_test_split(
            features,
            labels,
            test_size=0.25,
            random_state=42,
            stratify=labels,
        )
        pipeline.fit(x_train, y_train)
        predictions = pipeline.predict(x_test)
        metrics["accuracy"] = round(float(accuracy_score(y_test, predictions)), 4)
        try:
            probabilities = pipeline.predict_proba(x_test)[:, 1]
            metrics["roc_auc"] = round(float(roc_auc_score(y_test, probabilities)), 4)
        except Exception:
            metrics["roc_auc"] = None
    else:
        pipeline.fit(features, labels)
        metrics["accuracy"] = None
        metrics["roc_auc"] = None

    artifact = {
        "model_name": MODEL_NAME,
        "model_version": MODEL_VERSION,
        "trained_at": datetime.now(UTC).isoformat(),
        "feature_columns": FEATURE_COLUMNS,
        "numeric_features": NUMERIC_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "pipeline": pipeline,
        "metrics": metrics,
    }
    joblib.dump(artifact, MODEL_PATH)
    metrics["artifact_path"] = str(MODEL_PATH)
    metrics["finished_at"] = datetime.now(UTC).isoformat()
    record_model_run(metrics, len(frame), started)
    return metrics


def record_model_run(metrics: dict[str, Any], training_count: int, started: datetime) -> None:
    try:
        with connect() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO "MLModelRun" (
                      "id", "modelName", "modelVersion", "runType", "status",
                      "trainingRows", "metrics", "artifactPath", "startedAt", "finishedAt"
                    )
                    VALUES (%s, %s, %s, 'TRAINING', 'COMPLETED', %s, %s::jsonb, %s, %s, CURRENT_TIMESTAMP)
                    """,
                    (
                        f"mlrun_{uuid.uuid4().hex}",
                        MODEL_NAME,
                        MODEL_VERSION,
                        training_count,
                        json.dumps(metrics),
                        str(MODEL_PATH),
                        started,
                    ),
                )
    except Exception as exc:
        print(f"Skipped MLModelRun persistence: {exc}")


if __name__ == "__main__":
    result = train_model()
    print(json.dumps(result, indent=2))
