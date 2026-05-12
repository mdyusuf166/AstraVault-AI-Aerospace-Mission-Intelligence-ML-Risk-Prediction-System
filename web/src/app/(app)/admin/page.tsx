import { Role } from "@prisma/client";
import { DatabaseZap, FilePlus2, ShieldCheck, Trash2 } from "lucide-react";
import {
  createAgencyAction,
  createCompanyAction,
  createLaunchSiteAction,
  createMissionAction,
  createPayloadAction,
  createRocketAction,
  deleteMissionAction,
  updateMissionStatusAction
} from "@/app/(app)/admin/actions";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";

const statuses = ["PLANNED", "ACTIVE", "SUCCESS", "FAILURE", "PARTIAL"];
const payloadTypes = ["SATELLITE", "PROBE", "CARGO", "CREW_MODULE", "SCIENTIFIC_PACKAGE", "TECHNOLOGY_DEMONSTRATOR"];

export default async function AdminPage() {
  await requireRole(Role.ADMIN);
  const [missions, agencies, companies, launchVehicles, launchSites, orbits, auditLogs] = await Promise.all([
    prisma.mission.findMany({
      include: {
        agency: true,
        company: true,
        launchVehicle: { include: { rocket: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 12
    }),
    prisma.agency.findMany({ orderBy: { name: "asc" } }),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
    prisma.launchVehicle.findMany({ include: { rocket: true }, orderBy: { name: "asc" } }),
    prisma.launchSite.findMany({ orderBy: { name: "asc" } }),
    prisma.orbit.findMany({ orderBy: { name: "asc" } }),
    prisma.auditLog.findMany({
      include: { actor: true },
      orderBy: { createdAt: "desc" },
      take: 10
    })
  ]);

  return (
    <>
      <PageHeader
        title="Admin CRUD Panel"
        description="Create and edit mission-critical entities with audit logging for every privileged data mutation."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Admin Scope" value="Full" detail="Mission and reference data writes" icon={ShieldCheck} />
        <StatCard label="Recent Missions" value={missions.length} detail="Latest editable records listed" icon={DatabaseZap} tone="aurora" />
        <StatCard label="Audit Events" value={auditLogs.length} detail="Latest privileged action log entries" icon={FilePlus2} tone="warning" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <SectionCard title="Create Mission" eyebrow="Mission CRUD">
          <form action={createMissionAction} className="grid gap-4 md:grid-cols-2">
            <Field label="Name" name="name" required />
            <Field label="Program" name="program" />
            <Field label="Destination" name="destination" required />
            <Select label="Status" name="status" options={statuses.map((value) => ({ value, label: value }))} />
            <Field label="Launch Date" name="launchDate" type="datetime-local" />
            <Field label="Cost USD Millions" name="costUsdMillions" type="number" />
            <Select label="Agency" name="agencyId" options={agencies.map((agency) => ({ value: agency.id, label: agency.acronym ?? agency.name }))} optional />
            <Select label="Company" name="companyId" options={companies.map((company) => ({ value: company.id, label: company.name }))} optional />
            <Select
              label="Launch Vehicle"
              name="launchVehicleId"
              options={launchVehicles.map((vehicle) => ({ value: vehicle.id, label: `${vehicle.rocket.name} ${vehicle.variant ?? vehicle.name}` }))}
            />
            <Select label="Launch Site" name="launchSiteId" options={launchSites.map((site) => ({ value: site.id, label: site.code ?? site.name }))} />
            <Select label="Orbit" name="orbitId" options={orbits.map((orbit) => ({ value: orbit.id, label: orbit.name }))} optional />
            <div className="md:col-span-2">
              <label className="label" htmlFor="description">
                Description
              </label>
              <textarea id="description" name="description" rows={4} className="field mt-2 h-auto w-full py-3" />
            </div>
            <div className="md:col-span-2">
              <label className="label" htmlFor="objective">
                Objective
              </label>
              <textarea id="objective" name="objective" rows={3} className="field mt-2 h-auto w-full py-3" />
            </div>
            <button type="submit" className="rounded-md bg-telemetry px-4 py-2 text-sm font-semibold text-slate-950 md:col-span-2">
              Create Mission
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Create Reference Data" eyebrow="Rocket, Agency, Site, Payload">
          <div className="space-y-5">
            <form action={createRocketAction} className="rounded-lg border border-line bg-white/[0.03] p-4">
              <h3 className="mb-4 font-medium text-white">Rocket Family</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name" name="name" required />
                <Field label="Manufacturer" name="manufacturer" required />
                <Field label="Country" name="country" required />
                <Field label="First Flight" name="firstFlightYear" type="number" />
                <Field label="LEO Payload KG" name="payloadLeoKg" type="number" />
                <Field label="GTO Payload KG" name="payloadGtoKg" type="number" />
                <Select label="Company" name="companyId" options={companies.map((company) => ({ value: company.id, label: company.name }))} optional />
                <label className="flex items-end gap-2 pb-2 text-sm text-slate-300">
                  <input name="reusable" type="checkbox" className="h-4 w-4 rounded border-line bg-panel" />
                  Reusable
                </label>
              </div>
              <button type="submit" className="mt-4 rounded-md border border-telemetry/40 px-4 py-2 text-sm font-semibold text-telemetry">
                Add Rocket
              </button>
            </form>

            <form action={createAgencyAction} className="rounded-lg border border-line bg-white/[0.03] p-4">
              <h3 className="mb-4 font-medium text-white">Agency</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name" name="name" required />
                <Field label="Acronym" name="acronym" />
                <Field label="Country" name="country" required />
                <Field label="Founded" name="foundedYear" type="number" />
              </div>
              <button type="submit" className="mt-4 rounded-md border border-aurora/40 px-4 py-2 text-sm font-semibold text-aurora">
                Add Agency
              </button>
            </form>

            <form action={createCompanyAction} className="rounded-lg border border-line bg-white/[0.03] p-4">
              <h3 className="mb-4 font-medium text-white">Company</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name" name="name" required />
                <Field label="Ticker" name="ticker" />
                <Field label="Country" name="country" required />
                <Field label="Founded" name="foundedYear" type="number" />
              </div>
              <button type="submit" className="mt-4 rounded-md border border-warning/40 px-4 py-2 text-sm font-semibold text-warning">
                Add Company
              </button>
            </form>

            <form action={createLaunchSiteAction} className="rounded-lg border border-line bg-white/[0.03] p-4">
              <h3 className="mb-4 font-medium text-white">Launch Site</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name" name="name" required />
                <Field label="Code" name="code" />
                <Field label="Country" name="country" required />
                <Field label="Region" name="region" />
                <Field label="Latitude" name="latitude" type="number" step="0.0001" required />
                <Field label="Longitude" name="longitude" type="number" step="0.0001" required />
                <Select label="Agency" name="agencyId" options={agencies.map((agency) => ({ value: agency.id, label: agency.acronym ?? agency.name }))} optional />
              </div>
              <button type="submit" className="mt-4 rounded-md border border-telemetry/40 px-4 py-2 text-sm font-semibold text-telemetry">
                Add Launch Site
              </button>
            </form>

            <form action={createPayloadAction} className="rounded-lg border border-line bg-white/[0.03] p-4">
              <h3 className="mb-4 font-medium text-white">Payload</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name" name="name" required />
                <Select label="Type" name="type" options={payloadTypes.map((value) => ({ value, label: value }))} />
                <Field label="Mass KG" name="massKg" type="number" step="0.01" />
                <Field label="Customer" name="customer" />
                <Select label="Mission" name="missionId" options={missions.map((mission) => ({ value: mission.id, label: mission.name }))} />
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="purpose">
                    Purpose
                  </label>
                  <textarea id="purpose" name="purpose" rows={3} className="field mt-2 h-auto w-full py-3" />
                </div>
              </div>
              <button type="submit" className="mt-4 rounded-md border border-aurora/40 px-4 py-2 text-sm font-semibold text-aurora">
                Add Payload
              </button>
            </form>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <SectionCard title="Edit Mission Status" eyebrow="Update And Delete">
          <div className="space-y-3">
            {missions.map((mission) => (
              <div key={mission.id} className="rounded-lg border border-line bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{mission.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{mission.launchVehicle.rocket.name}</p>
                  </div>
                  <StatusBadge status={mission.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={updateMissionStatusAction} className="flex gap-2">
                    <input type="hidden" name="id" value={mission.id} />
                    <select name="status" defaultValue={mission.status} className="field h-9">
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="rounded-md border border-telemetry/40 px-3 py-2 text-sm text-telemetry">
                      Update
                    </button>
                  </form>
                  <form action={deleteMissionAction}>
                    <input type="hidden" name="id" value={mission.id} />
                    <button type="submit" className="flex items-center gap-2 rounded-md border border-danger/40 px-3 py-2 text-sm text-danger">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Audit Log" eyebrow="Admin Actions">
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="rounded-lg border border-line bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">
                    {log.action} {log.entity}
                  </p>
                  <span className="text-xs text-slate-500">{formatDate(log.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">{log.actor?.email ?? "System"}</p>
                <p className="mt-1 text-xs text-slate-500">{log.entityId ?? "No entity id"}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  step
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} type={type} step={step} required={required} className="field mt-2 w-full" />
    </div>
  );
}

function Select({
  label,
  name,
  options,
  optional
}: {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  optional?: boolean;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <select id={name} name={name} required={!optional} className="field mt-2 w-full">
        {optional ? <option value="">None</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
