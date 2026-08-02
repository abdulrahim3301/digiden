// Reloading mid-scroll would otherwise let the browser restore a nonzero
// scroll position before the hero pin measures its start, corrupting the
// whole scroll-driven sequence. Always start fresh at the top.
if ("scrollRestoration" in history) { history.scrollRestoration = "manual"; }
window.scrollTo(0, 0);

/* ============================================================
   PORTFOLIO DATA (dummy / placeholder brands for demonstration)
   ============================================================ */
const PORTFOLIO = [
  { name: "Solace Skincare", cat: "brand", tag: "Brand Design", desc: "Identity system + packaging" },
  { name: "Fernweh Travel", cat: "brand", tag: "Brand Design", desc: "Full 360° brand identity" },
  { name: "Bloom Bakehouse", cat: "social", tag: "Social Media", desc: "Content + community growth" },
  { name: "Rally Sports Club", cat: "social", tag: "Social Media", desc: "Membership growth content" },
  { name: "Meridian Legal Group", cat: "web", tag: "Website", desc: "5-page site + intake CRM" },
  { name: "Willow Creek Farms", cat: "web", tag: "Website", desc: "Shopify store, 15 SKUs" },
];

const GRADIENTS = [
  "linear-gradient(135deg,#14f0c4,#0e6e5c)",
  "linear-gradient(135deg,#1c3a53,#0e1e2d)",
  "linear-gradient(135deg,#14bea2,#13273a)",
  "linear-gradient(135deg,#0e1e2d,#14f0c4)",
  "linear-gradient(135deg,#2a4a63,#14f0c4)",
];

function initials(name){
  return name.split(" ").filter(w => !/^(&|of|and|co\.?)$/i.test(w)).slice(0,2).map(w => w[0]).join("").toUpperCase();
}

function buildPortfolio(){
  const grid = document.getElementById("portfolioGrid");
  if (!grid) return;
  grid.innerHTML = PORTFOLIO.map((p, i) => `
    <div class="port-card" data-cat="${p.cat}">
      <div class="port-stack">
        <div class="layer layer-2" style="background:${GRADIENTS[(i+2)%GRADIENTS.length]}; opacity:0.6;"></div>
        <div class="layer layer-1" style="background:${GRADIENTS[i%GRADIENTS.length]};">${initials(p.name)}</div>
      </div>
      <span class="port-checkout">CHECKOUT →</span>
      <div class="port-info">
        <div class="port-tag">${p.tag}</div>
        <div class="port-name">${p.name}</div>
        <div class="port-desc">${p.desc}</div>
      </div>
    </div>
  `).join("");
}

function initFilters(){
  const buttons = document.querySelectorAll(".filter-btn");
  const cards = () => document.querySelectorAll(".port-card");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      cards().forEach(card => {
        const match = filter === "all" || card.dataset.cat === filter;
        card.classList.toggle("hidden", !match);
      });
    });
  });
}

function buildMarquee(){
  const track = document.getElementById("marqueeTrack");
  if (!track) return;
  const names = PORTFOLIO.map(p => p.name);
  const doubled = [...names, ...names];
  track.innerHTML = doubled.map(n => `<span>${n}</span>`).join("");
}

/* ============================================================
   NAV / MOBILE MENU
   ============================================================ */
function initNav(){
  const burger = document.getElementById("navBurger");
  const menu = document.getElementById("mobileMenu");
  burger.addEventListener("click", () => menu.classList.toggle("open"));
  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => menu.classList.remove("open")));
}

/* ============================================================
   CURSOR DOT
   ============================================================ */
function initCursor(){
  const dot = document.querySelector(".cursor-dot");
  if (window.matchMedia("(pointer: coarse)").matches) return;
  window.addEventListener("mousemove", e => {
    dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
  });
}

/* ============================================================
   FORM
   ============================================================ */
function initForm(){
  const form = document.getElementById("projectForm");
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const btn = form.querySelector(".form-submit");
    btn.textContent = "Sent — we'll reply within 1 business day";
    btn.style.opacity = "0.7";
    form.querySelectorAll("input,select,textarea").forEach(el => el.disabled = true);
  });
}

/* ============================================================
   BRAND ASSEMBLE — hero content vanishes, the mark zooms in from
   the screen edges to settle centered, DIGI/DEN slide in to flank it.
   Plain scrub: scroll down to assemble, scroll up to reverse it.
   ============================================================ */
function initBrandAssemble(){
  gsap.registerPlugin(ScrollTrigger);

  const hero = document.getElementById("hero");
  const assemble = document.querySelector(".brand-assemble");
  const content = document.querySelector(".hero-content");
  const scrollCue = document.querySelector(".hero-scroll-cue");
  const hexfield = document.querySelector(".hero-hexfield");
  const icon = document.querySelector(".lockup-icon");
  const left = document.querySelector(".lockup-left");
  const right = document.querySelector(".lockup-right");
  const capTop = document.querySelector(".lockup-caption-top");
  const capBottom = document.querySelector(".lockup-caption-bottom");
  if (!hero || !icon) return;

  gsap.set(icon, { opacity: 0, scale: 12, transformOrigin: "50% 50%" });
  gsap.set(left, { opacity: 0, x: () => -window.innerWidth * 0.6 });
  gsap.set(right, { opacity: 0, x: () => window.innerWidth * 0.6 });
  gsap.set(capTop, { opacity: 0, y: -16 });
  gsap.set(capBottom, { opacity: 0, y: 16 });

  // The lockup is a fixed full-viewport overlay so it can bleed past the
  // hero's own width; it must be hidden once scrolled by, restored if the
  // user scrolls back up. Driven off live scroll progress every update
  // (rather than onLeave/onEnterBack) so a single fast scroll that jumps
  // clean across the whole pin range can't skip the transition and leave
  // it stuck open over the sections below.
  let assembleVisible = true;
  function syncAssembleVisibility(progress){
    const shouldShow = progress < 0.999;
    if (shouldShow === assembleVisible) return;
    assembleVisible = shouldShow;
    gsap.to(assemble, { autoAlpha: shouldShow ? 1 : 0, duration: 0.3 });
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "+=74%",
      scrub: 0.6,
      pin: true,
      anticipatePin: 1,
    }
  });

  // GSAP's scrub proxy updates the timeline's progress with events
  // suppressed, and ScrollTrigger tracks scroll position via its own
  // internal polling rather than a plain "scroll" event — so neither the
  // timeline's onUpdate nor a window scroll listener fire reliably here.
  // GSAP's ticker runs every frame regardless, so it's the one thing
  // guaranteed to catch the transition.
  const heroTrigger = tl.scrollTrigger;
  gsap.ticker.add(() => syncAssembleVisibility(heroTrigger.progress));

  tl.to(content, { opacity: 0, y: -40, duration: 0.3, ease: "power1.in" }, 0)
    .to(scrollCue, { opacity: 0, duration: 0.15 }, 0)
    .to(hexfield, { opacity: 0, duration: 0.3 }, 0)
    .to(icon, { opacity: 1, duration: 0.2 }, 0.05)
    .to(icon, { scale: 1, duration: 0.75, ease: "power2.out" }, 0.05)
    .to(left, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }, 0.5)
    .to(right, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }, 0.5)
    .to(capTop, { opacity: 1, y: 0, duration: 0.18, ease: "power2.out" }, 0.82)
    .to(capBottom, { opacity: 1, y: 0, duration: 0.18, ease: "power2.out" }, 0.82)
    // Hold the completed lockup in place (nothing animates here) before the
    // pin releases and the page continues scrolling normally.
    .to({}, { duration: 0.35 });
}

/* ============================================================
   PROFILE FRAME HERO — stacked "echo" frame tilts with the cursor;
   scrolling past it grows the frame to fill the screen, then the page
   continues normally into the bio content. Individual team pages only;
   no-ops everywhere else. Desktop only (see matching CSS breakpoint).
   ============================================================ */
function initProfileFrame(){
  const hero = document.getElementById("profileFrameHero");
  const stack = document.getElementById("frameStack");
  const main = document.getElementById("frameMain");
  const cutout = document.getElementById("frameCutout");
  const content = document.getElementById("frameHeroContent");
  if (!hero || !stack || !main) return;
  if (!window.matchMedia("(min-width: 900px)").matches) return;

  gsap.registerPlugin(ScrollTrigger);

  const echoes = stack.querySelectorAll(".frame-echo");

  hero.addEventListener("mousemove", (e) => {
    const r = hero.getBoundingClientRect();
    const nx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const ny = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    echoes.forEach((echo, i) => {
      const depth = (i + 1) * 6;
      gsap.to(echo, { x: nx * depth, y: ny * depth, duration: 0.6, ease: "power2.out" });
    });
    if (cutout) gsap.to(cutout, { x: nx * 4, y: ny * 4, duration: 0.6, ease: "power2.out" });
  });
  hero.addEventListener("mouseleave", () => {
    echoes.forEach(echo => gsap.to(echo, { x: 0, y: 0, duration: 0.6, ease: "power2.out" }));
    if (cutout) gsap.to(cutout, { x: 0, y: 0, duration: 0.6, ease: "power2.out" });
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "+=100%",
      scrub: 0.6,
      pin: true,
    }
  });

  tl.to(echoes, { opacity: 0, duration: 0.3 }, 0)
    .to(content, { opacity: 0, y: -30, duration: 0.3 }, 0)
    .to(main, {
      top: 0, right: 0, width: "100%", height: "100%",
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 1, ease: "power2.inOut"
    }, 0.1);

  if (cutout) {
    tl.to(cutout, {
      top: "5%", right: "8%", width: "38%", height: "95%",
      duration: 1, ease: "power2.inOut"
    }, 0.1);
  }
}

/* ============================================================
   PORTFOLIO STRIP — gradient anchor card flips in from the right,
   the logo strip unfurls left-to-right, then autoscrolls continuously.
   Individual team pages only; no-op everywhere else.
   ============================================================ */
function initPortfolioStrip(){
  const section = document.getElementById("portfolioStrip");
  const anchor = document.getElementById("portfolioAnchor");
  const wrap = document.getElementById("portfolioScrollWrap");
  if (!section || !anchor || !wrap) return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.set(anchor, { opacity: 0, x: 80, rotateY: 60, transformPerspective: 800 });
  gsap.set(wrap, { clipPath: "inset(0 100% 0 0)" });

  gsap.timeline({
    scrollTrigger: { trigger: section, start: "top 75%" }
  })
    .to(anchor, { opacity: 1, x: 0, rotateY: 0, duration: 0.6, ease: "power2.out" })
    .to(wrap, { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "power2.inOut" }, "-=0.2");
}

/* ============================================================
   HERO ENTRANCE
   ============================================================ */
function initHeroEntrance(){
  gsap.from(".hero-eyebrow", { opacity:0, y:16, duration:0.7, delay:0.1 });
  gsap.from(".hero-title .line", { opacity:0, y:40, duration:0.9, stagger:0.12, delay:0.2, ease:"power3.out" });
  gsap.from(".hero-sub", { opacity:0, y:20, duration:0.8, delay:0.6 });
  gsap.from(".hero-actions", { opacity:0, y:20, duration:0.8, delay:0.75 });

  gsap.to(".hex-ring-1", { rotate: 360, duration: 40, repeat: -1, ease: "none", transformOrigin: "50% 50%" });
  gsap.to(".hex-ring-2", { rotate: -360, duration: 60, repeat: -1, ease: "none", transformOrigin: "50% 50%" });
  gsap.to(".hex-ring-3", { rotate: 360, duration: 80, repeat: -1, ease: "none", transformOrigin: "50% 50%" });
}

/* ============================================================
   SCROLL REVEALS (pillars, portfolio cards, process, form)
   ============================================================ */
function initReveals(){
  gsap.utils.toArray(".pillar").forEach((el, i) => {
    gsap.from(el, {
      opacity: 0, y: 40, duration: 0.7, delay: i * 0.08,
      scrollTrigger: { trigger: el, start: "top 88%" }
    });
  });
  gsap.utils.toArray(".port-card").forEach((el, i) => {
    gsap.from(el, {
      opacity: 0, y: 30, duration: 0.6, delay: (i % 3) * 0.08,
      scrollTrigger: { trigger: el, start: "top 92%" }
    });
  });
  gsap.utils.toArray(".process-step").forEach((el, i) => {
    gsap.from(el, {
      opacity: 0, y: 30, duration: 0.7, delay: i * 0.1,
      scrollTrigger: { trigger: el, start: "top 88%" }
    });
  });
  gsap.from(".project-form", {
    opacity: 0, y: 30, duration: 0.8,
    scrollTrigger: { trigger: ".project-form", start: "top 88%" }
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  buildPortfolio();
  buildMarquee();
  initFilters();
  initNav();
  initCursor();
  initForm();
  initHeroEntrance();
  initReveals();

  // Give layout a tick to settle before measuring positions
  requestAnimationFrame(() => requestAnimationFrame(() => {
    initBrandAssemble();
    initProfileFrame();
    initPortfolioStrip();
  }));
});
