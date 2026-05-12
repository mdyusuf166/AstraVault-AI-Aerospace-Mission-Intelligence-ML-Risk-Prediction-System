import { AuditAction, Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-rbac";
import { writeAuditLog } from "@/lib/audit";
import { companySchema } from "@/lib/validations";

function auditJson(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

export async function GET() {
  const auth = await requireApiRole(Role.VIEWER);
  if (!auth.ok) return auth.response;
  const companies = await prisma.company.findMany({
    include: { missions: true, rockets: true },
    orderBy: { name: "asc" }
  });
  return Response.json({ data: companies });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(Role.ADMIN);
  if (!auth.ok) return auth.response;
  const parsed = companySchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid company payload", issues: parsed.error.flatten() }, { status: 422 });
  const company = await prisma.company.create({ data: parsed.data });
  await writeAuditLog({
    action: AuditAction.CREATE,
    entity: "Company",
    entityId: company.id,
    after: auditJson(company),
    actorId: auth.user.id,
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] ?? null
  });
  return Response.json({ data: company }, { status: 201 });
}
