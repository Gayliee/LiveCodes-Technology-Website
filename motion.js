// LiveCodes Technology (storytelling version): scroll choreography with GSAP + ScrollTrigger +
// SplitText + Lenis, in the spirit of the Henrietta Said reference site.
// Without these libraries, or with reduced motion on, every chapter shows as a plain
// coloured section in its final state.

(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  const hasSplit = !!window.SplitText;
  if (hasSplit) gsap.registerPlugin(SplitText);
  document.documentElement.classList.add("js-motion");

  const expo = "expo.out";

  // ---------- Smooth scrolling (Lenis), wired to ScrollTrigger ----------
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

    document.addEventListener("click", (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute("href");
      const target = id === "#top" ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      const isChapter = target !== 0 && target.classList.contains("chapter");
      lenis.scrollTo(target, { offset: target === 0 || isChapter ? 0 : -84 });
      if (target !== 0) {
        history.replaceState(null, "", id);
        const focusable = target.querySelector("h2, h3") || target;
        focusable.setAttribute("tabindex", "-1");
        focusable.focus({ preventScroll: true });
      }
    });
  }

  const splitWords = (el) => {
    if (!hasSplit) return [el];
    return SplitText.create(el, { type: "lines,words", mask: "lines", aria: "auto" }).words;
  };
  const fadeUp = { y: 28, autoAlpha: 0, duration: 0.9, ease: expo };

  // ---------- Story: pinned colour stage on wide screens ----------
  const story = document.querySelector(".story");
  const stage = story.querySelector(".story-stage");
  const stageScreens = story.querySelector(".stage-screens");
  const wordEl = story.querySelector(".stage-word span");
  const chapters = [...story.querySelectorAll(".chapter")];
  const screens = chapters.map((ch) => ch.querySelector(".ui"));
  const progressLinks = [...story.querySelectorAll(".story-progress a")];
  const wide = window.matchMedia("(min-width: 901px)");
  let active = -1;
  let screenTl = null;

  function setPinned(on) {
    story.classList.toggle("story--pinned", on);
    screens.forEach((ui, i) => {
      gsap.set(ui, { clearProps: "all" });
      ui.classList.remove("is-active");
      (on ? stageScreens : chapters[i].querySelector(".chapter-screen")).append(ui);
    });
    active = -1;
    activate(Math.max(0, chapters.findIndex((ch) => ch.getBoundingClientRect().bottom > innerHeight * 0.55)));
    ScrollTrigger.refresh();
  }

  // Each mock screen plays a short "this is working" sequence when its chapter arrives.
  function playScreen(ui) {
    if (screenTl) screenTl.progress(1).kill();
    screenTl = gsap.timeline();
    screenTl.from(ui.querySelectorAll("[data-anim]"), { y: 14, autoAlpha: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" }, 0.15);
    ui.querySelectorAll("[data-bar]").forEach((bar) => {
      const v = parseFloat(getComputedStyle(bar).getPropertyValue("--v")) || 1;
      screenTl.fromTo(bar, { scaleX: 0 }, { scaleX: v, duration: 1.1, ease: "power3.out" }, 0.35);
    });
    ui.querySelectorAll("[data-count]").forEach((el) => {
      const n = { v: 0 };
      const end = Number(el.dataset.count);
      screenTl.to(n, {
        v: end, duration: 1.2, ease: "power2.out",
        onUpdate: () => { el.textContent = "₱" + n.v.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
      }, 0.5);
    });
  }

  function activate(i) {
    if (i === active || i < 0) return;
    const prev = active;
    active = i;
    const ch = chapters[i];
    progressLinks.forEach((a, j) => (j === i ? a.setAttribute("aria-current", "step") : a.removeAttribute("aria-current")));

    if (story.classList.contains("story--pinned")) {
      stage.style.backgroundColor = getComputedStyle(ch).getPropertyValue("--bg").trim();
      stage.dataset.theme = ch.classList.contains("theme-dark") ? "dark" : "light";

      // Giant word: old one lifts away, new one rises in.
      gsap.timeline()
        .to(wordEl, { yPercent: -40, autoAlpha: 0, duration: 0.25, ease: "power2.in" })
        .call(() => { wordEl.textContent = ch.dataset.word; })
        .fromTo(wordEl, { yPercent: 50, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: expo });

      // Screens crossfade inside the device.
      if (prev >= 0) {
        screens[prev].classList.remove("is-active");
        gsap.to(screens[prev], { autoAlpha: 0, y: -24, duration: 0.3, ease: "power2.in" });
      }
      screens[i].classList.add("is-active");
      gsap.fromTo(screens[i], { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: expo, delay: prev >= 0 ? 0.15 : 0 });
    }
    playScreen(screens[i]);
  }

  chapters.forEach((ch, i) => {
    ScrollTrigger.create({
      trigger: ch, start: "top 55%", end: "bottom 55%",
      onToggle: (self) => self.isActive && activate(i),
    });
  });

  // Progress pill shows only while the stage is pinned in view.
  ScrollTrigger.create({
    trigger: story, start: "top top", end: "bottom bottom",
    toggleClass: { targets: story, className: "is-inview" },
  });

  // The giant word drifts sideways and the device floats as the story scrolls.
  gsap.fromTo(wordEl.parentElement, { xPercent: 4 }, {
    xPercent: -22, ease: "none",
    scrollTrigger: { trigger: story, start: "top top", end: "bottom bottom", scrub: 1 },
  });
  gsap.fromTo(".stage-device", { rotate: -3, y: 24 }, {
    rotate: 2, y: -24, ease: "none",
    scrollTrigger: { trigger: story, start: "top top", end: "bottom bottom", scrub: 1 },
  });

  setPinned(wide.matches);
  wide.addEventListener("change", (e) => setPinned(e.matches));

  // Chapter text rises in as each chapter scrolls into place.
  chapters.forEach((ch) => {
    gsap.from(ch.querySelectorAll(".chapter-text > *"), {
      ...fadeUp, stagger: 0.08,
      scrollTrigger: { trigger: ch, start: "top 70%", once: true },
    });
  });

  // ---------- Everything that depends on final font metrics ----------
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    // Hero: words rise out of their lines, then the tablet surges up over the headline.
    gsap.timeline({ defaults: { ease: expo } })
      .from(splitWords(document.querySelector(".hero-title")), { yPercent: 110, duration: 1.1, stagger: 0.05 })
      .from(".hero-sub", fadeUp, "-=0.8")
      .from(".hero-actions", fadeUp, "-=0.75")
      .from(".hero-demo", { y: 220, rotate: -6, autoAlpha: 0, duration: 1.5 }, 0.35)
      // clearProps hands the transform back to CSS so the header can still tuck away on scroll.
      .from(".site-header .header-bar", { y: -30, autoAlpha: 0, duration: 0.9, clearProps: "transform,opacity,visibility" }, 0.2)
      .from(".fab-call", { scale: 0, duration: 0.6, ease: "back.out(2)" }, 1);

    // Scrolling away: the headline sinks back while the tablet keeps coming forward.
    gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } })
      .to(".hero-copy", { y: -120, autoAlpha: 0.2, ease: "none" }, 0)
      // Moves the inner device so it doesn't fight the intro tween on .hero-demo.
      .to(".hero-demo .device", { y: -60, scale: 1.06, ease: "none" }, 0);

    // Section headings: words rise out of a mask.
    document.querySelectorAll(".services-intro h2, .why h2, .steps h3").forEach((h) => {
      gsap.from(splitWords(h), {
        yPercent: 110, duration: 1, stagger: 0.05, ease: expo,
        scrollTrigger: { trigger: h, start: "top 85%", once: true },
      });
    });
    gsap.from(".services-intro .lead", { ...fadeUp, scrollTrigger: { trigger: ".services-intro", start: "top 80%", once: true } });

    ScrollTrigger.batch(".why-grid li", {
      start: "top 85%", once: true,
      onEnter: (items) => gsap.from(items, { ...fadeUp, stagger: 0.1 }),
    });
    ScrollTrigger.batch(".steps li", {
      start: "top 88%", once: true,
      onEnter: (items) => gsap.from(items, { ...fadeUp, stagger: 0.12 }),
    });

    // Contact: the giant line slides across as the section scrolls through.
    gsap.fromTo(".contact-title", { xPercent: 18 }, {
      xPercent: -4, ease: "none",
      scrollTrigger: { trigger: ".contact", start: "top bottom", end: "top 20%", scrub: 1 },
    });
    gsap.from(".contact .lead, .contact-links li", {
      ...fadeUp, stagger: 0.08,
      scrollTrigger: { trigger: ".contact-inner", start: "top 85%", once: true },
    });
    gsap.from(".contact-form", {
      y: 80, autoAlpha: 0, duration: 1.2, ease: expo,
      scrollTrigger: { trigger: ".contact-form", start: "top 90%", once: true },
    });
    gsap.from(".footer-inner > *", {
      ...fadeUp, y: 16, stagger: 0.08,
      scrollTrigger: { trigger: ".site-footer", start: "top 95%", once: true },
    });

    ScrollTrigger.refresh();
  });

  // ---------- Ticker: follows scroll direction and speeds up with scroll velocity ----------
  const track = document.querySelector(".ticker-track");
  if (track) {
    const loop = gsap.to(track, { xPercent: -50, duration: 36, ease: "none", repeat: -1 });
    let settle;
    ScrollTrigger.create({
      trigger: ".ticker", start: "top bottom", end: "bottom top",
      onUpdate(self) {
        const boost = gsap.utils.clamp(1, 5, 1 + Math.abs(self.getVelocity()) / 350);
        gsap.to(loop, { timeScale: self.direction * boost, duration: 0.2, overwrite: true });
        clearTimeout(settle);
        settle = setTimeout(() => gsap.to(loop, { timeScale: self.direction, duration: 0.8, overwrite: true }), 120);
      },
    });
  }

  // ---------- Hero tablet: new order lines slide in ----------
  const lines = document.querySelector(".pos-lines");
  let lastCount = 0;
  if (lines) {
    new MutationObserver(() => {
      const items = lines.children;
      if (items.length > lastCount) gsap.from(items[items.length - 1], { x: 14, autoAlpha: 0, duration: 0.35, ease: "power3.out" });
      lastCount = items.length;
    }).observe(lines, { childList: true });
  }
})();
