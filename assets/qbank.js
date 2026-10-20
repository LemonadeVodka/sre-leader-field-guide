/* Question Bank renderer. Three modes, chosen by the container's attribute:
     data-qgroup="noc"      every situation in a group, one H2 section each (Question Bank pages)
     data-qsit="sre-daily"  one situation's questions only (meeting playbooks, RCA pages)
     data-qsearch           search across all questions (home page); also forwards old #situation links
   Calls SRL_buildToc() after rendering so "On this page" sees the new headings. */
(function () {
  "use strict";
  var S = window.SRL, esc = S.esc, Q = window.SRL_QUESTIONS, SIT = window.SRL_SITUATIONS, GROUPS = window.SRL_GROUPS;
  var root = document.body.getAttribute("data-root") || "./";

  function sit(id) { return SIT.filter(function (s) { return s.id === id; })[0]; }
  function group(id) { return GROUPS.filter(function (g) { return g.id === id; })[0]; }
  function questionsFor(id) { return Q.filter(function (q) { return q.tags.indexOf(id) >= 0; }); }
  function sitUrl(s) { return root + (s.playbook ? s.playbook + "#questions" : group(s.group).page + "#" + s.id); }

  /* Highlight search terms inside already-escaped text. */
  function mark(text, terms) {
    var out = esc(text);
    if (!terms || !terms.length) return out;
    terms.forEach(function (t) {
      var re = new RegExp("(" + esc(t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
      out = out.replace(re, "<mark>$1</mark>");
    });
    return out;
  }

  /* Each card: the question, why it builds credibility (always visible), what to ask next, then coaching notes. */
  function item(q, terms, extra) {
    var m = /^\(((?:To|On|Opening|Weekly)[^)]*)\)\s*/.exec(q.q), who = m ? m[1] : "", text = m ? q.q.slice(m[0].length) : q.q;
    return '<li class="qitem"' + (extra ? " hidden" : "") + '><p class="q-text">' + (who ? '<span class="q-who">' + esc(who) + ': </span>' : "") + mark(text, terms) + '</p>' +
      '<p class="q-why"><span class="q-why-label">Builds credibility:</span> ' + mark(q.signal, terms) + '</p>' +
      (q.next ? '<p class="q-next"><strong>Ask next:</strong> ' + mark(q.next, terms) + '</p>' : "") +
      '<details class="q-notes"><summary>Coaching notes</summary><dl>' +
      '<dt>Strong answer</dt><dd>' + mark(q.strong, terms) + '</dd>' +
      '<dt>Weak answer</dt><dd>' + mark(q.weak, terms) + '</dd></dl></details></li>';
  }
  /* Long lists show three "start here" questions (starred for this situation, else the first three), then "Show all N".
     Search results always show everything. */
  var listSeq = 0;
  function list(qs, terms, sitId) {
    var collapse = !terms && sitId && qs.length > 4;
    if (collapse) {
      var starred = qs.filter(function (q) { return q.star && q.star.indexOf(sitId) >= 0; });
      if (starred.length) qs = starred.concat(qs.filter(function (q) { return starred.indexOf(q) < 0; }));
    }
    var id = "ql-" + (++listSeq);
    return '<ol class="qlist" id="' + id + '">' + qs.map(function (q, i) { return item(q, terms, collapse && i >= 3); }).join("") + '</ol>' +
      (collapse ? '<p class="q-more-row"><button type="button" class="q-more" aria-expanded="false" aria-controls="' + id + '" data-total="' + qs.length + '">Show all ' + qs.length + ' questions</button></p>' : "");
  }
  function setMore(btn, open) {
    var ol = document.getElementById(btn.getAttribute("aria-controls"));
    Array.prototype.forEach.call(ol.querySelectorAll(".qitem"), function (li, i) { if (i >= 3) li.hidden = !open; });
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.textContent = open ? "Show the top 3 only" : "Show all " + btn.getAttribute("data-total") + " questions";
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".q-more");
    if (b) setMore(b, b.getAttribute("aria-expanded") !== "true");
  });
  window.addEventListener("beforeprint", function () { Array.prototype.forEach.call(document.querySelectorAll(".q-more"), function (b) { setMore(b, true); }); });
  function extras(s) {
    var bits = [];
    if (s.concept) bits.push('Concept: <a href="' + root + esc(s.concept.u) + '">' + esc(s.concept.t) + '</a>');
    if (s.also && s.also.length) bits.push('See also: ' + s.also.map(function (a) { return '<a href="' + root + esc(a.u) + '">' + esc(a.t) + '</a>'; }).join(" · "));
    if (s.read && s.read.length) bits.push('Go deeper: ' + s.read.map(function (r) { return '<a href="' + esc(r.u) + '" target="_blank" rel="noopener">' + esc(r.t) + '<span class="visually-hidden"> (opens in a new tab)</span></a>'; }).join(" · "));
    return bits.length ? '<p class="q-where">' + bits.join(" &nbsp;|&nbsp; ") + '</p>' : "";
  }

  /* ---------- Mode 1: a whole group ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-qgroup]"), function (el) {
    var g = el.getAttribute("data-qgroup");
    el.innerHTML = SIT.filter(function (s) { return s.group === g; }).map(function (s) {
      var qs = questionsFor(s.id);
      return '<section aria-labelledby="' + s.id + '"><h2 id="' + s.id + '">' + esc(s.label) + '</h2>' +
        '<p class="qsit-intro">' + esc(s.blurb) + '</p>' +
        (s.playbook ? '<p><a href="' + root + esc(s.playbook) + '"><strong>Open the ' + esc(s.label) + ' playbook</strong></a>: the 30-minute agenda and all ' + qs.length + ' questions in one place.</p>' : list(qs, null, s.id)) +
        extras(s) + '</section>';
    }).join("");
  });

  /* ---------- Mode 2: one situation ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-qsit]"), function (el) {
    var s = sit(el.getAttribute("data-qsit"));
    if (s) el.innerHTML = list(questionsFor(s.id), null, s.id) + extras(s);
  });

  /* ---------- Mode 3: search (home page) ---------- */
  var box = document.querySelector("[data-qsearch]");
  if (box) {
    /* Forward links from the old single-page bank: index.html#<situation> or #g-<group>. */
    var LEGACY_SIT = { live: "inc-first15", vendor: "vendor-discovery" };
    var LEGACY_GROUP = { tech: "meetings", meet: "meetings", peers: "peers", cred: "cred", team: "team", noc: "noc" };
    var forward = function () {
      var h = location.hash.slice(1), target = null;
      if (LEGACY_SIT[h]) h = LEGACY_SIT[h];
      if (sit(h)) target = sitUrl(sit(h));
      else if (/^g-/.test(h) && LEGACY_GROUP[h.slice(2)]) target = root + group(LEGACY_GROUP[h.slice(2)]).page;
      if (target) location.replace(target);
      return !!target;
    };
    window.addEventListener("hashchange", forward);
    if (forward()) return;

    var SUGGEST = ["stuck", "escalate", "owner", "rollback", "agenda", "status"];
    box.innerHTML =
      '<label for="q-search">Search ' + Q.length + ' questions</label>' +
      '<div class="search-row"><input type="search" id="q-search" autocomplete="off" aria-describedby="q-search-hint" placeholder="Try: stuck, escalate, agenda, status"><kbd aria-hidden="true">/</kbd></div>' +
      '<p class="search-hint" id="q-search-hint">Results appear as you type. Press <kbd>/</kbd> to jump here.</p>' +
      '<div class="results" id="q-results" aria-live="polite"></div>';
    var input = document.getElementById("q-search"), out = document.getElementById("q-results"), timer = null;

    function run() {
      var raw = input.value.trim();
      if (raw.length < 2) { out.innerHTML = ""; return; }
      var terms = raw.toLowerCase().split(/\s+/).filter(Boolean);
      var hits = Q.filter(function (q) {
        var hay = [q.q, q.next, q.signal, q.strong, q.weak].join(" ").toLowerCase();
        return terms.every(function (t) { return hay.indexOf(t) >= 0; });
      });
      if (!hits.length) {
        out.innerHTML = '<div class="empty"><p style="margin:0 0 8px">No questions match "' + esc(raw) + '".</p><p style="margin:0">Try: ' +
          SUGGEST.map(function (w) { return '<button type="button" class="link-btn" data-suggest="' + esc(w) + '">' + esc(w) + '</button>'; }).join(" · ") + '</p></div>';
        return;
      }
      var bySit = {};
      hits.forEach(function (q) { var first = q.tags[0]; (bySit[first] = bySit[first] || []).push(q); });
      out.innerHTML = '<p class="search-hint">' + hits.length + ' question' + (hits.length === 1 ? "" : "s") + ' match.</p>' +
        SIT.filter(function (s) { return bySit[s.id]; }).map(function (s) {
          return '<h3><a href="' + sitUrl(s) + '">' + esc(group(s.group).label) + ': ' + esc(s.label) + '</a></h3>' + list(bySit[s.id], terms);
        }).join("");
    }
    input.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(run, 120); });
    out.addEventListener("click", function (e) {
      var b = e.target.closest("[data-suggest]");
      if (b) { input.value = b.getAttribute("data-suggest"); run(); input.focus(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target.tagName;
      if (t === "INPUT" || t === "TEXTAREA" || e.target.isContentEditable) return;
      e.preventDefault(); input.focus();
    });
  }

  if (window.SRL_buildToc) window.SRL_buildToc();
})();
