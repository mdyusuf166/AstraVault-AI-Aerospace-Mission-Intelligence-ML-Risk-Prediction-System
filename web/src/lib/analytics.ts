import { prisma } from "@/lib/prisma";

export async function getAnalyticsData() {
  const [missions, agencies, rockets] = await Promise.all([
    prisma.mission.findMany({
      include: {
        agency: true,
        company: true,
        launchVehicle: {
          include: {
            rocket: true
          }
        },
        orbit: true
      }
    }),
    prisma.agency.findMany({
      include: {
        missions: true
      }
    }),
    prisma.rocket.findMany({
      include: {
        launchVehicles: {
          include: {
            missions: true
          }
        }
      }
    })
  ]);

  const statusCounts = ["SUCCESS", "FAILURE", "PARTIAL", "ACTIVE", "PLANNED"].map((status) => ({
    status,
    count: missions.filter((mission) => mission.status === status).length
  }));

  const launchesByYear = Object.values(
    missions.reduce<Record<string, { year: string; launches: number; failures: number }>>((acc, mission) => {
      const year = mission.launchDate?.getUTCFullYear()?.toString() ?? "TBD";
      acc[year] ??= { year, launches: 0, failures: 0 };
      acc[year].launches += 1;
      if (mission.status === "FAILURE") acc[year].failures += 1;
      return acc;
    }, {})
  ).sort((a, b) => a.year.localeCompare(b.year));

  const agencyComparison = agencies
    .map((agency) => {
      const complete = agency.missions.filter((mission) =>
        ["SUCCESS", "FAILURE", "PARTIAL"].includes(mission.status)
      );
      const successes = agency.missions.filter((mission) => mission.status === "SUCCESS").length;
      return {
        name: agency.acronym ?? agency.name,
        missions: agency.missions.length,
        successes,
        successRate: complete.length ? Math.round((successes / complete.length) * 100) : 0
      };
    })
    .sort((a, b) => b.missions - a.missions)
    .slice(0, 8);

  const rocketReliability = rockets
    .map((rocket) => {
      const rocketMissions = rocket.launchVehicles.flatMap((vehicle) => vehicle.missions);
      const complete = rocketMissions.filter((mission) =>
        ["SUCCESS", "FAILURE", "PARTIAL"].includes(mission.status)
      );
      const successes = rocketMissions.filter((mission) => mission.status === "SUCCESS").length;
      return {
        name: rocket.name,
        launches: rocketMissions.length,
        successes,
        reliability: complete.length ? Math.round((successes / complete.length) * 100) : 0
      };
    })
    .filter((rocket) => rocket.launches > 0)
    .sort((a, b) => b.launches - a.launches);

  const orbitMix = Object.values(
    missions.reduce<Record<string, { orbit: string; count: number }>>((acc, mission) => {
      const orbit = mission.orbit?.type ?? "UNKNOWN";
      acc[orbit] ??= { orbit, count: 0 };
      acc[orbit].count += 1;
      return acc;
    }, {})
  );

  return {
    statusCounts,
    launchesByYear,
    agencyComparison,
    rocketReliability,
    orbitMix
  };
}
