/* SRE Leader's Field Guide — small shared helpers (window.SRL).
   The only thing saved is your light/dark theme choice, in this browser. */
(function () {
  "use strict";
  function get(key, fallback) {
    try { var v = window.localStorage.getItem("srl-" + key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
  }
  function set(key, val) {
    try { window.localStorage.setItem("srl-" + key, JSON.stringify(val)); } catch (e) { /* storage blocked: theme just won't persist */ }
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function toast(msg) {
    var t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("show"); }, 1800);
  }
  function copy(text) {
    var done = function () { toast("Copied"); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("Copy failed: select and copy manually"); }
      ta.remove();
    }
  }
  window.SRL = { get: get, set: set, esc: esc, toast: toast, copy: copy };
})();
