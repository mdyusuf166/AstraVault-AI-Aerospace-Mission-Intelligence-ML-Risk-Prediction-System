import { Activity, BarChart3, Gauge, Rocket } from "lucide-react";
import { getAnalyticsData } from "@/lib/analytics";
import {
  AgencyComparisonChart,
  LaunchFrequencyChart,
  RocketReliabilityChart,
  StatusPieChart
} from "@/components/charts/analytics-charts";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";

export default async function AnalyticsPage() {
  const analytics = await getAnalyticsData();
  const launches = analytics.launchesByYear.reduce((sum, year) => sum + year.launches, 0);
  const failures = analytics.launchesByYear.reduce((sum, year) => sum + year.failures, 0);
  const bestRocket = analytics.rocketReliability[0];
  const busiestAgency = analytics.agencyComparison[0];

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Mission success/failure analytics, launch frequency, agency comparison, orbit mix, and rocket reliability dashboards."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Launches" value={launches} detail="Launch events in dataset" icon={Activity} />
        <StatCard label="Failures" value={failures} detail="Failed mission outcomes" icon={Gauge} tone="danger" />
        <StatCard label="Top Rocket" value={bestRocket?.name ?? "-"} detail={bestRocket ? `${bestRocket.reliability}% reliability` : "No launch data"} icon={Rocket} tone="aurora" />
        <StatCard label="Top Agency" value={busiestAgency?.name ?? "-"} detail={busiestAgency ? `${busiestAgency.missions} missions` : "No agency data"} icon={BarChart3} tone="warning" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <SectionCard title="Launch Frequency By Year" eyebrow="Temporal">
          <LaunchFrequencyChart data={analytics.launchesByYear} />
        </SectionCard>
        <SectionCard title="Success And Failure Mix" eyebrow="Outcome">
          <StatusPieChart data={analytics.statusCounts} />
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard title="Agency Comparison" eyebrow="Operators">
          <AgencyComparisonChart data={analytics.agencyComparison} />
        </SectionCard>
        <SectionCard title="Rocket Reliability" eyebrow="Launch Vehicles">
          <RocketReliabilityChart data={analytics.rocketReliability} />
        </SectionCard>
      </div>
    </>
  );
}
