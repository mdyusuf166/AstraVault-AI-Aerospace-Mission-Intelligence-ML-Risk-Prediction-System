import { MapPin, RadioTower, Rocket } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { LaunchSiteMapLoader } from "@/components/maps/launch-site-map-loader";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";

export default async function LaunchSitesPage() {
  const sites = await prisma.launchSite.findMany({
    include: {
      agency: true,
      missions: true
    },
    orderBy: { name: "asc" }
  });

  const countries = new Set(sites.map((site) => site.country)).size;
  const launches = sites.reduce((sum, site) => sum + site.missions.length, 0);

  return (
    <>
      <PageHeader
        title="Launch Site Map"
        description="Geospatial launch infrastructure, pad locations, operators, and mission counts across the global spaceport network."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Launch Sites" value={sites.length} detail={`${countries} countries represented`} icon={MapPin} />
        <StatCard label="Site Launches" value={launches} detail="Missions connected to facilities" icon={Rocket} tone="aurora" />
        <StatCard label="Operators" value={new Set(sites.map((site) => site.agencyId).filter(Boolean)).size} detail="Agency-operated sites" icon={RadioTower} tone="warning" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <SectionCard title="Global Launch Network" eyebrow="Map">
          <LaunchSiteMapLoader
            sites={sites.map((site) => ({
              id: site.id,
              name: site.name,
              code: site.code,
              country: site.country,
              latitude: site.latitude,
              longitude: site.longitude,
              missions: site.missions.length
            }))}
          />
        </SectionCard>

        <SectionCard title="Sites" eyebrow="Registry">
          <div className="space-y-3">
            {sites.map((site) => (
              <div key={site.id} className="rounded-lg border border-line bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{site.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{site.region ?? site.country}</p>
                  </div>
                  <span className="rounded-full border border-line px-2 py-1 text-xs text-slate-400">{site.code ?? site.country}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                  <span>{site.agency?.acronym ?? site.agency?.name ?? "Independent"}</span>
                  <span>{site.missions.length} launches</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}
