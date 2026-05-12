import { MissionStatus, OrbitType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { missionFilterSchema } from "@/lib/validations";

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseMissionFilters(searchParams?: RawSearchParams) {
  const raw = {
    q: first(searchParams?.q),
    year: first(searchParams?.year),
    agencyId: first(searchParams?.agencyId),
    companyId: first(searchParams?.companyId),
    rocketId: first(searchParams?.rocketId),
    status: first(searchParams?.status),
    destination: first(searchParams?.destination),
    orbitType: first(searchParams?.orbitType)
  };
  return missionFilterSchema.parse(raw);
}

export async function getMissionFilterOptions() {
  const [agencies, companies, rockets, orbits] = await Promise.all([
    prisma.agency.findMany({ orderBy: { name: "asc" } }),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
    prisma.rocket.findMany({ orderBy: { name: "asc" } }),
    prisma.orbit.findMany({ orderBy: { name: "asc" } })
  ]);

  return { agencies, companies, rockets, orbits };
}

export async function getMissions(searchParams?: RawSearchParams) {
  const filters = parseMissionFilters(searchParams);
  const where: Prisma.MissionWhereInput = {};

  if (filters.year) {
    where.launchDate = {
      gte: new Date(`${filters.year}-01-01T00:00:00.000Z`),
      lt: new Date(`${filters.year + 1}-01-01T00:00:00.000Z`)
    };
  }

  if (filters.agencyId) where.agencyId = filters.agencyId;
  if (filters.companyId) where.companyId = filters.companyId;
  if (filters.status) where.status = filters.status as MissionStatus;
  if (filters.destination) {
    where.destination = { contains: filters.destination, mode: "insensitive" };
  }
  if (filters.rocketId) {
    where.launchVehicle = { rocketId: filters.rocketId };
  }
  if (filters.orbitType) {
    where.orbit = { type: filters.orbitType as OrbitType };
  }

  if (filters.q) {
    const rankedIds = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT "id"
      FROM "Mission"
      WHERE to_tsvector(
        'english',
        coalesce("name", '') || ' ' ||
        coalesce("program", '') || ' ' ||
        coalesce("description", '') || ' ' ||
        coalesce("objective", '') || ' ' ||
        coalesce("destination", '')
      ) @@ plainto_tsquery('english', ${filters.q})
      ORDER BY ts_rank(
        to_tsvector(
          'english',
          coalesce("name", '') || ' ' ||
          coalesce("program", '') || ' ' ||
          coalesce("description", '') || ' ' ||
          coalesce("objective", '') || ' ' ||
          coalesce("destination", '')
        ),
        plainto_tsquery('english', ${filters.q})
      ) DESC
      LIMIT 200
    `);

    const ids = rankedIds.map((row) => row.id);
    if (!ids.length) return [];
    where.id = { in: ids };
  }

  return prisma.mission.findMany({
    where,
    include: {
      agency: true,
      company: true,
      launchSite: true,
      orbit: true,
      launchVehicle: {
        include: {
          rocket: true
        }
      },
      payloads: true,
      failureReports: true
    },
    orderBy: [{ launchDate: "desc" }, { name: "asc" }]
  });
}

export async function getMissionBySlug(slug: string) {
  return prisma.mission.findUnique({
    where: { slug },
    include: {
      agency: true,
      company: true,
      launchSite: true,
      orbit: true,
      launchVehicle: {
        include: {
          rocket: true
        }
      },
      crew: {
        include: {
          astronaut: true
        },
        orderBy: {
          role: "asc"
        }
      },
      payloads: {
        include: {
          satellite: true,
          instruments: true
        },
        orderBy: {
          name: "asc"
        }
      },
      events: {
        orderBy: [{ occurredAt: "asc" }, { sequence: "asc" }]
      },
      failureReports: true,
      instruments: true,
      telemetry: true
    }
  });
}

export async function getDashboardData() {
  const [missionCount, activeMissions, failureCount, payloadCount, upcoming, latestEvents] =
    await Promise.all([
      prisma.mission.count(),
      prisma.mission.count({ where: { status: { in: ["ACTIVE", "PLANNED"] } } }),
      prisma.mission.count({ where: { status: "FAILURE" } }),
      prisma.payload.count(),
      prisma.mission.findMany({
        where: { launchDate: { gte: new Date() } },
        include: { launchVehicle: { include: { rocket: true } }, launchSite: true },
        orderBy: { launchDate: "asc" },
        take: 5
      }),
      prisma.missionEvent.findMany({
        include: { mission: true },
        orderBy: { occurredAt: "desc" },
        take: 8
      })
    ]);

  return {
    missionCount,
    activeMissions,
    failureCount,
    payloadCount,
    upcoming,
    latestEvents
  };
}

export async function getCoreCollections() {
  const [rockets, agencies, companies, astronauts, payloads, launchSites] = await Promise.all([
    prisma.rocket.findMany({
      include: {
        company: true,
        launchVehicles: {
          include: {
            missions: true
          }
        }
      },
      orderBy: { name: "asc" }
    }),
    prisma.agency.findMany({
      include: {
        missions: true,
        astronauts: true
      },
      orderBy: { name: "asc" }
    }),
    prisma.company.findMany({
      include: {
        missions: true,
        rockets: true
      },
      orderBy: { name: "asc" }
    }),
    prisma.astronaut.findMany({
      include: {
        agency: true,
        crew: {
          include: { mission: true }
        }
      },
      orderBy: { name: "asc" }
    }),
    prisma.payload.findMany({
      include: {
        mission: true,
        satellite: true
      },
      orderBy: { name: "asc" }
    }),
    prisma.launchSite.findMany({
      include: {
        missions: true,
        agency: true
      },
      orderBy: { name: "asc" }
    })
  ]);

  return { rockets, agencies, companies, astronauts, payloads, launchSites };
}
