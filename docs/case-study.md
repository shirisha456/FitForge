# Case Study — Rebuilding FitForge

## What this is

This repository is an independent, from-scratch reconstruction of
[shirisha456/FitForge](https://github.com/shirisha456/FitForge), built phase-by-phase rather
than as a single copy. The goal was strict fidelity to the source's behavior, architecture, and
API contracts — not a redesign, refactor, or modernization — while producing clean, reviewable
history: one phase per commit, each independently validated.

## Why phase-by-phase

The source repository's git history doesn't document *how* the app was built — the bulk of the
code landed in a single "Initial commit," with only a handful of small follow-ups after. That
made the commit log useless as a build order to replay. Instead, the phase plan was derived from
the codebase's own natural dependency structure: the six Alembic migrations (`001` auth →
`002` email/password tokens → `003` workouts → `004` nutrition → `005` progress → `006` profile)
gave a clear backend module order, and the frontend phases followed the same order once the
corresponding backend API existed to build against.

Every phase followed the same discipline: read the exact source files for that phase, reproduce
them verbatim, validate with the strongest check reasonably available (real Postgres/Redis via
an isolated Docker network namespace, real `pytest`/`npm run build`, and for every frontend
phase, an actual browser session against a live backend), then stop for review before continuing.

## What "fidelity" meant in practice

Two genuine deviations from a byte-for-byte copy were made, both disclosed at the time:

1. **`auth/routes.py`'s `/me.has_profile`** was hardcoded `False` in Phase 1 and wired to the
   real `profile` module in Phase 5 — not a guess, but a reproduction of a real intermediate
   state visible in the source project's own commit history ("Wires up /auth/me's has_profile
   field, previously hardcoded to false since the auth module was first built").
2. **A speculative addition was caught and reverted during Phase 2's planning**, not shipped: an
   initial belief that the `exercises` table had no seed mechanism turned out to be wrong —
   migration `003_workouts.py` already seeds it via `op.bulk_insert`. No new script was added.

Everything else — including a handful of real rough edges — was reproduced exactly as found:

- **The dashboard's "Soon" buttons** (Phase 13) are disabled for features that are actually
  fully built and linked elsewhere in the app, apparently leftover placeholder UI never wired
  up after the real features shipped.
- **No `.dockerignore` anywhere in the repository** (Phase 14), which makes the frontend Docker
  build transfer `node_modules` as build context — slow, but correct.
- **`run_all_tests.ps1`/`run_verify.ps1`** (Phase 16) hardcode a different machine's path
  (`C:\Users\Shirisha\fitforge\...`) and were kept exactly as-is rather than "fixed" to match
  this repository's actual location.

## Infrastructure discipline

Every phase that needed real Postgres/Redis used an isolated Docker network namespace with no
host port bindings at all, specifically to avoid colliding with other unrelated projects already
running on the same machine (which, on the very first phase, briefly connected a test run to a
different project's real database by accident, caught and safely rolled back by Postgres's own
transactional DDL — see [Phase 1](phase1.md) for the incident and the isolation pattern adopted
afterward for every subsequent phase).

## Result

A 44-route Next.js frontend, a 6-module async FastAPI backend, a full Docker Compose stack, CI,
and production deploy config — built across 16 phases plus documentation, validated end to end
in real containers, not just unit tests, at every infrastructure milestone.
