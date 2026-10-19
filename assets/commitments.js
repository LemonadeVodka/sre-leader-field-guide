/* Commitment Tracker: who owes what, by when, and what "done" means. Tracks date slips and writes nudge messages. */
(function () {
  "use strict";
  var S = window.SRL, C = S.data.commitments, esc = S.esc;
  var app = document.getElementById("commitments-app");
  if (!app) return;

  var view = location.hash === "#overdue" ? "overdue" : (C.overdue().length ? "overdue" : "open");
  var editingId = null, highlight = null;
  var form = document.getElementById("commit-form");

  var VIEWS = [
    { id: "overdue", label: "Overdue", list: function () { return C.overdue(); } },
    { id: "week", label: "Due This Week", list: function () { return C.dueThisWeek(); } },
    { id: "open", label: "All Open", list: function () { return C.open(); } },
    { id: "waiting", label: "Waiting on Others", list: function () { return C.open().filter(function (c) { return c.status === "waiting"; }); } },
    { id: "person", label: "By Person", list: function () { return C.open(); } },
    { id: "closed", label: "Done & Dropped", list: function () { return C.all().filter(C.isClosed); } }
  ];

  function statusLabel(id) { var s = C.STATUSES.filter(function (x) { return x.id === id; })[0]; return s ? s.label : id; }
  function badgeClass(c) { return C.isOverdue(c) ? "danger" : c.status === "at-risk" ? "warn" : c.status === "waiting" ? "info" : c.status === "done" ? "ok" : ""; }

  function itemHtml(c) {
    var od = C.isOverdue(c);
    return '<li class="item ' + (od ? "overdue" : c.status) + '" id="c-' + esc(c.id) + '"' + (highlight === c.id ? ' style="box-shadow:0 0 0 3px var(--accent-soft)"' : "") + '>' +
      '<div class="item-head"><span class="item-title">' + esc(c.what) + '</span><span class="badge ' + badgeClass(c) + '">' + (od ? "Overdue" : esc(statusLabel(c.status))) + '</span>' +
      (c.slips ? '<span class="badge warn" title="The due date has moved later this many times">Date moved ' + c.slips + '×</span>' : "") + '</div>' +
      '<div class="item-meta"><span><strong>' + esc(c.who || "No owner") + '</strong></span>' +
      '<span>' + (c.due ? (od ? "Was due " : "Due ") + S.fmt(c.due) + " (" + S.rel(c.due) + ")" : "No date: get one") + '</span>' +
      (c.follow && !C.isClosed(c) ? '<span>Follow up ' + S.rel(c.follow) + '</span>' : "") +
      (c.source ? '<span>From: ' + esc(c.source) + '</span>' : "") + '</div>' +
      (c.done ? '<div class="small" style="margin-top:4px"><strong>Done means:</strong> ' + esc(c.done) + '</div>' : '<div class="small" style="margin-top:4px;color:var(--warn)">No definition of done yet. Ask: "What will be true when this is done?"</div>') +
      (c.notes ? '<div class="small" style="margin-top:4px">' + esc(c.notes) + '</div>' : "") +
      '<div class="item-actions">' +
      (C.isClosed(c) ? '<button class="btn small" data-act="reopen" data-id="' + esc(c.id) + '">Reopen</button>' :
        '<button class="btn small primary" data-act="done" data-id="' + esc(c.id) + '">Done</button>' +
        '<button class="btn small" data-act="nudge" data-id="' + esc(c.id) + '">Write a Nudge</button>' +
        '<button class="btn small" data-act="snooze" data-id="' + esc(c.id) + '">Follow Up in 2 Days</button>' +
        '<button class="btn small" data-act="edit" data-id="' + esc(c.id) + '">Edit</button>' +
        '<button class="btn small" data-act="drop" data-id="' + esc(c.id) + '">Drop</button>') +
      '<button class="btn small danger" data-act="delete" data-id="' + esc(c.id) + '">Delete</button></div></li>';
  }

  function render() {
    var tabs = document.getElementById("commit-tabs");
    tabs.innerHTML = VIEWS.map(function (v) {
      return '<button type="button" class="tab" data-view="' + v.id + '" aria-pressed="' + (v.id === view) + '">' + v.label + '<span class="count">' + v.list().length + '</span></button>';
    }).join("");
    var v = VIEWS.filter(function (x) { return x.id === view; })[0];
    var list = v.list().slice().sort(C.byDue);
    var out = document.getElementById("commit-list");
    if (!list.length) { out.innerHTML = '<p class="empty">' + (view === "overdue" ? "Nothing overdue. Good." : "Nothing here yet.") + '</p>'; return; }
    if (view === "person") {
      var groups = {};
      list.forEach(function (c) { var k = (c.who || "No owner").trim(); (groups[k] = groups[k] || []).push(c); });
      out.innerHTML = Object.keys(groups).sort().map(function (k) {
        var g = groups[k], od = g.filter(C.isOverdue).length;
        return '<h3 style="margin:18px 0 6px">' + esc(k) + ' <span class="small">' + g.length + ' open' + (od ? ', <span style="color:var(--danger)">' + od + ' overdue</span>' : "") + '</span></h3><ul class="item-list">' + g.map(itemHtml).join("") + '</ul>';
      }).join("");
    } else out.innerHTML = '<ul class="item-list">' + list.map(itemHtml).join("") + '</ul>';
  }

  /* ---------- Form ---------- */
  function resetForm() {
    form.reset(); editingId = null;
    form.querySelector('[type="submit"]').textContent = "Add Commitment";
    document.getElementById("form-title").textContent = "Add a Commitment";
    document.getElementById("cancel-edit").hidden = true;
    form.due.value = S.addDays(S.today(), 7);
  }
  function fillForm(c) {
    editingId = c.id;
    ["what", "who", "due", "done", "status", "follow", "source", "notes"].forEach(function (k) { form[k].value = c[k] || (k === "status" ? "open" : ""); });
    form.querySelector('[type="submit"]').textContent = "Save Changes";
    document.getElementById("form-title").textContent = "Edit Commitment";
    document.getElementById("cancel-edit").hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    form.what.focus();
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var rec = {};
    ["what", "who", "due", "done", "status", "follow", "source", "notes"].forEach(function (k) { rec[k] = form[k].value.trim(); });
    if (!rec.what) return;
    if (!rec.follow && rec.due) rec.follow = S.addDays(rec.due, -2) < S.today() ? S.today() : S.addDays(rec.due, -2);
    if (editingId) {
      var old = C.get(editingId);
      if (old && old.due && rec.due && rec.due > old.due) { rec.slips = (old.slips || 0) + 1; S.toast("Date moved later. Slip recorded."); }
      if ((rec.status === "done" || rec.status === "dropped") && !(old && old.closed)) rec.closed = S.today();
      C.update(editingId, rec);
    } else {
      rec.slips = 0;
      C.add(rec);
      S.toast("Commitment added");
    }
    resetForm(); render();
  });
  document.getElementById("cancel-edit").addEventListener("click", resetForm);

  /* ---------- Nudge dialog ---------- */
  var dlg = document.getElementById("nudge-dialog");
  function nudgeText(c) {
    var who = (c.who || "there").split(/[\s(]/)[0], what = c.what, due = c.due ? S.fmt(c.due) : "the date we agreed";
    var msgs = [];
    if (c.slips >= 2) {
      msgs.push({ label: "To the owner: reset the conversation", text: "Hi " + who + ", " + what + " has moved " + c.slips + " times now. That's usually a sign something real is in the way, not effort. Can we take 15 minutes today to sort out which it is: rescope it, get you help, or set a new date with a checkpoint in the middle?" });
      msgs.push({ label: "To their manager: a heads-up, no blame", text: "Hi, a heads-up on " + what + " (" + (c.who || "owner") + "). The date has moved " + c.slips + " times, and it matters because " + (c.done ? "it's what gets us to: " + c.done : "[the impact]") + ". I don't think this is an effort problem. It looks like a priority or capacity conflict. Can we agree this week on whether it stays, gets help, or gets moved deliberately?" });
    } else if (C.isOverdue(c)) {
      msgs.push({ label: "Overdue check-in", text: "Hi " + who + ", " + what + " was due " + due + ". Where is it now, and what's a realistic new date? If something's in the way, tell me what it is and I'll help clear it." });
    } else if (c.status === "waiting") {
      msgs.push({ label: "Waiting on someone else", text: "Hi " + who + ", checking on " + what + ". We're waiting on this to move forward. Can you confirm you're still on track for " + due + ", or tell me what would help?" });
    } else {
      msgs.push({ label: "Friendly check-in before it's due", text: "Hi " + who + ", quick check on " + what + ". Still looking good for " + due + "? Anything blocking you that I can help with?" });
    }
    if (!c.done) msgs.push({ label: "Pin down \"done\"", text: "Hi " + who + ", on " + what + ": so we're aligned, what will be true when this is done? Something we could check, such as \"alert stops paging\" or \"runbook tested by the offshore shift\"." });
    return msgs;
  }
  function openNudge(c) {
    var msgs = nudgeText(c);
    dlg.querySelector(".nudge-body").innerHTML = msgs.map(function (m, i) {
      return '<h3 style="margin:10px 0 4px;font-size:15px">' + esc(m.label) + '</h3><pre id="nudge-' + i + '">' + esc(m.text) + '</pre><button class="btn small" data-copy="' + i + '">Copy</button>';
    }).join("");
    dlg._msgs = msgs;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }
  dlg.addEventListener("click", function (e) {
    var b = e.target.closest("[data-copy]");
    if (b) { S.copy(dlg._msgs[+b.getAttribute("data-copy")].text); return; }
    if (e.target.closest(".close-dialog")) dlg.close ? dlg.close() : dlg.removeAttribute("open");
  });

  /* ---------- List actions ---------- */
  app.addEventListener("click", function (e) {
    var t = e.target.closest("[data-view]");
    if (t) { view = t.getAttribute("data-view"); render(); return; }
    var b = e.target.closest("[data-act]");
    if (!b) return;
    var id = b.getAttribute("data-id"), c = C.get(id), act = b.getAttribute("data-act");
    if (!c) return;
    if (act === "done") { C.update(id, { status: "done", closed: S.today() }); S.toast("Done. Consider logging it as a win."); }
    else if (act === "drop") { C.update(id, { status: "dropped", closed: S.today() }); S.toast("Dropped. Tell whoever was expecting it."); }
    else if (act === "reopen") { C.update(id, { status: "open", closed: "" }); }
    else if (act === "snooze") { C.update(id, { follow: S.addDays(S.today(), 2) }); S.toast("Follow-up set for " + S.fmt(S.addDays(S.today(), 2))); }
    else if (act === "edit") { fillForm(c); return; }
    else if (act === "nudge") { openNudge(c); return; }
    else if (act === "delete") { if (!confirm("Delete this commitment permanently?")) return; C.remove(id); }
    render();
  });

  document.getElementById("export-csv").addEventListener("click", function () {
    S.csv("commitments-" + S.today() + ".csv", C.all(), [
      { label: "What", key: "what" }, { label: "Who", key: "who" }, { label: "Due", key: "due" }, { label: "Done Means", key: "done" },
      { label: "Status", get: function (c) { return C.isOverdue(c) ? "Overdue" : statusLabel(c.status); } },
      { label: "Times Date Moved", key: "slips" }, { label: "Next Follow-Up", key: "follow" }, { label: "Source", key: "source" },
      { label: "Notes", key: "notes" }, { label: "Created", key: "created" }, { label: "Closed", key: "closed" }
    ]);
  });

  /* ---------- Deep links: #add, #overdue, #c-<id> ---------- */
  resetForm();
  var m = /^#c-(.+)$/.exec(location.hash);
  if (m && C.get(m[1])) {
    var c0 = C.get(m[1]);
    highlight = c0.id;
    view = C.isClosed(c0) ? "closed" : "open";
    render();
    var el = document.getElementById("c-" + c0.id); if (el) el.scrollIntoView({ block: "center" });
  } else {
    render();
    if (location.hash === "#add") setTimeout(function () { form.what.focus(); }, 50);
  }
})();
