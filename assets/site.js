/* SRE Leader's Field Guide — shared page chrome.
   Pages provide <body data-root="./|../" data-page="id"> and empty #site-header, #sidebar, #crumbs, #pager, #toc, #footer slots.
   Pages whose content is rendered by script set data-toc="deferred" and call SRL_buildToc() themselves (qbank.js does). */
(function () {
  "use strict";

  var UPDATED = "October 20, 2026"; /* bump on each release */
  /* Four sections by what you're doing (Do / Ask / Learn / People). Items with "label" are sub-headings inside a section (not links). */
  var NAV = [
    { section: "", items: [
      { id: "home", href: "index.html", title: "Home" }
    ]},
    { section: "Do", hint: "In the moment", items: [
      { label: "Start here" },
      { id: "today", href: "today.html", title: "Questions for Today" },
      { id: "p-fw", href: "playbooks/frameworks.html", title: "Pocket Frameworks" },
      { label: "See it used: one week" },
      { id: "x-incident", href: "playbooks/example-incident.html", title: "Tue: The Incident (LEAD)" },
      { id: "x-postmortem", href: "playbooks/example-postmortem.html", title: "Thu: The Postmortem (SAFER)" },
      { id: "x-status", href: "playbooks/example-status.html", title: "Mon: The Status Sweep (PACE)" },
      { id: "x-risk", href: "playbooks/example-risk.html", title: "Wed: Nobody Will Fix It" },
      { label: "Playbooks" },
      { id: "p-driver", href: "playbooks/incident-driver.html", title: "Move a Stuck Incident" },
      { id: "p-where", href: "playbooks/where-are-we.html", title: "Where Are We? (Status)" },
      { id: "p-starter", href: "playbooks/meeting-starter.html", title: "Meeting Starter" },
      { id: "p-risk", href: "playbooks/risk-register.html", title: "Risk Register" },
      { id: "m-perf", href: "meetings/performance-engineering.html", title: "Performance Engineering" },
      { id: "p-pmprog", href: "playbooks/postmortem-program.html", title: "Owning Postmortems" },
      { id: "p-pm", href: "playbooks/postmortem-meeting.html", title: "Postmortem Meeting" },
      { id: "m-daily", href: "meetings/sre-daily.html", title: "SRE Daily" },
      { id: "p-task", href: "playbooks/running-a-task.html", title: "Running a Task" },
      { id: "p-stuck", href: "playbooks/stuck-incident.html", title: "Stuck Incident: Deep Dive" },
      { id: "p-vendor", href: "playbooks/vendor-demo.html", title: "Vendor Demos" },
      { id: "rca-run", href: "rca/run-an-rca.html", title: "Running an RCA" },
      { id: "rca-judge", href: "rca/judge-an-rca.html", title: "Judging an RCA" },
      { id: "rca-template", href: "rca/template.html", title: "RCA Template" }
    ]},
    { section: "Ask", hint: "Question Bank", items: [
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
    { section: "Learn", hint: "Study time", items: [
      { label: "Start here" },
      { id: "rca-day1", href: "rca/day-one.html", title: "RCA Day One" },
      { id: "c-obs-day1", href: "concepts/observability-day-one.html", title: "Observability Day One" },
      { label: "Root cause analysis" },
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
    { section: "People", hint: "Credibility & politics", items: [
      { id: "g-idk", href: "guides/saying-i-dont-know.html", title: "Saying \"I Don't Know\"" },
      { id: "g-ask", href: "guides/how-to-ask.html", title: "How to Ask" },
      { id: "g-path", href: "guides/it-ops-to-sre.html", title: "From IT Ops to SRE Leader" },
      { id: "pw", href: "power/index.html", title: "Power & Politics" },
      { id: "pw-tactics", href: "power/tactics.html", title: "Tactics Repertoire" },
      { id: "pw-defense", href: "power/when-used-on-you.html", title: "When It's Used on You" },
      { id: "pw-scenarios", href: "power/scenarios.html", title: "Political Playbooks" }
    ]}
  ];
  /* Links only (sub-headings removed), for breadcrumbs, the pager, and counts. */
  NAV.forEach(function (s) { s.links = s.items.filter(function (i) { return i.href; }); });

  var body = document.body;
  var root = body.getAttribute("data-root") || "./";
  var page = body.getAttribute("data-page") || "";
  var esc = SRL.esc;
  var curSection = null, curItem = null;
  NAV.forEach(function (s) { s.links.forEach(function (i) { if (i.id === page) { curSection = s; curItem = i; } }); });

  var LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" fill="var(--accent)"/>' +
    '<path d="M5 18h5l3-8 4 13 3-9 2 4h5" fill="none" stroke="var(--accent-ink)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';

  /* ---------- Header ---------- */
  var header = document.getElementById("site-header");
  var menuBtn = null;
  if (header) {
    header.innerHTML =
      '<button class="icon-btn menu-btn" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="sidebar">' + MENU + '</button>' +
      '<a class="brand" href="' + root + 'index.html">' + LOGO + '<span class="brand-full">SRE Leader\'s Field Guide</span><span class="brand-short" aria-hidden="true">SRE Field Guide</span></a>' +
      '<div class="header-spacer"></div>' +
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
  }

  /* ---------- Sidebar: one icon per section so sections are easy to tell apart ---------- */
  function icon(d) { return '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; }
  var SECTION_ICONS = {
    "Do": icon('<path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12z"/>'),
    "Ask": icon('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M10 9.5a2.2 2.2 0 1 1 3 2c-.6.3-1 .8-1 1.5"/><path d="M12 16h.01"/>'),
    "Learn": icon('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>'),
    "People": icon('<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>')
  };

  /* ---------- Sidebar: "Find a page" filter + collapsible sections ----------
     Only the current page's section starts open (all collapsed on Home). Opened/closed sections are remembered in
     srl-nav-open as a convenience; the current section is always open. */
  var CHEVRON = '<svg class="nav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
  var sidebar = document.getElementById("sidebar");
  var navFilter = null;
  if (sidebar) {
    sidebar.setAttribute("aria-label", "Site");
    var remembered = SRL.get("nav-open", null);
    var html = '<div class="nav-tools"><label class="nav-filter-label" for="nav-filter">Find a page</label>' +
      '<input type="search" id="nav-filter" class="nav-filter" autocomplete="off" placeholder="e.g. stuck, status, SLO">' +
      '<div class="nav-bulk"><button type="button" class="link-btn" data-nav-all="open">Expand all</button><span aria-hidden="true">·</span><button type="button" class="link-btn" data-nav-all="close">Collapse all</button></div>' +
      '<p class="nav-status" id="nav-status" role="status"></p></div>';
    html += NAV.map(function (s, n) {
      var links = s.items.map(function (i) {
        if (i.label) return '<li class="nav-sub">' + esc(i.label) + '</li>';
        return '<li><a href="' + root + i.href + '"' + (i.id === page ? ' aria-current="page"' : "") + ' data-title="' + esc(i.title) + '">' + esc(i.title) + '</a></li>';
      }).join("");
      if (!s.section) return '<div class="nav-section nav-home"><ul>' + links + '</ul></div>';
      var isCur = s === curSection;
      var open = isCur || (remembered ? remembered.indexOf(s.section) >= 0 : false);
      var listId = "nav-list-" + n;
      return '<div class="nav-section' + (isCur ? " is-current" : "") + '" data-section="' + esc(s.section) + '">' +
        '<div class="nav-heading"><button type="button" class="nav-toggle" aria-expanded="' + open + '" aria-controls="' + listId + '">' +
        (SECTION_ICONS[s.section] || "") + '<span class="nav-toggle-text">' + esc(s.section) + (s.hint ? '<span class="nav-hint">' + esc(s.hint) + '</span>' : "") + '</span><span class="nav-count" aria-hidden="true">' + s.links.length + '</span><span class="visually-hidden">, ' + s.links.length + ' pages</span>' + CHEVRON + '</button></div>' +
        '<ul id="' + listId + '"' + (open ? "" : " hidden") + '>' + links + '</ul></div>';
    }).join("");
    sidebar.innerHTML = html;
    navFilter = sidebar.querySelector("#nav-filter");

    var setOpen = function (sec, open) {
      var btn = sec.querySelector(".nav-toggle"), list = sec.querySelector("ul");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      list.hidden = !open;
    };
    var saveOpen = function () {
      var openNames = [];
      Array.prototype.forEach.call(sidebar.querySelectorAll(".nav-section[data-section]"), function (sec) {
        if (sec.querySelector(".nav-toggle").getAttribute("aria-expanded") === "true" && !sec.classList.contains("is-current")) openNames.push(sec.getAttribute("data-section"));
      });
      SRL.set("nav-open", openNames);
    };
    sidebar.addEventListener("click", function (e) {
      var t = e.target.closest(".nav-toggle");
      if (t) { var sec = t.closest(".nav-section"); setOpen(sec, t.getAttribute("aria-expanded") !== "true"); saveOpen(); return; }
      var bulk = e.target.closest("[data-nav-all]");
      if (bulk) {
        var openAll = bulk.getAttribute("data-nav-all") === "open";
        Array.prototype.forEach.call(sidebar.querySelectorAll(".nav-section[data-section]"), function (sec) { setOpen(sec, openAll || sec.classList.contains("is-current")); });
        saveOpen(); return;
      }
      if (e.target.closest("[data-nav-clear]")) { navFilter.value = ""; applyFilter(); navFilter.focus(); }
    });

    /* Filter: match link titles or section names; auto-expand matches; highlight; announce the count. */
    var status = sidebar.querySelector("#nav-status");
    var markText = function (text, term) {
      var i = text.toLowerCase().indexOf(term);
      if (!term || i < 0) return esc(text);
      return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + term.length)) + "</mark>" + esc(text.slice(i + term.length));
    };
    var applyFilter = function () {
      var term = navFilter.value.trim().toLowerCase(), total = 0;
      sidebar.classList.toggle("is-filtering", !!term);
      Array.prototype.forEach.call(sidebar.querySelectorAll(".nav-section"), function (sec) {
        var secName = (sec.getAttribute("data-section") || "").toLowerCase();
        var secMatch = term && secName.indexOf(term) >= 0, shown = 0;
        Array.prototype.forEach.call(sec.querySelectorAll("li.nav-sub"), function (li) { li.hidden = !!term; });
        Array.prototype.forEach.call(sec.querySelectorAll("li:not(.nav-sub)"), function (li) {
          var a = li.querySelector("a"), title = a.getAttribute("data-title");
          var hit = !term || secMatch || title.toLowerCase().indexOf(term) >= 0;
          li.hidden = !hit;
          a.innerHTML = term && !secMatch ? markText(title, term) : esc(title);
          if (hit) shown++;
        });
        if (term) {
          sec.hidden = shown === 0;
          if (sec.getAttribute("data-section")) { var list = sec.querySelector("ul"); list.hidden = shown === 0; sec.querySelector(".nav-toggle").setAttribute("aria-expanded", shown ? "true" : "false"); }
          if (sec.getAttribute("data-section")) total += shown;
        } else {
          sec.hidden = false;
        }
      });
      if (!term) {
        /* Restore the normal collapsed state. */
        var rem = SRL.get("nav-open", []) || [];
        Array.prototype.forEach.call(sidebar.querySelectorAll(".nav-section[data-section]"), function (sec) {
          setOpen(sec, sec.classList.contains("is-current") || rem.indexOf(sec.getAttribute("data-section")) >= 0);
        });
        status.innerHTML = "";
      } else {
        status.innerHTML = total ? total + " page" + (total === 1 ? "" : "s") + " match" : 'No pages match. <button type="button" class="link-btn" data-nav-clear>Clear</button>';
      }
    };
    navFilter.addEventListener("input", applyFilter);
    navFilter.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navFilter.value) { e.stopPropagation(); navFilter.value = ""; applyFilter(); }
    });
  }

  /* ---------- Mobile menu: focus moves to the filter; Esc closes and returns focus ---------- */
  function setMenu(open) {
    body.classList.toggle("nav-open", open);
    if (!menuBtn) return;
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    if (open && navFilter) navFilter.focus();
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
  if (footer) footer.innerHTML = "SRE Leader's Field Guide · Examples are fictional · Updated " + UPDATED;

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
