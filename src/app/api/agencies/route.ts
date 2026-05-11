import { AuditAction, Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-rbac";
import { writeAuditLog } from "@/lib/audit";
import { agencySchema } from "@/lib/validations";

function auditJson(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

export async function GET() {
  const auth = await requireApiRole(Role.VIEWER);
  if (!auth.ok) return auth.response;
  const agencies = await prisma.agency.findMany({
    include: { missions: true, astronauts: true, launchSites: true },
    orderBy: { name: "asc" }
  });
  return Response.json({ data: agencies });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(Role.ADMIN);
  if (!auth.ok) return auth.response;
  const parsed = agencySchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid agency payload", issues: parsed.error.flatten() }, { status: 422 });
  const agency = await prisma.agency.create({ data: parsed.data });
  await writeAuditLog({
    action: AuditAction.CREATE,
    entity: "Agency",
    entityId: agency.id,
    after: auditJson(agency),
    actorId: auth.user.id,
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] ?? null
  });
  return Response.json({ data: agency }, { status: 201 });
}
