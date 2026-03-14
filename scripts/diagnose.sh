#!/usr/bin/env bash
# scripts/diagnose.sh
# Read-only diagnostics — changes nothing on VM.

set -euo pipefail

ENV_FILE="$(git rev-parse --show-toplevel)/.env.local"
[ -f "$ENV_FILE" ] || { echo "ERROR: .env.local not found."; exit 1; }
set -a; source "$ENV_FILE"; set +a

SSH="ssh -p ${VM_PORT} ${VM_USER}@${VM_HOST}"

BLUE='\033[0;34m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${BLUE}[→]${NC} $1"; }
ok()   { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }

echo ""
echo "══════════════════════════════════════════════"
echo "  Traefik + Seafile Diagnostics"
echo "══════════════════════════════════════════════"

echo ""
log "Container status:"
$SSH 'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"'

echo ""
log "Containers on traefik-public network:"
$SSH 'docker network inspect traefik-public --format "{{range .Containers}}  {{.Name}}{{println}}{{end}}" 2>/dev/null || echo "  traefik-public network not found"'

echo ""
log "Traefik last 30 log lines:"
$SSH 'docker logs traefik --tail 30 2>&1'

echo ""
log "SSL certificate status:"
$SSH 'ACME=~/traefik/letsencrypt/acme.json
if [ ! -f "$ACME" ]; then
    echo "  acme.json does not exist"
elif [ ! -s "$ACME" ]; then
    echo "  acme.json is EMPTY — no certs provisioned yet"
else
    echo "  acme.json size: $(wc -c < "$ACME") bytes"
    echo "  Permissions: $(stat -c "%a %U" "$ACME")"
    echo "  Domains:"
    cat "$ACME" | python3 -c "
import json,sys
try:
    d = json.load(sys.stdin)
    certs = d.get(\"letsencrypt\",{}).get(\"Certificates\",[])
    for c in certs:
        print(\"   \", c[\"domain\"][\"main\"])
    if not certs:
        print(\"    none yet\")
except Exception as e:
    print(\"    parse error:\", e)
"
fi'

echo ""
log "Hostname references in Seafile config files:"
$SSH '
    echo "  seahub_settings.py:"
    grep -E "SERVICE_URL|FILE_SERVER_ROOT|SITE_BASE" \
        ~/seafile/data/seafile/conf/seahub_settings.py 2>/dev/null \
        | sed "s/^/    /" || echo "    (not found)"

    echo "  ccnet.conf (conf/):"
    grep "SERVICE_URL" \
        ~/seafile/data/seafile/conf/ccnet.conf 2>/dev/null \
        | sed "s/^/    /" || echo "    (not found)"

    echo "  ccnet.conf (ccnet/):"
    grep "SERVICE_URL" \
        ~/seafile/data/seafile/ccnet/ccnet.conf 2>/dev/null \
        | sed "s/^/    /" || echo "    (not found)"

    echo "  nginx configs:"
    for conf in $(find ~/seafile/data/nginx -name "*.conf" 2>/dev/null); do
        MATCH=$(grep -n "server_name\|sushantgupta" "$conf" 2>/dev/null || true)
        if [ -n "$MATCH" ]; then
            echo "    $conf:"
            echo "$MATCH" | sed "s/^/      /"
        fi
    done
'

echo ""
log "Ports 80 and 443:"
$SSH 'ss -tlnp | grep -E ":80 |:443 " || echo "  Nothing listening"'

echo ""
log "Local images available:"
$SSH '
    echo "  ~/seafile/images/:"
    ls -lh ~/seafile/images/ 2>/dev/null | sed "s/^/    /" || echo "    (empty)"
    echo "  ~/traefik/images/:"
    ls -lh ~/traefik/images/ 2>/dev/null | sed "s/^/    /" || echo "    (empty)"
'

echo ""
log "Docker version:"
$SSH 'docker version --format "  Client: {{.Client.Version}}  Server: {{.Server.Version}}"'

echo ""
echo "══════════════════════════════════════════════"
echo "  Done."
echo "══════════════════════════════════════════════"