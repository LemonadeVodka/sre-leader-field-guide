# SRE Leader's Field Guide

A handbook for leading Site Reliability Engineering **without a software engineering background**. It's written for leaders who came up through IT Operations and want to build credibility with engineers, peers, leadership, and their own teams by asking the right questions.

**Live site:** https://lemonadevodka.github.io/sre-leader-field-guide/

## What's Inside

| Section | Pages |
|---|---|
| **Home** | One-tap buttons for the meeting you're in (9) and the moment you're in (11), plus search |
| **Question Bank** (208 questions) | In Technical Meetings · During & After Incidents · Supporting the AI Product · With Peers & Leaders · With Your SRE Team · With the Offshore NOC · Building Credibility |
| **Root Cause Analysis** | RCA Day One · RCA the SRE Way · Running an RCA · Judging an RCA · Worked Example · RCA Template |
| **Playbooks** | When an Incident Is Stuck (for a surface-only team) · SRE Daily · Performance Engineering |
| **AI Reliability** | What's Different About AI · Latency: TTFT & TTLT · Tokens, Quotas & Cost · Quality & Safety · Agents & Model Providers |
| **SRE Concepts** (25 concepts) | Overview & Roadmap · Observability Day One · Reliability Targets · Observability & Telemetry · Alerting & Incidents · Change & Toil · Capacity & Readiness |
| **Guides** | Saying "I Don't Know" · How to Ask · From IT Ops to SRE Leader |

- **Questions:** every question has an **Ask next** follow-up for weak answers, plus collapsed **Coaching notes**: what asking it signals, and what strong and weak answers sound like.
- **Concepts:** every concept follows the same seven parts:
  1. in one sentence
  2. in IT Ops terms
  3. why it matters at your level
  4. how to implement it in Azure + Azure Managed Grafana + PagerDuty
  5. what done looks like
  6. what to ask
  7. links to Google's free SRE Book and Workbook, plus official docs

The home page searches all questions; press `/` to jump to the search box.

## Editing

- **Questions:** `assets/questions.js`. Each group is a Question Bank page; each situation is a section on it. Add a question with `q`, `tags` (situation ids), `strong`, `weak`, `next`, and `signal`.
- **Pages:** plain HTML. Every page uses the same frame: breadcrumb, H1, one-line summary, then H2 sections. Only three callout styles are used: `callout` (key point), `callout example`, and `callout watch`.
- **Navigation:** the `NAV` array in `assets/site.js`.

Old URLs (`meetings.html`, `how-to-ask.html`, `your-path.html`, `daily/questions.html`, and `index.html#<situation>`) redirect to their new homes.

## Standards

- **Accessibility:** WCAG 2.2 AA. Checked with axe-core on every page, in light and dark themes, plus a keyboard walkthrough.
- **Layout:** works from 320px wide, and prints cleanly.
- **Build:** static HTML, no build step, no dependencies. The only thing stored is your light/dark theme choice.
- **Content:** all examples are fictional and use a generic "AI assistant."
