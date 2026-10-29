/* =========================================================
   SUPER IGUANA ($SI) — CONFIG
   Fill these in at launch. Everything else updates itself.
   - CA: paste the 0x... Base contract (42 chars). 'TBA' keeps
     Buy/Chart pointing at placeholders and shows the chart overlay.
   - X / TG: full URLs, e.g. 'https://x.com/superiguana' and
     'https://t.me/superiguana'. Empty string = shows "Soon" (disabled).
   ========================================================= */
const CONFIG = {
  CA: 'TBA',
  X: 'https://x.com/superiguanabase',
  TG: 'https://t.me/superiguanabase',
  CHAIN: 'base'
};

(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const CA_RE = /^0x[a-fA-F0-9]{40}$/;
  const validCA = CA_RE.test(CONFIG.CA);
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const narrow = () => window.innerWidth < 768;
  if (reduced) root.classList.add('reduced');
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);

  /* ---------- links ---------- */
  const caOrTBA = validCA ? CONFIG.CA : 'TBA';
  const LINKS = {
    buy: `https://app.uniswap.org/swap?chain=${CONFIG.CHAIN}&outputCurrency=${caOrTBA}`,
    chart: `https://dexscreener.com/${CONFIG.CHAIN}/${caOrTBA}`,
    x: CONFIG.X, tg: CONFIG.TG
  };
  $$('[data-link]').forEach(a => {
    const url = LINKS[a.dataset.link];
    if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    else {
      a.classList.add('is-disabled'); a.setAttribute('aria-disabled', 'true');
      a.removeAttribute('href'); a.title = 'Coming soon';
      const lbl = a.getAttribute('aria-label'); if (lbl) a.setAttribute('aria-label', lbl + ' (coming soon)');
      a.addEventListener('click', e => { e.preventDefault(); toast('Socials dropping soon'); });
    }
  });
  $$('[data-ca]').forEach(el => el.textContent = validCA ? CONFIG.CA : 'TBA — not launched yet');

  /* ---------- toast + copy ---------- */
  const toastEl = $('#toast'); let tt;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('show'), 2200); }
  async function copyText(t) {
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(t); return true; } } catch (e) {}
    try { const ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok; } catch (e) { return false; }
  }
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    if (!validCA) { toast('CA is TBA — only trust official channels'); return; }
    const ok = await copyText(CONFIG.CA);
    toast(ok ? 'CA copied. Cold blood, hot bags.' : 'Copy failed — select the address manually');
  }));
  window.__siCopy = copyText;

  /* ---------- preloader ---------- */
  const pl = $('#preloader'), plNum = $('#plNum');
  let shown = 0, target = 0, loaded = false;
  const start = performance.now();
  function plTick() {
    const el = performance.now() - start;
    target = loaded ? 100 : Math.min(90, el / 18);
    shown += (target - shown) * (reduced ? 1 : 0.12);
    plNum.textContent = String(Math.round(shown)).padStart(3, '0');
    if (shown > 99.4 && loaded) { plNum.textContent = '100'; setTimeout(finishPL, reduced ? 0 : 250); return; }
    requestAnimationFrame(plTick);
  }
  let plDone = false;
  function finishPL() { if (plDone) return; plDone = true; pl.classList.add('done'); introTitle(); }
  window.addEventListener('load', () => { loaded = true; });
  setTimeout(() => { loaded = true; }, 3500);
  setTimeout(finishPL, 6000);
  requestAnimationFrame(plTick);

  /* ---------- split title ---------- */
  $$('[data-split]').forEach(line => {
    const t = line.textContent; line.textContent = '';
    [...t].forEach(c => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; s.setAttribute('aria-hidden', 'true'); line.appendChild(s); });
  });
  function introTitle() {
    if (!hasGSAP || reduced) return;
    gsap.from('.title .ch', { yPercent: 110, rotateX: -90, opacity: 0, duration: 0.9, ease: 'back.out(1.8)', stagger: 0.045 });
    gsap.from('.hero-copy .tag, .hero-copy .ca-box, .hero-copy .cta-row, .hero-copy .scam', { y: 24, opacity: 0, duration: 0.7, stagger: 0.08, delay: 0.4 });
    gsap.from('.hero-char', { y: 80, opacity: 0, scale: .92, duration: 1.2, ease: 'power3.out' });
    gsap.from('.pow-hero', { scale: 0, rotate: -40, duration: .6, delay: 1, ease: 'back.out(2)' });
  }

  /* ---------- words ---------- */
  $$('.words').forEach(p => { p.innerHTML = p.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' '); });

  /* ---------- Lenis ---------- */
  let lenis = null;
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis && !reduced && !touch && !narrow()) {
    try {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      if (hasGSAP) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
      else { const r = t => { lenis.raf(t); requestAnimationFrame(r); }; requestAnimationFrame(r); }
      $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = $(a.getAttribute('href')); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: 0 }); } }));
    } catch (e) { lenis = null; }
  }

  /* ---------- GSAP scroll effects ---------- */
  const damp = (touch || narrow()) ? 0.4 : 1;
  if (hasGSAP && !reduced) {
    if (!narrow()) {
      $$('.hero-pin [data-depth]').forEach(el => {
        const d = parseFloat(el.dataset.depth);
        gsap.to(el, { yPercent: -d * 40 * damp, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      });
      gsap.to('.super-word', { scale: 1.35, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero-copy', { y: -120, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: '85% top', scrub: true } });
      gsap.to('.beam', { rotate: -14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
    $$('.words').forEach(p => {
      const ws = $$('.w', p);
      ScrollTrigger.create({ trigger: p, start: 'top 85%', end: 'bottom 45%', scrub: true, onUpdate: s => { const n = Math.round(s.progress * ws.length); ws.forEach((w, i) => w.style.opacity = i < n ? 1 : .12); } });
    });
    gsap.from('.panel', { y: 80, rotate: (i) => (i - 1) * 4, opacity: 0, duration: .9, stagger: .15, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.panels', start: 'top 80%' } });
    gsap.from('.pow-lore', { scale: 0, rotate: -60, duration: .6, ease: 'back.out(2.5)', scrollTrigger: { trigger: '.lore', start: 'top 60%' } });
    gsap.from('.step', { y: 60, opacity: 0, stagger: .12, duration: .7, scrollTrigger: { trigger: '.steps', start: 'top 80%' } });
    gsap.from('.pills li', { scale: .6, opacity: 0, stagger: .06, duration: .5, ease: 'back.out(2)', scrollTrigger: { trigger: '.pills', start: 'top 85%' } });
    gsap.from('.final-pose', { x: '-60vw', rotate: -10, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.final', start: 'top 70%' } });
  } else {
    $$('.w').forEach(w => w.style.opacity = 1);
  }

  /* ---------- helpers ---------- */
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const progressOf = el => { const r = el.getBoundingClientRect(); const tot = r.height - window.innerHeight; return tot <= 0 ? 0 : clamp(-r.top / tot); };
  const visible = new Map();
  const io = new IntersectionObserver(es => es.forEach(e => { visible.set(e.target, e.isIntersecting); e.target.classList.toggle('paused', !e.isIntersecting); }), { rootMargin: '100px' });
  $$('section, .ribbon, footer').forEach(s => io.observe(s));

  /* ---------- nav hide + cursor ---------- */
  const nav = $('#nav'); let lastY = 0;
  window.addEventListener('scroll', () => { const y = window.scrollY; nav.classList.toggle('hide', y > lastY && y > 200); lastY = y; }, { passive: true });
  if (!touch && !reduced) {
    root.classList.add('has-cursor'); const c = $('.cursor'); let cx = 0, cy = 0, x = 0, y = 0;
    window.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });
    document.addEventListener('mouseover', e => c.classList.toggle('big', !!e.target.closest('a,button,.fcard,.shield-3d')));
    (function loop() { x += (cx - x) * .25; y += (cy - y) * .25; c.style.transform = `translate(${x}px,${y}px)`; requestAnimationFrame(loop); })();
  }

  /* ---------- ORIGIN SCENE ---------- */
  const origin = $('#origin');
  const frames = $$('.frame', origin), caps = $$('.cap', origin);
  const flash = $('.flash', origin), bolt = $('.bolt', origin), powS = $('.pow-scene', origin);
  const iqNum = $('.iq-num'), iqBar = $('.iq-bar i'), iqLbl = $('.iq-label'), iqBox = $('.iq');
  function setStage(i) { frames.forEach((f, k) => f.classList.toggle('on', k === i)); caps.forEach((c, k) => c.classList.toggle('on', k === i)); }
  function originUpdate(p) {
    let st = p < .25 ? 0 : p < .5 ? 1 : p < .74 ? 2 : 3; setStage(st);
    const z = clamp((p - .2) / .1); const zz = Math.sin(z * Math.PI);
    flash.style.opacity = (zz * .85).toFixed(3); bolt.style.opacity = (Math.sin(clamp((p - .17) / .16) * Math.PI)).toFixed(3);
    bolt.style.transform = `translateX(-50%) scale(${1 + zz * .4})`;
    powS.style.opacity = p > .27 && p < .5 ? 1 : 0;
    powS.style.transform = `rotate(8deg) scale(${p > .27 && p < .5 ? 1 : .2})`;
    const f = frames[st]; const local = st === 0 ? p / .25 : st === 1 ? (p - .25) / .25 : st === 2 ? (p - .5) / .24 : (p - .74) / .26;
    f.style.transform = `scale(${1 + local * .06}) translateY(${(1 - local) * 12}px)`;
    const iq = Math.round(Math.pow(clamp((p - .12) / .7), 2.2) * 9000);
    iqNum.textContent = iq >= 9000 ? '9000+' : iq; iqBar.style.width = (iq / 90) + '%';
    iqLbl.textContent = iq < 50 ? 'BASKING' : iq < 2500 ? 'CHARGING' : iq < 9000 ? 'OVERCLOCKED' : 'SUPER INTELLIGENT';
    iqBox.classList.toggle('max', iq >= 9000);
  }
  if (reduced) { origin.classList.add('static'); iqNum.textContent = '9000+'; iqBar.style.width = '100%'; iqLbl.textContent = 'SUPER INTELLIGENT'; iqBox.classList.add('max'); }

  /* ---------- GALLERY ---------- */
  const GAL = [
    ['g01', 'Moon Patrol'], ['g02', 'Green Candle Deadlift'], ['g03', 'Bear Market KO'], ['g04', '1000 Pages / 1 Second'], ['g05', 'Before the Surge'],
    ['g06', 'Chart Rescue'], ['g07', 'Quick Change'], ['g08', 'Rug Rescue'], ['g09', 'Checkmate, Machine'], ['g10', 'Sunset Watch']
  ];
  const gallery = $('#gallery'), flight = $('#flight'), leader = $('.leader', flight), gpN = $('.gp-n');
  const cards = GAL.map(([id, cap], i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'fcard'; b.style.setProperty('--i', i);
    b.setAttribute('aria-label', `Open meme ${i + 1}: ${cap}`);
    b.innerHTML = `<img src="assets/gal/${id}-sm.webp" alt="Super Iguana meme: ${cap}" width="560" height="420" loading="lazy" decoding="async"><figcaption>${String(i + 1).padStart(2, '0')} · ${cap}</figcaption>`;
    b.addEventListener('click', () => openLB(i, b));
    flight.appendChild(b); return b;
  });
  let mode = 'flight';
  function setMode() { mode = reduced ? 'static' : narrow() ? 'strip' : 'flight'; gallery.classList.toggle('strip', mode === 'strip'); gallery.classList.toggle('static', mode === 'static'); if (mode !== 'flight') { cards.forEach(c => { c.style.transform = ''; c.style.opacity = ''; c.style.zIndex = ''; }); leader.style.transform = ''; } }
  setMode();
  let rw = window.innerWidth; window.addEventListener('resize', () => { if (Math.abs(window.innerWidth - rw) > 40) { rw = window.innerWidth; setMode(); } });

  // 3D cubic bezier flight path (normalized x,y; z in px)
  const P = [[-.35, .78, -1100], [.2, .02, -600], [.75, .98, -150], [1.3, .3, 320]];
  const bez = (t, k) => { const u = 1 - t; return u * u * u * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t * t * t * P[3][k]; };
  const dbez = (t, k) => { const u = 1 - t; return 3 * u * u * (P[1][k] - P[0][k]) + 6 * u * t * (P[2][k] - P[1][k]) + 3 * t * t * (P[3][k] - P[2][k]); };
  const GAP = .2, SPAN = 1 + (GAL.length - 1) * GAP + .15;
  const canvas = $('.trails'), ctx = canvas.getContext('2d');
  const hist = cards.map(() => []);
  const cityB = $('.gal-city.back'), cityF = $('.gal-city.front'), clA = $('.c-a'), clB = $('.c-b');
  let gp = 0, t0 = performance.now();
  function sizeCanvas() { const r = canvas.getBoundingClientRect(); canvas.width = r.width * Math.min(devicePixelRatio, 2); canvas.height = r.height * Math.min(devicePixelRatio, 2); ctx.setTransform(Math.min(devicePixelRatio, 2), 0, 0, Math.min(devicePixelRatio, 2), 0, 0); }
  sizeCanvas(); window.addEventListener('resize', sizeCanvas);
  function flightUpdate(target, time) {
    gp += (target - gp) * .12;
    const W = flight.clientWidth, H = flight.clientHeight, persp = 1200, ox = W / 2, oy = H * .45;
    const cw = cards[0].offsetWidth, ch = cards[0].offsetHeight;
    ctx.clearRect(0, 0, W, H);
    const head = gp * SPAN; let active = 0;
    cards.forEach((c, i) => {
      const s = head - i * GAP - .15;
      if (s <= 0 || s >= 1) { c.style.opacity = 0; c.style.pointerEvents = 'none'; hist[i].length = 0; return; }
      const x = bez(s, 0) * W, y = bez(s, 1) * H, z = bez(s, 2);
      const dx = dbez(s, 0) * W, dy = dbez(s, 1) * H;
      const bank = clamp(Math.atan2(dy, Math.abs(dx)) * 57.3 * .55, -28, 28);
      const bob = Math.sin(time / 600 + i) * 10;
      const yaw = 28 - s * 50;
      const op = clamp(s / .08) * clamp((1 - s) / .1);
      c.style.opacity = op.toFixed(3); c.style.pointerEvents = op > .5 ? 'auto' : 'none';
      c.style.zIndex = Math.round(z + 2000);
      c.style.transform = `translate3d(${x - cw / 2}px,${y - ch / 2 + bob}px,${z}px) rotateZ(${bank}deg) rotateY(${yaw}deg)`;
      if (s > .3 && s < .75) active = i;
      // contrails (projected tail point)
      const k = persp / (persp - z); const sx = ox + (x - cw * .45 - ox) * k, sy = oy + (y + bob - oy) * k;
      const h = hist[i]; h.push([sx, sy, k]); if (h.length > 26) h.shift();
      for (let j = 1; j < h.length; j++) {
        const a = j / h.length;
        ctx.strokeStyle = `rgba(214,32,39,${a * .55 * op})`; ctx.lineWidth = 10 * h[j][2] * a; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(h[j - 1][0], h[j - 1][1]); ctx.lineTo(h[j][0], h[j][1]); ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${a * .5 * op})`; ctx.lineWidth = 2 * h[j][2] * a;
        ctx.beginPath(); ctx.moveTo(h[j - 1][0], h[j - 1][1] - 6 * h[j][2]); ctx.lineTo(h[j][0], h[j][1] - 6 * h[j][2]); ctx.stroke();
      }
    });
    // leader flies ahead of the formation
    // leader loops the flight path ahead of the squadron (time + scroll driven)
    const ls = ((time / 7000) + gp * 0.8) % 1;
    if (ls > 0 && ls < 1) {
      const x = bez(ls, 0) * W, y = bez(ls, 1) * H, z = bez(ls, 2), k = persp / (persp - z);
      const dy = dbez(ls, 1) * H, dx = dbez(ls, 0) * W;
      const ang = clamp(Math.atan2(dy, dx) * 57.3 * .6, -30, 30);
      const lw = leader.offsetWidth, lh = leader.offsetHeight;
      leader.style.opacity = clamp(ls / .05) * clamp((1 - ls) / .08);
      leader.style.transform = `translate(${ox + (x - ox) * k - lw * k / 2}px,${oy + (y - oy) * k - lh * k / 2 + Math.sin(time / 400) * 8}px) scale(${k}) rotate(${ang}deg)`;
      leader.style.transformOrigin = '0 0';
    } else leader.style.opacity = 0;
    gpN.textContent = String(active + 1).padStart(2, '0');
    cityB.style.transform = `translateX(${-gp * 25}%)`; cityF.style.transform = `translateX(${-gp * 50}%)`;
    clA.style.transform = `translateX(${-gp * 45}%)`; clB.style.transform = `translateX(${-gp * 66}%)`;
  }
  // mobile strip: auto-fly + counter
  let stripIdx = 0, stripHold = 0;
  flight.addEventListener('scroll', () => { if (mode !== 'strip') return; const i = Math.round(flight.scrollLeft / (cards[0].offsetWidth + 18)); gpN.textContent = String(clamp(i, 0, 9) + 1).padStart(2, '0'); stripIdx = i; }, { passive: true });
  ['touchstart', 'pointerdown', 'wheel'].forEach(ev => flight.addEventListener(ev, () => { stripHold = performance.now() + 6000; }, { passive: true }));
  setInterval(() => {
    if (mode !== 'strip' || !visible.get(gallery) || performance.now() < stripHold || $('#lb').hidden === false) return;
    stripIdx = (stripIdx + 1) % cards.length; const c = cards[stripIdx];
    flight.scrollTo({ left: c.offsetLeft - (flight.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' });
  }, 2800);

  /* ---------- how-to progress ---------- */
  const how = $('#how'), howFill = $('.how-fill'), howGif = $('.how-gif');
  function howUpdate() { const r = how.getBoundingClientRect(); const p = clamp((window.innerHeight * .85 - r.top) / (r.height * .8)); howFill.style.width = p * 100 + '%'; howGif.style.left = p * 100 + '%'; }

  /* ---------- master loop (only runs work for visible scenes) ---------- */
  function loop(time) {
    if (!reduced && visible.get(origin)) originUpdate(progressOf(origin));
    if (mode === 'flight' && visible.get(gallery)) flightUpdate(progressOf(gallery), time);
    if (visible.get(how)) howUpdate();
    requestAnimationFrame(loop);
  }
  if (!reduced) requestAnimationFrame(loop); else { howFill.style.width = '100%'; howGif.style.left = '100%'; }
  if (!reduced) originUpdate(0);

  /* ---------- lightbox ---------- */
  const lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap'); let lbI = 0, lbReturn = null;
  function show(i) { lbI = (i + GAL.length) % GAL.length; const [id, cap] = GAL[lbI]; lbImg.src = `assets/gal/${id}.webp`; lbImg.alt = `Super Iguana meme: ${cap}`; lbCap.textContent = `${String(lbI + 1).padStart(2, '0')} / 10 · ${cap}`; }
  function openLB(i, from) { lbReturn = from; show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; lenis && lenis.stop(); $('.lb-close', lb).focus(); }
  function closeLB() { lb.hidden = true; document.body.style.overflow = ''; lenis && lenis.start(); lbReturn && lbReturn.focus({ preventScroll: true }); }
  $('.lb-close', lb).addEventListener('click', closeLB);
  $('.lb-nav.prev', lb).addEventListener('click', () => show(lbI - 1));
  $('.lb-nav.next', lb).addEventListener('click', () => show(lbI + 1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLB(); else if (e.key === 'ArrowRight') show(lbI + 1); else if (e.key === 'ArrowLeft') show(lbI - 1);
    else if (e.key === 'Tab') { const f = $$('button', lb); const i = f.indexOf(document.activeElement); e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); }
  });
  let sx0 = null; lb.addEventListener('touchstart', e => sx0 = e.touches[0].clientX, { passive: true });
  lb.addEventListener('touchend', e => { if (sx0 == null) return; const d = e.changedTouches[0].clientX - sx0; if (Math.abs(d) > 50) show(lbI + (d < 0 ? 1 : -1)); sx0 = null; });

  /* ---------- drag-to-rotate shield card ---------- */
  const sh = $('#shield3d'); let ry = -18, rx = 6, vy = 0, drag = false, px = 0, py = 0;
  const apply = () => sh.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; apply();
  sh.addEventListener('pointerdown', e => { drag = true; px = e.clientX; py = e.clientY; sh.setPointerCapture(e.pointerId); });
  sh.addEventListener('pointermove', e => { if (!drag) return; vy = (e.clientX - px) * .5; ry += vy; rx = clamp(rx - (e.clientY - py) * .3, -30, 30); px = e.clientX; py = e.clientY; apply(); });
  sh.addEventListener('pointerup', () => drag = false); sh.addEventListener('pointercancel', () => drag = false);
  sh.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { ry -= 15; apply(); } if (e.key === 'ArrowRight') { ry += 15; apply(); } });
  if (!reduced) (function spin() { if (!drag && visible.get($('#tokenomics'))) { vy *= .95; ry += vy + .15; apply(); } requestAnimationFrame(spin); })();

  /* ---------- DexScreener embed ---------- */
  if (validCA) {
    const fr = $('#dexFrame');
    fr.src = `https://dexscreener.com/${CONFIG.CHAIN}/${CONFIG.CA}?embed=1&theme=dark&trades=0&info=0`;
    fr.hidden = false; $('#chartOverlay').hidden = true;
  }

  /* ---------- static fallback when libs fail ---------- */
  if (!hasGSAP) root.classList.add('no-gsap');
  window.__si = { mode: () => mode, validCA };
})();
