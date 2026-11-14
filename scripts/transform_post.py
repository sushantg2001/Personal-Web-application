#!/usr/bin/env python3
"""Turn an Obsidian note into a blog post.

    python3 scripts/transform_post.py content/inbox content/blog public/blog/images

Reads every .md in the inbox, and for each one:

  - checks the frontmatter has what the site needs
  - rewrites Obsidian image wikilinks into plain markdown paths
  - moves referenced images into the public images directory
  - writes the result into the content directory

The transform is the same one that used to live inline in publish.sh; it moved
here so the GitHub Actions workflow and a local run share one implementation
rather than two that drift.

Nothing is deleted from the content directory. The repo is the source of
truth — the inbox is only ever a set of additions.

Exits non-zero on any validation failure, and reports every problem it found
rather than stopping at the first.
"""

from __future__ import annotations

import re
import shutil
import sys
from pathlib import Path

REQUIRED_FRONTMATTER = ("title", "date")

# ![[image.png]] or ![[image.png|alt text]]
WIKILINK_IMAGE = re.compile(r"!\[\[([^\]]+)\]\]")
# ![alt](path) — only local paths are rewritten, URLs are left alone
MARKDOWN_IMAGE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
# [[Some Note]] or [[Some Note|label]] — a *text* wikilink, which the site
# cannot resolve. Deliberately not rewritten: there is no correct target to
# guess. Flagged so it is fixed at the source instead of shipping broken.
WIKILINK_TEXT = re.compile(r"(?<!!)\[\[([^\]]+)\]\]")

FRONTMATTER = re.compile(r"\A---\n(.*?)\n---\n", re.S)


class PostError(Exception):
    pass


def parse_frontmatter(text: str, name: str) -> dict[str, str]:
    m = FRONTMATTER.match(text)
    if not m:
        raise PostError(f"{name}: no YAML frontmatter block at the top of the file")
    fields = {}
    for line in m.group(1).splitlines():
        if ":" in line and not line.startswith((" ", "\t", "-", "#")):
            key, _, value = line.partition(":")
            fields[key.strip()] = value.strip()
    missing = [k for k in REQUIRED_FRONTMATTER if not fields.get(k)]
    if missing:
        raise PostError(f"{name}: frontmatter missing {', '.join(missing)}")
    return fields


def rewrite_images(text: str, name: str) -> tuple[str, list[str]]:
    """Point every local image at /blog/images/ and collect the filenames."""
    found: list[str] = []

    def from_wikilink(m: re.Match[str]) -> str:
        target = m.group(1).strip()
        filename, _, alt = target.partition("|")
        filename = filename.strip()
        alt = alt.strip() or filename
        found.append(filename)
        return f"![{alt}](/blog/images/{filename})"

    def from_markdown(m: re.Match[str]) -> str:
        alt, path = m.group(1), m.group(2)
        if path.startswith(("http://", "https://", "/blog/images/")):
            return m.group(0)
        filename = Path(path).name
        found.append(filename)
        return f"![{alt}](/blog/images/{filename})"

    text = WIKILINK_IMAGE.sub(from_wikilink, text)
    text = MARKDOWN_IMAGE.sub(from_markdown, text)
    return text, found


def process(md: Path, inbox: Path, content: Path, images: Path,
            apply: bool) -> list[str]:
    problems: list[str] = []
    # Path relative to the inbox, not just the basename: the subfolder is the
    # post's category (src/lib/blog.ts derives it from the directory name), so
    # flattening here would silently uncategorise every post.
    rel = md.relative_to(inbox)
    name = str(rel)
    raw = md.read_text(encoding="utf-8")

    try:
        parse_frontmatter(raw, name)
    except PostError as e:
        problems.append(str(e))
        return problems

    body, referenced = rewrite_images(raw, name)

    for link in WIKILINK_TEXT.findall(body):
        problems.append(
            f"{name}: unresolved wikilink [[{link}]] — the site cannot follow it; "
            f"replace it with a normal markdown link"
        )

    # Every referenced image must be resolvable: either alongside the post in
    # the inbox, or already committed under public/blog/images.
    resolved: dict[str, Path] = {}
    for img in dict.fromkeys(referenced):
        for candidate in (inbox / "images" / img, md.parent / img, images / img):
            if candidate.is_file():
                resolved[img] = candidate
                break
        else:
            problems.append(f"{name}: image not found anywhere: {img}")

    dest = content / rel
    if dest.exists() and dest.read_text(encoding="utf-8") == body:
        print(f"  = {name} (unchanged)")
        return problems
    if problems:
        return problems

    if apply:
        dest.parent.mkdir(parents=True, exist_ok=True)
        images.mkdir(parents=True, exist_ok=True)
        for img, src in resolved.items():
            if src.parent != images:
                shutil.copy2(src, images / img)
                print(f"    image: {img}")
        dest.write_text(body, encoding="utf-8")
        md.unlink()
        src_images = inbox / "images"
        for img in resolved:
            stray = src_images / img
            if stray.is_file():
                stray.unlink()
    print(f"  {'+' if apply else '?'} {name}")
    return problems


def main(argv: list[str]) -> int:
    apply = "--check" not in argv
    args = [a for a in argv[1:] if not a.startswith("--")]
    inbox = Path(args[0] if len(args) > 0 else "content/inbox")
    content = Path(args[1] if len(args) > 1 else "content/blog")
    images = Path(args[2] if len(args) > 2 else "public/blog/images")

    problems: list[str] = []

    # 1. Anything waiting in the inbox. rglob, not glob: a post's subfolder is
    #    its category, and the inbox mirrors that structure.
    #    README.md is the placeholder that keeps the directory in git.
    staged = sorted(
        p for p in inbox.rglob("*.md") if p.name != "README.md"
    ) if inbox.is_dir() else []
    if staged:
        print(f"inbox: {len(staged)} post(s)")
        for md in staged:
            problems += process(md, inbox, content, images, apply)
    else:
        print("inbox: empty")

    # 2. Everything already published still has to be valid — this is what
    #    runs on a PR that edits a post directly rather than via the inbox.
    published = sorted(content.rglob("*.md")) if content.is_dir() else []
    print(f"published: {len(published)} post(s)")
    slugs: dict[str, Path] = {}
    for md in published:
        rel = md.relative_to(content)
        text = md.read_text(encoding="utf-8")
        try:
            parse_frontmatter(text, str(rel))
        except PostError as e:
            problems.append(str(e))
        for link in WIKILINK_TEXT.findall(text):
            problems.append(f"{rel}: unresolved wikilink [[{link}]]")
        for _, path in MARKDOWN_IMAGE.findall(text):
            if path.startswith("/blog/images/"):
                if not (images / Path(path).name).is_file():
                    problems.append(f"{rel}: missing image {path}")
            elif not path.startswith(("http://", "https://")):
                problems.append(f"{rel}: unrewritten image path {path}")
        # Slugs are flat and global: getPost() in src/lib/blog.ts returns the
        # first file matching `${slug}.md` anywhere under content/blog, so two
        # posts with the same filename in different categories means one of
        # them is unreachable.
        slug = md.stem.lower()
        if slug in slugs:
            problems.append(
                f"duplicate slug '{slug}': {rel} and {slugs[slug]} — slugs are "
                f"global, so only the first would ever render"
            )
        slugs[slug] = rel

    if problems:
        print("\nproblems:", file=sys.stderr)
        for p in problems:
            print(f"  ✗ {p}", file=sys.stderr)
        return 1

    print("\n✓ content OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
