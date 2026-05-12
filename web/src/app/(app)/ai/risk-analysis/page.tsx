import { RiskAnalysisConsole } from "@/components/ai/risk-analysis-console";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export default function AiRiskAnalysisPage() {
  return (
    <>
      <PageHeader
        title="AI Mission Risk Analyzer"
        description="Generate a readiness report across technical, operational, payload, launch vehicle, orbital, and organization experience risk."
      />

      <SectionCard title="Radar Risk Panel" eyebrow="Mission Readiness">
        <RiskAnalysisConsole />
      </SectionCard>
    </>
  );
}
