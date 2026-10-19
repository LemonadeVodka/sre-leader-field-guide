/* Ritual content for the Today checklist and the Rituals page.
   Links are relative to the site root; pages prefix them with data-root. */
window.SRL_RITUALS = {
  /* Every day: the 10-minute morning scan. */
  daily: [
    { id: "d-overnight", text: "Scan overnight: pages, incidents, and the offshore shift handoff. Circle anything that happened before." },
    { id: "d-health", text: "Look at the main health dashboard. Write one line: green, yellow, or red, and why.", link: "daily/questions.html#dashboard" },
    { id: "d-oncall", text: "Check on the person on call. Did they sleep? If not, take something off their day." },
    { id: "d-nudge", text: "Send follow-ups for anything due today before 10 a.m.", link: "lead/commitments.html" },
    { id: "d-one", text: "Name your one leadership priority for today: the thing only you can do." }
  ],
  /* Day-of-week extras (0 = Sunday … 6 = Saturday). */
  byDay: {
    1: [
      { id: "mon-plan", text: "Plan the week: write down your top 3 outcomes and block focus time for them." },
      { id: "mon-offenders", text: "Review the Top Offenders Board. Does #1 have a named owner and a date?", link: "firefight/top-offenders.html" }
    ],
    2: [
      { id: "tue-question", text: "Credibility rep: use one question from the Question Bank in a technical meeting today.", link: "daily/questions.html" }
    ],
    3: [
      { id: "wed-offshore", text: "Offshore spot-check: read three handoff notes or tickets from the last 24 hours. Give the shift lead one piece of specific feedback." }
    ],
    4: [
      { id: "thu-skill", text: "15 minutes on your Skills Map focus. Practice it, don't just read about it.", link: "grow/skills-map.html" }
    ],
    5: [
      { id: "fri-close", text: "Close the loop: mark every commitment done, slipped, or dropped. Nothing stays open without a date.", link: "lead/commitments.html" },
      { id: "fri-wins", text: "Log at least one win from this week, with its impact.", link: "grow/wins.html" },
      { id: "fri-update", text: "Send your weekly update to your boss before they ask for it." }
    ]
  },
  /* First Monday of the month. */
  monthly: [
    { id: "m-review", text: "Monthly reliability review: compare pages, incidents, and top offenders with last month. Pick one thing to escalate.", link: "daily/rituals.html#monthly-reliability-review" }
  ],
  /* First Monday of January, April, July, October. */
  quarterly: [
    { id: "q-skills", text: "Re-rate your Skills Map and choose next quarter's focus.", link: "grow/skills-map.html" },
    { id: "q-evidence", text: "Read back through your Wins Log and draft three bullets for your self-review.", link: "grow/wins.html" },
    { id: "q-backup", text: "Export a backup and save it somewhere safe.", link: "start-here.html#your-data" }
  ],
  /* Fire Day: replaces everything else. */
  fireDay: [
    { id: "f-triage", text: "Triage: list every fire, rank them by customer impact, and lead exactly one yourself." },
    { id: "f-protect", text: "Protect on-call: say out loud who is on the fire and who is shielded. You take the interrupts." },
    { id: "f-boss", text: "Update your boss before they ask: what's broken, who's affected, and when the next update is." },
    { id: "f-log", text: "Log what broke in three lines. It feeds tomorrow's Top Offenders review.", link: "firefight/top-offenders.html" },
    { id: "f-debt", text: "Log the debt: what got dropped today, and who needs to hear that it slipped." }
  ]
};
