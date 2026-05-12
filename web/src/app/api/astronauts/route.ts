import { AuditAction, Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-rbac";
import { writeAuditLog } from "@/lib/audit";
import { astronautSchema } from "@/lib/validations";

function auditJson(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

export async function GET() {
  const auth = await requireApiRole(Role.VIEWER);
  if (!auth.ok) return auth.response;
  const astronauts = await prisma.astronaut.findMany({
    include: { agency: true, crew: { include: { mission: true } } },
    orderBy: { name: "asc" }
  });
  return Response.json({ data: astronauts });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(Role.ADMIN);
  if (!auth.ok) return auth.response;
  const parsed = astronautSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid astronaut payload", issues: parsed.error.flatten() }, { status: 422 });
  const astronaut = await prisma.astronaut.create({ data: parsed.data });
  await writeAuditLog({
    action: AuditAction.CREATE,
    entity: "Astronaut",
    entityId: astronaut.id,
    after: auditJson(astronaut),
    actorId: auth.user.id,
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] ?? null
  });
  return Response.json({ data: astronaut }, { status: 201 });
}
