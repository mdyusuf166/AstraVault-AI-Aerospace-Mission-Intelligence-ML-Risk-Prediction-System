# AstraVault

AstraVault is a SQL-powered aerospace and AI mission intelligence platform built with Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL, Prisma, NextAuth.js, Recharts, Leaflet, Zod, FastAPI, and scikit-learn.

## Features

- Secure credentials authentication with roles: `ADMIN`, `RESEARCHER`, and `VIEWER`
- Mission database with PostgreSQL full-text search and filters by year, agency, company, rocket, status, destination, and orbit type
- Mission detail pages with crew, payloads, events, telemetry summaries, instruments, and failure reports
- Rockets, agencies, companies, astronauts, satellites, payloads, and launch site views
- Analytics dashboards for launch frequency, mission outcomes, agency comparison, orbit mix, and rocket reliability
- Leaflet launch site map backed by stored launch site coordinates
- Admin CRUD panel with audit logging for privileged actions on missions, rockets, agencies, companies, launch sites, and payloads
- REST API endpoints for missions, rockets, astronauts, agencies, companies, payloads, and analytics
- FastAPI ML service for mission success prediction, rocket reliability scoring, failure pattern analysis, risk explanations, and launch vehicle recommendations
- AI workbench pages at `/ai`, `/ai/predictions`, `/ai/rocket-reliability`, `/ai/failure-analysis`, and `/ai/launch-recommendation`
- Seed data for NASA, SpaceX, ESA, ISRO, Blue Origin, Rocket Lab, Apollo 11, Artemis I, Demo-2, Crew-1, CRS missions, Falcon Heavy, and Starship test flights

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
- Python FastAPI
- scikit-learn

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

   With Docker installed, you can start the included local PostgreSQL service:

```bash
docker compose up -d postgres
```

4. Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Seed the database:

```bash
npx prisma db seed
```

6. Start the development server:

```bash
npm run dev
```

The application runs at `http://localhost:3000`.

## ML Service

From the project root:

```bash
cd ml-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python train.py
uvicorn main:app --reload --port 8000
```

On macOS/Linux, activate with:

```bash
source venv/bin/activate
```

The ML service runs at `http://localhost:8000`. It reads `DATABASE_URL` from the root `.env`, trains from PostgreSQL mission data after migrations/seeding, and falls back to bundled development examples only when PostgreSQL is unavailable.

Open Prisma Studio with:

```bash
npx prisma studio
```

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
- `POST /api/ai/predict-mission-success`
- `GET /api/ai/rocket-reliability/:rocketId`
- `POST /api/ai/recommend-launch-vehicle`
- `GET /api/ai/failure-patterns`
- `POST /api/ai/mission-risk-analysis`

Admins can write to:

- `POST /api/missions`
- `PATCH /api/missions/:id`
- `DELETE /api/missions/:id`

Additional admin writes are available in the `/admin` server-action forms.

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
- `MLModelRun`
- `MissionPrediction`
- `RocketReliabilityScore`
- `FailurePattern`

The initial migration creates indexes for common filters and a PostgreSQL GIN full-text index on mission search fields.
The ML migration adds persistence for model runs, predictions, rocket scores, and failure clusters.

## Production Checklist

- Replace `NEXTAUTH_SECRET` with a long random value.
- Use a managed PostgreSQL database with backups enabled.
- Run migrations during deployment.
- Restrict admin account provisioning.
- Put the app behind HTTPS.
- Protect the ML service behind the same private network boundary as the Next.js app.
- Retrain and version ML artifacts as the mission dataset grows.
- Review audit logs regularly for privileged mutations.
