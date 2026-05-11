import { AuditAction, Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-rbac";
import { writeAuditLog } from "@/lib/audit";
import { payloadSchema } from "@/lib/validations";

function auditJson(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

export async function GET() {
  const auth = await requireApiRole(Role.VIEWER);
  if (!auth.ok) return auth.response;
  const payloads = await prisma.payload.findMany({
    include: { mission: true, satellite: true, instruments: true },
    orderBy: { name: "asc" }
  });
  return Response.json({ data: payloads });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(Role.ADMIN);
  if (!auth.ok) return auth.response;
  const parsed = payloadSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 422 });
  const payload = await prisma.payload.create({ data: parsed.data });
  await writeAuditLog({
    action: AuditAction.CREATE,
    entity: "Payload",
    entityId: payload.id,
    after: auditJson(payload),
    actorId: auth.user.id,
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] ?? null
  });
  return Response.json({ data: payload }, { status: 201 });
}
