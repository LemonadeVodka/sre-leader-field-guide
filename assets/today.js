/* Today dashboard: the dynamic checklist plus commitment, offender, and skill panels.
   Checklist sources: day-based rituals, items generated from your data, Fire Day, your own items, and rolled-over items. */
(function () {
  "use strict";
  var S = window.SRL, D = S.data, R = window.SRL_RITUALS, esc = S.esc;
  var root = document.body.getAttribute("data-root") || "./";
  var app = document.getElementById("today-app");
  if (!app) return;
  var date = S.today();
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  /* ---------- Which built-in rituals apply on a date ---------- */
  function isFirstMonday(d) { return S.weekday(d) === 1 && S.parse(d).getDate() <= 7; }
  function isQuarterStart(d) { return isFirstMonday(d) && [0, 3, 6, 9].indexOf(S.parse(d).getMonth()) >= 0; }
  function builtIn(d) {
    var out = [];
    R.daily.forEach(function (i) { out.push(tag(i, "daily", "Daily")); });
    (R.byDay[S.weekday(d)] || []).forEach(function (i) { out.push(tag(i, "day", DAYS[S.weekday(d)])); });
    if (isFirstMonday(d)) R.monthly.forEach(function (i) { out.push(tag(i, "month", "Monthly")); });
    if (isQuarterStart(d)) R.quarterly.forEach(function (i) { out.push(tag(i, "quarter", "Quarterly")); });
    return out;
  }
  function allBuiltIns() {
    var out = R.daily.map(function (i) { return tag(i, "daily", "Daily"); });
    Object.keys(R.byDay).forEach(function (k) { R.byDay[k].forEach(function (i) { out.push(tag(i, "day", DAYS[k])); }); });
    R.monthly.forEach(function (i) { out.push(tag(i, "month", "First Monday")); });
    R.quarterly.forEach(function (i) { out.push(tag(i, "quarter", "Quarter Start")); });
    return out;
  }
  function tag(i, src, label) { return { id: i.id, text: i.text, link: i.link, src: src, label: label }; }

  /* ---------- Items generated from your data ---------- */
  function generated() {
    var out = [];
    var over = D.commitments.overdue();
    if (over.length) out.push({ id: "gen-overdue", src: "gen", label: "From Tracker", link: "lead/commitments.html#overdue",
      text: "Follow up on " + over.length + " overdue commitment" + (over.length > 1 ? "s" : "") + ": " + over.slice(0, 3).map(function (c) { return c.who || "?"; }).join(", ") + (over.length > 3 ? "…" : "") });
    var fol = D.commitments.followToday().filter(function (c) { return !D.commitments.isOverdue(c); });
    if (fol.length) out.push({ id: "gen-follow", src: "gen", label: "From Tracker", link: "lead/commitments.html",
      text: "Check in on " + fol.length + " commitment" + (fol.length > 1 ? "s" : "") + " with a follow-up due today" });
    var top = D.offenders.ranked()[0];
    if (top && (top.status === "unowned" || top.status === "owned")) out.push({ id: "gen-offender", src: "gen", label: "From Offenders", link: "firefight/top-offenders.html",
      text: "Top offender still " + (top.status === "unowned" ? "has no owner" : "isn't started") + ": " + top.name + " (" + (top.pages || 0) + " pages a week)" });
    var f = D.skills.focus();
    if (f) out.push({ id: "gen-skill", src: "gen", label: "Skill Focus", link: "grow/skills-map.html", text: "Skill rep: " + f.practice });
    var age = S.backupAge();
    if (S.hasData() && (age === null || age > 7)) out.push({ id: "gen-backup", src: "gen", label: "Data", link: "start-here.html#your-data",
      text: age === null ? "Back up your data. You've never exported a backup." : "Back up your data. Your last backup was " + age + " days ago." });
    return out;
  }

  /* ---------- Your own items ---------- */
  function customFor(d) {
    var w = S.weekday(d);
    return (S.get("ritual-custom", []) || []).filter(function (c) {
      return c.days === "all" || (c.days === "weekdays" && w >= 1 && w <= 5) || (Array.isArray(c.days) && c.days.indexOf(w) >= 0);
    }).map(function (c) { return { id: c.id, text: c.text, src: "mine", label: "Yours" }; });
  }
  function daysLabel(days) {
    if (days === "all") return "Every day";
    if (days === "weekdays") return "Weekdays";
    return days.map(function (n) { return DAYS[n].slice(0, 3); }).join(", ");
  }

  /* ---------- Assemble today's list ---------- */
  function fireOn() { return !!S.get("fire-" + date, false); }
  function normalList() {
    var hidden = S.get("ritual-hidden", []) || [], edits = S.get("ritual-edit", {}) || {};
    var roll = (S.get("roll-" + date, []) || []).map(function (r) { return { id: "roll-" + r.id, text: r.text, link: r.link, src: "roll", label: "From " + S.fmt(r.from) }; });
    var list = roll.concat(builtIn(date), customFor(date)).filter(function (i) { return hidden.indexOf(i.id) < 0; });
    list.forEach(function (i) { if (edits[i.id]) i.text = edits[i.id]; });
    var order = S.get("ritual-order", []) || [];
    list.sort(function (a, b) {
      var ia = order.indexOf(a.id), ib = order.indexOf(b.id);
      if (ia < 0 && ib < 0) return 0; if (ia < 0) return 1; if (ib < 0) return -1; return ia - ib;
    });
    return list;
  }
  function todaysList() {
    if (fireOn()) return R.fireDay.map(function (i) { return tag(i, "fire", "Fire Day"); });
    return generated().concat(normalList());
  }

  /* ---------- State helpers ---------- */
  function ticks() { return S.get("ticks-" + date, {}) || {}; }
  function rolledOut() { return S.get("rolled-" + date, []) || []; }
  function rollTo(items, d) {
    var key = "roll-" + d, list = S.get(key, []) || [];
    items.forEach(function (i) {
      var baseId = i.id.replace(/^roll-/, "");
      if (!list.some(function (r) { return r.id === baseId; })) list.push({ id: baseId, text: i.text, link: i.link, from: date });
    });
    S.set(key, list);
  }
  function unrollFrom(ids, d) {
    var key = "roll-" + d;
    S.set(key, (S.get(key, []) || []).filter(function (r) { return ids.indexOf(r.id) < 0; }));
  }
  function recordHistory(done, total) {
    var h = S.get("history", {}) || {};
    h[date] = { d: done, t: total };
    S.set("history", h);
  }

  /* ---------- Render ---------- */
  var customizing = false, editing = null;

  function render() {
    var list = todaysList(), t = ticks(), out = rolledOut(), fire = fireOn();
    var active = list.filter(function (i) { return out.indexOf(i.id) < 0; });
    var done = active.filter(function (i) { return t[i.id]; }).length;
    recordHistory(done, active.length);

    var html = '<div class="fire-switch' + (fire ? " on" : "") + '"><input type="checkbox" id="fire-toggle"' + (fire ? " checked" : "") + '>' +
      '<label for="fire-toggle">Fire Day' + (fire ? ": survival list only. Everything else moves to tomorrow." : "? Switch on to cut today down to 5 survival items.") + '</label></div>';
    html += '<ul class="today-list">' + list.map(function (i) {
      var moved = out.indexOf(i.id) >= 0, on = !!t[i.id];
      var src = '<span class="src ' + srcClass(i.src) + '">' + esc(i.label) + '</span>';
      var link = i.link ? ' <a href="' + root + i.link + '">Open →</a>' : "";
      if (moved) return '<li class="checked"><label><input type="checkbox" disabled><span><span class="txt">' + esc(i.text) + '</span> <span class="src roll">Moved to tomorrow</span></span></label></li>';
      return '<li class="' + (on ? "checked" : "") + '"><label><input type="checkbox" data-id="' + esc(i.id) + '"' + (on ? " checked" : "") + '><span><span class="txt">' + esc(i.text) + '</span>' + src + link + '</span></label></li>';
    }).join("") + '</ul>';
    html += '<div class="checklist-tools"><span>' + done + ' of ' + active.length + ' done</span><span class="btn-row" style="margin:0">' +
      (fire ? "" : '<button type="button" class="btn small" id="roll-btn">Move Unfinished to Tomorrow</button>') +
      '<button type="button" class="btn small" id="custom-btn" aria-expanded="' + customizing + '">' + (customizing ? "Done Customizing" : "Customize") + '</button></span></div>';
    html += streakHtml();
    if (customizing) html += customizeHtml();
    document.getElementById("checklist-body").innerHTML = html;
    renderSide();
  }
  function srcClass(s) { return s === "gen" ? "gen" : s === "roll" ? "roll" : s === "fire" ? "fire" : s === "mine" ? "mine" : ""; }

  function streakHtml() {
    var h = S.get("history", {}) || {}, dots = "", streak = 0, counting = true;
    for (var n = 13; n >= 0; n--) {
      var d = S.addDays(date, -n), e = h[d], cls = !e || !e.t ? "" : e.d >= e.t ? "full" : e.d > 0 ? "part" : "";
      dots += '<i class="' + cls + '" title="' + S.fmt(d) + (e ? ": " + e.d + "/" + e.t : ": no data") + '"></i>';
    }
    for (var k = 0; k < 365 && counting; k++) {
      var dd = S.addDays(date, -k), ee = h[dd];
      if (ee && ee.t && ee.d >= ee.t) streak++;
      else if (k === 0) continue; /* today not finished yet doesn't break the streak */
      else counting = false;
    }
    return '<div class="small" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="streak" aria-label="Last 14 days">' + dots + '</span><span>Streak: <strong>' + streak + '</strong> full day' + (streak === 1 ? "" : "s") + '</span></div>';
  }

  function customizeHtml() {
    var hidden = S.get("ritual-hidden", []) || [], custom = S.get("ritual-custom", []) || [];
    var todayItems = normalList();
    var h = '<div class="customize"><h3 style="margin:0 0 6px">Customize Your Routine</h3>';
    h += '<p class="small">Reorder, edit, or hide items. Changes apply every day the item appears. Items generated from your data can\'t be edited because they update themselves.</p>';
    h += '<h4 style="margin:12px 0 4px">Today\'s Order</h4><ul style="list-style:none;padding:0;margin:0">' + todayItems.map(function (i, n) {
      var isEditing = editing === i.id;
      return '<li><span class="grow">' + (isEditing ? '<input type="text" id="edit-input" value="' + esc(i.text) + '">' : esc(i.text) + ' <span class="src ' + srcClass(i.src) + '">' + esc(i.label) + '</span>') + '</span>' +
        (isEditing ? '<button class="btn small" data-act="save-edit" data-id="' + esc(i.id) + '">Save</button>' :
          '<button class="btn small" data-act="up" data-id="' + esc(i.id) + '"' + (n === 0 ? " disabled" : "") + ' aria-label="Move up">↑</button>' +
          '<button class="btn small" data-act="down" data-id="' + esc(i.id) + '"' + (n === todayItems.length - 1 ? " disabled" : "") + ' aria-label="Move down">↓</button>' +
          (i.src === "roll" ? "" : '<button class="btn small" data-act="edit" data-id="' + esc(i.id) + '">Edit</button>') +
          (i.src === "mine" || i.src === "roll" ? "" : '<button class="btn small" data-act="hide" data-id="' + esc(i.id) + '">Hide</button>')) + '</li>';
    }).join("") + '</ul>';
    h += '<h4 style="margin:16px 0 4px">Your Items</h4>' + (custom.length ? '<ul style="list-style:none;padding:0;margin:0">' + custom.map(function (c) {
      return '<li><span class="grow">' + esc(c.text) + ' <span class="src mine">' + esc(daysLabel(c.days)) + '</span></span><button class="btn small danger" data-act="del-custom" data-id="' + esc(c.id) + '">Delete</button></li>';
    }).join("") + '</ul>' : '<p class="small">None yet.</p>');
    h += '<form id="add-custom" class="form-grid" style="margin-top:8px"><label class="field wide">New item<input type="text" name="text" required placeholder="e.g. Check the model provider status page"></label>' +
      '<label class="field">When<select name="days"><option value="all">Every day</option><option value="weekdays">Weekdays</option>' +
      [1, 2, 3, 4, 5].map(function (n) { return '<option value="' + n + '">' + DAYS[n] + 's</option>'; }).join("") + '</select></label>' +
      '<div style="align-self:end"><button class="btn primary" type="submit">Add Item</button></div></form>';
    var hiddenItems = allBuiltIns().filter(function (i) { return hidden.indexOf(i.id) >= 0; });
    h += '<h4 style="margin:16px 0 4px">Hidden Built-In Items</h4>' + (hiddenItems.length ? '<ul style="list-style:none;padding:0;margin:0">' + hiddenItems.map(function (i) {
      return '<li class="hidden-item"><span class="grow">' + esc(i.text) + ' <span class="src">' + esc(i.label) + '</span></span><button class="btn small" data-act="unhide" data-id="' + esc(i.id) + '">Show Again</button></li>';
    }).join("") + '</ul>' : '<p class="small">None.</p>');
    return h + '</div>';
  }

  function renderSide() {
    /* Commitments */
    var over = D.commitments.overdue().sort(D.commitments.byDue);
    var week = D.commitments.dueThisWeek().sort(D.commitments.byDue);
    var fol = D.commitments.followToday().filter(function (c) { return !D.commitments.isOverdue(c); });
    var show = over.concat(fol.filter(function (c) { return week.indexOf(c) < 0; }), week).slice(0, 6);
    var ch = '<div class="kpi"><div class="' + (over.length ? "danger" : "") + '"><b>' + over.length + '</b><span>Overdue</span></div><div><b>' + week.length + '</b><span>Due this week</span></div><div class="' + (fol.length ? "warn" : "") + '"><b>' + fol.length + '</b><span>Follow-ups today</span></div></div>';
    ch += show.length ? '<ul class="item-list">' + show.map(function (c) {
      var od = D.commitments.isOverdue(c);
      return '<li class="item ' + (od ? "overdue" : c.status) + '"><div class="item-head"><span class="item-title">' + esc(c.what) + '</span></div>' +
        '<div class="item-meta"><span>' + esc(c.who || "No owner") + '</span><span>' + (c.due ? (od ? "Was due " : "Due ") + S.rel(c.due) : "No date") + '</span>' + (c.slips ? '<span class="badge warn">Slipped ' + c.slips + '×</span>' : "") + '</div>' +
        '<div class="item-actions"><button class="btn small" data-done="' + esc(c.id) + '">Mark Done</button><a class="btn small" href="' + root + 'lead/commitments.html#c-' + esc(c.id) + '">Nudge or Edit</a></div></li>';
    }).join("") + '</ul>' : '<p class="empty">Nothing due. <a href="' + root + 'lead/commitments.html#add">Add a commitment</a> the next time someone says "I\'ll look into it."</p>';
    document.getElementById("commit-body").innerHTML = ch;

    /* Offenders */
    var off = D.offenders.ranked().slice(0, 3);
    document.getElementById("offender-body").innerHTML = off.length ? '<ol style="margin:0;padding-left:1.2em">' + off.map(function (o) {
      var st = D.offenders.STATUSES.filter(function (s) { return s.id === o.status; })[0];
      return '<li style="margin:6px 0"><strong>' + esc(o.name) + '</strong><div class="small">' + esc(o.pod || "No pod") + ' · ' + (o.pages || 0) + ' pages/wk · ' + (o.hours || 0) + ' hrs/wk · <span class="badge ' + (o.status === "unowned" ? "danger" : o.status === "fixing" ? "info" : "warn") + '">' + esc(st ? st.label : o.status) + '</span></div></li>';
    }).join("") + '</ol>' : '<p class="empty">No offenders logged. <a href="' + root + 'firefight/top-offenders.html">Log the issue that paged most this week</a>.</p>';

    /* Skill focus */
    var f = D.skills.focus();
    document.getElementById("skill-body").innerHTML = f ?
      '<p style="margin:0 0 6px"><strong>' + esc(f.can) + '</strong></p><p class="small" style="margin:0">This week: ' + esc(f.practice) + '</p><p class="small" style="margin:6px 0 0"><a href="' + root + 'grow/skills-map.html#' + esc(f.id) + '">Open the Skills Map →</a></p>' :
      '<p class="empty">Rate yourself on the <a href="' + root + 'grow/skills-map.html">Skills Map</a> (10 minutes). Your weakest skill becomes this week\'s focus.</p>';
  }

  /* ---------- Events ---------- */
  app.addEventListener("change", function (e) {
    var el = e.target;
    if (el.id === "fire-toggle") {
      var tomorrow = S.addDays(date, 1);
      if (el.checked) {
        var t = ticks(), out = rolledOut();
        var toMove = normalList().filter(function (i) { return !t[i.id] && out.indexOf(i.id) < 0; });
        rollTo(toMove, tomorrow);
        S.set("fire-moved-" + date, toMove.map(function (i) { return i.id.replace(/^roll-/, ""); }));
        S.set("fire-" + date, true);
        S.toast("Fire Day on. " + toMove.length + " items moved to tomorrow.");
      } else {
        unrollFrom(S.get("fire-moved-" + date, []) || [], tomorrow);
        S.del("fire-moved-" + date); S.del("fire-" + date);
        S.toast("Fire Day off. Your normal list is back.");
      }
      render(); return;
    }
    if (el.matches('input[type="checkbox"][data-id]')) {
      var tk = ticks(); tk[el.getAttribute("data-id")] = el.checked; S.set("ticks-" + date, tk); render();
    }
  });

  app.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.id === "roll-btn") {
      var t = ticks(), out = rolledOut();
      var items = normalList().filter(function (i) { return !t[i.id] && out.indexOf(i.id) < 0; });
      if (!items.length) { S.toast("Nothing unfinished to move."); return; }
      rollTo(items, S.addDays(date, 1));
      S.set("rolled-" + date, out.concat(items.map(function (i) { return i.id; })));
      S.toast(items.length + " item" + (items.length > 1 ? "s" : "") + " moved to tomorrow");
      render(); return;
    }
    if (b.id === "custom-btn") { customizing = !customizing; editing = null; render(); return; }
    if (b.hasAttribute("data-done")) { D.commitments.update(b.getAttribute("data-done"), { status: "done", closed: date }); S.toast("Marked done"); render(); return; }
    var act = b.getAttribute("data-act"), id = b.getAttribute("data-id");
    if (!act) return;
    if (act === "up" || act === "down") {
      var ids = normalList().map(function (i) { return i.id; }), n = ids.indexOf(id), m = act === "up" ? n - 1 : n + 1;
      if (m < 0 || m >= ids.length) return;
      ids[n] = ids[m]; ids[m] = id;
      S.set("ritual-order", ids);
    } else if (act === "hide") {
      var h = S.get("ritual-hidden", []) || []; h.push(id); S.set("ritual-hidden", h);
    } else if (act === "unhide") {
      S.set("ritual-hidden", (S.get("ritual-hidden", []) || []).filter(function (x) { return x !== id; }));
    } else if (act === "edit") {
      editing = id;
    } else if (act === "save-edit") {
      var v = document.getElementById("edit-input").value.trim();
      if (id.indexOf("c-") === 0) {
        var cu = S.get("ritual-custom", []) || []; cu.forEach(function (c) { if (c.id === id && v) c.text = v; }); S.set("ritual-custom", cu);
      } else {
        var ed = S.get("ritual-edit", {}) || {}; if (v) ed[id] = v; else delete ed[id]; S.set("ritual-edit", ed);
      }
      editing = null;
    } else if (act === "del-custom") {
      S.set("ritual-custom", (S.get("ritual-custom", []) || []).filter(function (c) { return c.id !== id; }));
    }
    render();
  });

  app.addEventListener("submit", function (e) {
    if (e.target.id !== "add-custom") return;
    e.preventDefault();
    var f = e.target, text = f.text.value.trim(), dv = f.days.value;
    if (!text) return;
    var cu = S.get("ritual-custom", []) || [];
    cu.push({ id: "c-" + S.uid(), text: text, days: dv === "all" || dv === "weekdays" ? dv : [+dv] });
    S.set("ritual-custom", cu);
    S.toast("Added to your routine");
    render();
  });

  /* ---------- Header bits ---------- */
  var d = S.parse(date);
  document.getElementById("today-date").textContent = d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  var notes = [];
  if (!S.hasData()) notes.push('<div class="alert-bar info"><strong>First time here?</strong> Read <a href="' + root + 'start-here.html">Start Here</a> (5 minutes), then rate yourself on the <a href="' + root + 'grow/skills-map.html">Skills Map</a> and log your open commitments.</div>');
  if (isFirstMonday(date)) notes.push('<div class="alert-bar info">First Monday of the month. Your monthly reliability review is on the list.</div>');
  document.getElementById("today-notes").innerHTML = notes.join("");

  render();
})();
