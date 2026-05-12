import { AuditAction, Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-rbac";
import { writeAuditLog } from "@/lib/audit";
import { getMissions } from "@/lib/queries";
import { missionSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

async function uniqueMissionSlug(name: string) {
  const base = slugify(name);
  const existing = await prisma.mission.findUnique({ where: { slug: base } });
  return existing ? `${base}-${Date.now().toString(36)}` : base;
}

function auditJson(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(Role.VIEWER);
  if (!auth.ok) return auth.response;

  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const missions = await getMissions(searchParams);
  return Response.json({ data: missions });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(Role.ADMIN);
  if (!auth.ok) return auth.response;

  const parsed = missionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid mission payload", issues: parsed.error.flatten() }, { status: 422 });
  }

  const mission = await prisma.mission.create({
    data: {
      ...parsed.data,
      slug: await uniqueMissionSlug(parsed.data.name)
    }
  });

  await writeAuditLog({
    action: AuditAction.CREATE,
    entity: "Mission",
    entityId: mission.id,
    after: auditJson(mission),
    actorId: auth.user.id,
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] ?? null
  });

  return Response.json({ data: mission }, { status: 201 });
}
