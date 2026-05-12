import { Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { requireApiRole } from "@/lib/api-rbac";
import { predictMissionSuccess } from "@/lib/ml-service";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(Role.VIEWER);
  if (!auth.ok) return auth.response;

  const input = await request.json();
  const prediction = await predictMissionSuccess(input);
  if (prediction.error || !prediction.data) {
    return Response.json({ error: prediction.error ?? "ML service unavailable" }, { status: 503 });
  }

  const missionId = typeof input.missionId === "string" ? input.missionId : undefined;
  const mission = missionId ? await prisma.mission.findUnique({ where: { id: missionId }, select: { id: true } }) : null;
  const saved = await prisma.missionPrediction.create({
    data: {
      missionId: mission?.id,
      successProbability: prediction.data.successProbability,
      riskLevel: prediction.data.riskLevel,
      confidenceScore: prediction.data.confidenceScore,
      riskFactors: prediction.data.topRiskFactors,
      explanation: prediction.data.explanation,
      modelVersion: prediction.data.modelVersion
    }
  });

  return Response.json({ data: prediction.data, persistedId: saved.id });
}
