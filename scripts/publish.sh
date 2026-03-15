#!/usr/bin/env bash
# scripts/publish.sh
#
# Copies published blog posts from Obsidian vault to the repo.
# Filters for posts with `published: true` in frontmatter only.
# Handles images — copies them and rewrites Obsidian wikilinks.
#
# USAGE:
#   make publish              → publish with auto commit message
#   make publish m="new post" → publish with custom message

set -euo pipefail

# ══════════════════════════════════════════════════════════════════
# CONFIG — edit these if your paths change
# ══════════════════════════════════════════════════════════════════

# Windows username
WIN_USER="sushantg2001"

# Base path to your Seafile sync root (accessible from WSL2)
SEAFILE_ROOT="/mnt/c/Users/${WIN_USER}/Desktop/files"

# Obsidian vault root inside Seafile
VAULT_ROOT="${SEAFILE_ROOT}/00. Obsidian"

# Blog folder inside vault — where you write posts
VAULT_BLOG="${VAULT_ROOT}/7. Blog"

# Attachments folder inside vault — where Obsidian stores images
VAULT_ATTACHMENTS="${VAULT_ROOT}/1. Resources/3. Images/Blog"

# App folder name inside repo (the Next.js project)
APP_DIR="website"

# GitHub remote branch to push to
GIT_BRANCH="main"

# GitHub Actions monitor URL
GITHUB_ACTIONS_URL="https://github.com/${WIN_USER}/${APP_DIR}/actions"

# Live site URL
SITE_URL="https://sushantgupta.cloud/blog"

# ══════════════════════════════════════════════════════════════════
# DERIVED PATHS — do not edit these
# ══════════════════════════════════════════════════════════════════

REPO_ROOT="$(git rev-parse --show-toplevel)"
CONTENT_DIR="${REPO_ROOT}/${APP_DIR}/content/blog"
IMAGES_DIR="${REPO_ROOT}/${APP_DIR}/public/blog/images"

# ── Colors ────────────────────────────────────────────────────────
GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${BLUE}[→]${NC} $1"; }
ok()   { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# ── Validation ────────────────────────────────────────────────────
[ -d "$VAULT_BLOG" ] || err "Vault blog folder not found: $VAULT_BLOG"
[ -d "$VAULT_ATTACHMENTS" ] || warn "Attachments folder not found: $VAULT_ATTACHMENTS (images may not copy)"
[ -f "${REPO_ROOT}/${APP_DIR}/package.json" ] || err "App not found at ${APP_DIR}/. Run from repo root."

# ── Clean previous content ────────────────────────────────────────
log "Cleaning previous content..."
rm -rf "${CONTENT_DIR:?}"/*
mkdir -p "$CONTENT_DIR"
mkdir -p "$IMAGES_DIR"

# ── Find and copy published posts ─────────────────────────────────
log "Scanning vault for published posts..."

PUBLISHED=0
SKIPPED=0

while IFS= read -r -d '' file; do
    # Only process files with published: true in frontmatter
    if ! head -30 "$file" | grep -q "^published:[[:space:]]*true"; then
        SKIPPED=$((SKIPPED + 1))
        continue
    fi

    rel_path="${file#${VAULT_BLOG}/}"
    dest_dir="${CONTENT_DIR}/$(dirname "$rel_path")"
    dest_file="${CONTENT_DIR}/${rel_path}"

    mkdir -p "$dest_dir"

    # Process file: rewrite image wikilinks and copy images
    python3 - "$file" "$dest_file" "$VAULT_ATTACHMENTS" "$IMAGES_DIR" << 'PYEOF'
import sys
import re
import shutil
import os

src_file    = sys.argv[1]
dst_file    = sys.argv[2]
attachments = sys.argv[3]
images_dir  = sys.argv[4]

with open(src_file, 'r', encoding='utf-8') as f:
    content = f.read()

images_found = []

# ![[image.png]] or ![[image.png|alt]] → ![alt](/blog/images/image.png)
def replace_wikilink(m):
    filename = m.group(1).strip()
    if '|' in filename:
        filename, alt = filename.split('|', 1)
    else:
        alt = filename
    images_found.append(filename.strip())
    return f'![{alt.strip()}](/blog/images/{filename.strip()})'

content = re.sub(r'!\[\[([^\]]+)\]\]', replace_wikilink, content)

# ![alt](local.png) → ![alt](/blog/images/local.png)
def replace_local_img(m):
    alt  = m.group(1)
    path = m.group(2)
    if not path.startswith('http'):
        filename = os.path.basename(path)
        images_found.append(filename)
        return f'![{alt}](/blog/images/{filename})'
    return m.group(0)

content = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', replace_local_img, content)

# Copy images from vault to repo
for img in set(images_found):
    for src_img in [
        os.path.join(attachments, img),
        os.path.join(os.path.dirname(src_file), img),
    ]:
        if os.path.exists(src_img):
            shutil.copy2(src_img, os.path.join(images_dir, img))
            print(f'  image: {img}', flush=True)
            break

os.makedirs(os.path.dirname(dst_file), exist_ok=True)
with open(dst_file, 'w', encoding='utf-8') as f:
    f.write(content)
PYEOF

    PUBLISHED=$((PUBLISHED + 1))
    echo "  ✓ $(dirname "$rel_path")/$(basename "$rel_path" .md)"

done < <(find "$VAULT_BLOG" -name "*.md" -print0)

echo ""
ok "${PUBLISHED} post(s) copied, ${SKIPPED} draft(s) skipped"

if [ "$PUBLISHED" -eq 0 ]; then
    warn "No published posts found."
    warn "Add 'published: true' to frontmatter in Obsidian to publish a post."
    exit 0
fi

# ── Git ───────────────────────────────────────────────────────────
log "Committing..."
cd "$REPO_ROOT"
git add "${APP_DIR}/content/blog/" "${APP_DIR}/public/blog/"

if git diff --cached --quiet; then
    ok "No changes since last publish. Nothing to deploy."
    exit 0
fi

COMMIT_MSG="${1:-"content: publish blog posts $(date '+%Y-%m-%d %H:%M') — ${PUBLISHED} post(s)"}"
git commit -m "$COMMIT_MSG"

log "Pushing to ${GIT_BRANCH}..."
git push origin "$GIT_BRANCH" --force-with-lease

echo ""
ok "Published! GitHub Actions is building and deploying."
echo "  Monitor: ${GITHUB_ACTIONS_URL}"
echo "  Live at: ${SITE_URL}"