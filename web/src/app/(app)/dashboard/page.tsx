import Link from "next/link";
import { AlertTriangle, BrainCircuit, Database, Package, RadioTower, Rocket } from "lucide-react";
import { getAnalyticsData } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";
import { getDashboardData } from "@/lib/queries";
import { asPercent, formatDate, formatNumber } from "@/lib/utils";
import { LaunchFrequencyChart, StatusPieChart } from "@/components/charts/analytics-charts";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function DashboardPage() {
  const [dashboard, analytics, latestPrediction] = await Promise.all([
    getDashboardData(),
    getAnalyticsData(),
    prisma.missionPrediction.findFirst({ orderBy: { createdAt: "desc" } })
  ]);
  const successCount = analytics.statusCounts.find((item) => item.status === "SUCCESS")?.count ?? 0;
  const completed = analytics.statusCounts
    .filter((item) => ["SUCCESS", "FAILURE", "PARTIAL"].includes(item.status))
    .reduce((sum, item) => sum + item.count, 0);
  const successRate = completed ? Math.round((successCount / completed) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Mission Command Dashboard"
        description="Operational overview of tracked missions, launch cadence, payload inventory, and latest mission events."
        action={
          <Link href="/missions" className="rounded-md bg-telemetry px-4 py-2 text-sm font-semibold text-slate-950">
            Search Missions
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tracked Missions" value={formatNumber(dashboard.missionCount)} detail={`${successRate}% completed success rate`} icon={Database} />
        <StatCard label="Active/Planned" value={formatNumber(dashboard.activeMissions)} detail="Flights under watch or scheduled" icon={RadioTower} tone="telemetry" />
        <StatCard label="Payload Registry" value={formatNumber(dashboard.payloadCount)} detail="Satellites, cargo, probes, instruments" icon={Package} tone="aurora" />
        <StatCard label="Failure Reports" value={formatNumber(dashboard.failureCount)} detail="Root-cause entries available" icon={AlertTriangle} tone="danger" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <SectionCard title="Launch Frequency" eyebrow="Temporal Analytics">
          <LaunchFrequencyChart data={analytics.launchesByYear} />
        </SectionCard>
        <SectionCard title="Mission Status" eyebrow="Fleet Health">
          <StatusPieChart data={analytics.statusCounts} />
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard
          title="AI Mission Risk"
          eyebrow="Model Prediction"
          action={
            <Link href="/ai" className="rounded-md border border-telemetry/40 px-3 py-2 text-sm font-medium text-telemetry">
              AI Console
            </Link>
          }
        >
          {latestPrediction ? (
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-md border border-telemetry/30 bg-telemetry/10 p-2 text-telemetry">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-white">{latestPrediction.missionId ?? "Scenario prediction"}</p>
                  <p className="text-sm text-slate-400">{latestPrediction.riskLevel} risk</p>
                </div>
              </div>
              <p className="mt-5 text-4xl font-semibold text-white">{asPercent(latestPrediction.successProbability)}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">{latestPrediction.explanation ?? "Prediction stored without explanation."}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-line bg-white/[0.03] p-5 text-sm text-slate-400">
              No AI predictions stored yet. Run a prediction from the AI console.
            </div>
          )}
        </SectionCard>

        <SectionCard title="Upcoming Launches" eyebrow="Flight Queue">
          <div className="space-y-3">
            {dashboard.upcoming.length ? (
              dashboard.upcoming.map((mission) => (
                <Link key={mission.id} href={`/missions/${mission.slug}`} className="block rounded-lg border border-line bg-white/[0.03] p-4 transition hover:border-telemetry/40">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{mission.name}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {mission.launchVehicle.rocket.name} from {mission.launchSite.code ?? mission.launchSite.name}
                      </p>
                    </div>
                    <StatusBadge status={mission.status} />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">{formatDate(mission.launchDate)}</p>
                </Link>
              ))
            ) : (
              <div className="rounded-lg border border-line bg-white/[0.03] p-5 text-sm text-slate-400">
                No future launch dates are currently scheduled in the database.
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Mission Timeline" eyebrow="Recent Events">
          <div className="relative space-y-4 before:absolute before:left-3 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-line">
            {dashboard.latestEvents.map((event) => (
              <div key={event.id} className="relative flex gap-4 pl-1">
                <span className="mt-1 h-5 w-5 rounded-full border border-telemetry/40 bg-telemetry/20" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-white">{event.title}</p>
                    <span className="rounded-full border border-line px-2 py-0.5 text-[11px] text-slate-400">{event.type}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{event.mission.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(event.occurredAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {analytics.rocketReliability.slice(0, 4).map((rocket) => (
          <div key={rocket.name} className="command-card p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-md border border-aurora/30 bg-aurora/10 p-2 text-aurora">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-white">{rocket.name}</p>
                <p className="text-xs text-slate-400">{rocket.launches} launches</p>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full bg-aurora" style={{ width: `${rocket.reliability}%` }} />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-400">Reliability</span>
              <span className="font-semibold text-white">{rocket.reliability}%</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
