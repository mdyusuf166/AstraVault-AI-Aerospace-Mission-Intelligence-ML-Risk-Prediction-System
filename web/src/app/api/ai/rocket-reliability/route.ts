import { Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { requireApiRole } from "@/lib/api-rbac";
import { getRocketReliability } from "@/lib/ml-api";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(Role.VIEWER);
  if (!auth.ok) return auth.response;

  const input = await request.json();
  const reliability = await getRocketReliability(input);
  if (reliability.error || !reliability.data) {
    return Response.json({ error: reliability.error ?? "ML service unavailable" }, { status: 503 });
  }

  const rocket = input.rocketId ? await prisma.rocket.findUnique({ where: { id: input.rocketId }, select: { id: true } }) : null;
  const saved = await prisma.rocketReliabilityScore.create({
    data: {
      rocketId: rocket?.id,
      rocketName: reliability.data.rocketName,
      reliabilityScore: reliability.data.reliabilityScore,
      maturityScore: reliability.data.rocketMaturityScore,
      totalLaunches: reliability.data.totalLaunches,
      successfulLaunches: reliability.data.successfulLaunches,
      failedLaunches: reliability.data.failedLaunches,
      riskLevel: reliability.data.riskLevel,
      modelVersion: reliability.data.modelVersion
    }
  });

  return Response.json({ data: reliability.data, persistedId: saved.id });
}
