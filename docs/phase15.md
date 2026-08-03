# Phase 15 — CI

A single file: `.github/workflows/ci.yml`.

## What was built

Two jobs, both running on every push/PR to `main`:

- **`backend`** — spins up real Postgres 16 and Redis 7 service containers, then
  `ruff check .` and `pytest -v` against them.
- **`frontend`** — `npm ci`, `npm run lint`, `npm run build`.

No deploy job in this workflow. (Unlike the earlier llm-api-gateway rebuild, whose source had a
CI-triggered deploy step that turned out to have never actually succeeded, this project's CI
was never wired to deploy at all — `docker-compose.prod.yml` and the AWS EC2 setup in Phase 16
are applied manually, not from CI.)

## Validation

YAML syntax validated. Every command this workflow runs — `ruff check .`, `pytest -v`,
`npm run lint`, `npm run build` — had already been proven to pass repeatedly against this exact
codebase across Phases 1–13's own validation, with matching environment variables. Since this
repo has no GitHub remote yet, an actual live Actions run isn't something I could trigger.
