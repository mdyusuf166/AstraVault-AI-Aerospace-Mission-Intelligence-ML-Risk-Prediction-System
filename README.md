# AstraVault

AstraVault is a SQL-powered aerospace and space mission intelligence platform built with Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL, Prisma, NextAuth.js, Recharts, Leaflet, Zod, and role-based access control.

## Features

- Secure credentials authentication with roles: `ADMIN`, `RESEARCHER`, and `VIEWER`
- Mission database with PostgreSQL full-text search and filters by year, agency, company, rocket, status, destination, and orbit type
- Mission detail pages with crew, payloads, events, telemetry summaries, instruments, and failure reports
- Rockets, agencies, companies, astronauts, satellites, payloads, and launch site views
- Analytics dashboards for launch frequency, mission outcomes, agency comparison, orbit mix, and rocket reliability
- Leaflet launch site map backed by stored launch site coordinates
- Admin CRUD panel with audit logging for privileged actions
- REST API endpoints for missions, rockets, astronauts, agencies, companies, payloads, and analytics
- Seed data for NASA, SpaceX, ESA, ISRO, Blue Origin, Rocket Lab, and Arianespace

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- NextAuth.js credentials provider
- Recharts
- Leaflet / React Leaflet
- Zod

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Update `DATABASE_URL` in `.env` for your PostgreSQL database.

4. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Seed the database:

```bash
npm run seed
```

6. Start the development server:

```bash
npm run dev
```

The application runs at `http://localhost:3000`.

## Seeded Accounts

All seeded users use this password:

```text
AstraVault!2026
```

- Admin: `admin@astravault.dev`
- Researcher: `researcher@astravault.dev`
- Viewer: `viewer@astravault.dev`

## API Routes

Authenticated users can read from:

- `GET /api/missions`
- `GET /api/missions/:id`
- `GET /api/rockets`
- `GET /api/astronauts`
- `GET /api/agencies`
- `GET /api/companies`
- `GET /api/payloads`
- `GET /api/analytics`

Admins can write to:

- `POST /api/missions`
- `PATCH /api/missions/:id`
- `DELETE /api/missions/:id`
- `POST /api/rockets`
- `POST /api/astronauts`
- `POST /api/agencies`
- `POST /api/companies`
- `POST /api/payloads`

## Database Notes

The Prisma schema includes:

- `User`
- `Agency`
- `Company`
- `Mission`
- `Rocket`
- `LaunchVehicle`
- `Astronaut`
- `MissionCrew`
- `Payload`
- `Satellite`
- `LaunchSite`
- `Orbit`
- `MissionEvent`
- `FailureReport`
- `ScientificInstrument`
- `TelemetrySummary`
- `AuditLog`

The initial migration creates indexes for common filters and a PostgreSQL GIN full-text index on mission search fields.

## Production Checklist

- Replace `NEXTAUTH_SECRET` with a long random value.
- Use a managed PostgreSQL database with backups enabled.
- Run migrations during deployment.
- Restrict admin account provisioning.
- Put the app behind HTTPS.
- Review audit logs regularly for privileged mutations.
