# Inbox

Drop a markdown post here on a `docs/<slug>` branch and merge it through a pull
request. `.github/workflows/publish.yml` rewrites the Obsidian wikilinks, moves
the images into `public/blog/images/`, files the post under `content/blog/`, and
opens a second pull request with the result. Merging that lands the post on
`main`; it goes live with the maintainer's next signed-tag release.

Two ways in, both ending here:

```bash
just publish        # export published: true posts from the Obsidian vault
# ...or just write/copy a .md into this folder by hand
```

Then:

```bash
just content-check  # exactly what CI will check
git switch -c docs/my-post && git add content/inbox && git commit -m "docs(blog): add my post"
git push -u origin docs/my-post   # then open a PR; squash-merge it
```

## The subfolder is the category

`src/lib/blog.ts` derives a post's category from its directory name, so mirror
the structure you want:

```
content/inbox/claude/my-post.md   →   content/blog/claude/my-post.md
```

A post dropped at the top level of the inbox lands at the top level of
`content/blog/` with no category.

**Slugs are global.** `getPost()` returns the first file matching
`<slug>.md` anywhere under `content/blog`, so two posts with the same filename
in different categories means one of them is unreachable. The validator rejects
that.

## What gets rejected

- frontmatter missing `title` or `date`
- an image reference that resolves nowhere
- a text wikilink (`[[Some Note]]`) — the site cannot follow it, and there is
  no correct target to guess, so fix it at the source
- a duplicate slug

This file is just a placeholder so the directory exists in git. It is ignored
by the transform, which only looks for posts with frontmatter.
