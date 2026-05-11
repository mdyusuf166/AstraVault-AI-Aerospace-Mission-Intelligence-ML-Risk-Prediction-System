import { AuditAction, Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-rbac";
import { writeAuditLog } from "@/lib/audit";
import { missionSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

function auditJson(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

export async function GET(
  _request: NextRequest,
  {
    params
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const auth = await requireApiRole(Role.VIEWER);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const mission = await prisma.mission.findUnique({
    where: { id },
    include: {
      agency: true,
      company: true,
      launchVehicle: { include: { rocket: true } },
      launchSite: true,
      orbit: true,
      crew: { include: { astronaut: true } },
      payloads: { include: { satellite: true } },
      events: true,
      failureReports: true,
      telemetry: true
    }
  });
  if (!mission) return Response.json({ error: "Mission not found" }, { status: 404 });
  return Response.json({ data: mission });
}

export async function PATCH(
  request: NextRequest,
  {
    params
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const auth = await requireApiRole(Role.ADMIN);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const before = await prisma.mission.findUnique({ where: { id } });
  if (!before) return Response.json({ error: "Mission not found" }, { status: 404 });

  const parsed = missionSchema.partial().safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid mission payload", issues: parsed.error.flatten() }, { status: 422 });
  }

  const mission = await prisma.mission.update({
    where: { id },
    data: {
      ...parsed.data,
      slug: parsed.data.name ? slugify(parsed.data.name) : undefined
    }
  });

  await writeAuditLog({
    action: AuditAction.UPDATE,
    entity: "Mission",
    entityId: mission.id,
    before: auditJson(before),
    after: auditJson(mission),
    actorId: auth.user.id,
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] ?? null
  });

  return Response.json({ data: mission });
}

export async function DELETE(
  request: NextRequest,
  {
    params
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const auth = await requireApiRole(Role.ADMIN);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const before = await prisma.mission.findUnique({ where: { id } });
  if (!before) return Response.json({ error: "Mission not found" }, { status: 404 });
  await prisma.mission.delete({ where: { id } });
  await writeAuditLog({
    action: AuditAction.DELETE,
    entity: "Mission",
    entityId: id,
    before: auditJson(before),
    actorId: auth.user.id,
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] ?? null
  });
  return Response.json({ ok: true });
}
