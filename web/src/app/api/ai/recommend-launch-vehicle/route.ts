import { Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { requireApiRole } from "@/lib/api-rbac";
import { recommendLaunchVehicle } from "@/lib/ml-service";

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(Role.VIEWER);
  if (!auth.ok) return auth.response;

  const recommendation = await recommendLaunchVehicle(await request.json());
  if (recommendation.error || !recommendation.data) {
    return Response.json({ error: recommendation.error ?? "ML service unavailable" }, { status: 503 });
  }

  return Response.json({ data: recommendation.data });
}
