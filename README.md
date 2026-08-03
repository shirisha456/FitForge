# FitForge

**Live at: [fitforge.18-221-88-168.sslip.io](https://fitforge.18-221-88-168.sslip.io)** — deployed
on an AWS EC2 instance behind nginx, with a real Let's Encrypt HTTPS certificate.

AI-Powered Fitness Platform — a full-stack app for tracking workouts, nutrition, and body
progress, with an AI coach for generating workouts and meal plans and answering fitness
questions. Built phase-by-phase, one module at a time, each validated end to end before moving
on. See [docs/case-study.md](docs/case-study.md) for the engineering approach behind it.

## Screenshots
<img width="1010" height="747" alt="image" src="https://github.com/user-attachments/assets/6a111d38-c7ee-4be7-8781-e46abb0d6adc" />


<img width="1638" height="657" alt="image" src="https://github.com/user-attachments/assets/63e5c09e-c3c2-4eb2-9b77-b1509ac89789" />

<img width="1559" height="530" alt="image" src="https://github.com/user-attachments/assets/d1956bb7-787f-40db-846f-4d85eab61c00" />

<img width="1143" height="768" alt="image" src="https://github.com/user-attachments/assets/b7e13992-2c80-4e25-84fd-98ee49ae7ea2" />


## Stack

- **Backend:** FastAPI, SQLAlchemy 2.0 (async), Alembic, Celery, Redis, PostgreSQL 16
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Infra:** Docker Compose, nginx reverse proxy
- **CI:** GitHub Actions (lint, test, build)

## Phase status

| # | Phase | Description | Status |
|---|-------|--------------|--------|
| 1 | Foundation & Auth | Users, JWT access/refresh tokens with rotation and reuse detection, Argon2 password hashing, email verification | complete |
| 2 | Workouts | Exercise library, workout CRUD, workout-exercise ownership validation | complete |
| 3 | Nutrition | Meals, water entries, daily nutrition summary | complete |
| 4 | Progress | Body measurements, goals | complete |
| 5 | Profile | Single-row-per-user profile, wired into `/auth/me` | complete |
| 6 | AI Coach | OpenAI-backed workout/meal generation and chat, with graceful degradation on API failures | complete |
| 7 | Frontend Foundation & Auth UI | Next.js BFF pattern, httpOnly cookie sessions, login/register/password-reset pages | complete |
| 8 | Frontend Workouts | Workout list/detail/create/edit pages, exercise picker | complete |
| 9 | Frontend Nutrition | Meal CRUD pages, water quick-add, daily summary | complete |
| 10 | Frontend Progress | Weight chart, measurement and goal forms | complete |
| 11 | Frontend Profile | Profile form with server-side pre-population | complete |
| 12 | Frontend AI Coach | Workout/meal generation UI, chat interface | complete |
| 13 | Frontend Dashboard | Cross-module summary cards, quick actions | complete |
| 14 | Docker & nginx | Full Compose stack, nginx path-based routing between BFF and API | complete |
| 15 | CI | GitHub Actions: lint, test, build for both backend and frontend | complete |
| 16 | Production deploy config | HTTPS via Let's Encrypt, production Compose override, deployment verification scripts | complete |

See [docs/phase1.md](docs/phase1.md) through [docs/phase16.md](docs/phase16.md) for what was
built in each phase and how it was validated. Case study: [docs/case-study.md](docs/case-study.md).

## Quick start

### 1. Clone and configure

```bash
git clone <repo-url> fitforge
cd fitforge
cp .env.example .env
```

Edit `.env` and set a secure `SECRET_KEY`.

### 2. Run with Docker Compose

```bash
docker compose up --build
```

Services:

| Service  | Description              |
|----------|---------------------------|
| nginx    | http://localhost (port 80) |
| api      | FastAPI backend          |
| frontend | Next.js app              |
| worker   | Celery worker            |
| beat     | Celery beat scheduler    |
| db       | PostgreSQL 16            |
| redis    | Redis 7                  |

### 3. Verify

- Frontend: http://localhost
- Health: http://localhost/api/v1/health
- Readiness: http://localhost/api/v1/ready
- API docs (dev): http://localhost/api/docs
- Mailhog UI: http://localhost:8025

### Environment notes

| Context | `DATABASE_URL` host | `REDIS_URL` host |
|---------|---------------------|------------------|
| Docker Compose | `db` (forced in compose `environment:`) | `redis` |
| Local pytest / uvicorn | `localhost` (`backend/.env` or `tests/conftest.py`) | `localhost` |

`CORS_ORIGINS` must be **comma-separated**, not JSON:
`CORS_ORIGINS=http://localhost:3000,http://localhost`

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e ".[dev]"

# Ensure PostgreSQL and Redis are running (docker compose up -d db redis), then:
export DATABASE_URL=postgresql+asyncpg://fitforge:fitforge@localhost:5432/fitforge
export REDIS_URL=redis://localhost:6379/0
export SECRET_KEY=dev-secret-key-change-me
export ENVIRONMENT=development

alembic upgrade head
uvicorn app.main:app --reload --port 8000
pytest -v
ruff check .
```

### Auth smoke test (after API is up)

```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.com","password":"SecurePass123!","password_confirm":"SecurePass123!"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.com","password":"SecurePass123!"}'

# Me (replace TOKEN)
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8000/api` for direct API access during local dev.

## Project Structure

```
fitforge/
├── backend/          # FastAPI application
├── frontend/         # Next.js application
├── nginx/            # Reverse proxy config
├── .github/workflows # CI pipelines
├── docs/             # Architecture, API reference, ADRs, phase write-ups, case study
└── docker-compose.yml
```

## Architecture

- [docs/architecture.md](docs/architecture.md) — system diagrams and module layout
- [docs/api.md](docs/api.md) — API reference
- [docs/case-study.md](docs/case-study.md) — engineering case study
- [docs/adr/](docs/adr/) — architecture decision records

## License

Proprietary — FitForge
