import { Role } from "@prisma/client";
import { getAnalyticsData } from "@/lib/analytics";
import { requireApiRole } from "@/lib/api-rbac";

export async function GET() {
  const auth = await requireApiRole(Role.VIEWER);
  if (!auth.ok) return auth.response;
  const analytics = await getAnalyticsData();
  return Response.json({ data: analytics });
}
