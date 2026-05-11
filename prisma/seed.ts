import bcrypt from "bcryptjs";
import {
  AgencyType,
  CompanyType,
  CrewRole,
  EventType,
  MissionStatus,
  OrbitType,
  PayloadType,
  PrismaClient,
  Role
} from "@prisma/client";
import { slugify } from "../src/lib/utils";

const prisma = new PrismaClient();

function date(value: string) {
  return new Date(value);
}

async function clearDatabase() {
  await prisma.auditLog.deleteMany();
  await prisma.telemetrySummary.deleteMany();
  await prisma.scientificInstrument.deleteMany();
  await prisma.satellite.deleteMany();
  await prisma.payload.deleteMany();
  await prisma.failureReport.deleteMany();
  await prisma.missionEvent.deleteMany();
  await prisma.missionCrew.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.astronaut.deleteMany();
  await prisma.launchSite.deleteMany();
  await prisma.launchVehicle.deleteMany();
  await prisma.rocket.deleteMany();
  await prisma.orbit.deleteMany();
  await prisma.agency.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await clearDatabase();

  const passwordHash = await bcrypt.hash("AstraVault!2026", 12);
  await prisma.user.createMany({
    data: [
      { name: "AstraVault Admin", email: "admin@astravault.dev", passwordHash, role: Role.ADMIN },
      { name: "Mission Researcher", email: "researcher@astravault.dev", passwordHash, role: Role.RESEARCHER },
      { name: "Mission Viewer", email: "viewer@astravault.dev", passwordHash, role: Role.VIEWER }
    ]
  });

  const nasa = await prisma.agency.create({
    data: {
      name: "National Aeronautics and Space Administration",
      acronym: "NASA",
      type: AgencyType.GOVERNMENT,
      country: "United States",
      website: "https://www.nasa.gov",
      foundedYear: 1958,
      description: "United States civil space agency for aeronautics, exploration, science, and human spaceflight."
    }
  });

  const esa = await prisma.agency.create({
    data: {
      name: "European Space Agency",
      acronym: "ESA",
      type: AgencyType.INTERNATIONAL,
      country: "Europe",
      website: "https://www.esa.int",
      foundedYear: 1975,
      description: "Intergovernmental space organization coordinating European space exploration and science."
    }
  });

  const isro = await prisma.agency.create({
    data: {
      name: "Indian Space Research Organisation",
      acronym: "ISRO",
      type: AgencyType.GOVERNMENT,
      country: "India",
      website: "https://www.isro.gov.in",
      foundedYear: 1969,
      description: "India's national space agency for launch vehicles, satellites, planetary science, and exploration."
    }
  });

  const spacex = await prisma.company.create({
    data: {
      name: "SpaceX",
      type: CompanyType.PRIVATE,
      country: "United States",
      website: "https://www.spacex.com",
      foundedYear: 2002,
      description: "Private aerospace company operating Falcon, Dragon, Starship, Starlink, and reusable launch systems."
    }
  });

  const blueOrigin = await prisma.company.create({
    data: {
      name: "Blue Origin",
      type: CompanyType.PRIVATE,
      country: "United States",
      website: "https://www.blueorigin.com",
      foundedYear: 2000,
      description: "Private aerospace company developing reusable launch systems and orbital infrastructure."
    }
  });

  const rocketLab = await prisma.company.create({
    data: {
      name: "Rocket Lab",
      ticker: "RKLB",
      type: CompanyType.PUBLIC,
      country: "United States / New Zealand",
      website: "https://www.rocketlabusa.com",
      foundedYear: 2006,
      description: "Launch and space systems company operating Electron and Photon spacecraft."
    }
  });

  const arianespace = await prisma.company.create({
    data: {
      name: "Arianespace",
      type: CompanyType.PRIVATE,
      country: "France",
      website: "https://www.arianespace.com",
      foundedYear: 1980,
      description: "European launch services provider for Ariane, Vega, and Soyuz missions."
    }
  });

  const leo = await prisma.orbit.create({
    data: { name: "Low Earth Orbit", type: OrbitType.LEO, perigeeKm: 160, apogeeKm: 2000, periodMinutes: 90 }
  });
  await prisma.orbit.create({
    data: { name: "Sun-Synchronous Orbit", type: OrbitType.SSO, inclinationDeg: 97.5, perigeeKm: 500, apogeeKm: 700, periodMinutes: 98 }
  });
  const geoTransfer = await prisma.orbit.create({
    data: { name: "Geostationary Transfer Orbit", type: OrbitType.GEO, perigeeKm: 250, apogeeKm: 35786 }
  });
  const lunar = await prisma.orbit.create({
    data: { name: "Lunar Trajectory", type: OrbitType.LUNAR, inclinationDeg: 0 }
  });
  const suborbital = await prisma.orbit.create({
    data: { name: "Suborbital Trajectory", type: OrbitType.SUBORBITAL, apogeeKm: 107 }
  });

  const ksc39a = await prisma.launchSite.create({
    data: {
      name: "Kennedy Space Center Launch Complex 39A",
      code: "KSC LC-39A",
      country: "United States",
      region: "Florida",
      latitude: 28.6084,
      longitude: -80.6043,
      agencyId: nasa.id
    }
  });
  const ksc39b = await prisma.launchSite.create({
    data: {
      name: "Kennedy Space Center Launch Complex 39B",
      code: "KSC LC-39B",
      country: "United States",
      region: "Florida",
      latitude: 28.6272,
      longitude: -80.6209,
      agencyId: nasa.id
    }
  });
  const ccsfs40 = await prisma.launchSite.create({
    data: {
      name: "Cape Canaveral Space Force Station SLC-40",
      code: "CCSFS SLC-40",
      country: "United States",
      region: "Florida",
      latitude: 28.5619,
      longitude: -80.5772
    }
  });
  const guiana = await prisma.launchSite.create({
    data: {
      name: "Guiana Space Centre ELA-3",
      code: "CSG ELA-3",
      country: "French Guiana",
      region: "Kourou",
      latitude: 5.239,
      longitude: -52.768,
      agencyId: esa.id
    }
  });
  const sdsc = await prisma.launchSite.create({
    data: {
      name: "Satish Dhawan Space Centre Second Launch Pad",
      code: "SDSC SLP",
      country: "India",
      region: "Sriharikota",
      latitude: 13.7199,
      longitude: 80.2304,
      agencyId: isro.id
    }
  });
  const westTexas = await prisma.launchSite.create({
    data: {
      name: "Blue Origin Launch Site One",
      code: "LS-1",
      country: "United States",
      region: "West Texas",
      latitude: 31.4229,
      longitude: -104.7571
    }
  });
  const mahia = await prisma.launchSite.create({
    data: {
      name: "Rocket Lab Launch Complex 1",
      code: "LC-1",
      country: "New Zealand",
      region: "Mahia Peninsula",
      latitude: -39.2628,
      longitude: 177.8645
    }
  });

  const saturnV = await prisma.rocket.create({
    data: {
      name: "Saturn V",
      manufacturer: "NASA / Boeing / North American / Douglas",
      country: "United States",
      active: false,
      reusable: false,
      firstFlightYear: 1967,
      payloadLeoKg: 140000
    }
  });
  const falcon9 = await prisma.rocket.create({
    data: {
      name: "Falcon 9",
      manufacturer: "SpaceX",
      country: "United States",
      active: true,
      reusable: true,
      firstFlightYear: 2010,
      payloadLeoKg: 22800,
      payloadGtoKg: 8300,
      companyId: spacex.id
    }
  });
  const sls = await prisma.rocket.create({
    data: {
      name: "Space Launch System",
      manufacturer: "NASA / Boeing / Aerojet Rocketdyne / Northrop Grumman",
      country: "United States",
      active: true,
      reusable: false,
      firstFlightYear: 2022,
      payloadLeoKg: 95000
    }
  });
  const ariane5 = await prisma.rocket.create({
    data: {
      name: "Ariane 5",
      manufacturer: "ArianeGroup",
      country: "Europe",
      active: false,
      reusable: false,
      firstFlightYear: 1996,
      payloadGtoKg: 10500,
      companyId: arianespace.id
    }
  });
  const lvm3 = await prisma.rocket.create({
    data: {
      name: "LVM3",
      manufacturer: "ISRO",
      country: "India",
      active: true,
      reusable: false,
      firstFlightYear: 2014,
      payloadLeoKg: 8000,
      payloadGtoKg: 4000
    }
  });
  const newShepard = await prisma.rocket.create({
    data: {
      name: "New Shepard",
      manufacturer: "Blue Origin",
      country: "United States",
      active: true,
      reusable: true,
      firstFlightYear: 2015,
      companyId: blueOrigin.id
    }
  });
  const electron = await prisma.rocket.create({
    data: {
      name: "Electron",
      manufacturer: "Rocket Lab",
      country: "United States / New Zealand",
      active: true,
      reusable: true,
      firstFlightYear: 2017,
      payloadLeoKg: 320,
      companyId: rocketLab.id
    }
  });

  const vehicles = {
    saturnApollo: await prisma.launchVehicle.create({
      data: { name: "Saturn V", variant: "Block II", serialNumber: "SA-506", rocketId: saturnV.id }
    }),
    falconDemo2: await prisma.launchVehicle.create({
      data: { name: "Falcon 9", variant: "Block 5", serialNumber: "B1058", reusable: true, rocketId: falcon9.id, operatorId: spacex.id }
    }),
    falconStarlink: await prisma.launchVehicle.create({
      data: { name: "Falcon 9", variant: "Block 5", serialNumber: "B1076", reusable: true, rocketId: falcon9.id, operatorId: spacex.id }
    }),
    slsArtemis: await prisma.launchVehicle.create({
      data: { name: "SLS", variant: "Block 1", serialNumber: "Artemis-I", rocketId: sls.id }
    }),
    arianeJwst: await prisma.launchVehicle.create({
      data: { name: "Ariane 5", variant: "ECA", serialNumber: "VA256", rocketId: ariane5.id, operatorId: arianespace.id }
    }),
    lvmCh3: await prisma.launchVehicle.create({
      data: { name: "LVM3", variant: "M4", serialNumber: "LVM3-M4", rocketId: lvm3.id }
    }),
    ns23: await prisma.launchVehicle.create({
      data: { name: "New Shepard", variant: "NS4", serialNumber: "NS-23", reusable: true, rocketId: newShepard.id, operatorId: blueOrigin.id }
    }),
    electronCapstone: await prisma.launchVehicle.create({
      data: { name: "Electron", variant: "Kick Stage", serialNumber: "CAPSTONE", reusable: false, rocketId: electron.id, operatorId: rocketLab.id }
    })
  };

  const astronauts = {
    armstrong: await prisma.astronaut.create({
      data: {
        name: "Neil Armstrong",
        nationality: "United States",
        agencyId: nasa.id,
        status: "Retired",
        flights: 2,
        evaHours: 2.52,
        birthDate: date("1930-08-05T00:00:00Z"),
        bio: "Apollo 11 commander and first human to walk on the Moon."
      }
    }),
    aldrin: await prisma.astronaut.create({
      data: {
        name: "Buzz Aldrin",
        nationality: "United States",
        agencyId: nasa.id,
        status: "Retired",
        flights: 2,
        evaHours: 7.87,
        birthDate: date("1930-01-20T00:00:00Z"),
        bio: "Apollo 11 lunar module pilot and Gemini 12 veteran."
      }
    }),
    collins: await prisma.astronaut.create({
      data: {
        name: "Michael Collins",
        nationality: "United States",
        agencyId: nasa.id,
        status: "Retired",
        flights: 2,
        evaHours: 1.45,
        birthDate: date("1930-10-31T00:00:00Z"),
        bio: "Apollo 11 command module pilot and Gemini 10 astronaut."
      }
    }),
    hurley: await prisma.astronaut.create({
      data: {
        name: "Doug Hurley",
        nationality: "United States",
        agencyId: nasa.id,
        status: "Retired",
        flights: 3,
        evaHours: 0,
        birthDate: date("1966-10-21T00:00:00Z"),
        bio: "NASA astronaut and Crew Dragon Demo-2 spacecraft commander."
      }
    }),
    behnken: await prisma.astronaut.create({
      data: {
        name: "Bob Behnken",
        nationality: "United States",
        agencyId: nasa.id,
        status: "Active",
        flights: 3,
        evaHours: 61.17,
        birthDate: date("1970-07-28T00:00:00Z"),
        bio: "NASA astronaut, engineer, and Crew Dragon Demo-2 joint operations commander."
      }
    })
  };

  async function createMission(input: {
    name: string;
    program?: string;
    description: string;
    objective: string;
    destination: string;
    status: MissionStatus;
    launchDate: Date;
    endDate?: Date;
    costUsdMillions?: number;
    agencyId?: string;
    companyId?: string;
    launchVehicleId: string;
    launchSiteId: string;
    orbitId?: string;
  }) {
    return prisma.mission.create({
      data: {
        ...input,
        slug: slugify(input.name)
      }
    });
  }

  const apollo11 = await createMission({
    name: "Apollo 11",
    program: "Apollo",
    description: "First crewed lunar landing mission, placing astronauts on the lunar surface and returning samples to Earth.",
    objective: "Perform a crewed lunar landing, lunar surface EVA, sample return, and safe recovery.",
    destination: "Moon",
    status: MissionStatus.SUCCESS,
    launchDate: date("1969-07-16T13:32:00Z"),
    endDate: date("1969-07-24T16:50:35Z"),
    costUsdMillions: 25000,
    agencyId: nasa.id,
    launchVehicleId: vehicles.saturnApollo.id,
    launchSiteId: ksc39a.id,
    orbitId: lunar.id
  });

  const demo2 = await createMission({
    name: "Crew Dragon Demo-2",
    program: "Commercial Crew",
    description: "First crewed orbital flight of SpaceX Crew Dragon and the first crewed orbital launch from the United States since STS-135.",
    objective: "Validate Falcon 9, Crew Dragon, ground systems, docking, and recovery operations for operational crew rotation.",
    destination: "International Space Station",
    status: MissionStatus.SUCCESS,
    launchDate: date("2020-05-30T19:22:00Z"),
    endDate: date("2020-08-02T18:48:00Z"),
    agencyId: nasa.id,
    companyId: spacex.id,
    launchVehicleId: vehicles.falconDemo2.id,
    launchSiteId: ksc39a.id,
    orbitId: leo.id
  });

  const artemis1 = await createMission({
    name: "Artemis I",
    program: "Artemis",
    description: "Uncrewed flight test of SLS and Orion around the Moon before crewed Artemis missions.",
    objective: "Demonstrate integrated SLS, Orion, and Exploration Ground Systems performance on a lunar return trajectory.",
    destination: "Moon",
    status: MissionStatus.SUCCESS,
    launchDate: date("2022-11-16T06:47:44Z"),
    endDate: date("2022-12-11T17:40:30Z"),
    agencyId: nasa.id,
    launchVehicleId: vehicles.slsArtemis.id,
    launchSiteId: ksc39b.id,
    orbitId: lunar.id
  });

  const jwst = await createMission({
    name: "James Webb Space Telescope",
    program: "JWST",
    description: "Infrared space telescope deployed to the Sun-Earth L2 region for astrophysics and cosmology observations.",
    objective: "Observe first light galaxies, exoplanet atmospheres, stellar nurseries, and infrared cosmology targets.",
    destination: "Sun-Earth L2",
    status: MissionStatus.SUCCESS,
    launchDate: date("2021-12-25T12:20:00Z"),
    agencyId: nasa.id,
    launchVehicleId: vehicles.arianeJwst.id,
    launchSiteId: guiana.id,
    orbitId: geoTransfer.id
  });

  const starlink = await createMission({
    name: "Starlink Group 6-1",
    program: "Starlink",
    description: "Deployment of Starlink communications satellites into low Earth orbit.",
    objective: "Expand broadband satellite constellation capacity and coverage.",
    destination: "Low Earth Orbit",
    status: MissionStatus.SUCCESS,
    launchDate: date("2023-02-27T23:13:00Z"),
    companyId: spacex.id,
    launchVehicleId: vehicles.falconStarlink.id,
    launchSiteId: ccsfs40.id,
    orbitId: leo.id
  });

  const chandrayaan3 = await createMission({
    name: "Chandrayaan-3",
    program: "Chandrayaan",
    description: "Indian lunar landing mission with Vikram lander and Pragyan rover.",
    objective: "Demonstrate soft landing near the lunar south polar region and conduct surface science operations.",
    destination: "Moon",
    status: MissionStatus.SUCCESS,
    launchDate: date("2023-07-14T09:05:00Z"),
    agencyId: isro.id,
    launchVehicleId: vehicles.lvmCh3.id,
    launchSiteId: sdsc.id,
    orbitId: lunar.id
  });

  const ns23 = await createMission({
    name: "New Shepard NS-23",
    program: "New Shepard",
    description: "Uncrewed suborbital research mission that experienced a booster anomaly and crew capsule escape activation.",
    objective: "Carry microgravity research payloads on a suborbital trajectory.",
    destination: "Suborbital Space",
    status: MissionStatus.FAILURE,
    launchDate: date("2022-09-12T14:27:00Z"),
    companyId: blueOrigin.id,
    launchVehicleId: vehicles.ns23.id,
    launchSiteId: westTexas.id,
    orbitId: suborbital.id
  });

  const capstone = await createMission({
    name: "CAPSTONE",
    program: "Artemis",
    description: "Cislunar cubesat mission testing navigation and operations for a near-rectilinear halo orbit.",
    objective: "Validate a lunar NRHO trajectory and spacecraft-to-spacecraft navigation technologies.",
    destination: "Moon",
    status: MissionStatus.SUCCESS,
    launchDate: date("2022-06-28T09:55:00Z"),
    agencyId: nasa.id,
    companyId: rocketLab.id,
    launchVehicleId: vehicles.electronCapstone.id,
    launchSiteId: mahia.id,
    orbitId: lunar.id
  });

  await prisma.missionCrew.createMany({
    data: [
      { missionId: apollo11.id, astronautId: astronauts.armstrong.id, role: CrewRole.COMMANDER, seat: "CDR" },
      { missionId: apollo11.id, astronautId: astronauts.aldrin.id, role: CrewRole.PILOT, seat: "LMP" },
      { missionId: apollo11.id, astronautId: astronauts.collins.id, role: CrewRole.PILOT, seat: "CMP" },
      { missionId: demo2.id, astronautId: astronauts.hurley.id, role: CrewRole.COMMANDER, seat: "Commander" },
      { missionId: demo2.id, astronautId: astronauts.behnken.id, role: CrewRole.PILOT, seat: "Joint Ops Commander" }
    ]
  });

  await prisma.missionEvent.createMany({
    data: [
      { missionId: apollo11.id, type: EventType.LAUNCH, title: "Liftoff from LC-39A", occurredAt: apollo11.launchDate!, sequence: 1 },
      { missionId: apollo11.id, type: EventType.LANDING, title: "Eagle landed at Tranquility Base", occurredAt: date("1969-07-20T20:17:40Z"), sequence: 2 },
      { missionId: demo2.id, type: EventType.DOCKING, title: "Crew Dragon docked to ISS", occurredAt: date("2020-05-31T14:16:00Z"), sequence: 2 },
      { missionId: artemis1.id, type: EventType.ORBIT_INSERTION, title: "Outbound powered flyby completed", occurredAt: date("2022-11-21T12:44:00Z"), sequence: 2 },
      { missionId: jwst.id, type: EventType.DEPLOYMENT, title: "Sunshield deployment completed", occurredAt: date("2022-01-04T16:59:00Z"), sequence: 3 },
      { missionId: starlink.id, type: EventType.DEPLOYMENT, title: "Starlink satellites deployed", occurredAt: date("2023-02-28T00:18:00Z"), sequence: 2 },
      { missionId: chandrayaan3.id, type: EventType.LANDING, title: "Vikram soft-landed on the Moon", occurredAt: date("2023-08-23T12:33:00Z"), sequence: 3 },
      { missionId: ns23.id, type: EventType.ANOMALY, title: "Booster anomaly triggered capsule escape", occurredAt: date("2022-09-12T14:28:00Z"), sequence: 2 },
      { missionId: capstone.id, type: EventType.ORBIT_INSERTION, title: "CAPSTONE entered lunar NRHO", occurredAt: date("2022-11-13T00:00:00Z"), sequence: 4 }
    ]
  });

  await prisma.failureReport.create({
    data: {
      missionId: ns23.id,
      phase: "Ascent",
      rootCause: "Booster propulsion system anomaly during powered flight.",
      impact: "Booster mission failed; payload capsule escape system performed nominally and landed safely.",
      correctivePlan: "Propulsion and thermal-protection remediation followed by return-to-flight qualification.",
      severity: 4,
      reportedAt: date("2022-09-12T16:00:00Z")
    }
  });

  async function payload(input: {
    missionId: string;
    name: string;
    type: PayloadType;
    massKg?: number;
    customer?: string;
    purpose?: string;
    satellite?: {
      name: string;
      noradId?: number;
      bus?: string;
      operator?: string;
      massKg?: number;
      orbitId?: string;
      operational?: boolean;
    };
    instruments?: Array<{
      name: string;
      instrumentType: string;
      description?: string;
      principalInvestigator?: string;
    }>;
  }) {
    return prisma.payload.create({
      data: {
        missionId: input.missionId,
        name: input.name,
        type: input.type,
        massKg: input.massKg,
        customer: input.customer,
        purpose: input.purpose,
        satellite: input.satellite ? { create: input.satellite } : undefined,
        instruments: input.instruments ? { create: input.instruments } : undefined
      }
    });
  }

  await payload({
    missionId: apollo11.id,
    name: "Columbia and Eagle",
    type: PayloadType.CREW_MODULE,
    massKg: 49390,
    customer: "NASA",
    purpose: "Command, service, and lunar module stack for crewed lunar landing."
  });
  await payload({
    missionId: demo2.id,
    name: "Crew Dragon Endeavour",
    type: PayloadType.CREW_MODULE,
    massKg: 12520,
    customer: "NASA Commercial Crew",
    purpose: "Crew transport and ISS docking test."
  });
  await payload({
    missionId: artemis1.id,
    name: "Orion Crew Module",
    type: PayloadType.CREW_MODULE,
    massKg: 26000,
    customer: "NASA",
    purpose: "Uncrewed lunar return spacecraft qualification."
  });
  await payload({
    missionId: jwst.id,
    name: "James Webb Space Telescope",
    type: PayloadType.SATELLITE,
    massKg: 6161,
    customer: "NASA / ESA / CSA",
    purpose: "Infrared astronomical observatory.",
    satellite: {
      name: "JWST",
      bus: "Northrop Grumman Observatory Bus",
      operator: "Space Telescope Science Institute",
      massKg: 6161,
      orbitId: geoTransfer.id,
      operational: true
    },
    instruments: [
      { name: "NIRCam", instrumentType: "Infrared Camera", description: "Near-infrared imaging instrument." },
      { name: "MIRI", instrumentType: "Mid-Infrared Instrument", description: "Mid-infrared camera and spectrograph." }
    ]
  });
  await payload({
    missionId: starlink.id,
    name: "Starlink V2 Mini Stack",
    type: PayloadType.SATELLITE,
    massKg: 17600,
    customer: "SpaceX",
    purpose: "Broadband satellite constellation deployment.",
    satellite: {
      name: "Starlink Group 6-1 Lead Satellite",
      operator: "SpaceX",
      orbitId: leo.id,
      operational: true
    }
  });
  await payload({
    missionId: chandrayaan3.id,
    name: "Vikram Lander and Pragyan Rover",
    type: PayloadType.SCIENTIFIC_PACKAGE,
    massKg: 3900,
    customer: "ISRO",
    purpose: "Lunar landing and south-polar surface science.",
    instruments: [
      { name: "ChaSTE", instrumentType: "Thermal Probe", description: "Measures thermal conductivity and temperature." },
      { name: "APXS", instrumentType: "Spectrometer", description: "Analyzes lunar surface elemental composition." }
    ]
  });
  await payload({
    missionId: ns23.id,
    name: "NS-23 Research Payloads",
    type: PayloadType.SCIENTIFIC_PACKAGE,
    massKg: 36,
    customer: "Multiple research institutions",
    purpose: "Microgravity experiments and technology payloads."
  });
  await payload({
    missionId: capstone.id,
    name: "CAPSTONE CubeSat",
    type: PayloadType.SATELLITE,
    massKg: 25,
    customer: "NASA",
    purpose: "Cislunar navigation and NRHO operations demonstration.",
    satellite: {
      name: "CAPSTONE",
      bus: "12U CubeSat",
      operator: "Advanced Space",
      massKg: 25,
      orbitId: lunar.id,
      operational: true
    }
  });

  await prisma.telemetrySummary.createMany({
    data: [
      {
        missionId: apollo11.id,
        maxAltitudeKm: 400171,
        maxVelocityKps: 10.8,
        downlinkGb: 12,
        signalAvailability: 0.93,
        thermalStatus: "Nominal",
        powerStatus: "Nominal",
        propulsionStatus: "Nominal",
        lastContactAt: apollo11.endDate
      },
      {
        missionId: demo2.id,
        maxAltitudeKm: 422,
        maxVelocityKps: 7.66,
        downlinkGb: 980,
        signalAvailability: 0.99,
        thermalStatus: "Nominal",
        powerStatus: "Nominal",
        propulsionStatus: "Nominal",
        lastContactAt: demo2.endDate
      },
      {
        missionId: jwst.id,
        maxAltitudeKm: 1500000,
        maxVelocityKps: 9.9,
        downlinkGb: 5720,
        signalAvailability: 0.98,
        thermalStatus: "Cryogenic nominal",
        powerStatus: "Nominal",
        propulsionStatus: "Stationkeeping nominal",
        lastContactAt: date("2026-01-01T00:00:00Z")
      },
      {
        missionId: ns23.id,
        maxAltitudeKm: 11.4,
        maxVelocityKps: 0.62,
        downlinkGb: 0.8,
        signalAvailability: 0.71,
        thermalStatus: "Abort recovery nominal",
        powerStatus: "Capsule nominal",
        propulsionStatus: "Booster anomaly",
        lastContactAt: date("2022-09-12T14:40:00Z")
      }
    ]
  });

  console.log("AstraVault seed complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
