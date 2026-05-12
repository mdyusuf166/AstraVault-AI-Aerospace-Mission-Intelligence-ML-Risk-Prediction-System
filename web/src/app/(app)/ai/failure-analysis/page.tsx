import { prisma } from "@/lib/prisma";
import { FailurePatternsConsole } from "@/components/ai/failure-patterns-console";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export default async function AiFailureAnalysisPage() {
  const storedPatterns = await prisma.failurePattern.findMany({
    orderBy: [{ frequency: "desc" }, { createdAt: "desc" }],
    take: 8
  });

  return (
    <>
      <PageHeader
        title="Failure Pattern Analysis"
        description="Cluster anomaly history by phase, affected systems, severity, and mitigation recommendations."
      />

      <SectionCard title="Pattern Miner" eyebrow="Anomaly Intelligence">
        <FailurePatternsConsole />
      </SectionCard>

      <SectionCard title="Stored Pattern History" eyebrow="PostgreSQL" className="mt-6">
        <div className="grid gap-3 md:grid-cols-2">
          {storedPatterns.length ? (
            storedPatterns.map((pattern) => (
              <div key={pattern.id} className="rounded-lg border border-line bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="font-medium text-white">{pattern.category}</p>
                  <span className="rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs text-warning">
                    {pattern.percentage}%
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{pattern.description}</p>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-line bg-white/[0.03] p-5 text-sm text-slate-400">No stored failure patterns yet.</div>
          )}
        </div>
      </SectionCard>
    </>
  );
}
