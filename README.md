````markdown
# 🚀 AstraVault

**AstraVault** is a SQL-powered aerospace and AI mission intelligence platform that combines structured space-mission data, interactive analytics, geospatial visualization, and machine-learning-driven mission analysis.

The platform is designed to provide a unified environment for exploring aerospace missions, launch vehicles, organizations, astronauts, payloads, launch sites, mission events, failures, telemetry, and AI-generated mission insights.

---

## 🌌 Overview

AstraVault combines a modern web application with a relational aerospace database and a dedicated machine-learning service.

```text
                    ┌─────────────────────┐
                    │     AstraVault      │
                    │  Mission Intelligence│
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
       Next.js Web App     PostgreSQL       FastAPI ML
             │                 │                 │
             │                 │                 ├── Mission Prediction
             │                 │                 ├── Rocket Reliability
             │                 │                 ├── Failure Analysis
             │                 │                 └── Launch Recommendation
             │                 │
             └────────────┬────┴─────────────────┘
                          │
                          ▼
                  Aerospace Intelligence
````

---

# ✨ Features

## 🔐 Authentication & Authorization

* Secure credentials-based authentication
* Role-based access control
* `ADMIN`
* `RESEARCHER`
* `VIEWER`
* Protected administrative operations
* Audit logging for privileged actions

---

## 🛰️ Mission Intelligence

Explore aerospace missions using structured PostgreSQL data.

Mission filtering and search support:

* Year
* Agency
* Company
* Rocket
* Mission status
* Destination
* Orbit type

Mission detail pages provide information including:

* Crew
* Payloads
* Mission events
* Telemetry summaries
* Scientific instruments
* Failure reports

---

## 🚀 Aerospace Database

AstraVault models a wide range of aerospace entities, including:

* Missions
* Rockets
* Launch vehicles
* Agencies
* Companies
* Astronauts
* Satellites
* Payloads
* Launch sites
* Orbits
* Mission events
* Failure reports
* Scientific instruments
* Telemetry summaries

---

# 📊 Analytics Dashboard

Interactive analytics provide insight into aerospace mission history and performance.

Available analytics include:

* Launch frequency
* Mission outcomes
* Agency comparisons
* Orbit distribution
* Rocket reliability
* Mission statistics

Charts and visualizations are powered by **Recharts**.

---

# 🗺️ Launch Site Map

AstraVault includes an interactive **Leaflet-based launch site map**.

Launch sites are backed by stored geographic coordinates, allowing users to explore aerospace launch infrastructure geographically.

---

# 🤖 AI & Machine Learning

A dedicated FastAPI machine-learning service provides aerospace intelligence capabilities.

### Mission Success Prediction

Estimate the probability of mission success using historical mission data.

### Rocket Reliability

Generate reliability scores for launch vehicles based on available mission history.

### Failure Pattern Analysis

Analyze historical failures and identify recurring patterns.

### Mission Risk Analysis

Generate structured explanations of potential mission risks.

### Launch Vehicle Recommendation

Recommend launch vehicles based on mission-related characteristics.

---

# 🧠 AI Workbench

AstraVault provides dedicated AI interfaces:

```text
/ai
/ai/predictions
/ai/rocket-reliability
/ai/failure-analysis
/ai/launch-recommendation
```

These interfaces provide a centralized environment for interacting with the platform's machine-learning capabilities.

---

# 🛠️ Technology Stack

## Frontend

* Next.js App Router
* TypeScript
* Tailwind CSS
* Recharts
* Leaflet
* React Leaflet

## Backend & Data

* PostgreSQL
* Prisma ORM
* NextAuth.js
* Zod
* REST APIs

## Machine Learning

* Python
* FastAPI
* scikit-learn

## Development & Infrastructure

* Docker
* Docker Compose
* Prisma Migrations
* PostgreSQL

---

# 🏗️ Project Architecture

```text
astravault/
│
├── app/
│   ├── ai/
│   ├── admin/
│   ├── missions/
│   └── ...
│
├── components/
│
├── lib/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed/
│
├── ml-service/
│   ├── main.py
│   ├── train.py
│   ├── requirements.txt
│   └── ...
│
├── public/
│
├── docker-compose.yml
├── .env.example
├── package.json
└── README.md
```

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd AstraVault
```

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Configure your PostgreSQL connection:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/astravault"
```

Also configure the required authentication secrets such as:

```env
NEXTAUTH_SECRET="your-secure-secret"
```

---

# 🐘 PostgreSQL with Docker

If Docker is installed, start the PostgreSQL service:

```bash
docker compose up -d postgres
```

---

# 🗄️ Database Setup

Generate the Prisma client:

```bash
npx prisma generate
```

Run the initial migration:

```bash
npx prisma migrate dev --name init
```

Seed the database:

```bash
npx prisma db seed
```

---

# ▶️ Start the Application

Run the Next.js development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🤖 Start the ML Service

Navigate to the ML service:

```bash
cd ml-service
```

Create a Python virtual environment:

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Train the model:

```bash
python train.py
```

Start FastAPI:

```bash
uvicorn main:app --reload --port 8000
```

The ML service will be available at:

```text
http://localhost:8000
```

The ML service reads `DATABASE_URL` from the root environment configuration and can train from PostgreSQL mission data after the database has been migrated and seeded.

---

# 🧪 Prisma Studio

To inspect and manage the PostgreSQL database visually:

```bash
npx prisma studio
```

---

# 👤 Seeded Accounts

The seeded development environment contains three roles:

| Role       | Account                     |
| ---------- | --------------------------- |
| Admin      | `admin@astravault.dev`      |
| Researcher | `researcher@astravault.dev` |
| Viewer     | `viewer@astravault.dev`     |

### Development Password

```text
AstraVault!2026
```

> ⚠️ These credentials are intended for development/testing only. Replace them before deploying to production.

---

# 🔌 API

Authenticated users can access mission and aerospace data through REST endpoints.

## Missions

```http
GET /api/missions
GET /api/missions/:id
```

## Rockets

```http
GET /api/rockets
```

## Astronauts

```http
GET /api/astronauts
```

## Agencies

```http
GET /api/agencies
```

## Companies

```http
GET /api/companies
```

## Payloads

```http
GET /api/payloads
```

## Analytics

```http
GET /api/analytics
```

---

# 🧠 AI API

### Mission Success Prediction

```http
POST /api/ai/predict-mission-success
```

### Rocket Reliability

```http
GET /api/ai/rocket-reliability/:rocketId
```

### Launch Vehicle Recommendation

```http
POST /api/ai/recommend-launch-vehicle
```

### Failure Pattern Analysis

```http
GET /api/ai/failure-patterns
```

### Mission Risk Analysis

```http
POST /api/ai/mission-risk-analysis
```

---

# 🔑 Admin Operations

Administrators can perform privileged mission operations.

```http
POST /api/missions
PATCH /api/missions/:id
DELETE /api/missions/:id
```

Additional administrative CRUD functionality is available through the `/admin` interface.

All privileged actions are designed to be recorded through audit logging.

---

# 🗃️ Database Schema

The Prisma schema contains models for:

```text
User
Agency
Company
Mission
Rocket
LaunchVehicle
Astronaut
MissionCrew
Payload
Satellite
LaunchSite
Orbit
MissionEvent
FailureReport
ScientificInstrument
TelemetrySummary
AuditLog
MLModelRun
MissionPrediction
RocketReliabilityScore
FailurePattern
```

The database also includes indexes for common mission filtering operations and PostgreSQL full-text search support for mission-related search fields.

---

# 🌍 Seeded Aerospace Data

The development database includes representative aerospace data involving organizations and missions such as:

* NASA
* SpaceX
* ESA
* ISRO
* Blue Origin
* Rocket Lab
* Apollo 11
* Artemis I
* Demo-2
* Crew-1
* CRS missions
* Falcon Heavy
* Starship test flights

This provides an initial dataset for experimentation with mission analytics and ML workflows.

---

# 🔬 Research & Intelligence Workflow

AstraVault is designed around a data-to-intelligence pipeline:

```text
Historical Mission Data
          │
          ▼
     PostgreSQL
          │
          ▼
     Data Processing
          │
          ▼
    Machine Learning
          │
     ┌────┼─────┐
     ▼    ▼     ▼
 Prediction Reliability Failure
     │    │     │
     └────┼─────┘
          ▼
    Mission Intelligence
          │
          ▼
     Visualization
          │
          ▼
   Researcher / Analyst
```

---

# 🔒 Security

Security considerations include:

* Role-based authorization
* Protected API routes
* Credential authentication
* Input validation with Zod
* Audit logging
* Restricted administrative operations
* Environment-based secret management

---

# 📈 Scalability Roadmap

For production deployment, the platform can be extended with:

* Managed PostgreSQL
* Database backups
* Redis caching
* Background ML jobs
* Model versioning
* Distributed analytics
* Message queues
* Cloud object storage
* CDN-based frontend delivery
* Private ML service networking
* Observability and monitoring
* Automated model retraining

---

# 🚀 Production Checklist

Before production deployment:

* [ ] Replace `NEXTAUTH_SECRET` with a strong random secret
* [ ] Use a managed PostgreSQL database
* [ ] Enable database backups
* [ ] Run Prisma migrations during deployment
* [ ] Secure administrative account provisioning
* [ ] Enable HTTPS
* [ ] Protect the ML service behind a private network
* [ ] Version ML models and training artifacts
* [ ] Monitor ML prediction performance
* [ ] Review audit logs regularly
* [ ] Remove development credentials
* [ ] Configure production environment variables

---

# 🔮 Future Improvements

Potential future capabilities include:

* Real-time mission tracking
* Live launch data integration
* Advanced satellite telemetry
* More sophisticated mission-success models
* Deep-learning-based failure prediction
* Time-series telemetry analysis
* Automated anomaly detection
* Mission digital twins
* Advanced geospatial analytics
* Satellite orbit visualization
* AI research assistant
* Natural-language aerospace database queries
* Automated mission reports
* Multi-model aerospace reasoning
* Historical mission knowledge graph

---

# 🎯 Project Goals

AstraVault aims to demonstrate how modern software engineering, relational databases, geospatial visualization, and machine learning can be combined into a unified aerospace intelligence platform.

The project focuses on:

* Aerospace data engineering
* Mission analytics
* AI-assisted decision support
* Machine learning
* Scientific data visualization
* Research-oriented software architecture
* Space technology exploration

---

# ⚠️ Disclaimer

AstraVault is a research and engineering project.

Its machine-learning predictions, reliability scores, risk analyses, and recommendations should **not** be treated as authoritative aerospace safety decisions or operational launch guidance.

Real aerospace systems require validated datasets, domain-expert review, rigorous verification, simulation, safety analysis, certification, and operational procedures.

---

# 👨‍💻 Author

**M D Yousuf**

Computer Science & Engineering Student

Interests:

> AI • AGI • Aerospace • Space Systems • Quantum Computing • Robotics • Biomedical AI • Cybersecurity • Scientific Computing

---

# ⭐ Project Vision

> **AstraVault — turning aerospace mission data into intelligent spaceflight insights.**

The long-term vision is to evolve AstraVault from a mission database and analytics platform into a comprehensive **AI-powered aerospace research and mission intelligence system**.

```
```
