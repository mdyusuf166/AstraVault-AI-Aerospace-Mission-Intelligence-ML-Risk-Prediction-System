import { Role } from "@prisma/client";
import { requireApiRole } from "@/lib/api-rbac";
import { getModelInfo } from "@/lib/ml-api";

export async function GET() {
  const auth = await requireApiRole(Role.VIEWER);
  if (!auth.ok) return auth.response;

  const result = await getModelInfo();
  if (result.error || !result.data) {
    return Response.json({ error: result.error ?? "ML service unavailable" }, { status: 503 });
  }
  return Response.json({ data: result.data });
}
