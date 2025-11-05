# Secrets Rotation Guide

This document describes safe, practical steps to rotate critical secrets across environments.

## What to rotate

- JWT_SECRET (API token signing)
- Database credentials (PostgreSQL)
- Grafana admin password
- Third-party API keys (OpenAI, SendGrid, Twilio, etc.)

## Principles

- Never commit real secrets to the repo
- Prefer a central secret manager (GitHub Actions secrets, Azure Key Vault, etc.)
- Rotate gradually with overlap windows to avoid downtime
- For DB: prefer creating a new user, switch apps, then remove the old one

## Local/dev (docker-compose)

1) Generate new values
   - `./scripts/rotate-secrets.sh`
2) Update `.env` with the suggested values (do not commit)
3) Recreate services
   - `docker compose down`
   - `docker compose up -d postgres`
   - `docker compose run --rm api npm run prisma:migrate:deploy`

## CI (GitHub Actions)

- Go to repo Settings → Secrets and variables → Actions
- Update:
  - `JWT_SECRET`
  - `DATABASE_URL` or discrete DB vars (user, password, host)
  - `GF_SECURITY_ADMIN_PASSWORD`
- Re-run workflows to validate

## Production

1) Database password rotation (recommended pattern)
   - Create a new DB user with required privileges
   - Update application configuration to use the new user (secret manager)
   - Deploy and validate traffic with new creds
   - Remove/disable the old user after validation window

2) JWT secret rotation
   - If you rotate the JWT signing secret, tokens issued with the old secret will stop validating
   - Strategy options:
     - Use a key rotation scheme (kid header with multiple active keys)
     - Or roll on low-traffic window, force re-login

3) Third-party keys
   - Follow each provider’s rotation guide
   - Update secret manager, redeploy, and validate

## Automation helper

- `scripts/rotate-secrets.sh` prints strong secret suggestions and includes an optional guarded mode to attempt local Postgres password rotation.

## Observability

- Watch application errors after rotation (auth failures, DB auth errors)
- Check health/readiness endpoints
- Monitor Grafana dashboards and alerts
