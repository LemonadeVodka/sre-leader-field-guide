/* Question Bank page: filter by situation (from the URL hash too) and search. */
(function () {
  "use strict";
  var S = window.SRL, esc = S.esc, Q = window.SRL_QUESTIONS, SIT = window.SRL_SITUATIONS;
  var app = document.getElementById("qbank");
  if (!app) return;
  var active = "all", term = "";
  var h = location.hash.slice(1);
  if (SIT.some(function (s) { return s.id === h; })) active = h;
  function label(id) { var s = SIT.filter(function (x) { return x.id === id; })[0]; return s ? s.label : id; }

  app.innerHTML = '<div class="tool" style="padding:12px 14px"><label class="field">Search<input type="search" id="q-search" placeholder="Try: rollback, owner, offshore, dashboard"></label>' +
    '<div class="tabs" id="q-chips" role="group" aria-label="Situations"></div></div><p class="small" id="q-count"></p><div id="q-list" style="display:grid;gap:10px"></div>';

  function render() {
    document.getElementById("q-chips").innerHTML = [{ id: "all", label: "All" }].concat(SIT).map(function (s) {
      var n = s.id === "all" ? Q.length : Q.filter(function (q) { return q.tags.indexOf(s.id) >= 0; }).length;
      return '<button type="button" class="chip" data-sit="' + s.id + '" aria-pressed="' + (active === s.id) + '">' + esc(s.label) + ' <span class="small">' + n + '</span></button>';
    }).join("");
    var t = term.toLowerCase();
    var list = Q.filter(function (q) {
      return (active === "all" || q.tags.indexOf(active) >= 0) && (!t || (q.q + " " + q.strong + " " + q.weak).toLowerCase().indexOf(t) >= 0);
    });
    document.getElementById("q-count").textContent = list.length + " question" + (list.length === 1 ? "" : "s");
    document.getElementById("q-list").innerHTML = list.length ? list.map(function (q) {
      return '<div class="q"><div class="q-text">' + esc(q.q) + '</div><div class="q-tags">' + q.tags.map(function (g) { return '<span class="badge">' + esc(label(g)) + '</span>'; }).join("") + '</div>' +
        '<details><summary>What good and bad answers sound like</summary><div class="strong"><strong>Strong:</strong> ' + esc(q.strong) + '</div><div class="weak"><strong>Weak:</strong> ' + esc(q.weak) + '</div></details>' +
        '<div style="margin-top:6px"><button class="link-btn" data-copyq="' + esc(q.q) + '">Copy question</button></div></div>';
    }).join("") : '<p class="empty">No matches. Try a different word.</p>';
  }

  app.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-sit")) { active = b.getAttribute("data-sit"); history.replaceState(null, "", active === "all" ? location.pathname : "#" + active); render(); }
    if (b.hasAttribute("data-copyq")) S.copy(b.getAttribute("data-copyq"));
  });
  document.getElementById("q-search").addEventListener("input", function (e) { term = e.target.value; render(); });
  render();
})();
