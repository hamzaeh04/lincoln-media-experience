#!/usr/bin/env python3
"""Builds the inner pages of The Lincoln Media site (services, work, about, policies).

Run from the project root:   python3 scripts/build-pages.py
Pages are written as folder/index.html so the URLs match the old site
(/services/seo, /work/aureum, /about-us …). Edit the data below and re-run.
"""
import html
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = "16"  # cache-busting version for css/js
UNSPLASH = "https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w={w}&q=80"
e = html.escape

# ---------------------------------------------------------------------------
# Content (from The Lincoln Media's existing site)
# ---------------------------------------------------------------------------
DISCIPLINES = [
    {
        "slug": "web-development", "name": "Web Development",
        "desc": "Fast, scalable websites and platforms on the stack that fits your business — from CMS builds to enterprise systems.",
        "children": [
            ("wordpress-development", "WordPress Development"), ("sharepoint-development", "SharePoint Development"),
            ("enterprise-development", "Enterprise Development"), ("sitecore-development", "Sitecore Development"),
            ("php-development", "PHP Development"), ("joomla-development", "Joomla Development"),
            ("asp-net-development", "ASP.NET Development"), ("cms-website-development", "CMS Development"),
            ("drupal-web-development", "Drupal Development"), ("laravel-web-development", "Laravel Development"),
            ("python-development", "Python Development"), ("angularjs-development", "AngularJS Development"),
            ("website-maintenance-services", "Website Maintenance Services"), ("whatsapp-business-integration", "WhatsApp Integration"),
        ],
    },
    {
        "slug": "digital-marketing", "name": "Digital Marketing",
        "desc": "SEO, paid media and social built on data — putting your brand in front of the right people and turning attention into revenue.",
        "children": [
            ("social-media-marketing", "Social Media Marketing"), ("social-media-optimization", "Social Media Optimization"),
            ("pay-per-click", "Pay Per Click"), ("seo", "SEO"), ("conversion-rate-optimization", "Conversion Rate Optimization"),
            ("email-marketing", "Email Marketing"), ("gmb-optimization-services", "GMB Optimization"),
            ("content-marketing", "Content Marketing"), ("online-reputation-management", "Online Reputation Management"),
        ],
    },
    {
        "slug": "ecommerce-web-development", "name": "E-commerce Web Development",
        "desc": "Conversion-obsessed stores on Shopify, Magento, WooCommerce and more — engineered to sell around the clock.",
        "nested": True,  # children live under /services/ecommerce-web-development/<slug>
        "children": [
            ("woo-commerce", "WooCommerce"), ("mirakl", "Mirakl"), ("magento", "Magento"),
            ("big-commerce", "BigCommerce"), ("shopify", "Shopify"), ("shopify-plus", "Shopify Plus"),
        ],
    },
    {
        "slug": "branding-communication-agency", "name": "Digital Branding & Communication",
        "desc": "Identities, packaging and brand systems with a point of view — instantly recognisable, impossible to forget.",
        "children": [
            ("brochure-design", "Company Profile & Brochure Design"), ("business-card-design", "Business Card Design"),
            ("corporate-identity-design", "Corporate Identity Design"), ("packaging-designs", "Packaging Designs"),
            ("logo-design", "Logo Design"),
        ],
    },
    {
        "slug": "ai-saas-mobile", "name": "AI, SaaS & Mobile Apps",
        "desc": "Custom AI that does real work inside your business, SaaS platforms built to onboard, bill and scale, and native apps for iOS and Android that feel effortless.",
        "children": [
            ("ai-systems", "AI Systems"), ("saas-development", "SaaS Development"), ("mobile-app-development", "Mobile App Development"),
        ],
        "child_desc": {
            "ai-systems": "Assistants that know your data, agents that handle the busywork, and models wired into the tools your team already uses.",
            "saas-development": "Multi-tenant platforms engineered from day one to onboard, bill and scale — from an MVP that proves the idea to an enterprise product.",
            "mobile-app-development": "Native and cross-platform apps for iOS and Android, designed to feel effortless and built to survive launch day and everything after.",
        },
    },
]

WORK = [
    ("belgravia-london", "Belgravia London", "Luxury Real Estate", "2025", "Web Design · Development · SEO",
     "A cinematic digital home for prime London property — where architecture leads and the interface steps aside.", "1531297484001-80022131f5a1"),
    ("betterhomes", "BetterHomes", "Property Platform", "2025", "Product Design · Development",
     "Search, compare and book viewings in seconds. A property platform rebuilt around speed.", "1460925895917-afdab827c52f"),
    ("cryptosouk", "CryptoSouk", "Fintech", "2024", "UX/UI · Web App · Branding",
     "A trading experience that makes complex markets feel calm, legible and trustworthy.", "1550751827-4bd374c3f58b"),
    ("the-bagel-shak", "The Bagel Shak", "Food & Beverage", "2024", "Branding · Packaging · E-commerce",
     "A loud, hungry brand and an ordering flow that gets bagels into hands faster.", "1563986768609-322da13575f3"),
    ("bike-store", "Bike Store", "Retail E-commerce", "2024", "Shopify Plus · CRO",
     "A performance storefront for performance machines — configurators, rich product stories, zero friction.", "1555066931-4365d14bab8c"),
    ("polly", "Polly", "SaaS", "2023", "Product Design · Front-end",
     "Turning a dense analytics product into a dashboard teams actually enjoy opening.", "1551288049-bebda4e38f71"),
    ("upmatch", "Upmatch", "Recruitment", "2023", "Web Platform · SEO · PPC",
     "A hiring platform that matches people to roles — and recruiters to their sanity.", "1517694712202-14dd9538aa97"),
    ("aureum", "Aureum", "Fine Jewellery", "2023", "Shopify Plus · Art Direction · Email",
     "Quiet luxury, loud results. A Shopify Plus flagship for handcrafted fine jewellery.", "1512941937669-90a1b58e7e9c"),
]

POLICIES = [
    ("terms-and-condition", "Terms & Conditions", "The terms that govern use of our website and services."),
    ("privacy-policy", "Privacy Policy", "How we collect, use and protect your information."),
    ("refund-policy", "Refund Policy", "Our policy on refunds, cancellations and revisions."),
]

STEPS = [
    ("Discover", "Workshops, audits and research. We find the real problem before we touch a pixel."),
    ("Strategy", "Positioning, journeys and a measurable plan everyone signs off on."),
    ("Design", "Systems, prototypes and motion — tested with real people, refined until it sings."),
    ("Build", "Clean, fast, accessible code. QA'd across every device that matters."),
    ("Launch & Grow", "Zero-drama launches, then SEO, ads and CRO to compound the results."),
]


def child_url(d, slug):
    if d["slug"] == "ai-saas-mobile":
        return f"/services/ai-saas-mobile#{slug}"
    return f"/services/{d['slug']}/{slug}" if d.get("nested") else f"/services/{slug}"


# ---------------------------------------------------------------------------
# Shared chrome
# ---------------------------------------------------------------------------
def head(title, desc):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)} — The Lincoln Media</title>
<meta name="description" content="{e(desc)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&family=Unbounded:wght@500;700;800&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css?v={V}">
<link rel="stylesheet" href="/site.css?v={V}">
<link rel="stylesheet" href="/inner.css?v={V}">
</head>
"""


def header(active):
    def a(href, label, key):
        cls = ' class="on"' if key == active else ""
        return f'<a href="{href}"{cls}>{label}</a>'
    return f"""<body class="in-site inner" data-page="{active or 'inner'}">
<canvas id="field" aria-hidden="true"></canvas>
<div class="scanlines" aria-hidden="true"></div>
<div class="grain" aria-hidden="true"></div>
<div class="vignette" aria-hidden="true"></div>
<div class="frame" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
<div class="cursor" aria-hidden="true"></div>

<header class="hud">
  <a class="logo" href="/" aria-label="The Lincoln Media home"><span class="logo-text">THE&nbsp;LINCOLN<span>MEDIA</span></span></a>
  <nav class="site-nav" aria-label="Main">
    {a('/', 'Home', 'home')}{a('/about-us', 'About', 'about')}{a('/services', 'Services', 'services')}{a('/#work', 'Work', 'work')}{a('/#contact', 'Contact', 'contact')}
  </nav>
  <a class="btn btn-red btn-sm talk magnetic" href="/#contact"><span>Let's talk</span><i>↗</i></a>
  <button class="menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
</header>

<nav class="menu" id="menu" aria-hidden="true">
  <ul>
    <li><a href="/">01 &nbsp;Home</a></li>
    <li><a href="/about-us">02 &nbsp;About</a></li>
    <li><a href="/services">03 &nbsp;Services</a></li>
    <li><a href="/#work">04 &nbsp;Work</a></li>
    <li><a href="/#contact">05 &nbsp;Contact</a></li>
    <li><a href="/">06 &nbsp;Get your plan</a></li>
  </ul>
  <p class="mono">sales@thelincolnmedia.com &nbsp;·&nbsp; +1-332-222-3984 &nbsp;·&nbsp; New York</p>
</nav>

<main id="top">
<div class="site" id="site">
  <div class="scroll-rail" aria-hidden="true"><i id="scrollRail"></i></div>
  <p class="sec-index mono" id="secIndex" aria-hidden="true"><b>01</b> / </p>
"""


FOOTER = f"""
  <footer class="s-footer" data-blob="0,-0.9,0.95" data-label="FOOTER">
    <div class="foot-cols">
      <div><p class="mono foot-h">Overview</p><ul><li><a href="/about-us">About Us</a></li><li><a href="/services">Services</a></li><li><a href="/terms-and-condition">Terms &amp; Conditions</a></li><li><a href="/privacy-policy">Privacy Policy</a></li><li><a href="/refund-policy">Refund Policy</a></li></ul></div>
      <div><p class="mono foot-h">Web Solutions</p><ul><li><a href="/services/web-development">Web Development</a></li><li><a href="/services/digital-marketing">Digital Marketing</a></li><li><a href="/services/ecommerce-web-development">E-commerce Web Development</a></li><li><a href="/services/branding-communication-agency">Branding &amp; Communication</a></li><li><a href="/services/ai-saas-mobile">AI, SaaS &amp; Mobile Apps</a></li></ul></div>
      <div><p class="mono foot-h">Digital Marketing</p><ul><li><a href="/services/pay-per-click">PPC</a></li><li><a href="/services/seo">SEO</a></li><li><a href="/services/conversion-rate-optimization">CRO</a></li><li><a href="/services/content-marketing">Content Marketing</a></li><li><a href="/services/social-media-marketing">SMM</a></li><li><a href="/services/social-media-optimization">SMO</a></li><li><a href="/services/email-marketing">Email Marketing</a></li></ul></div>
      <div><p class="mono foot-h">Contact</p><ul><li><a href="tel:+13322223984">+1-332-222-3984</a></li><li><a href="https://wa.me/13322223984" target="_blank" rel="noopener">WhatsApp</a></li><li><a href="mailto:sales@thelincolnmedia.com">sales@thelincolnmedia.com</a></li><li>667 Madison Ave, Floor 4&amp;5,<br>New York, NY 10065</li></ul></div>
    </div>
    <p class="wordmark display" aria-label="The Lincoln Media"><span>The Lincoln</span> <span>Media</span></p>
    <div class="foot-base mono">
      <span>© <span id="year"></span> The Lincoln Media. All rights reserved.</span>
      <span>New York · Est. 2012</span>
      <a href="/">Get your build plan →</a>
      <a href="#top">Back to top ↑</a>
    </div>
  </footer>
</div>
</main>

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"></script>
<script src="/inner.js?v={V}"></script>
<script src="/site.js?v={V}"></script>
</body>
</html>
"""


def crumbs(*items):
    out = ['<a href="/">Home</a>']
    for href, label in items:
        out.append("<i>/</i>")
        out.append(f'<a href="{href}">{e(label)}</a>' if href else f"<span>{e(label)}</span>")
    return f'<nav class="crumbs" aria-label="Breadcrumb">{"".join(out)}</nav>'


def hero(eyebrow, title, lede, crumb_html, extra="", blob="2.6,0.3,1.4"):
    return f"""
  <section class="p-hero" id="home" data-blob="{blob}" data-label="{e(eyebrow.upper())}">
    {crumb_html}
    <p class="label"><i></i>{e(eyebrow)}</p>
    <h1 class="display" data-split>{e(title)}</h1>
    <p class="p-lede" data-fade>{e(lede)}</p>
    {extra}
  </section>
"""


def process_section():
    on = ' class="is-on"'
    items = "".join(
        f'<li{on if i == 0 else ""}><p class="mono">Step {i + 1}:</p><h3 class="display">{e(n)}</h3><p>{e(d)}</p></li>'
        for i, (n, d) in enumerate(STEPS)
    )
    return f"""
  <section class="s-process" id="process" data-blob="2.6,0,1.35" data-label="PROCESS">
    <div class="process-pin">
      <header class="sec-head"><p class="label"><i></i>How we work</p><h2 class="display" data-split>Five moves.<br>No wasted ones.</h2></header>
      <div class="process-stage">
        <div class="process-rail" aria-hidden="true"><i id="processFill"></i></div>
        <div class="process-num display" aria-hidden="true"><span id="processNum">01</span></div>
        <ol class="process-steps">{items}</ol>
      </div>
    </div>
  </section>
"""


def numbers_section():
    return """
  <section class="s-numbers" id="numbers" data-blob="0,-2.3,0.7" data-label="NUMBERS">
    <p class="label"><i></i>In numbers</p>
    <dl class="stats">
      <div class="stat"><dt class="mono">Projects delivered</dt><dd class="display"><span data-count="1200">0</span><em>+</em></dd></div>
      <div class="stat"><dt class="mono">Happy clients</dt><dd class="display"><span data-count="850">0</span><em>+</em></dd></div>
      <div class="stat"><dt class="mono">Years in the game</dt><dd class="display"><span data-count="12">0</span></dd></div>
      <div class="stat"><dt class="mono">Countries reached</dt><dd class="display"><span data-count="25">0</span><em>+</em></dd></div>
    </dl>
  </section>
"""


def cta_section(title="Let's create something unexpected.", lede="Tell us what you're building. We'll come back with a plan, a team and a timeline."):
    return f"""
  <section class="p-cta" id="contact" data-blob="2.9,-0.8,1.25" data-label="CONTACT">
    <p class="label"><i></i>Start a project</p>
    <h2 class="display" data-split>{e(title)}</h2>
    <p class="p-lede" data-fade>{e(lede)}</p>
    <div class="hero-ctas">
      <a class="btn btn-red magnetic" href="/#contact"><span>Start a project</span><i>↗</i></a>
      <a class="btn btn-ghost magnetic" href="/"><span>Get your AI build plan</span></a>
    </div>
  </section>
"""


def tiles(items, current=None):
    out = []
    for i, (href, title, text) in enumerate(items):
        cur = href == current
        tag = "div" if cur else "a"
        href_attr = "" if cur else f' href="{href}"'
        out.append(
            f'<{tag} class="tile{" is-current" if cur else ""}"{href_attr} data-fade><span class="mono">{i + 1:02d}{" — YOU ARE HERE" if cur else ""}</span>'
            f'<div><h3>{e(title)}</h3>{f"<p>{e(text)}</p>" if text else ""}</div><span class="round-arrow" aria-hidden="true">↗</span></{tag}>'
        )
    return f'<div class="tiles">{"".join(out)}</div>'


def write(path, content):
    full = os.path.join(ROOT, path.strip("/"), "index.html")
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f:
        f.write(content)
    return path


# ---------------------------------------------------------------------------
# Page builders
# ---------------------------------------------------------------------------
def services_hub():
    rows = []
    for i, d in enumerate(DISCIPLINES):
        chips = "".join(f'<li><a href="{child_url(d, s)}">{e(n)}</a></li>' for s, n in d["children"])
        rows.append(f"""
    <article class="disc" data-fade>
      <span class="idx">{i + 1:02d}</span>
      <h2 class="display"><a href="/services/{d['slug']}">{e(d['name'])}</a></h2>
      <div><p>{e(d['desc'])}</p><ul class="chips mono">{chips}</ul>
        <p style="margin-top:26px"><a class="link-arrow" href="/services/{d['slug']}">Explore {e(d['name'].lower())} <i>→</i></a></p></div>
    </article>""")
    body = hero("The Lincoln Media", "Services", "Web development, digital marketing, e-commerce and branding under one roof — plus AI, SaaS and mobile.",
                crumbs(("", "Services")))
    body += f"""
  <section class="s-services" id="services" data-blob="2.7,1.0,0.85" data-label="DISCIPLINES">
    <header class="sec-head"><p class="label"><i></i>What we do</p><h2 class="display" data-split>Five doors.<br>One team.</h2></header>
    {''.join(rows)}
  </section>
"""
    body += process_section() + numbers_section() + cta_section()
    return write("/services", head("Services", "Web development, digital marketing, e-commerce, branding, AI, SaaS and mobile apps from The Lincoln Media, New York.") + header("services") + body + FOOTER)


def discipline_page(d):
    descs = d.get("child_desc", {})
    items = [(child_url(d, s), n, descs.get(s, "")) for s, n in d["children"]]
    extra = '<div class="hero-ctas"><a class="btn btn-red magnetic" href="/#contact"><span>Start a project</span><i>↗</i></a><a class="btn btn-ghost magnetic" href="#capabilities"><span>See capabilities</span></a></div>'
    body = hero("Services", d["name"], d["desc"], crumbs(("/services", "Services"), ("", d["name"])), extra)
    if d["slug"] == "ai-saas-mobile":
        # This discipline has no sub-pages: each capability gets an anchor section on this page
        blocks = "".join(f"""
    <article class="disc" id="{s}" data-fade><span class="idx">{i + 1:02d}</span><h2 class="display">{e(n)}</h2><div><p>{e(descs[s])}</p>
      <p><a class="link-arrow" href="/">Get a build plan from our AI guide <i>→</i></a></p></div></article>""" for i, (s, n) in enumerate(d["children"]))
        body += f"""
  <section class="s-services" id="capabilities" data-blob="2.7,1.0,0.85" data-label="CAPABILITIES">
    <header class="sec-head"><p class="label"><i></i>Capabilities</p><h2 class="display" data-split>What we build</h2></header>
    {blocks}
  </section>
"""
    else:
        body += f"""
  <section id="capabilities" data-blob="2.7,1.0,0.85" data-label="CAPABILITIES">
    <header class="sec-head"><p class="label"><i></i>Capabilities ({len(items):02d})</p><h2 class="display" data-split>Pick your stack</h2></header>
    {tiles(items)}
  </section>
"""
    others = [(f"/services/{o['slug']}", o["name"], o["desc"]) for o in DISCIPLINES if o is not d]
    body += process_section()
    body += f"""
  <section id="more" data-blob="-2.6,0.8,0.9" data-label="MORE">
    <header class="sec-head"><p class="label"><i></i>Other disciplines</p><h2 class="display" data-split>Walk through<br>another door</h2></header>
    {tiles(others)}
  </section>
"""
    body += cta_section()
    return write(f"/services/{d['slug']}", head(d["name"], d["desc"]) + header("services") + body + FOOTER)


def child_page(d, slug, name):
    url = child_url(d, slug)
    lede = f"{name}, delivered by senior specialists. {d['desc']}"
    extra = '<div class="hero-ctas"><a class="btn btn-red magnetic" href="/#contact"><span>Start a project</span><i>↗</i></a><a class="btn btn-ghost magnetic" href="#related"><span>Related services</span></a></div>'
    extra += f'<div class="p-hero-meta"><span>Discipline<b>{e(d["name"])}</b></span><span>Team<b>Senior specialists</b></span><span>Studio<b>New York · Est. 2012</b></span></div>'
    body = hero(d["name"], name, lede, crumbs(("/services", "Services"), (f"/services/{d['slug']}", d["name"]), ("", name)), extra)
    body += numbers_section()
    body += process_section()
    items = [(f"/services/{d['slug']}", f"All {d['name']}", d["desc"])] + [(child_url(d, s), n, "") for s, n in d["children"]]
    body += f"""
  <section id="related" data-blob="-2.6,0.8,0.9" data-label="RELATED">
    <header class="sec-head"><p class="label"><i></i>More in {e(d['name'])}</p><h2 class="display" data-split>Related services</h2></header>
    {tiles(items, current=url)}
  </section>
"""
    body += cta_section()
    return write(url, head(name, lede) + header("services") + body + FOOTER)


def work_page(i):
    slug, name, sector, year, services, desc, img = WORK[i]
    nxt = WORK[(i + 1) % len(WORK)]
    extra = f'<div class="p-hero-meta"><span>Sector<b>{e(sector)}</b></span><span>Year<b>{year}</b></span><span>Services<b>{e(services)}</b></span></div>'
    body = hero(f"{sector} · {year}", name, desc, crumbs(("/#work", "Work"), ("", name)), extra, blob="2.8,1.4,0.7")
    body += f"""
  <section id="visual" data-blob="2.9,1.6,0.5" data-label="PROJECT">
    <figure class="media brackets case-media" data-reveal><img src="{UNSPLASH.format(id=img, w=2200)}" alt="{e(name)} — {e(sector)} project" data-parallax><span class="scan"></span></figure>
  </section>
  <section id="overview" data-blob="-2.7,0.4,0.95" data-label="OVERVIEW">
    <div class="case-grid">
      <dl class="case-facts" data-fade>
        <div><dt>Client</dt><dd>{e(name)}</dd></div>
        <div><dt>Sector</dt><dd>{e(sector)}</dd></div>
        <div><dt>Year</dt><dd>{year}</dd></div>
        <div><dt>Services</dt><dd>{e(services)}</dd></div>
      </dl>
      <div class="case-body">
        <p class="label"><i></i>The brief</p>
        <p class="display-ish" data-words style="margin-top:24px">{e(desc)}</p>
        <p class="case-note">◉ Full case study coming soon</p>
      </div>
    </div>
  </section>
  <section id="next" data-blob="-2.8,-0.6,0.9" data-label="NEXT">
    <a class="next-case" href="/work/{nxt[0]}">
      <figure class="media brackets" data-reveal><img src="{UNSPLASH.format(id=nxt[6], w=1400)}" alt="{e(nxt[1])} — {e(nxt[2])} project" loading="lazy"><span class="scan"></span></figure>
      <div><p class="label"><i></i>Next project</p><h2 class="display">{e(nxt[1])}</h2><p class="mono tags-line" style="margin-top:14px">{e(nxt[2])} · {nxt[3]}</p>
        <span class="round-arrow" style="margin-top:30px" aria-hidden="true">↗</span></div>
    </a>
  </section>
"""
    body += cta_section("Yours could be next.", "Eight brands, eight different problems. Tell us about yours.")
    return write(f"/work/{slug}", head(name, desc) + header("work") + body + FOOTER)


def about_page():
    extra = '<div class="hero-ctas"><a class="btn btn-red magnetic" href="/#contact"><span>Start a project</span><i>↗</i></a><a class="btn btn-ghost magnetic" href="/#work"><span>View work</span></a></div>'
    body = hero("The Lincoln Media", "About us", "A New York studio of designers, engineers and growth strategists.", crumbs(("", "About Us")), extra)
    body += """
  <section class="s-manifesto" id="manifesto" data-blob="-0.5,0.35,1.4" data-label="MANIFESTO">
    <p class="label"><i></i>Manifesto</p>
    <p class="manifesto-text display" data-words>Brands don't need more noise. They need moments people remember <span data-tail>— and the craft to build them.</span></p>
  </section>
  <section class="s-philosophy" id="about" data-blob="-2.6,-0.6,1.0" data-label="PHILOSOPHY">
    <p class="label"><i></i>Philosophy</p>
    <p class="philo-text display" data-words>Creativity, technology and strategy. <span data-tail>One team. Zero hand-offs.</span></p>
    <figure class="media brackets philo-img philo-img-a" data-reveal><img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80" alt="Team working together on laptops" loading="lazy" data-parallax><span class="scan"></span></figure>
    <figure class="media brackets philo-img philo-img-b" data-reveal><img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80" alt="Code on a screen" loading="lazy" data-parallax><span class="scan"></span></figure>
  </section>
"""
    body += numbers_section() + process_section()
    disc = [(f"/services/{d['slug']}", d["name"], d["desc"]) for d in DISCIPLINES]
    body += f"""
  <section id="disciplines" data-blob="2.7,1.0,0.85" data-label="DISCIPLINES">
    <header class="sec-head"><p class="label"><i></i>What we do</p><h2 class="display" data-split>Five disciplines.<br>One team.</h2></header>
    {tiles(disc)}
  </section>
  <section class="s-clients" id="clients" data-blob="0,2.6,0.45" data-label="CLIENTS">
    <p class="label"><i></i>Brands we've moved</p>
    <div class="marquee" data-dir="1"><div class="marquee-track display">{''.join(f'<span>{e(w[1])}</span><b>✦</b>' for w in WORK)}</div></div>
    <div class="marquee marquee-outline" data-dir="-1"><div class="marquee-track display">{''.join(f'<span>{e(w[1])}</span><b>✦</b>' for w in reversed(WORK))}</div></div>
  </section>
"""
    body += cta_section()
    return write("/about-us", head("About Us", "A New York studio of designers, engineers and growth strategists.") + header("about") + body + FOOTER)


def policy_page(slug, title, lede):
    body = hero("The Lincoln Media", title, lede, crumbs(("", title)), blob="2.8,1.2,0.8")
    body += f"""
  <section id="policy" data-blob="2.9,-1,0.7" data-label="POLICY">
    <div class="policy-box glass" data-fade>
      <h2>{e(title)}</h2>
      <!-- TODO: paste the approved {e(title)} text here before launch -->
      <p>The full {e(title.lower())} is being finalised and will be published here.</p>
      <p>In the meantime, if you have any questions, email <a href="mailto:sales@thelincolnmedia.com">sales@thelincolnmedia.com</a> or call <a href="tel:+13322223984">+1-332-222-3984</a>.</p>
    </div>
  </section>
"""
    return write(f"/{slug}", head(title, lede) + header(None) + body + FOOTER)


if __name__ == "__main__":
    pages = [services_hub(), about_page()]
    for d in DISCIPLINES:
        pages.append(discipline_page(d))
        if d["slug"] != "ai-saas-mobile":
            pages += [child_page(d, s, n) for s, n in d["children"]]
    pages += [work_page(i) for i in range(len(WORK))]
    pages += [policy_page(*p) for p in POLICIES]
    print(f"Built {len(pages)} pages")
    for p in pages:
        print("  " + p)
