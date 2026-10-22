/* Request map: tap a box to see its card. Without JavaScript every card shows, and each box is a plain link to its card.
   Links anywhere on the page to #c-<id> open that card; links to #f-<id> open that feature. */
(function () {
  "use strict";
  var map = document.querySelector("[data-map]");
  if (!map) return;
  var cards = Array.prototype.slice.call(document.querySelectorAll(".map-card"));
  var boxes = Array.prototype.slice.call(map.querySelectorAll(".map-box"));
  var wrap = document.getElementById("map-cards");

  function show(id, focus) {
    var card = document.getElementById(id);
    if (!card || !card.classList.contains("map-card")) return false;
    cards.forEach(function (c) { c.hidden = c !== card; });
    boxes.forEach(function (b) {
      if (b.getAttribute("data-card") === id) b.setAttribute("aria-current", "true");
      else b.removeAttribute("aria-current");
    });
    if (focus) card.focus({ preventScroll: true });
    return true;
  }
  function openFeature(id) {
    var d = id && document.getElementById(id);
    if (d && d.tagName === "DETAILS") { d.open = true; return true; }
    return false;
  }
  function fromHash(scroll) {
    var h = decodeURIComponent(location.hash.slice(1));
    if (show(h, false)) { if (scroll) wrap.scrollIntoView(); return true; }
    if (openFeature(h) && scroll) document.getElementById(h).scrollIntoView();
    return false;
  }

  document.body.classList.add("map-ready");
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#c-"], a[href^="#f-"]');
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    if (id.indexOf("c-") === 0 && show(id, true)) {
      e.preventDefault();
      if (!a.classList.contains("map-box")) wrap.scrollIntoView();
      else { var r = wrap.getBoundingClientRect(); if (r.top > window.innerHeight * 0.7) wrap.scrollIntoView(); }
      if (history.replaceState) history.replaceState(null, "", "#" + id);
    } else if (openFeature(id)) {
      e.preventDefault();
      document.getElementById(id).scrollIntoView();
      if (history.replaceState) history.replaceState(null, "", "#" + id);
    }
  });
  window.addEventListener("hashchange", function () { fromHash(true); });
  if (!fromHash(false)) show(cards[0].id, false);
  window.addEventListener("beforeprint", function () { cards.forEach(function (c) { c.hidden = false; }); });
})();
