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
  await prisma.mLModelRun.deleteMany();
  await prisma.failurePattern.deleteMany();
  await prisma.rocketReliabilityScore.deleteMany();
  await prisma.missionPrediction.deleteMany();
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
  const heliocentric = await prisma.orbit.create({
    data: { name: "Heliocentric Transfer Orbit", type: OrbitType.SOLAR, apogeeKm: 260000000, perigeeKm: 147000000 }
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
  const starbase = await prisma.launchSite.create({
    data: {
      name: "SpaceX Starbase Orbital Launch Pad",
      code: "Starbase OLP",
      country: "United States",
      region: "Boca Chica, Texas",
      latitude: 25.9971,
      longitude: -97.1569
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
  const falconHeavy = await prisma.rocket.create({
    data: {
      name: "Falcon Heavy",
      manufacturer: "SpaceX",
      country: "United States",
      active: true,
      reusable: true,
      firstFlightYear: 2018,
      payloadLeoKg: 63800,
      payloadGtoKg: 26700,
      companyId: spacex.id
    }
  });
  const starship = await prisma.rocket.create({
    data: {
      name: "Starship",
      manufacturer: "SpaceX",
      country: "United States",
      active: true,
      reusable: true,
      firstFlightYear: 2023,
      payloadLeoKg: 150000,
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
    falconCrew1: await prisma.launchVehicle.create({
      data: { name: "Falcon 9", variant: "Block 5", serialNumber: "B1061", reusable: true, rocketId: falcon9.id, operatorId: spacex.id }
    }),
    falconCrs25: await prisma.launchVehicle.create({
      data: { name: "Falcon 9", variant: "Block 5", serialNumber: "B1067", reusable: true, rocketId: falcon9.id, operatorId: spacex.id }
    }),
    falconHeavyDemo: await prisma.launchVehicle.create({
      data: { name: "Falcon Heavy", variant: "Demo", serialNumber: "FH-001", reusable: true, rocketId: falconHeavy.id, operatorId: spacex.id }
    }),
    starshipIft1: await prisma.launchVehicle.create({
      data: { name: "Starship", variant: "S24 / Booster 7", serialNumber: "IFT-1", reusable: true, rocketId: starship.id, operatorId: spacex.id }
    }),
    starshipIft2: await prisma.launchVehicle.create({
      data: { name: "Starship", variant: "S25 / Booster 9", serialNumber: "IFT-2", reusable: true, rocketId: starship.id, operatorId: spacex.id }
    }),
    starshipIft3: await prisma.launchVehicle.create({
      data: { name: "Starship", variant: "S28 / Booster 10", serialNumber: "IFT-3", reusable: true, rocketId: starship.id, operatorId: spacex.id }
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
    }),
    hopkins: await prisma.astronaut.create({
      data: {
        name: "Michael Hopkins",
        nationality: "United States",
        agencyId: nasa.id,
        status: "Active",
        flights: 2,
        evaHours: 32.02,
        birthDate: date("1968-12-28T00:00:00Z"),
        bio: "NASA astronaut and SpaceX Crew-1 commander."
      }
    }),
    glover: await prisma.astronaut.create({
      data: {
        name: "Victor Glover",
        nationality: "United States",
        agencyId: nasa.id,
        status: "Active",
        flights: 1,
        evaHours: 26.12,
        birthDate: date("1976-04-30T00:00:00Z"),
        bio: "NASA astronaut, naval aviator, and Crew-1 pilot."
      }
    }),
    walker: await prisma.astronaut.create({
      data: {
        name: "Shannon Walker",
        nationality: "United States",
        agencyId: nasa.id,
        status: "Active",
        flights: 2,
        evaHours: 0,
        birthDate: date("1965-06-04T00:00:00Z"),
        bio: "NASA astronaut and Crew-1 mission specialist."
      }
    }),
    noguchi: await prisma.astronaut.create({
      data: {
        name: "Soichi Noguchi",
        nationality: "Japan",
        status: "Retired",
        flights: 3,
        evaHours: 20.08,
        birthDate: date("1965-04-15T00:00:00Z"),
        bio: "JAXA astronaut and Crew-1 mission specialist."
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

  const falconHeavyTest = await createMission({
    name: "Falcon Heavy Test Flight",
    program: "Falcon Heavy",
    description: "Demonstration launch of Falcon Heavy carrying a Tesla Roadster on a heliocentric trajectory.",
    objective: "Qualify Falcon Heavy ascent, booster separation, side-booster recovery, and upper-stage coast performance.",
    destination: "Heliocentric Orbit",
    status: MissionStatus.SUCCESS,
    launchDate: date("2018-02-06T20:45:00Z"),
    companyId: spacex.id,
    launchVehicleId: vehicles.falconHeavyDemo.id,
    launchSiteId: ksc39a.id,
    orbitId: heliocentric.id
  });

  const crew1 = await createMission({
    name: "SpaceX Crew-1",
    program: "Commercial Crew",
    description: "First operational Crew Dragon mission transporting four astronauts to the International Space Station.",
    objective: "Perform a long-duration crew rotation mission and validate regular Crew Dragon operations.",
    destination: "International Space Station",
    status: MissionStatus.SUCCESS,
    launchDate: date("2020-11-16T00:27:00Z"),
    endDate: date("2021-05-02T06:56:00Z"),
    agencyId: nasa.id,
    companyId: spacex.id,
    launchVehicleId: vehicles.falconCrew1.id,
    launchSiteId: ksc39a.id,
    orbitId: leo.id
  });

  const crs21 = await createMission({
    name: "SpaceX CRS-21",
    program: "Commercial Resupply Services",
    description: "First Cargo Dragon 2 resupply mission delivering science, supplies, and hardware to the ISS.",
    objective: "Deliver pressurized and unpressurized cargo and return experiment samples to Earth.",
    destination: "International Space Station",
    status: MissionStatus.SUCCESS,
    launchDate: date("2020-12-06T16:17:00Z"),
    endDate: date("2021-01-14T01:26:00Z"),
    agencyId: nasa.id,
    companyId: spacex.id,
    launchVehicleId: vehicles.falconDemo2.id,
    launchSiteId: ksc39a.id,
    orbitId: leo.id
  });

  const crs25 = await createMission({
    name: "SpaceX CRS-25",
    program: "Commercial Resupply Services",
    description: "Cargo Dragon resupply mission carrying Earth science, biology, and technology investigations to the ISS.",
    objective: "Transport research payloads and station supplies, then return cargo for analysis.",
    destination: "International Space Station",
    status: MissionStatus.SUCCESS,
    launchDate: date("2022-07-15T00:44:00Z"),
    endDate: date("2022-08-20T18:53:00Z"),
    agencyId: nasa.id,
    companyId: spacex.id,
    launchVehicleId: vehicles.falconCrs25.id,
    launchSiteId: ksc39a.id,
    orbitId: leo.id
  });

  const starshipIft1 = await createMission({
    name: "Starship Integrated Flight Test 1",
    program: "Starship",
    description: "First integrated Starship and Super Heavy launch attempt from Starbase.",
    objective: "Collect flight data across liftoff, ascent loads, staging environment, and vehicle control.",
    destination: "Suborbital Space",
    status: MissionStatus.FAILURE,
    launchDate: date("2023-04-20T13:33:00Z"),
    companyId: spacex.id,
    launchVehicleId: vehicles.starshipIft1.id,
    launchSiteId: starbase.id,
    orbitId: suborbital.id
  });

  const starshipIft2 = await createMission({
    name: "Starship Integrated Flight Test 2",
    program: "Starship",
    description: "Second integrated Starship test flight with hot-staging and extended ascent objectives.",
    objective: "Demonstrate hot-staging, gather upper-stage performance data, and refine vehicle control.",
    destination: "Suborbital Space",
    status: MissionStatus.PARTIAL,
    launchDate: date("2023-11-18T13:02:00Z"),
    companyId: spacex.id,
    launchVehicleId: vehicles.starshipIft2.id,
    launchSiteId: starbase.id,
    orbitId: suborbital.id
  });

  const starshipIft3 = await createMission({
    name: "Starship Integrated Flight Test 3",
    program: "Starship",
    description: "Third integrated Starship flight test reaching near-orbital velocity and demonstrating multiple in-space objectives.",
    objective: "Advance ascent, payload-door, propellant-transfer, and reentry data objectives.",
    destination: "Suborbital Space",
    status: MissionStatus.PARTIAL,
    launchDate: date("2024-03-14T13:25:00Z"),
    companyId: spacex.id,
    launchVehicleId: vehicles.starshipIft3.id,
    launchSiteId: starbase.id,
    orbitId: suborbital.id
  });

  await prisma.missionCrew.createMany({
    data: [
      { missionId: apollo11.id, astronautId: astronauts.armstrong.id, role: CrewRole.COMMANDER, seat: "CDR" },
      { missionId: apollo11.id, astronautId: astronauts.aldrin.id, role: CrewRole.PILOT, seat: "LMP" },
      { missionId: apollo11.id, astronautId: astronauts.collins.id, role: CrewRole.PILOT, seat: "CMP" },
      { missionId: demo2.id, astronautId: astronauts.hurley.id, role: CrewRole.COMMANDER, seat: "Commander" },
      { missionId: demo2.id, astronautId: astronauts.behnken.id, role: CrewRole.PILOT, seat: "Joint Ops Commander" },
      { missionId: crew1.id, astronautId: astronauts.hopkins.id, role: CrewRole.COMMANDER, seat: "Commander" },
      { missionId: crew1.id, astronautId: astronauts.glover.id, role: CrewRole.PILOT, seat: "Pilot" },
      { missionId: crew1.id, astronautId: astronauts.walker.id, role: CrewRole.MISSION_SPECIALIST, seat: "Mission Specialist" },
      { missionId: crew1.id, astronautId: astronauts.noguchi.id, role: CrewRole.MISSION_SPECIALIST, seat: "Mission Specialist" }
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
      { missionId: capstone.id, type: EventType.ORBIT_INSERTION, title: "CAPSTONE entered lunar NRHO", occurredAt: date("2022-11-13T00:00:00Z"), sequence: 4 },
      { missionId: falconHeavyTest.id, type: EventType.LAUNCH, title: "Falcon Heavy lifted off from LC-39A", occurredAt: falconHeavyTest.launchDate!, sequence: 1 },
      { missionId: falconHeavyTest.id, type: EventType.LANDING, title: "Side boosters landed at Landing Zones 1 and 2", occurredAt: date("2018-02-06T20:53:00Z"), sequence: 2 },
      { missionId: crew1.id, type: EventType.DOCKING, title: "Crew Dragon Resilience docked to ISS", occurredAt: date("2020-11-17T04:01:00Z"), sequence: 2 },
      { missionId: crs21.id, type: EventType.DOCKING, title: "Cargo Dragon autonomously docked to ISS", occurredAt: date("2020-12-07T18:40:00Z"), sequence: 2 },
      { missionId: crs25.id, type: EventType.DOCKING, title: "CRS-25 arrived at the ISS", occurredAt: date("2022-07-16T15:21:00Z"), sequence: 2 },
      { missionId: starshipIft1.id, type: EventType.ANOMALY, title: "Vehicle lost control before flight termination", occurredAt: date("2023-04-20T13:37:00Z"), sequence: 2 },
      { missionId: starshipIft2.id, type: EventType.STAGE_SEPARATION, title: "Hot-staging demonstrated during ascent", occurredAt: date("2023-11-18T13:04:00Z"), sequence: 2 },
      { missionId: starshipIft3.id, type: EventType.COMMUNICATION, title: "Upper stage reached coast phase before reentry loss", occurredAt: date("2024-03-14T13:35:00Z"), sequence: 3 }
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
  await prisma.failureReport.createMany({
    data: [
      {
        missionId: starshipIft1.id,
        phase: "Ascent",
        rootCause: "Multiple engine outages and vehicle control loss during integrated ascent.",
        impact: "Primary orbital attempt was not completed; launch pad and flight software changes were required.",
        correctivePlan: "Pad upgrades, engine reliability improvements, and hot-staging system updates.",
        severity: 4,
        reportedAt: date("2023-04-20T17:00:00Z")
      },
      {
        missionId: starshipIft2.id,
        phase: "Ascent / Coast",
        rootCause: "Booster rapid unscheduled disassembly after staging and upper-stage loss before planned splashdown.",
        impact: "Hot-staging objective succeeded, but full mission profile was not completed.",
        correctivePlan: "Propellant venting, control software, and vehicle hardware improvements for follow-on tests.",
        severity: 3,
        reportedAt: date("2023-11-18T18:00:00Z")
      }
    ]
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
  await payload({
    missionId: falconHeavyTest.id,
    name: "Tesla Roadster Demonstration Payload",
    type: PayloadType.TECHNOLOGY_DEMONSTRATOR,
    massKg: 1250,
    customer: "SpaceX",
    purpose: "Mass simulator and public demonstration payload for Falcon Heavy qualification."
  });
  await payload({
    missionId: crew1.id,
    name: "Crew Dragon Resilience",
    type: PayloadType.CREW_MODULE,
    massKg: 12520,
    customer: "NASA Commercial Crew",
    purpose: "Operational crew transport to the International Space Station."
  });
  await payload({
    missionId: crs21.id,
    name: "Cargo Dragon C208",
    type: PayloadType.CARGO,
    massKg: 2972,
    customer: "NASA CRS",
    purpose: "Station supplies, science investigations, and return cargo."
  });
  await payload({
    missionId: crs25.id,
    name: "Cargo Dragon C208 CRS-25",
    type: PayloadType.CARGO,
    massKg: 2630,
    customer: "NASA CRS",
    purpose: "Earth science, life science, and station maintenance payloads."
  });
  await payload({
    missionId: starshipIft1.id,
    name: "Starship S24 Test Article",
    type: PayloadType.TECHNOLOGY_DEMONSTRATOR,
    customer: "SpaceX",
    purpose: "Integrated vehicle flight-test instrumentation."
  });
  await payload({
    missionId: starshipIft2.id,
    name: "Starship S25 Test Article",
    type: PayloadType.TECHNOLOGY_DEMONSTRATOR,
    customer: "SpaceX",
    purpose: "Hot-staging and ascent performance demonstration instrumentation."
  });
  await payload({
    missionId: starshipIft3.id,
    name: "Starship S28 Test Article",
    type: PayloadType.TECHNOLOGY_DEMONSTRATOR,
    customer: "SpaceX",
    purpose: "Payload door, propellant transfer, coast, and reentry instrumentation."
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
      },
      {
        missionId: falconHeavyTest.id,
        maxAltitudeKm: 6950,
        maxVelocityKps: 10.7,
        downlinkGb: 35,
        signalAvailability: 0.96,
        thermalStatus: "Nominal",
        powerStatus: "Upper stage nominal",
        propulsionStatus: "Nominal"
      },
      {
        missionId: crew1.id,
        maxAltitudeKm: 422,
        maxVelocityKps: 7.66,
        downlinkGb: 1250,
        signalAvailability: 0.99,
        thermalStatus: "Nominal",
        powerStatus: "Nominal",
        propulsionStatus: "Nominal",
        lastContactAt: crew1.endDate
      },
      {
        missionId: crs21.id,
        maxAltitudeKm: 422,
        maxVelocityKps: 7.66,
        downlinkGb: 640,
        signalAvailability: 0.98,
        thermalStatus: "Nominal",
        powerStatus: "Nominal",
        propulsionStatus: "Nominal",
        lastContactAt: crs21.endDate
      },
      {
        missionId: starshipIft3.id,
        maxAltitudeKm: 234,
        maxVelocityKps: 7.3,
        downlinkGb: 90,
        signalAvailability: 0.82,
        thermalStatus: "Reentry data loss",
        powerStatus: "Nominal through coast",
        propulsionStatus: "Nominal ascent"
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
