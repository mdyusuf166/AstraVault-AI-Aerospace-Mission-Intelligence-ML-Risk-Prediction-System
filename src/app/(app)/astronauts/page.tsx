import { CalendarDays, Clock, Flag, UserRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { formatDate, formatNumber } from "@/lib/utils";

export default async function AstronautsPage() {
  const astronauts = await prisma.astronaut.findMany({
    include: {
      agency: true,
      crew: {
        include: {
          mission: true
        }
      }
    },
    orderBy: [{ flights: "desc" }, { name: "asc" }]
  });

  return (
    <>
      <PageHeader
        title="Astronaut Database"
        description="Crew biographies, agencies, nationalities, flight counts, EVA time, and mission assignments."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Astronauts" value={astronauts.length} detail="Crew profiles in registry" icon={UserRound} />
        <StatCard label="Total Flights" value={formatNumber(astronauts.reduce((sum, astronaut) => sum + astronaut.flights, 0))} detail="Recorded astronaut mission flights" icon={CalendarDays} tone="aurora" />
        <StatCard label="EVA Hours" value={formatNumber(astronauts.reduce((sum, astronaut) => sum + astronaut.evaHours, 0))} detail="Aggregated extravehicular activity" icon={Clock} tone="warning" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {astronauts.map((astronaut) => (
          <div key={astronaut.id} className="command-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">{astronaut.name}</h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                  <Flag className="h-4 w-4 text-telemetry" />
                  {astronaut.nationality}
                </p>
              </div>
              <span className="rounded-full border border-line px-2 py-1 text-xs text-slate-400">{astronaut.status}</span>
            </div>
            <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-400">{astronaut.bio ?? "No biography recorded."}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <Metric label="Flights" value={astronaut.flights} />
              <Metric label="EVA" value={`${astronaut.evaHours}h`} />
              <Metric label="Born" value={astronaut.birthDate ? formatDate(astronaut.birthDate) : "-"} />
            </div>
            <div className="mt-4 border-t border-line pt-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{astronaut.agency?.acronym ?? astronaut.agency?.name ?? "Independent"}</p>
              <p className="mt-2 text-sm text-slate-300">
                {astronaut.crew.map((crew) => crew.mission.name).join(", ") || "No mission assignments"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-line bg-white/[0.03] p-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}
