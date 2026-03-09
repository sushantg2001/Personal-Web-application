# Makefile — personal-site
# Run from repo root in WSL2
#
# INFRASTRUCTURE
#   make vm-setup          First-time VM directory + file setup
#   make vm-sync           Sync latest infrastructure configs to VM
#   make traefik-up        Deploy/update Traefik on VM
#   make seafile-up        Deploy/update Seafile on VM
#
# MONITORING
#   make logs-traefik      Tail Traefik logs
#   make logs-seafile      Tail Seafile logs
#   make ps                Show all running containers on VM
#
# APP (once built)
#   make deploy            Copy blog from vault + push to trigger CI/CD
#   make dev               Run Next.js dev server locally
#
# VM
#   make ssh               SSH into VM
#   make vm-prune          Clean unused Docker images/volumes on VM

.PHONY: vm-setup vm-sync \
        traefik-up seafile-up dashboard-up \
        migrate-seafile \
        logs-traefik logs-seafile ps \
        deploy dev ssh vm-prune help

# ── Config ────────────────────────────────────────────────────────
VM_USER  := root
VM_HOST  := sushantgupta.cloud
VM_PORT  := 22
SSH      := ssh -p $(VM_PORT) $(VM_USER)@$(VM_HOST)
SCP      := scp -P $(VM_PORT)
INFRA    := ~/infrastructure        # path on VM

# ── VM First-Time Setup ───────────────────────────────────────────
vm-setup:
	@echo "→ Creating directory structure on VM..."
	$(SSH) "mkdir -p $(INFRA)/{traefik/config,traefik/letsencrypt,traefik/logs,seafile,dashboard,analytics,app}"
	@$(MAKE) vm-sync
	@echo ""
	@echo "✓ VM directories created and configs synced."
	@echo ""
	@echo "Next steps:"
	@echo "  1. Create $(INFRA)/seafile/.env on VM (see infrastructure/seafile/.env.example)"
	@echo "  2. Add DNS records in Hostinger (see README)"
	@echo "  3. make traefik-up"
	@echo "  4. make migrate-seafile"

# ── Sync infrastructure configs to VM ────────────────────────────
# Run after any change to infrastructure/ files
vm-sync:
	@echo "→ Syncing infrastructure configs to VM..."
	rsync -avz --delete \
		-e "ssh -p $(VM_PORT)" \
		./infrastructure/traefik/ \
		$(VM_USER)@$(VM_HOST):$(INFRA)/traefik/
	rsync -avz --delete \
		--exclude='.env' \
		-e "ssh -p $(VM_PORT)" \
		./infrastructure/seafile/ \
		$(VM_USER)@$(VM_HOST):$(INFRA)/seafile/
	rsync -avz --delete \
		-e "ssh -p $(VM_PORT)" \
		./infrastructure/dashboard/ \
		$(VM_USER)@$(VM_HOST):$(INFRA)/dashboard/ 2>/dev/null || true
	@echo "✓ Configs synced"

# ── Service management ────────────────────────────────────────────
traefik-up:
	$(SSH) "cd $(INFRA)/traefik && \
		touch letsencrypt/acme.json && \
		chmod 600 letsencrypt/acme.json && \
		docker compose pull && \
		docker compose up -d"

seafile-up:
	$(SSH) "cd $(INFRA)/seafile && docker compose pull && docker compose up -d"

dashboard-up:
	$(SSH) "cd $(INFRA)/dashboard && docker compose pull && docker compose up -d"

# ── Logs ─────────────────────────────────────────────────────────
logs-traefik:
	$(SSH) "docker logs -f traefik"

logs-seafile:
	$(SSH) "docker logs -f seafile"

logs-traefik-access:
	$(SSH) "tail -f $(INFRA)/traefik/logs/access.log"

# ── VM status ────────────────────────────────────────────────────
ps:
	$(SSH) "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

vm-prune:
	$(SSH) "docker system prune -f && docker volume prune -f"

# ── App (once Next.js is built) ───────────────────────────────────
deploy:
	@bash scripts/deploy.sh $(if $(m),"$(m)",)

dev:
	cd app && bun run dev

# ── VM access ────────────────────────────────────────────────────
ssh:
	$(SSH)

# ── Help ─────────────────────────────────────────────────────────
help:
	@grep -E '^[a-zA-Z_-]+:' Makefile | \
		grep -v '.PHONY' | \
		sed 's/:.*//' | \
		sort | \
		awk '{printf "  make %-20s\n", $$1}'