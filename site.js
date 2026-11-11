/* The Lincoln Media — studio site motion.
 * Smooth scroll (Lenis) + scroll-driven animation (GSAP ScrollTrigger):
 * rising headlines, words that light up as you scroll, a pinned horizontal work gallery,
 * a pinned five-step process, count-up stats, velocity-reactive marquees, a testimonial
 * slider, magnetic buttons, and the glossy blob drifting to each section.
 * Used by the home page (after the guided experience) and by the inner pages. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  let lenis = null, started = false;

  /* ---------- text splitting ---------- */
  function splitChars(el) {
    if (el.dataset.splitDone) return $$(".ch", el);
    el.dataset.splitDone = 1;
    const lines = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = lines.map((line) => {
      const tmp = document.createElement("div"); tmp.innerHTML = line;
      const words = tmp.textContent.trim().split(/\s+/).filter(Boolean);
      const inner = words.map((w) => `<span class="wd">${[...w].map((c) => `<span class="ch">${c.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span>`).join("")}</span>`).join('<span class="sp"> </span>');
      return `<span class="ln"><span class="ln-i">${inner}</span></span>`;
    }).join("");
    el.setAttribute("aria-label", lines.map((l) => { const d = document.createElement("div"); d.innerHTML = l; return d.textContent.trim(); }).join(" "));
    return $$(".ch", el);
  }
  function splitWords(el) {
    if (el.dataset.wordsDone) return $$(".w", el);
    el.dataset.wordsDone = 1;
    const out = [];
    const walk = (node, tail) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { out.push(document.createTextNode(" ")); return; }
            const s = document.createElement("span"); s.className = "w" + (tail ? " tail" : ""); s.textContent = part; out.push(s);
          });
        } else walk(n, tail || n.hasAttribute?.("data-tail"));
      });
    };
    walk(el, false);
    el.textContent = ""; out.forEach((n) => el.appendChild(n));
    return $$(".w", el);
  }

  /* ---------- smooth scroll ---------- */
  function startLenis() {
    if (lenis || reduced || !window.Lenis) return;
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", (e) => { ScrollTrigger.update(); window.LM && LM.velocity(e.velocity); });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    // Pinned sections change the page length — keep the smooth scroller's limits in sync
    ScrollTrigger.addEventListener("refresh", () => lenis.resize());
  }
  function scrollTo(target, instant) {
    if (lenis) { lenis.resize(); lenis.scrollTo(target, instant ? { immediate: true, force: true } : { offset: 0, duration: 1.4 }); }
    else (typeof target === "number" ? window.scrollTo({ top: target, behavior: "smooth" }) : $(target)?.scrollIntoView({ behavior: "smooth" }));
  }
  // In-page anchors go through the smooth scroller
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute("href"); if (id.length < 2) return;
    const el = id === "#top" ? document.body : $(id); if (!el) return;
    if (document.body.classList.contains("locked") && el.closest("#site")) return;
    e.preventDefault(); scrollTo(id === "#top" ? 0 : el);
  });

  /* ---------- section tracking: blob position, nav highlight, HUD index ---------- */
  function trackSections(root) {
    const secs = $$("[data-blob]", root);
    const idx = $("#secIndex"), rail = $("#scrollRail");
    secs.forEach((sec, i) => {
      const [x, y, s] = sec.dataset.blob.split(",").map(Number);
      ScrollTrigger.create({
        trigger: sec, start: "top 55%", end: "bottom 55%",
        onToggle: (self) => {
          if (!self.isActive) return;
          window.LM && LM.blob(x, y, s);
          if (idx) idx.innerHTML = `<b>${String(i + 1).padStart(2, "0")}</b> / ${sec.dataset.label || ""}`;
          $$(".site-nav a").forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + sec.id));
        },
      });
    });
    if (rail) ScrollTrigger.create({ trigger: root, start: "top top", end: "bottom bottom", onUpdate: (st) => (rail.style.transform = `scaleY(${st.progress})`) });
  }

  /* ---------- reveals ---------- */
  function headlines(root) {
    $$("[data-split]", root).forEach((el) => {
      const chars = splitChars(el);
      if (reduced) return;
      gsap.from(chars, {
        yPercent: 118, rotate: 6, opacity: 0, duration: 1.1, ease: "expo.out", stagger: { each: 0.022 },
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });
  }
  function litWords(root) {
    $$("[data-words]", root).forEach((el) => {
      const words = splitWords(el);
      if (reduced) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 42%", scrub: 0.6 } });
      words.forEach((w, i) => tl.to(w, { color: w.classList.contains("tail") ? "#36e4d0" : "#eef1f7", duration: 1, ease: "none" }, i * 0.35));
    });
  }
  function media(root) {
    $$("[data-reveal]", root).forEach((el) => {
      if (reduced) return;
      gsap.fromTo(el, { clipPath: "inset(18% 12% 18% 12%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: el, start: "top 95%", end: "top 35%", scrub: 0.6 } });
    });
    $$("[data-parallax]", root).forEach((img) => {
      if (reduced) return;
      gsap.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
    $$("[data-fade]", root).forEach((el) => {
      if (reduced) return;
      gsap.from(el, { y: 50, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } });
    });
  }

  /* ---------- work: pinned horizontal gallery ---------- */
  function work(root) {
    const wrap = $("#hscroll", root), track = $("#hscrollTrack", root);
    if (!wrap || !track) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
      const dist = () => track.scrollWidth - innerWidth;
      const tween = gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: wrap, start: "center center", end: () => "+=" + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      // Images drift inside their frames as they cross the screen
      $$(".card img", track).forEach((img) => gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: "none", scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: "left right", end: "right left", scrub: true } }));
      $$(".card", track).forEach((card) => gsap.from(card, { y: 80, rotate: 2, opacity: 0.2, ease: "none", scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 95%", end: "left 55%", scrub: true } }));
    });
  }

  /* ---------- services accordion ---------- */
  function accordion(root) {
    $$(".acc-item", root).forEach((item) => {
      const head = $(".acc-head", item), body = $(".acc-body", item);
      head.addEventListener("click", () => {
        const open = !item.classList.contains("open");
        $$(".acc-item.open", root).forEach((o) => { if (o !== item) { o.classList.remove("open"); $(".acc-head", o).setAttribute("aria-expanded", "false"); gsap.to($(".acc-body", o), { height: 0, duration: 0.6, ease: "expo.inOut" }); } });
        item.classList.toggle("open", open);
        head.setAttribute("aria-expanded", String(open));
        gsap.to(body, { height: open ? "auto" : 0, duration: 0.8, ease: "expo.inOut", onComplete: () => ScrollTrigger.refresh() });
        if (open) gsap.from($$(".chips li", body), { y: 16, opacity: 0, stagger: 0.025, duration: 0.5, delay: 0.15, ease: "power3.out" });
        window.LM && LM.sfx("select");
      });
      head.addEventListener("mouseenter", () => window.LM && LM.sfx("tick"));
    });
  }

  /* ---------- process: pinned, five steps ---------- */
  function processSteps(root) {
    const sec = $(".s-process", root); if (!sec) return;
    const steps = $$(".process-steps li", sec), num = $("#processNum"), fill = $("#processFill");
    let cur = 0;
    const show = (i) => {
      if (i === cur) return;
      const dir = i > cur ? 1 : -1, prev = steps[cur], next = steps[i];
      // Stop every running/delayed step animation first, so fast scrolling can never leave two steps on screen
      steps.forEach((s) => { gsap.killTweensOf(s); if (s !== prev && s !== next) gsap.set(s, { autoAlpha: 0, y: 0 }); });
      gsap.to(prev, { autoAlpha: 0, y: -40 * dir, duration: 0.3, ease: "power3.in" });
      gsap.fromTo(next, { autoAlpha: 0, y: 50 * dir }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out", delay: 0.12 });
      gsap.killTweensOf(num);
      gsap.to(num, { yPercent: -110 * dir, duration: 0.25, ease: "power3.in", onComplete: () => { num.textContent = String(i + 1).padStart(2, "0"); gsap.fromTo(num, { yPercent: 110 * dir }, { yPercent: 0, duration: 0.5, ease: "expo.out" }); } });
      steps.forEach((s, k) => s.classList.toggle("is-on", k === i));
      cur = i;
    };
    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.create({
        trigger: sec, start: "top top", end: "+=" + steps.length * 70 + "%", pin: $(".process-pin", sec), scrub: true,
        onUpdate: (st) => {
          fill.style.transform = `scaleY(${0.2 + st.progress * 0.8})`;
          show(Math.min(steps.length - 1, Math.floor(st.progress * steps.length)));
        },
      });
    });
  }

  /* ---------- video testimonials: a template player until real client videos exist ---------- */
  function videoTestimonials(root) {
    const cards = $$(".vt", root); if (!cards.length) return;
    const PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg>', PAUSE = '<svg viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';
    const m = document.createElement("div"); m.className = "vt-modal"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true");
    m.innerHTML = `<div class="vt-player"><img alt=""><span class="vt-badge mono">SAMPLE · CLIENT VIDEO PLACEHOLDER</span><button class="vt-close" aria-label="Close">×</button>
      <p class="vt-cap"></p><p class="vt-who"><b></b><small></small></p>
      <div class="vt-ctrl"><button class="vt-toggle" aria-label="Pause"></button><div class="vt-bar"><i></i></div><span class="vt-clock mono">0:00</span></div></div>`;
    document.body.appendChild(m);
    const img = $("img", m), cap = $(".vt-cap", m), bar = $(".vt-bar i", m), clock = $(".vt-clock", m), tog = $(".vt-toggle", m);
    let raf = 0, t0 = 0, played = 0, playing = false, dur = 1, words = [];
    const fmt = (s) => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
    const frame = (now) => {
      const p = Math.min(1, (played + (playing ? (now - t0) / 1000 : 0)) / 12);   // a 12s demo stands in for the clip
      bar.style.width = p * 100 + "%"; clock.textContent = fmt(p * dur) + " / " + fmt(dur);
      words.forEach((w, i) => w.classList.toggle("on", i < p * words.length * 1.15));
      if (p >= 1) { setPlaying(false); played = 0; return; }
      if (playing) raf = requestAnimationFrame(frame);
    };
    const setPlaying = (on) => {
      const now = performance.now();
      if (!on && playing) played += (now - t0) / 1000;
      playing = on; t0 = now; tog.innerHTML = on ? PAUSE : PLAY; tog.setAttribute("aria-label", on ? "Pause" : "Play");
      cancelAnimationFrame(raf); if (on) raf = requestAnimationFrame(frame);
    };
    const open = (card) => {
      const d = card.dataset; img.src = `https://images.unsplash.com/photo-${d.img}?auto=format&fit=crop&w=800&h=1400&q=75`;
      cap.innerHTML = ""; words = d.quote.split(" ").map((w) => { const s = document.createElement("span"); s.textContent = w + " "; cap.appendChild(s); return s; });
      $(".vt-who b", m).textContent = d.name; $(".vt-who small", m).textContent = d.role;
      const [mm, ss] = d.time.split(":"); dur = +mm * 60 + +ss; played = 0; bar.style.width = "0";
      m.classList.add("open"); window.LM && window.LM.sfx && window.LM.sfx("select"); setPlaying(true); $(".vt-close", m).focus();
    };
    const close = () => { setPlaying(false); m.classList.remove("open"); };
    cards.forEach((c) => c.addEventListener("click", () => open(c)));
    tog.addEventListener("click", () => { if (!playing && played === 0) bar.style.width = "0"; setPlaying(!playing); });
    $(".vt-close", m).addEventListener("click", close);
    m.addEventListener("click", (e) => { if (e.target === m) close(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && m.classList.contains("open")) close(); });
  }

  /* ---------- industries: cards rise in, one after another ---------- */
  function industries(root) {
    $$(".ind", root).forEach((card, i) => ScrollTrigger.create({ trigger: card, start: "top 90%", once: true,
      onEnter: () => setTimeout(() => card.classList.add("in"), (i % 3) * 120) }));
  }

  /* ---------- numbers ---------- */
  function counters(root) {
    $$("[data-count]", root).forEach((el) => {
      const end = +el.dataset.count, o = { v: 0 };
      const fmt = (v) => Math.round(v).toLocaleString("en-US");
      if (reduced) { el.textContent = fmt(end); return; }
      ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => gsap.to(o, { v: end, duration: 2.2, ease: "expo.out", onUpdate: () => (el.textContent = fmt(o.v)) }) });
    });
  }

  /* ---------- marquees speed up with scroll velocity ---------- */
  function marquees(root) {
    const rows = $$(".marquee", root).map((m) => {
      const track = $(".marquee-track", m);
      track.innerHTML += track.innerHTML; // seamless loop
      return { track, dir: +m.dataset.dir || 1, x: 0 };
    });
    if (!rows.length) return;
    let boost = 0;
    if (lenis) lenis.on("scroll", (e) => (boost = Math.min(30, Math.abs(e.velocity))));
    gsap.ticker.add((t, dt) => {
      boost *= 0.94;
      rows.forEach((r) => {
        const half = r.track.scrollWidth / 2;
        r.x -= r.dir * (0.06 + boost * 0.02) * dt;
        if (r.x <= -half) r.x += half; if (r.x > 0) r.x -= half;
        r.track.style.transform = `translate3d(${r.x}px,0,0)`;
      });
    });
  }

  /* ---------- testimonials ---------- */
  function quotes(root) {
    const items = $$(".quote", root); if (!items.length) return;
    const count = $("#quoteCount"), bar = $("#quoteBar");
    let i = 0, timer = null, barTween = null;
    const go = (n) => {
      const prev = items[i]; i = (n + items.length) % items.length; const next = items[i];
      if (prev !== next) {
        gsap.to(prev, { autoAlpha: 0, y: -30, duration: 0.5, ease: "power3.in" });
        const chars = $$("blockquote", next);
        gsap.fromTo(next, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", delay: 0.3 });
        gsap.from(chars, { filter: "blur(10px)", duration: 1, delay: 0.3 });
      }
      items.forEach((q, k) => q.classList.toggle("is-on", k === i));
      count.textContent = `${String(i + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
      barTween && barTween.kill();
      barTween = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 7, ease: "none" });
      clearTimeout(timer); timer = setTimeout(() => go(i + 1), 7000);
    };
    $("#quotePrev")?.addEventListener("click", () => go(i - 1));
    $("#quoteNext")?.addEventListener("click", () => go(i + 1));
    ScrollTrigger.create({ trigger: items[0].parentElement, start: "top 80%", once: true, onEnter: () => go(0) });
  }

  /* ---------- magnetic buttons ---------- */
  function magnetic() {
    if (matchMedia("(hover: none)").matches) return;
    $$(".magnetic").forEach((b) => {
      if (b.dataset.mag) return; b.dataset.mag = 1;
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: "power3.out" });
      });
      b.addEventListener("pointerleave", () => gsap.to(b, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, .4)" }));
    });
  }

  /* ---------- clock in the hero HUD ---------- */
  function clock() {
    const c = $("#heroClock"); if (!c) return;
    const tick = () => (c.textContent = "NYC " + new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour12: false }));
    tick(); setInterval(tick, 1000);
  }

  /* ---------- boot ---------- */
  function init(root = $("#site")) {
    if (started || !root || !hasGsap) return;
    started = true;
    gsap.registerPlugin(ScrollTrigger);
    startLenis();
    // The guided experience sits above the studio site: leaving it switches the 3D scene to "studio" mode
    const exp = $("#experience");
    if (exp && !document.body.classList.contains("skipped")) ScrollTrigger.create({ trigger: exp, start: "bottom 60%", onEnter: () => window.LM && LM.siteMode(true), onLeaveBack: () => window.LM && LM.siteMode(false) });
    else if (window.LM) LM.siteMode(true);
    // Pinned sections first, so every trigger further down accounts for their extra scroll length
    work(root); processSteps(root);
    trackSections(root);
    headlines(root); litWords(root); media(root);
    accordion(root); counters(root); marquees(root); quotes(root); videoTestimonials(root); industries(root);
    ScrollTrigger.sort();
    magnetic(); clock();
    // Images load lazily and change heights — re-measure once they arrive
    $$("img", root).forEach((img) => !img.complete && img.addEventListener("load", () => ScrollTrigger.refresh(), { once: true }));
    ScrollTrigger.refresh();
    window.addEventListener("load", () => ScrollTrigger.refresh());
    // A deep link (index.html#services) waits for the layout to settle, then jumps there
    if (pendingTarget) { const t = pendingTarget; pendingTarget = null; setTimeout(() => scrollTo(t, true), 350); }
  }
  let pendingTarget = null;
  function goTo(target) { if (started) scrollTo(target, true); else pendingTarget = target; }

  window.LMSite = { init, scrollTo, goTo };
  // Inner pages have no guided experience: start straight away
  if (document.body.dataset.page && document.body.dataset.page !== "home") {
    document.addEventListener("DOMContentLoaded", () => init($("#site")));
    if (document.readyState !== "loading") init($("#site"));
  }
})();
