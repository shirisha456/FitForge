# Phase 16 — Production deploy config

AWS EC2 deployment configuration: `docker-compose.prod.yml`, `nginx/nginx.prod.conf`, and two
ad-hoc PowerShell verification scripts. **Configuration only** — no real AWS resources were
touched, no certificates were issued, nothing was deployed.

## What was built

- **`docker-compose.prod.yml`** — an override that removes host port publishing from `db`/
  `redis` entirely (defense in depth beyond the security group), swaps nginx to the prod config,
  and adds a `profiles: ["tools"]`-gated `certbot` service invoked manually for cert
  issuance/renewal rather than started by `up -d`.
- **`nginx/nginx.prod.conf`** — HTTP→HTTPS redirect (with an ACME-challenge passthrough that
  must stay plain HTTP for certbot's renewal checks to work), and an HTTPS server block with the
  same `/api/v1/` routing split as the dev config.
- **`run_all_tests.ps1`** / **`run_verify.ps1`** — ad-hoc scripts a previous debugging session
  used to smoke-test a live deployment (docker compose up, wait for healthy, curl the health/
  ready endpoints, run pytest). Reproduced verbatim, hardcoded paths included, per an earlier
  explicit decision to keep fidelity even where source itself is messy.

## A disclosed, non-secret detail

`nginx.prod.conf` hardcodes `fitforge.18-221-88-168.sslip.io` — an
[sslip.io](https://sslip.io) hostname, which is a free wildcard-DNS service that resolves
`<anything>.<IP>.sslip.io` back to that literal IP. It's a real IP address embedded in a
hostname, not a credential or key, so it was safe to reproduce — but it does mean the config
reveals what was presumably a real (or attempted) EC2 instance's address.

## Validation

Merged `docker compose -f docker-compose.yml -f docker-compose.prod.yml config` and manually
inspected the output: confirmed `db`/`redis` have no `ports:` key at all in the merged config,
and `nginx` correctly shows both `80` and `443` published with the SSL cert paths and certbot
volumes mounted. Both PowerShell scripts were parsed (not executed — they hit real Docker/
network state) via PowerShell's own `Parser.ParseFile`, syntax-clean.
