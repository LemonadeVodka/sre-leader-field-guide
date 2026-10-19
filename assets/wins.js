/* Wins & Evidence Log: decisions, saves, and improvements, with their impact. Feeds updates and self-reviews. */
(function () {
  "use strict";
  var S = window.SRL, W = S.data.wins, esc = S.esc;
  var app = document.getElementById("wins-app");
  if (!app) return;
  var form = document.getElementById("win-form");
  var period = "quarter", cat = "all", editingId = null;

  function quarterStart(d) { var x = S.parse(d); return S.iso(new Date(x.getFullYear(), Math.floor(x.getMonth() / 3) * 3, 1)); }
  function range() {
    var t = S.today(), qs = quarterStart(t);
    if (period === "quarter") return [qs, "9999"];
    if (period === "last") { var p = S.parse(qs); p.setMonth(p.getMonth() - 3); return [S.iso(p), S.addDays(qs, -1)]; }
    if (period === "year") return [t.slice(0, 4) + "-01-01", "9999"];
    return ["0000", "9999"];
  }
  function filtered() {
    var r = range();
    return W.all().filter(function (w) { return w.date >= r[0] && w.date <= r[1] && (cat === "all" || w.category === cat); })
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  }

  function render() {
    document.getElementById("win-filters").innerHTML =
      [["quarter", "This Quarter"], ["last", "Last Quarter"], ["year", "This Year"], ["all", "All Time"]].map(function (p) {
        return '<button type="button" class="tab" data-period="' + p[0] + '" aria-pressed="' + (period === p[0]) + '">' + p[1] + '</button>';
      }).join("") + '<span style="flex-basis:100%"></span>' +
      ["all"].concat(W.CATEGORIES).map(function (c) {
        return '<button type="button" class="chip" data-cat="' + esc(c) + '" aria-pressed="' + (cat === c) + '">' + (c === "all" ? "All Types" : esc(c)) + '</button>';
      }).join("");
    var list = filtered(), out = document.getElementById("win-list");
    if (!list.length) { out.innerHTML = '<p class="empty">No wins here yet. Log one. Small counts: an alert you deleted, a runbook the offshore team can finally follow, a pod that took ownership.</p>'; return; }
    var months = {};
    list.forEach(function (w) { var k = w.date.slice(0, 7); (months[k] = months[k] || []).push(w); });
    out.innerHTML = Object.keys(months).sort().reverse().map(function (k) {
      var d = S.parse(k + "-01");
      return '<h3 style="margin:18px 0 6px">' + d.toLocaleDateString(undefined, { month: "long", year: "numeric" }) + ' <span class="small">' + months[k].length + '</span></h3><ul class="item-list">' + months[k].map(function (w) {
        return '<li class="item" style="--s:var(--ok)"><div class="item-head"><span class="item-title">' + esc(w.title) + '</span><span class="badge ok">' + esc(w.category) + '</span></div>' +
          (w.impact ? '<div style="margin-top:4px"><strong>Impact:</strong> ' + esc(w.impact) + '</div>' : '<div class="small" style="margin-top:4px;color:var(--warn)">Add the impact: hours saved, pages cut, customers protected, risk avoided.</div>') +
          '<div class="item-meta"><span>' + S.fmt(w.date) + '</span>' + (w.credit ? '<span>Credit: ' + esc(w.credit) + '</span>' : "") + (w.evidence ? '<span>Evidence: ' + esc(w.evidence) + '</span>' : "") + '</div>' +
          '<div class="item-actions"><button class="btn small" data-edit="' + esc(w.id) + '">Edit</button><button class="btn small danger" data-del="' + esc(w.id) + '">Delete</button></div></li>';
      }).join("") + '</ul>';
    }).join("");
  }

  function reset() {
    form.reset(); editingId = null; form.date.value = S.today();
    form.querySelector('[type="submit"]').textContent = "Log Win";
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var rec = {};
    ["date", "title", "impact", "category", "credit", "evidence"].forEach(function (k) { rec[k] = form[k].value.trim(); });
    if (!rec.title) return;
    if (!rec.date) rec.date = S.today();
    if (editingId) W.update(editingId, rec); else { W.add(rec); S.toast("Win logged"); }
    reset(); render();
  });

  app.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-period")) { period = b.getAttribute("data-period"); render(); return; }
    if (b.hasAttribute("data-cat")) { cat = b.getAttribute("data-cat"); render(); return; }
    if (b.hasAttribute("data-edit")) {
      var w = W.get(b.getAttribute("data-edit")); if (!w) return;
      editingId = w.id;
      ["date", "title", "impact", "category", "credit", "evidence"].forEach(function (k) { form[k].value = w[k] || ""; });
      form.querySelector('[type="submit"]').textContent = "Save Changes";
      form.scrollIntoView({ behavior: "smooth" }); form.title.focus(); return;
    }
    if (b.hasAttribute("data-del")) { if (confirm("Delete this win?")) { W.remove(b.getAttribute("data-del")); render(); } return; }
    if (b.id === "copy-review") {
      var list = filtered();
      if (!list.length) { S.toast("Nothing in this view to copy"); return; }
      S.copy(list.map(function (w) { return "- " + w.title + (w.impact ? ": " + w.impact : "") + (w.credit ? " (with " + w.credit + ")" : "") + " [" + S.fmt(w.date) + "]"; }).join("\n"));
      return;
    }
    if (b.id === "export-wins") {
      S.csv("wins-" + S.today() + ".csv", W.all(), [{ label: "Date", key: "date" }, { label: "Win", key: "title" }, { label: "Impact", key: "impact" }, { label: "Type", key: "category" }, { label: "Credit", key: "credit" }, { label: "Evidence", key: "evidence" }]);
    }
  });

  form.category.innerHTML = W.CATEGORIES.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join("");
  reset(); render();
  if (location.hash === "#add") setTimeout(function () { form.title.focus(); }, 50);
})();
