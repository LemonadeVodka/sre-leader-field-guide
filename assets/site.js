/* SRE Leader's Field Guide — shared page chrome.
   Pages provide <body data-root="./|../" data-page="id"> and empty #site-header, #sidebar, #crumbs, #pager, #toc, #footer slots.
   Pages whose content is rendered by script set data-toc="deferred" and call SRL_buildToc() themselves (qbank.js does). */
(function () {
  "use strict";

  var UPDATED = "October 20, 2026"; /* bump on each release */
  /* The rail: sections by moment, incident first. "tone" colors the section (incident amber, postmortem blue, projects green...).
     Items with "label" are sub-headings inside a section (not links). "reference" sections sit below a divider. */
  var NAV = [
    { section: "Today", tone: "today", hint: "Start here", items: [
      { id: "home", href: "index.html", title: "Today" },
      { id: "today", href: "today.html", title: "Questions for Today" },
      { id: "lessons", href: "lessons.html", title: "Daily Lessons" },
      { id: "paths", href: "learn/paths.html", title: "Learning Paths" },
      { id: "p-fw", href: "playbooks/frameworks.html", title: "Pocket Frameworks" }
    ]},
    { section: "Incident", tone: "incident", hint: "LEAD", items: [
      { id: "p-driver", href: "playbooks/incident-driver.html", title: "Move a Stuck Incident" },
      { id: "p-stuck", href: "playbooks/stuck-incident.html", title: "Stuck Incident: Deep Dive" },
      { id: "p-debrief", href: "playbooks/leader-debrief.html", title: "Leader Debrief" },
      { id: "x-incident", href: "playbooks/example-incident.html", title: "Example: Tuesday's Incident" }
    ]},
    { section: "Request Map", tone: "map", hint: "Where things live", items: [
      { id: "ai-map", href: "ai/request-map.html", title: "Request Map" }
    ]},
    { section: "Postmortem", tone: "pm", hint: "PREP · SAFER · CLOSE", items: [
      { id: "p-pmprog", href: "playbooks/postmortem-program.html", title: "Owning Postmortems" },
      { id: "p-pm", href: "playbooks/postmortem-meeting.html", title: "The Postmortem Meeting" },
      { id: "x-postmortem", href: "playbooks/example-postmortem.html", title: "Example: Thursday's Postmortem" },
      { id: "rca-day1", href: "rca/day-one.html", title: "RCA Day One" },
      { id: "rca-run", href: "rca/run-an-rca.html", title: "Running an RCA" },
      { id: "rca-judge", href: "rca/judge-an-rca.html", title: "Judging an RCA" },
      { id: "rca-template", href: "rca/template.html", title: "RCA Template" }
    ]},
    { section: "Projects", tone: "projects", hint: "PACE · Linear", items: [
      { id: "p-where", href: "playbooks/where-are-we.html", title: "Where Are We?" },
      { id: "p-waiting", href: "playbooks/waiting-on.html", title: "\"I'm Waiting On…\"" },
      { id: "p-linear", href: "playbooks/linear.html", title: "Running Projects in Linear" },
      { id: "p-task", href: "playbooks/running-a-task.html", title: "Running a Task" },
      { id: "p-risk", href: "playbooks/risk-register.html", title: "Risk Register" },
      { id: "x-status", href: "playbooks/example-status.html", title: "Example: Monday's Sweep" },
      { id: "x-risk", href: "playbooks/example-risk.html", title: "Example: Nobody Will Fix It" }
    ]},
    { section: "Meetings", tone: "meetings", hint: "Agendas · rules", items: [
      { id: "p-starter", href: "playbooks/meeting-starter.html", title: "Meeting Starter" },
      { id: "m-daily", href: "meetings/sre-daily.html", title: "SRE Daily" },
      { id: "m-perf", href: "meetings/performance-engineering.html", title: "Performance Engineering" },
      { id: "p-vendor", href: "playbooks/vendor-demo.html", title: "Vendor Demos" }
    ]},
    { section: "Ask", tone: "ref", hint: "Question Bank", reference: true, items: [
      { id: "q-incidents", href: "questions/incidents.html", title: "During & After Incidents" },
      { id: "q-projects", href: "questions/projects.html", title: "Running Tasks & Projects" },
      { id: "q-meetings", href: "questions/technical-meetings.html", title: "In Technical Meetings" },
      { id: "q-peers", href: "questions/peers-leaders.html", title: "With Peers & Leaders" },
      { id: "q-noc", href: "questions/offshore-noc.html", title: "With the Offshore NOC" },
      { id: "q-team", href: "questions/sre-team.html", title: "With Your SRE Team" },
      { id: "q-ai", href: "questions/ai-product.html", title: "Supporting the AI Product" },
      { id: "q-vendors", href: "questions/vendors.html", title: "With Vendors" },
      { id: "q-cred", href: "questions/credibility.html", title: "Building Credibility" }
    ]},
    { section: "Learn", tone: "ref", hint: "Study time", reference: true, items: [
      { label: "Start here" },
      { id: "c-obs-day1", href: "concepts/observability-day-one.html", title: "Observability Day One" },
      { id: "rca", href: "rca/index.html", title: "RCA the SRE Way" },
      { id: "rca-example", href: "rca/worked-example.html", title: "RCA Worked Example" },
      { label: "SRE concepts" },
      { id: "c-index", href: "concepts/index.html", title: "Concepts Overview" },
      { id: "c-targets", href: "concepts/reliability-targets.html", title: "Reliability Targets" },
      { id: "c-obs", href: "concepts/observability.html", title: "Observability & Telemetry" },
      { id: "c-alerting", href: "concepts/alerting-incidents.html", title: "Alerting & Incidents" },
      { id: "c-change", href: "concepts/change-and-toil.html", title: "Change & Toil" },
      { id: "c-capacity", href: "concepts/capacity-readiness.html", title: "Capacity & Readiness" },
      { label: "AI reliability" },
      { id: "ai", href: "ai/index.html", title: "What's Different About AI" },
      { id: "ai-latency", href: "ai/latency.html", title: "Latency: TTFT & TTLT" },
      { id: "ai-tokens", href: "ai/tokens-quotas-cost.html", title: "Tokens, Quotas & Cost" },
      { id: "ai-quality", href: "ai/quality-safety.html", title: "Quality & Safety" },
      { id: "ai-agents", href: "ai/agents-dependencies.html", title: "Agents & Model Providers" },
      { label: "Implementation" },
      { id: "impl", href: "implement/index.html", title: "Roadmap & Self-Check" },
      { id: "impl-own", href: "implement/ownership-engagement.html", title: "Ownership & Engagement" },
      { id: "impl-inc", href: "implement/incident-program.html", title: "Incident Program" },
      { id: "impl-obs", href: "implement/observability-foundation.html", title: "Observability Foundation" },
      { id: "impl-alert", href: "implement/alerting-paging.html", title: "Alerting & Paging" },
      { id: "impl-slo", href: "implement/slos.html", title: "SLOs From Zero" },
      { id: "impl-change", href: "implement/safe-change.html", title: "Safe Change" },
      { id: "impl-toil", href: "implement/toil-automation.html", title: "Toil & Automation" }
    ]},
    { section: "People", tone: "ref", hint: "Credibility & politics", reference: true, items: [
      { id: "g-idk", href: "guides/saying-i-dont-know.html", title: "Saying \"I Don't Know\"" },
      { id: "g-ask", href: "guides/how-to-ask.html", title: "How to Ask" },
      { id: "g-path", href: "guides/it-ops-to-sre.html", title: "From IT Ops to SRE Leader" },
      { id: "pw", href: "power/index.html", title: "Power & Politics" },
      { id: "pw-tactics", href: "power/tactics.html", title: "Tactics Repertoire" },
      { id: "pw-defense", href: "power/when-used-on-you.html", title: "When It's Used on You" },
      { id: "pw-scenarios", href: "power/scenarios.html", title: "Political Playbooks" }
    ]}
  ];
  /* Links only (sub-headings removed), for breadcrumbs, the pager, counts, and search. */
  NAV.forEach(function (s) { s.links = s.items.filter(function (i) { return i.href; }); });

  /* Request map cards, so search can jump straight to one (keywords help "429", "cosmos", "cdn"). */
  var MAP_INDEX = [
    ["c-client", "App on PC or phone", "client device on-device ttft t0 t4 t5"], ["c-cdn", "CDN and edge (Front Door)", "cdn front door waf edge timeout certificate dns"],
    ["c-entra", "Sign-in (Entra ID)", "entra sign-in 401 403 token"], ["c-apim", "API gateway (API Management)", "apim gateway 429 rate limit quota t1"],
    ["c-orch", "Orchestrator", "orchestrator container apps aks app service cold start t2 prep"], ["c-appconfig", "Settings and feature flags", "app configuration flags prompt version"],
    ["c-safety", "Safety filters", "content safety filter blocked"], ["c-cosmos", "Cosmos DB (memory)", "cosmos db ru 429 partition replication history"],
    ["c-search", "Search (retrieval)", "ai search rag index retrieval"], ["c-model", "The model", "model azure openai foundry tpm rpm 429 ttft t3 quota"],
    ["c-tools", "Tools and agents", "tools agents functions"], ["c-ipaas", "Integration platform (Workato)", "ipaas workato recipe connector"],
    ["c-partners", "Partner services", "partner third-party api"], ["c-messaging", "Background messaging", "service bus event hubs queue dead letter"],
    ["c-keyvault", "Keys and secrets (Key Vault)", "key vault secret certificate expiry 401"], ["c-telemetry", "Telemetry", "telemetry otel app insights grafana pagerduty pendo"]
  ];

  var body = document.body;
  var root = body.getAttribute("data-root") || "./";
  var page = body.getAttribute("data-page") || "";
  var esc = SRL.esc;
  var curSection = null, curItem = null;
  NAV.forEach(function (s) { s.links.forEach(function (i) { if (i.id === page) { curSection = s; curItem = i; } }); });
  if (curSection) body.setAttribute("data-tone", curSection.tone);

  var LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" fill="var(--logo-bg)"/>' +
    '<path d="M5 18h5l3-8 4 13 3-9 2 4h5" fill="none" stroke="var(--logo-ink)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
  var SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/></svg>';

  /* ---------- Header: menu, brand, global search, theme ---------- */
  var header = document.getElementById("site-header");
  var menuBtn = null, searchInput = null, searchBox = null, searchBtn = null;
  if (header) {
    header.innerHTML =
      '<button class="icon-btn menu-btn" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="sidebar">' + MENU + '</button>' +
      '<a class="brand" href="' + root + 'index.html">' + LOGO + '<span class="brand-full">Reliability Field Guide</span><span class="brand-short" aria-hidden="true">Field Guide</span></a>' +
      '<div class="site-search" id="site-search-wrap">' +
        '<label class="visually-hidden" for="site-search">Search pages, questions, lessons, and the request map</label>' +
        '<span class="site-search-icon">' + SEARCH + '</span>' +
        '<input type="search" id="site-search" autocomplete="off" spellcheck="false" placeholder="Search pages, questions, map…" role="combobox" aria-expanded="false" aria-controls="site-search-list" aria-autocomplete="list">' +
        '<kbd aria-hidden="true">/</kbd>' +
        '<div class="site-search-pop" id="site-search-pop" hidden><ul id="site-search-list" role="listbox" aria-label="Search results"></ul><p class="site-search-status" id="site-search-status" role="status"></p></div>' +
      '</div>' +
      '<button class="icon-btn search-btn" type="button" aria-label="Open search" aria-expanded="false" aria-controls="site-search-wrap">' + SEARCH + '</button>' +
      '<button class="icon-btn theme-btn" type="button"></button>';
    var themeBtn = header.querySelector(".theme-btn");
    var isDark = function () {
      var t = document.documentElement.getAttribute("data-theme");
      if (t) return t === "dark";
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    };
    var paintTheme = function () {
      themeBtn.innerHTML = isDark() ? SUN : MOON;
      themeBtn.setAttribute("aria-label", isDark() ? "Switch to light theme" : "Switch to dark theme");
      themeBtn.title = isDark() ? "Light theme" : "Dark theme";
    };
    paintTheme();
    themeBtn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      SRL.set("theme", next);
      paintTheme();
    });
    menuBtn = header.querySelector(".menu-btn");
    searchInput = header.querySelector("#site-search");
    searchBox = header.querySelector("#site-search-wrap");
    searchBtn = header.querySelector(".search-btn");
  }

  /* ---------- The rail ---------- */
  var CHEVRON = '<svg class="nav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
  var sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.setAttribute("aria-label", "Site");
    var remembered = SRL.get("nav-open", null);
    var html = "", dividerDone = false;
    NAV.forEach(function (s, n) {
      if (s.reference && !dividerDone) { html += '<p class="rail-divider">Reference</p>'; dividerDone = true; }
      var isCur = s === curSection;
      var dot = '<span class="rail-dot" aria-hidden="true"></span>';
      if (s.links.length === 1) {
        var only = s.links[0];
        html += '<div class="nav-section nav-single tone-' + s.tone + (isCur ? " is-current" : "") + '" data-section="' + esc(s.section) + '">' +
          '<a class="nav-toggle nav-direct" href="' + root + only.href + '"' + (only.id === page ? ' aria-current="page"' : "") + ' data-title="' + esc(only.title) + '">' + dot +
          '<span class="nav-toggle-text">' + esc(s.section) + '<span class="nav-hint">' + esc(s.hint) + '</span></span></a></div>';
        return;
      }
      var open = isCur || (remembered ? remembered.indexOf(s.section) >= 0 : false);
      var listId = "nav-list-" + n;
      var links = s.items.map(function (i) {
        if (i.label) return '<li class="nav-sub">' + esc(i.label) + '</li>';
        return '<li><a href="' + root + i.href + '"' + (i.id === page ? ' aria-current="page"' : "") + ' data-title="' + esc(i.title) + '">' + esc(i.title) + '</a></li>';
      }).join("");
      html += '<div class="nav-section tone-' + s.tone + (isCur ? " is-current" : "") + '" data-section="' + esc(s.section) + '">' +
        '<div class="nav-heading"><button type="button" class="nav-toggle" aria-expanded="' + open + '" aria-controls="' + listId + '">' + dot +
        '<span class="nav-toggle-text">' + esc(s.section) + '<span class="nav-hint">' + esc(s.hint) + '</span></span><span class="nav-count" aria-hidden="true">' + s.links.length + '</span><span class="visually-hidden">, ' + s.links.length + ' pages</span>' + CHEVRON + '</button></div>' +
        '<ul id="' + listId + '"' + (open ? "" : " hidden") + '>' + links + '</ul></div>';
    });
    sidebar.innerHTML = html;
    sidebar.addEventListener("click", function (e) {
      var t = e.target.closest("button.nav-toggle");
      if (!t) return;
      var sec = t.closest(".nav-section"), list = sec.querySelector("ul"), open = t.getAttribute("aria-expanded") !== "true";
      t.setAttribute("aria-expanded", open ? "true" : "false");
      list.hidden = !open;
      var openNames = [];
      Array.prototype.forEach.call(sidebar.querySelectorAll(".nav-section"), function (s2) {
        var b = s2.querySelector("button.nav-toggle");
        if (b && b.getAttribute("aria-expanded") === "true" && !s2.classList.contains("is-current")) openNames.push(s2.getAttribute("data-section"));
      });
      SRL.set("nav-open", openNames);
    });
  }

  /* ---------- Global search: pages, map cards, lessons, and questions (loaded on first use) ----------
     Combobox pattern: arrows move, Enter opens, Esc closes. "/" focuses it from anywhere. */
  if (searchInput) {
    var pop = document.getElementById("site-search-pop"), listEl = document.getElementById("site-search-list"), statusEl = document.getElementById("site-search-status");
    var active = -1, results = [], loading = false;
    var loadScript = function (src, cb) {
      var s = document.createElement("script"); s.src = root + src; s.onload = cb; s.onerror = cb; document.head.appendChild(s);
    };
    var ensureData = function (cb) {
      if (loading) return;
      var need = [];
      if (!window.SRL_QUESTIONS) need.push("assets/questions.js");
      if (!window.SRL_LESSONS) need.push("assets/lessons.js");
      if (!need.length) return cb();
      loading = true;
      var left = need.length;
      need.forEach(function (src) { loadScript(src, function () { if (--left === 0) { loading = false; cb(); } }); });
    };
    var sitUrl = function (sid) {
      var S = window.SRL_SITUATIONS || [], G = window.SRL_GROUPS || [];
      var s = S.filter(function (x) { return x.id === sid; })[0]; if (!s) return null;
      if (s.playbook) return root + s.playbook + "#questions";
      var g = G.filter(function (x) { return x.id === s.group; })[0];
      return g ? root + g.page + "#" + s.id : null;
    };
    var match = function (hay, terms) { hay = hay.toLowerCase(); return terms.every(function (t) { return hay.indexOf(t) >= 0; }); };
    var run = function () {
      var raw = searchInput.value.trim();
      if (raw.length < 2) { close(); return; }
      var terms = raw.toLowerCase().split(/\s+/).filter(Boolean);
      results = [];
      NAV.forEach(function (s) { s.links.forEach(function (i) { if (match(i.title + " " + s.section + " " + s.hint, terms)) results.push({ kind: "Page", tone: s.tone, label: i.title, sub: s.section, href: root + i.href }); }); });
      MAP_INDEX.forEach(function (m) { if (match(m[1] + " " + m[2], terms)) results.push({ kind: "Map", tone: "map", label: m[1], sub: "Request Map card", href: root + "ai/request-map.html#" + m[0] }); });
      (window.SRL_LESSONS || []).forEach(function (l) { if (match([l.title, l.situation, l.todo, l.say, l.check, l.why, l.link.t].join(" "), terms)) results.push({ kind: "Lesson", tone: "today", label: l.title, sub: l.type + " · daily lesson", href: root + "lessons.html#" + l.id }); });
      var qn = 0;
      (window.SRL_QUESTIONS || []).forEach(function (q) {
        if (qn >= 8 || !match(q.q + " " + q.next + " " + q.signal, terms)) return;
        var u = sitUrl(q.tags[0]); if (!u) return;
        results.push({ kind: "Question", tone: "ref", label: q.q, sub: "Question Bank", href: u }); qn++;
      });
      results = results.slice(0, 14);
      active = -1;
      listEl.innerHTML = results.map(function (r, n) {
        return '<li role="option" id="ss-' + n + '" aria-selected="false" data-n="' + n + '"><a href="' + r.href + '" tabindex="-1"><span class="ss-kind tone-' + r.tone + '">' + r.kind + '</span><span class="ss-label">' + esc(r.label) + '</span><span class="ss-sub">' + esc(r.sub) + '</span></a></li>';
      }).join("");
      statusEl.textContent = results.length ? results.length + " result" + (results.length === 1 ? "" : "s") + ". Use up and down arrows, then Enter." : "No matches. Try: stuck, 429, waiting, postmortem, cosmos.";
      pop.hidden = false;
      searchInput.setAttribute("aria-expanded", "true");
      searchInput.removeAttribute("aria-activedescendant");
    };
    var close = function () { pop.hidden = true; searchInput.setAttribute("aria-expanded", "false"); searchInput.removeAttribute("aria-activedescendant"); active = -1; };
    var move = function (d) {
      if (!results.length) return;
      active = (active + d + results.length) % results.length;
      Array.prototype.forEach.call(listEl.children, function (li, n) { li.setAttribute("aria-selected", n === active ? "true" : "false"); });
      searchInput.setAttribute("aria-activedescendant", "ss-" + active);
      listEl.children[active].scrollIntoView({ block: "nearest" });
    };
    var timer = null;
    searchInput.addEventListener("focus", function () { ensureData(function () { if (searchInput.value.trim().length >= 2) run(); }); });
    searchInput.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(function () { ensureData(run); }, 120); });
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); if (pop.hidden) run(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter") { var r = results[active >= 0 ? active : 0]; if (r && !pop.hidden) { e.preventDefault(); location.href = r.href; } }
      else if (e.key === "Escape") {
        if (!pop.hidden) { e.stopPropagation(); close(); }
        else if (body.classList.contains("search-open")) { e.stopPropagation(); setSearch(false); searchBtn.focus(); }
      }
    });
    listEl.addEventListener("mousedown", function (e) { if (e.target.closest("a")) e.preventDefault(); });
    listEl.addEventListener("click", function (e) { var a = e.target.closest("a"); if (a) location.href = a.getAttribute("href"); });
    document.addEventListener("click", function (e) { if (!searchBox.contains(e.target) && e.target !== searchBtn && !searchBtn.contains(e.target)) close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target.tagName;
      if (t === "INPUT" || t === "TEXTAREA" || e.target.isContentEditable) return;
      e.preventDefault();
      if (getComputedStyle(searchBox).display === "none") setSearch(true); else searchInput.focus();
    });
    /* Small screens: the search box opens from the header button. */
    var setSearch = function (open) {
      body.classList.toggle("search-open", open);
      searchBtn.setAttribute("aria-expanded", open ? "true" : "false");
      searchBtn.setAttribute("aria-label", open ? "Close search" : "Open search");
      if (open) searchInput.focus(); else close();
    };
    searchBtn.addEventListener("click", function () { setSearch(!body.classList.contains("search-open")); });
  }

  /* ---------- Mobile menu: focus moves into the rail; Esc closes and returns focus ---------- */
  function setMenu(open) {
    body.classList.toggle("nav-open", open);
    if (!menuBtn) return;
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    if (open && sidebar) { var first = sidebar.querySelector('[aria-current="page"]') || sidebar.querySelector("a, button"); if (first) first.focus(); }
  }
  if (menuBtn) menuBtn.addEventListener("click", function () { setMenu(!body.classList.contains("nav-open")); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && body.classList.contains("nav-open")) { setMenu(false); menuBtn.focus(); }
  });
  document.addEventListener("click", function (e) {
    if (!body.classList.contains("nav-open")) return;
    if (sidebar.contains(e.target) || (menuBtn && menuBtn.contains(e.target))) return;
    setMenu(false);
  });

  /* ---------- Breadcrumb ---------- */
  var crumbs = document.getElementById("crumbs");
  if (crumbs && curItem && page !== "home") {
    var first = curSection.links[0];
    var trail = '<li><a href="' + root + 'index.html">Home</a></li>';
    if (curSection.section) trail += '<li>' + (first.id !== page ? '<a href="' + root + first.href + '">' + esc(curSection.section) + '</a>' : esc(curSection.section)) + '</li>';
    trail += '<li><span aria-current="page">' + esc(curItem.title) + '</span></li>';
    crumbs.innerHTML = '<ol>' + trail + '</ol>';
    crumbs.setAttribute("aria-label", "Breadcrumb");
  }

  /* ---------- Pager (stays inside the section) ---------- */
  var pager = document.getElementById("pager");
  if (pager && curSection && curSection.links.length > 1) {
    var seq = curSection.links, idx = seq.indexOf(curItem), html = "";
    if (idx > 0) html += '<a class="prev" href="' + root + seq[idx - 1].href + '"><small>Previous</small>' + esc(seq[idx - 1].title) + '</a>';
    if (idx < seq.length - 1) html += '<a class="next" href="' + root + seq[idx + 1].href + '"><small>Next</small>' + esc(seq[idx + 1].title) + '</a>';
    pager.innerHTML = html;
    pager.setAttribute("aria-label", "Previous and next in " + (curSection.section || "this section"));
  }

  /* ---------- Footer ---------- */
  var footer = document.getElementById("footer");
  if (footer) footer.innerHTML = "Reliability Field Guide · Examples are fictional · Updated " + UPDATED;

  /* ---------- Copy buttons on .code-card blocks ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".code-card"), function (card) {
    var head = card.querySelector(".code-head"), pre = card.querySelector("pre");
    if (!head || !pre) return;
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "copy-btn"; btn.textContent = "Copy";
    btn.setAttribute("aria-label", "Copy: " + head.textContent.trim());
    btn.addEventListener("click", function () { SRL.copy(pre.innerText.replace(/\n$/, "")); });
    head.appendChild(btn);
  });

  /* ---------- Folded sections ("Go deeper") ----------
     The generator wraps each H2 section of a folded page in <section class="fold"><h2/><div class="fold-body"/></section>.
     Script turns each H2 into a disclosure button and closes the body. Without JavaScript everything shows.
     Any link to an id inside a folded section (hash on load, hash change, TOC, in-page link) opens that section first. */
  var folds = Array.prototype.slice.call(document.querySelectorAll("section.fold"));
  function setFold(sec, open) {
    var btn = sec.querySelector(".fold-toggle"), fb = sec.querySelector(".fold-body");
    if (!btn) return;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    fb.hidden = !open;
  }
  function openTarget(id) {
    var el = id && document.getElementById(id);
    if (!el) return null;
    var sec = el.closest("section.fold");
    if (sec) setFold(sec, true);
    return el;
  }
  if (folds.length) {
    folds.forEach(function (sec, n) {
      var h = sec.querySelector("h2"), fb = sec.querySelector(".fold-body");
      if (!h || !fb) return;
      fb.id = fb.id || "fold-" + (n + 1);
      var btn = document.createElement("button");
      btn.type = "button"; btn.className = "fold-toggle";
      btn.setAttribute("aria-controls", fb.id);
      while (h.firstChild) btn.appendChild(h.firstChild);
      btn.insertAdjacentHTML("beforeend", CHEVRON.replace("nav-chevron", "fold-chevron"));
      h.appendChild(btn);
      setFold(sec, false);
      btn.addEventListener("click", function () { setFold(sec, btn.getAttribute("aria-expanded") !== "true"); });
    });
    var bar = document.createElement("div");
    bar.className = "fold-bar";
    bar.innerHTML = '<span>Details are folded. Open what you need.</span><span class="fold-bulk"><button type="button" class="link-btn" data-fold-all="open">Open all</button><span aria-hidden="true">·</span><button type="button" class="link-btn" data-fold-all="close">Close all</button></span>';
    folds[0].parentNode.insertBefore(bar, folds[0]);
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("[data-fold-all]");
      if (b) folds.forEach(function (sec) { setFold(sec, b.getAttribute("data-fold-all") === "open"); });
    });
    openTarget(location.hash.slice(1));
    window.addEventListener("hashchange", function () { var el = openTarget(location.hash.slice(1)); if (el) el.scrollIntoView(); });
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href*="#"]');
      if (!a || a.pathname !== location.pathname) return;
      openTarget(decodeURIComponent(a.hash.slice(1)));
    });
    window.addEventListener("beforeprint", function () { folds.forEach(function (sec) { setFold(sec, true); }); });
  }

  /* ---------- Heading anchors + "On this page" (H2s only) ---------- */
  function buildToc() {
    var article = document.querySelector("main.content article");
    var toc = document.getElementById("toc");
    if (!article) return;
    var used = {}, links = [];
    Array.prototype.forEach.call(article.querySelectorAll("h2"), function (h) {
      if (h.closest(".callout, .quick-card")) return;
      if (!h.id) {
        var base = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
        var id = base, n = 2;
        while (used[id] || document.getElementById(id)) id = base + "-" + n++;
        h.id = id;
      }
      used[h.id] = true;
      if (!h.querySelector(".anchor")) {
        var a = document.createElement("a");
        a.className = "anchor"; a.href = "#" + h.id; a.textContent = "#";
        a.setAttribute("aria-label", "Link to " + h.textContent.trim());
        h.appendChild(a);
      }
      var clone = h.cloneNode(true);
      Array.prototype.forEach.call(clone.querySelectorAll(".anchor"), function (el) { el.remove(); });
      links.push({ id: h.id, text: clone.textContent.trim() });
    });
    if (!toc) return;
    if (links.length > 1) {
      toc.innerHTML = '<h2 id="toc-title">On This Page</h2><nav aria-labelledby="toc-title">' + links.map(function (t) {
        return '<a href="#' + t.id + '">' + esc(t.text) + "</a>";
      }).join("") + '</nav>';
    } else { toc.innerHTML = ""; toc.hidden = true; }
    /* Re-apply the hash now that ids exist (content may have been rendered by script). */
    if (location.hash) { var target = openTarget(location.hash.slice(1)); if (target) target.scrollIntoView(); }
  }
  window.SRL_buildToc = buildToc;
  if (body.getAttribute("data-toc") !== "deferred") buildToc();

  /* ---------- Print: open coaching notes ---------- */
  window.addEventListener("beforeprint", function () {
    Array.prototype.forEach.call(document.querySelectorAll("details"), function (d) { d.setAttribute("data-was", d.open ? "1" : "0"); d.open = true; });
  });
  window.addEventListener("afterprint", function () {
    Array.prototype.forEach.call(document.querySelectorAll("details[data-was]"), function (d) { d.open = d.getAttribute("data-was") === "1"; d.removeAttribute("data-was"); });
  });
})();
