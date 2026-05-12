import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, CalendarDays, Cpu, Gauge, MapPin, Package, Rocket, Users } from "lucide-react";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getMissionBySlug } from "@/lib/queries";
import { asPercent, formatDate, formatNumber } from "@/lib/utils";

export default async function MissionDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mission = await getMissionBySlug(slug);
  if (!mission) notFound();

  return (
    <>
      <div className="mb-6 command-card overflow-hidden">
        <div className="border-b border-line bg-white/[0.03] p-5">
          <Link href="/missions" className="text-sm text-telemetry">
            Back to missions
          </Link>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold text-white">{mission.name}</h1>
                <StatusBadge status={mission.status} />
              </div>
              <p className="max-w-4xl text-sm leading-6 text-slate-300">{mission.description ?? mission.objective ?? "No mission narrative available."}</p>
            </div>
            <div className="rounded-lg border border-line bg-panel-soft p-4 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Destination</p>
              <p className="mt-2 text-lg font-semibold text-white">{mission.destination}</p>
            </div>
          </div>
        </div>
        <div className="grid gap-px bg-line md:grid-cols-4">
          <div className="bg-panel/95 p-4">
            <p className="label">Launch Date</p>
            <p className="mt-2 text-white">{formatDate(mission.launchDate)}</p>
          </div>
          <div className="bg-panel/95 p-4">
            <p className="label">Launch Site</p>
            <p className="mt-2 text-white">{mission.launchSite.name}</p>
          </div>
          <div className="bg-panel/95 p-4">
            <p className="label">Vehicle</p>
            <p className="mt-2 text-white">{mission.launchVehicle.rocket.name}</p>
          </div>
          <div className="bg-panel/95 p-4">
            <p className="label">Orbit</p>
            <p className="mt-2 text-white">{mission.orbit?.name ?? "Trajectory specific"}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Crew" value={mission.crew.length} detail="Astronaut assignments" icon={Users} />
        <StatCard label="Payloads" value={mission.payloads.length} detail="Manifested mission cargo" icon={Package} tone="aurora" />
        <StatCard label="Events" value={mission.events.length} detail="Timeline records" icon={Activity} tone="telemetry" />
        <StatCard label="Cost" value={mission.costUsdMillions ? `$${formatNumber(mission.costUsdMillions)}M` : "-"} detail="Estimated public/program cost" icon={Gauge} tone="warning" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <SectionCard title="Mission Profile" eyebrow="Overview">
          <div className="grid gap-4 md:grid-cols-2">
            <InfoRow label="Agency" value={mission.agency?.name ?? "None"} icon={<MapPin className="h-4 w-4" />} />
            <InfoRow label="Company" value={mission.company?.name ?? "None"} icon={<Rocket className="h-4 w-4" />} />
            <InfoRow label="Program" value={mission.program ?? "Unassigned"} icon={<CalendarDays className="h-4 w-4" />} />
            <InfoRow label="Objective" value={mission.objective ?? "No objective recorded"} icon={<Cpu className="h-4 w-4" />} />
          </div>
        </SectionCard>

        <SectionCard title="Telemetry Summary" eyebrow="Signal Health">
          {mission.telemetry ? (
            <div className="grid gap-3 text-sm">
              <Metric label="Max Altitude" value={`${formatNumber(mission.telemetry.maxAltitudeKm)} km`} />
              <Metric label="Max Velocity" value={`${formatNumber(mission.telemetry.maxVelocityKps)} km/s`} />
              <Metric label="Downlink" value={`${formatNumber(mission.telemetry.downlinkGb)} GB`} />
              <Metric label="Signal Availability" value={asPercent(mission.telemetry.signalAvailability)} />
              <Metric label="Thermal" value={mission.telemetry.thermalStatus ?? "-"} />
              <Metric label="Power" value={mission.telemetry.powerStatus ?? "-"} />
            </div>
          ) : (
            <p className="text-sm text-slate-400">No telemetry summary has been attached to this mission.</p>
          )}
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard title="Crew Manifest" eyebrow="Astronaut Database">
          <div className="space-y-3">
            {mission.crew.length ? (
              mission.crew.map((crew) => (
                <div key={crew.id} className="rounded-lg border border-line bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{crew.astronaut.name}</p>
                    <span className="rounded-full border border-line px-2 py-1 text-xs text-slate-400">{crew.role}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{crew.astronaut.nationality}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No crew records for this mission.</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Payload Manifest" eyebrow="Satellites And Instruments">
          <div className="space-y-3">
            {mission.payloads.map((payload) => (
              <div key={payload.id} className="rounded-lg border border-line bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-white">{payload.name}</p>
                  <span className="rounded-full border border-line px-2 py-1 text-xs text-slate-400">{payload.type}</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">{payload.purpose ?? payload.customer ?? "No payload purpose recorded."}</p>
                {payload.satellite ? <p className="mt-2 text-xs text-aurora">Satellite: {payload.satellite.name}</p> : null}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Mission Timeline" eyebrow="Events">
          <div className="space-y-3">
            {mission.events.map((event) => (
              <div key={event.id} className="rounded-lg border border-line bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium text-white">{event.title}</p>
                  <span className="text-xs text-slate-500">{formatDate(event.occurredAt)}</span>
                </div>
                <p className="mt-1 text-xs text-telemetry">{event.type}</p>
                {event.summary ? <p className="mt-2 text-sm text-slate-400">{event.summary}</p> : null}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Failure Reports" eyebrow="Anomaly Board">
          {mission.failureReports.length ? (
            <div className="space-y-3">
              {mission.failureReports.map((report) => (
                <div key={report.id} className="rounded-lg border border-danger/25 bg-danger/10 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{report.phase}</p>
                    <span className="text-xs text-danger">Severity {report.severity}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{report.rootCause}</p>
                  <p className="mt-2 text-xs text-slate-400">{report.impact}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No failure report is associated with this mission.</p>
          )}
        </SectionCard>
      </div>
    </>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-white/[0.03] p-4">
      <div className="mb-2 flex items-center gap-2 text-slate-400">
        {icon}
        <p className="label">{label}</p>
      </div>
      <p className="text-sm text-white">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-line bg-white/[0.03] px-3 py-2">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
