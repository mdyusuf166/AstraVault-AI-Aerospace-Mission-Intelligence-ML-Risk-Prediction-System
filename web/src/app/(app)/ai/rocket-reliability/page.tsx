import { prisma } from "@/lib/prisma";
import { asPercent, formatDate } from "@/lib/utils";
import { RocketReliabilityConsole } from "@/components/ai/rocket-reliability-console";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export default async function AiRocketReliabilityPage() {
  const [rockets, scores] = await Promise.all([
    prisma.rocket.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.rocketReliabilityScore.findMany({
      orderBy: { createdAt: "desc" },
      take: 8
    })
  ]);

  return (
    <>
      <PageHeader
        title="Rocket Reliability Scoring"
        description="Score rocket families with mission outcome history, confidence estimates, and operational risk factors."
      />

      <SectionCard title="Reliability Console" eyebrow="Vehicle Intelligence">
        <RocketReliabilityConsole rockets={rockets} />
      </SectionCard>

      <SectionCard title="Stored Reliability Scores" eyebrow="PostgreSQL" className="mt-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {scores.length ? (
            scores.map((score) => (
              <div key={score.id} className="rounded-lg border border-line bg-white/[0.03] p-4">
                <p className="font-medium text-white">{score.rocketName}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{asPercent(score.reliabilityScore)}</p>
                <p className="mt-2 text-sm text-slate-400">{score.totalLaunches} launches analyzed</p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">{formatDate(score.createdAt)}</p>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-line bg-white/[0.03] p-5 text-sm text-slate-400">No stored reliability scores yet.</div>
          )}
        </div>
      </SectionCard>
    </>
  );
}
