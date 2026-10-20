/* SRE Leader's Field Guide — shared page chrome.
   Pages provide <body data-root="./" data-page="id"> and empty #site-header, #sidebar, #pager, #toc, #footer slots.
   Load store.js and questions.js before this file: the sidebar lists every Question Bank situation. */
(function () {
  "use strict";

  var UPDATED = "October 19, 2026"; /* bump on each release */
  var PAGES = [
    { id: "index", href: "index.html", title: "Question Bank" },
    { id: "how-to-ask", href: "how-to-ask.html", title: "How to Ask" },
    { id: "your-path", href: "your-path.html", title: "Your Path: IT Ops → SRE Leader" }
  ];

  var body = document.body;
  var root = body.getAttribute("data-root") || "./";
  var page = body.getAttribute("data-page") || "";
  var esc = SRL.esc;
  var GROUPS = window.SRL_GROUPS || [], SITS = window.SRL_SITUATIONS || [];

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
      '<a class="brand" href="' + root + 'index.html">' + LOGO + '<span>SRE Leader\'s Field Guide<small>Lead reliability by asking the right questions</small></span></a>' +
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
    var menuBtn = header.querySelector(".menu-btn");
    menuBtn.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- Sidebar: the pages, then every situation grouped by audience ---------- */
  var sidebar = document.getElementById("sidebar");
  function paintSidebar() {
    if (!sidebar) return;
    var hash = location.hash.slice(1);
    var curSit = page === "index" && SITS.some(function (s) { return s.id === hash; }) ? hash : "";
    var html = '<div class="nav-group open"><h4><span class="nav-head">Guide</span></h4><div class="nav-items">' + PAGES.map(function (p) {
      var cur = p.id === page && !curSit ? ' aria-current="page"' : "";
      return '<a href="' + root + p.href + '"' + cur + '><span>' + esc(p.title) + '</span></a>';
    }).join("") + '</div></div>';
    html += GROUPS.map(function (g) {
      var sits = SITS.filter(function (s) { return s.group === g.id; });
      var open = sits.some(function (s) { return s.id === curSit; });
      return '<div class="nav-group' + (open ? " open" : "") + '"><h4><button type="button" class="nav-toggle" aria-expanded="' + open + '">' + esc(g.label) + '</button></h4><div class="nav-items">' + sits.map(function (s) {
        var cur = s.id === curSit ? ' aria-current="page"' : "";
        return '<a href="' + root + 'index.html#' + s.id + '"' + cur + '><span>' + esc(s.label.replace(/^NOC: /, "")) + '</span></a>';
      }).join("") + '</div></div>';
    }).join("");
    sidebar.innerHTML = html;
  }
  if (sidebar) {
    paintSidebar();
    window.addEventListener("hashchange", paintSidebar);
    sidebar.addEventListener("click", function (e) {
      var t = e.target.closest(".nav-toggle");
      if (t) { var grp = t.closest(".nav-group"); var o = grp.classList.toggle("open"); t.setAttribute("aria-expanded", o ? "true" : "false"); return; }
      if (e.target.closest("a")) body.classList.remove("nav-open");
    });
  }

  /* ---------- Pager across the guide pages ---------- */
  var pager = document.getElementById("pager");
  var idx = PAGES.map(function (p) { return p.id; }).indexOf(page);
  if (pager && idx >= 0) {
    var html = "";
    if (idx > 0) html += '<a class="prev" href="' + root + PAGES[idx - 1].href + '"><small>← Previous</small>' + esc(PAGES[idx - 1].title) + '</a>';
    if (idx < PAGES.length - 1) html += '<a class="next" href="' + root + PAGES[idx + 1].href + '"><small>Next →</small>' + esc(PAGES[idx + 1].title) + '</a>';
    pager.innerHTML = html;
    pager.setAttribute("aria-label", "Previous and next pages");
  }

  /* ---------- Footer ---------- */
  var footer = document.getElementById("footer");
  if (footer) footer.innerHTML = "&copy; 2026 SRE Leader's Field Guide · Examples are fictional · Updated " + UPDATED;

  /* ---------- Heading anchors + "On this page" ---------- */
  var article = document.querySelector("main.content article");
  var toc = document.getElementById("toc");
  if (article) {
    var used = {}, tocLinks = [];
    Array.prototype.forEach.call(article.querySelectorAll("h2, h3"), function (h) {
      if (h.closest(".card, .box, .q")) return;
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
      Array.prototype.forEach.call(clone.querySelectorAll(".anchor"), function (el) { el.remove(); });
      tocLinks.push({ id: h.id, text: clone.textContent.trim(), depth: h.tagName === "H2" ? 2 : 3 });
    });
    if (toc) {
      if (tocLinks.length > 2) {
        toc.innerHTML = "<h4>On this page</h4>" + tocLinks.map(function (t) {
          return '<a class="depth-' + t.depth + '" href="#' + t.id + '">' + esc(t.text) + "</a>";
        }).join("");
        toc.setAttribute("aria-label", "On this page");
      } else toc.style.visibility = "hidden";
    }
  }
})();
