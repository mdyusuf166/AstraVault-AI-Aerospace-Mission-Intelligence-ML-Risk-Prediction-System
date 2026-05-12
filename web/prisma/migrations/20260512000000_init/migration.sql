-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'RESEARCHER', 'VIEWER');
CREATE TYPE "AgencyType" AS ENUM ('GOVERNMENT', 'COMMERCIAL', 'INTERNATIONAL', 'UNIVERSITY');
CREATE TYPE "CompanyType" AS ENUM ('PRIVATE', 'PUBLIC', 'STATE_OWNED', 'NON_PROFIT');
CREATE TYPE "MissionStatus" AS ENUM ('PLANNED', 'ACTIVE', 'SUCCESS', 'FAILURE', 'PARTIAL');
CREATE TYPE "CrewRole" AS ENUM ('COMMANDER', 'PILOT', 'MISSION_SPECIALIST', 'PAYLOAD_SPECIALIST', 'FLIGHT_ENGINEER', 'TOURIST');
CREATE TYPE "PayloadType" AS ENUM ('SATELLITE', 'PROBE', 'CARGO', 'CREW_MODULE', 'SCIENTIFIC_PACKAGE', 'TECHNOLOGY_DEMONSTRATOR');
CREATE TYPE "OrbitType" AS ENUM ('LEO', 'MEO', 'GEO', 'HEO', 'POLAR', 'SSO', 'LUNAR', 'SOLAR', 'SUBORBITAL', 'INTERPLANETARY', 'UNKNOWN');
CREATE TYPE "EventType" AS ENUM ('LAUNCH', 'STAGE_SEPARATION', 'ORBIT_INSERTION', 'DOCKING', 'LANDING', 'DEPLOYMENT', 'ANOMALY', 'SCIENCE_OPERATION', 'COMMUNICATION');
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT,
    "type" "AgencyType" NOT NULL DEFAULT 'GOVERNMENT',
    "country" TEXT NOT NULL,
    "website" TEXT,
    "foundedYear" INTEGER,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ticker" TEXT,
    "type" "CompanyType" NOT NULL DEFAULT 'PRIVATE',
    "country" TEXT NOT NULL,
    "website" TEXT,
    "foundedYear" INTEGER,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Rocket" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "reusable" BOOLEAN NOT NULL DEFAULT false,
    "firstFlightYear" INTEGER,
    "payloadLeoKg" INTEGER,
    "payloadGtoKg" INTEGER,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Rocket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LaunchVehicle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variant" TEXT,
    "serialNumber" TEXT,
    "reusable" BOOLEAN NOT NULL DEFAULT false,
    "rocketId" TEXT NOT NULL,
    "operatorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LaunchVehicle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LaunchSite" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "country" TEXT NOT NULL,
    "region" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "agencyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LaunchSite_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Orbit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrbitType" NOT NULL,
    "inclinationDeg" DOUBLE PRECISION,
    "apogeeKm" INTEGER,
    "perigeeKm" INTEGER,
    "periodMinutes" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Orbit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Mission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "program" TEXT,
    "description" TEXT,
    "objective" TEXT,
    "destination" TEXT NOT NULL,
    "status" "MissionStatus" NOT NULL DEFAULT 'PLANNED',
    "launchDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "costUsdMillions" DOUBLE PRECISION,
    "agencyId" TEXT,
    "companyId" TEXT,
    "launchVehicleId" TEXT NOT NULL,
    "launchSiteId" TEXT NOT NULL,
    "orbitId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Astronaut" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "agencyId" TEXT,
    "bio" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "flights" INTEGER NOT NULL DEFAULT 0,
    "evaHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "birthDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Astronaut_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MissionCrew" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "astronautId" TEXT NOT NULL,
    "role" "CrewRole" NOT NULL,
    "seat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MissionCrew_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payload" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PayloadType" NOT NULL,
    "massKg" DOUBLE PRECISION,
    "customer" TEXT,
    "purpose" TEXT,
    "missionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Payload_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Satellite" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "noradId" INTEGER,
    "bus" TEXT,
    "operator" TEXT,
    "massKg" DOUBLE PRECISION,
    "payloadId" TEXT NOT NULL,
    "orbitId" TEXT,
    "operational" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Satellite_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MissionEvent" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "title" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "summary" TEXT,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MissionEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FailureReport" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "rootCause" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "correctivePlan" TEXT,
    "severity" INTEGER NOT NULL DEFAULT 3,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FailureReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ScientificInstrument" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "instrumentType" TEXT NOT NULL,
    "description" TEXT,
    "principalInvestigator" TEXT,
    "missionId" TEXT,
    "payloadId" TEXT,
    "satelliteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ScientificInstrument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TelemetrySummary" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "maxAltitudeKm" DOUBLE PRECISION,
    "maxVelocityKps" DOUBLE PRECISION,
    "downlinkGb" DOUBLE PRECISION,
    "signalAvailability" DOUBLE PRECISION,
    "thermalStatus" TEXT,
    "powerStatus" TEXT,
    "propulsionStatus" TEXT,
    "lastContactAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TelemetrySummary_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "actorId" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- Unique indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Agency_name_key" ON "Agency"("name");
CREATE UNIQUE INDEX "Agency_acronym_key" ON "Agency"("acronym");
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");
CREATE UNIQUE INDEX "Rocket_name_key" ON "Rocket"("name");
CREATE UNIQUE INDEX "LaunchVehicle_name_serialNumber_key" ON "LaunchVehicle"("name", "serialNumber");
CREATE UNIQUE INDEX "LaunchSite_name_key" ON "LaunchSite"("name");
CREATE UNIQUE INDEX "LaunchSite_code_key" ON "LaunchSite"("code");
CREATE UNIQUE INDEX "Orbit_name_key" ON "Orbit"("name");
CREATE UNIQUE INDEX "Mission_slug_key" ON "Mission"("slug");
CREATE UNIQUE INDEX "MissionCrew_missionId_astronautId_key" ON "MissionCrew"("missionId", "astronautId");
CREATE UNIQUE INDEX "Satellite_name_key" ON "Satellite"("name");
CREATE UNIQUE INDEX "Satellite_noradId_key" ON "Satellite"("noradId");
CREATE UNIQUE INDEX "Satellite_payloadId_key" ON "Satellite"("payloadId");
CREATE UNIQUE INDEX "TelemetrySummary_missionId_key" ON "TelemetrySummary"("missionId");

-- Secondary indexes
CREATE INDEX "Agency_country_idx" ON "Agency"("country");
CREATE INDEX "Company_country_idx" ON "Company"("country");
CREATE INDEX "Rocket_manufacturer_idx" ON "Rocket"("manufacturer");
CREATE INDEX "Rocket_active_idx" ON "Rocket"("active");
CREATE INDEX "LaunchVehicle_rocketId_idx" ON "LaunchVehicle"("rocketId");
CREATE INDEX "LaunchSite_country_idx" ON "LaunchSite"("country");
CREATE INDEX "Orbit_type_idx" ON "Orbit"("type");
CREATE INDEX "Mission_status_idx" ON "Mission"("status");
CREATE INDEX "Mission_launchDate_idx" ON "Mission"("launchDate");
CREATE INDEX "Mission_destination_idx" ON "Mission"("destination");
CREATE INDEX "Mission_agencyId_idx" ON "Mission"("agencyId");
CREATE INDEX "Mission_companyId_idx" ON "Mission"("companyId");
CREATE INDEX "Mission_launchVehicleId_idx" ON "Mission"("launchVehicleId");
CREATE INDEX "Mission_launchSiteId_idx" ON "Mission"("launchSiteId");
CREATE INDEX "Mission_orbitId_idx" ON "Mission"("orbitId");
CREATE INDEX "Astronaut_nationality_idx" ON "Astronaut"("nationality");
CREATE INDEX "Astronaut_agencyId_idx" ON "Astronaut"("agencyId");
CREATE INDEX "MissionCrew_astronautId_idx" ON "MissionCrew"("astronautId");
CREATE INDEX "Payload_type_idx" ON "Payload"("type");
CREATE INDEX "Payload_missionId_idx" ON "Payload"("missionId");
CREATE INDEX "Satellite_operator_idx" ON "Satellite"("operator");
CREATE INDEX "Satellite_orbitId_idx" ON "Satellite"("orbitId");
CREATE INDEX "MissionEvent_missionId_occurredAt_idx" ON "MissionEvent"("missionId", "occurredAt");
CREATE INDEX "MissionEvent_type_idx" ON "MissionEvent"("type");
CREATE INDEX "FailureReport_missionId_idx" ON "FailureReport"("missionId");
CREATE INDEX "FailureReport_severity_idx" ON "FailureReport"("severity");
CREATE INDEX "ScientificInstrument_instrumentType_idx" ON "ScientificInstrument"("instrumentType");
CREATE INDEX "ScientificInstrument_missionId_idx" ON "ScientificInstrument"("missionId");
CREATE INDEX "ScientificInstrument_payloadId_idx" ON "ScientificInstrument"("payloadId");
CREATE INDEX "ScientificInstrument_satelliteId_idx" ON "ScientificInstrument"("satelliteId");
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- Full-text mission search index
CREATE INDEX "Mission_search_idx" ON "Mission" USING GIN (
    to_tsvector(
        'english',
        coalesce("name", '') || ' ' ||
        coalesce("program", '') || ' ' ||
        coalesce("description", '') || ' ' ||
        coalesce("objective", '') || ' ' ||
        coalesce("destination", '')
    )
);

-- Foreign keys
ALTER TABLE "Rocket" ADD CONSTRAINT "Rocket_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LaunchVehicle" ADD CONSTRAINT "LaunchVehicle_rocketId_fkey" FOREIGN KEY ("rocketId") REFERENCES "Rocket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LaunchVehicle" ADD CONSTRAINT "LaunchVehicle_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LaunchSite" ADD CONSTRAINT "LaunchSite_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_launchVehicleId_fkey" FOREIGN KEY ("launchVehicleId") REFERENCES "LaunchVehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_launchSiteId_fkey" FOREIGN KEY ("launchSiteId") REFERENCES "LaunchSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_orbitId_fkey" FOREIGN KEY ("orbitId") REFERENCES "Orbit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Astronaut" ADD CONSTRAINT "Astronaut_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MissionCrew" ADD CONSTRAINT "MissionCrew_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MissionCrew" ADD CONSTRAINT "MissionCrew_astronautId_fkey" FOREIGN KEY ("astronautId") REFERENCES "Astronaut"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payload" ADD CONSTRAINT "Payload_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Satellite" ADD CONSTRAINT "Satellite_payloadId_fkey" FOREIGN KEY ("payloadId") REFERENCES "Payload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Satellite" ADD CONSTRAINT "Satellite_orbitId_fkey" FOREIGN KEY ("orbitId") REFERENCES "Orbit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MissionEvent" ADD CONSTRAINT "MissionEvent_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FailureReport" ADD CONSTRAINT "FailureReport_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScientificInstrument" ADD CONSTRAINT "ScientificInstrument_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ScientificInstrument" ADD CONSTRAINT "ScientificInstrument_payloadId_fkey" FOREIGN KEY ("payloadId") REFERENCES "Payload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ScientificInstrument" ADD CONSTRAINT "ScientificInstrument_satelliteId_fkey" FOREIGN KEY ("satelliteId") REFERENCES "Satellite"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TelemetrySummary" ADD CONSTRAINT "TelemetrySummary_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
