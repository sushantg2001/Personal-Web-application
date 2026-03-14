#!/usr/bin/env bash
# scripts/secrets-check.sh
#
# Validates .env.local has all required keys set.
# Required keys must be set or the script exits with error.
# Optional keys warn but do not fail.
#
# USAGE:
#   ./scripts/secrets-check.sh

set -euo pipefail

ENV_FILE="$(git rev-parse --show-toplevel)/.env.local"

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}[✓]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }

if [ ! -f "$ENV_FILE" ]; then
    err ".env.local not found at repo root."
    echo "    Copy .env.example to .env.local and fill in values."
    exit 1
fi

set -a; source "$ENV_FILE"; set +a

echo ""
echo "Checking .env.local..."
echo ""

FAILED=0

# Required — script exits if any of these are missing
check_required() {
    local key="$1"
    local value="${!key:-}"
    if [ -z "$value" ]; then
        err "${key} — NOT SET (required)"
        FAILED=$((FAILED + 1))
    else
        local masked
        masked=$(echo "$value" | sed 's/./*/g' | cut -c1-8)
        ok "${key} = ${masked}..."
    fi
}

# Optional — warns but does not fail
check_optional() {
    local key="$1"
    local value="${!key:-}"
    if [ -z "$value" ]; then
        warn "${key} — not set (optional, needed when service is deployed)"
    else
        local masked
        masked=$(echo "$value" | sed 's/./*/g' | cut -c1-8)
        ok "${key} = ${masked}..."
    fi
}

echo "── VM Access ──────────────────────────────"
check_required "VM_USER"
check_required "VM_HOST"
check_required "VM_PORT"

echo ""
echo "── Traefik ────────────────────────────────"
check_required "TRAEFIK_DASHBOARD_PASSWORD_HASH"

echo ""
echo "── Seafile ────────────────────────────────"
check_required "SEAFILE_DB_ROOT_PASSWORD"
check_required "SEAFILE_ADMIN_EMAIL"
check_required "SEAFILE_ADMIN_PASSWORD"

echo ""
echo "── Umami (optional — needed when deploying analytics) ────────"
check_optional "UMAMI_DB_PASSWORD"
check_optional "UMAMI_APP_SECRET"

echo ""
echo "── Portainer (optional — needed when deploying dashboard) ────"
check_optional "PORTAINER_ADMIN_PASSWORD"

echo ""
if [ $FAILED -eq 0 ]; then
    ok "All required secrets present. Safe to run 'make secrets-push'."
else
    err "${FAILED} required secret(s) missing — fill them in .env.local"
    exit 1
fi
echo ""