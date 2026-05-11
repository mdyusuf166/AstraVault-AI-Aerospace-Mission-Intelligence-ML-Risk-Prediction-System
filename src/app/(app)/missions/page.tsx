import Link from "next/link";
import { CalendarDays, MapPin, Package, Rocket } from "lucide-react";
import { MissionFilterForm } from "@/components/missions/mission-filter-form";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getMissionFilterOptions, getMissions } from "@/lib/queries";
import { formatDate, formatNumber } from "@/lib/utils";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function MissionsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [missions, options] = await Promise.all([getMissions(params), getMissionFilterOptions()]);

  return (
    <>
      <PageHeader
        title="Missions Database"
        description="Search and filter human spaceflight, satellite deployments, exploration probes, launch failures, and active mission operations."
      />

      <MissionFilterForm searchParams={params} {...options} />

      {missions.length ? (
        <div className="overflow-hidden rounded-lg border border-line bg-panel/80">
          <div className="grid grid-cols-12 border-b border-line px-4 py-3 text-xs uppercase tracking-[0.16em] text-slate-500">
            <span className="col-span-5">Mission</span>
            <span className="col-span-2 hidden lg:block">Vehicle</span>
            <span className="col-span-2 hidden md:block">Launch</span>
            <span className="col-span-2 hidden xl:block">Operator</span>
            <span className="col-span-7 text-right md:col-span-3 lg:col-span-1">Status</span>
          </div>
          {missions.map((mission) => (
            <Link
              key={mission.id}
              href={`/missions/${mission.slug}`}
              className="grid grid-cols-12 items-center gap-2 border-b border-line px-4 py-4 transition last:border-b-0 hover:bg-white/[0.04]"
            >
              <div className="col-span-8 min-w-0 md:col-span-5">
                <p className="truncate font-medium text-white">{mission.name}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {mission.destination}
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="h-3.5 w-3.5" />
                    {formatNumber(mission.payloads.length)} payloads
                  </span>
                </div>
              </div>
              <div className="col-span-2 hidden text-sm text-slate-300 lg:block">
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-telemetry" />
                  {mission.launchVehicle.rocket.name}
                </div>
                <p className="mt-1 text-xs text-slate-500">{mission.launchVehicle.variant ?? mission.launchVehicle.name}</p>
              </div>
              <div className="col-span-2 hidden text-sm text-slate-300 md:block">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-aurora" />
                  {formatDate(mission.launchDate)}
                </div>
                <p className="mt-1 text-xs text-slate-500">{mission.launchSite.code ?? mission.launchSite.name}</p>
              </div>
              <div className="col-span-2 hidden text-sm text-slate-300 xl:block">
                {mission.agency?.acronym ?? mission.company?.name ?? "Unassigned"}
              </div>
              <div className="col-span-4 text-right md:col-span-3 lg:col-span-1">
                <StatusBadge status={mission.status} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="No missions matched" message="Adjust the search text or remove one of the active filters." />
      )}
    </>
  );
}
