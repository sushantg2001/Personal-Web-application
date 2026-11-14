# justfile — the front door.
#
# CI calls the same recipes you do, so the two cannot drift apart.
#
# This repo is the website and nothing else. The VPS it runs on is configured
# in the private `workstation` repo; this one builds an image, scans it when it
# is released, then hands the digest over. See README.md.

set dotenv-load
set dotenv-filename := '.env.local'

IMAGE := 'ghcr.io/sushantg2001/website'

# Show every recipe
default:
    @just --list

# ── Build ─────────────────────────────────────────────────────────────────────

# Install dependencies
[group('build')]
deps:
    bun install --frozen-lockfile

# Dev server on :3000
[group('build')]
dev:
    bun run dev

# Static export to out/
[group('build')]
build:
    bun run build

# eslint + tsc --noEmit — exactly what CI gates on
[group('build')]
lint:
    bun run lint
    bun run type-check

# Build the container image the same way CI does
[group('build')]
image tag='local':
    docker build -t {{IMAGE}}:{{tag}} .

# Run the built image on :8080 to check what nginx actually serves
[group('build')]
serve tag='local': (image tag)
    docker run --rm -p 8080:80 {{IMAGE}}:{{tag}}

# ── Content ───────────────────────────────────────────────────────────────────

# Transform and the follow-up pull request are publish.yml's job — this only copies.

# Export published posts from the Obsidian vault into content/inbox/
[group('content')]
publish:
    bash scripts/publish.sh

# Validate blog content without changing anything
[group('content')]
content-check:
    python3 scripts/transform_post.py --check content/inbox content/blog public/blog/images

# Transform anything sitting in content/inbox/ into a published post
[group('content')]
content-apply:
    python3 scripts/transform_post.py content/inbox content/blog public/blog/images

# Regenerate the design-system cards
[group('content')]
design-cards:
    bun run scripts/generate-design-cards.ts

# ── Meta ──────────────────────────────────────────────────────────────────────

# First-time setup
[group('meta')]
setup:
    @just deps
    @just doctor

# Is this machine able to build the site?
[group('meta')]
doctor:
    #!/usr/bin/env bash
    ok()  { echo "  ✓ $1"; }
    bad() { echo "  ✗ $1"; }
    command -v just   >/dev/null && ok "just   $(just --version | cut -d' ' -f2)" || bad "just"
    command -v bun    >/dev/null && ok "bun    $(bun --version)"                  || bad "bun — needed to build"
    command -v docker >/dev/null && ok "docker $(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)" || bad "docker — needed for the image"
    [ -d node_modules ] && ok "node_modules present" || bad "run: just deps"
    echo "  · deploys live in the private workstation repo; this repo only builds"

# Everything CI runs, locally. If this passes, the PR should be green.
[group('meta')]
ci:
    @just lint
    @just build
    @just content-check
    @echo ""
    @echo "✓ local CI passed"
