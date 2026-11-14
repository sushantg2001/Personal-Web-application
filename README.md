# sushantgupta.cloud

The source of my personal site: a Next.js app, statically exported and served by
nginx in a container. The blog posts are plain markdown in this repo.

```
src/            the app
content/        blog posts, by category folder
public/         static assets
design-system/  reference mockups, not shipped
Dockerfile      how it becomes an image
scripts/        publishing and content tooling
justfile        the front door
```

## Run it locally

```bash
just setup     # install dependencies, then check the machine
just dev       # dev server on :3000
just lint      # eslint + tsc, exactly what CI gates on
just build     # static export to out/
just ci        # everything CI runs, locally
```

`just serve` builds the container image and runs it on :8080, which is the
quickest way to see what nginx actually serves rather than what `next dev`
does.

## Write a post

Posts live in `content/blog/<category>/`. **The folder is the category**:
`src/lib/blog.ts` derives it from the directory name. Slugs are flat and global,
so two posts sharing a filename in different categories means one is
unreachable; the validator rejects that.

To add one, put a markdown file in `content/inbox/` and open a pull request. When
it merges, a workflow rewrites Obsidian wikilinks, moves the images into
`public/blog/images/`, files the post under `content/blog/` and opens a second
pull request with the result. `just publish` exports `published: true` notes
from an Obsidian vault into the inbox; writing the file by hand works the same.
Details: [content/inbox/README.md](content/inbox/README.md).

## Hosting

CI builds the container image from this repo. The server that runs it is
configured in a separate private repository, so there is no deployment code and
no credentials here.

## Contributing

Issues and pull requests are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md). CI
runs lint, type-check, the content validator, CodeQL, a Trivy filesystem scan
and a Docker build on every pull request, and none of it needs a secret, so a
fork PR gets the same signal I do.

## License

MIT, see [LICENSE](LICENSE).
