---
title: "Running Claude Code in a real project"
date: "2026-06-14"
description: "What agentic coding actually feels like after months of daily use — worktrees, verification, and where the human stays in the loop."
tags: [claude, claude-code, workflow]
---

There's a version of "AI coding" that lives in demos: a prompt goes in, an app falls out, everyone claps. Then there's the version where an agent works inside a real repository with real history, real CI, and real consequences. I've been doing the second kind daily — on this site, on my self-hosted infrastructure, on scripts that touch things I care about — and the texture of it is different enough to be worth writing down.

## The unit of work is a conversation, not a prompt

The demo framing gets the granularity wrong. In practice I don't ask for features; I have working sessions. A session might start with "the blog needs categories," pass through the agent reading the existing markdown pipeline, surface a question I hadn't considered (do categories come from frontmatter or folder structure?), and end with a decision I made and code it wrote. The agent types almost everything. I decide almost everything that matters.

The skill that transfers from senior engineering is exactly the one you'd hope: **knowing what to specify and what to delegate.** Underspecify and you review a guess. Overspecify and you've just written the code with extra steps.

## Worktrees changed how much I let it do

The single biggest unlock was git worktrees. Claude Code spins up its own working directory on its own branch, and suddenly the blast radius question — *what if it wrecks something?* — has a boring answer: nothing outside the worktree. My checkout stays untouched and deployable while the agent rebuilds half the UI two folders away.

That isolation is what makes real delegation psychologically possible. I stopped reviewing every intermediate step and started reviewing outcomes, because the intermediate steps literally cannot hurt me. Merge or delete: those are the only two doors out of a worktree.

## Verification is the actual job

Here's the shift nobody warns you about: when the agent writes the code, *your* job becomes verification. Not line-by-line review — the agent runs builds, starts the dev server, screenshots the result, checks both themes, and reports what it saw. My job is deciding whether the evidence is convincing and whether the thing it verified is the thing I meant.

The failure mode to watch for isn't dramatic hallucination. It's plausible completion — code that builds, runs, and does *almost* what you wanted. The defense is making "show me it working" a non-negotiable step, and being suspicious of any summary that doesn't include what failed along the way. Real work has failures along the way.

## What I still don't delegate

- **Architecture with long shadows.** Choosing the token structure for this site's design system took a conversation; I made the call because I'll live with it for years.
- **Anything irreversible.** Deletions, force-pushes, deployments, emails. The agent asks; I click.
- **Taste.** It can propose five hero layouts. Picking the one that feels like me is not its job.

## The honest summary

After months of this, the sensation isn't "I have a very fast junior." It's closer to having an extremely capable pair who never gets tired, never gets offended when you throw work away, and needs exactly the same thing a human pair needs: clear intent, honest review, and someone who knows what done looks like. The code got faster. The thinking didn't get optional.
