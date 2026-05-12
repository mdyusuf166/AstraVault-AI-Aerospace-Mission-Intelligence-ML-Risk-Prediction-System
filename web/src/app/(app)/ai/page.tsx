import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { BrainCircuit, Gauge, Radar, Rocket, ShieldAlert } from "lucide-react";
import { getModelInfo } from "@/lib/ml-api";
import { prisma } from "@/lib/prisma";
import { asPercent, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";

export default async function AiDashboardPage() {
  const [health, latestPrediction, latestRocketScore, modelRuns, patternCount] = await Promise.all([
    getModelInfo(),
    prisma.missionPrediction.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.rocketReliabilityScore.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.mLModelRun.count(),
    prisma.failurePattern.count()
  ]);

  return (
    <>
      <PageHeader
        title="AI Mission Intelligence"
        description="Machine learning overlays for mission success prediction, rocket reliability, failure pattern analysis, and launch vehicle selection."
        action={
          <Link href="/ai/mission-prediction" className="rounded-md bg-telemetry px-4 py-2 text-sm font-semibold text-slate-950">
            New Prediction
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="ML Service"
          value={health.data ? "Online" : "Offline"}
          detail={health.data ? `${health.data.modelVersion} trained` : health.error ?? "Model not trained yet"}
          icon={BrainCircuit}
          tone={health.data ? "aurora" : "danger"}
        />
        <StatCard label="Model Runs" value={modelRuns} detail="Training runs stored in PostgreSQL" icon={Gauge} />
        <StatCard label="Failure Patterns" value={patternCount} detail="Persisted anomaly clusters" icon={ShieldAlert} tone="warning" />
        <StatCard
          label="Latest Rocket Score"
          value={latestRocketScore ? asPercent(latestRocketScore.reliabilityScore) : "-"}
          detail={latestRocketScore?.rocketName ?? "No reliability score stored"}
          icon={Radar}
          tone="aurora"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Latest Mission Prediction" eyebrow="Inference">
          {latestPrediction ? (
            <div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold text-white">{latestPrediction.missionId ?? "Scenario prediction"}</p>
                  <p className="mt-2 text-sm text-slate-400">{formatDate(latestPrediction.createdAt)}</p>
                </div>
                <span className="rounded-full border border-telemetry/40 bg-telemetry/10 px-3 py-1 text-sm text-telemetry">
                  {latestPrediction.riskLevel} risk
                </span>
              </div>
              <p className="mt-5 text-4xl font-semibold text-white">{asPercent(latestPrediction.successProbability)}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{latestPrediction.explanation}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-line bg-white/[0.03] p-5 text-sm text-slate-400">
              No mission prediction has been persisted yet.
            </div>
          )}
        </SectionCard>

        <SectionCard title="AI Workbenches" eyebrow="Navigation">
          <div className="grid gap-3 sm:grid-cols-2">
            <WorkbenchLink href="/ai/mission-prediction" title="Mission Prediction" icon={BrainCircuit} />
            <WorkbenchLink href="/ai/rocket-reliability" title="Rocket Reliability" icon={Radar} />
            <WorkbenchLink href="/ai/failure-patterns" title="Failure Patterns" icon={ShieldAlert} />
            <WorkbenchLink href="/ai/launch-recommendation" title="Launch Recommendation" icon={Rocket} />
            <WorkbenchLink href="/ai/risk-analysis" title="Risk Analysis" icon={Gauge} />
          </div>
        </SectionCard>
      </div>
    </>
  );
}

function WorkbenchLink({ href, title, icon: Icon }: { href: string; title: string; icon: LucideIcon }) {
  return (
    <Link href={href} className="rounded-lg border border-line bg-white/[0.03] p-4 transition hover:border-telemetry/40">
      <Icon className="h-5 w-5 text-telemetry" />
      <p className="mt-3 font-medium text-white">{title}</p>
    </Link>
  );
}
