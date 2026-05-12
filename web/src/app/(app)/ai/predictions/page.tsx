import { prisma } from "@/lib/prisma";
import { MissionPredictionConsole } from "@/components/ai/mission-prediction-console";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export default async function AiPredictionsPage() {
  const [missions, recentPredictions] = await Promise.all([
    prisma.mission.findMany({
      select: { id: true, name: true, destination: true },
      orderBy: { launchDate: "desc" },
      take: 30
    }),
    prisma.missionPrediction.findMany({
      orderBy: { createdAt: "desc" },
      take: 8
    })
  ]);

  return (
    <>
      <PageHeader
        title="Mission Success Prediction"
        description="Run the trained model against stored missions or proposed mission scenarios and persist the prediction record."
      />

      <SectionCard title="Prediction Console" eyebrow="Scikit-learn">
        <MissionPredictionConsole missions={missions} />
      </SectionCard>

      <SectionCard title="Recent Predictions" eyebrow="PostgreSQL" className="mt-6">
        <div className="grid gap-3 md:grid-cols-2">
          {recentPredictions.length ? (
            recentPredictions.map((prediction) => (
              <div key={prediction.id} className="rounded-lg border border-line bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium text-white">{prediction.missionId ?? "Scenario prediction"}</p>
                  <span className="rounded-full border border-telemetry/40 bg-telemetry/10 px-3 py-1 text-xs text-telemetry">
                    {prediction.riskLevel}
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-white">{Math.round(prediction.successProbability * 100)}%</p>
                <p className="mt-2 text-sm text-slate-400">{prediction.explanation ?? "No explanation stored."}</p>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-line bg-white/[0.03] p-5 text-sm text-slate-400">No prediction records yet.</div>
          )}
        </div>
      </SectionCard>
    </>
  );
}
