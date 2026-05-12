import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length ? value : undefined))
  .optional();

const nullableId = z
  .string()
  .trim()
  .transform((value) => (value.length ? value : undefined))
  .optional();

const optionalNumber = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return undefined;
  return value;
}, z.coerce.number().optional());

const optionalInt = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return undefined;
  return value;
}, z.coerce.number().int().optional());

const formBoolean = (defaultValue: boolean) =>
  z.preprocess((value) => {
    if (value === undefined || value === null || value === "") return defaultValue;
    return value === true || value === "true" || value === "on" || value === "1";
  }, z.boolean());

export const loginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8)
});

export const missionFilterSchema = z.object({
  q: optionalText,
  year: z.coerce.number().int().min(1957).max(2200).optional(),
  agencyId: nullableId,
  companyId: nullableId,
  rocketId: nullableId,
  status: z.enum(["PLANNED", "ACTIVE", "SUCCESS", "FAILURE", "PARTIAL"]).optional(),
  destination: optionalText,
  orbitType: z.enum(["LEO", "MEO", "GEO", "HEO", "POLAR", "SSO", "LUNAR", "SOLAR", "SUBORBITAL", "INTERPLANETARY", "UNKNOWN"]).optional()
});

export const missionSchema = z.object({
  name: z.string().trim().min(2).max(120),
  program: optionalText,
  description: optionalText,
  objective: optionalText,
  destination: z.string().trim().min(2).max(80),
  status: z.enum(["PLANNED", "ACTIVE", "SUCCESS", "FAILURE", "PARTIAL"]),
  launchDate: z
    .string()
    .trim()
    .transform((value) => (value ? new Date(value) : undefined))
    .optional(),
  endDate: z
    .string()
    .trim()
    .transform((value) => (value ? new Date(value) : undefined))
    .optional(),
  costUsdMillions: optionalNumber.pipe(z.number().nonnegative().optional()),
  agencyId: nullableId,
  companyId: nullableId,
  launchVehicleId: z.string().min(1),
  launchSiteId: z.string().min(1),
  orbitId: nullableId
});

export const rocketSchema = z.object({
  name: z.string().trim().min(2).max(100),
  manufacturer: z.string().trim().min(2).max(100),
  country: z.string().trim().min(2).max(80),
  active: formBoolean(true),
  reusable: formBoolean(false),
  firstFlightYear: optionalInt.pipe(z.number().int().min(1900).max(2200).optional()),
  payloadLeoKg: optionalInt.pipe(z.number().int().nonnegative().optional()),
  payloadGtoKg: optionalInt.pipe(z.number().int().nonnegative().optional()),
  companyId: nullableId
});

export const agencySchema = z.object({
  name: z.string().trim().min(2).max(120),
  acronym: optionalText,
  type: z.enum(["GOVERNMENT", "COMMERCIAL", "INTERNATIONAL", "UNIVERSITY"]).default("GOVERNMENT"),
  country: z.string().trim().min(2).max(80),
  website: optionalText,
  foundedYear: optionalInt.pipe(z.number().int().min(1800).max(2200).optional()),
  description: optionalText
});

export const companySchema = z.object({
  name: z.string().trim().min(2).max(120),
  ticker: optionalText,
  type: z.enum(["PRIVATE", "PUBLIC", "STATE_OWNED", "NON_PROFIT"]).default("PRIVATE"),
  country: z.string().trim().min(2).max(80),
  website: optionalText,
  foundedYear: optionalInt.pipe(z.number().int().min(1800).max(2200).optional()),
  description: optionalText
});

export const astronautSchema = z.object({
  name: z.string().trim().min(2).max(120),
  nationality: z.string().trim().min(2).max(80),
  agencyId: nullableId,
  bio: optionalText,
  status: z.string().trim().min(2).max(60).default("Active"),
  flights: z.coerce.number().int().nonnegative().default(0),
  evaHours: z.coerce.number().nonnegative().default(0),
  birthDate: z
    .string()
    .trim()
    .transform((value) => (value ? new Date(value) : undefined))
    .optional()
});

export const payloadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  type: z.enum(["SATELLITE", "PROBE", "CARGO", "CREW_MODULE", "SCIENTIFIC_PACKAGE", "TECHNOLOGY_DEMONSTRATOR"]),
  massKg: optionalNumber.pipe(z.number().nonnegative().optional()),
  customer: optionalText,
  purpose: optionalText,
  missionId: z.string().min(1)
});

export const launchSiteSchema = z.object({
  name: z.string().trim().min(2).max(160),
  code: optionalText,
  country: z.string().trim().min(2).max(80),
  region: optionalText,
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  agencyId: nullableId
});
