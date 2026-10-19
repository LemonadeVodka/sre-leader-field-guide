/* Top Offenders Board: the recurring issues that cause most of the pain, ranked by pages, hours, and customer impact. */
(function () {
  "use strict";
  var S = window.SRL, O = S.data.offenders, esc = S.esc;
  var app = document.getElementById("offenders-app");
  if (!app) return;
  var form = document.getElementById("off-form"), editingId = null;
  var FIELDS = ["name", "pod", "pages", "hours", "impact", "status", "owner", "due", "lastSeen", "notes"];

  function statusLabel(id) { var s = O.STATUSES.filter(function (x) { return x.id === id; })[0]; return s ? s.label : id; }
  function statusClass(id) { return id === "unowned" ? "danger" : id === "fixing" ? "info" : id === "fixed" ? "ok" : "warn"; }

  function render() {
    var open = O.ranked(), closed = O.all().filter(O.isClosed);
    var pages = 0, hours = 0;
    open.forEach(function (o) { pages += +o.pages || 0; hours += +o.hours || 0; });
    document.getElementById("off-kpi").innerHTML =
      '<div class="kpi"><div><b>' + open.length + '</b><span>Open offenders</span></div><div class="' + (pages > 20 ? "danger" : "") + '"><b>' + pages + '</b><span>Pages a week</span></div>' +
      '<div class="' + (hours > 20 ? "warn" : "") + '"><b>' + hours + '</b><span>Engineer hours a week</span></div><div><b>' + (hours / 40).toFixed(1) + '</b><span>Engineers\' worth of time</span></div>' +
      '<div class="' + (open.filter(function (o) { return o.status === "unowned"; }).length ? "danger" : "") + '"><b>' + open.filter(function (o) { return o.status === "unowned"; }).length + '</b><span>With no owner</span></div></div>';

    var out = document.getElementById("off-list");
    out.innerHTML = open.length ? '<div class="table-wrap"><table><thead><tr><th>#</th><th>Issue</th><th>Pages/wk</th><th>Hrs/wk</th><th>Impact</th><th>Status</th><th>Pain</th><th></th></tr></thead><tbody>' + open.map(function (o, i) {
      return '<tr><td><strong>' + (i + 1) + '</strong></td><td><strong>' + esc(o.name) + '</strong><div class="small">' + esc(o.pod || "No pod") + (o.owner ? " · " + esc(o.owner) : "") + (o.due ? " · due " + S.fmt(o.due) : "") + (o.lastSeen ? " · last seen " + S.rel(o.lastSeen) : "") + '</div>' + (o.notes ? '<div class="small">' + esc(o.notes) + '</div>' : "") + '</td>' +
        '<td>' + (o.pages || 0) + '</td><td>' + (o.hours || 0) + '</td><td>' + esc(o.impact || "none") + '</td><td><span class="badge ' + statusClass(o.status) + '">' + esc(statusLabel(o.status)) + '</span></td><td><strong>' + O.score(o) + '</strong></td>' +
        '<td style="white-space:nowrap"><button class="btn small" data-case="' + esc(o.id) + '">Make the Case</button> <button class="btn small" data-edit="' + esc(o.id) + '">Edit</button> <button class="btn small" data-fixed="' + esc(o.id) + '">Fixed</button></td></tr>';
    }).join("") + '</tbody></table></div>' : '<p class="empty">Nothing logged yet. Start with whatever paged the most last week. A rough count is fine.</p>';

    document.getElementById("off-closed").innerHTML = closed.length ? '<ul class="item-list">' + closed.map(function (o) {
      return '<li class="item done"><div class="item-head"><span class="item-title">' + esc(o.name) + '</span><span class="badge ' + statusClass(o.status) + '">' + esc(statusLabel(o.status)) + '</span></div><div class="item-meta"><span>' + esc(o.pod || "") + '</span><span>Was ' + (o.pages || 0) + ' pages/wk</span>' + (o.closed ? '<span>Closed ' + S.fmt(o.closed) + '</span>' : "") + '</div><div class="item-actions"><button class="btn small" data-reopen="' + esc(o.id) + '">Reopen</button><button class="btn small danger" data-del="' + esc(o.id) + '">Delete</button></div></li>';
    }).join("") + '</ul>' : '<p class="small">Fixed and accepted items show here. They\'re your evidence that prevention works, so log them as wins too.</p>';
  }

  function caseText(o) {
    var hrs = +o.hours || 0, pages = +o.pages || 0;
    return [
      "Reliability issue: " + o.name,
      "",
      "What it costs us, per week: about " + pages + " pages to on-call and " + hrs + " engineer hours (roughly " + Math.round(hrs * 4.3) + " hours a month, or " + (hrs / 40).toFixed(1) + " of an engineer's time)." + (o.impact && o.impact !== "none" ? " Customer impact: " + o.impact + "." : ""),
      "Owner: " + (o.pod || "[owning team]") + (o.owner ? " (" + o.owner + ")" : "") + ". Status: " + statusLabel(o.status) + ".",
      "",
      "What SRE is doing: triaging it every time it fires and keeping the service up. That's time we're not spending on prevention.",
      "The ask: a named owner on the " + (o.pod || "owning") + " side and a fix date" + (o.due ? " (we'd proposed " + S.fmt(o.due) + ")" : "") + ". If it can't be fixed this quarter, let's agree that explicitly and decide who carries the pager for it in the meantime.",
      "",
      "Happy to walk through the data."
    ].join("\n");
  }

  function reset() {
    form.reset(); editingId = null; form.lastSeen.value = S.today();
    form.querySelector('[type="submit"]').textContent = "Add to Board";
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var rec = {};
    FIELDS.forEach(function (k) { rec[k] = form[k].value.trim(); });
    if (!rec.name) return;
    rec.pages = +rec.pages || 0; rec.hours = +rec.hours || 0;
    if (O.isClosed(rec)) rec.closed = S.today();
    if (editingId) O.update(editingId, rec); else { O.add(rec); S.toast("Added. Bring #1 to its owner this week."); }
    reset(); render();
  });

  app.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    var id;
    if ((id = b.getAttribute("data-edit"))) {
      var o = O.get(id); if (!o) return; editingId = id;
      FIELDS.forEach(function (k) { form[k].value = o[k] == null ? "" : o[k]; });
      form.querySelector('[type="submit"]').textContent = "Save Changes";
      form.scrollIntoView({ behavior: "smooth" }); return;
    }
    if ((id = b.getAttribute("data-fixed"))) { O.update(id, { status: "fixed", closed: S.today() }); S.toast("Fixed. Log it as a win with the before/after numbers."); render(); return; }
    if ((id = b.getAttribute("data-reopen"))) { O.update(id, { status: "owned", closed: "" }); render(); return; }
    if ((id = b.getAttribute("data-del"))) { if (confirm("Delete this offender?")) { O.remove(id); render(); } return; }
    if ((id = b.getAttribute("data-case"))) { var oo = O.get(id); if (oo) { S.copy(caseText(oo)); S.toast("Business case copied. Edit before sending."); } return; }
    if (b.id === "export-off") {
      S.csv("top-offenders-" + S.today() + ".csv", O.all(), [
        { label: "Issue", key: "name" }, { label: "Pod", key: "pod" }, { label: "Owner", key: "owner" }, { label: "Pages/wk", key: "pages" }, { label: "Hours/wk", key: "hours" },
        { label: "Customer Impact", key: "impact" }, { label: "Status", get: function (o) { return statusLabel(o.status); } }, { label: "Pain Score", get: O.score },
        { label: "Fix Due", key: "due" }, { label: "Last Seen", key: "lastSeen" }, { label: "Notes", key: "notes" }
      ]);
    }
  });

  form.status.innerHTML = O.STATUSES.map(function (s) { return '<option value="' + s.id + '">' + esc(s.label) + '</option>'; }).join("");
  reset(); render();
  if (location.hash === "#add") setTimeout(function () { form.name.focus(); }, 50);
})();
