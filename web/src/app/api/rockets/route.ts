import { AuditAction, Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-rbac";
import { writeAuditLog } from "@/lib/audit";
import { rocketSchema } from "@/lib/validations";

function auditJson(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

export async function GET() {
  const auth = await requireApiRole(Role.VIEWER);
  if (!auth.ok) return auth.response;
  const rockets = await prisma.rocket.findMany({
    include: { company: true, launchVehicles: { include: { missions: true } } },
    orderBy: { name: "asc" }
  });
  return Response.json({ data: rockets });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(Role.ADMIN);
  if (!auth.ok) return auth.response;
  const parsed = rocketSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid rocket payload", issues: parsed.error.flatten() }, { status: 422 });
  const rocket = await prisma.rocket.create({ data: parsed.data });
  await writeAuditLog({
    action: AuditAction.CREATE,
    entity: "Rocket",
    entityId: rocket.id,
    after: auditJson(rocket),
    actorId: auth.user.id,
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] ?? null
  });
  return Response.json({ data: rocket }, { status: 201 });
}
