---
title: "A vault that compounds"
date: "2026-04-20"
description: "Structuring Obsidian so notes get more useful the longer you keep them — pillars, projects, and a cadence that actually runs."
tags: [obsidian, pkm, claude]
---

Most note systems die the same death: you capture enthusiastically for three weeks, the inbox folder hits two hundred items, and opening the app starts to feel like opening unread email. The notes aren't wrong — they're just inert. Nothing connects, nothing resurfaces, and the system quietly becomes a write-only archive.

I rebuilt my Obsidian vault around one question: **does a note become more useful the longer it lives here?** If the answer is no, the structure is wrong. Here's what I landed on.

## The shape: pillars → projects → epics → stories

The vault has a small spine borrowed shamelessly from agile, because agile vocabulary turns "someday" into "scheduled":

- **Pillars** are the permanent areas — health, finance, career, learning. They never finish; they only have a current state.
- **Projects** live under pillars and *do* finish — "set up the investment system", "new job applications", "personal website".
- **Epics and stories** break projects into month-sized and week-sized pieces.

The point of the hierarchy isn't taxonomy for its own sake. It's that every captured note has an obvious home, and every home has an obvious review cadence.

## The cadence is the system

Structure without rhythm rots. Three loops keep the vault alive:

- **Daily** — a daily note collects whatever the day produces: tasks, meeting fragments, half-thoughts. Zero organizing pressure at capture time.
- **Weekly sweep** — stories get triaged: done, carried, or killed. The weekly note summarizes the week against the active projects.
- **Monthly sweep** — epics get the same treatment one level up, and each pillar gets a paragraph of honest status.

The sweeps are the compounding mechanism. A note written in January gets touched by a weekly review, referenced by an epic, summarized into a monthly status — each pass adds links and context. That's the difference between a pile and a system: piles decay, systems accrete.

## Where Claude changed the economics

The honest problem with review cadences is that they're clerical work, and clerical work loses to entropy eventually. This is where wiring Claude into the vault (via MCP) mattered more than any plugin:

- The **daily briefing** reads today's note and the weekly note and tells me week status, open stories, and top priorities — thirty seconds instead of fifteen minutes of orienting.
- The **weekly and monthly sweeps** are now conversations. Claude walks the stories, proposes triage, and writes the summary; I veto and adjust. The review still carries my judgment, but not my typing.
- **Capture** got routing. "Add a note about X" lands in the right project with the right tags, instead of the inbox graveyard.

The counterintuitive result: automating the boring layer made the thinking layer *more* personal, because the time I spend in the vault is now almost entirely judgment, not filing.

## What I'd tell you to steal

Start with the cadence, not the folders. One daily note, one weekly review — even in a flat folder — beats a beautiful hierarchy nobody revisits. Add structure only when a review loop keeps tripping over its absence. And if you can put an AI in the loop, aim it at the clerical layer first: briefings, triage, summaries. Keep the judgment for yourself. That's the part that compounds.
