from __future__ import annotations

from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from predict import (
    failure_patterns,
    load_metadata,
    mission_risk_analysis,
    predict_mission_success,
    recommend_launch_vehicle,
    rocket_reliability,
)
from train import train

app = FastAPI(
    title="AstraVault Aerospace ML Service",
    version="1.0.0",
    description="Mission success prediction, rocket reliability, failure analytics, launch vehicle recommendation, and AI mission risk analysis.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MissionSuccessRequest(BaseModel):
    rocketReliability: float = Field(default=0.82, ge=0, le=1)
    organizationExperience: float = Field(default=0.75, ge=0, le=1)
    launchVehicleHistory: float = Field(default=0.8, ge=0, le=1)
    payloadMassKg: float = Field(default=1000, ge=0)
    orbitType: str = "LEO"
    missionType: str = "SATELLITE_DEPLOYMENT"
    destination: str = "Low Earth Orbit"
    previousFailures: int = Field(default=0, ge=0)
    launchSiteHistory: float = Field(default=0.82, ge=0, le=1)
    crewed: bool = False
    totalLaunches: int = Field(default=20, ge=0)
    successfulLaunches: int = Field(default=18, ge=0)
    failedLaunches: int = Field(default=1, ge=0)
    partialFailures: int = Field(default=1, ge=0)
    budgetLevel: str = "MEDIUM"
    reliabilityPriority: str = "HIGH"


class RocketReliabilityRequest(BaseModel):
    rocketName: str = "Falcon 9"
    totalLaunches: int | None = None
    successfulLaunches: int | None = None
    failedLaunches: int | None = None
    partialFailures: int | None = None


class LaunchRecommendationRequest(BaseModel):
    payloadMassKg: float = Field(default=1000, ge=0)
    destination: str = "Low Earth Orbit"
    orbitType: str = "LEO"
    missionType: str = "SATELLITE_DEPLOYMENT"
    crewedStatus: bool = False
    budgetLevel: str = "MEDIUM"
    reliabilityPriority: str = "HIGH"


@app.get("/")
def root() -> dict[str, Any]:
    metadata = load_metadata()
    return {
        "service": "AstraVault ML Service",
        "status": "healthy",
        "modelVersion": metadata["modelVersion"],
        "trainedAt": metadata["trainedAt"],
    }


@app.post("/predict-mission-success")
def predict_endpoint(payload: MissionSuccessRequest) -> dict[str, Any]:
    return predict_mission_success(payload.model_dump())


@app.post("/rocket-reliability")
def rocket_reliability_endpoint(payload: RocketReliabilityRequest) -> dict[str, Any]:
    return rocket_reliability(payload.model_dump())


@app.get("/failure-patterns")
def failure_patterns_endpoint() -> dict[str, Any]:
    return failure_patterns()


@app.post("/recommend-launch-vehicle")
def recommend_endpoint(payload: LaunchRecommendationRequest) -> dict[str, Any]:
    return recommend_launch_vehicle(payload.model_dump())


@app.post("/mission-risk-analysis")
def mission_risk_endpoint(payload: MissionSuccessRequest) -> dict[str, Any]:
    return mission_risk_analysis(payload.model_dump())


@app.post("/train")
def train_endpoint() -> dict[str, Any]:
    return train()


@app.get("/model-info")
def model_info_endpoint() -> dict[str, Any]:
    return load_metadata()
