/* Question Bank: browse by audience and situation (synced with the URL hash), or search everything.
   Hash forms: #<situation-id>, #g-<group-id>, or empty for everything. */
(function () {
  "use strict";
  var S = window.SRL, esc = S.esc, Q = window.SRL_QUESTIONS, SIT = window.SRL_SITUATIONS, GROUPS = window.SRL_GROUPS;
  var app = document.getElementById("qbank");
  if (!app) return;
  var term = "";

  function sit(id) { return SIT.filter(function (s) { return s.id === id; })[0]; }
  function group(id) { return GROUPS.filter(function (g) { return g.id === id; })[0]; }
  function questionsFor(sitId) { return Q.filter(function (q) { return q.tags.indexOf(sitId) >= 0; }); }
  function inGroup(q, g) { return q.tags.some(function (t) { var s = sit(t); return s && s.group === g; }); }
  function state() {
    var h = location.hash.slice(1);
    if (sit(h)) return { sit: h, group: sit(h).group };
    if (/^g-/.test(h) && group(h.slice(2))) return { sit: "", group: h.slice(2) };
    return { sit: "", group: "" };
  }

  app.innerHTML =
    '<div class="qbar"><label class="field">Search all ' + Q.length + ' questions<input type="search" id="q-search" placeholder="Try: rollback, owner, escalate, handoff, not technical"></label>' +
    '<div class="tabs" id="q-groups" role="group" aria-label="Audience"></div><div class="tabs" id="q-sits" role="group" aria-label="Situation"></div></div>' +
    '<div id="q-intro"></div><div id="q-list"></div>';

  function card(q, showSits) {
    var m = /^\((To [^)]+)\)\s*/.exec(q.q), who = m ? m[1] : "", text = m ? q.q.slice(m[0].length) : q.q;
    return '<div class="q">' +
      (who ? '<div class="q-who">' + esc(who) + '</div>' : "") +
      '<div class="q-text">' + esc(text) + '</div>' +
      (showSits ? '<div class="q-tags">' + q.tags.map(function (t) { var s = sit(t); return s ? '<a class="badge" href="#' + t + '">' + esc(s.label) + '</a>' : ""; }).join("") + '</div>' : "") +
      '<div class="q-next"><span class="q-label">If the answer is weak, ask next</span>' + esc(q.next) + '</div>' +
      '<div class="q-signal"><span class="q-label">What asking this signals</span>' + esc(q.signal) + '</div>' +
      '<details><summary>Strong vs weak answers</summary><div class="strong"><strong>Strong:</strong> ' + esc(q.strong) + '</div><div class="weak"><strong>Weak:</strong> ' + esc(q.weak) + '</div></details>' +
      '<button type="button" class="link-btn q-copy" data-copy="' + esc(text) + '">Copy question</button></div>';
  }
  function grid(list, showSits) { return '<div class="q-grid">' + list.map(function (q) { return card(q, showSits); }).join("") + '</div>'; }
  function sitSection(s) {
    var list = questionsFor(s.id);
    return '<section class="q-section"><h3 data-notoc><a href="#' + s.id + '">' + esc(s.label) + '</a> <span class="small">' + list.length + '</span></h3>' +
      '<p class="q-blurb">' + esc(s.blurb) + '</p>' + grid(list, false) + '</section>';
  }
  function groupSection(g) {
    return '<h2 class="q-group-head" data-notoc>' + esc(g.label) + '</h2>' + SIT.filter(function (x) { return x.group === g.id; }).map(sitSection).join("");
  }

  function render() {
    var st = state(), t = term.trim().toLowerCase();
    document.getElementById("q-groups").innerHTML = [{ id: "", label: "Everything" }].concat(GROUPS).map(function (g) {
      var n = g.id ? Q.filter(function (q) { return inGroup(q, g.id); }).length : Q.length;
      return '<a class="chip" href="' + (g.id ? "#g-" + g.id : "#all") + '" aria-pressed="' + (st.group === g.id && !t) + '">' + esc(g.label) + ' <span class="small">' + n + '</span></a>';
    }).join("");
    var sits = st.group && !t ? SIT.filter(function (s) { return s.group === st.group; }) : [];
    document.getElementById("q-sits").innerHTML = sits.map(function (s) {
      return '<a class="chip small-chip" href="#' + (st.sit === s.id ? "g-" + st.group : s.id) + '" aria-pressed="' + (st.sit === s.id) + '">' + esc(s.label.replace(/^NOC: /, "")) + ' <span class="small">' + questionsFor(s.id).length + '</span></a>';
    }).join("");

    var intro = document.getElementById("q-intro"), out = document.getElementById("q-list");
    if (t) {
      var hits = Q.filter(function (q) { return [q.q, q.strong, q.weak, q.next, q.signal].join(" ").toLowerCase().indexOf(t) >= 0; });
      intro.innerHTML = '<p class="small">' + hits.length + ' question' + (hits.length === 1 ? "" : "s") + ' match "' + esc(term.trim()) + '"</p>';
      out.innerHTML = hits.length ? grid(hits, true) : '<p class="empty">No matches. Try a shorter word.</p>';
    } else if (st.sit) {
      var s = sit(st.sit), list = questionsFor(s.id);
      intro.innerHTML = '<div class="box use-when"><span class="box-label">' + esc(group(s.group).label) + ' · ' + list.length + ' questions</span>' +
        '<h2 data-notoc class="q-sit-title">' + esc(s.label) + '</h2><p>' + esc(s.blurb) + '</p>' +
        (s.read && s.read.length ? '<p class="small q-read">Go deeper: ' + s.read.map(function (r) { return '<a href="' + esc(r.u) + '" target="_blank" rel="noopener">' + esc(r.t) + ' ↗</a>'; }).join(" · ") + '</p>' : "") + '</div>';
      out.innerHTML = grid(list, false);
    } else if (st.group) {
      intro.innerHTML = "";
      out.innerHTML = groupSection(group(st.group));
    } else {
      intro.innerHTML = "";
      out.innerHTML = GROUPS.map(groupSection).join("");
    }
  }

  app.addEventListener("click", function (e) {
    var b = e.target.closest("[data-copy]");
    if (b) S.copy(b.getAttribute("data-copy"));
  });
  document.getElementById("q-search").addEventListener("input", function (e) { term = e.target.value; render(); });
  window.addEventListener("hashchange", function () {
    if (term) { term = ""; document.getElementById("q-search").value = ""; }
    render();
    if (location.hash) app.scrollIntoView({ block: "start" });
  });
  render();
  if (location.hash && location.hash !== "#all") setTimeout(function () { app.scrollIntoView({ block: "start" }); }, 0);
})();
