import { LaunchRecommendationConsole } from "@/components/ai/launch-recommendation-console";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export default function AiLaunchRecommendationPage() {
  return (
    <>
      <PageHeader
        title="Launch Vehicle Recommendation"
        description="Rank candidate rocket families using payload fit, reliability, reusability, activity status, and crewed mission constraints."
      />

      <SectionCard title="Recommendation Console" eyebrow="Vehicle Selection">
        <LaunchRecommendationConsole />
      </SectionCard>
    </>
  );
}
