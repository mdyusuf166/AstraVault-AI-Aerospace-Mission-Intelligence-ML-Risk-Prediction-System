import { Building2, Globe2, Rocket, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";

export default async function AgenciesPage() {
  const [agencies, companies] = await Promise.all([
    prisma.agency.findMany({
      include: {
        missions: true,
        astronauts: true,
        launchSites: true
      },
      orderBy: { name: "asc" }
    }),
    prisma.company.findMany({
      include: {
        missions: true,
        rockets: true
      },
      orderBy: { name: "asc" }
    })
  ]);

  return (
    <>
      <PageHeader
        title="Agencies And Companies"
        description="Government agencies, international organizations, and commercial aerospace operators represented in the mission graph."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Agencies" value={agencies.length} detail="Government and institutional operators" icon={Globe2} />
        <StatCard label="Companies" value={companies.length} detail="Private and public aerospace firms" icon={Building2} tone="aurora" />
        <StatCard label="Agency Astronauts" value={agencies.reduce((sum, agency) => sum + agency.astronauts.length, 0)} detail="Crew profiles linked to agencies" icon={Users} tone="warning" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard title="Space Agencies" eyebrow="Institutional Operators">
          <div className="space-y-3">
            {agencies.map((agency) => (
              <div key={agency.id} className="rounded-lg border border-line bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{agency.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{agency.acronym ?? agency.country}</p>
                  </div>
                  <span className="rounded-full border border-line px-2 py-1 text-xs text-slate-400">{agency.type}</span>
                </div>
                <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                  <Metric label="Missions" value={agency.missions.length} />
                  <Metric label="Astronauts" value={agency.astronauts.length} />
                  <Metric label="Sites" value={agency.launchSites.length} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Aerospace Companies" eyebrow="Commercial Operators">
          <div className="space-y-3">
            {companies.map((company) => (
              <div key={company.id} className="rounded-lg border border-line bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{company.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{company.country}</p>
                  </div>
                  <span className="rounded-full border border-line px-2 py-1 text-xs text-slate-400">{company.type}</span>
                </div>
                <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                  <Metric label="Missions" value={company.missions.length} />
                  <Metric label="Rockets" value={company.rockets.length} />
                  <Metric label="Founded" value={company.foundedYear ?? "-"} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-line bg-panel/70 px-3 py-2">
      <p className="flex items-center gap-2 text-xs text-slate-500">
        <Rocket className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}
