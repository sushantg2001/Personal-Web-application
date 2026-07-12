---
title: "Designing this site with Claude — twice"
date: "2026-07-06"
description: "How this website went from a terminal easter egg to a design system, using Claude Code and Claude Design in a loop."
tags: [claude, design, meta, next.js]
---

This site has now been designed twice in one week, and the second time cost an evening. That sentence is the whole pitch for the workflow, so let me unpack it.

## Round one: from terminal to design system

The site started as a joke I was fond of: the homepage *was* a terminal. Type `help`, poke around, that's it. Charming, but there was nowhere to put writing, videos, or anything else I actually wanted to publish.

So round one was a working session with Claude Code: a proper Next.js structure with a component library (buttons, cards, badges), design tokens as CSS variables, and a config file that defines the whole site — nav, socials, projects — so adding a section later means editing data, not components. The terminal survived at `/terminal`, because you don't delete jokes you're fond of.

The important decision in round one wasn't visual. It was structural: **every color, font, and radius lives in one token file, and everything else references it.** That's a boring, standard decision. It's also the entire reason round two was cheap.

## The bridge: a design system you can look at

Here's the piece that made this feel new. The component library gets rendered into small standalone HTML previews — one card per component, plus full-page compositions — and pushed to a Claude Design project. Suddenly the design system isn't an idea in the codebase; it's a pane of live cards I can open on my phone.

The loop looks like this:

```
repo components ──generate──▶ preview cards ──push──▶ claude.ai/design
      ▲                                                    │
      └──────── port to React ◀──────── pull ◀────── iterate visually
```

The two sides never touch production. The website only changes through code review and deploy; the design project only changes when something is pushed to it. The sync is deliberate, incremental, and boring — which is precisely what you want from the machinery under a creative loop.

## Round two: Field Notes

With the cards live, I did the actual *designing* in the browser — no build times, no TypeScript, just look and judgment. What came out the other side was a different site: warm paper and ink instead of the first palette, a moss green accent, Young Serif headlines, a mono header that reads `~/sushant_`, and section labels numbered like a table of contents. A field-notes aesthetic, because that's what this site is for.

Then one working session back in Claude Code: pull the design, swap the token file, adjust the components that had opinions the tokens couldn't express (button hover behavior, tag shapes, the ISO-date writing list), verify both themes in the browser, push the as-built cards back up. The blog, the cards, the whole site followed the new tokens automatically.

## What generalizes

- **Tokens are leverage.** A retheme touched one file plus a handful of components. Without tokens it would have touched everything, and I wouldn't have bothered.
- **Design where designing is cheap; build where building is safe.** Browser for taste, repo for correctness. Each room is bad at the other's job.
- **Keep the sync honest.** The design pane shows what actually shipped, not what was once intended. A moodboard that lies to you is worse than no moodboard.

The site you're reading is the output of that loop — and since the loop is still running, it probably won't look exactly like this forever. That's rather the point.
