/* Shared record models for the tools (SRL.data). Load after store.js.
   Today, Meeting Prep and each tool page all read and write through here. */
(function () {
  "use strict";
  var S = window.SRL;

  function collection(key) {
    return {
      all: function () { return S.get(key, []) || []; },
      save: function (arr) { S.set(key, arr); },
      get: function (id) { return this.all().filter(function (x) { return x.id === id; })[0] || null; },
      add: function (obj) { var a = this.all(); obj.id = obj.id || S.uid(); obj.created = obj.created || S.today(); a.push(obj); this.save(a); return obj; },
      update: function (id, patch) {
        var a = this.all();
        a.forEach(function (x) { if (x.id === id) Object.keys(patch).forEach(function (k) { x[k] = patch[k]; }); });
        this.save(a);
      },
      remove: function (id) { this.save(this.all().filter(function (x) { return x.id !== id; })); }
    };
  }

  /* ---------- Commitments ----------
     { id, what, who, due, done, status: open|at-risk|waiting|done|dropped, follow, source, notes, created, closed, slips } */
  var commitments = collection("commitments");
  commitments.STATUSES = [
    { id: "open", label: "On Track" },
    { id: "at-risk", label: "At Risk" },
    { id: "waiting", label: "Waiting on Others" },
    { id: "done", label: "Done" },
    { id: "dropped", label: "Dropped" }
  ];
  commitments.isClosed = function (c) { return c.status === "done" || c.status === "dropped"; };
  commitments.isOverdue = function (c) { return !commitments.isClosed(c) && c.due && c.due < S.today(); };
  commitments.open = function () { return commitments.all().filter(function (c) { return !commitments.isClosed(c); }); };
  commitments.overdue = function () { return commitments.open().filter(commitments.isOverdue); };
  commitments.dueThisWeek = function () {
    var t = S.today(), end = S.endOfWeek(t);
    return commitments.open().filter(function (c) { return c.due && c.due >= t && c.due <= end; });
  };
  commitments.followToday = function () {
    var t = S.today();
    return commitments.open().filter(function (c) { return c.follow && c.follow <= t; });
  };
  commitments.byDue = function (a, b) { return (a.due || "9999") < (b.due || "9999") ? -1 : (a.due || "9999") > (b.due || "9999") ? 1 : 0; };

  /* ---------- Wins ----------
     { id, date, title, impact, category, credit, evidence } */
  var wins = collection("wins");
  wins.CATEGORIES = ["Save", "Improvement", "Decision", "People", "Credibility", "Offshore"];

  /* ---------- Top Offenders ----------
     { id, name, pod, pages, hours, impact: none|low|medium|high, status, owner, due, lastSeen, notes } */
  var offenders = collection("offenders");
  offenders.IMPACT = { none: 0, low: 5, medium: 15, high: 30 };
  offenders.STATUSES = [
    { id: "unowned", label: "No Owner" },
    { id: "owned", label: "Owned, Not Started" },
    { id: "fixing", label: "Fix in Progress" },
    { id: "handed-back", label: "Handed Back to Pod" },
    { id: "fixed", label: "Fixed" },
    { id: "accepted", label: "Accepted Risk" }
  ];
  offenders.isClosed = function (o) { return o.status === "fixed" || o.status === "accepted"; };
  /* Pain score: pages + 2× engineer hours + customer impact weight (all per week). */
  offenders.score = function (o) { return (+o.pages || 0) + 2 * (+o.hours || 0) + (offenders.IMPACT[o.impact] || 0); };
  offenders.ranked = function () {
    return offenders.all().filter(function (o) { return !offenders.isClosed(o); }).sort(function (a, b) { return offenders.score(b) - offenders.score(a); });
  };

  /* ---------- Skills ----------
     ratings: { skillId: { r: 1-4, at: date } }, plus snapshots: [{ date, ratings }] */
  var skills = {
    ratings: function () { return S.get("skills", {}) || {}; },
    rate: function (id, v) { var r = skills.ratings(); r[id] = { r: v, at: S.today() }; S.set("skills", r); },
    focus: function () {
      var list = window.SRL_SKILLS || [], r = skills.ratings();
      var pinned = S.get("skill-focus", null);
      if (pinned) { var p = list.filter(function (s) { return s.id === pinned; })[0]; if (p) return p; }
      var rated = list.filter(function (s) { return r[s.id]; });
      if (!rated.length) return null;
      rated.sort(function (a, b) { return r[a.id].r - r[b.id].r; }); /* stable sort keeps map order on ties */
      return rated[0];
    }
  };

  /* ---------- Meetings (Meeting Prep history) ----------
     { id, type, title, date, attendees, questions: [text], notes: [{ kind, text, who, due }] } */
  var meetings = collection("meetings");

  S.data = { commitments: commitments, wins: wins, offenders: offenders, skills: skills, meetings: meetings };
})();
