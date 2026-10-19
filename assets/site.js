/* SRE Leader's Field Guide — shared page chrome and behaviours.
   Pages provide <body data-root="./|../" data-page="id"> and empty #site-header, #sidebar, #pager, #toc, #footer slots.
   Load store.js before this file. */
(function () {
  "use strict";

  var UPDATED = "October 18, 2026"; /* bump on each release */

  /* Each group is a track (a section colour). Prev/next paging stays inside the track.
     { label } entries are sub-group headings, not pages. tool: true marks pages with a saved-data tool. */
  var NAV = [
    { group: "Today", track: "today", items: [
      { id: "index", href: "index.html", title: "Today" },
      { id: "start-here", href: "start-here.html", title: "Start Here & Your Data" }
    ]},
    { group: "Become the SRE Leader", track: "grow", items: [
      { id: "grow", href: "grow/index.html", title: "Overview" },
      { id: "grow-path", href: "grow/your-path.html", title: "Your Path: IT Ops → SRE Leader" },
      { id: "grow-skills", href: "grow/skills-map.html", title: "Skills Map", tool: true },
      { id: "grow-wins", href: "grow/wins.html", title: "Wins & Evidence Log", tool: true }
    ]},
    { group: "Lead Daily", track: "lead", items: [
      { id: "lead", href: "lead/index.html", title: "Overview" },
      { id: "lead-commitments", href: "lead/commitments.html", title: "Commitment Tracker", tool: true },
      { id: "lead-meeting-prep", href: "lead/meeting-prep.html", title: "Meeting Prep", tool: true }
    ]},
    { group: "Firefighting Mode", track: "firefight", items: [
      { id: "fire-offenders", href: "firefight/top-offenders.html", title: "Top Offenders Board", tool: true }
    ]},
    { group: "Use Daily", track: "daily", items: [
      { id: "daily-rituals", href: "daily/rituals.html", title: "Rituals" },
      { id: "daily-questions", href: "daily/questions.html", title: "Question Bank" }
    ]}
  ];

  var body = document.body;
  var root = body.getAttribute("data-root") || "./";
  var page = body.getAttribute("data-page") || "";
  var esc = SRL.esc;

  var current = null, currentTrack = "start";
  NAV.forEach(function (g) { g.items.forEach(function (i) { if (i.id === page) { current = i; currentTrack = g.track; } }); });
  body.setAttribute("data-track", currentTrack);

  var LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" fill="var(--accent)"/>' +
    '<path d="M5 18h5l3-8 4 13 3-9 2 4h5" fill="none" stroke="var(--accent-fg)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';

  /* ---------- Header ---------- */
  var header = document.getElementById("site-header");
  if (header) {
    header.innerHTML =
      '<button class="icon-btn menu-btn" type="button" aria-label="Toggle navigation" aria-expanded="false" aria-controls="sidebar">' + MENU + '</button>' +
      '<a class="brand" href="' + root + 'index.html">' + LOGO + '<span>SRE Leader\'s Field Guide<small>Lead reliability without writing code</small></span></a>' +
      '<div class="header-spacer"></div>' +
      '<a class="header-cta" href="' + root + 'lead/commitments.html#add" aria-label="Add a commitment" title="Add a commitment">+<span class="cta-long"> Commitment</span></a>' +
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
    var menuBtn = header.querySelector(".menu-btn");
    menuBtn.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- Sidebar ---------- */
  var sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.innerHTML = NAV.map(function (g) {
      var open = g.track === "today" || g.track === currentTrack;
      return '<div class="nav-group' + (open ? " open" : "") + '"><h4><button type="button" class="nav-toggle" aria-expanded="' + open + '">' + esc(g.group) + '</button></h4><div class="nav-items">' + g.items.map(function (i) {
        if (!i.href) return '<div class="nav-sub">' + esc(i.label) + '</div>';
        var cur = i.id === page ? ' aria-current="page"' : "";
        return '<a href="' + root + i.href + '"' + cur + '><span>' + esc(i.title) + '</span>' + (i.tool ? '<span class="nav-tag" title="Interactive tool">TOOL</span>' : "") + '</a>';
      }).join("") + '</div></div>';
    }).join("");
    sidebar.addEventListener("click", function (e) {
      var t = e.target.closest(".nav-toggle");
      if (t) { var grp = t.closest(".nav-group"); var o = grp.classList.toggle("open"); t.setAttribute("aria-expanded", o ? "true" : "false"); return; }
      if (e.target.closest("a")) body.classList.remove("nav-open");
    });
  }

  /* ---------- Pager (stays inside the current track) ---------- */
  var pager = document.getElementById("pager");
  if (pager && current) {
    var seq = [];
    NAV.forEach(function (g) { if (g.track === currentTrack) g.items.forEach(function (i) { if (i.href) seq.push(i); }); });
    var idx = seq.indexOf(current), html = "";
    if (idx > 0) html += '<a class="prev" href="' + root + seq[idx - 1].href + '"><small>← Previous</small>' + esc(seq[idx - 1].title) + '</a>';
    if (idx >= 0 && idx < seq.length - 1) html += '<a class="next" href="' + root + seq[idx + 1].href + '"><small>Next →</small>' + esc(seq[idx + 1].title) + '</a>';
    pager.innerHTML = html;
    pager.setAttribute("aria-label", "Previous and next pages");
  }

  /* ---------- Footer ---------- */
  var footer = document.getElementById("footer");
  if (footer) footer.innerHTML = "&copy; 2026 SRE Leader's Field Guide · Your data stays in this browser · Updated " + UPDATED;

  /* ---------- Heading anchors + TOC ---------- */
  var article = document.querySelector("main.content article");
  var toc = document.getElementById("toc");
  if (article) {
    var used = {}, tocLinks = [];
    Array.prototype.forEach.call(article.querySelectorAll("h2, h3"), function (h) {
      if (h.closest(".card, .box, .tool, .panel, .q, .skill, .item")) return;
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
        a.setAttribute("aria-label", "Link to this section");
        h.appendChild(a);
      }
      if (h.hasAttribute("data-notoc")) return;
      var clone = h.cloneNode(true);
      Array.prototype.forEach.call(clone.querySelectorAll(".anchor, .badge"), function (el) { el.remove(); });
      tocLinks.push({ id: h.id, text: clone.textContent.trim(), depth: h.tagName === "H2" ? 2 : 3 });
    });
    if (toc) {
      if (tocLinks.length > 2) {
        toc.innerHTML = "<h4>On this page</h4>" + tocLinks.map(function (t) {
          return '<a class="depth-' + t.depth + '" href="#' + t.id + '">' + esc(t.text) + "</a>";
        }).join("");
        toc.setAttribute("aria-label", "On this page");
        if ("IntersectionObserver" in window) {
          var links = toc.querySelectorAll("a");
          var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
              if (en.isIntersecting) Array.prototype.forEach.call(links, function (l) { l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id); });
            });
          }, { rootMargin: "-70px 0px -70% 0px" });
          tocLinks.forEach(function (t) { obs.observe(document.getElementById(t.id)); });
        }
      } else toc.style.visibility = "hidden";
    }
  }

  /* ---------- On-device note under every tool ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('main [id$="-app"]'), function (app) {
    var p = document.createElement("p");
    p.className = "backup-nudge";
    p.innerHTML = 'Saved in this browser only, never sent anywhere. <a href="' + root + 'start-here.html#your-data">Back up your data</a>';
    app.parentNode.insertBefore(p, app.nextSibling);
  });

  /* ---------- Copy buttons on .code-card ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".code-card"), function (card) {
    var head = card.querySelector(".code-head"), code = card.querySelector("pre");
    if (!head || !code) return;
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "copy-btn"; btn.textContent = "Copy";
    btn.addEventListener("click", function () { SRL.copy(code.innerText.replace(/\n$/, "")); });
    head.appendChild(btn);
  });

  /* ---------- Static checklists (ul.checklist[data-key]) ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("ul.checklist[data-key]"), function (ul) {
    var key = "check-" + ul.getAttribute("data-key");
    var saved = SRL.get(key, {}) || {};
    Array.prototype.forEach.call(ul.querySelectorAll(":scope > li"), function (li, n) {
      var label = document.createElement("label"), box = document.createElement("input"), span = document.createElement("span");
      box.type = "checkbox"; box.checked = !!saved[n];
      while (li.firstChild) span.appendChild(li.firstChild);
      label.appendChild(box); label.appendChild(span); li.appendChild(label);
      box.addEventListener("change", function () { saved[n] = box.checked; SRL.set(key, saved); count(); });
    });
    var tools = document.createElement("div");
    tools.className = "checklist-tools";
    tools.innerHTML = '<span class="progress"></span><button type="button" class="link-btn">Reset</button>';
    ul.parentNode.insertBefore(tools, ul.nextSibling);
    function count() {
      var boxes = ul.querySelectorAll("input"), c = 0;
      Array.prototype.forEach.call(boxes, function (b) { if (b.checked) c++; });
      tools.querySelector(".progress").textContent = c + " of " + boxes.length + " done";
    }
    tools.querySelector("button").addEventListener("click", function () {
      saved = {}; SRL.del(key);
      Array.prototype.forEach.call(ul.querySelectorAll("input"), function (b) { b.checked = false; });
      count();
    });
    count();
  });

  window.SRL_NAV = NAV;
})();
