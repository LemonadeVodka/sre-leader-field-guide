/* SRE Leader's Field Guide — shared page chrome.
   Pages provide <body data-root="./|../" data-page="id"> and empty #site-header, #sidebar, #crumbs, #pager, #toc, #footer slots.
   Pages whose content is rendered by script set data-toc="deferred" and call SRL_buildToc() themselves (qbank.js does). */
(function () {
  "use strict";

  var UPDATED = "October 20, 2026"; /* bump on each release */
  var NAV = [
    { section: "", items: [
      { id: "home", href: "index.html", title: "Home" }
    ]},
    { section: "Question Bank", items: [
      { id: "q-meetings", href: "questions/technical-meetings.html", title: "In Technical Meetings" },
      { id: "q-incidents", href: "questions/incidents.html", title: "During & After Incidents" },
      { id: "q-ai", href: "questions/ai-product.html", title: "Supporting the AI Product" },
      { id: "q-peers", href: "questions/peers-leaders.html", title: "With Peers & Leaders" },
      { id: "q-team", href: "questions/sre-team.html", title: "With Your SRE Team" },
      { id: "q-noc", href: "questions/offshore-noc.html", title: "With the Offshore NOC" },
      { id: "q-cred", href: "questions/credibility.html", title: "Building Credibility" }
    ]},
    { section: "Root Cause Analysis", items: [
      { id: "rca-day1", href: "rca/day-one.html", title: "RCA Day One" },
      { id: "rca", href: "rca/index.html", title: "RCA the SRE Way" },
      { id: "rca-run", href: "rca/run-an-rca.html", title: "Running an RCA" },
      { id: "rca-judge", href: "rca/judge-an-rca.html", title: "Judging an RCA" },
      { id: "rca-example", href: "rca/worked-example.html", title: "Worked Example" },
      { id: "rca-template", href: "rca/template.html", title: "RCA Template" }
    ]},
    { section: "Playbooks", items: [
      { id: "p-stuck", href: "playbooks/stuck-incident.html", title: "When an Incident Is Stuck" },
      { id: "m-daily", href: "meetings/sre-daily.html", title: "SRE Daily" },
      { id: "m-perf", href: "meetings/performance-engineering.html", title: "Performance Engineering" }
    ]},
    { section: "AI Reliability", items: [
      { id: "ai", href: "ai/index.html", title: "What's Different About AI" },
      { id: "ai-latency", href: "ai/latency.html", title: "Latency: TTFT & TTLT" },
      { id: "ai-tokens", href: "ai/tokens-quotas-cost.html", title: "Tokens, Quotas & Cost" },
      { id: "ai-quality", href: "ai/quality-safety.html", title: "Quality & Safety" },
      { id: "ai-agents", href: "ai/agents-dependencies.html", title: "Agents & Model Providers" }
    ]},
    { section: "SRE Concepts", items: [
      { id: "c-index", href: "concepts/index.html", title: "Overview & Roadmap" },
      { id: "c-obs-day1", href: "concepts/observability-day-one.html", title: "Observability Day One" },
      { id: "c-targets", href: "concepts/reliability-targets.html", title: "Reliability Targets" },
      { id: "c-obs", href: "concepts/observability.html", title: "Observability & Telemetry" },
      { id: "c-alerting", href: "concepts/alerting-incidents.html", title: "Alerting & Incidents" },
      { id: "c-change", href: "concepts/change-and-toil.html", title: "Change & Toil" },
      { id: "c-capacity", href: "concepts/capacity-readiness.html", title: "Capacity & Readiness" }
    ]},
    { section: "Guides", items: [
      { id: "g-idk", href: "guides/saying-i-dont-know.html", title: "Saying \"I Don't Know\"" },
      { id: "g-ask", href: "guides/how-to-ask.html", title: "How to Ask" },
      { id: "g-path", href: "guides/it-ops-to-sre.html", title: "From IT Ops to SRE Leader" }
    ]}
  ];

  var body = document.body;
  var root = body.getAttribute("data-root") || "./";
  var page = body.getAttribute("data-page") || "";
  var esc = SRL.esc;
  var curSection = null, curItem = null;
  NAV.forEach(function (s) { s.items.forEach(function (i) { if (i.id === page) { curSection = s; curItem = i; } }); });

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
    "Question Bank": icon('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M10 9.5a2.2 2.2 0 1 1 3 2c-.6.3-1 .8-1 1.5"/><path d="M12 16h.01"/>'),
    "Root Cause Analysis": icon('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/><path d="M11 8v3l2 1.5"/>'),
    "Playbooks": icon('<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
    "AI Reliability": icon('<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>'),
    "SRE Concepts": icon('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>'),
    "Guides": icon('<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>')
  };

  /* ---------- Sidebar ---------- */
  var sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.setAttribute("aria-label", "Site");
    sidebar.innerHTML = NAV.map(function (s, n) {
      var labelId = "nav-sec-" + n;
      var cls = "nav-section" + (s === curSection ? " is-current" : "") + (s.section ? "" : " nav-home");
      return '<div class="' + cls + '">' + (s.section ? '<p class="nav-title" id="' + labelId + '">' + (SECTION_ICONS[s.section] || "") + '<span>' + esc(s.section) + '</span></p>' : "") +
        '<ul' + (s.section ? ' aria-labelledby="' + labelId + '"' : "") + '>' + s.items.map(function (i) {
          return '<li><a href="' + root + i.href + '"' + (i.id === page ? ' aria-current="page"' : "") + '>' + esc(i.title) + '</a></li>';
        }).join("") + '</ul></div>';
    }).join("");
  }

  /* ---------- Mobile menu: Esc closes and returns focus ---------- */
  function setMenu(open) {
    body.classList.toggle("nav-open", open);
    if (!menuBtn) return;
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    if (open) { var first = sidebar && sidebar.querySelector("a"); if (first) first.focus(); }
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
    var first = curSection.items[0];
    var trail = '<li><a href="' + root + 'index.html">Home</a></li>';
    if (curSection.section) trail += '<li>' + (first.id !== page ? '<a href="' + root + first.href + '">' + esc(curSection.section) + '</a>' : esc(curSection.section)) + '</li>';
    trail += '<li><span aria-current="page">' + esc(curItem.title) + '</span></li>';
    crumbs.innerHTML = '<ol>' + trail + '</ol>';
    crumbs.setAttribute("aria-label", "Breadcrumb");
  }

  /* ---------- Pager (stays inside the section) ---------- */
  var pager = document.getElementById("pager");
  if (pager && curSection && curSection.items.length > 1) {
    var seq = curSection.items, idx = seq.indexOf(curItem), html = "";
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

  /* ---------- Heading anchors + "On this page" (H2s only) ---------- */
  function buildToc() {
    var article = document.querySelector("main.content article");
    var toc = document.getElementById("toc");
    if (!article) return;
    var used = {}, links = [];
    Array.prototype.forEach.call(article.querySelectorAll("h2"), function (h) {
      if (h.closest(".callout")) return;
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
    if (location.hash) { var target = document.getElementById(location.hash.slice(1)); if (target) target.scrollIntoView(); }
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
