/* Skills Map: rate yourself on practical "I can…" skills. The lowest-rated (or pinned) skill becomes Today's focus. */
(function () {
  "use strict";
  var S = window.SRL, K = S.data.skills, esc = S.esc, LEVELS = window.SRL_SKILL_LEVELS, SKILLS = window.SRL_SKILLS;
  var app = document.getElementById("skills-app");
  if (!app) return;
  var root = document.body.getAttribute("data-root") || "./";

  function render() {
    var r = K.ratings(), focus = K.focus(), pinned = S.get("skill-focus", null);
    var rated = SKILLS.filter(function (s) { return r[s.id]; });
    var areas = [];
    SKILLS.forEach(function (s) { if (areas.indexOf(s.area) < 0) areas.push(s.area); });

    var summary = '<div class="panel" style="margin-bottom:16px"><h2 data-notoc>Where You Stand <small>' + rated.length + ' of ' + SKILLS.length + ' rated</small></h2>' +
      areas.map(function (a) {
        var list = SKILLS.filter(function (s) { return s.area === a; }), sum = 0, n = 0;
        list.forEach(function (s) { if (r[s.id]) { sum += r[s.id].r; n++; } });
        var pct = n ? Math.round((sum / (n * 4)) * 100) : 0;
        return '<div style="margin:8px 0"><div style="display:flex;justify-content:space-between;font-size:14px"><a href="#' + slug(a) + '">' + esc(a) + '</a><span class="small">' + (n ? (sum / n).toFixed(1) + " / 4" : "not rated") + '</span></div><div class="meter"><i style="width:' + pct + '%"></i></div></div>';
      }).join("") +
      (focus ? '<p style="margin:12px 0 0"><strong>Current focus' + (pinned ? " (pinned)" : " (lowest rated)") + ':</strong> <a href="#' + esc(focus.id) + '">' + esc(focus.can) + '</a>' + (pinned ? ' <button class="link-btn" data-unpin="1">Unpin</button>' : "") + '</p>' : '<p class="small" style="margin:12px 0 0">Rate a few skills and your focus will appear here and on Today.</p>') +
      '</div>';

    app.innerHTML = summary + areas.map(function (a) {
      return '<h2 id="' + slug(a) + '">' + esc(a) + '</h2><div style="display:grid;gap:10px">' + SKILLS.filter(function (s) { return s.area === a; }).map(function (s) {
        var cur = r[s.id] ? r[s.id].r : 0, isFocus = focus && focus.id === s.id;
        return '<div class="skill' + (isFocus ? " focus" : "") + '" id="' + esc(s.id) + '"><div style="font-weight:600">' + esc(s.can) + (isFocus ? ' <span class="badge info">Focus</span>' : "") + '</div>' +
          '<div class="rating" role="group" aria-label="Rate yourself">' + LEVELS.map(function (l) {
            return '<button type="button" data-skill="' + esc(s.id) + '" data-v="' + l.v + '" aria-pressed="' + (cur === l.v) + '">' + l.v + ' · ' + esc(l.label) + '</button>';
          }).join("") + '</div>' +
          '<div class="small"><strong>This week\'s rep:</strong> ' + esc(s.practice) + '</div>' +
          '<div class="small" style="margin-top:4px;display:flex;gap:12px;flex-wrap:wrap">' +
          (s.link ? '<a href="' + root + s.link + '">Practice tool →</a>' : "") +
          (s.read ? '<a href="' + esc(s.read) + '" target="_blank" rel="noopener">Read the chapter (sre.google) ↗</a>' : "") +
          (r[s.id] ? '<span>Rated ' + S.fmt(r[s.id].at) + '</span>' : "") +
          (isFocus && S.get("skill-focus", null) === s.id ? "" : '<button class="link-btn" data-pin="' + esc(s.id) + '">Make this my focus</button>') + '</div></div>';
      }).join("") + '</div>';
    }).join("");

    var snaps = S.get("skill-snapshots", []) || [];
    document.getElementById("snap-info").textContent = snaps.length ? "Last snapshot: " + S.fmt(snaps[snaps.length - 1].date) + " (" + snaps.length + " total)" : "No snapshots yet.";
  }
  function slug(a) { return "area-" + a.toLowerCase().replace(/[^a-z0-9]+/g, "-"); }

  app.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-skill")) { K.rate(b.getAttribute("data-skill"), +b.getAttribute("data-v")); render(); return; }
    if (b.hasAttribute("data-pin")) { S.set("skill-focus", b.getAttribute("data-pin")); S.toast("Pinned as your focus. It shows on Today."); render(); return; }
    if (b.hasAttribute("data-unpin")) { S.del("skill-focus"); render(); }
  });
  document.getElementById("snapshot").addEventListener("click", function () {
    var snaps = S.get("skill-snapshots", []) || [];
    snaps.push({ date: S.today(), ratings: K.ratings() });
    S.set("skill-snapshots", snaps);
    S.toast("Snapshot saved. Compare next quarter.");
    render();
  });
  document.getElementById("compare").addEventListener("click", function () {
    var snaps = S.get("skill-snapshots", []) || [], out = document.getElementById("compare-out");
    if (!snaps.length) { out.innerHTML = '<p class="small">Save a snapshot first, then compare after you\'ve re-rated.</p>'; return; }
    var prev = snaps[snaps.length - 1].ratings, now = K.ratings();
    var rows = SKILLS.map(function (s) {
      var a = prev[s.id] ? prev[s.id].r : 0, b = now[s.id] ? now[s.id].r : 0;
      return { s: s, a: a, b: b, d: b - a };
    }).filter(function (x) { return x.d !== 0; });
    out.innerHTML = rows.length ? '<div class="table-wrap"><table><thead><tr><th>Skill</th><th>Then</th><th>Now</th></tr></thead><tbody>' + rows.map(function (x) {
      return '<tr><td>' + esc(x.s.can) + '</td><td>' + (x.a || "–") + '</td><td style="color:' + (x.d > 0 ? "var(--ok)" : "var(--danger)") + '">' + x.b + (x.d > 0 ? " ↑" : " ↓") + '</td></tr>';
    }).join("") + '</tbody></table></div>' : '<p class="small">No changes since ' + S.fmt(snaps[snaps.length - 1].date) + '.</p>';
  });

  render();
  if (location.hash) { var el = document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView({ block: "center" }); }
})();
