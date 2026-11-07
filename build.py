#!/usr/bin/env python3
"""Builds the Unreel Custom Boats pages from one shared header and footer.
Run: python3 build.py  (writes the .html files next to it)"""
from pathlib import Path

ROOT = Path(__file__).parent

NAV = [
    ("/", "Home", "index"),
    ("/models", "Models", "models"),
    ("/custom-build", "Custom Build", "custom-build"),
    ("/gallery", "Gallery", "gallery"),
    ("/about", "About", "about"),
    ("/contact", "Contact", "contact"),
]


def head(title, desc):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;800;900&family=Barlow:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/styles.css">
</head>
<body>
<div class="wrap">
"""


def nav(active):
    items = "\n".join(
        f'      <li><a href="{href}"{" aria-current=\"page\"" if key == active else ""}>{label}</a></li>'
        for href, label, key in NAV
    )
    return f"""  <nav aria-label="Main">
    <a class="mark" href="/"><picture><source srcset="/logo.webp" type="image/webp"><img src="/logo.png" alt="Unreel Custom Boats" width="900" height="207"></picture></a>
    <ul>
{items}
    </ul>
  </nav>
"""


FOOT = """  <footer>
    <span>© 2026 Unreel Custom Boats · Built in Nelson, BC</span>
    <span class="foot-contact"><a href="tel:+12505516136">250-551-6136</a><a href="mailto:unreelboats@gmail.com">unreelboats@gmail.com</a></span>
  </footer>
</div>
<script>
  // Walk-around clip: load when it nears the screen, then autoplay silently on a loop.
  // If the phone blocks autoplay (e.g. iPhone Low Power Mode), start it on the visitor's first tap.
  (function(){
    var vids=[].slice.call(document.querySelectorAll('video.lazy-video')); if(!vids.length) return;
    function load(v){
      var s=v.querySelector('source[data-src]'); if(!s) return;
      s.src=s.dataset.src; s.removeAttribute('data-src'); v.load();
    }
    function play(v){ v.muted=true; v.defaultMuted=true; var p=v.play(); if(p&&p.catch) p.catch(function(){}); }
    function kick(){ vids.forEach(function(v){ if(!v.querySelector('source[data-src]') && v.paused) play(v); }); }
    ['touchend','click','keydown'].forEach(function(ev){ document.addEventListener(ev,kick,{passive:true}); });
    if(!('IntersectionObserver' in window)){ vids.forEach(function(v){ load(v); play(v); }); return; }
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){
      var v=e.target;
      if(e.isIntersecting){ load(v); play(v); } else if(!v.paused){ v.pause(); }
    }); },{rootMargin:'300px 0px'});
    vids.forEach(function(v){ v.muted=true; io.observe(v); });
  })();
</script>
</body>
</html>
"""


def page(name, title, desc, active, body):
    (ROOT / f"{name}.html").write_text(head(title, desc) + nav(active) + body + FOOT)


# ---------- Home ----------
HOME = """
</div>
<header class="vhero" id="top">
  <video class="vhero-video" autoplay muted loop playsinline disablepictureinpicture preload="auto"
         poster="/video/hero-wide-poster.jpg" aria-hidden="true"
         data-wide="/video/hero-wide.mp4" data-tall="/video/hero-tall.mp4"
         data-wide-poster="/video/hero-wide-poster.jpg" data-tall-poster="/video/hero-tall-poster.jpg"></video>
  <div class="vhero-shade" aria-hidden="true"></div>
  <div class="vhero-copy">
    <h1>Go where the <em>props</em> can't.</h1>
    <div class="btns vhero-btns">
      <a class="btn" href="#walkaround">Learn more</a>
      <a class="btn primary" href="/custom-build">Build yours</a>
    </div>
  </div>
</header>
<script>
  // Pick the tall clip for portrait screens and the wide crop for landscape, then autoplay silently.
  (function(){
    var v=document.querySelector('.vhero-video'); if(!v) return;
    var tall=window.matchMedia('(max-aspect-ratio: 1/1)').matches;
    v.poster=tall?v.dataset.tallPoster:v.dataset.widePoster;
    v.muted=true; v.defaultMuted=true;
    v.src=tall?v.dataset.tall:v.dataset.wide;
    var p=v.play(); if(p&&p.catch) p.catch(function(){});
    function kick(){ if(v.paused){ var q=v.play(); if(q&&q.catch) q.catch(function(){}); } }
    ['touchend','click','keydown'].forEach(function(ev){ document.addEventListener(ev,kick,{passive:true}); });
  })();
</script>
<div class="wrap">


  <section id="walkaround" class="walk">
    <div class="walk-copy">
      <span class="label">On the water</span>
      <h2>Walk around the Center Console Jon</h2>
      <p class="muted">Welded aluminum, a clean jet transom and a console set where you want it. Built in Nelson and run on clear BC water.</p>
      <ul class="tags"><li>Center console</li><li>Outboard jet</li><li>Welded aluminum</li></ul>
      <div class="btns">
        <a class="btn primary" href="/custom-build">Build your own</a>
        <a class="btn" href="/models">See the model</a>
      </div>
    </div>
    <div class="walk-media">
        <video class="lazy-video" autoplay muted loop playsinline disablepictureinpicture preload="none" poster="/video/walkaround-poster.jpg" aria-label="Walk-around video of a black Unreel center console jon floating in clear shallow water">
          <source data-src="/video/walkaround.mp4" type="video/mp4">
        </video>
    </div>
  </section>

  <section id="why">
    <div class="head">
      <span class="label">Why a jet boat</span>
      <h2>Built for low water and hard bottoms</h2>
    </div>
    <div class="why-grid">
      <div>
        <h3>Runs shallow</h3>
        <p>A jet pulls water in through an intake at the bottom of the hull instead of spinning a prop below it. That lets you run gravel bars and skinny channels a prop boat has to stay out of.</p>
      </div>
      <div>
        <h3>Nothing to strike</h3>
        <p>With no propeller hanging below the hull, there's far less to snag on rocks, logs and stumps when the river drops.</p>
      </div>
      <div>
        <h3>Aluminum that takes it</h3>
        <p>Welded aluminum hulls shrug off beaching, dragging and loading on rough launches, and they can be repaired instead of replaced.</p>
      </div>
    </div>
  </section>

  <section id="on-the-water">
    <div class="head">
      <span class="label">On the water</span>
      <h2>Built in the shop, run on BC water</h2>
    </div>
    <div class="photos">
      <figure>
        <picture><source srcset="/img/helm.webp" type="image/webp"><img src="/img/helm.jpg" alt="Helm console with a stainless steering wheel, switch panels and throttle" width="1100" height="1467" loading="lazy"></picture>
      </figure>
      <figure>
        <picture><source srcset="/img/stern-seating.webp" type="image/webp"><img src="/img/stern-seating.jpg" alt="Stern seating with two bench seats, cup holders and a pedestal seat" width="1100" height="1467" loading="lazy"></picture>
      </figure>
      <figure>
        <picture><source srcset="/img/beached-bow.webp" type="image/webp"><img src="/img/beached-bow.jpg" alt="Boat pulled up bow-first on a sandy lakeshore" width="1100" height="1467" loading="lazy"></picture>
      </figure>
      <figure>
        <picture><source srcset="/img/crew-evening.webp" type="image/webp"><img src="/img/crew-evening.jpg" alt="Three people relaxing aboard on a lake in the evening light" width="1100" height="1467" loading="lazy"></picture>
      </figure>
    </div>
  </section>

  <section id="process">
    <div class="head">
      <span class="label">How a build goes</span>
      <h2>From first call to first run</h2>
    </div>
    <ol class="steps">
      <li><span class="n">01</span><h3>Talk it through</h3><p>Where you run, how many people, what you haul. That sets the length and layout.</p></li>
      <li><span class="n">02</span><h3>Sign off the design</h3><p>We agree on hull size, console, seating and options before any metal is cut.</p></li>
      <li><span class="n">03</span><h3>Cut &amp; weld</h3><p>The hull is cut, formed and welded in the shop.</p></li>
      <li><span class="n">04</span><h3>Rig &amp; water test</h3><p>Motor, jet, controls and wiring go in, then it gets run on the water.</p></li>
      <li><span class="n">05</span><h3>Hand-off</h3><p>You pick it up and get a walk-through of everything on board.</p></li>
    </ol>
  </section>

  <section class="cta-band">
    <picture><source srcset="/img/wake-wide.webp" type="image/webp"><img class="cta-bg" src="/img/wake-wide.jpg" alt="" width="1400" height="1027" loading="lazy"></picture>
    <div class="cta">
      <div class="head">
        <span class="label">Start a build</span>
        <h2>Tell us what you're after</h2>
        <p class="muted">Send a length, a layout and how you plan to use it. We'll get back to you to talk it through.</p>
      </div>
      <a class="btn primary" href="/contact">Start an inquiry</a>
    </div>
  </section>
"""
page("index", "Unreel Custom Boats",
     "Welded aluminum jet boats built in Nelson, BC.", "index", HOME)


# ---------- Coming soon pages ----------
SOON = {
    "about": ("About", "The story behind Unreel Custom Boats is on the way."),
}
for key, (name, line) in SOON.items():
    body = f"""
  <main class="soon">
    <span class="stamp">Coming soon</span>
    <h1>{name}</h1>
    <p>{line} In the meantime, tell us what you're looking for and we'll talk it through.</p>
    <div class="btns">
      <a class="btn primary" href="/contact">Start an inquiry</a>
      <a class="btn" href="/">Back to home</a>
    </div>
  </main>
"""
    page(key, f"{name} | Unreel Custom Boats", f"{name} from Unreel Custom Boats, coming soon.", key, body)




# ---------- Models ----------
cards = """
      <article class="model model-feature">
        <figure class="model-photo">
          <picture><source srcset="/img/side-profile.webp" type="image/webp"><img class="uncropped" src="/img/side-profile.jpg" alt="Black Unreel Custom Boats center console jon in shallow water on a BC river gravel bar" width="1400" height="1400"></picture>
        </figure>
        <div class="model-body">
          <span class="label">Model</span>
          <h2 class="model-name">Center Console Jon</h2>
          <ul class="tags"><li>Center console</li><li>Outboard jet</li><li>Welded aluminum</li></ul>
          <p class="muted">A welded aluminum center console built to run shallow rivers and big lakes. Built to order in Nelson, BC, with the length, seating and options set around how you run.</p>
          <p class="muted">Full spec sheet coming soon.</p>
          <div class="btns">
            <a class="btn primary" href="/contact?model=Center+Console+Jon">Ask about this boat</a>
            <a class="btn" href="/custom-build">Build your own</a>
          </div>
        </div>
      </article>"""
MODELS_BODY = f"""
  <main class="models-page">
    <div class="head">
      <span class="label">Models</span>
      <h1>The lineup</h1>
      <p class="muted">Start from this model, or tell us what you need and we'll build it custom.</p>
    </div>
    <div class="model-grid">{cards}
    </div>

    <section class="layout-sec">
      <div class="head">
        <span class="label">Deck layout</span>
        <h2>From the top</h2>
        <p class="muted">Back deck with two hatches, an open cockpit floor with side shelves, the console on the aft edge of the front deck, two long hatches up front and the bow deck. Shown here in EVA foam.</p>
      </div>
      <figure class="layout-fig">
        <picture><source srcset="/img/deck-layout.webp" type="image/webp"><img src="/img/deck-layout.jpg" alt="Top-down render of the Center Console Jon deck layout in grey EVA foam, with float pods at the stern and UNREEL on the bow" width="1600" height="667" loading="lazy"></picture>
      </figure>
    </section>

    <section class="spec-sec">
      <div class="head">
        <span class="label">Specs</span>
        <h2>18 ft Center Console Jon</h2>
      </div>
      <dl class="specs">
        <div><dt>Length overall</dt><dd>18'4" with float pods</dd></div>
        <div><dt>Beam</dt><dd>80"</dd></div>
        <div><dt>Bottom width</dt><dd>60"</dd></div>
        <div><dt>Side height</dt><dd>21-5/8"</dd></div>
        <div><dt>Transom</dt><dd>30", 13&deg; rake</dd></div>
        <div><dt>Jet tunnel</dt><dd>16" wide, 48" long, 3" deep</dd></div>
        <div><dt>Float pods</dt><dd>Sealed, welded boxes aft of the transom</dd></div>
        <div><dt>Deck layout</dt><dd>48" back deck &middot; 70" cockpit floor &middot; 58" front deck &middot; 20" bow deck</dd></div>
        <div><dt>Bottom &amp; frames</dt><dd>3/16" 5052 marine aluminum</dd></div>
        <div><dt>Sides &amp; decks</dt><dd>1/8" 5052 marine aluminum</dd></div>
        <div><dt>Hull weight</dt><dd>About 870 lb, bare hull (estimate)</dd></div>
      </dl>
    </section>
  </main>
"""
page("models", "Models | Unreel Custom Boats",
     "The Unreel Center Console Jon: a welded aluminum jet boat built to order in Nelson, BC.", "models", MODELS_BODY)


# ---------- Gallery ----------
GALLERY = [
    ("night-lights", 1100, 1467, "Center console jon on its trailer at night with white LED strip lights glowing along the gunwales", "LED gunwale lights"),
    ("drone-channel", 1100, 1954, "Overhead drone shot of a center console jon running a shallow side channel past driftwood", "Running the side channel"),
    ("drone-wake", 1100, 1954, "Overhead drone shot of a center console jon carving a turn with a big jet wake", "Carving a turn"),
    ("gravel-bar", 1400, 1867, "Boat nosed up on a gravel bar in a clear BC river while an angler casts nearby", "On the gravel bar"),
    ("helm", 1100, 1467, "Helm console with a stainless steering wheel, switch panels and throttle", "Helm console"),
    ("stern-seating", 1100, 1467, "Stern seating with two bench seats, cup holders and a pedestal seat", "Stern seating"),
    ("beached-bow", 1100, 1467, "Boat pulled up bow-first on a sandy lakeshore", "Beached on the bow"),
    ("crew-evening", 1100, 1467, "Three people relaxing aboard on a lake in the evening light", "Evenings on the lake"),
    ("wake-sunset", 1100, 1467, "Outboard jet throwing a wake on a lake at sunset", "Running at sunset"),
]
tiles = "".join(f"""
      <figure>
        <button type="button" class="tile" data-src="/img/{n}.jpg" data-cap="{c}" aria-label="Open photo: {c}">
          <picture><source srcset="/img/{n}.webp" type="image/webp"><img src="/img/{n}.jpg" alt="{a}" width="{w}" height="{h}" loading="lazy"></picture>
        </button>
      </figure>""" for n, w, h, a, c in GALLERY)
GALLERY_BODY = f"""
  <main class="gallery-page">
    <div class="head">
      <span class="label">Gallery</span>
      <h1>On the water</h1>
      <p class="muted">Boats from the shop, out on BC rivers and lakes.</p>
    </div>
    <div class="gallery">
      <figure class="gallery-video">
      <video class="lazy-video" autoplay muted loop playsinline disablepictureinpicture preload="none" poster="/video/overhead-pullaway-poster.jpg" aria-label="Drone video pulling up and away from a center console jon anchored over clear turquoise river water">
        <source data-src="/video/overhead-pullaway.mp4" type="video/mp4">
      </video>
    </figure>
      <figure class="gallery-video">
      <video class="lazy-video" autoplay muted loop playsinline disablepictureinpicture preload="none" poster="/video/bridge-tow-poster.jpg" aria-label="Drone video of a truck towing a center console jon across a wooden bridge over a BC river in fall">
        <source data-src="/video/bridge-tow.mp4" type="video/mp4">
      </video>
    </figure>
      <figure class="gallery-video">
      <video class="lazy-video" autoplay muted loop playsinline disablepictureinpicture preload="none" poster="/video/walkaround-poster.jpg" aria-label="Walk-around video of a black Unreel center console jon floating in clear shallow water">
        <source data-src="/video/walkaround.mp4" type="video/mp4">
      </video>
    </figure>{tiles}
    </div>
  </main>
  <dialog id="viewer" aria-label="Photo viewer">
    <button type="button" class="viewer-close" aria-label="Close">Close</button>
    <img id="viewer-img" alt="">
    <p id="viewer-cap"></p>
  </dialog>
  <script>
    (function(){{
      var d=document.getElementById('viewer'), im=document.getElementById('viewer-img'), cap=document.getElementById('viewer-cap');
      document.querySelectorAll('.tile').forEach(function(b){{
        b.addEventListener('click',function(){{
          im.src=b.dataset.src; im.alt=b.querySelector('img').alt; cap.textContent=b.dataset.cap; d.showModal();
        }});
      }});
      d.querySelector('.viewer-close').addEventListener('click',function(){{ d.close(); }});
      d.addEventListener('click',function(e){{ if(e.target===d) d.close(); }});
    }})();
  </script>
"""
page("gallery", "Gallery | Unreel Custom Boats",
     "Photos of Unreel Custom Boats on BC rivers and lakes.", "gallery", GALLERY_BODY)


# ---------- Custom Build (wizard logic lives in builder.js) ----------
BUILD_BODY = """
  <main class="builder-page">
    <div class="head" id="builder-top">
      <span class="label">Custom Build</span>
      <h1>Build your boat</h1>
      <p class="muted">Work through each step to lay out the boat you want, then send it to us. Nothing is final until we talk it through.</p>
    </div>

    <ol class="stepper" id="stepper" aria-label="Build steps"></ol>

    <div class="builder">
      <form class="wizard" id="build-form" name="custom-build" method="POST" action="/thanks" data-netlify="true" netlify-honeypot="company-website">
        <input type="hidden" name="form-name" value="custom-build">
        <p class="hidden-field"><label>Leave this empty <input name="company-website" tabindex="-1" autocomplete="off"></label></p>
        <input type="hidden" name="hull" id="f-hull">
        <input type="hidden" name="length" id="f-length">
        <input type="hidden" name="layout" id="f-layout">
        <input type="hidden" name="float-pods" id="f-pods">
        <input type="hidden" name="seating" id="f-seating">
        <input type="hidden" name="storage" id="f-storage">
        <input type="hidden" name="hull-color" id="f-color">
        <input type="hidden" name="floor" id="f-floor">
        <input type="hidden" name="extras" id="f-extras">

        <div id="panel" aria-live="polite"></div>

        <div id="contact-block" class="contact-block" hidden>
          <div class="row">
            <div class="field">
              <label for="b-name">Name <span class="req">*</span></label>
              <input id="b-name" name="name" type="text" autocomplete="name" required>
            </div>
            <div class="field">
              <label for="b-location">Where are you located?</label>
              <input id="b-location" name="location" type="text" placeholder="Town, province">
            </div>
          </div>
          <div class="row">
            <div class="field">
              <label for="b-email">Email <span class="req">*</span></label>
              <input id="b-email" name="email" type="email" autocomplete="email" required>
            </div>
            <div class="field">
              <label for="b-phone">Phone</label>
              <input id="b-phone" name="phone" type="tel" autocomplete="tel">
            </div>
          </div>
          <div class="field">
            <label for="b-notes">Anything else?</label>
            <textarea id="b-notes" name="notes" placeholder="Where you run, motor preferences, anything not listed"></textarea>
          </div>
        </div>

        <p class="step-error" id="step-error" role="alert" hidden></p>

        <div class="wizard-nav">
          <button type="button" class="btn" id="back">Back</button>
          <button type="button" class="btn primary" id="next">Next</button>
          <button type="submit" class="btn primary" id="send" hidden>Send my build</button>
        </div>
      </form>

      <aside class="preview" aria-label="Your boat so far">
        <div class="stage">
          <svg id="boat" viewBox="0 0 660 250" role="img" aria-label="Side view of your boat"></svg>
        </div>
        <div class="stage" id="plan-stage">
          <svg id="plan" viewBox="0 0 660 236" role="img" aria-label="Top view of your boat's deck layout"></svg>
        </div>
        <dl class="summary" id="summary"></dl>
      </aside>
    </div>
    <p class="note muted">More options are on the way. If something you want isn't listed, add it in your notes at the end.</p>
  </main>
  <script src="/builder.js"></script>
"""
page("custom-build", "Custom Build | Unreel Custom Boats",
     "Lay out your own Unreel jet boat: hull style, length, layout, finish and extras.", "custom-build", BUILD_BODY)


# ---------- Contact ----------
lengths = "\n".join(f'                <option value="{n} ft">{n} ft</option>' for n in range(10, 25))
CONTACT = f"""
  <main class="contact-page">
    <div class="contact-intro">
      <span class="label">Contact</span>
      <h1>Start an inquiry</h1>
      <p class="muted">Tell us about the boat you want and how you'll use it. Rough ideas are fine. We'll get back to you to talk it through.</p>
      <dl class="direct">
        <div><dt>Phone</dt><dd><a href="tel:+12505516136">250-551-6136</a></dd></div>
        <div><dt>Email</dt><dd><a href="mailto:unreelboats@gmail.com">unreelboats@gmail.com</a></dd></div>
        <div><dt>Shop</dt><dd>Nelson, BC</dd></div>
      </dl>
      <ul>
        <li>Built in Nelson, BC</li>
        <li>Not sure on size yet? Tell us where you run and we'll help you pick.</li>
      </ul>
    </div>

    <form class="inquiry" name="inquiry" method="POST" action="/thanks" data-netlify="true" netlify-honeypot="company-website">
      <input type="hidden" name="form-name" value="inquiry">
      <p class="hidden-field"><label>Leave this empty <input name="company-website" tabindex="-1" autocomplete="off"></label></p>

      <fieldset>
        <legend>About you</legend>
        <div class="row">
          <div class="field">
            <label for="name">Name <span class="req">*</span></label>
            <input id="name" name="name" type="text" autocomplete="name" required>
          </div>
          <div class="field">
            <label for="location">Where are you located?</label>
            <input id="location" name="location" type="text" placeholder="Town, province">
          </div>
        </div>
        <div class="row">
          <div class="field">
            <label for="email">Email <span class="req">*</span></label>
            <input id="email" name="email" type="email" autocomplete="email" required>
          </div>
          <div class="field">
            <label for="phone">Phone</label>
            <input id="phone" name="phone" type="tel" autocomplete="tel">
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Your boat</legend>
        <div class="field">
          <label for="model">Model</label>
          <select id="model" name="model">
            <option value="Not sure yet">Not sure yet</option>
            <option value="Center Console Jon">Center Console Jon</option>
            <option value="Custom build">Custom build</option>
          </select>
        </div>
        <div class="row">
          <div class="field">
            <label for="length">Length</label>
            <select id="length" name="length">
                <option value="Not sure yet">Not sure yet</option>
{lengths}
            </select>
          </div>
          <div class="field">
            <label for="layout">Console position</label>
            <select id="layout" name="layout">
              <option value="Not sure yet">Not sure yet</option>
              <option>Front console</option>
              <option>Middle console</option>
            </select>
          </div>
        </div>
        <div class="field">
          <span class="q" id="use-q">What will you use it for?</span>
          <div class="choices" role="group" aria-labelledby="use-q">
            <label><input type="checkbox" name="use[]" value="Fishing"> Fishing</label>
            <label><input type="checkbox" name="use[]" value="Hunting"> Hunting</label>
            <label><input type="checkbox" name="use[]" value="River running"> River running</label>
            <label><input type="checkbox" name="use[]" value="Family trips"> Family trips</label>
            <label><input type="checkbox" name="use[]" value="Work boat"> Work boat</label>
          </div>
        </div>
        <div class="row">
          <div class="field">
            <label for="people">Usual number of people aboard</label>
            <select id="people" name="people">
              <option>1–2</option>
              <option>3–4</option>
              <option>5–6</option>
              <option>7+</option>
            </select>
          </div>
          <div class="field">
            <label for="timeline">When would you want it?</label>
            <select id="timeline" name="timeline">
              <option>Just looking for now</option>
              <option>This season</option>
              <option>Next season</option>
              <option>No rush</option>
            </select>
          </div>
        </div>
        <div class="field">
          <label for="message">Anything else?</label>
          <span class="hint" id="message-hint">Where you run, what you haul, motor preferences, extras you want.</span>
          <textarea id="message" name="message" aria-describedby="message-hint"></textarea>
        </div>
      </fieldset>

      <div class="form-foot">
        <p>We only use your details to reply to your inquiry.</p>
        <button class="btn primary" type="submit">Send inquiry</button>
      </div>
    </form>
  </main>
  <script>
    (function(){{
      var m=new URLSearchParams(location.search).get('model');
      var sel=document.getElementById('model');
      if(m && sel.querySelector('option[value="'+m+'"]')) sel.value=m;
    }})();
  </script>
"""
page("contact", "Contact | Unreel Custom Boats",
     "Send Unreel Custom Boats an inquiry about a custom aluminum jet boat.", "contact", CONTACT)


# ---------- Thank-you page ----------
THANKS = """
  <main class="soon">
    <span class="stamp">Inquiry sent</span>
    <h1>Thanks</h1>
    <p>We've got your inquiry and will get back to you soon.</p>
    <div class="btns">
      <a class="btn primary" href="/">Back to home</a>
    </div>
  </main>
"""
page("thanks", "Thanks | Unreel Custom Boats", "Your inquiry was sent.", "", THANKS)

print("built", sorted(p.name for p in ROOT.glob("*.html")))
