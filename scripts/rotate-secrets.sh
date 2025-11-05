#!/usr/bin/env bash
set -euo pipefail

# This script helps you generate new strong secrets and outlines safe rotation steps.
# By default, it ONLY prints suggested new values. Nothing is changed automatically.
#
# If you want to also rotate Postgres user password in a local docker-compose stack,
# set ROTATE_DB_PASSWORD=1 and ensure docker compose is available and the stack is up.
#
# Usage:
#   ./scripts/rotate-secrets.sh
#   ROTATE_DB_PASSWORD=1 POSTGRES_USER=aurum NEW_PG_PASS=$(openssl rand -base64 36) ./scripts/rotate-secrets.sh

command -v openssl >/dev/null 2>&1 || { echo "openssl is required"; exit 1; }

new_jwt=$(openssl rand -base64 48 | tr -d '\n' )
new_pg=$(openssl rand -base64 36 | tr -d '\n' )
new_grafana=$(openssl rand -base64 24 | tr -d '\n' )

cat <<EOF
=== Suggested new secrets ===
JWT_SECRET="${new_jwt}"
POSTGRES_PASSWORD="${new_pg}"
GF_SECURITY_ADMIN_PASSWORD="${new_grafana}"

Next steps:
1) Update your secret store (GitHub Actions, Azure/K8s secrets, etc.) with the new values.
2) For docker-compose dev:
   - Update your .env (do not commit real secrets)
   - Recreate affected services:
     docker compose down
     docker compose up -d postgres
     # apply Prisma migrations if needed
     docker compose run --rm api npm run prisma:migrate:deploy
3) For production DB password rotation:
   - Create a new DB user with the new password and required privileges
   - Update application secret to use the new credentials
   - Cut traffic over
   - Drop or disable old user only after validating

EOF

if [[ "${ROTATE_DB_PASSWORD:-0}" == "1" ]]; then
  : "${POSTGRES_USER:?Set POSTGRES_USER}"
  : "${NEW_PG_PASS:?Set NEW_PG_PASS}"
  echo "Attempting local Postgres password rotation inside docker-compose..."
  docker compose exec -T postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB:-aurum911}" -c "ALTER USER \"${POSTGRES_USER}\" WITH PASSWORD '${NEW_PG_PASS}';" || {
    echo "Rotation via SQL failed (likely missing permissions or wrong user). Handle manually.";
  }
fi
