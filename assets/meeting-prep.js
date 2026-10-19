/* Meeting Prep: pick a meeting type, get the right questions and open items, capture notes,
   and turn lines into commitments or wins with one click. The draft survives a page reload. */
(function () {
  "use strict";
  var S = window.SRL, D = S.data, esc = S.esc;
  var app = document.getElementById("prep-app");
  if (!app) return;
  var root = document.body.getAttribute("data-root") || "./";

  var TYPES = [
    { id: "pod", label: "Pod or Peer Sync", tags: ["pod", "status"], tip: "Bring your top offender for their service with numbers. Leave with one owner and one date, written down." },
    { id: "oneonone", label: "1:1 With an Engineer", tags: ["oneonone"], tip: "Their agenda first. Ask one question you've never asked before. Write down one thing you'll do for them." },
    { id: "standup", label: "Team Standup or Ops Sync", tags: ["status", "dashboard"], tip: "Skip the status read-out. Ask what's blocked and what's repeating. Keep it to 15 minutes." },
    { id: "design", label: "Design Review", tags: ["design"], tip: "You're not there to judge the code. Ask how it fails, how you'd know, and how you'd roll back." },
    { id: "incident", label: "Post-Incident Review", tags: ["incident"], tip: "Pull up the last review for the same service first. Push for one ranked #1 action with an owner and a date." },
    { id: "ops", label: "Weekly Ops Review", tags: ["dashboard", "roadmap"], tip: "Compare with last week: pages, incidents, top offenders. Decide one thing to escalate." },
    { id: "boss", label: "1:1 With Your Boss or an Exec Update", tags: ["boss"], tip: "Lead with outcomes and numbers, then one ask. Send a written recap within the hour." },
    { id: "offshore", label: "Offshore Shift-Lead Sync", tags: ["offshore"], tip: "Use teach-back on anything new. Ask what confused the team this week, not whether they understood." },
    { id: "vendor", label: "Vendor or Tool Pitch", tags: ["vendor"], tip: "Insist on a trial with your own data. Ask about year-two pricing before you show any enthusiasm." },
    { id: "planning", label: "Roadmap or Planning", tags: ["roadmap", "status"], tip: "Bring the Top Offenders list. Ask what's explicitly not being done this quarter." },
    { id: "hiring", label: "Interview", tags: ["hiring"], tip: "Test how they communicate, handle incidents, and influence. Let engineers test the code." }
  ];

  var KINDS = [{ id: "note", label: "Note" }, { id: "commit", label: "Commitment" }, { id: "win", label: "Win" }];
  var blank = function () { return { type: "pod", title: "", date: S.today(), with: "", picked: [], notes: [], shown: null }; };
  var draft = S.get("meeting-draft", null) || blank();
  function save() { S.set("meeting-draft", draft); }
  function type() { return TYPES.filter(function (t) { return t.id === draft.type; })[0] || TYPES[0]; }

  function questionsFor(t) {
    return (window.SRL_QUESTIONS || []).filter(function (q) { return q.tags.some(function (g) { return t.tags.indexOf(g) >= 0; }); });
  }
  function pickShown(t) {
    var all = questionsFor(t).map(function (q) { return q.q; });
    for (var i = all.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = all[i]; all[i] = all[j]; all[j] = x; }
    return all.slice(0, 6);
  }

  function related() {
    var words = (draft.title + " " + draft.with).toLowerCase().split(/[^a-z0-9]+/).filter(function (w) { return w.length > 2; });
    if (!words.length) return [];
    return D.commitments.open().filter(function (c) {
      var hay = ((c.who || "") + " " + (c.source || "")).toLowerCase();
      return words.some(function (w) { return hay.indexOf(w) >= 0; });
    }).sort(D.commitments.byDue);
  }

  function relatedHtml() {
    var rel = related();
    return '<h2 data-notoc style="margin-top:0;font-size:20px">2 · Check These First</h2>' + (rel.length ?
      '<p class="small">Open commitments that match this meeting\'s title or attendees. Ask about these before anything new.</p><ul class="item-list">' + rel.map(function (c) {
        var od = D.commitments.isOverdue(c);
        return '<li class="item ' + (od ? "overdue" : c.status) + '"><span class="item-title">' + esc(c.what) + '</span><div class="item-meta"><span>' + esc(c.who || "") + '</span><span>' + (c.due ? (od ? "Was due " : "Due ") + S.rel(c.due) : "No date") + '</span>' + (c.slips ? '<span class="badge warn">Moved ' + c.slips + '×</span>' : "") + '</div></li>';
      }).join("") + '</ul>' : '<p class="small" style="margin:0">Nothing open matches yet. Fill in the title and attendees, and anything previously logged with these names or this meeting will show up here.</p>');
  }

  function render() {
    var t = type();
    if (!draft.shown) { draft.shown = pickShown(t); save(); }
    var qmap = {}; (window.SRL_QUESTIONS || []).forEach(function (q) { qmap[q.q] = q; });

    var h = '<section class="tool"><h2 data-notoc style="margin-top:0;font-size:20px">1 · The Meeting</h2><div class="form-grid">' +
      '<label class="field">Type<select id="m-type">' + TYPES.map(function (x) { return '<option value="' + x.id + '"' + (x.id === draft.type ? " selected" : "") + '>' + esc(x.label) + '</option>'; }).join("") + '</select></label>' +
      '<label class="field">Title<input type="text" id="m-title" value="' + esc(draft.title) + '" placeholder="Assistant pod sync"></label>' +
      '<label class="field">Date<input type="date" id="m-date" value="' + esc(draft.date) + '"></label>' +
      '<label class="field">With<input type="text" id="m-with" value="' + esc(draft.with) + '" placeholder="Priya, Sam"></label></div>' +
      '<div class="box say" style="margin:12px 0 0"><span class="box-label">Before You Walk In</span><p style="font-style:normal">' + esc(t.tip) + '</p></div></section>';

    h += '<section class="tool" id="rel-sec">' + relatedHtml() + '</section>';

    h += '<section class="tool"><h2 data-notoc style="margin-top:0;font-size:20px">3 · Questions to Bring</h2><p class="small">Tick up to three. Three sharp questions beat ten vague ones.</p>' +
      '<ul class="today-list">' + draft.shown.map(function (qt, i) {
        var q = qmap[qt] || { q: qt }, on = draft.picked.indexOf(qt) >= 0;
        return '<li class="' + (on ? "" : "") + '"><label><input type="checkbox" data-pick="' + i + '"' + (on ? " checked" : "") + '><span><span class="txt"><strong>' + esc(q.q) + '</strong></span>' +
          (q.strong ? '<span class="small" style="display:block;margin-top:4px"><span style="color:var(--ok)">Strong:</span> ' + esc(q.strong) + '</span><span class="small" style="display:block"><span style="color:var(--danger)">Weak:</span> ' + esc(q.weak) + '</span>' : "") + '</span></label></li>';
      }).join("") + '</ul><div class="btn-row"><button class="btn small" type="button" id="shuffle">Show Different Questions</button><a class="btn small" href="' + root + 'daily/questions.html">Full Question Bank</a></div></section>';

    h += '<section class="tool"><h2 data-notoc style="margin-top:0;font-size:20px">4 · Notes</h2>' +
      '<form id="note-form" class="form-grid" autocomplete="off"><label class="field">Kind<select name="kind">' + KINDS.map(function (k) { return '<option value="' + k.id + '">' + k.label + '</option>'; }).join("") + '</select></label>' +
      '<label class="field wide">Line<input type="text" name="text" required placeholder="Priya will fix the timeout alert"></label>' +
      '<label class="field commit-only">Who<input type="text" name="who" placeholder="Priya"></label>' +
      '<label class="field commit-only">Due<input type="date" name="due" value="' + S.addDays(S.today(), 7) + '"></label>' +
      '<label class="field wide commit-only">Done means<input type="text" name="done" placeholder="Under 5 pages a week for 2 weeks"></label>' +
      '<div style="align-self:end"><button class="btn primary" type="submit">Add Line</button></div></form>' +
      (draft.notes.length ? '<ul class="item-list" style="margin-top:12px">' + draft.notes.map(function (n, i) {
        var badge = n.kind === "commit" ? '<span class="badge info">Commitment</span>' : n.kind === "win" ? '<span class="badge ok">Win</span>' : '<span class="badge">Note</span>';
        return '<li class="item"><div class="item-head">' + badge + '<span>' + esc(n.text) + '</span></div>' + (n.kind === "commit" ? '<div class="item-meta"><span>' + esc(n.who || "No owner yet") + '</span><span>' + (n.due ? "Due " + S.fmt(n.due) : "No date") + '</span>' + (n.done ? '<span>Done = ' + esc(n.done) + '</span>' : "") + '</div>' : "") +
          '<div class="item-actions"><button class="btn small" data-kind="' + i + '">Change Kind</button><button class="btn small danger" data-rm="' + i + '">Remove</button></div></li>';
      }).join("") + '</ul>' : '<p class="small">Type as you go. Mark anything someone agreed to do as a <strong>Commitment</strong>.</p>') +
      '<div class="btn-row" style="margin-top:16px"><button class="btn primary" type="button" id="finish">Save Meeting &amp; Send to Tracker</button><button class="btn" type="button" id="recap">Copy Recap</button><button class="btn danger" type="button" id="clear">Start Over</button></div></section>';

    var past = D.meetings.all().slice(-8).reverse();
    h += '<section><h2>Past Meetings</h2>' + (past.length ? '<ul class="item-list">' + past.map(function (m) {
      var t2 = TYPES.filter(function (x) { return x.id === m.type; })[0];
      var nc = m.notes.filter(function (n) { return n.kind === "commit"; }).length;
      return '<li class="item"><div class="item-head"><span class="item-title">' + esc(m.title || (t2 ? t2.label : "Meeting")) + '</span><span class="badge">' + esc(t2 ? t2.label : m.type) + '</span></div><div class="item-meta"><span>' + S.fmt(m.date) + '</span><span>' + m.notes.length + ' lines</span><span>' + nc + ' commitments</span></div><div class="item-actions"><button class="btn small" data-past="' + esc(m.id) + '">Copy Recap</button></div></li>';
    }).join("") + '</ul>' : '<p class="empty">Saved meetings show up here.</p>') + '</section>';

    app.innerHTML = h;
    toggleCommitFields();
  }

  function toggleCommitFields() {
    var f = document.getElementById("note-form"); if (!f) return;
    var isC = f.kind.value === "commit";
    Array.prototype.forEach.call(f.querySelectorAll(".commit-only"), function (el) { el.style.display = isC ? "" : "none"; });
  }

  function recapText(m) {
    var t = TYPES.filter(function (x) { return x.id === m.type; })[0];
    var lines = ["Recap: " + (m.title || (t ? t.label : "Meeting")) + " (" + S.fmt(m.date) + ")", ""];
    var cs = m.notes.filter(function (n) { return n.kind === "commit"; });
    if (cs.length) {
      lines.push("Agreed actions:");
      cs.forEach(function (n) { lines.push("- " + (n.who || "[owner]") + ": " + n.text + (n.due ? " by " + S.fmt(n.due) : "") + (n.done ? " (done = " + n.done + ")" : "")); });
      lines.push("");
    }
    var ns = m.notes.filter(function (n) { return n.kind !== "commit"; });
    if (ns.length) { lines.push("Notes:"); ns.forEach(function (n) { lines.push("- " + n.text); }); lines.push(""); }
    lines.push("If I've got anything wrong, reply and I'll fix it.");
    return lines.join("\n");
  }

  app.addEventListener("change", function (e) {
    var el = e.target;
    if (el.id === "m-type") { draft.type = el.value; draft.shown = null; draft.picked = []; save(); render(); return; }
    if (el.matches("[data-pick]")) {
      var q = draft.shown[+el.getAttribute("data-pick")];
      if (el.checked && draft.picked.indexOf(q) < 0) draft.picked.push(q);
      if (!el.checked) draft.picked = draft.picked.filter(function (x) { return x !== q; });
      save(); return;
    }
    if (el.name === "kind") toggleCommitFields();
    if (el.id === "m-date") { draft.date = el.value; save(); }
  });
  app.addEventListener("input", function (e) {
    var el = e.target;
    if (el.id === "m-title") { draft.title = el.value; save(); }
    if (el.id === "m-with") { draft.with = el.value; save(); }
  });
  app.addEventListener("focusout", function (e) {
    if (e.target.id === "m-title" || e.target.id === "m-with") document.getElementById("rel-sec").innerHTML = relatedHtml();
  });

  app.addEventListener("submit", function (e) {
    if (e.target.id !== "note-form") return;
    e.preventDefault();
    var f = e.target, text = f.text.value.trim();
    if (!text) return;
    var n = { kind: f.kind.value, text: text };
    if (n.kind === "commit") { n.who = f.who.value.trim(); n.due = f.due.value; n.done = f.done.value.trim(); }
    draft.notes.push(n); save();
    var keepKind = f.kind.value;
    render();
    var nf = document.getElementById("note-form"); nf.kind.value = keepKind; toggleCommitFields(); nf.text.focus();
  });

  app.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.id === "shuffle") { draft.shown = pickShown(type()); draft.picked = []; save(); render(); return; }
    if (b.hasAttribute("data-rm")) { draft.notes.splice(+b.getAttribute("data-rm"), 1); save(); render(); return; }
    if (b.hasAttribute("data-kind")) {
      var n = draft.notes[+b.getAttribute("data-kind")], order = ["note", "commit", "win"];
      n.kind = order[(order.indexOf(n.kind) + 1) % order.length]; save(); render(); return;
    }
    if (b.id === "recap") { S.copy(recapText(draft)); return; }
    if (b.hasAttribute("data-past")) { var m = D.meetings.get(b.getAttribute("data-past")); if (m) S.copy(recapText(m)); return; }
    if (b.id === "clear") { if (draft.notes.length && !confirm("Clear this meeting's notes?")) return; draft = blank(); save(); render(); return; }
    if (b.id === "finish") {
      if (!draft.notes.length) { S.toast("Add at least one line first"); return; }
      var source = (draft.title || type().label) + ", " + S.fmt(draft.date);
      var nc = 0, nw = 0;
      draft.notes.forEach(function (n) {
        if (n.kind === "commit") {
          D.commitments.add({ what: n.text, who: n.who || "", due: n.due || "", done: n.done || "", status: "open", source: source, notes: "", slips: 0,
            follow: n.due ? (S.addDays(n.due, -2) < S.today() ? S.today() : S.addDays(n.due, -2)) : S.addDays(S.today(), 3) });
          nc++;
        }
        if (n.kind === "win") { D.wins.add({ date: draft.date, title: n.text, impact: "", category: "Improvement", credit: draft.with, evidence: source }); nw++; }
      });
      D.meetings.add({ type: draft.type, title: draft.title, date: draft.date, with: draft.with, questions: draft.picked, notes: draft.notes });
      var recap = recapText(draft);
      draft = blank(); save(); render();
      S.copy(recap);
      S.toast("Saved. " + nc + " commitment" + (nc === 1 ? "" : "s") + ", " + nw + " win" + (nw === 1 ? "" : "s") + ". Recap copied.");
    }
  });

  render();
})();
