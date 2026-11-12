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
    { id: "Front console", blurb: "Console set forward. Opens up a big back deck for fishing, gear and passengers.", pos: 0.64 },   // forward base on the front deck, aft edge (drawing sheet 12)
    { id: "Middle console", blurb: "Console in the middle. Balanced ride and walk-around room at both ends.", pos: 0.5 }
  ];

  var COLORS = [
    { id: "Raw aluminum", hex: null },
    { id: "Matte black", hex: "#1e2126" },
    { id: "Navy", hex: "#1b3a6b" },
    { id: "Gunmetal", hex: "#4a5260" },
    { id: "Forest green", hex: "#2f5a3f" },
    { id: "Hunter tan", hex: "#8a7556" },
    // their own paint: the code goes to the shop, the picked colour is only for the preview
    { id: "Custom paint code", hex: "#6b7480", custom: true }
  ];
  function customColor() { return COLORS.filter(function (c) { return c.custom; })[0]; }
  function colorLabel() {
    if (state.color !== "Custom paint code") return state.color || "";
    return "Custom paint code: " + (state.paintCode ? state.paintCode : "(no code entered)") + " (preview " + customColor().hex + ")";
  }

  var ALL_STEPS = [
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
        return ["Stern jump seats", "Pedestal seats"].concat(hasConsole() ? ["Flip-down console front seat"] : []).map(function (x) { return { id: x }; });
      } },
    { key: "storage", title: "Storage", type: "multi",
      intro: "Pick the storage you want. Skip it if you're not sure yet.",
      options: function () {
        return ["Dry storage hatches", "Rod lockers", "Under-console storage", "Livewell", "Cockpit mounted Yeti"].map(function (x) { return { id: x }; });
      } },
    { key: "color", title: "Hull colour", type: "finish",
      intro: "Choose a hull colour." },
    { key: "floor", title: "Flooring", type: "single",
      intro: "Choose what covers the decks and cockpit floor. The top view shows the layout.",
      options: function () { return FLOORS; } },
    { key: "extras", title: "Extras", type: "multi",
      intro: "Add-ons and accessories. Anything not listed, add it in your notes at the end.",
      options: function () {
        return ["Navigation lights", "LED deck lights", "Spotlight", "Rod holders", "Bow anchor roller",
                "Fish finder / GPS", "Stereo", "Bimini top", "Trolling motor mount", "Trailer"].map(function (x) { return { id: x }; });
      } },
    { key: "review", title: "Review & send", type: "review",
      intro: "Check your picks, add your details, and send it over. We'll get back to you to talk it through." }
  ];

  // Float pods are part of the Jon build only; the sled is a separate design.
  var STEPS = ALL_STEPS;
  // 10, 12 and 14 ft Jons: front and back deck with one hatch each, open floor, no console.
  function smallJon() { return state.hull === "Jon" && !!state.length && state.length < 16; }
  function hasConsole() { return !smallJon(); }
  function sockets() { return smallJon() ? [0.172, 0.71] : [0.15, 0.758]; }   // pedestal sockets, u from the transom

  function syncSteps() {
    STEPS = ALL_STEPS.filter(function (st) {
      if (st.key === "pods" && state.hull === "Sled") return false;
      if (st.key === "layout" && !hasConsole()) return false;
      return true;
    });
    if (current > STEPS.length - 1) current = STEPS.length - 1;
  }

  var FLOORS = [
    { id: "EVA foam marine floor", blurb: "Closed-cell EVA foam cut to your deck layout, with grooved borders around every hatch. Soft and quiet underfoot, non-skid wet or dry." },
    { id: "Grip particles", blurb: "A hard-wearing grip particle non-skid coating on the decks and floor. Tough and easy to hose out." }
  ];

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
    var d = bottom === "sled" ? hullPathSled("sled", x0, x1, top, bot) : hullPath(bottom, x0, x1, top, bot, false);
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
      '<pattern id="g-grip" width="7" height="7" patternUnits="userSpaceOnUse">' +
        '<rect width="7" height="7" fill="#55595e"/><circle cx="1.2" cy="1.5" r=".55" fill="#7c8187"/><circle cx="4.6" cy="2.8" r=".45" fill="#3b3e42"/>' +
        '<circle cx="2.8" cy="5.4" r=".5" fill="#80858b"/><circle cx="6" cy="6" r=".4" fill="#3b3e42"/><circle cx="5.6" cy=".6" r=".35" fill="#8a8f95"/></pattern>' +
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
      // transom raked 15 degrees: top aft, bottom forward
      stern = "M" + (xT + H * Math.tan(15 * Math.PI / 180)).toFixed(1) + " " + bot + " L" + P(0, 0);
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
      html += '<div class="opts opts-swatches">' + COLORS.map(function (c) {
        var on = state.color === c.id;
        return '<button type="button" class="swatch' + (on ? " is-on" : "") + '" data-group="color" data-val="' + esc(c.id) + '" aria-pressed="' + on + '">' +
          '<span class="dot' + (c.custom ? " dot-custom" : "") + '" style="background:' + (c.custom && !on ? "conic-gradient(#b23a2b,#c9a227,#2f5a3f,#1b3a6b,#6b3a7a,#b23a2b)" : (c.hex || "var(--metal)")) + '"></span>' + esc(c.id) + "</button>";
      }).join("") + "</div>";
      if (state.color === "Custom paint code") {
        html += '<div class="paint-custom">' +
          '<div class="field"><label for="paint-code">Paint code</label>' +
          '<span class="hint" id="paint-code-hint">Brand and code, e.g. Sherwin-Williams SW 7069, RAL 7016 or a truck colour code.</span>' +
          '<input id="paint-code" type="text" autocomplete="off" maxlength="80" aria-describedby="paint-code-hint" value="' + esc(state.paintCode || "") + '"></div>' +
          '<div class="field"><label for="paint-hex">Closest colour for the preview</label>' +
          '<span class="hint">Only changes the drawing. We match your exact code at the shop.</span>' +
          '<input id="paint-hex" type="color" value="' + customColor().hex + '"></div>' +
          '</div>';
      }
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
    if (key === "color") return colorLabel();
    var v = state[key];
    return Array.isArray(v) ? v.join(", ") : (v || "");
  }


  // Inches-to-pixels for the side view: hull side height 21-5/8" = (bot - top).
  // Deck tops sit 5" below the sheer; pedestal sockets on the centreline (sheet 10).
  function interiorSide(x0, L, top, bot) {
    var sc = (bot - top) / 21.625, deck = top + 5 * sc, g = "";
    function X(u) { return x0 + u * L; }
    function pedestal(px) {
      var seatY = deck - 21 * sc;
      return '<rect x="' + (px - 1.6) + '" y="' + seatY + '" width="3.2" height="' + (deck - seatY) + '" fill="#b9bec2"/>' +
        '<rect x="' + (px - 6) + '" y="' + (deck - 2) + '" width="12" height="2" fill="#8d9297"/>' +
        '<path d="M' + (px - 10 * sc) + " " + seatY + " h" + (17 * sc) + " q" + (2 * sc) + " 0 " + (2 * sc) + " " + (2 * sc) + " v" + (2.5 * sc) + " h-" + (19 * sc) + " v-" + (2.5 * sc) + " q0 -" + (2 * sc) + " " + (1 * sc) + " -" + (2 * sc) + ' Z" fill="url(#g-seat)"/>' +
        '<path d="M' + (px - 10 * sc) + " " + seatY + " l-" + (2.5 * sc) + " -" + (14 * sc) + " q0 -" + (1.5 * sc) + " " + (1.5 * sc) + " -" + (1.5 * sc) + " h" + (3 * sc) + " l" + (2.5 * sc) + " " + (15.5 * sc) + ' Z" fill="url(#g-seat)"/>';
    }
    if (state.seating.indexOf("Pedestal seats") > -1) {
      g += pedestal(X(sockets()[0]));   // back deck socket
      g += pedestal(X(sockets()[1]));   // front deck socket
    }
    // stern jump seats fold flush into the deck, so they don't change the side view

    var lay = LAYOUTS.filter(function (o) { return o.id === state.layout; })[0];
    if (lay) {
      // Console side profile from sheet 12 (CN-1): 29" tall, 10" on the deck, lower face leaning aft over the cockpit,
      // sloped dash, short ledge, steep upper face, 4" top, front face leaning aft slightly. Coordinates in inches from the forward base.
      var xf = X(lay.pos), C = function (ix, iy) { return (xf + ix * sc).toFixed(1) + " " + (deck - iy * sc).toFixed(1); };
      var con = "M" + C(-10, 0) + " L" + C(-18, 14.9) + " L" + C(-10.4, 21.05) + " L" + C(-7.6, 21.05) + " L" + C(-5.5, 29) +
        " L" + C(-2.1, 29) + " L" + C(0, 0) + " Z";
      var cpaint = hullPaint((COLORS.filter(function (c) { return c.id === state.color; })[0] || {}).hex);
      g += '<path d="' + con + '" fill="' + cpaint + '"/><path d="' + con + '" fill="url(#g-hull-shade)" stroke="#050607" stroke-width="1"/>';
      g += '<path d="M' + C(-18, 14.9) + " L" + C(-10.4, 21.05) + '" stroke="#5e646b" stroke-width="1.4"/>';   // dash top edge
      g += '<path d="M' + C(-7.6, 21.05) + " L" + C(-5.5, 29) + " L" + C(-2.1, 29) + '" stroke="#4a5057" stroke-width="1.1" fill="none"/>';
      // Mercury remote control on the ledge
      g += '<path d="M' + C(-9.4, 21.05) + " l" + (-1.5 * sc) + " " + (-4 * sc) + " h" + (2 * sc) + '" stroke="#1d2024" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
      // steering wheel on the dash, seen nearly edge-on
      var mxi = -14.2, myi = 17.98, ang = Math.atan2(-(21.05 - 14.9), 7.6) * 180 / Math.PI;
      var mx = xf + mxi * sc, my = deck - myi * sc, rad = ang * Math.PI / 180, nx = Math.sin(rad), ny = -Math.cos(rad);
      if (nx > 0) { nx = -nx; ny = -ny; }
      var wx = mx + nx * 3.2 * sc, wy = my + ny * 3.2 * sc;
      g += '<line x1="' + mx + '" y1="' + my + '" x2="' + wx + '" y2="' + wy + '" stroke="#8d939a" stroke-width="2.2"/>';
      g += '<ellipse cx="' + wx + '" cy="' + wy + '" rx="' + (1 * sc) + '" ry="' + (6.5 * sc) + '" fill="none" stroke="#dfe3e6" stroke-width="2.4" transform="rotate(' + (ang + 90) + ' ' + wx + ' ' + wy + ')"/>';
      g += '<circle cx="' + wx + '" cy="' + wy + '" r="2" fill="#aeb4ba"/>';
      // grab bar around the top: up from the ledge, over the top, down the front face
      var bx0 = xf - 9 * sc, bx1 = xf + 0.9 * sc, by = deck - 35 * sc, r = 2.5 * sc;
      g += '<path d="M' + bx0 + " " + (deck - 21.05 * sc) + " L" + bx0 + " " + (by + r) + " Q" + bx0 + " " + by + " " + (bx0 + r) + " " + by +
        " L" + (bx1 - r) + " " + by + " Q" + bx1 + " " + by + " " + bx1 + " " + (by + r) + " L" + bx1 + " " + (deck - 17 * sc) +
        '" fill="none" stroke="#141619" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>';
      if (state.storage.indexOf("Cockpit mounted Yeti") > -1) {
        g += '<rect x="' + (xf + 2 * sc) + '" y="' + (deck - 16 * sc) + '" width="' + (15 * sc) + '" height="' + (16 * sc) + '" rx="' + (1.5 * sc) + '" fill="#d8d8d3" stroke="#8b8b86"/>' +
          '<line x1="' + (xf + 2 * sc) + '" y1="' + (deck - 13.5 * sc) + '" x2="' + (xf + 17 * sc) + '" y2="' + (deck - 13.5 * sc) + '" stroke="#8b8b86"/>';
      }
      if (state.seating.indexOf("Flip-down console front seat") > -1) {
        g += '<path d="M' + C(0, 10) + " h" + (5 * sc) + " q" + (0.8 * sc) + " 0 " + (0.8 * sc) + " " + (0.8 * sc) + " v" + (1.2 * sc) + " h-" + (5.8 * sc) + ' Z" fill="url(#g-seat)"/>' +
          '<path d="M' + C(0, 10) + " v-" + (6 * sc) + " h" + (1.2 * sc) + " v" + (6 * sc) + ' Z" fill="url(#g-seat)"/>';
      }
    }
    return g;
  }

  // ---------- Top view (bird's-eye), lined up with the side view ----------
  // Layout from the deck render and sheets 2 and 10. u = fraction of hull length from the transom, f = fraction of half-beam from the centreline.
  function drawPlan(x0, L, pods) {
    var len = state.length || 16, h = state.hull ? hullById(state.hull) : null;
    var bottomIn = (h && h.bottomWidths && h.bottomWidths[len]) || 54;
    var pxIn = L / (len * 12 * 0.912);              // transom-to-bow is ~91% of the overall length
    var b = (bottomIn + 20) / 2 * pxIn, cy = 118;  // half-beam: beam is ~20" wider than the bottom (80" on the 60" bottom)
    function X(u) { return (x0 + u * L).toFixed(1); }
    function Y(f) { return (cy - f * b).toFixed(1); }
    function outline(k, u0, tip) {
      // side runs straight, then curves in to the bow deck, then straight to the stem
      function side(sg) {
        return " L" + X(0.55) + " " + Y(sg * k) + " C" + X(0.72) + " " + Y(sg * k) + " " + X(0.85) + " " + Y(sg * 0.78 * k) + " " + X(0.906) + " " + Y(sg * 0.65 * k);
      }
      return "M" + X(u0) + " " + Y(k) + side(1) + " L" + X(tip) + " " + cy +
        " L" + X(0.906) + " " + Y(-0.65 * k) + " C" + X(0.85) + " " + Y(-0.78 * k) + " " + X(0.72) + " " + Y(-k) + " " + X(0.55) + " " + Y(-k) +
        " L" + X(u0) + " " + Y(-k) + " Z";
    }
    var floor = state.floor, eva = floor === "EVA foam marine floor", grip = floor === "Grip particles";
    var base = eva ? "#45484c" : grip ? "url(#g-grip)" : "url(#g-brushed)";
    var recess = eva ? "#3b3e42" : grip ? "url(#g-grip)" : "#a9aeb2";
    var groove = eva ? "#141618" : grip ? "#2a2d30" : "#7d8287";
    // everything metal is painted the hull colour (brushed aluminum when raw)
    var colorObj = COLORS.filter(function (c) { return c.id === state.color; })[0];
    var paint = hullPaint(colorObj && colorObj.hex);
    var gap = eva ? 1.3 : 0;   // EVA pads are cut as separate pieces: the painted deck shows in the seams
    function panel(u1, u2, f1, f2, fill, rr) {
      var x = +X(u1) + gap, w = (u2 - u1) * L - 2 * gap, y = +Y(Math.max(f1, f2)) + gap, hgt = Math.abs(f2 - f1) * b - 2 * gap, o = "";
      o += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + hgt.toFixed(1) + '" rx="' + (rr || 2) + '" fill="' + fill + '" stroke="' + groove + '" stroke-width="' + (eva ? 1.4 : 1) + '"/>';
      if (eva) o += '<rect x="' + (+x + 2.2) + '" y="' + (+y + 2.2) + '" width="' + Math.max(0, w - 4.4).toFixed(1) + '" height="' + Math.max(0, hgt - 4.4).toFixed(1) + '" rx="' + Math.max(1, (rr || 2) - 1) + '" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width=".8"/>';
      return o;
    }
    function hatch(u1, u2, f1, f2, holeU, holeF) {
      var x = +X(u1), w = (u2 - u1) * L, y = +Y(Math.max(f1, f2)), hgt = Math.abs(f2 - f1) * b, o = "";
      if (eva) o += '<rect x="' + (x - gap).toFixed(1) + '" y="' + (y - gap).toFixed(1) + '" width="' + (w + 2 * gap).toFixed(1) + '" height="' + (hgt + 2 * gap).toFixed(1) + '" rx="3" fill="' + paint + '"/>';
      o += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + hgt.toFixed(1) + '" rx="3" fill="' + base + '" stroke="' + groove + '" stroke-width="' + (eva ? 1.4 : 2) + '"/>';
      if (eva) {
        o += '<rect x="' + (+x + 2.5) + '" y="' + (+y + 2.5) + '" width="' + (w - 5).toFixed(1) + '" height="' + (hgt - 5).toFixed(1) + '" rx="2" fill="none" stroke="#d5d8db" stroke-width="1.1"/>';
        o += '<rect x="' + (+x + 5) + '" y="' + (+y + 5) + '" width="' + (w - 10).toFixed(1) + '" height="' + (hgt - 10).toFixed(1) + '" rx="1.5" fill="none" stroke="#141618" stroke-width="1"/>';
      }
      o += '<circle cx="' + X(holeU) + '" cy="' + Y(holeF) + '" r="' + Math.max(2.4, b * 0.045).toFixed(1) + '" fill="#d9dcdf" stroke="#141618" stroke-width="1"/>';
      return o;
    }
    var g = '<rect width="660" height="236" fill="#0e242f"/>';
    g += '<text class="view-tag" x="14" y="20">TOP VIEW</text>';

    // float pods out the back, with the motor between them
    if (pods) {
      [1, -1].forEach(function (sg) {
        var yA = Y(sg * 0.97), yB = Y(sg * 0.34), top = Math.min(yA, yB), hh = Math.abs(yA - yB);
        g += '<rect x="' + X(-0.072) + '" y="' + top + '" width="' + (0.08 * L).toFixed(1) + '" height="' + hh.toFixed(1) + '" rx="5" fill="' + paint + '" stroke="#000" stroke-opacity=".35" stroke-width="1"/>';
        if (eva) g += '<rect x="' + (+X(-0.066)) + '" y="' + (top + 3) + '" width="' + (0.062 * L).toFixed(1) + '" height="' + (hh - 6).toFixed(1) + '" rx="3" fill="#45484c" stroke="#141618" stroke-width="1.2"/>';
      });
    }
    g += '<rect x="' + X(-0.07) + '" y="' + Y(0.16) + '" width="' + (0.075 * L).toFixed(1) + '" height="' + (0.32 * b).toFixed(1) + '" rx="6" fill="url(#g-motor)"/>';

    // hull + gunwale
    g += '<path d="' + outline(1.02, 0, 1.006) + '" fill="' + paint + '"/>';
    g += '<path d="' + outline(1, 0, 1) + '" fill="' + paint + '" stroke="#000" stroke-opacity=".35" stroke-width="1"/>';
    g += '<path d="' + outline(1, 0, 1) + '" fill="#fff" fill-opacity=".08"/>';
    g += '<clipPath id="deck-clip"><path d="' + outline(0.93, 0.014, 0.975) + '"/></clipPath>';

    // transom cap with the motor notch
    g += '<rect x="' + X(0) + '" y="' + Y(0.93) + '" width="' + (0.014 * L).toFixed(1) + '" height="' + (1.86 * b).toFixed(1) + '" fill="' + paint + '"/>';
    g += '<rect x="' + X(0) + '" y="' + Y(0.17) + '" width="' + (0.014 * L).toFixed(1) + '" height="' + (0.34 * b).toFixed(1) + '" fill="#000" fill-opacity=".3"/>';

    var d = '<g clip-path="url(#deck-clip)">';
    d += '<rect x="' + X(0) + '" y="' + Y(1) + '" width="' + L + '" height="' + (2 * b) + '" fill="' + (eva ? paint : base) + '"/>';
    var small = smallJon(), deckEnd = small ? 0.22 : 0.25;
    if (small) {
      // back deck with one centre hatch, open floor, front deck with one centre hatch
      d += panel(0.014, deckEnd, 0, 1.2, base) + panel(0.014, deckEnd, -1.2, 0, base);
      d += hatch(0.028, 0.118, -0.55, 0.55, 0.10, 0);
      d += panel(0.228, 0.652, -0.88, 0.88, recess, 6);
      d += panel(0.66, 0.877, 0, 1.2, base) + panel(0.66, 0.877, -1.2, 0, base);
      d += hatch(0.765, 0.865, -0.48, 0.48, 0.85, 0);
    } else {
      // back deck: two panels split on the centreline, two hatches, pedestal socket
      d += panel(0.014, 0.25, 0, 1.2, base) + panel(0.014, 0.25, -1.2, 0, base);
      d += hatch(0.03, 0.143, 0.18, 0.84, 0.12, 0.51) + hatch(0.03, 0.143, -0.84, -0.18, 0.12, -0.51);
      // cockpit: side shelves and the recessed floor
      d += panel(0.25, 0.59, 0.76, 1.2, base) + panel(0.25, 0.59, -1.2, -0.76, base);
      d += panel(0.257, 0.587, 0.78, 0.905, base, 4) + panel(0.257, 0.587, -0.905, -0.78, base, 4);
      d += panel(0.263, 0.582, 0, 0.75, recess, 6) + panel(0.263, 0.582, -0.75, 0, recess, 6);
      // front deck: two panels, two long hatches, pedestal socket
      d += panel(0.59, 0.877, 0, 1.2, base) + panel(0.59, 0.877, -1.2, 0, base);
      d += hatch(0.664, 0.819, 0.28, 0.70, 0.74, 0.57) + hatch(0.664, 0.819, -0.70, -0.28, 0.74, -0.57);
    }
    // riser band and bow deck
    d += '<rect x="' + (+X(0.877) + gap) + '" y="' + Y(1) + '" width="' + (0.03 * L - 2 * gap).toFixed(1) + '" height="' + (2 * b) + '" fill="' + (eva ? "#2e3134" : grip ? "#3a3d41" : "#9ca1a6") + '" stroke="' + groove + '"/>';
    if (eva) {
      // bow deck pad, inset so the painted nose shows around it
      d += '<path d="M' + (+X(0.912) + 2) + " " + (+Y(0.55) + 2.6) + " L" + (+X(0.968) - 3) + " " + cy + " L" + (+X(0.912) + 2) + " " + (+Y(-0.55) - 2.6) + ' Z" fill="#3d4044" stroke="#141618" stroke-width="1.2"/>';
    } else {
      d += '<path d="M' + X(0.912) + " " + Y(0.55) + " L" + X(0.968) + " " + cy + " L" + X(0.912) + " " + Y(-0.55) + ' Z" fill="' + (eva ? "#3d4044" : grip ? "url(#g-grip)" : "#b4b8bc") + '" stroke="' + groove + '" stroke-width="1.6"/>';
    }
    d += '</g>';
    g += d;
    // pedestal sockets on the centreline
    sockets().forEach(function (u) {
      g += '<circle cx="' + X(u) + '" cy="' + cy + '" r="' + Math.max(3, b * 0.06).toFixed(1) + '" fill="' + (eva ? "#3b3e42" : "#9aa0a5") + '" stroke="' + groove + '" stroke-width="1.4"/>';
    });
    // UNREEL on the riser
    g += '<text x="' + X(0.892) + '" y="' + cy + '" transform="rotate(90 ' + X(0.892) + ' ' + cy + ')" text-anchor="middle" dominant-baseline="middle" ' +
      'style="font:italic 900 ' + Math.max(7, b * 0.16).toFixed(1) + 'px Arial, sans-serif;letter-spacing:.04em" fill="' + (eva ? "#121314" : "#4b5056") + '" stroke="#c9cdd0" stroke-width=".35">UNREEL</text>';

    // seats from the top
    if (state.seating.indexOf("Pedestal seats") > -1) {
      sockets().forEach(function (u) {
        var sw = 18 * pxIn, sh = 17 * pxIn;
        g += '<rect x="' + (+X(u) - sw / 2) + '" y="' + (cy - sh / 2) + '" width="' + sw + '" height="' + sh + '" rx="' + (3 * pxIn) + '" fill="url(#g-seat)" stroke="#0b0c0e"/>' +
          '<rect x="' + (+X(u) - sw / 2 - 4 * pxIn) + '" y="' + (cy - sh / 2) + '" width="' + (4 * pxIn) + '" height="' + sh + '" rx="' + (1.5 * pxIn) + '" fill="#2a2d31"/>';
      });
    }

    // stern jump seats: two 15" x 15" squares in the back deck, hinged at its forward edge; they fold down flush
    if (state.seating.indexOf("Stern jump seats") > -1) {
      var halfIn = (bottomIn + 20) / 2, js = 15 * pxIn, uFwd = deckEnd;
      [1, -1].forEach(function (sg) {
        var fIn = 0.25 * halfIn, yA = cy - sg * fIn * pxIn, yB = cy - sg * (fIn + 15) * pxIn, yTop = Math.min(yA, yB), xL = +X(uFwd) - js;
        g += '<rect x="' + xL.toFixed(1) + '" y="' + yTop.toFixed(1) + '" width="' + js.toFixed(1) + '" height="' + js.toFixed(1) + '" rx="1.5" fill="none" stroke="' + groove + '" stroke-width="1.8"/>';
        if (eva) g += '<rect x="' + (xL + 2.2).toFixed(1) + '" y="' + (yTop + 2.2).toFixed(1) + '" width="' + (js - 4.4).toFixed(1) + '" height="' + (js - 4.4).toFixed(1) + '" rx="1" fill="none" stroke="#d5d8db" stroke-opacity=".7" stroke-width=".9"/>';
        g += '<line x1="' + X(uFwd) + '" y1="' + (yTop + 1.5).toFixed(1) + '" x2="' + X(uFwd) + '" y2="' + (yTop + js - 1.5).toFixed(1) + '" stroke="#c9cdd0" stroke-width="2.2"/>';   // hinge on the forward edge
      });
    }

    // console from the top: 24" wide, 18" fore and aft, aft edge of the front deck
    var lay = LAYOUTS.filter(function (o) { return o.id === state.layout; })[0];
    if (lay) {
      var cxf = x0 + lay.pos * L, cw = 18 * pxIn, ch = 24 * pxIn, cx0 = cxf - cw, ctop = cy - ch / 2;
      g += '<rect x="' + (cx0 - 3) + '" y="' + (ctop - 3) + '" width="' + (cw + 6) + '" height="' + (ch + 6) + '" rx="3" fill="#1b1d20"/>';
      g += '<rect x="' + cx0 + '" y="' + ctop + '" width="' + cw + '" height="' + ch + '" fill="' + paint + '"/>';
      g += '<rect x="' + cx0 + '" y="' + ctop + '" width="' + cw + '" height="' + ch + '" fill="#fff" fill-opacity=".1"/>';
      g += '<rect x="' + (cx0 + cw * 0.42) + '" y="' + ctop + '" width="' + (cw * 0.2) + '" height="' + ch + '" fill="#000" fill-opacity=".22"/>';
      g += '<rect x="' + (cx0 + cw * 0.9) + '" y="' + ctop + '" width="' + (cw * 0.1) + '" height="' + ch + '" fill="#000" fill-opacity=".35"/>';
      g += '<rect x="' + (cx0 + cw * 0.12) + '" y="' + (ctop + ch * 0.74) + '" width="' + (cw * 0.22) + '" height="' + (ch * 0.08) + '" fill="#0b0c0e"/>';
      // grab bar loop seen from above
      g += '<rect x="' + (cx0 + cw * 0.25) + '" y="' + (ctop - 2) + '" width="' + (cw * 0.8) + '" height="' + (ch + 4) + '" rx="3" fill="none" stroke="#141619" stroke-width="2.4"/>';
    }

    // cockpit mounted Yeti: 24" across the boat, 15" fore and aft, right in front of the console
    if (state.storage.indexOf("Cockpit mounted Yeti") > -1) {
      var yFore = 15 * pxIn, yAcross = 24 * pxIn;
      var yx = lay ? (x0 + lay.pos * L + 2 * pxIn) : (+X(small ? (0.228 + 0.652) / 2 : (0.263 + 0.582) / 2) - yFore / 2);
      g += '<rect x="' + yx + '" y="' + (cy - yAcross / 2) + '" width="' + yFore + '" height="' + yAcross + '" rx="' + (2 * pxIn) + '" fill="#d8d8d3" stroke="#8b8b86"/>' +
        '<line x1="' + (yx + yFore * 0.3) + '" y1="' + (cy - yAcross / 2) + '" x2="' + (yx + yFore * 0.3) + '" y2="' + (cy + yAcross / 2) + '" stroke="#8b8b86"/>' +
        '<rect x="' + (yx + yFore - 1.5) + '" y="' + (cy - yAcross * 0.12) + '" width="3" height="' + (yAcross * 0.24) + '" fill="#6f6f6a"/>';
    }
    $("plan").innerHTML = g;
  }


  // ---------- Sled: kept exactly as it was before the Jon build drawings (separate design) ----------
  function hullPathSled(type, x0, x1, top, bot) {
    var L = x1 - x0;
    if (type === "sled") {
      // long, straight raked bow that rises above the sheer
      return "M" + x0 + " " + top + " L" + (x1 - L * 0.10) + " " + (top - 3) + " L" + (x1 + 2) + " " + (top - 14) +
        " Q" + (x1 - L * 0.04) + " " + (top + 8) + " " + (x1 - L * 0.30) + " " + bot + " L" + x0 + " " + bot + " Z";
    }
    // jon: level sheer, long gradual arc up into the bow
    return "M" + x0 + " " + top + " L" + (x1 - L * 0.02) + " " + (top - 2) + " Q" + (x1 + 2) + " " + (top - 2) + " " + (x1 + 2) + " " + (top + 2) +
      " Q" + (x1 - L * 0.07) + " " + bot + " " + (x1 - L * 0.34) + " " + bot + " L" + x0 + " " + bot + " Z";
  }
  function drawSled() {
    var len = state.length || (state.hull ? hullById(state.hull).lengths[Math.floor(hullById(state.hull).lengths.length / 2)] : 16);
    var L = 240 + (len - 10) / 14 * 330, x0 = 340 - L / 2 + 16, x1 = x0 + L;
    var top = 118, bot = 172, wl = 164, type = state.hull ? hullById(state.hull).bottom : "jon";
    var color = COLORS.filter(function (c) { return c.id === state.color; })[0];
    var paint = hullPaint(color && color.hex);
    var d = hullPathSled(type, x0, x1, top, bot);
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
      var sx = x0 + L * i / 6.6;
      g += '<line x1="' + sx + '" y1="' + (top + 6) + '" x2="' + sx + '" y2="' + (bot - 4) + '" stroke="#000" stroke-opacity=".12" stroke-width="1"/>';
    }
    // chine line
    g += '<path d="M' + x0 + " " + (bot - 8) + " L" + (x1 - L * 0.36) + " " + (bot - 8) + '" stroke="#000" stroke-opacity=".28" stroke-width="1.2"/>';
    // rub rail along the gunwale
    var bowRail = type === "sled" ? (x1 - L * 0.10) : (x1 - L * 0.02);
    g += '<path d="M' + (x0 - 1) + " " + (top + 2) + " L" + bowRail + " " + (top - 1) + '" stroke="#d9dde0" stroke-width="3.4" stroke-linecap="round"/>';
    g += '<path d="M' + x0 + " " + (top + 4) + " L" + bowRail + " " + (top + 1) + '" stroke="#000" stroke-opacity=".35" stroke-width="1"/>';
    // bow eye / anchor roller
    g += '<path d="M' + (x1 - 6) + " " + (top - 4) + " l10 -6 l4 4" + '" stroke="#c9ced2" stroke-width="2" fill="none"/>';

    // seating
    var deckY = function (x) { return top - 2 * (x - x0) / L; };
    if (state.seating.indexOf("Pedestal seats") > -1) {
      var px = x1 - L * 0.2, py = deckY(px);
      g += '<rect x="' + (px - 1.5) + '" y="' + (py - 30) + '" width="3" height="30" fill="#b9bec2"/>' +
        '<path d="M' + (px - 13) + " " + (py - 32) + " h22 q3 0 3 3 v3 h-26 v-3 q0 -3 1 -3 Z" + '" fill="url(#g-seat)"/>' +
        '<path d="M' + (px - 13) + " " + (py - 32) + " l-4 -16 q0 -3 3 -3 h4 l3 19 Z" + '" fill="url(#g-seat)"/>';
    }
    if (state.seating.indexOf("Stern jump seats") > -1) {
      var jx = x0 + L * 0.07;
      g += '<path d="M' + jx + " " + (top - 1) + " v-10 q0 -2 2 -2 h20 q2 0 2 2 v10 Z" + '" fill="url(#g-seat)"/>' +
        '<path d="M' + (jx + 2) + " " + (top - 12) + " l-2 -12 q0 -2 2 -2 h4 l2 14 Z" + '" fill="url(#g-seat)"/>';
    }

    // center console with grab rail and wheel
    var lay = LAYOUTS.filter(function (o) { return o.id === state.layout; })[0];
    if (lay) {
      var cx = x0 + L * lay.pos, cy = deckY(cx);
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
  }

  // ---------- Boat drawing ----------
  function drawBoat() {
    var isSled = state.hull === "Sled";
    $("plan-stage").hidden = isSled;
    if (isSled) { drawSled(); drawSummary(); return; }
    var len = state.length || (state.hull ? hullById(state.hull).lengths[Math.floor(hullById(state.hull).lengths.length / 2)] : 16);
    var L = 230 + (len - 10) / 14 * 300;                       // hull length, transom to bow
    var pods = state.pods === "Float pods";                     // pods only once they pick them
    var total = L * (pods ? 1.075 : 1), x0 = 340 - total / 2 + 14 + (pods ? L * 0.075 : 0), x1 = x0 + L;  // x0 = transom
    var top = 118, bot = 170, wl = 162, type = state.hull ? hullById(state.hull).bottom : "jon";
    var color = COLORS.filter(function (c) { return c.id === state.color; })[0];
    var paint = hullPaint(color && color.hex);
    var d = hullPath(type, x0, x1, top, bot, pods);
    var g = "";

    // sky + distant treeline
    g += '<rect width="660" height="250" fill="url(#g-sky)"/>';
    g += '<text class="view-tag" x="14" y="20">SIDE VIEW</text>';
    g += '<path d="M0 154 C120 146 220 152 330 149 S540 146 660 152 V' + wl + ' H0 Z" fill="#0a1a21"/>';

    // reflection (mirrored about the waterline, blurred, faint)
    var refl = '<g transform="translate(0 ' + (2 * wl) + ') scale(1 -1)" opacity=".22" filter="url(#g-blur)">' +
      '<path d="' + d + '" fill="' + paint + '"/>' + motorSVG(x0, top, bot, 1) + '</g>';

    // motor sits behind the transom
    g += motorSVG(x0, top, bot, 1);

    // inside the boat (drawn before the hull so the hull side hides what is below the sheer)
    g += interiorSide(x0, L, top, bot);

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
    var sternX = pods ? x0 - L * 0.06 : x0 + 1;
    g += '<path d="M' + sternX + " " + (bot - 6) + " L" + (x1 - L * 0.37) + " " + (bot - 6) + '" stroke="#000" stroke-opacity=".28" stroke-width="1.2"/>';
    if (pods) g += '<line x1="' + x0 + '" y1="' + (top + 3) + '" x2="' + x0 + '" y2="' + (bot - 2) + '" stroke="#000" stroke-opacity=".3" stroke-width="1.2"/>';
    // rub rail along the gunwale
    var bowRail = type === "sled" ? (x1 - L * 0.16) : (x1 - L * 0.04), railStart = pods ? x0 + 1 : x0 + 2;
    g += '<path d="M' + railStart + " " + (top + 1.5) + " L" + bowRail + " " + (top + 1.5) + '" stroke="' + (color && color.hex ? color.hex : "#d9dde0") + '" stroke-width="3.4" stroke-linecap="round"/>';
    g += '<path d="M' + railStart + " " + (top + 0.6) + " L" + bowRail + " " + (top + 0.6) + '" stroke="#fff" stroke-opacity=".25" stroke-width="1"/>';
    g += '<path d="M' + railStart + " " + (top + 3.5) + " L" + bowRail + " " + (top + 3.5) + '" stroke="#000" stroke-opacity=".35" stroke-width="1"/>';
    // bow deck (20" deck welded to angle)
    if (type !== "sled") g += '<path d="M' + (x1 - L * 0.07) + " " + (top - 1) + " L" + (x1 + 1) + " " + (top + 1) + '" stroke="#6b5a45" stroke-width="2.4" stroke-linecap="round"/>';
    // bow eye / anchor roller
    var tipY = type === "sled" ? top - 0.30 * (bot - top) : top;
    g += '<path d="M' + (x1 - 8) + " " + (tipY - 3) + " l10 -6 l4 4" + '" stroke="#c9ced2" stroke-width="2" fill="none"/>';

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
    drawPlan(x0, L, pods);

    drawSummary();
  }

  function drawSummary() {
    $("summary").innerHTML = [["Hull", state.hull], ["Length", lengthLabel(state.length)], ["Pods", state.hull === "Sled" ? "" : state.pods ? (state.pods === "Float pods" ? "Yes" : "No") : ""], ["Layout", state.layout]]
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
    $("f-color").value = colorLabel();
    $("f-floor").value = state.floor || "";
    $("f-extras").value = state.extras.join(", ");
  }

  function render() { syncSteps(); renderStepper(); renderPanel(); drawBoat(); syncForm(); }

  // ---------- Events ----------
  panel.addEventListener("input", function (e) {
    if (e.target.id === "paint-code") { state.paintCode = e.target.value.trim(); syncForm(); }
    if (e.target.id === "paint-hex") {
      customColor().hex = e.target.value;
      var dot = panel.querySelector(".dot-custom"); if (dot) dot.style.background = e.target.value;
      drawBoat(); syncForm();
    }
  });

  panel.addEventListener("click", function (e) {
    var edit = e.target.closest(".edit");
    if (edit) { go(+edit.dataset.step); return; }
    var b = e.target.closest("[data-val]");
    if (!b) return;
    var s = STEPS[current], v = b.dataset.val;
    if (s.type === "hull") {
      state.hull = v;
      if (v === "Sled") state.pods = null;
      if (!hasConsole()) { state.layout = null; state.seating = state.seating.filter(function (x) { return x !== "Flip-down console front seat"; }); }
      if (state.length && hullById(v).lengths.indexOf(state.length) < 0) state.length = null;
    } else if (s.type === "length") {
      state.length = +v;
      if (!hasConsole()) {
        state.layout = null;
        state.seating = state.seating.filter(function (x) { return x !== "Flip-down console front seat"; });
      }
      var ok = ALL_STEPS.filter(function (x) { return x.key === "layout"; })[0].options(state).map(function (o) { return o.id; });
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
