import { Role } from "@prisma/client";
import { requireApiRole } from "@/lib/api-rbac";
import { getRocketReliability } from "@/lib/ml-api";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  {
    params
  }: {
    params: Promise<{ rocketId: string }>;
  }
) {
  const auth = await requireApiRole(Role.VIEWER);
  if (!auth.ok) return auth.response;

  const { rocketId } = await params;
  const rocketRecord = await prisma.rocket.findUnique({ where: { id: rocketId }, select: { id: true, name: true } });
  const reliability = await getRocketReliability({ rocketName: rocketRecord?.name ?? rocketId });
  if (reliability.error || !reliability.data) {
    return Response.json({ error: reliability.error ?? "ML service unavailable" }, { status: 503 });
  }

  const saved = rocketRecord
    ? await prisma.rocketReliabilityScore.create({
        data: {
          rocketId: rocketRecord.id,
          rocketName: reliability.data.rocketName,
          reliabilityScore: reliability.data.reliabilityScore,
          maturityScore: reliability.data.rocketMaturityScore,
          totalLaunches: reliability.data.totalLaunches,
          successfulLaunches: reliability.data.successfulLaunches,
          failedLaunches: reliability.data.failedLaunches,
          riskLevel: reliability.data.riskLevel,
          modelVersion: reliability.data.modelVersion
        }
      })
    : null;

  return Response.json({ data: reliability.data, persistedId: saved?.id ?? null });
}
