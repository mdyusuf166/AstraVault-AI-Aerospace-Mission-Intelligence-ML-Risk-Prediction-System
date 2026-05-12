import { Role } from "@prisma/client";
import { requireApiRole } from "@/lib/api-rbac";
import { getFailurePatterns } from "@/lib/ml-service";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireApiRole(Role.VIEWER);
  if (!auth.ok) return auth.response;

  const patterns = await getFailurePatterns();
  if (patterns.error || !patterns.data) {
    return Response.json({ error: patterns.error ?? "ML service unavailable" }, { status: 503 });
  }

  const saved = await Promise.all(
    patterns.data.patterns.slice(0, 10).map((pattern) =>
      prisma.failurePattern.create({
        data: {
          category: pattern.category,
          frequency: pattern.frequency,
          percentage: pattern.percentage,
          description: pattern.description
        }
      })
    )
  );

  return Response.json({ data: patterns.data, persistedCount: saved.length });
}
