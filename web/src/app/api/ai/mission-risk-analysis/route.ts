import { Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { requireApiRole } from "@/lib/api-rbac";
import { analyzeMissionRisk } from "@/lib/ml-service";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(Role.VIEWER);
  if (!auth.ok) return auth.response;

  const input = await request.json();
  const analysis = await analyzeMissionRisk(input);
  if (analysis.error || !analysis.data) {
    return Response.json({ error: analysis.error ?? "ML service unavailable" }, { status: 503 });
  }

  const missionId = typeof input.missionId === "string" ? input.missionId : undefined;
  const mission = missionId ? await prisma.mission.findUnique({ where: { id: missionId }, select: { id: true } }) : null;
  const saved = await prisma.missionPrediction.create({
    data: {
      missionId: mission?.id,
      successProbability: analysis.data.successProbability,
      riskLevel: analysis.data.riskLevel,
      confidenceScore: analysis.data.confidenceScore,
      riskFactors: analysis.data.riskFactors,
      explanation: analysis.data.explanation,
      modelVersion: "astravault-ml-1.0.0"
    }
  });

  return Response.json({ data: analysis.data, persistedId: saved.id });
}
