import { Gauge, Package, Rocket as RocketIcon, RotateCcw } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { formatNumber } from "@/lib/utils";

export default async function RocketsPage() {
  const rockets = await prisma.rocket.findMany({
    include: {
      company: true,
      launchVehicles: {
        include: {
          missions: true
        }
      }
    },
    orderBy: { name: "asc" }
  });

  const totalLaunches = rockets.reduce((sum, rocket) => sum + rocket.launchVehicles.flatMap((vehicle) => vehicle.missions).length, 0);
  const reusable = rockets.filter((rocket) => rocket.reusable).length;
  const active = rockets.filter((rocket) => rocket.active).length;

  return (
    <>
      <PageHeader
        title="Rockets Database"
        description="Launch vehicle families, variants, manufacturers, lift class indicators, reusability, and mission reliability."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Rocket Families" value={rockets.length} detail={`${active} active families`} icon={RocketIcon} />
        <StatCard label="Tracked Launches" value={formatNumber(totalLaunches)} detail="Mission records linked through vehicles" icon={Gauge} tone="aurora" />
        <StatCard label="Reusable Systems" value={reusable} detail="Families with reusable architecture" icon={RotateCcw} tone="warning" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {rockets.map((rocket) => {
          const missions = rocket.launchVehicles.flatMap((vehicle) => vehicle.missions);
          const complete = missions.filter((mission) => ["SUCCESS", "FAILURE", "PARTIAL"].includes(mission.status));
          const successes = missions.filter((mission) => mission.status === "SUCCESS").length;
          const reliability = complete.length ? Math.round((successes / complete.length) * 100) : 0;
          return (
            <SectionCard key={rocket.id} title={rocket.name} eyebrow={rocket.manufacturer}>
              <div className="grid gap-4 md:grid-cols-3">
                <Metric label="Launches" value={missions.length.toString()} />
                <Metric label="Reliability" value={`${reliability}%`} />
                <Metric label="Variants" value={rocket.launchVehicles.length.toString()} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <RocketFact label="Country" value={rocket.country} />
                <RocketFact label="Operator" value={rocket.company?.name ?? "Multiple"} />
                <RocketFact label="First Flight" value={rocket.firstFlightYear?.toString() ?? "-"} />
                <RocketFact label="Reusable" value={rocket.reusable ? "Yes" : "No"} />
                <RocketFact label="LEO Payload" value={rocket.payloadLeoKg ? `${formatNumber(rocket.payloadLeoKg)} kg` : "-"} />
                <RocketFact label="GTO Payload" value={rocket.payloadGtoKg ? `${formatNumber(rocket.payloadGtoKg)} kg` : "-"} />
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full bg-aurora" style={{ width: `${reliability}%` }} />
              </div>
            </SectionCard>
          );
        })}
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-white/[0.03] p-3">
      <p className="label">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function RocketFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-line bg-white/[0.03] px-3 py-2 text-sm">
      <span className="flex items-center gap-2 text-slate-400">
        <Package className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
