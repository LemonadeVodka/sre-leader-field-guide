/* Today's lesson (picked by date, same all day), your learning-path week, and the path start date.
   Nothing is tracked. The only saved item is the path start date you choose (srl-path-start), in this browser. */
(function () {
  "use strict";
  var S = window.SRL, esc = S.esc, root = document.body.getAttribute("data-root") || "./";
  var L = window.SRL_LESSONS || [];
  var IR = ["Command Basics", "Impact and Severity", "When It's Stuck", "Communication Under Pressure", "The NOC and Handoffs", "AI-Specific Incidents", "Learning From Incidents", "Building the Program"];
  var PM = ["PACE and the Weekly Sweep", "\"Waiting On\" and Linear Hygiene", "Updates Upward, Risks, and Saying No"];
  var DAY = 864e5;
  function today() { var d = new Date(); return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / DAY); }

  /* ---------- Date line ---------- */
  var dateEl = document.querySelector("[data-today-date]");
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
    dateEl.hidden = false;
  }

  /* ---------- Lesson of the day ---------- */
  var box = document.querySelector("[data-lesson]");
  if (box && L.length) {
    var base = today() % L.length, offset = 0;
    var render = function () {
      var l = L[(base + offset + L.length * 10) % L.length];
      box.innerHTML =
        '<p class="lesson-meta"><span class="lesson-type type-' + l.type.toLowerCase() + '">' + l.type + '</span> <span class="lesson-track">' + (offset === 0 ? "Today's lesson" : (offset < 0 ? "Earlier lesson" : "Upcoming lesson")) + ' · about 15 minutes</span></p>' +
        '<h3 id="lesson-title">' + esc(l.title) + '</h3>' +
        '<dl class="lesson-dl">' +
        '<dt>The situation</dt><dd>' + esc(l.situation) + '</dd>' +
        '<dt>Do this today</dt><dd>' + esc(l.todo) + '</dd>' +
        '<dt>Say this</dt><dd>' + esc(l.say) + '</dd>' +
        '<dt>Check it worked</dt><dd>' + esc(l.check) + '</dd>' +
        '<dt>Why it makes you better</dt><dd>' + esc(l.why) + '</dd></dl>' +
        '<p class="lesson-more">Go deeper: <a href="' + root + l.link.u + '">' + esc(l.link.t) + '</a></p>' +
        '<p class="lesson-nav"><button type="button" class="link-btn" data-lesson-step="-1">Previous</button><span aria-hidden="true">·</span>' +
        (offset !== 0 ? '<button type="button" class="link-btn" data-lesson-step="0">Back to today</button><span aria-hidden="true">·</span>' : "") +
        '<button type="button" class="link-btn" data-lesson-step="1">Next</button><span aria-hidden="true">·</span><a href="' + root + 'lessons.html">All ' + L.length + ' lessons</a></p>';
      box.setAttribute("data-lesson-id", l.id);
    };
    box.addEventListener("click", function (e) {
      var b = e.target.closest("[data-lesson-step]");
      if (!b) return;
      var st = +b.getAttribute("data-lesson-step");
      offset = st === 0 ? 0 : offset + st;
      render();
      var h = box.querySelector("h3"); if (h) { h.setAttribute("tabindex", "-1"); h.focus(); }
    });
    render();
  }

  /* ---------- Path week ---------- */
  function startDay() { var v = S.get("path-start", null); if (!v) return null; var p = v.split("-"); return Math.floor(Date.UTC(+p[0], +p[1] - 1, +p[2]) / DAY); }
  function weekNow() { var s = startDay(); if (s === null) return 0; return Math.max(1, Math.floor((today() - s) / 7) + 1); }

  var pathBox = document.querySelector("[data-path]");
  if (pathBox) {
    var w = weekNow(), html;
    if (!w) {
      html = '<p class="path-week-label">Not started</p><h3>The Incident Leader Path</h3><p>Eight weeks, about 15 minutes a day, built around practice on real bridges.</p>' +
        '<p><a class="path-go" href="' + root + 'learn/paths.html">Start the path</a></p>';
    } else if (w <= IR.length) {
      html = '<p class="path-week-label">Incident Leader Path · Week ' + w + ' of ' + IR.length + '</p><h3>' + esc(IR[w - 1]) + '</h3>' +
        '<p><a class="path-go" href="' + root + 'learn/paths.html#ir-week-' + w + '">Open this week</a></p>';
    } else if (w <= IR.length + PM.length) {
      var pw = w - IR.length;
      html = '<p class="path-week-label">De Facto PM Path · Week ' + pw + ' of ' + PM.length + '</p><h3>' + esc(PM[pw - 1]) + '</h3>' +
        '<p><a class="path-go" href="' + root + 'learn/paths.html#pm-week-' + pw + '">Open this week</a></p>';
    } else {
      html = '<p class="path-week-label">Both paths complete</p><h3>Now teach it</h3><p>Coach one SRE or NOC lead through Week 1. Teaching is how it sticks.</p>' +
        '<p><a class="path-go" href="' + root + 'learn/paths.html">Revisit the paths</a></p>';
    }
    pathBox.innerHTML = html;
  }

  /* ---------- Paths page: pick a start date; highlight the current week ---------- */
  var startBox = document.querySelector("[data-path-start]");
  if (startBox) {
    var cur = S.get("path-start", "");
    var form = document.createElement("form");
    form.className = "path-form";
    form.innerHTML = '<label for="path-start-date">I started on</label> <input type="date" id="path-start-date" value="' + esc(cur || "") + '"> ' +
      '<button type="submit" class="copy-btn">Save</button> <button type="button" class="link-btn" data-path-clear>Clear</button> <span class="path-status" role="status"></span>';
    startBox.appendChild(form);
    var status = form.querySelector(".path-status");
    var mark = function () {
      Array.prototype.forEach.call(document.querySelectorAll(".path-week"), function (sec) { sec.classList.remove("is-current"); sec.removeAttribute("aria-current"); });
      var w2 = weekNow(); if (!w2) { status.textContent = ""; return; }
      var id = w2 <= IR.length ? "ir-week-" + w2 : (w2 <= IR.length + PM.length ? "pm-week-" + (w2 - IR.length) : null);
      var sec = id && document.getElementById(id);
      if (sec) { sec.classList.add("is-current"); sec.setAttribute("aria-current", "step"); status.textContent = "You're on " + sec.querySelector(".path-num").textContent + " of the " + (w2 <= IR.length ? "Incident Leader Path." : "De Facto PM Path."); }
      else status.textContent = "Both paths complete.";
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = form.querySelector("input").value;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) { status.textContent = "Pick a date first."; return; }
      S.set("path-start", v); mark();
    });
    form.querySelector("[data-path-clear]").addEventListener("click", function () { try { localStorage.removeItem("srl-path-start"); } catch (e) {} form.querySelector("input").value = ""; mark(); });
    mark();
  }
})();
