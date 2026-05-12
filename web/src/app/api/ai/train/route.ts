import { Role } from "@prisma/client";
import { requireApiRole } from "@/lib/api-rbac";
import { prisma } from "@/lib/prisma";
import { trainModels } from "@/lib/ml-api";

export async function POST() {
  const auth = await requireApiRole(Role.ADMIN);
  if (!auth.ok) return auth.response;

  const result = await trainModels();
  if (result.error || !result.data) {
    return Response.json({ error: result.error ?? "ML training failed" }, { status: 503 });
  }

  const run = await prisma.mLModelRun.create({
    data: {
      modelName: "mission_success_model",
      modelVersion: result.data.modelVersion,
      accuracy: result.data.missionSuccess.accuracy,
      precision: result.data.missionSuccess.precision,
      recall: result.data.missionSuccess.recall,
      f1Score: result.data.missionSuccess.f1Score,
      trainedAt: new Date(result.data.trainedAt),
      trainingSamples: result.data.trainingSamples
    }
  });

  return Response.json({ data: result.data, persistedId: run.id });
}
