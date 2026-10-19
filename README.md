# SRE Leader's Field Guide

A daily working tool for leading Site Reliability Engineering **without a software engineering background**. It's written for leaders who came up through IT Operations and want to be credible with engineers, peers, and leadership by asking the right questions instead of writing code.

It's practical, not academic. Every page starts from a real situation ("Use This When"), puts actions before explanation, includes an **Example in Practice**, and says plainly how things go wrong in **What Actually Happens**.

## What's in It (Phases 1–2)

| Area | Pages and tools |
|---|---|
| **Today** | A dashboard rebuilt every morning: checklist by day of week, items generated from your data, a Fire Day switch, roll-over, a streak, and a fully customizable routine |
| **Become the SRE Leader** | Your Path: IT Ops → SRE Leader · **Skills Map** (27 "I can…" skills, with quarterly snapshots) · **Wins & Evidence Log** |
| **Lead Daily** | **Commitment Tracker** (owners, dates, "done means," slip counting, nudge messages, CSV) · **Meeting Prep** (questions, open items, notes → commitments, recap) |
| **Firefighting Mode** | **Top Offenders Board** (pain-ranked recurring issues, plus a "Make the Case" business-case draft) |
| **Use Daily** | Rituals (weekly, monthly, and quarterly agendas) · Question Bank (60+ questions with strong and weak answers) |

Planned next: the offshore 24x7 team section, the rest of Firefighting Mode, the credibility pages, Play the Real Game, the SRE playbooks (Observability, SLOs, Incidents, Change, Toil, Capacity, Architecture, Org), a Glossary, and an SRE Book & Workbook companion.

## Your Data

- Tools save to this browser's `localStorage` under the `srl-` prefix. **Nothing is sent anywhere.** No analytics, no accounts, no network calls.
- Back up and restore from **Start Here → Your Data** (a JSON file). Today reminds you after 7 days.
- All examples use a generic "AI assistant" product and invented numbers.

## The Google SRE Books

The guide links to the free official chapters of [*Site Reliability Engineering*](https://sre.google/sre-book/table-of-contents/) and [*The Site Reliability Workbook*](https://sre.google/workbook/table-of-contents/), but only where a chapter really helps. The books themselves are **not** stored in this repo. If you keep an offline copy, put it in `local/`, which is git-ignored.

## Running Locally

Open `index.html` in a browser, or run `npx serve .`. Add `?date=2026-11-02` to any URL to preview the checklist for another day.

## Structure

No build step and no dependencies. `assets/site.js` holds the `NAV` array that drives the header, sidebar, and pager. `assets/store.js` is the storage layer, and `assets/data.js` holds the shared record models. Content data lives in `rituals.js`, `questions.js`, `skills.js`, and `sre-books.js`.
