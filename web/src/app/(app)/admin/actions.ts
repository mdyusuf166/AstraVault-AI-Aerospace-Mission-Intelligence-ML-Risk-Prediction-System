"use server";

import { AuditAction, Role } from "@prisma/client";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";
import { agencySchema, companySchema, launchSiteSchema, missionSchema, payloadSchema, rocketSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

function formToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

async function requestIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? null;
}

async function uniqueMissionSlug(name: string) {
  const base = slugify(name);
  const existing = await prisma.mission.findUnique({ where: { slug: base } });
  return existing ? `${base}-${Date.now().toString(36)}` : base;
}

function toAuditJson(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

export async function createMissionAction(formData: FormData) {
  const user = await requireRole(Role.ADMIN);
  const parsed = missionSchema.parse(formToObject(formData));
  const mission = await prisma.mission.create({
    data: {
      ...parsed,
      slug: await uniqueMissionSlug(parsed.name)
    }
  });
  await writeAuditLog({
    action: AuditAction.CREATE,
    entity: "Mission",
    entityId: mission.id,
    after: toAuditJson(mission),
    actorId: user.id,
    ipAddress: await requestIp()
  });
  revalidatePath("/admin");
  revalidatePath("/missions");
}

export async function updateMissionStatusAction(formData: FormData) {
  const user = await requireRole(Role.ADMIN);
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const before = await prisma.mission.findUniqueOrThrow({ where: { id } });
  const mission = await prisma.mission.update({
    where: { id },
    data: {
      status: status as typeof before.status
    }
  });
  await writeAuditLog({
    action: AuditAction.UPDATE,
    entity: "Mission",
    entityId: mission.id,
    before: toAuditJson(before),
    after: toAuditJson(mission),
    actorId: user.id,
    ipAddress: await requestIp()
  });
  revalidatePath("/admin");
  revalidatePath("/missions");
}

export async function deleteMissionAction(formData: FormData) {
  const user = await requireRole(Role.ADMIN);
  const id = String(formData.get("id"));
  const before = await prisma.mission.findUniqueOrThrow({ where: { id } });
  await prisma.mission.delete({ where: { id } });
  await writeAuditLog({
    action: AuditAction.DELETE,
    entity: "Mission",
    entityId: id,
    before: toAuditJson(before),
    actorId: user.id,
    ipAddress: await requestIp()
  });
  revalidatePath("/admin");
  revalidatePath("/missions");
}

export async function createRocketAction(formData: FormData) {
  const user = await requireRole(Role.ADMIN);
  const parsed = rocketSchema.parse(formToObject(formData));
  const rocket = await prisma.rocket.create({ data: parsed });
  await writeAuditLog({
    action: AuditAction.CREATE,
    entity: "Rocket",
    entityId: rocket.id,
    after: toAuditJson(rocket),
    actorId: user.id,
    ipAddress: await requestIp()
  });
  revalidatePath("/admin");
  revalidatePath("/rockets");
}

export async function createAgencyAction(formData: FormData) {
  const user = await requireRole(Role.ADMIN);
  const parsed = agencySchema.parse(formToObject(formData));
  const agency = await prisma.agency.create({ data: parsed });
  await writeAuditLog({
    action: AuditAction.CREATE,
    entity: "Agency",
    entityId: agency.id,
    after: toAuditJson(agency),
    actorId: user.id,
    ipAddress: await requestIp()
  });
  revalidatePath("/admin");
  revalidatePath("/agencies");
}

export async function createCompanyAction(formData: FormData) {
  const user = await requireRole(Role.ADMIN);
  const parsed = companySchema.parse(formToObject(formData));
  const company = await prisma.company.create({ data: parsed });
  await writeAuditLog({
    action: AuditAction.CREATE,
    entity: "Company",
    entityId: company.id,
    after: toAuditJson(company),
    actorId: user.id,
    ipAddress: await requestIp()
  });
  revalidatePath("/admin");
  revalidatePath("/agencies");
}

export async function createLaunchSiteAction(formData: FormData) {
  const user = await requireRole(Role.ADMIN);
  const parsed = launchSiteSchema.parse(formToObject(formData));
  const launchSite = await prisma.launchSite.create({ data: parsed });
  await writeAuditLog({
    action: AuditAction.CREATE,
    entity: "LaunchSite",
    entityId: launchSite.id,
    after: toAuditJson(launchSite),
    actorId: user.id,
    ipAddress: await requestIp()
  });
  revalidatePath("/admin");
  revalidatePath("/launch-sites");
}

export async function createPayloadAction(formData: FormData) {
  const user = await requireRole(Role.ADMIN);
  const parsed = payloadSchema.parse(formToObject(formData));
  const payload = await prisma.payload.create({ data: parsed });
  await writeAuditLog({
    action: AuditAction.CREATE,
    entity: "Payload",
    entityId: payload.id,
    after: toAuditJson(payload),
    actorId: user.id,
    ipAddress: await requestIp()
  });
  revalidatePath("/admin");
  revalidatePath("/payloads");
  revalidatePath("/missions");
}
