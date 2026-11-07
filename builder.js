/* Unreel Jet Boats — custom build wizard.
   To add or change options, edit the STEPS list below. Each step is one screen. */
(function () {
  "use strict";

  function range(a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; }

  // ---------- Options (filler content — edit freely) ----------
  var HULLS = [
    { id: "Jon", blurb: "Flat bottom, wide and stable. The shallowest draft for creeks, backwaters and calm water.", lengths: [10, 12, 14, 16, 18], bottom: "jon",
      bottomWidths: { 10: 36, 12: 36, 14: 48, 16: 54, 18: 60 } },  // bottom (base) width in inches per length
    { id: "Sled", blurb: "Flat bottom with a long, raked bow. The classic river jet for skinny, fast water.", lengths: range(14, 20), bottom: "sled" }
  ];

  // Console position — every boat is a center console jet
  var LAYOUTS = [
    { id: "Front console", blurb: "Console set forward. Opens up a big back deck for fishing, gear and passengers.", pos: 0.64 },
    { id: "Middle console", blurb: "Console in the middle. Balanced ride and walk-around room at both ends.", pos: 0.5 }
  ];

  var COLORS = [
    { id: "Raw aluminum", hex: null },
    { id: "Matte black", hex: "#1e2126" },
    { id: "Navy", hex: "#1b3a6b" },
    { id: "Gunmetal", hex: "#4a5260" },
    { id: "Forest green", hex: "#2f5a3f" },
    { id: "Hunter tan", hex: "#8a7556" }
  ];

  var STEPS = [
    { key: "hull", title: "Hull style", type: "hull", required: true,
      intro: "Start with the hull. It decides how the boat rides and how shallow it can run." },
    { key: "length", title: "Length", type: "length", required: true,
      intro: "Pick a length. Only the lengths built on your hull style are shown, with the bottom width where it changes by length." },
    { key: "pods", title: "Float pods", type: "single",
      intro: "Float pods extend the hull past the transom on both sides of the motor. They add lift at the stern and help the boat get up and run shallow.",
      options: function () {
        return [
          { id: "Float pods", blurb: "Pods out the back on both sides of the motor. More stern lift, more stability at rest." },
          { id: "No float pods", blurb: "Hull ends at the transom. Simpler and lighter." }
        ];
      } },
    { key: "layout", title: "Layout", type: "single",
      intro: "Where do you want the center console?",
      options: function (s) {
        return LAYOUTS;
      } },
    { key: "seating", title: "Seating", type: "multi",
      intro: "Pick any you want. Skip it if you're not sure yet.",
      options: function () {
        return ["Stern jump seats", "Pedestal seats", "Flip-down console front seat"].map(function (x) { return { id: x }; });
      } },
    { key: "storage", title: "Storage", type: "multi",
      intro: "Pick the storage you want. Skip it if you're not sure yet.",
      options: function () {
        return ["Dry storage hatches", "Rod lockers", "Under-console storage", "Livewell", "Cockpit mounted Yeti"].map(function (x) { return { id: x }; });
      } },
    { key: "finish", title: "Finish", type: "finish",
      intro: "Choose a hull color and what goes on the floor." },
    { key: "extras", title: "Extras", type: "multi",
      intro: "Add-ons and accessories. Anything not listed, add it in your notes at the end.",
      options: function () {
        return ["Navigation lights", "LED deck lights", "Spotlight", "Rod holders", "Bow anchor roller",
                "Fish finder / GPS", "Stereo", "Bimini top", "Trolling motor mount", "Trailer"].map(function (x) { return { id: x }; });
      } },
    { key: "review", title: "Review & send", type: "review",
      intro: "Check your picks, add your details, and send it over. We'll get back to you to talk it through." }
  ];

  var FLOORS = ["EVA foam marine floor", "Grip particles"];

  // ---------- State ----------
  var state = { hull: null, length: null, pods: null, layout: null, seating: [], storage: [], color: "Raw aluminum", floor: null, extras: [] };
  var current = 0;

  var $ = function (id) { return document.getElementById(id); };
  var panel = $("panel"), stepper = $("stepper"), back = $("back"), next = $("next"),
      send = $("send"), contact = $("contact-block"), err = $("step-error");

  // "14 ft" plus the bottom width when the hull lists one, e.g. "14 ft · 48\" bottom"
  function lengthLabel(n) {
    if (!n) return "";
    var h = state.hull && hullById(state.hull), b = h && h.bottomWidths && h.bottomWidths[n];
    return n + " ft" + (b ? " \u00b7 " + b + "\" bottom" : "");
  }
  function bottomRange(h) {
    if (!h.bottomWidths) return "";
    var w = h.lengths.map(function (n) { return h.bottomWidths[n]; }).filter(Boolean);
    return " \u00b7 " + Math.min.apply(null, w) + "\u2013" + Math.max.apply(null, w) + "&quot; bottom";
  }
  function hullById(id) { return HULLS.filter(function (h) { return h.id === id; })[0]; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // ---------- Cross-section icons for hull cards ----------
  // End view (looking at the transom): flared sides, gunwale caps, motor behind.
  function section(bottom) {
    var hull = bottom === "sled"
      ? "M16.2 12 L30.4 44 Q32.2 48 36 48 L84 48 Q87.8 48 89.6 44 L103.8 12 Z"
      : "M15.8 14 L30 46 L90 46 L104.2 14 Z";
    var topY = bottom === "sled" ? 12 : 14;
    return '<svg class="xsec" viewBox="0 0 120 60" aria-hidden="true">' +
      '<rect width="120" height="60" fill="url(#g-sky)"/>' +
      '<path d="M53 ' + (topY - 12) + ' h14 q3 0 3 3 v16 h-20 v-16 q0 -3 3 -3 Z" fill="url(#g-motor)"/>' +
      '<path d="' + hull + '" fill="url(#g-brushed)"/><path d="' + hull + '" fill="url(#g-hull-shade)"/>' +
      '<path d="M' + (bottom === "sled" ? "14 11 L19 11" : "13.6 13 L18.6 13") + '" stroke="#e7e9eb" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M' + (bottom === "sled" ? "101 11 L106 11" : "101.4 13 L106.4 13") + '" stroke="#e7e9eb" stroke-width="2.4" stroke-linecap="round"/>' +
      '<rect x="0" y="38" width="120" height="22" fill="url(#g-water)"/>' +
      '<line x1="0" y1="38" x2="120" y2="38" stroke="#7fb2c4" stroke-opacity=".5" stroke-width=".8"/></svg>';
  }

  // Side view: the same hull, motor and rail as the big preview, at card size.
  function profile(bottom) {
    var x0 = 34, x1 = 154, top = 23, bot = 45;
    var d = hullPath(bottom, x0, x1, top, bot, true);
    return '<svg class="xsec xprof" viewBox="0 0 160 60" aria-hidden="true">' +
      '<rect width="160" height="60" fill="url(#g-sky)"/>' +
      motorSVG(x0, top, bot, 0.42) +
      '<path d="' + d + '" fill="url(#g-brushed)"/><path d="' + d + '" fill="url(#g-hull-shade)"/>' +
      '<path d="M' + x0 + " " + (top + 1) + " L" + (x1 - 4) + " " + (top - 1) + '" stroke="#e7e9eb" stroke-width="1.6"/>' +
      '<rect x="0" y="40" width="160" height="20" fill="url(#g-water)"/>' +
      '<line x1="0" y1="40" x2="160" y2="40" stroke="#7fb2c4" stroke-opacity=".5" stroke-width=".8"/></svg>';
  }

  function hullViews(bottom) {
    return '<span class="views"><span class="view">' + section(bottom) + '<span class="view-l">End</span></span>' +
      '<span class="view">' + profile(bottom) + '<span class="view-l">Side</span></span></span>';
  }


  // ---------- Shared SVG paint (gradients/patterns used by every boat drawing) ----------
  (function () {
    if (document.getElementById("boat-defs")) return;
    var d = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    d.setAttribute("id", "boat-defs"); d.setAttribute("aria-hidden", "true");
    d.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden");
    d.innerHTML =
      '<defs>' +
      // light from above: bright gunwale, darker toward the chine
      '<linearGradient id="g-hull-shade" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".12" stop-color="#fff" stop-opacity=".10"/>' +
        '<stop offset=".55" stop-color="#000" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>' +
      // brushed aluminum streaks
      '<pattern id="g-brushed" width="320" height="8" patternUnits="userSpaceOnUse">' +
        '<rect width="320" height="8" fill="#b4b9bd"/>' +
        '<path d="M0 1.5h140M180 1.5h100M30 4.5h170M240 4.5h60M0 7h80M120 7h160" stroke="#c3c7ca" stroke-width=".6"/>' +
        '<path d="M60 3h110M220 3h90M10 6h50M150 6h90" stroke="#a5aaae" stroke-width=".5"/></pattern>' +
      '<linearGradient id="g-motor" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#2c3036"/><stop offset=".35" stop-color="#16181b"/><stop offset="1" stop-color="#050506"/></linearGradient>' +
      '<linearGradient id="g-motor-top" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="g-console" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#2b2f35"/><stop offset="1" stop-color="#121418"/></linearGradient>' +
      '<linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#173544"/><stop offset="1" stop-color="#0e242f"/></linearGradient>' +
      '<linearGradient id="g-water" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#14323f" stop-opacity=".82"/><stop offset="1" stop-color="#06131a" stop-opacity=".96"/></linearGradient>' +
      '<linearGradient id="g-seat" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#5a5f66"/><stop offset="1" stop-color="#1d2024"/></linearGradient>' +
      '<filter id="g-blur" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.6"/></filter>' +
      '</defs>';
    document.body.appendChild(d);
  })();

  // Hull paint for a chosen colour: brushed metal for raw aluminum, flat paint otherwise.
  function hullPaint(hex) { return hex ? hex : "url(#g-brushed)"; }

  // Side-profile hull, traced from the Unreel general arrangement drawing.
  // xT = transom, x1 = bow tip, top = deck/sheer, bot = flat bottom. u runs 0 (transom) to 1 (bow), v runs 0 (sheer) to 1 (bottom).
  function hullPath(type, xT, x1, top, bot, pods) {
    var Lh = x1 - xT, H = bot - top;
    function P(u, v) { return (xT + u * Lh).toFixed(1) + " " + (top + v * H).toFixed(1); }
    var stern, bow;
    if (pods) {
      // pods run ~7.5% of hull length past the transom: raked aft face, big round-over into the deck
      stern = "M" + P(-0.051, 1) + " L" + P(-0.075, 0.35) + " Q" + P(-0.072, 0) + " " + P(0.012, 0);
    } else {
      // plain transom laid back 13 degrees (top aft)
      stern = "M" + (xT + H * 0.23).toFixed(1) + " " + bot + " L" + P(0, 0);
    }
    if (type === "sled") {
      bow = " L" + P(0.84, 0) + " L" + P(1, -0.30) + " C" + P(0.92, 0.32) + " " + P(0.80, 1) + " " + P(0.62, 1);
    } else {
      // level sheer, short bow deck, long sweeping curve down into the flat bottom
      bow = " L" + P(0.965, 0) + " Q" + P(0.99, 0) + " " + P(1, 0.05) + " C" + P(0.935, 0.45) + " " + P(0.83, 1) + " " + P(0.65, 1);
    }
    return stern + bow + " Z";
  }

  // Outboard jet on the transom: cowling, midsection and jet intake foot.
  function motorSVG(xT, top, bot, s) {
    s = s || 1;
    var w = 36 * s, cx = xT - 16 * s, ct = top - 42 * s;
    var cowl = "M" + (cx - w / 2) + " " + (ct + 8 * s) + " Q" + (cx - w / 2) + " " + ct + " " + (cx - w / 2 + 8 * s) + " " + ct +
      " L" + (cx + w / 2 - 4 * s) + " " + ct + " Q" + (cx + w / 2) + " " + ct + " " + (cx + w / 2) + " " + (ct + 6 * s) +
      " L" + (cx + w / 2) + " " + (ct + 30 * s) + " Q" + (cx + w / 2) + " " + (ct + 36 * s) + " " + (cx + w / 2 - 6 * s) + " " + (ct + 36 * s) +
      " L" + (cx - w / 2 + 4 * s) + " " + (ct + 36 * s) + " Q" + (cx - w / 2) + " " + (ct + 36 * s) + " " + (cx - w / 2) + " " + (ct + 30 * s) + " Z";
    var mid = "M" + (cx - 11 * s) + " " + (ct + 36 * s) + " L" + (cx + 13 * s) + " " + (ct + 36 * s) + " L" + (cx + 9 * s) + " " + (bot - 4 * s) +
      " L" + (cx - 8 * s) + " " + (bot - 4 * s) + " Z";
    var foot = "M" + (cx - 12 * s) + " " + (bot - 6 * s) + " L" + (cx + 10 * s) + " " + (bot - 6 * s) + " L" + (cx + 12 * s) + " " + (bot + 6 * s) +
      " L" + (cx - 14 * s) + " " + (bot + 6 * s) + " Z";
    return '<g class="motor-g">' +
      '<path d="' + mid + '" fill="url(#g-motor)"/>' +
      '<path d="' + foot + '" fill="#2a2e33" stroke="#0b0c0e" stroke-width="' + (0.8 * s) + '"/>' +
      '<rect x="' + (cx + 6 * s) + '" y="' + (top - 6 * s) + '" width="' + (8 * s) + '" height="' + (14 * s) + '" fill="#3a3f45"/>' +
      '<path d="' + cowl + '" fill="url(#g-motor)"/><path d="' + cowl + '" fill="url(#g-motor-top)"/>' +
      '<path d="M' + (cx - w / 2 + 3 * s) + " " + (ct + 22 * s) + " H" + (cx + w / 2 - 3 * s) + '" stroke="#5b6168" stroke-width="' + (0.8 * s) + '"/>' +
      '</g>';
  }

  // ---------- Step rendering ----------
  function renderStepper() {
    stepper.innerHTML = STEPS.map(function (s, i) {
      var cls = i === current ? "is-current" : (i < current ? "is-done" : "");
      var reachable = i <= furthestReachable();
      return '<li class="' + cls + '"><button type="button" data-step="' + i + '"' + (reachable ? "" : " disabled") +
        (i === current ? ' aria-current="step"' : "") + '><span class="n">' + (i + 1) + '</span><span class="t">' + esc(s.title) + "</span></button></li>";
    }).join("");
  }

  function furthestReachable() {
    if (!state.hull) return 0;
    if (!state.length) return 1;
    return STEPS.length - 1;
  }

  function choiceButton(o, selected, multi, extra) {
    return '<button type="button" class="opt' + (selected ? " is-on" : "") + '" data-val="' + esc(o.id) + '" aria-pressed="' + selected + '">' +
      (extra || "") + '<span class="opt-name">' + esc(o.id) + "</span>" +
      (o.blurb ? '<span class="opt-blurb">' + esc(o.blurb) + "</span>" : "") +
      (multi ? '<span class="tick" aria-hidden="true"></span>' : "") + "</button>";
  }

  function renderPanel() {
    var s = STEPS[current], html = '<h2 class="step-title">' + esc(s.title) + '</h2><p class="muted step-intro">' + esc(s.intro) + "</p>";
    err.hidden = true;

    if (s.type === "hull") {
      html += '<div class="opts opts-cards">' + HULLS.map(function (h) {
        return choiceButton(h, state.hull === h.id, false, hullViews(h.bottom)).replace('<span class="opt-blurb">',
          '<span class="opt-meta">' + h.lengths[0] + "–" + h.lengths[h.lengths.length - 1] + ' ft' + bottomRange(h) + '</span><span class="opt-blurb">');
      }).join("") + "</div>";
    } else if (s.type === "length") {
      var h = hullById(state.hull);
      html += '<div class="opts opts-chips">' + h.lengths.map(function (n) {
        var bw = h.bottomWidths && h.bottomWidths[n];
        return '<button type="button" class="chip' + (bw ? " chip-2" : "") + (state.length === n ? " is-on" : "") + '" data-val="' + n + '" aria-pressed="' + (state.length === n) + '">' + n + " ft" +
          (bw ? '<span class="chip-sub">' + bw + '&quot; bottom</span>' : "") + "</button>";
      }).join("") + "</div>";
    } else if (s.type === "single" || s.type === "multi") {
      var opts = s.options(state), multi = s.type === "multi";
      html += '<div class="opts ' + (multi ? "opts-multi" : "opts-list") + '">' + opts.map(function (o) {
        var on = multi ? state[s.key].indexOf(o.id) > -1 : state[s.key] === o.id;
        return choiceButton(o, on, multi);
      }).join("") + "</div>";
    } else if (s.type === "finish") {
      html += '<h3 class="sub">Hull color</h3><div class="opts opts-swatches">' + COLORS.map(function (c) {
        var on = state.color === c.id;
        return '<button type="button" class="swatch' + (on ? " is-on" : "") + '" data-group="color" data-val="' + esc(c.id) + '" aria-pressed="' + on + '">' +
          '<span class="dot" style="background:' + (c.hex || "var(--metal)") + '"></span>' + esc(c.id) + "</button>";
      }).join("") + "</div>";
      html += '<h3 class="sub">Floor</h3><div class="opts opts-chips">' + FLOORS.map(function (f) {
        var on = state.floor === f;
        return '<button type="button" class="chip' + (on ? " is-on" : "") + '" data-group="floor" data-val="' + esc(f) + '" aria-pressed="' + on + '">' + esc(f) + "</button>";
      }).join("") + "</div>";
    } else if (s.type === "review") {
      html += '<dl class="review">' + STEPS.slice(0, -1).map(function (st, i) {
        return "<div><dt>" + esc(st.title) + "</dt><dd>" + esc(valueFor(st.key) || "Not chosen") +
          ' <button type="button" class="edit" data-step="' + i + '">Edit</button></dd></div>';
      }).join("") + "</dl>";
    }

    panel.innerHTML = html;
    var review = s.type === "review";
    contact.hidden = !review;
    send.hidden = !review;
    next.hidden = review;
    back.hidden = current === 0;
    next.textContent = current === STEPS.length - 2 ? "Review" : "Next";
  }

  function valueFor(key) {
    if (key === "length") return lengthLabel(state.length);
    if (key === "finish") return [state.color, state.floor].filter(Boolean).join(", ");
    var v = state[key];
    return Array.isArray(v) ? v.join(", ") : (v || "");
  }

  // ---------- Boat drawing ----------
  function drawBoat() {
    var len = state.length || (state.hull ? hullById(state.hull).lengths[Math.floor(hullById(state.hull).lengths.length / 2)] : 16);
    var L = 230 + (len - 10) / 14 * 300;                       // hull length, transom to bow
    var pods = state.pods !== "No float pods";                   // show pods until they pick "No"
    var total = L * (pods ? 1.075 : 1), x0 = 340 - total / 2 + 14 + (pods ? L * 0.075 : 0), x1 = x0 + L;  // x0 = transom
    var top = 118, bot = 170, wl = 162, type = state.hull ? hullById(state.hull).bottom : "jon";
    var color = COLORS.filter(function (c) { return c.id === state.color; })[0];
    var paint = hullPaint(color && color.hex);
    var d = hullPath(type, x0, x1, top, bot, pods);
    var g = "";

    // sky + distant treeline
    g += '<rect width="660" height="250" fill="url(#g-sky)"/>';
    g += '<path d="M0 154 C120 146 220 152 330 149 S540 146 660 152 V' + wl + ' H0 Z" fill="#0a1a21"/>';

    // reflection (mirrored about the waterline, blurred, faint)
    var refl = '<g transform="translate(0 ' + (2 * wl) + ') scale(1 -1)" opacity=".22" filter="url(#g-blur)">' +
      '<path d="' + d + '" fill="' + paint + '"/>' + motorSVG(x0, top, bot, 1) + '</g>';

    // motor sits behind the transom
    g += motorSVG(x0, top, bot, 1);

    // hull: paint, light-from-above shading, outline
    g += '<path d="' + d + '" fill="' + paint + '"/>';
    g += '<path d="' + d + '" fill="url(#g-hull-shade)"/>';
    g += '<path d="' + d + '" fill="none" stroke="#050607" stroke-opacity=".55" stroke-width="1.2"/>';
    // welded side seams
    for (var i = 1; i < 6; i++) {
      var sx = x0 + L * (0.04 + i * 0.12);
      g += '<line x1="' + sx + '" y1="' + (top + 6) + '" x2="' + sx + '" y2="' + (bot - 4) + '" stroke="#000" stroke-opacity=".12" stroke-width="1"/>';
    }
    // chine line
    var sternX = pods ? x0 - L * 0.06 : x0 + 8;
    g += '<path d="M' + sternX + " " + (bot - 6) + " L" + (x1 - L * 0.37) + " " + (bot - 6) + '" stroke="#000" stroke-opacity=".28" stroke-width="1.2"/>';
    if (pods) g += '<line x1="' + x0 + '" y1="' + (top + 3) + '" x2="' + (x0 + 6) + '" y2="' + (bot - 2) + '" stroke="#000" stroke-opacity=".3" stroke-width="1.2"/>';
    // rub rail along the gunwale
    var bowRail = type === "sled" ? (x1 - L * 0.16) : (x1 - L * 0.04), railStart = pods ? x0 + 1 : x0 + 2;
    g += '<path d="M' + railStart + " " + (top + 1.5) + " L" + bowRail + " " + (top + 1.5) + '" stroke="#d9dde0" stroke-width="3.4" stroke-linecap="round"/>';
    g += '<path d="M' + railStart + " " + (top + 3.5) + " L" + bowRail + " " + (top + 3.5) + '" stroke="#000" stroke-opacity=".35" stroke-width="1"/>';
    // bow deck (20" deck welded to angle)
    if (type !== "sled") g += '<path d="M' + (x1 - L * 0.07) + " " + (top - 1) + " L" + (x1 + 1) + " " + (top + 1) + '" stroke="#6b5a45" stroke-width="2.4" stroke-linecap="round"/>';
    // bow eye / anchor roller
    var tipY = type === "sled" ? top - 0.30 * (bot - top) : top;
    g += '<path d="M' + (x1 - 8) + " " + (tipY - 3) + " l10 -6 l4 4" + '" stroke="#c9ced2" stroke-width="2" fill="none"/>';

    // seating
    var deckY = function () { return top; };
    function pedestal(px) {
      var py = top;
      return '<rect x="' + (px - 1.5) + '" y="' + (py - 30) + '" width="3" height="30" fill="#b9bec2"/>' +
        '<path d="M' + (px - 13) + " " + (py - 32) + " h22 q3 0 3 3 v3 h-26 v-3 q0 -3 1 -3 Z" + '" fill="url(#g-seat)"/>' +
        '<path d="M' + (px - 13) + " " + (py - 32) + " l-4 -16 q0 -3 3 -3 h4 l3 19 Z" + '" fill="url(#g-seat)"/>';
    }
    if (state.seating.indexOf("Pedestal seats") > -1) {
      g += pedestal(x1 - L * 0.18);   // front deck
      g += pedestal(x0 + L * 0.17);   // back deck
    }
    // stern jump seats fold flush into the deck, so they don't change the side view

    // center console with grab rail and wheel
    var lay = LAYOUTS.filter(function (o) { return o.id === state.layout; })[0];
    if (lay) {
      var cx = x0 + L * lay.pos, cy = deckY();
      var con = "M" + (cx - 18) + " " + cy + " L" + (cx - 18) + " " + (cy - 34) + " L" + (cx + 6) + " " + (cy - 40) +
        " L" + (cx + 18) + " " + (cy - 30) + " L" + (cx + 18) + " " + cy + " Z";
      g += '<path d="M' + (cx - 16) + " " + (cy - 30) + " L" + (cx - 16) + " " + (cy - 62) + " Q" + (cx - 16) + " " + (cy - 70) + " " + (cx - 8) + " " + (cy - 70) +
        " L" + (cx + 10) + " " + (cy - 70) + " Q" + (cx + 18) + " " + (cy - 70) + " " + (cx + 18) + " " + (cy - 62) + " L" + (cx + 18) + " " + (cy - 34) +
        '" fill="none" stroke="#141619" stroke-width="3.2" stroke-linecap="round"/>';
      g += '<path d="' + con + '" fill="url(#g-console)" stroke="#050607" stroke-width="1"/>';
      g += '<path d="M' + (cx - 18) + " " + (cy - 34) + " L" + (cx + 6) + " " + (cy - 40) + '" stroke="#5e646b" stroke-width="1.2"/>';
      g += '<line x1="' + (cx - 6) + '" y1="' + (cy - 37) + '" x2="' + (cx - 14) + '" y2="' + (cy - 48) + '" stroke="#9aa0a6" stroke-width="2"/>' +
        '<ellipse cx="' + (cx - 15) + '" cy="' + (cy - 49) + '" rx="3" ry="9" fill="none" stroke="#d3d7da" stroke-width="2" transform="rotate(-30 ' + (cx - 15) + " " + (cy - 49) + ')"/>';
      if (state.seating.indexOf("Flip-down console front seat") > -1) {
        g += '<path d="M' + (cx + 18) + " " + (cy - 12) + " h12 q2 0 2 2 v3 h-14 Z" + '" fill="url(#g-seat)"/>' +
          '<path d="M' + (cx + 18) + " " + (cy - 12) + " v-14 h3 v14 Z" + '" fill="url(#g-seat)"/>';
      }
    }

    // water over the submerged part, ripples, reflection
    g += '<rect x="0" y="' + wl + '" width="660" height="' + (250 - wl) + '" fill="url(#g-water)"/>';
    g += refl;
    g += '<path d="M' + (x0 - 40) + " " + (wl + 1) + " H" + (x1 + 10) + '" stroke="#9fd0e0" stroke-opacity=".45" stroke-width="1"/>';
    for (var r = 0; r < 7; r++) {
      var ry = wl + 10 + r * 9, rx = 30 + (r * 97) % 420;
      g += '<path d="M' + rx + " " + ry + " h" + (60 + (r * 37) % 90) + '" stroke="#7fb2c4" stroke-opacity="' + (0.22 - r * 0.02) + '" stroke-width="1"/>';
    }

    // dimension
    g += '<line class="dim" x1="' + x0 + '" y1="226" x2="' + x1 + '" y2="226"/><line class="dim" x1="' + x0 + '" y1="220" x2="' + x0 + '" y2="232"/><line class="dim" x1="' + x1 + '" y1="220" x2="' + x1 + '" y2="232"/>';
    g += '<text x="' + ((x0 + x1) / 2) + '" y="246" text-anchor="middle">' + (state.length ? lengthLabel(state.length).toUpperCase() : "LENGTH") + "</text>";
    $("boat").innerHTML = g;

    $("summary").innerHTML = [["Hull", state.hull], ["Length", lengthLabel(state.length)], ["Pods", state.pods ? (state.pods === "Float pods" ? "Yes" : "No") : ""], ["Layout", state.layout]]
      .map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + esc(r[1] || "—") + "</dd></div>"; }).join("");
  }

  // ---------- Hidden form fields ----------
  function syncForm() {
    $("f-hull").value = state.hull || "";
    $("f-length").value = lengthLabel(state.length);
    $("f-layout").value = state.layout || "";
    $("f-pods").value = state.pods || "";
    $("f-seating").value = state.seating.join(", ");
    $("f-storage").value = state.storage.join(", ");
    $("f-color").value = state.color || "";
    $("f-floor").value = state.floor || "";
    $("f-extras").value = state.extras.join(", ");
  }

  function render() { renderStepper(); renderPanel(); drawBoat(); syncForm(); }

  // ---------- Events ----------
  panel.addEventListener("click", function (e) {
    var edit = e.target.closest(".edit");
    if (edit) { go(+edit.dataset.step); return; }
    var b = e.target.closest("[data-val]");
    if (!b) return;
    var s = STEPS[current], v = b.dataset.val;
    if (s.type === "hull") {
      state.hull = v;
      if (state.length && hullById(v).lengths.indexOf(state.length) < 0) state.length = null;
    } else if (s.type === "length") {
      state.length = +v;
      var ok = STEPS.filter(function (x) { return x.key === "layout"; })[0].options(state).map(function (o) { return o.id; });
      if (state.layout && ok.indexOf(state.layout) < 0) state.layout = null;
    } else if (s.type === "single") {
      state[s.key] = state[s.key] === v ? null : v;
    } else if (s.type === "multi") {
      var arr = state[s.key], i = arr.indexOf(v);
      if (i > -1) arr.splice(i, 1); else arr.push(v);
    } else if (s.type === "finish") {
      state[b.dataset.group] = v;
    }
    render();
  });

  stepper.addEventListener("click", function (e) {
    var b = e.target.closest("[data-step]");
    if (b && !b.disabled) go(+b.dataset.step);
  });

  function go(i) {
    current = Math.max(0, Math.min(i, STEPS.length - 1));
    render();
    var top = document.getElementById("builder-top");
    if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  next.addEventListener("click", function () {
    var s = STEPS[current];
    if (s.required && !state[s.key]) {
      err.textContent = s.key === "hull" ? "Pick a hull style to continue." : "Pick a length to continue.";
      err.hidden = false;
      return;
    }
    go(current + 1);
  });
  back.addEventListener("click", function () { go(current - 1); });

  render();
})();
