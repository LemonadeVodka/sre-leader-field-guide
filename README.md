# SRE Leader's Field Guide

A handbook for leading Site Reliability Engineering **without a software engineering background**. It's written for leaders who came up through IT Operations and want to build credibility with engineers, peers, leadership, and their own teams by asking the right questions.

**Live site:** https://lemonadevodka.github.io/sre-leader-field-guide/

## What's Inside

The home page opens with three one-word frameworks, each letter a question to ask out loud (the [Pocket Frameworks](https://lemonadevodka.github.io/sre-leader-field-guide/playbooks/frameworks.html) page prints all three):

- **LEAD**, running an incident: Leader · Effect · Action · Deadline. Repeat every 15 minutes.
- **SAFER**, postmortem or RCA: Set the rules · Agree the impact · Follow the timeline · Explain what let it happen · Rank the actions.
- **PACE**, tracking people's work: Progress · Asks · Confidence · End with owners.

The site is built around four jobs, in priority order:

1. **Move a Stuck Incident:** questions organized by how the incident is stuck (nobody owns it, going in circles, waiting on someone, the NOC is lost, exec heat, and more).
2. **Where Are We?** Asking people what they're working on and getting the real status: weekly sweep, decoding "almost done," a one-page tracker.
3. **Meeting Starter:** an agenda in 60 seconds, ground rules to say out loud (postmortem, incident bridge, SRE Daily, Perf Eng, vendor demo), and lines for holding the room.
4. **Performance Engineering:** leading the weekly perf meeting without being the expert.

The sidebar has four sections:

| Section | Pages |
|---|---|
| **Do** (in the moment) | Pocket Frameworks · Move a Stuck Incident · Where Are We? · Meeting Starter · Performance Engineering · Postmortem Meeting · SRE Daily · Running a Task · Stuck Incident Deep Dive · Vendor Demos · Running an RCA · Judging an RCA · RCA Template |
| **Ask** (Question Bank, 284 questions) | During & After Incidents · Running Tasks & Projects · In Technical Meetings · With Peers & Leaders · With the Offshore NOC · With Your SRE Team · Supporting the AI Product · With Vendors · Building Credibility |
| **Learn** (study time) | RCA Day One · Observability Day One · RCA the SRE Way · Worked Example · 25 SRE concepts · AI reliability (5 pages) · Implementation programs grounded in the SRE Workbook (8 pages) |
| **People** (credibility and politics) | Saying "I Don't Know" · How to Ask · From IT Ops to SRE Leader · Power & Politics (4 pages, 39 tactics) |

- **Lighter pages:** the "Do" playbooks open with a one-screen **Quick Card**. The detail below is folded into sections you open as needed (links to a section open it automatically, and printing opens everything).
- **Questions:** every question card shows **why it builds credibility**, plus an **Ask next** follow-up for weak answers and collapsed **Coaching notes** (what strong and weak answers sound like). Long lists show the top 3 first, with "Show all."
- **Concepts:** every concept follows the same seven parts:
  1. in one sentence
  2. in IT Ops terms
  3. why it matters at your level
  4. how to implement it in Azure + Azure Managed Grafana + PagerDuty
  5. what done looks like
  6. what to ask
  7. links to Google's free SRE Book and Workbook, plus official docs

The home page searches all questions; press `/` to jump to the search box. Sidebar sections collapse (only the current one is open), and "Find a page" filters every page as you type.

## Editing

- **Questions:** `assets/questions.js`. Each group is a Question Bank page; each situation is a section on it. Add a question with `q`, `tags` (situation ids), `strong`, `weak`, `next`, and `signal` (why it builds credibility, shown on every card). Optional `star` lists the situations where it's one of the top 3.
- **Pages:** plain HTML. Every page uses the same frame: breadcrumb, H1, one-line summary, then H2 sections. Only three callout styles are used: `callout` (key point), `callout example`, and `callout watch`.
- **Navigation:** the `NAV` array in `assets/site.js`.

Old URLs (`meetings.html`, `how-to-ask.html`, `your-path.html`, `daily/questions.html`, and `index.html#<situation>`) redirect to their new homes.

## Standards

- **Accessibility:** WCAG 2.2 AA. Checked with axe-core on every page, in light and dark themes, plus a keyboard walkthrough.
- **Layout:** works from 320px wide, and prints cleanly.
- **Build:** static HTML, no build step, no dependencies. The only thing stored is your light/dark theme choice.
- **Content:** all examples are fictional and use a generic "AI assistant."
