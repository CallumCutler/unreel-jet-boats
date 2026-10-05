/* Unreel Jet Boats — custom build wizard.
   To add or change options, edit the STEPS list below. Each step is one screen. */
(function () {
  "use strict";

  function range(a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; }

  // ---------- Options (filler content — edit freely) ----------
  var HULLS = [
    { id: "Jon", blurb: "Flat bottom, wide and stable. The shallowest draft for creeks, backwaters and calm water.", lengths: [10, 12, 14, 16, 18], bottom: "jon",
      bottomWidths: { 10: 36, 12: 36, 14: 48, 16: 54, 18: 60 } },  // bottom (base) width in inches per length
    { id: "Sled", blurb: "Flat bottom with a long, raked bow. The classic river jet for skinny, fast water.", lengths: range(14, 20), bottom: "sled" },
    { id: "Mod V", blurb: "A V at the bow that flattens toward the stern. Rides softer in chop and still runs shallow.", lengths: range(14, 22), bottom: "modv" },
    { id: "Deep V", blurb: "A sharp V the full length. Best on big lakes and rough water, and needs more depth to run.", lengths: range(16, 24), bottom: "deepv" }
  ];

  var LAYOUTS = [
    { id: "Tiller", blurb: "Steer from the stern. Simple, light and roomy.", maxLen: 16 },
    { id: "Side console", blurb: "Helm off to one side, open floor down the middle." },
    { id: "Center console", blurb: "Walk all the way around. Great for fishing.", minLen: 14 },
    { id: "Walk-through windshield", blurb: "Split windshield with a walkway to the bow. More shelter.", minLen: 18 }
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
    { key: "layout", title: "Layout", type: "single",
      intro: "How do you want to drive it?",
      options: function (s) {
        return LAYOUTS.filter(function (o) {
          return (!o.maxLen || s.length <= o.maxLen) && (!o.minLen || s.length >= o.minLen);
        });
      } },
    { key: "seating", title: "Seating & storage", type: "multi",
      intro: "Pick everything you want. Skip anything you're not sure about.",
      options: function () {
        return ["Pedestal seats", "Bench seating", "Flip-up stern seats", "Front casting deck",
                "Dry storage boxes", "Rod lockers", "Livewell", "Cooler mount"].map(function (x) { return { id: x }; });
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

  var FLOORS = ["Bare aluminum", "Marine vinyl", "Foam decking"];

  // ---------- State ----------
  var state = { hull: null, length: null, layout: null, seating: [], color: "Raw aluminum", floor: null, extras: [] };
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
  function section(bottom) {
    var paths = {
      jon:   "M15.8 14 L30 46 L90 46 L104.2 14",          // sides at 66° from the bottom
      sled:  "M16.2 12 L30.4 44 Q32.2 48 36 48 L84 48 Q87.8 48 89.6 44 L103.8 12",  // sides at 66° from the bottom, rounded chines
      modv:  "M10 12 L16 40 L60 50 L104 40 L110 12",
      deepv: "M10 10 L22 30 L60 54 L98 30 L110 10"
    };
    return '<svg class="xsec" viewBox="0 0 120 60" aria-hidden="true">' +
      '<line x1="0" y1="38" x2="120" y2="38" class="xsec-wl"/>' +
      '<path d="' + paths[bottom] + '" class="xsec-hull"/></svg>';
  }

  // Side profiles: stern on the left, bow on the right, waterline at y=40.
  function profile(bottom) {
    var paths = {
      // flat bottom, low sides, short square-raked bow
      jon:   "M8 22 L150 22 Q136 46 90 46 L8 46 Z",
      // flat bottom, long sweeping raked bow rising well above the sheer
      sled:  "M8 20 L120 18 L152 10 Q138 30 112 46 L8 46 Z",
      // bottom curves up into a moderate V entry at the bow
      modv:  "M8 18 L126 14 Q146 12 152 16 Q140 38 110 48 L8 48 Z",
      // deeper hull, sharp high bow, keel running deep forward
      deepv: "M8 14 L120 9 Q146 6 154 10 Q144 40 104 54 L8 52 Z"
    };
    return '<svg class="xsec xprof" viewBox="0 0 160 60" aria-hidden="true">' +
      '<line x1="0" y1="40" x2="160" y2="40" class="xsec-wl"/>' +
      '<path d="' + paths[bottom] + '" class="xsec-hull"/></svg>';
  }

  function hullViews(bottom) {
    return '<span class="views"><span class="view">' + section(bottom) + '<span class="view-l">End</span></span>' +
      '<span class="view">' + profile(bottom) + '<span class="view-l">Side</span></span></span>';
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
    var L = 220 + (len - 10) / 14 * 330, x0 = 330 - L / 2 + 10, x1 = x0 + L;
    var top = 112, bot = 168, type = state.hull ? hullById(state.hull).bottom : "modv";
    var color = COLORS.filter(function (c) { return c.id === state.color; })[0];
    var fill = color && color.hex ? color.hex : "var(--metal)";
    var d;
    if (type === "jon") d = "M" + x0 + " " + top + " L" + (x1 + 4) + " " + top + " Q" + (x1 - L * 0.08) + " " + bot + " " + (x1 - L * 0.32) + " " + bot + " L" + x0 + " " + bot + " Z";
    else if (type === "sled") d = "M" + x0 + " " + top + " L" + (x1 + 6) + " " + (top - 8) + " L" + (x1 - L * 0.24) + " " + bot + " L" + x0 + " " + bot + " Z";
    else if (type === "deepv") { top = 104; bot = 176; d = "M" + x0 + " " + top + " L" + (x1 - 26) + " " + (top - 12) + " Q" + x1 + " " + (top - 14) + " " + (x1 + 8) + " " + (top - 2) + " Q" + (x1 - 26) + " " + (bot - 4) + " " + (x1 - L * 0.3) + " " + bot + " L" + x0 + " " + bot + " Z"; }
    else d = "M" + x0 + " " + top + " L" + (x1 - 22) + " " + (top - 8) + " Q" + x1 + " " + (top - 10) + " " + (x1 + 6) + " " + top + " Q" + (x1 - 20) + " " + (bot - 4) + " " + (x1 - L * 0.22) + " " + bot + " L" + x0 + " " + bot + " Z";

    var g = '<line class="wl" x1="0" y1="156" x2="660" y2="156"/>';
    // outboard jet
    g += '<path class="motor" d="M' + (x0 - 30) + " " + (top - 44) + " h30 v26 h-8 v" + (bot - top + 20) + " h-12 v-" + (bot - top + 20) + " h-10 Z\"/>";
    g += '<path class="hull" fill="' + fill + '" d="' + d + '"/>';
    g += '<path class="rail" d="M' + x0 + " " + (top + 12) + " L" + (x1 - 14) + " " + (top + 4) + '"/>';
    // layout
    var mid = x0 + L * 0.5, deck = top - 1;
    if (state.layout === "Tiller") {
      g += '<line class="part-line" x1="' + (x0 - 12) + '" y1="' + (top - 30) + '" x2="' + (x0 + 34) + '" y2="' + (top - 38) + '"/>';
    } else if (state.layout === "Side console") {
      g += '<rect class="part" x="' + (mid - 10) + '" y="' + (deck - 30) + '" width="38" height="30"/><path class="glass" d="M' + (mid + 12) + " " + (deck - 30) + " l14 -18 h8 l-6 18 Z\"/>";
    } else if (state.layout === "Center console") {
      g += '<rect class="part" x="' + (mid - 22) + '" y="' + (deck - 36) + '" width="46" height="36"/><path class="glass" d="M' + (mid + 6) + " " + (deck - 36) + " l12 -20 h8 l-4 20 Z\"/>";
    } else if (state.layout === "Walk-through windshield") {
      g += '<path class="glass" d="M' + (x0 + L * 0.42) + " " + deck + " L" + (x0 + L * 0.5) + " " + (deck - 44) + " L" + (x0 + L * 0.64) + " " + (deck - 46) + " L" + (x0 + L * 0.66) + " " + (deck - 4) + ' Z"/>';
    }
    // dimension
    g += '<line class="dim" x1="' + x0 + '" y1="214" x2="' + x1 + '" y2="214"/><line class="dim" x1="' + x0 + '" y1="207" x2="' + x0 + '" y2="221"/><line class="dim" x1="' + x1 + '" y1="207" x2="' + x1 + '" y2="221"/>';
    g += '<text x="' + ((x0 + x1) / 2) + '" y="240" text-anchor="middle">' + (state.length ? state.length + " FT" : "LENGTH") + "</text>";
    $("boat").innerHTML = g;

    $("summary").innerHTML = [["Hull", state.hull], ["Length", lengthLabel(state.length)], ["Layout", state.layout], ["Color", state.color]]
      .map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + esc(r[1] || "—") + "</dd></div>"; }).join("");
  }

  // ---------- Hidden form fields ----------
  function syncForm() {
    $("f-hull").value = state.hull || "";
    $("f-length").value = lengthLabel(state.length);
    $("f-layout").value = state.layout || "";
    $("f-seating").value = state.seating.join(", ");
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
      var ok = STEPS[2].options(state).map(function (o) { return o.id; });
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
