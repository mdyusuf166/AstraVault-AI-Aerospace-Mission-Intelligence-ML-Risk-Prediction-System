from __future__ import annotations

import json
import os
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "missions.csv"
MODELS_DIR = BASE_DIR / "models"
MISSION_MODEL_PATH = MODELS_DIR / "mission_success_model.pkl"
ROCKET_MODEL_PATH = MODELS_DIR / "rocket_reliability_model.pkl"
METADATA_PATH = MODELS_DIR / "model_metadata.json"

MODEL_VERSION = "astravault-ml-1.0.0"

NUMERIC_FEATURES = [
    "rocket_reliability",
    "organization_experience",
    "launch_vehicle_history",
    "payload_mass_kg",
    "previous_failures",
    "launch_site_history",
    "crewed",
    "total_launches",
    "successful_launches",
    "failed_launches",
    "partial_failures",
]

CATEGORICAL_FEATURES = [
    "orbit_type",
    "mission_type",
    "destination",
    "budget_level",
    "reliability_priority",
]

FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES


def load_training_data() -> pd.DataFrame:
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Training data not found: {DATA_PATH}")

    data = pd.read_csv(DATA_PATH)
    data["rocket_reliability"] = (
        (data["successful_launches"] + data["partial_failures"] * 0.45)
        / data["total_launches"].replace(0, np.nan)
    ).fillna(data["launch_vehicle_history"].clip(0, 1))
    data["launch_site_history"] = data["launch_site_success_rate"].clip(0, 1)
    data["success_label"] = data["status"].map(lambda value: 1 if value == "SUCCESS" else 0)
    return data


def mission_pipeline(use_xgboost: bool = False) -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            ("numeric", StandardScaler(), NUMERIC_FEATURES),
            ("categorical", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
        ]
    )

    if use_xgboost:
        from xgboost import XGBClassifier

        classifier = XGBClassifier(
            n_estimators=120,
            max_depth=4,
            learning_rate=0.08,
            subsample=0.9,
            colsample_bytree=0.9,
            eval_metric="logloss",
            random_state=42,
        )
    else:
        classifier = RandomForestClassifier(
            n_estimators=240,
            max_depth=7,
            min_samples_leaf=1,
            class_weight="balanced",
            random_state=42,
        )

    return Pipeline([("preprocess", preprocessor), ("model", classifier)])


def rocket_reliability_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "numeric",
                StandardScaler(),
                [
                    "total_launches",
                    "successful_launches",
                    "failed_launches",
                    "partial_failures",
                    "organization_experience",
                    "launch_vehicle_history",
                ],
            ),
            ("categorical", OneHotEncoder(handle_unknown="ignore"), ["rocket_name"]),
        ]
    )
    return Pipeline(
        [
            ("preprocess", preprocessor),
            ("model", RandomForestRegressor(n_estimators=160, max_depth=6, random_state=42)),
        ]
    )


def train() -> dict[str, Any]:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    data = load_training_data()

    x = data[FEATURES]
    y = data["success_label"]
    stratify = y if y.nunique() > 1 and y.value_counts().min() > 1 else None
    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.25,
        random_state=42,
        stratify=stratify,
    )

    use_xgboost = os.getenv("USE_XGBOOST") == "1"
    mission_model = mission_pipeline(use_xgboost=use_xgboost)
    mission_model.fit(x_train, y_train)
    y_pred = mission_model.predict(x_test)

    metrics = {
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "precision": round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
        "f1Score": round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
    }

    rocket_features = data[
        [
            "rocket_name",
            "total_launches",
            "successful_launches",
            "failed_launches",
            "partial_failures",
            "organization_experience",
            "launch_vehicle_history",
        ]
    ]
    rocket_target = data["rocket_reliability"].clip(0, 1)
    rocket_model = rocket_reliability_pipeline()
    rocket_model.fit(rocket_features, rocket_target)

    mission_artifact = {
        "modelName": "mission_success_model",
        "modelVersion": MODEL_VERSION,
        "trainedAt": datetime.now(UTC).isoformat(),
        "features": FEATURES,
        "numericFeatures": NUMERIC_FEATURES,
        "categoricalFeatures": CATEGORICAL_FEATURES,
        "algorithm": "XGBoostClassifier" if use_xgboost else "RandomForestClassifier",
        "pipeline": mission_model,
        "metrics": metrics,
    }
    rocket_artifact = {
        "modelName": "rocket_reliability_model",
        "modelVersion": MODEL_VERSION,
        "trainedAt": datetime.now(UTC).isoformat(),
        "algorithm": "RandomForestRegressor",
        "pipeline": rocket_model,
        "features": [
            "rocket_name",
            "total_launches",
            "successful_launches",
            "failed_launches",
            "partial_failures",
            "organization_experience",
            "launch_vehicle_history",
        ],
    }

    joblib.dump(mission_artifact, MISSION_MODEL_PATH)
    joblib.dump(rocket_artifact, ROCKET_MODEL_PATH)

    metadata = {
        "modelVersion": MODEL_VERSION,
        "trainedAt": datetime.now(UTC).isoformat(),
        "trainingSamples": int(len(data)),
        "missionSuccess": {
            **metrics,
            "features": FEATURES,
            "algorithm": mission_artifact["algorithm"],
            "artifact": str(MISSION_MODEL_PATH),
        },
        "rocketReliability": {
            "artifact": str(ROCKET_MODEL_PATH),
            "algorithm": rocket_artifact["algorithm"],
        },
    }
    METADATA_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    print("AstraVault ML training complete")
    print(json.dumps(metadata, indent=2))
    return metadata


if __name__ == "__main__":
    train()
