# Contributing

How to propose a change to this site.

## Making a change

1. Branch off `main` as `<type>/<slug>`, for example `feat/dark-mode-toggle` or `fix/post-order`. The types are `feat`, `fix`, `perf`, `refactor`, `test`, `docs`, `build`, `ci`, `chore`, `style` and `revert`. A blog post is `docs/<slug>`.
2. Run `just deps`, then `just dev` to work and `just ci` before you open a PR; `just ci` is what CI runs.
3. Open a pull request titled `type(scope): summary`, for example `fix(blog): keep post order stable`. CI checks the title and the branch name. The title becomes the commit on `main`.
4. A maintainer squash-merges it. One commit lands on `main` with your title. Nothing ships on merge: the maintainer pushes a signed tag when they want to release, and the release goes live once they merge the deploy pull request in the private config repo.

Right now collaboration means opening pull requests: fork the repo, or push a `<type>/<slug>` branch if you were invited. You do not need to sign commits, and `claude/*` branches are local-only.

Urgent fixes follow the same path as any `fix/<slug>` branch. There is no separate hotfix branch.

## Blog posts

Add the post to `content/inbox/` on a `docs/<slug>` branch and merge it; a workflow then opens a second pull request with the transformed post. See [content/inbox/README.md](content/inbox/README.md).

## License

By contributing you agree that your contribution is licensed under the project's license (see `LICENSE`).

## Reporting bugs

Use the bug template and include the page, your browser and what you expected.
