# Makefile
# Run from repo root in WSL2.
#
# SEPARATION OF CONCERNS:
#   vm-sync      → uploads non-secret config files (traefik configs, seafile conf/*)
#   secrets-push → uploads secret files (traefik auth.yml, seafile .env)
#   These never touch the same files so they never conflict.
#
# NEVER TOUCHED by any make target:
#   ~/seafile/data/    (Seafile files)
#   ~/seafile/mysql/   (database)
#   ~/traefik/letsencrypt/  (SSL certs)

ifneq (,$(wildcard .env.local))
    include .env.local
    export
endif

VM_USER ?= root
VM_HOST  ?= sushantgupta.cloud
VM_PORT  ?= 22
SSH       := ssh -p $(VM_PORT) $(VM_USER)@$(VM_HOST)
SSHT      := ssh -t -p $(VM_PORT) $(VM_USER)@$(VM_HOST)
SCP       := scp -P $(VM_PORT)

.PHONY: vm-setup vm-sync vm-status vm-prune \
        traefik-up traefik-restart \
        seafile-up seafile-restart seafile-down seafile-load-images seafile-snapshot seafile-restore\
        website-sync website-up website-down website-restart \
		chat-up chat-down chat-restart \
        secrets-check secrets-push secrets-push-traefik secrets-push-seafile \
        diagnose logs-traefik logs-seafile \
        ssh help

# ══════════════════════════════════════════════════════════════════
# HELP
# ══════════════════════════════════════════════════════════════════
help:
	@echo ""
	@echo "SETUP"
	@echo "  make vm-setup              First-time VM setup"
	@echo "  make vm-sync               Upload config files (never touches data/)"
	@echo "  make vm-status             Show running containers"
	@echo "  make vm-prune              Remove unused images only"
	@echo ""
	@echo "TRAEFIK"
	@echo "  make traefik-up            Deploy Traefik from local image"
	@echo "  make traefik-restart       Restart Traefik"
	@echo ""
	@echo "SEAFILE"
	@echo "  make seafile-up            Load images + start Seafile"
	@echo "  make seafile-load-images   Load images from tarballs only"
	@echo "  make seafile-restart       Restart Seafile containers"
	@echo "  make seafile-down          Stop Seafile "
	@echo "  make seafile-snapshot      Snapshot conf files from VM to local"
	@echo "  make seafile-restore          Snapshot conf files from local to vm"
	@echo ""
	@echo "WEBSITE"
	@echo "  make website-dev           Start website in development mode"
	@echo "  make website-sync          Sync website docker to VM"
	@echo "  make website-up            website up"
	@echo "  make website-down          website down"
	@echo "  make website-restart       website restart"
	@echo "  make website-logs          docker logs for website container"
	@echo ""
	@echo "CHAT"
	@echo " make chat-up                Start open WebUI"
	@echo " make chat-down              Stop open WebUI"
	@echo " make chat-up                Restart open WebUI"
	@echo ""
	@echo "BLOG PUBLISHING"
	@echo "  make publish          		publish blog posts from Obsidian to website"
	@echo ""
	@echo "SECRETS (credentials only)"
	@echo "  make secrets-check          Verify .env.local is complete"
	@echo "  make secrets-push           Push all secrets to VM"
	@echo "  make secrets-push-traefik   Push Traefik auth only"
	@echo "  make secrets-push-seafile   Push Seafile .env only"
	@echo "  make secrets-push-openwebui Push openWebUI .env only"
	@echo "  make secrets-pull           Pull VM secrets back for review"
	@echo ""
	@echo "LOGS & DEBUG"
	@echo "  make diagnose              Run full diagnostics"
	@echo "  make logs-traefik          Tail Traefik logs"
	@echo "  make logs-seafile          Tail Seafile logs"
	@echo "  make ssh                   SSH into VM"
	@echo ""

# ══════════════════════════════════════════════════════════════════
# ACCESS
# ══════════════════════════════════════════════════════════════════
ssh:
	$(SSHT)

# ══════════════════════════════════════════════════════════════════
# VM SETUP
# ══════════════════════════════════════════════════════════════════

# First-time setup. mkdir -p never deletes anything.
vm-setup:
	@echo "→ Creating directory structure on VM..."
	$(SSH) 'mkdir -p \
		~/traefik/config \
		~/traefik/letsencrypt \
		~/traefik/logs \
		~/traefik/images \
		~/seafile/images \
		~/openWebUI/'
	@$(MAKE) vm-sync
	@echo "✓ VM ready."

# ══════════════════════════════════════════════════════════════════
# VM SYNC — non-secret config files only
# Each file is uploaded individually via scp.
# NEVER deletes anything. NEVER touches data/, mysql/, letsencrypt/.
#
# Traefik:
#   docker-compose.yml  → ~/traefik/docker-compose.yml
#   traefik.yml         → ~/traefik/traefik.yml
#   config/dynamic.yml  → ~/traefik/config/dynamic.yml  (non-secret only)
#   (auth.yml is written by secrets-push, NOT by vm-sync)
#
# Seafile:
#   docker-compose.yml  → ~/seafile/docker-compose.yml
#   conf/*              → ~/seafile/conf/*
# ══════════════════════════════════════════════════════════════════
vm-sync:
	@echo "→ Uploading Traefik configs..."
	$(SCP) infrastructure/traefik/docker-compose.yml \
		$(VM_USER)@$(VM_HOST):~/traefik/docker-compose.yml
	$(SCP) infrastructure/traefik/traefik.yml \
		$(VM_USER)@$(VM_HOST):~/traefik/traefik.yml
	$(SCP) infrastructure/traefik/config/dynamic.yml \
		$(VM_USER)@$(VM_HOST):~/traefik/config/dynamic.yml

	@echo "→ Uploading Seafile compose..."
	$(SCP) infrastructure/seafile/docker-compose.yml \
		$(VM_USER)@$(VM_HOST):~/seafile/docker-compose.yml

	@echo "→ Uploading openWebUI compose..."
	$(SCP) infrastructure/openWebUI/docker-compose.yml \
		$(VM_USER)@$(VM_HOST):~/openWebUI/docker-compose.yml

	@echo "✓ Traefik files uploaded"
	@echo "✓ Seafile and openWebUI compose uploaded"
	@echo "  Seafile conf files are managed by Seafile itself"
	@echo "  Use: make seafile-snapshot to copy conf files to local"

vm-status:
	$(SSH) 'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"'

# Images only — volumes never touched
vm-prune:
	$(SSH) 'docker image prune -f'
	@echo "✓ Unused images removed. Volumes untouched."


# ══════════════════════════════════════════════════════════════════
# TRAEFIK
# ══════════════════════════════════════════════════════════════════
traefik-up:
	$(SSH) 'cd ~/traefik && \
		touch letsencrypt/acme.json && \
		chmod 600 letsencrypt/acme.json && \
		docker load -i ~/traefik/images/traefik-v2.11.tar && \
		docker compose up -d'

traefik-restart:
	$(SSH) 'cd ~/traefik && docker compose restart'

# ══════════════════════════════════════════════════════════════════
# SEAFILE
# ══════════════════════════════════════════════════════════════════
seafile-load-images:
	$(SSH) 'docker load -i ~/seafile/images/seafile-pro-mc-10.0.tar && \
		docker load -i ~/seafile/images/mariadb-10.11.tar && \
		docker load -i ~/seafile/images/memcached-1.6.18.tar'

seafile-up: seafile-load-images
	$(SSH) 'cd ~/seafile && docker compose up -d'

seafile-restart:
	$(SSH) 'cd ~/seafile && docker compose restart'

seafile-down:
	$(SSH) 'cd ~/seafile && docker compose down'

# Snapshot all Seafile conf files from VM to local.
# Use after first deployment to save a local copy of Seafile's conf.
# These snapshots can be reused for future deployments on new VMs.
# Files saved to: infrastructure/seafile/conf/snapshots/YYYY-MM-DD/
seafile-snapshot:
	$(eval SNAPSHOT_DIR := infrastructure/seafile/conf/snapshots/$(shell date +%Y-%m-%d_%H%M%S))
	@mkdir -p $(SNAPSHOT_DIR)
	$(SCP) $(VM_USER)@$(VM_HOST):~/seafile/data/seafile/conf/seahub_settings.py $(SNAPSHOT_DIR)/seahub_settings.py
	$(SCP) $(VM_USER)@$(VM_HOST):~/seafile/data/seafile/conf/ccnet.conf $(SNAPSHOT_DIR)/ccnet.conf
	$(SCP) $(VM_USER)@$(VM_HOST):~/seafile/data/seafile/conf/seafile.conf $(SNAPSHOT_DIR)/seafile.conf
	$(SCP) $(VM_USER)@$(VM_HOST):~/seafile/data/seafile/conf/seafdav.conf $(SNAPSHOT_DIR)/seafdav.conf
	$(SCP) $(VM_USER)@$(VM_HOST):~/seafile/data/seafile/conf/seafevents.conf $(SNAPSHOT_DIR)/seafevents.conf
	$(SCP) $(VM_USER)@$(VM_HOST):~/seafile/data/seafile/conf/gunicorn.conf.py $(SNAPSHOT_DIR)/gunicorn.conf.py
	$(SCP) $(VM_USER)@$(VM_HOST):~/seafile/data/nginx/conf/seafile.nginx.conf $(SNAPSHOT_DIR)/nginx.conf
	@echo "✓ Snapshot saved to $(SNAPSHOT_DIR)"
	@echo "  Commit this to git to preserve for future deployments"

## NOTE: Need to fix this. Cannot be used right now
seafile-restore:
	$(eval LATEST_SNAPSHOT := $(shell ls -td infrastructure/seafile/conf/snapshots/*/ | head -1))
	@if [ -z "$(LATEST_SNAPSHOT)" ]; then echo "Error: No snapshots found."; exit 1; fi
	@echo "Uploading configuration from: $(LATEST_SNAPSHOT)"
	$(SCP) $(LATEST_SNAPSHOT)seahub_settings.py $(VM_USER)@$(VM_HOST):~/seafile/data/seafile/conf/seahub_settings.py
	$(SCP) $(LATEST_SNAPSHOT)ccnet.conf $(VM_USER)@$(VM_HOST):~/seafile/data/seafile/conf/ccnet.conf
	$(SCP) $(LATEST_SNAPSHOT)seafile.conf $(VM_USER)@$(VM_HOST):~/seafile/data/seafile/conf/seafile.conf
	$(SCP) $(LATEST_SNAPSHOT)seafdav.conf $(VM_USER)@$(VM_HOST):~/seafile/data/seafile/conf/seafdav.conf
	$(SCP) $(LATEST_SNAPSHOT)seafevents.conf $(VM_USER)@$(VM_HOST):~/seafile/data/seafile/conf/seafevents.conf
	$(SCP) $(LATEST_SNAPSHOT)gunicorn.conf.py $(VM_USER)@$(VM_HOST):~/seafile/data/seafile/conf/gunicorn.conf.py
	$(SCP) $(LATEST_SNAPSHOT)nginx.conf $(VM_USER)@$(VM_HOST):~/seafile/data/nginx/conf/seafile.nginx.conf
	@echo "Restore complete. Remember to restart your Seafile containers."

# ══════════════════════════════════════════════════════════════════
# website
# ══════════════════════════════════════════════════════════════════
website-dev:
	cd ./website && bun run dev

website-sync:
	$(SSH) 'mkdir -p ~/website'
	$(SCP) infrastructure/website/docker-compose.yml \
		$(VM_USER)@$(VM_HOST):~/website/docker-compose.yml
	@echo "✓ ~/website/docker-compose.yml uploaded"

website-up:
	$(SSH) 'cd ~/website && docker compose pull && docker compose up -d'

website-down:
	$(SSH) 'cd ~/website && docker compose down'

website-restart:
	$(SSH) 'cd ~/website && docker compose restart'


# BLOG PUBLISHING
# ══════════════════════════════════════════════════════════════════
# Copy published posts from Obsidian vault → repo → deploy
# Only posts with published: true in frontmatter are copied
# ══════════════════════════════════════════════════════════════════
publish:
	@chmod +x scripts/publish.sh
	@bash scripts/publish.sh $(if $(m),"$(m)",)


chat-up:
	$(SSH) 'cd ~/openWebUI && docker compose pull && docker compose up -d'

chat-down:
	$(SSH) 'cd ~/openWebUI && docker compose down'

chat-restart:
	$(SSH) 'cd ~/openWebUI && docker compose restart'


# ══════════════════════════════════════════════════════════════════
# DIAGNOSTICS & LOGS
# ══════════════════════════════════════════════════════════════════
diagnose:
	@bash scripts/diagnose.sh

logs-traefik:
	$(SSH) 'docker logs -f traefik'

logs-seafile:
	$(SSH) 'docker logs -f seafile'

logs-traefik-access:
	$(SSH) 'tail -f ~/traefik/logs/access.log'

logs-chat:
	$(SSH) 'cd ~/openWebUI && docker compose logs -f '

logs-website:
	$(SSH) 'docker logs -f webwebsite'

# ══════════════════════════════════════════════════════════════════
# SECRETS — credentials only, never non-secret config
# ══════════════════════════════════════════════════════════════════
secrets-check:
	@bash scripts/secrets-check.sh

secrets-push: secrets-check
	@bash scripts/secrets-push.sh all

secrets-push-traefik: secrets-check
	@bash scripts/secrets-push.sh traefik

secrets-push-seafile: secrets-check
	@bash scripts/secrets-push.sh seafile

secrets-push-openwebui: secrets-check
	@bash scripts/secrets-push.sh openwebui

secrets-pull:
	@bash scripts/secrets-pull.sh




