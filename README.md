# SRE Leader's Field Guide

A question bank for leading Site Reliability Engineering **without a software engineering background**. It's written for leaders who came up through IT Operations and want to build credibility with engineers, peers, leadership, and their own teams by asking the right questions.

**Live site:** https://lemonadevodka.github.io/sre-leader-field-guide/

## The Question Bank

126 questions across 23 situations, in six groups:

| Group | Situations |
|---|---|
| **Technical Rooms** | Dashboard Review · During an Incident · Post-Incident Review · Design Review |
| **Peers & Leaders** | Pod & Peer Sync · Status & Commitments · Boss & Execs · Roadmap & Priorities · Vendor & Tool Pitch |
| **Recurring Meetings** | Performance Engineering Meeting · SRE Daily |
| **Credibility Moments** | New to the Room · When You're Tested or Dismissed · When You Don't Know · Owning the Reliability Story |
| **Your SRE Team** | 1:1 With an Engineer · Hiring Loop |
| **Offshore NOC L1** | Diagnose the Real Problem · Instructions That Stick · Triage & Escalation · Shift Handoff · Performance & Accountability · Through the Shift Lead or Vendor |

Every question comes with:
- **If the answer is weak, ask next:** the follow-up question.
- **What asking this signals:** why it builds your credibility.
- **Strong vs weak answers:** what good sounds like, and the red flags.

Every situation has its own link (for example, `index.html#noc-instructions`), so you can bookmark the ones you use most.

## Other Pages

- **Meeting Agendas:** time-boxed 30-minute agendas for a weekly Performance Engineering meeting and the SRE Daily, with the question to ask in each block and calendar-invite text to copy.
- **How to Ask:** six habits, tone that lands, and how to ask questions of an offshore NOC team.
- **Your Path: IT Ops → SRE Leader:** what carries over, what to unlearn, and where your background is an advantage.

## Editing Questions

All questions live in `assets/questions.js`. Add an entry with `q`, `tags` (situation ids), `strong`, `weak`, `next`, and `signal`. Prefix a question with `(To yourself)`, `(To the shift lead)`, etc. to label who you're asking.

## Notes

- Static HTML, no build step, no dependencies. The only thing stored is your light/dark theme choice, in your browser.
- Open `index.html` locally, or run `npx serve .`.
- All examples use a generic "AI assistant" product and invented details. Links go to the free official [SRE Book](https://sre.google/sre-book/table-of-contents/) and [Workbook](https://sre.google/workbook/table-of-contents/) chapters where they help.
