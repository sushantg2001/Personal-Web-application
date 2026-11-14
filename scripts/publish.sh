#!/usr/bin/env bash
# scripts/publish.sh
#
# EXPORT ONLY. Copies posts marked `published: true` out of the Obsidian vault
# into content/inbox/, along with the images they reference. It does not
# transform, commit, or push.
#
# The transform (wikilinks → markdown, images → public/) belongs to
# .github/workflows/publish.yml, so that dropping a .md into content/inbox/ by
# hand and exporting from the vault go through exactly the same code.
#
# This script used to `rm -rf content/blog/*` and re-copy everything, treating
# the vault as the source of truth. It no longer does: the repo is the source
# of truth, and the inbox is a set of additions. Restoring the wipe would
# delete anything the workflow or a manual drop had produced.
#
# USAGE
#   just publish

set -euo pipefail

# ══════════════════════════════════════════════════════════════════
# CONFIG — edit these if your paths change
# ══════════════════════════════════════════════════════════════════

WIN_USER="sushantg2001"
SEAFILE_ROOT="/mnt/c/Users/${WIN_USER}/Desktop/files"
VAULT_ROOT="${SEAFILE_ROOT}/00. Obsidian"
VAULT_BLOG="${VAULT_ROOT}/7. Blog"
VAULT_ATTACHMENTS="${VAULT_ROOT}/1. Resources/3. Images/Blog"

# ── Derived ───────────────────────────────────────────────────────
# Run from anywhere; everything below is relative to website/.
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INBOX="${APP_DIR}/content/inbox"

GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${BLUE}[→]${NC} $1"; }
ok()   { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

[ -d "$VAULT_BLOG" ] || err "Vault blog folder not found: $VAULT_BLOG"
[ -d "$VAULT_ATTACHMENTS" ] || warn "Attachments folder not found: $VAULT_ATTACHMENTS"

mkdir -p "$INBOX/images"

log "Scanning vault for published posts..."

PUBLISHED=0
SKIPPED=0

while IFS= read -r -d '' file; do
    if ! head -30 "$file" | grep -q "^published:[[:space:]]*true"; then
        SKIPPED=$((SKIPPED + 1))
        continue
    fi

    # Preserve the path relative to the vault's blog folder: the subfolder is
    # the post's category (src/lib/blog.ts derives it from the directory name),
    # so flattening to a basename would uncategorise every post.
    rel_path="${file#"${VAULT_BLOG}"/}"
    mkdir -p "${INBOX}/$(dirname "$rel_path")"
    cp "$file" "${INBOX}/${rel_path}"

    # Copy every image the post references. Filenames are extracted the same
    # way transform_post.py finds them, so the two cannot disagree about what
    # counts as a reference.
    python3 - "$file" "$VAULT_ATTACHMENTS" "$INBOX/images" <<'PY'
import re, shutil, sys
from pathlib import Path

src, attachments, dest = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
text = src.read_text(encoding="utf-8")

names = [m.split("|")[0].strip() for m in re.findall(r"!\[\[([^\]]+)\]\]", text)]
names += [Path(p).name for _, p in re.findall(r"!\[([^\]]*)\]\(([^)]+)\)", text)
          if not p.startswith(("http://", "https://", "/blog/images/"))]

for name in dict.fromkeys(names):
    for candidate in (attachments / name, src.parent / name):
        if candidate.is_file():
            shutil.copy2(candidate, dest / name)
            print(f"    image: {name}")
            break
    else:
        print(f"    MISSING image: {name} (the workflow will reject this post)")
PY

    PUBLISHED=$((PUBLISHED + 1))
    echo "  → $(basename "$file" .md)"
done < <(find "$VAULT_BLOG" -name "*.md" -print0)

echo ""
ok "${PUBLISHED} post(s) exported to content/inbox/, ${SKIPPED} draft(s) skipped"

if [ "$PUBLISHED" -eq 0 ]; then
    warn "No published posts found."
    warn "Add 'published: true' to the frontmatter in Obsidian to publish a post."
    exit 0
fi

echo ""
echo "Next:"
echo "  just content-check     # see what the workflow will check"
echo "  git add content/inbox && git commit && git push"
echo ""
echo "publish.yml then rewrites the links, moves the images, and commits the"
echo "finished posts into content/blog/."
