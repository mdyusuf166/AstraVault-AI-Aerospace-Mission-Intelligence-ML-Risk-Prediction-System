export type MissionSuccessInput = {
  rocketReliability?: number;
  organizationExperience?: number;
  launchVehicleHistory?: number;
  payloadMassKg?: number;
  orbitType?: string;
  missionType?: string;
  destination?: string;
  previousFailures?: number;
  launchSiteHistory?: number;
  crewed?: boolean;
  totalLaunches?: number;
  successfulLaunches?: number;
  failedLaunches?: number;
  partialFailures?: number;
  budgetLevel?: string;
  reliabilityPriority?: string;
};

export type MissionSuccessPrediction = {
  successProbability: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidenceScore: number;
  topRiskFactors: string[];
  explanation: string;
  modelVersion: string;
};

export type RocketReliabilityInput = {
  rocketName: string;
  totalLaunches?: number;
  successfulLaunches?: number;
  failedLaunches?: number;
  partialFailures?: number;
};

export type RocketReliabilityResult = {
  rocketName: string;
  totalLaunches: number;
  successfulLaunches: number;
  failedLaunches: number;
  partialFailures: number;
  reliabilityPercentage: number;
  reliabilityScore: number;
  experimentalRiskLevel: string;
  riskLevel: string;
  rocketMaturityScore: number;
  modelVersion: string;
};

export type FailurePatternResult = {
  category: string;
  frequency: number;
  percentage: number;
  description: string;
};

export type LaunchRecommendationInput = {
  payloadMassKg: number;
  destination: string;
  orbitType: string;
  missionType: string;
  crewedStatus: boolean;
  budgetLevel: string;
  reliabilityPriority: string;
};

export type LaunchRecommendationResult = {
  recommendedRocket: string;
  reason: string;
  alternativeRockets: Array<{
    rocket: string;
    score: number;
    estimatedRisk: string;
    reason: string;
  }>;
  estimatedRisk: string;
  score: number;
};

export type MissionRiskAnalysisResult = {
  technicalRisk: number;
  operationalRisk: number;
  payloadRisk: number;
  launchVehicleRisk: number;
  orbitalRisk: number;
  organizationExperienceRisk: number;
  finalMissionReadinessScore: number;
  riskLevel: string;
  successProbability: number;
  confidenceScore: number;
  riskFactors: string[];
  explanation: string;
};

export type ModelInfo = {
  modelVersion: string;
  trainedAt: string;
  trainingSamples: number;
  missionSuccess: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    features: string[];
    algorithm: string;
    artifact: string;
  };
  rocketReliability: {
    artifact: string;
    algorithm: string;
  };
};

export type MlApiResult<T> = {
  data: T | null;
  error: string | null;
};

const DEFAULT_URL = "http://localhost:8000";

function baseUrl() {
  return (process.env.ML_SERVICE_URL ?? process.env.NEXT_PUBLIC_ML_API_URL ?? DEFAULT_URL).replace(/\/$/, "");
}

async function request<T>(path: string, init?: RequestInit): Promise<MlApiResult<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(`${baseUrl()}${path}`, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "content-type": "application/json",
        ...init?.headers
      }
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      return { data: null, error: body?.detail ?? `ML service returned HTTP ${response.status}` };
    }
    return { data: body as T, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "ML service unavailable" };
  } finally {
    clearTimeout(timeout);
  }
}

export function predictMissionSuccess(input: MissionSuccessInput) {
  return request<MissionSuccessPrediction>("/predict-mission-success", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function getRocketReliability(input: RocketReliabilityInput) {
  return request<RocketReliabilityResult>("/rocket-reliability", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function getFailurePatterns() {
  return request<{ patterns: FailurePatternResult[] }>("/failure-patterns");
}

export function recommendLaunchVehicle(input: LaunchRecommendationInput) {
  return request<LaunchRecommendationResult>("/recommend-launch-vehicle", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function analyzeMissionRisk(input: MissionSuccessInput) {
  return request<MissionRiskAnalysisResult>("/mission-risk-analysis", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function getModelInfo() {
  return request<ModelInfo>("/model-info");
}

export function trainModels() {
  return request<ModelInfo>("/train", { method: "POST" });
}
