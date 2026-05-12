import Link from "next/link";
import type { Agency, Company, Orbit, Rocket } from "@prisma/client";

const statuses = ["PLANNED", "ACTIVE", "SUCCESS", "FAILURE", "PARTIAL"];
const orbitTypes = ["LEO", "MEO", "GEO", "HEO", "POLAR", "SSO", "LUNAR", "SOLAR", "SUBORBITAL", "INTERPLANETARY", "UNKNOWN"];

type SearchParams = Record<string, string | string[] | undefined>;

function valueOf(params: SearchParams | undefined, key: string) {
  const value = params?.[key];
  return Array.isArray(value) ? value[0] : value;
}

export function MissionFilterForm({
  searchParams,
  agencies,
  companies,
  rockets
}: {
  searchParams?: SearchParams;
  agencies: Agency[];
  companies: Company[];
  rockets: Rocket[];
  orbits: Orbit[];
}) {
  return (
    <form method="GET" className="command-card mb-6 grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-8">
      <div className="xl:col-span-2">
        <label className="label" htmlFor="q">
          Search
        </label>
        <input id="q" name="q" defaultValue={valueOf(searchParams, "q")} placeholder="Apollo, Mars, Starlink" className="field mt-2 w-full" />
      </div>
      <div>
        <label className="label" htmlFor="year">
          Year
        </label>
        <input id="year" name="year" defaultValue={valueOf(searchParams, "year")} placeholder="2024" className="field mt-2 w-full" />
      </div>
      <div>
        <label className="label" htmlFor="status">
          Status
        </label>
        <select id="status" name="status" defaultValue={valueOf(searchParams, "status") ?? ""} className="field mt-2 w-full">
          <option value="">Any</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="agencyId">
          Agency
        </label>
        <select id="agencyId" name="agencyId" defaultValue={valueOf(searchParams, "agencyId") ?? ""} className="field mt-2 w-full">
          <option value="">Any</option>
          {agencies.map((agency) => (
            <option key={agency.id} value={agency.id}>
              {agency.acronym ?? agency.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="companyId">
          Company
        </label>
        <select id="companyId" name="companyId" defaultValue={valueOf(searchParams, "companyId") ?? ""} className="field mt-2 w-full">
          <option value="">Any</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="rocketId">
          Rocket
        </label>
        <select id="rocketId" name="rocketId" defaultValue={valueOf(searchParams, "rocketId") ?? ""} className="field mt-2 w-full">
          <option value="">Any</option>
          {rockets.map((rocket) => (
            <option key={rocket.id} value={rocket.id}>
              {rocket.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="orbitType">
          Orbit
        </label>
        <select id="orbitType" name="orbitType" defaultValue={valueOf(searchParams, "orbitType") ?? ""} className="field mt-2 w-full">
          <option value="">Any</option>
          {orbitTypes.map((orbit) => (
            <option key={orbit} value={orbit}>
              {orbit}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end gap-2 xl:col-span-8">
        <button type="submit" className="rounded-md bg-telemetry px-4 py-2 text-sm font-semibold text-slate-950">
          Apply Filters
        </button>
        <Link href="/missions" className="rounded-md border border-line px-4 py-2 text-sm text-slate-300">
          Reset
        </Link>
      </div>
    </form>
  );
}
