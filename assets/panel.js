/* Side panel: four tabs (Incident, Exec Comms, Projects, Meetings), copy buttons, theme toggle.
   Without JavaScript all four sections show stacked. The last tab is remembered (srl-panel-tab); #incident, #exec,
   #projects, or #meetings opens a specific tab. */
(function () {
  "use strict";
  var S = window.SRL;

  /* ---------- Theme toggle ---------- */
  var themeBtn = document.querySelector(".panel-bar .theme-btn");
  if (themeBtn) {
    var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
    var isDark = function () {
      var t = document.documentElement.getAttribute("data-theme");
      if (t) return t === "dark";
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    };
    var paint = function () {
      themeBtn.innerHTML = isDark() ? SUN : MOON;
      themeBtn.setAttribute("aria-label", isDark() ? "Switch to light theme" : "Switch to dark theme");
    };
    paint();
    themeBtn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      S.set("theme", next);
      paint();
    });
  }

  /* ---------- Copy buttons: question lines and template blocks ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".p-line[data-copy]"), function (li) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "p-copy"; b.textContent = "Copy";
    b.setAttribute("aria-label", "Copy: " + li.getAttribute("data-copy"));
    b.addEventListener("click", function () { S.copy(li.getAttribute("data-copy")); });
    li.appendChild(b);
  });
  Array.prototype.forEach.call(document.querySelectorAll(".code-card"), function (card) {
    var head = card.querySelector(".code-head"), pre = card.querySelector("pre");
    if (!head || !pre) return;
    var b = document.createElement("button");
    b.type = "button"; b.className = "copy-btn"; b.textContent = "Copy";
    b.setAttribute("aria-label", "Copy: " + head.textContent.trim());
    b.addEventListener("click", function () { S.copy(pre.innerText.replace(/\n$/, "")); });
    head.appendChild(b);
  });

  /* ---------- Tabs (WAI-ARIA pattern) ---------- */
  var wrap = document.querySelector("[data-panel]");
  if (!wrap) return;
  var panels = Array.prototype.slice.call(wrap.querySelectorAll(".panel-tab"));
  var list = document.createElement("div");
  list.className = "panel-tablist";
  list.setAttribute("role", "tablist");
  list.setAttribute("aria-label", "Side panel sections");
  var tabs = panels.map(function (p) {
    var h = p.querySelector("h2");
    var t = document.createElement("button");
    t.type = "button"; t.className = "panel-tabbtn " + (p.className.match(/tone-\w+/) || [""])[0];
    t.id = "tab-" + p.id; t.setAttribute("role", "tab"); t.setAttribute("aria-controls", p.id);
    t.textContent = h.textContent;
    p.setAttribute("role", "tabpanel"); p.setAttribute("aria-labelledby", t.id); p.setAttribute("tabindex", "0");
    h.classList.add("visually-hidden");
    list.appendChild(t);
    return t;
  });
  wrap.insertBefore(list, panels[0]);
  wrap.classList.add("is-tabbed");

  function select(i, focus) {
    tabs.forEach(function (t, n) {
      var on = n === i;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      panels[n].hidden = !on;
    });
    if (focus) tabs[i].focus();
    S.set("panel-tab", panels[i].id);
  }
  function indexFor(id) { for (var n = 0; n < panels.length; n++) if (panels[n].id === id) return n; return -1; }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { select(i, false); });
    t.addEventListener("keydown", function (e) {
      var n = null;
      if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = tabs.length - 1;
      if (n !== null) { e.preventDefault(); select(n, true); }
    });
  });
  window.addEventListener("hashchange", function () { var n = indexFor(location.hash.slice(1)); if (n >= 0) select(n, false); });
  var start = indexFor(location.hash.slice(1));
  if (start < 0) start = indexFor(S.get("panel-tab", ""));
  select(start < 0 ? 0 : start, false);
  window.addEventListener("beforeprint", function () { panels.forEach(function (p) { p.hidden = false; }); });
})();
