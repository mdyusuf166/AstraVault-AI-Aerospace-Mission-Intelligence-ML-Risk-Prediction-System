import { Box, Cpu, Orbit, Satellite as SatelliteIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { formatNumber } from "@/lib/utils";

export default async function PayloadsPage() {
  const payloads = await prisma.payload.findMany({
    include: {
      mission: true,
      satellite: {
        include: {
          orbit: true
        }
      },
      instruments: true
    },
    orderBy: { name: "asc" }
  });

  const satellites = payloads.filter((payload) => payload.satellite).length;
  const totalMass = payloads.reduce((sum, payload) => sum + (payload.massKg ?? 0), 0);
  const instruments = payloads.reduce((sum, payload) => sum + payload.instruments.length, 0);

  return (
    <>
      <PageHeader
        title="Satellite And Payload Database"
        description="Payload manifests, spacecraft operators, satellite buses, orbital assignments, and scientific instruments."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Payloads" value={payloads.length} detail="Manifested payload records" icon={Box} />
        <StatCard label="Satellites" value={satellites} detail="Payloads with spacecraft records" icon={SatelliteIcon} tone="aurora" />
        <StatCard label="Total Mass" value={`${formatNumber(totalMass)} kg`} detail={`${instruments} instruments linked`} icon={Cpu} tone="warning" />
      </div>

      <SectionCard title="Payload Registry" eyebrow="Manifest" className="mt-6">
        <div className="overflow-hidden rounded-lg border border-line">
          <div className="grid grid-cols-12 border-b border-line bg-white/[0.03] px-4 py-3 text-xs uppercase tracking-[0.16em] text-slate-500">
            <span className="col-span-4">Payload</span>
            <span className="col-span-3 hidden md:block">Mission</span>
            <span className="col-span-2 hidden lg:block">Mass</span>
            <span className="col-span-2 hidden xl:block">Orbit</span>
            <span className="col-span-8 text-right md:col-span-5 lg:col-span-3 xl:col-span-1">Type</span>
          </div>
          {payloads.map((payload) => (
            <div key={payload.id} className="grid grid-cols-12 items-center gap-3 border-b border-line px-4 py-4 last:border-b-0">
              <div className="col-span-8 min-w-0 md:col-span-4">
                <p className="truncate font-medium text-white">{payload.name}</p>
                <p className="mt-1 truncate text-xs text-slate-500">{payload.customer ?? payload.satellite?.operator ?? "Unknown customer"}</p>
              </div>
              <div className="col-span-3 hidden text-sm text-slate-300 md:block">{payload.mission.name}</div>
              <div className="col-span-2 hidden text-sm text-slate-300 lg:block">{payload.massKg ? `${formatNumber(payload.massKg)} kg` : "-"}</div>
              <div className="col-span-2 hidden items-center gap-2 text-sm text-slate-300 xl:flex">
                <Orbit className="h-4 w-4 text-telemetry" />
                {payload.satellite?.orbit?.name ?? "N/A"}
              </div>
              <div className="col-span-4 text-right md:col-span-5 lg:col-span-3 xl:col-span-1">
                <span className="rounded-full border border-line px-2 py-1 text-xs text-slate-400">{payload.type}</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}
