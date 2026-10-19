/* SRE Leader Skills Map. Each skill: id, area, can ("I can…"), practice (a rep for this week),
   link (an existing page on this site, optional), read (an sre.google chapter, optional). */
window.SRL_SKILL_LEVELS = [
  { v: 1, label: "Not Yet" },
  { v: 2, label: "With Help" },
  { v: 3, label: "Solid" },
  { v: 4, label: "Can Teach It" }
];

window.SRL_SKILLS = [
  /* Technical fluency */
  { id: "tf-request", area: "Technical Fluency", can: "I can sketch how a user's request flows through our AI assistant, end to end, on a whiteboard.",
    practice: "Ask an engineer to draw it for you in 15 minutes. Redraw it yourself from memory the next day and have them correct it." },
  { id: "tf-dashboard", area: "Technical Fluency", can: "I can open our main dashboard and say whether things are healthy, and why, in under 2 minutes.",
    practice: "Do the morning scan from Today every day this week and write your one-line verdict. Compare it with the on-call engineer's view.", link: "daily/questions.html" },
  { id: "tf-signals", area: "Technical Fluency", can: "I can explain the difference between metrics, logs, and traces and when each one helps.",
    practice: "During the next incident, ask \"what did the metrics show, what did the logs show, did we have a trace?\" and note the answers.",
    read: "https://sre.google/sre-book/monitoring-distributed-systems/" },
  { id: "tf-ai", area: "Technical Fluency", can: "I can explain the main ways our AI product fails: slow, down, wrong, or too expensive.",
    practice: "Go through the last 5 incidents and sort each one into one of those four boxes. Share the tally in your weekly update." },
  { id: "tf-deps", area: "Technical Fluency", can: "I can list our top dependencies (model provider, auth, data stores) and what happens when each one fails.",
    practice: "Ask in the next pod sync: \"What do we depend on that we don't control?\" Write the list down." },
  { id: "tf-fix", area: "Technical Fluency", can: "I can tell a real fix from a workaround and ask the right follow-up.",
    practice: "For every incident this week, ask \"Is this the fix or the workaround? What would the fix be and who owns it?\"" },

  /* Reliability practice */
  { id: "rp-slo", area: "Reliability Practice", can: "I can explain SLIs, SLOs, and error budgets to an exec in 2 minutes, without jargon.",
    practice: "Write a 5-sentence explanation using the assistant as the example. Say it out loud to someone non-technical.",
    read: "https://sre.google/sre-book/service-level-objectives/" },
  { id: "rp-alerts", area: "Reliability Practice", can: "I can judge whether an alert is good (actionable, user-facing) or noise.",
    practice: "Pick the 5 noisiest alerts from last week. For each, ask \"What did someone do when it fired?\" If nothing, it's a candidate to delete.",
    read: "https://sre.google/workbook/alerting-on-slos/" },
  { id: "rp-toil", area: "Reliability Practice", can: "I can measure how much of the team's time goes to toil and unplanned work.",
    practice: "Ask the team to tag their time for one week: project, toil, or interrupts. Rough is fine.",
    read: "https://sre.google/sre-book/eliminating-toil/" },
  { id: "rp-change", area: "Reliability Practice", can: "I can tell whether a change process is safe (canary, rollback, flags) without reading the code.",
    practice: "Ask about the last bad change: \"How long did rollback take, and how did we find out?\"",
    read: "https://sre.google/workbook/canarying-releases/" },

  /* Incidents & firefighting */
  { id: "if-lead", area: "Incidents & Firefighting", can: "I can be useful in a live incident without touching a keyboard: impact, comms, roles, escalation.",
    practice: "In the next incident, ask only the \"During an Incident\" questions and nothing else.", link: "daily/questions.html" },
  { id: "if-review", area: "Incidents & Firefighting", can: "I can run a post-incident review that ends with a few owned, dated, meaningful actions.",
    practice: "In the next review, push for one ranked #1 action item with a named owner and a date.",
    read: "https://sre.google/sre-book/postmortem-culture/" },
  { id: "if-offenders", area: "Incidents & Firefighting", can: "I can name our top 3 repeat offenders, their cost, and who owns each one.",
    practice: "Fill in the Top Offenders Board with this week's data. Bring #1 to the owning pod.", link: "firefight/top-offenders.html" },
  { id: "if-shield", area: "Incidents & Firefighting", can: "I can protect the team's project time while the fires keep coming.",
    practice: "Name one interrupt handler for next week. Everyone else's interrupts route through them or you.",
    read: "https://sre.google/sre-book/dealing-with-interrupts/" },

  /* Execution (TPM-style) */
  { id: "ex-commit", area: "Execution", can: "I can turn a vague \"we'll look into it\" into an owner, a date, and a definition of done.",
    practice: "Log every commitment from this week's meetings in the Commitment Tracker. All of them.", link: "lead/commitments.html" },
  { id: "ex-watermelon", area: "Execution", can: "I can spot a watermelon status (green outside, red inside) before it's due.",
    practice: "For every \"on track\" item this week, ask: \"What's the earliest sign it would slip?\"", link: "daily/questions.html" },
  { id: "ex-prep", area: "Execution", can: "I walk into every important meeting with 3 prepared questions and leave with written commitments.",
    practice: "Use Meeting Prep for every meeting with a pod or your boss this week.", link: "lead/meeting-prep.html" },
  { id: "ex-no", area: "Execution", can: "I can say no, or \"yes if…\", by making the trade-off visible in writing.",
    practice: "Next time you're handed new work, reply: \"We can do X if Y moves to next month. Your call.\"" },

  /* Influence & credibility */
  { id: "in-engineers", area: "Influence & Credibility", can: "Engineers bring me problems early because I ask good questions and don't fake knowledge.",
    practice: "Say \"I don't know, walk me through it\" at least once this week, in front of others." },
  { id: "in-data", area: "Influence & Credibility", can: "I can make a case for reliability investment using data: pages, hours, customer impact.",
    practice: "Turn your top offender into one slide: cost per month in hours, and the ask." },
  { id: "in-peers", area: "Influence & Credibility", can: "Peer managers see me as a partner, not just an escalation point.",
    practice: "Ask one pod manager: \"What would make SRE escalations more useful to you?\"", link: "daily/questions.html" },
  { id: "in-visibility", area: "Influence & Credibility", can: "My team's saves and improvements are visible to leadership every week.",
    practice: "Log two wins this week and put them in your weekly update with names credited.", link: "grow/wins.html" },
  { id: "in-politics", area: "Influence & Credibility", can: "I can recognize blame-shifting, credit-taking, and watermelon reporting, and counter them calmly with facts.",
    practice: "Keep a running record this week: decisions, dates, who said what. Facts only." },

  /* People & offshore */
  { id: "pp-oneonone", area: "People & Offshore", can: "My 1:1s with engineers produce real signal: blockers, burnout, and growth.",
    practice: "Use one 1:1 question from the Question Bank with each report this week.", link: "daily/questions.html" },
  { id: "pp-instructions", area: "People & Offshore", can: "I write instructions the offshore team can follow without guessing.",
    practice: "Rewrite one runbook: one action per step, an exact if/then, and a clear point to stop and escalate." },
  { id: "pp-teachback", area: "People & Offshore", can: "I confirm understanding with teach-back instead of asking \"do you understand?\"",
    practice: "End every offshore instruction this week with \"Tell me back in your own words what you'll do.\"" },
  { id: "pp-hire", area: "People & Offshore", can: "I can run a hiring loop for SREs that tests the right things, even though I can't judge code.",
    practice: "Draft your interview loop: which interviewer tests what. Use the Hiring questions as your part.", link: "daily/questions.html" }
];
