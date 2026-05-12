CREATE TABLE "MissionPrediction" (
    "id" TEXT NOT NULL,
    "missionId" TEXT,
    "successProbability" DOUBLE PRECISION NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "riskFactors" TEXT[],
    "explanation" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MissionPrediction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RocketReliabilityScore" (
    "id" TEXT NOT NULL,
    "rocketId" TEXT,
    "rocketName" TEXT NOT NULL,
    "reliabilityScore" DOUBLE PRECISION NOT NULL,
    "maturityScore" DOUBLE PRECISION NOT NULL,
    "totalLaunches" INTEGER NOT NULL,
    "successfulLaunches" INTEGER NOT NULL,
    "failedLaunches" INTEGER NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RocketReliabilityScore_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FailurePattern" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FailurePattern_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MLModelRun" (
    "id" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "precision" DOUBLE PRECISION,
    "recall" DOUBLE PRECISION,
    "f1Score" DOUBLE PRECISION,
    "trainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trainingSamples" INTEGER NOT NULL,
    CONSTRAINT "MLModelRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MissionPrediction_missionId_idx" ON "MissionPrediction"("missionId");
CREATE INDEX "MissionPrediction_riskLevel_idx" ON "MissionPrediction"("riskLevel");
CREATE INDEX "MissionPrediction_createdAt_idx" ON "MissionPrediction"("createdAt");
CREATE INDEX "RocketReliabilityScore_rocketId_idx" ON "RocketReliabilityScore"("rocketId");
CREATE INDEX "RocketReliabilityScore_rocketName_idx" ON "RocketReliabilityScore"("rocketName");
CREATE INDEX "RocketReliabilityScore_riskLevel_idx" ON "RocketReliabilityScore"("riskLevel");
CREATE INDEX "RocketReliabilityScore_createdAt_idx" ON "RocketReliabilityScore"("createdAt");
CREATE INDEX "FailurePattern_category_idx" ON "FailurePattern"("category");
CREATE INDEX "FailurePattern_frequency_idx" ON "FailurePattern"("frequency");
CREATE INDEX "FailurePattern_createdAt_idx" ON "FailurePattern"("createdAt");
CREATE INDEX "MLModelRun_modelName_modelVersion_idx" ON "MLModelRun"("modelName", "modelVersion");
CREATE INDEX "MLModelRun_trainedAt_idx" ON "MLModelRun"("trainedAt");
