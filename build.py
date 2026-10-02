#!/usr/bin/env python3
"""Builds the Unreel Jet Boats pages from one shared header and footer.
Run: python3 build.py  (writes the .html files next to it)"""
from pathlib import Path

ROOT = Path(__file__).parent

NAV = [
    ("/", "Home", "index"),
    ("/models", "Models", "models"),
    ("/inventory", "Inventory", "inventory"),
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
    <a class="mark" href="/"><picture><source srcset="/logo.webp" type="image/webp"><img src="/logo.png" alt="Unreel Jet Boats" width="900" height="263"></picture></a>
    <ul>
{items}
    </ul>
  </nav>
"""


FOOT = """  <footer>
    <span>© 2026 Unreel Jet Boats</span>
    <span>Welded aluminum · Built in BC</span>
  </footer>
</div>
</body>
</html>
"""


def page(name, title, desc, active, body):
    (ROOT / f"{name}.html").write_text(head(title, desc) + nav(active) + body + FOOT)


# ---------- Home ----------
HOME = """
  <header class="hero" id="top">
    <div class="hero-copy">
      <h1>Go where<br>the <em>props</em><br>can't.</h1>
      <p>Welded aluminum jet boats from 10 to 24 feet, built one at a time in British Columbia for shallow rivers, gravel bars and long days on the water.</p>
      <div class="btns">
        <a class="btn primary" href="/contact">Start an inquiry</a>
        <a class="btn" href="#range">See the range</a>
      </div>
    </div>
    <figure class="hero-photo">
      <picture><source srcset="/img/gravel-bar.webp" type="image/webp"><img src="/img/gravel-bar.jpg" alt="An Unreel jet boat nosed up on a gravel bar in a clear BC river while an angler casts nearby" width="1400" height="1867" fetchpriority="high"></picture>
    </figure>
  </header>

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

  <section id="range">
    <div class="head">
      <span class="label">The range</span>
      <h2>Ten to twenty-four feet</h2>
      <p class="muted">Every hull is built to order. These are the size classes builds fall into; pick a length and we'll set the beam, sides and layout around how you run.</p>
    </div>
    <div class="ruler">
      <div class="ruler-inner">
        <div class="ticks" aria-hidden="true">
          <span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span><span>16</span><span>17</span><span>18</span><span>19</span><span>20</span><span>21</span><span>22</span><span>23</span><span>24 ft</span>
        </div>
        <div class="bands">
          <div class="band">
            <span class="label">Small</span>
            <span class="ft">10–14'</span>
            <p>Light, easy to launch and haul. One or two people on creeks, small rivers and lakes.</p>
            <ul><li>Solo fishing &amp; hunting</li><li>Tiller or side console</li></ul>
          </div>
          <div class="band">
            <span class="label">Mid</span>
            <span class="ft">15–19'</span>
            <p>The all-rounder. Room for a crew and gear on day trips up the river.</p>
            <ul><li>Family &amp; fishing trips</li><li>Side or center console</li></ul>
          </div>
          <div class="band">
            <span class="label">Large</span>
            <span class="ft">20–24'</span>
            <p>Bigger rivers, bigger loads, longer runs. Built for full crews and camp gear.</p>
            <ul><li>Multi-day trips &amp; work boats</li><li>Walk-through windshield</li></ul>
          </div>
        </div>
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
        <figcaption>Helm console</figcaption>
      </figure>
      <figure>
        <picture><source srcset="/img/stern-seating.webp" type="image/webp"><img src="/img/stern-seating.jpg" alt="Stern seating with two bench seats, cup holders and a pedestal seat" width="1100" height="1467" loading="lazy"></picture>
        <figcaption>Stern seating</figcaption>
      </figure>
      <figure>
        <picture><source srcset="/img/beached-bow.webp" type="image/webp"><img src="/img/beached-bow.jpg" alt="Boat pulled up bow-first on a sandy lakeshore" width="1100" height="1467" loading="lazy"></picture>
        <figcaption>Beached on the bow</figcaption>
      </figure>
      <figure>
        <picture><source srcset="/img/crew-evening.webp" type="image/webp"><img src="/img/crew-evening.jpg" alt="Three people relaxing aboard on a lake in the evening light" width="1100" height="1467" loading="lazy"></picture>
        <figcaption>Evenings on the lake</figcaption>
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
page("index", "Unreel Jet Boats",
     "Welded aluminum jet boats from 10 to 24 feet, built in British Columbia.", "index", HOME)


# ---------- Coming soon pages ----------
SOON = {
    "models": ("Models", "Spec sheets for each boat in the 10 to 24 foot range are on the way."),
    "inventory": ("Inventory", "Boats that are built and ready to go will be listed here soon."),
    "custom-build": ("Custom Build", "An interactive tool to lay out your boat (length, console, seating and color) is on the way."),
    "gallery": ("Gallery", "Photos of finished boats and boats on the water are on the way."),
    "about": ("About", "The story behind Unreel Jet Boats is on the way."),
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
    page(key, f"{name} | Unreel Jet Boats", f"{name} from Unreel Jet Boats, coming soon.", key, body)


# ---------- Contact ----------
lengths = "\n".join(f'                <option value="{n} ft">{n} ft</option>' for n in range(10, 25))
CONTACT = f"""
  <main class="contact-page">
    <div class="contact-intro">
      <span class="label">Contact</span>
      <h1>Start an inquiry</h1>
      <p class="muted">Tell us about the boat you want and how you'll use it. Rough ideas are fine. We'll get back to you to talk it through.</p>
      <ul>
        <li>Every boat is built to order, 10 to 24 feet</li>
        <li>Built in British Columbia</li>
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
        <div class="row">
          <div class="field">
            <label for="length">Length</label>
            <select id="length" name="length">
                <option value="Not sure yet">Not sure yet</option>
{lengths}
            </select>
          </div>
          <div class="field">
            <label for="layout">Layout</label>
            <select id="layout" name="layout">
              <option value="Not sure yet">Not sure yet</option>
              <option>Tiller</option>
              <option>Side console</option>
              <option>Center console</option>
              <option>Walk-through windshield</option>
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
"""
page("contact", "Contact | Unreel Jet Boats",
     "Send Unreel Jet Boats an inquiry about a custom aluminum jet boat.", "contact", CONTACT)


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
page("thanks", "Thanks | Unreel Jet Boats", "Your inquiry was sent.", "", THANKS)

print("built", sorted(p.name for p in ROOT.glob("*.html")))
