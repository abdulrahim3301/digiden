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
  form.addEventListener("submit", e => {
    e.preventDefault();
    const btn = form.querySelector(".form-submit");
    btn.textContent = "Sent — we'll reply within 1 business day";
    btn.style.opacity = "0.7";
    form.querySelectorAll("input,select,textarea").forEach(el => el.disabled = true);
  });
}

/* ============================================================
   HEX TRAVELER — scroll-driven journey through the page
   ============================================================ */
function initHexTraveler(){
  const traveler = document.getElementById("hexTraveler");
  gsap.registerPlugin(ScrollTrigger);

  // Hidden until the hero brand-assemble sequence hands off to it (see initBrandAssemble)
  gsap.set(traveler, { opacity: 0, scale: 1, xPercent: -50, yPercent: -50 });

  const dockPoints = [
    { sel: "[data-pillar='1']", xf: 0.9, yf: 0.15, rotate: 120 },
    { sel: "[data-pillar='2']", xf: 0.9, yf: 0.15, rotate: 180 },
    { sel: "[data-pillar='3']", xf: 0.9, yf: 0.15, rotate: 270 },
    { sel: "[data-pillar='4']", xf: 0.9, yf: 0.15, rotate: 360 },
    { sel: "#work", xf: 0.05, yf: 0.08, rotate: 450 },
    { sel: "#process", xf: 0.95, yf: 0.1, rotate: 540 },
    { sel: "#contact", xf: 0.5, yf: 0.12, rotate: 630 },
  ];

  dockPoints.forEach((point, i) => {
    const el = document.querySelector(point.sel);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: point.start || "top 70%",
      end: "bottom 30%",
      onEnter: () => animateTo(point),
      onEnterBack: () => animateTo(point),
    });
  });

  function animateTo(point){
    const el = document.querySelector(point.sel);
    const r = el.getBoundingClientRect();
    const x = r.left + r.width * point.xf + window.scrollX;
    const y = r.top + r.height * point.yf + window.scrollY;
    gsap.to(traveler, {
      x, y, rotate: point.rotate, scale: 1,
      duration: 1.1, ease: "power3.inOut"
    });
  }

  window.addEventListener("resize", () => ScrollTrigger.refresh());
}

/* ============================================================
   BRAND ASSEMBLE — hero content vanishes, the mark zooms in from
   the screen edges to settle centered, DIGI/DEN slide in to flank it
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
  const traveler = document.getElementById("hexTraveler");
  if (!hero || !icon) return;

  gsap.set(icon, { opacity: 0, scale: 12, transformOrigin: "50% 50%" });
  gsap.set(left, { opacity: 0, x: () => -window.innerWidth * 0.6 });
  gsap.set(right, { opacity: 0, x: () => window.innerWidth * 0.6 });
  gsap.set(capTop, { opacity: 0, y: -16 });
  gsap.set(capBottom, { opacity: 0, y: 16 });

  // Once the lockup finishes assembling, the traveling mark takes over from
  // the center icon and drops away to the right. Scrolling back up flies it
  // straight back to that exact centered spot, upright, before handing
  // control back to the (already-correctly-positioned) lockup icon.
  function handoffToTraveler(){
    if (!traveler) return;
    const r = icon.getBoundingClientRect();
    const x = r.left + r.width / 2 + window.scrollX;
    const y = r.top + r.height / 2 + window.scrollY;
    // Match the traveler's size to the lockup icon it's replacing so the
    // handoff is seamless, then let it fall away to the right rather than
    // jumping straight to a section dock point.
    gsap.set(traveler, { x, y, opacity: 1, scale: r.width / 64, rotate: 0 });
    gsap.set(assemble, { autoAlpha: 0 });
    gsap.to(traveler, {
      x: x + window.innerWidth * 0.3,
      y: y + window.innerHeight * 0.5,
      rotate: 35,
      scale: 1,
      duration: 1.3,
      ease: "power2.in"
    });
  }
  function handoffToLockup(){
    if (!traveler) return;
    const r = icon.getBoundingClientRect();
    const x = r.left + r.width / 2 + window.scrollX;
    const y = r.top + r.height / 2 + window.scrollY;
    gsap.set(assemble, { autoAlpha: 1 });
    gsap.killTweensOf(traveler);
    gsap.to(traveler, {
      x, y, rotate: 0, scale: r.width / 64, opacity: 0,
      duration: 0.6, ease: "power2.inOut"
    });
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "+=120%",
      scrub: 0.6,
      pin: true,
      anticipatePin: 1,
      onLeave: handoffToTraveler,
      onEnterBack: handoffToLockup,
    }
  });

  tl.to(content, { opacity: 0, y: -40, duration: 0.3, ease: "power1.in" }, 0)
    .to(scrollCue, { opacity: 0, duration: 0.15 }, 0)
    .to(hexfield, { opacity: 0, duration: 0.3 }, 0)
    .to(icon, { opacity: 1, duration: 0.2 }, 0.05)
    .to(icon, { scale: 1, duration: 0.75, ease: "power2.out" }, 0.05)
    .to(left, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }, 0.5)
    .to(right, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }, 0.5)
    .to(capTop, { opacity: 1, y: 0, duration: 0.18, ease: "power2.out" }, 0.82)
    .to(capBottom, { opacity: 1, y: 0, duration: 0.18, ease: "power2.out" }, 0.82);
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

  // Give layout a tick to settle before measuring positions for the traveler
  requestAnimationFrame(() => requestAnimationFrame(() => {
    initHexTraveler();
    initBrandAssemble();
  }));
});
