/* Home page tabs (WAI-ARIA tabs pattern). Without JavaScript, the three panels simply show stacked with their headings.
   Remembers the last tab (srl-home-tab); a hash like #right-now selects that tab. */
(function () {
  "use strict";
  var wrap = document.querySelector("[data-home-tabs]");
  if (!wrap) return;
  var panels = Array.prototype.slice.call(wrap.querySelectorAll(".tab-panel"));
  if (panels.length < 2) return;

  var list = document.createElement("div");
  list.className = "tablist";
  list.setAttribute("role", "tablist");
  list.setAttribute("aria-label", "Quick access");
  var tabs = panels.map(function (panel, i) {
    var heading = panel.querySelector("h2");
    var tab = document.createElement("button");
    tab.type = "button";
    tab.className = "tab";
    tab.id = "tab-" + panel.id;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panel.id);
    tab.textContent = heading.textContent.replace(/#\s*$/, "").trim();
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tab.id);
    panel.setAttribute("tabindex", "0");
    heading.classList.add("visually-hidden");
    list.appendChild(tab);
    return tab;
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
    SRL.set("home-tab", panels[i].id);
  }
  function indexForHash() {
    var h = location.hash.slice(1);
    if (!h) return -1;
    for (var n = 0; n < panels.length; n++) {
      if (panels[n].id === h || panels[n].querySelector("h2").id === h) return n;
    }
    return -1;
  }

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
  window.addEventListener("hashchange", function () { var n = indexForHash(); if (n >= 0) select(n, false); });

  var start = indexForHash();
  if (start < 0) {
    var saved = SRL.get("home-tab", null);
    panels.forEach(function (p, n) { if (p.id === saved) start = n; });
  }
  select(start < 0 ? 0 : start, false);
})();
