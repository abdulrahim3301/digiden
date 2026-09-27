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
   LEAD FORMS — the main contact form and the pricing calculator's
   lead form both funnel through this one handler so they're never
   dealt with separately. It pushes a dataLayer event per submit
   (form_source distinguishes which form it was, for a GTM tag/
   trigger once GTM is installed) and gives the same UI feedback
   either way. When a real backend (Brevo, etc.) is wired up, add
   the fetch()/POST call in this one place and both forms start
   landing in the same CRM table immediately.
   ============================================================ */
function handleLeadFormSubmit(form, source){
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "lead_form_submit",
      form_source: source,
      form_id: form.id,
      estimated_value: data.estimate ? Number(data.estimate) : undefined
    });

    const btn = form.querySelector(".form-submit");
    if (btn){
      btn.textContent = "Sent — we'll reply within 1 business day";
      btn.style.opacity = "0.7";
    }
    form.querySelectorAll("input,select,textarea").forEach(el => el.disabled = true);
  });
}

/* ============================================================
   PRICING CALCULATOR — service names/rates are pulled live from
   the public "External" tab of the pricing Google Sheet via the
   classic gviz JSONP endpoint (a <script> tag load, not fetch() —
   avoids CORS entirely and needs no API key). Editing the sheet
   updates the site on the next page load; no redeploy needed.
   ============================================================ */
const PRICING_SHEET_ID = "1Q6_evTAos_04pG79-pLP0ghqgu44PcSNiaXWjZzNgZo";
const PRICING_SHEET_NAME = "External";

// Used only if the live sheet can't be reached (offline, sheet made
// private, request times out) so the calculator still works.
const PRICING_FALLBACK = [
  { name: "360° Digital Brand Identity & Strategy", rate: 25, maintRate: 10 },
  { name: "Performance Marketing & Conversion Tracking", rate: 30, maintRate: 12 },
  { name: "5-Page Basic Website Development", rate: 25, maintRate: 10 },
  { name: "Shopify Store Setup + 15 Product Listing", rate: 40, maintRate: 16 },
  { name: "AI Integration & Custom Chatbot Development", rate: 25, maintRate: 10 },
  { name: "Advanced Analytics, GA4, & Tracking Setup", rate: 15, maintRate: 6 },
  { name: "Content Marketing (SEO, GEO)", rate: 15, maintRate: 6 },
  { name: "Strategy Consultation", rate: 40, maintRate: 16 },
  { name: "CRM Development", rate: 80, maintRate: 32 },
  { name: "Digital Ads", rate: 20, maintRate: 8 },
  { name: "SM Content Management", rate: 10, maintRate: 4 },
  { name: "SMM Content Creation", rate: 20, maintRate: 8 },
];

function fetchPricingData(){
  return new Promise(resolve => {
    let settled = false;
    const finish = list => { if (!settled){ settled = true; resolve(list); } };

    window.google = window.google || {};
    window.google.visualization = window.google.visualization || {};
    window.google.visualization.Query = window.google.visualization.Query || {};
    window.google.visualization.Query.setResponse = data => {
      try {
        const rows = data.table.rows;
        const services = [];
        for (const row of rows){
          const name = row.c[0] && row.c[0].v;
          if (!name) break; // totals/notes rows below the service list have no name — stop there
          const rate = row.c[1] ? Number(row.c[1].v) || 0 : 0;
          const maintRate = row.c[6] ? Number(row.c[6].v) || 0 : 0;
          services.push({ name, rate, maintRate });
        }
        finish(services.length ? services : PRICING_FALLBACK);
      } catch (err){
        finish(PRICING_FALLBACK);
      }
    };

    const script = document.createElement("script");
    script.src = `https://docs.google.com/spreadsheets/d/${PRICING_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(PRICING_SHEET_NAME)}`;
    script.onerror = () => finish(PRICING_FALLBACK);
    document.head.appendChild(script);

    setTimeout(() => finish(PRICING_FALLBACK), 6000);
  });
}

function formatUSD(n){
  return "$" + Math.round(n).toLocaleString("en-US");
}

function initPricingCalculator(){
  const dropdown = document.getElementById("calcDropdown");
  const toggle = document.getElementById("calcDropdownToggle");
  const label = document.getElementById("calcDropdownLabel");
  const panel = document.getElementById("calcDropdownPanel");
  const hoursHint = document.getElementById("calcHoursHint");
  const hoursList = document.getElementById("calcHoursList");
  const calcBtn = document.getElementById("calcBtn");
  const resultBox = document.getElementById("calcResult");
  const resultValue = document.getElementById("calcResultValue");
  const resultCaveat = document.getElementById("calcResultCaveat");
  const resultNote = document.getElementById("calcResultNote");
  const leadFields = document.getElementById("calcLeadFields");
  const estimateHidden = document.getElementById("calcEstimateHidden");
  const form = calcBtn ? calcBtn.closest("form") : null;
  if (!dropdown || !toggle || !panel || !hoursList || !calcBtn || !form) return;

  // The calculator lives inside the same <form> as the lead fields — this
  // is the one form for the whole page, and its own hidden "source" input
  // (set per-page in the HTML) is what tells handleLeadFormSubmit which
  // page a submission came from.
  const source = form.querySelector('[name="source"]');
  handleLeadFormSubmit(form, source ? source.value : "unknown");

  // Hours inputs sit inside the same form as the (initially hidden) submit
  // button — stop Enter from ever implicitly submitting before Calculate.
  form.addEventListener("keydown", e => {
    if (e.key === "Enter" && e.target.matches(".calc-hours-row input")) e.preventDefault();
  });

  label.textContent = "Loading services…";
  toggle.disabled = true;

  fetchPricingData().then(services => {
    toggle.disabled = false;
    label.textContent = "Choose services…";

    const selected = new Map(); // service name -> { rate, maintRate, hours }

    function renderSelection(){
      const names = [...selected.keys()];
      label.textContent = names.length === 0 ? "Choose services…"
        : names.length <= 2 ? names.join(", ")
        : `${names.length} services selected`;

      hoursList.innerHTML = "";
      names.forEach(name => {
        const info = selected.get(name);
        const row = document.createElement("div");
        row.className = "calc-hours-row";
        row.innerHTML = `
          <div class="calc-hours-row-info">
            <div class="calc-hours-row-name">${name}</div>
            <div class="calc-hours-row-rate">$${info.rate}/hr</div>
          </div>
          <div class="calc-hours-row-input-wrap">
            <input type="number" min="1" step="1" value="${info.hours}" aria-label="Estimated hours for ${name}">
            <span class="calc-hours-row-unit">hour(s)</span>
          </div>
        `;
        row.querySelector("input").addEventListener("input", e => {
          info.hours = Math.max(1, parseInt(e.target.value, 10) || 1);
        });
        hoursList.appendChild(row);
      });

      if (hoursHint) hoursHint.hidden = names.length === 0;
      resultBox.hidden = true;
      leadFields.hidden = true;
    }

    panel.innerHTML = "";
    services.forEach(svc => {
      const row = document.createElement("label");
      row.className = "calc-option";
      row.innerHTML = `
        <input type="checkbox" value="${svc.name}">
        <span class="calc-option-name">${svc.name}</span>
        <span class="calc-option-rate">$${svc.rate}/hr</span>
      `;
      row.querySelector("input").addEventListener("change", e => {
        if (e.target.checked){
          selected.set(svc.name, { rate: svc.rate, maintRate: svc.maintRate, hours: 1 });
        } else {
          selected.delete(svc.name);
        }
        renderSelection();
      });
      panel.appendChild(row);
    });

    toggle.addEventListener("click", () => dropdown.classList.toggle("open"));
    document.addEventListener("click", e => {
      if (!dropdown.contains(e.target)) dropdown.classList.remove("open");
    });

    calcBtn.addEventListener("click", () => {
      if (selected.size === 0){
        label.textContent = "Pick at least one service";
        dropdown.classList.add("open");
        return;
      }
      let total = 0;
      let maintTotal = 0;
      selected.forEach(info => {
        total += info.rate * info.hours;
        maintTotal += info.maintRate;
      });

      resultValue.textContent = formatUSD(total);
      if (resultCaveat) resultCaveat.textContent = "This estimate may go up or down depending on the complexity and timeline of the work — let's talk it through on a call.";
      resultNote.textContent = `Ongoing maintenance for this mix runs ~${formatUSD(maintTotal)}/hr if you need it later.`;
      resultBox.hidden = false;
      if (estimateHidden) estimateHidden.value = String(Math.round(total));
      leadFields.hidden = false;

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "pricing_calculated",
        estimated_value: Math.round(total),
        services_selected: [...selected.keys()]
      });

      requestAnimationFrame(() => leadFields.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    });
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

  // The lockup is a fixed full-viewport overlay (so it can bleed past the
  // hero's own width) for as long as the hero is pinned. Once the pin's
  // done, it needs to stop being "stuck to the screen" and instead become
  // a normal in-flow element sitting at that exact scroll depth, so it
  // scrolls away with the page instead of vanishing — and scrolling back
  // up re-attaches it at that same point, right where the deform
  // animation should resume. This used to be a fade (autoAlpha tween)
  // timed against the pin release, but a fade is a second, independently-
  // timed animation racing the pin's own release — on mobile, where the
  // address bar resizing the viewport mid-scroll makes ScrollTrigger
  // recompute pin positions, that race was visibly losing: the overlay
  // would flash/jump before settling. Swapping position synchronously
  // (no tween) removes the race entirely. Driven off live scroll progress
  // every frame (rather than onLeave/onEnterBack) so a single fast scroll
  // that jumps clean across the whole pin range can't skip the transition
  // and leave it stuck in the wrong mode over the sections below.
  //
  // assembleFixed starts unknown (null), not a hardcoded true — this
  // function itself runs after a double-rAF defer (see the bottom of this
  // file), and if the page gets scrolled all the way down before that
  // defer fires, the real state at setup time is already "past the pin,
  // should be absolute" while a hardcoded `true` would claim the
  // opposite. Only the ticker's ongoing per-frame calls would ever have
  // corrected it — but that requires that some later frame actually
  // computes shouldBeFixed=false, which never happens if the user then
  // scrolls straight back to the top before the first tick: progress
  // there reads ~0 (shouldBeFixed=true), matches the wrongly-true start
  // value, and the mismatch — and the fix — is never triggered at all.
  // The overlay is then permanently stuck in fixed mode, covering the
  // hero. Starting unknown forces the very first call (made synchronously
  // below, right after the trigger exists) to always apply whatever the
  // real state actually is.
  let assembleFixed = null;
  function syncAssemblePosition(progress){
    const shouldBeFixed = progress < 0.999;
    if (shouldBeFixed === assembleFixed) return;
    assembleFixed = shouldBeFixed;
    if (shouldBeFixed){
      gsap.set(assemble, { clearProps: "position,top,left,right,height" });
    } else {
      // height must be pinned to the viewport height explicitly — without
      // it (or a "bottom"), the absolutely-positioned box shrinks to fit
      // its content instead of filling the screen, so align-items/
      // justify-content center have no room to center within anymore and
      // the lockup snaps to the top of that collapsed box instead of
      // staying where it visually was.
      gsap.set(assemble, { position: "absolute", top: window.scrollY, left: 0, right: 0, height: window.innerHeight });
    }
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
  syncAssemblePosition(heroTrigger.progress);
  gsap.ticker.add(() => syncAssemblePosition(heroTrigger.progress));

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
  const heading = document.getElementById("frameHeroHeading");
  const bio = document.getElementById("frameHeroBio");
  if (!hero || !stack || !main) return;
  if (!window.matchMedia("(min-width: 900px)").matches) return;

  gsap.registerPlugin(ScrollTrigger);

  const echoes = stack.querySelectorAll(".frame-echo");

  // Cursor parallax only ever moves the echo lines, not the photo itself —
  // the photo stays exactly flush with frame-main's edge regardless of the
  // cursor.
  hero.addEventListener("mousemove", (e) => {
    const r = hero.getBoundingClientRect();
    const nx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const ny = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    echoes.forEach((echo, i) => {
      const depth = (i + 1) * 6;
      gsap.to(echo, { x: nx * depth, y: ny * depth, duration: 0.6, ease: "power2.out" });
    });
  });
  hero.addEventListener("mouseleave", () => {
    echoes.forEach(echo => gsap.to(echo, { x: 0, y: 0, duration: 0.6, ease: "power2.out" }));
  });

  if (bio) gsap.set(bio, { opacity: 0, y: 40 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "+=100%",
      scrub: 0.6,
      pin: true,
    }
  });

  // The heading slides down (not fades out) as the frame grows, so it
  // lands in place on the gradient instead of vanishing. Animating the
  // shared wrapper (not the heading alone) is what actually moves the
  // heading — a transform on the heading by itself wouldn't carry its
  // normal-flow sibling (the bio) down with it, since siblings lay out
  // against an element's untransformed box, not its visual position;
  // that mismatch is what caused the heading and bio to overlap when
  // they were animated as two independent transforms. The bio panel
  // just fades/settles in underneath, arriving as the frame finishes
  // growing rather than popping in abruptly.
  tl.to(echoes, { opacity: 0, duration: 0.3 }, 0)
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
  if (content) {
    // Starts well below its resting spot (clear of the fixed nav — the
    // CSS `top` alone was too close, so the heading rendered half-hidden
    // behind the nav bar pre-scroll) and slides UP to settle at the
    // exact same final position as before.
    gsap.set(content, { y: 220 });
    tl.to(content, { y: 70, duration: 1, ease: "power2.inOut" }, 0.1);
  }
  if (heading) {
    // Card is white now, not the old teal-to-navy gradient — so the
    // heading text (visible from the very start, unlike the bio) has to
    // darken from its pre-scroll light color to a dark one. It can't
    // start on the same schedule as the card's own grow tween though:
    // main's `right`/`width` grow from the right edge, so its left edge
    // — the part that actually reaches the heading, which sits near the
    // left — doesn't get there until very late in that tween (eased,
    // so even later in real terms). Starting the color change at 0.1
    // like the grow tween made the text visibly gray while still sitting
    // over the dark page background. Delaying it to start well after
    // the card's left edge has plausibly swept past keeps the text
    // legible throughout instead of just at the two ends.
    tl.to(heading, {
      "--hero-fg": "#13273a", "--hero-accent": "#0a4a3f",
      duration: 0.4, ease: "power2.inOut"
    }, 0.7);
  }
  if (bio) {
    tl.to(bio, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.6);
  }
}

/* ============================================================
   BRAND LOGO GRID DATA — Abdul Rahim's brand design portfolio.
   8 logos (renders as a 2x4 grid) — a deliberately smaller, less pushy
   selection than the full logo list, rather than an autoscrolling
   carousel of everything. Grid tile itself uses the real logo file,
   assets/team/AR-Portfolio/BrandDesignPortfolio/<name>.png — `slug` is
   only for the case-study placement images (see openCaseStudy below).
   ============================================================ */
const AR_LOGO_GRID = [
  { name: "Annas Herz", slug: "annas-herz" },
  { name: "Allround", slug: "allround" },
  { name: "Bubble Bros", slug: "bubble-bros" },
  { name: "CMITIP", slug: "cmitip" },
  { name: "GripGlo", slug: "gripglo" },
  { name: "Recurved", slug: "recurved" },
  { name: "SandyFin", slug: "sandyfin" },
  { name: "Transper", slug: "transper" }
];

/* ============================================================
   BRAND LOGO GRID — simple 3x3 grid of rounded-square logo cards.
   Each card opens the case-study overlay (see openCaseStudy in
   initProjectOverlay), sharing the same overlay instance as the digital
   marketing portfolio below it rather than creating its own. Individual
   team pages only; no-op everywhere else.
   ============================================================ */
function initBrandLogoGrid(overlay){
  const grid = document.getElementById("brandLogoGrid");
  if (!grid) return;

  grid.innerHTML = "";
  AR_LOGO_GRID.forEach(({ name, slug }) => {
    const logoSrc = `assets/team/AR-Portfolio/BrandDesignPortfolio/${name}.png`;
    const card = document.createElement("div");
    card.className = "brand-logo-card";
    card.innerHTML = `<img src="${logoSrc}" alt="${name}" loading="lazy">`;
    if (overlay){
      card.addEventListener("click", () => overlay.openCaseStudy({ name, slug, logoSrc }));
    }
    grid.appendChild(card);
  });
}

/* ============================================================
   DIGITAL MARKETING PORTFOLIO DATA — MVP placeholder cards built
   from the logo marks in AR-Portfolio/DigitalMarketingPortfolio.
   Real card art comes later; swap `tag` copy per project once
   that's written, no structural changes needed.

   Structure per item (inspired by barnard.co/work + Deeksha Dinesh
   Kumar's Behance case-study format — impact numbers, then role,
   then creative grid):
     name, logo (maps to DigitalMarketingPortfolio/<logo>.png),
     tag, description, link (optional external site), impact[],
     role[], screenshots[], owner (optional — omit to show on every
     team page with a #dmStack; set to a page's data-owner value on
     #dmPortfolio to scope a project to just that page).

     `impact` renders one of two ways depending on its item shape:
     an array of { value, label } objects renders as big-number stat
     blocks (use this whenever there are clean, quotable metrics);
     an array of plain strings renders as a square-bullet list (use
     this for placeholder copy, like "Campaign results — coming
     soon", where there's nothing numeric to show yet).

   The four Punjab Government projects are shared (Abdul Rahim and
   Ali Hamza both worked on them) so they carry no `owner` and show
   on both pages. Impact/role for those four are real figures pulled
   from Abdul's CV. The six Atari Technologies clients below are
   scoped to Abdul's page (owner: "abdul-rahim") and use placeholder
   impact/role copy — swap those two arrays and drop in a real logo
   at the same filename once results are finalized, no code changes
   needed.
   ============================================================ */
const DM_PORTFOLIO = [
  { name: "E-Rozgaar", logo: "E-Rozgaar", tag: "Punjab Government Digital Initiative",
    description: "Digital campaign and growth work on E-Rozgaar, a Punjab Government initiative connecting job seekers with employers.",
    impact: [
      { value: "80,000+", label: "Graduates" },
      { value: "PKR 8.12B+", label: "Economic output" },
      { value: "2x", label: "Impressions increase" },
      { value: "50%", label: "Ad spend reduction" }
    ],
    role: [
      "Curated social media content, print media and multi-city awareness campaigns",
      "Helped make e-Rozgaar Pakistan's most impactful freelancing initiative"
    ],
    screenshots: ["assets/team/AR-Portfolio/DigitalMarketingPortfolio/E-Rozgaar-Cover.png"] },
  { name: "GITCP", logo: "GITCP", tag: "Punjab Government Digital Initiative",
    description: "Digital campaign and growth work on GITCP (Global IT Certifications), a Punjab Government digital-skills initiative.",
    impact: [
      { value: "$0.12", label: "CPC across Meta & LinkedIn" },
      { value: "1.02%", label: "CTR on LinkedIn ads" },
      { value: "49%", label: "Audience penetration" }
    ],
    role: [
      "Developed the brand identity for Global IT Certifications",
      "Managed full-funnel ad campaigns across Meta & LinkedIn to drive engagement and conversions"
    ],
    screenshots: [] },
  { name: "SheWins", logo: "SheWins", tag: "Punjab Government Digital Initiative",
    description: "Digital campaign and growth work on SheWins, a Punjab Government initiative supporting women's participation in the digital economy.",
    impact: [
      { value: "15,000+", label: "Leads generated" },
      { value: "13%", label: "Conversion rate" },
      { value: "1,200+", label: "Women graduated" },
      { value: "3,000+", label: "Instagram followers (from 40)" }
    ],
    role: [
      "Revamped brand identity and designed business pitch decks",
      "Built a multi-channel marketing strategy on Meta & TikTok Ads with GA4 & GTM",
      "Hosted multi-platform webinars and awareness sessions across 15+ colleges and universities"
    ],
    screenshots: [] },
  { name: "THSS", logo: "THSS", tag: "Punjab Government Digital Initiative",
    description: "Digital campaign and growth work on THSS, a Punjab Government digital initiative.",
    impact: ["Campaign metrics — coming soon"],
    role: ["Digital campaign and growth work on THSS, a Punjab Government digital initiative."],
    screenshots: [] },

  // — Atari Technologies clients (Abdul Rahim's page only) —
  // Dummy impact/role copy per Abdul's request; replace with real
  // figures once available, and swap the logo file (same filename)
  // once a real logo is ready.
  { name: "Air Ninja", logo: "Air Ninja", tag: "Indoor Inflatable & Ninja Park",
    description: "Digital growth and paid media work for Air Ninja, a UK indoor inflatable and ninja park brand.",
    link: "https://air-ninja.co.uk",
    impact: ["Campaign results — coming soon"],
    role: ["Full-funnel Meta & Google Ads management, local-audience targeting and creative production to drive footfall and bookings."],
    owner: "abdul-rahim", screenshots: [] },
  { name: "Monster Mayhem", logo: "Monster Mayhem", tag: "Indoor Soft Play & Inflatable",
    description: "Digital growth and paid media work for Monster Mayhem, a UK indoor soft play and inflatable brand.",
    link: "https://monster-mayhem.co.uk",
    impact: ["Campaign results — coming soon"],
    role: ["Full-funnel Meta & Google Ads management, local-audience targeting and creative production to drive footfall and bookings."],
    owner: "abdul-rahim", screenshots: [] },
  { name: "Air Nation", logo: "Air Nation", tag: "Indoor Inflatable Park",
    description: "Digital growth and paid media work for Air Nation, a UK indoor inflatable park brand.",
    link: "https://airnation-sh.co.uk",
    impact: ["Campaign results — coming soon"],
    role: ["Full-funnel Meta & Google Ads management, local-audience targeting and creative production to drive footfall and bookings."],
    owner: "abdul-rahim", screenshots: [] },
  { name: "Metro College", logo: "Metro College", tag: "Specialised Professional Courses",
    description: "Digital growth and lead-generation work for Metro College, a UK provider of specialised professional courses.",
    link: "https://metrocollege.org.uk",
    impact: ["Campaign results — coming soon"],
    role: ["Lead-generation campaigns across Meta & Google, landing-page optimization and enrolment funnel management for course sign-ups."],
    owner: "abdul-rahim", screenshots: [] },
  { name: "SRS Care", logo: "SRS Care", tag: "Home Care Services",
    description: "Digital growth and local-visibility work for SRS Care, a UK home care services provider.",
    link: "https://srs-care.co.uk",
    impact: ["Campaign results — coming soon"],
    role: ["Local-search visibility, Google Business Profile management and lead-generation campaigns to connect families with care services."],
    owner: "abdul-rahim", screenshots: [] },
  { name: "Aregon Care", logo: "Aregon Care", tag: "Home Care Services",
    description: "Digital growth and local-visibility work for Aregon Care, a UK home care services provider.",
    link: "https://aregoncare.co.uk",
    impact: ["Campaign results — coming soon"],
    role: ["Local-search visibility, Google Business Profile management and lead-generation campaigns to connect families with care services."],
    owner: "abdul-rahim", screenshots: [] }
];

/* ============================================================
   PROJECT OVERLAY — click-through detail view for a portfolio
   card. One overlay per page, populated per project on open. Shows
   a placeholder until a project's `screenshots` array has real
   images in it — drop paths in and they render full-width, stacked,
   no other changes needed. No-op on pages without the markup.
   ============================================================ */
function initProjectOverlay(){
  const overlay = document.getElementById("projectOverlay");
  if (!overlay) return null;

  const content = document.getElementById("projectOverlayContent");
  const closeBtn = document.getElementById("projectOverlayClose");
  const backdrop = document.getElementById("projectOverlayBackdrop");

  function show(){
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function close(){
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function open(item){
    content.innerHTML = `
      <div class="project-overlay-head">
        <div class="project-overlay-logo"><img src="${item.logoSrc}" alt="${item.name}"></div>
        <h2 class="project-overlay-title">${item.name}</h2>
      </div>
      <span class="project-overlay-tag">${item.tag}</span>
      <p class="project-overlay-desc">${item.description || ""}</p>
      ${item.link ? `<a href="${item.link}" class="btn btn-ghost project-overlay-link" target="_blank" rel="noopener noreferrer">Visit site ↗</a>` : ""}
      ${item.impact && item.impact.length ? `
        <div class="project-overlay-block">
          <h3 class="project-overlay-block-title">Campaign Impact<span class="accent-dot">.</span></h3>
          ${
            typeof item.impact[0] === "object"
              ? `<div class="project-overlay-stats">${item.impact.map(s => `
                  <div class="project-overlay-stat">
                    <div class="project-overlay-stat-num">${s.value}</div>
                    <div class="project-overlay-stat-label">${s.label}</div>
                  </div>`).join("")}</div>`
              : `<ul class="project-overlay-list">${item.impact.map(x => `<li>${x}</li>`).join("")}</ul>`
          }
        </div>` : ""}
      ${item.role && item.role.length ? `
        <div class="project-overlay-block">
          <h3 class="project-overlay-block-title">Role &amp; Contribution<span class="accent-dot">.</span></h3>
          <ul class="project-overlay-list">${item.role.map(x => `<li>${x}</li>`).join("")}</ul>
        </div>` : ""}
      <div class="project-overlay-shots">
        ${
          item.screenshots && item.screenshots.length
            ? item.screenshots.map(src => `<img src="${src}" alt="${item.name} — campaign result">`).join("")
            : `<div class="project-overlay-shots-empty">More visuals coming soon</div>`
        }
      </div>
    `;
    show();
  }

  // Case-study layout for the brand logo grid — wireframed after
  // barnard.co/work's project pages: a big hero cover, a light/dark
  // variant grid, then two supporting mockup/process placements. Each
  // logo has 4 placement images at a fixed filename convention
  // (case-studies/<slug>_p1..p4.png) so dropping in the real design
  // later is just replacing that file — no code changes. These are
  // wireframe placeholders, not real deliverables for these brands.
  function openCaseStudy(item){
    const base = `assets/team/AR-Portfolio/BrandDesignPortfolio/case-studies/${item.slug}`;
    content.innerHTML = `
      <div class="project-overlay-head">
        <div class="project-overlay-logo"><img src="${item.logoSrc}" alt="${item.name}"></div>
        <h2 class="project-overlay-title">${item.name}</h2>
      </div>
      <span class="project-overlay-tag">Brand Identity Design</span>
      <div class="case-study">
        <div class="case-study-hero">
          <img src="${base}_p1.png" alt="${item.name} — cover">
        </div>
        <div class="case-study-variant-grid">
          <img src="${base}_p2.png" alt="${item.name} — logo on light and dark">
        </div>
        <div class="case-study-mockups">
          <img src="${base}_p3.png" alt="${item.name} — application mockup">
          <img src="${base}_p4.png" alt="${item.name} — process and guidelines">
        </div>
      </div>
    `;
    show();
  }

  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });

  return { open, openCaseStudy, close };
}

/* ============================================================
   DIGITAL MARKETING PORTFOLIO — pinned stacking scroll cards.
   Each card is `position:sticky` at the same `top` offset (CSS),
   so once it locks it fully covers whatever's beneath it. The pile
   look comes from GSAP: each card (but the first) starts a little
   below its resting spot — while it's still scrolling up into view,
   the card it's about to cover is visible peeking out above it —
   and both animations are scrubbed across that SAME entrance window
   (card sliding the last bit up to rest, previous card shrinking/
   dimming to recede), so the cover reads as one settling onto the
   last rather than a hard cut. Reverse-scroll un-stacks for free,
   since it's all just scroll-position-driven. Each card opens the
   project overlay on click. Individual team pages only; no-op
   elsewhere.
   ============================================================ */
function initDMPortfolioStack(overlay){
  const stack = document.getElementById("dmStack");
  if (!stack) return;

  gsap.registerPlugin(ScrollTrigger);

  // Projects without an `owner` are shared across every team page with
  // a #dmStack; an `owner` scopes a project to the page whose
  // #dmPortfolio section carries the matching data-owner attribute.
  const pageOwner = document.getElementById("dmPortfolio")?.dataset.owner;
  const items = DM_PORTFOLIO.filter(item => !item.owner || item.owner === pageOwner);

  stack.innerHTML = "";
  items.forEach((item, i) => {
    const logoSrc = `assets/team/AR-Portfolio/DigitalMarketingPortfolio/${item.logo}.png`;
    const card = document.createElement("article");
    card.className = "dm-card";
    card.style.setProperty("--glow-x", i % 2 === 0 ? "75%" : "20%");
    card.style.setProperty("--glow-y", i % 2 === 0 ? "15%" : "80%");
    card.innerHTML = `
      <div class="dm-card-glow"></div>
      <span class="dm-card-tag">${item.tag}</span>
      <div class="dm-card-body">
        <div class="dm-card-logo-chip"><img src="${logoSrc}" alt="${item.name}" loading="lazy"></div>
        <h3 class="dm-card-title">${item.name}</h3>
      </div>
      <span class="dm-card-hover-cta">Click to view project ↗</span>
    `;
    if (overlay) card.addEventListener("click", () => overlay.open({ ...item, logoSrc }));
    stack.appendChild(card);
  });

  const cards = stack.querySelectorAll(".dm-card");
  const PEEK = 80;

  cards.forEach((card, i) => {
    if (i === 0) return;
    const entrance = { trigger: card, start: "top bottom", end: "top top+=96", scrub: true };
    gsap.fromTo(card, { y: PEEK }, { y: 0, ease: "none", scrollTrigger: entrance });
    gsap.to(cards[i - 1], { scale: 0.94, opacity: 0.65, ease: "none", scrollTrigger: entrance });
  });

  // Hover pill flies with the cursor instead of sitting fixed in the
  // card's center — pivoted on its own middle (xPercent/yPercent) so the
  // quickTo calls only ever need raw cursor coordinates relative to the
  // card. Desktop only; touch devices fall back to a static corner badge
  // via CSS (no pointer to track).
  if (window.matchMedia("(min-width: 900px)").matches){
    cards.forEach(card => {
      const cta = card.querySelector(".dm-card-hover-cta");
      if (!cta) return;
      gsap.set(cta, { xPercent: -50, yPercent: -50, rotate: -6 });
      const moveX = gsap.quickTo(cta, "x", { duration: 0.35, ease: "power3" });
      const moveY = gsap.quickTo(cta, "y", { duration: 0.35, ease: "power3" });
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        moveX(e.clientX - r.left);
        moveY(e.clientY - r.top);
      });
    });
  }
}

/* ============================================================
   SERVICE DOMAIN DETAIL — the illustrative example cards tilt
   toward the cursor. Desktop only; no-ops everywhere else.
   ============================================================ */
function initDomainExamples(){
  const cards = document.querySelectorAll(".domain-example-visual");
  if (!cards.length) return;
  if (!window.matchMedia("(min-width: 900px)").matches) return;

  cards.forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      const nx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      const ny = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      gsap.to(card, { rotateY: nx * 12, rotateX: -ny * 12, duration: 0.4, ease: "power2.out" });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.5, ease: "power2.out" });
    });
  });
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
  gsap.from("#projectForm", {
    opacity: 0, y: 30, duration: 0.8,
    scrollTrigger: { trigger: "#projectForm", start: "top 88%" }
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
  initPricingCalculator();
  initHeroEntrance();
  initReveals();
  initDomainExamples();

  // Give layout a tick to settle before measuring positions
  requestAnimationFrame(() => requestAnimationFrame(() => {
    initBrandAssemble();
    initProfileFrame();
    // Shared overlay instance — the logo grid and the DM portfolio stack
    // both open project details into the same panel, so it's created
    // once here rather than each init function binding its own listeners.
    const overlay = initProjectOverlay();
    initBrandLogoGrid(overlay);
    initDMPortfolioStack(overlay);
  }));
});
