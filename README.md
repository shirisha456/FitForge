# FitForge

AI-Powered Fitness Platform — an independent, phase-by-phase reconstruction of
[shirisha456/FitForge](https://github.com/shirisha456/FitForge). See
[docs/case-study.md](docs/case-study.md) for how and why this was rebuilt the way it was.

## Stack

- **Backend:** FastAPI, SQLAlchemy 2.0 (async), Alembic, Celery, Redis, PostgreSQL 16
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Infra:** Docker Compose, nginx reverse proxy
- **CI:** GitHub Actions (lint, test, build)

## Phase status

| # | Phase | Status |
|---|-------|--------|
| 1 | Foundation & Auth | complete |
| 2 | Workouts | complete |
| 3 | Nutrition | complete |
| 4 | Progress | complete |
| 5 | Profile | complete |
| 6 | AI Coach | complete |
| 7 | Frontend Foundation & Auth UI | complete |
| 8 | Frontend Workouts | complete |
| 9 | Frontend Nutrition | complete |
| 10 | Frontend Progress | complete |
| 11 | Frontend Profile | complete |
| 12 | Frontend AI Coach | complete |
| 13 | Frontend Dashboard | complete |
| 14 | Docker & nginx | complete |
| 15 | CI | complete |
| 16 | Production deploy config | complete |

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
