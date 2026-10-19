/* SRE Leader's Field Guide — shared storage and helpers (window.SRL).
   Everything lives in this browser's localStorage under the "srl-" prefix. Nothing is sent anywhere. */
(function () {
  "use strict";
  var PREFIX = "srl-";

  function raw(key, val) {
    try {
      if (val === undefined) return window.localStorage.getItem(PREFIX + key);
      if (val === null) window.localStorage.removeItem(PREFIX + key);
      else window.localStorage.setItem(PREFIX + key, val);
    } catch (e) { /* storage blocked (private window, policy) — tools still render */ }
    return null;
  }
  function get(key, fallback) {
    var v = raw(key);
    if (v === null || v === undefined) return fallback;
    try { return JSON.parse(v); } catch (e) { return fallback; }
  }
  function set(key, val) { raw(key, val === null ? null : JSON.stringify(val)); }
  function del(key) { raw(key, null); }
  function keys() {
    var out = [];
    try {
      for (var i = 0; i < window.localStorage.length; i++) {
        var k = window.localStorage.key(i);
        if (k && k.indexOf(PREFIX) === 0) out.push(k.slice(PREFIX.length));
      }
    } catch (e) { /* ignore */ }
    return out;
  }

  /* ---------- Dates (local time, ISO yyyy-mm-dd). ?date=yyyy-mm-dd overrides "today" for testing. ---------- */
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function parse(s) { if (!s) return null; var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function today() {
    var m = /[?&]date=(\d{4}-\d{2}-\d{2})/.exec(location.search);
    return m ? m[1] : iso(new Date());
  }
  function addDays(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return iso(d); }
  function daysBetween(a, b) { return Math.round((parse(b) - parse(a)) / 86400000); }
  function weekday(s) { return parse(s).getDay(); }
  function fmt(s) {
    if (!s) return "";
    var d = parse(s);
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }
  function rel(s) {
    if (!s) return "";
    var n = daysBetween(today(), s);
    if (n === 0) return "today";
    if (n === 1) return "tomorrow";
    if (n === -1) return "yesterday";
    return n < 0 ? (-n) + " days ago" : "in " + n + " days";
  }
  function endOfWeek(s) { var w = weekday(s); return addDays(s, w === 0 ? 0 : 7 - w); }

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------- Downloads, clipboard ---------- */
  function download(name, text, type) {
    var blob = new Blob([text], { type: type || "text/plain" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function csv(name, rows, cols) {
    var q = function (v) { v = v == null ? "" : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var lines = [cols.map(function (c) { return q(c.label); }).join(",")];
    rows.forEach(function (r) { lines.push(cols.map(function (c) { return q(typeof c.get === "function" ? c.get(r) : r[c.key]); }).join(",")); });
    download(name, lines.join("\n"), "text/csv");
  }
  function copy(text) {
    var done = function () { toast("Copied"); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else fallback();
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("Copy failed: select and copy manually"); }
      ta.remove();
    }
  }
  function toast(msg) {
    var t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("show"); }, 1800);
  }

  /* ---------- Backup / restore ---------- */
  function backup() {
    set("last-backup", today()); /* first, so a restored file carries its own backup date */
    var data = {};
    keys().forEach(function (k) { if (k !== "theme") data[k] = raw(k); });
    var payload = { app: "sre-leader-field-guide", version: 1, exported: new Date().toISOString(), data: data };
    download("sre-leader-backup-" + today() + ".json", JSON.stringify(payload, null, 2), "application/json");
  }
  function restore(file, done) {
    var r = new FileReader();
    r.onload = function () {
      try {
        var p = JSON.parse(r.result);
        if (!p || p.app !== "sre-leader-field-guide" || !p.data) throw new Error("Not a Field Guide backup file");
        Object.keys(p.data).forEach(function (k) { raw(k, p.data[k]); });
        done && done(null, Object.keys(p.data).length);
      } catch (e) { done && done(e); }
    };
    r.readAsText(file);
  }
  function clearAll() { keys().forEach(function (k) { if (k !== "theme") del(k); }); }
  function backupAge() {
    var last = get("last-backup", null);
    return last ? daysBetween(last, today()) : null;
  }
  /* True once you've entered something worth backing up (not just checklist bookkeeping). */
  var MEANINGFUL = ["commitments", "wins", "offenders", "skills", "meetings", "ritual-custom"];
  function hasData() {
    return MEANINGFUL.some(function (k) { var v = get(k, null); return v && (Array.isArray(v) ? v.length : Object.keys(v).length); });
  }

  window.SRL = {
    get: get, set: set, del: del, keys: keys,
    today: today, iso: iso, parse: parse, addDays: addDays, daysBetween: daysBetween, weekday: weekday, fmt: fmt, rel: rel, endOfWeek: endOfWeek,
    uid: uid, esc: esc, download: download, csv: csv, copy: copy, toast: toast,
    backup: backup, restore: restore, clearAll: clearAll, backupAge: backupAge, hasData: hasData
  };
})();
