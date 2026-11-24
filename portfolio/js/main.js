/* =========================================================
   main.js
   1. setup (easings, GSAP/ScrollTrigger, Lenis)
   2. render WORK list + project pages from js/projects.js
   3. router + page transition
   4. motion per page  ← tweak timings here
   5. Home: Main + About merged into one desktop (folders, windows)

   Reference (matthieugivelet.com) — what it actually does, measured from its
   main.css / main.js:
     • text lines rise from translateY(105%) in 1.2s, cubic-bezier(.18,.66,.18,1),
       0.08–0.1s apart, inside overflow:hidden boxes
     • borders draw from the left, scaleX 0→1 in 1.7s, same curve
     • page change: page slides up 7rem, dark scrim fades in, a white sheet
       rises from the bottom (1s, cubic-bezier(.76,0,.47,.95)); then the new
       page is shown and its text lines rise again
     • hover: image scale 1.02 + arrow slides in (1s, cubic-bezier(.21,.83,.27,1.01))
     • project page: sticky 43vw info column + image stack
   The reference has no smooth scroll, no image masks and no parallax; those
   three are additions asked for in the brief and are marked [ADDED] below.
   If GSAP fails to load, every element simply stays visible.
   ========================================================= */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const PROJECTS = window.PROJECTS || [];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasG = !!(window.gsap && window.ScrollTrigger);
  const pad = n => String(n).padStart(2, '0');

  /* ---------- 1. easings: exact cubic-bezier curves from the reference ---------- */
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = t => ((ax * t + bx) * t + cx) * t, Y = t => ((ay * t + by) * t + cy) * t;
    return x => {
      if (x <= 0) return 0; if (x >= 1) return 1;
      let lo = 0, hi = 1, t = x;
      for (let i = 0; i < 24; i++) { const v = X(t); if (Math.abs(v - x) < 1e-5) break; v < x ? lo = t : hi = t; t = (lo + hi) / 2; }
      return Y(t);
    };
  }
  const EASE = {
    text: bezier(.18, .66, .18, 1),   // reference txt-in / border-in
    page: bezier(.76, 0, .47, .95),   // reference page transition
    mask: bezier(.7, 0, .2, 1)        // [ADDED] image mask reveal
  };
  const T = {               // durations (seconds) — change motion speed here
    text: 1.2, stagger: .08, border: 1.7,
    page: 1.0, pageLift: '-7rem',
    mask: 1.3, maskScale: 1.6,
    parallax: 6             // [ADDED] parallax travel in % of the image height
  };

  if (hasG) gsap.registerPlugin(ScrollTrigger);

  /* [ADDED] Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: .1, wheelMultiplier: 1, smoothWheel: true });
    if (hasG) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const loop = t => { lenis.raf(t); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
  }
  const scrollToY = (y, immediate) => lenis
    ? lenis.scrollTo(y, { immediate, duration: 1.4, easing: t => 1 - Math.pow(1 - t, 4) })
    : window.scrollTo({ top: y, behavior: immediate || reduce ? 'auto' : 'smooth' });

  /* ---------- 2. render ---------- */
  const ARROW = '<svg class="w-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  const line = (txt, cls = '') => `<span class="line"><span${cls ? ` class="${cls}"` : ''}>${txt}</span></span>`;

  function renderWork() {
    $('#workCount').textContent = `(${pad(PROJECTS.length)})`;
    const first = $('[data-first-project]');
    if (first && PROJECTS[0]) first.href = `#work-${PROJECTS[0].id}`;
    $('#workGrid').innerHTML = PROJECTS.map((p, i) => {
      const l = p.layout || {};
      const style = [l.col && `--col:${l.col}`, l.ratio && `--ratio:${l.ratio}`, l.offset && `--offset:${l.offset}`].filter(Boolean).join(';');
      return `
      <a class="w-card" href="#work-${p.id}" style="${style}" aria-label="${p.title} — ${p.category}, ${p.year}">
        <div class="w-media"><div class="w-par"><img src="${p.cover}" alt="" loading="${i < 2 ? 'eager' : 'lazy'}"></div></div>
        <div class="w-info">
          <i class="w-border"></i>
          ${line(pad(i + 1), 'w-num')}
          <span class="line"><span class="w-name">${p.title}${ARROW}</span></span>
          <span class="line"><span class="w-meta">
            <span class="w-roll"><span>${p.category}</span><span>View project</span></span>
            <span>${p.year}</span>
          </span></span>
        </div>
      </a>`;
    }).join('');
  }

  function renderProject(id) {
    const i = PROJECTS.findIndex(p => p.id === id), p = PROJECTS[i];
    const next = PROJECTS[(i + 1) % PROJECTS.length];
    const img = src => `<figure class="p-img" style="margin:0"><img src="${src}" alt="${p.title}"></figure>`;
    $('#page-project').innerHTML = `
      <section class="project" data-id="${p.id}">
        <div class="p-info">
          <p class="p-num">${line(`${pad(i + 1)} / ${pad(PROJECTS.length)}`)}</p>
          <div>
            <a class="p-back" href="#work">${line('<span class="link-line">← All works</span>')}</a>
            <h1 class="p-title">${line(p.title)}</h1>
            <div class="p-desc-box">
              <i class="w-border"></i>
              <p class="p-date">${line(`[ ${p.year} ]`)}</p>
              <div class="p-details">
                <p class="p-cat">${(p.roles || [p.category]).map(r => line(r)).join('')}</p>
                <div class="p-desc">${(p.description || []).map(d => line(d)).join('')}</div>
              </div>
            </div>
          </div>
          <a class="p-next" href="#work-${next.id}">
            <span class="line"><span style="display:flex;align-items:center;gap:.6em">${ARROW.replace('w-arrow', '')}<span class="link-line">Next project</span><small>${next.title}</small></span></span>
          </a>
        </div>
        <div class="p-images">
          ${(p.images || [p.cover]).map(it => Array.isArray(it) ? `<div class="p-row">${it.map(img).join('')}</div>` : img(it)).join('')}
        </div>
      </section>`;
    document.title = `${p.title} — 박민서 Work`;
  }

  /* ---------- 3. router + page transition ---------- */
  const pages = { home: $('#page-home'), work: $('#page-work'), project: $('#page-project') };
  const overlay = $('#tOverlay'), app = $('#app');
  let currentKey = null, busy = false, queued = null, ctx = null;

  function parse(hash) {
    const h = hash.replace(/^#/, '');
    if (h.startsWith('work-') && PROJECTS.some(p => p.id === h.slice(5))) return { page: 'project', id: h.slice(5) };
    if (h === 'work') return { page: 'work' };
    if (h === 'about') return { page: 'home', open: 'winAbout' };   // About now lives in a window on Home
    return { page: 'home' };
  }
  const keyOf = r => r.page + (r.id ? ':' + r.id : '');

  function scrollToAnchor(sel, immediate) {
    const el = sel && $(sel);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY;
    scrollToY(y, immediate);
  }

  function show(route) {
    ctx && ctx.revert();                     // kill the previous page's tweens and ScrollTriggers
    ctx = null;
    closeAllWindows(true);
    Object.values(pages).forEach(p => p.classList.remove('is-active'));
    if (route.page === 'project') renderProject(route.id);
    else document.title = '박민서 Work';
    pages[route.page].classList.add('is-active');
    currentKey = keyOf(route);
    scrollToY(0, true);
    if (hasG && !reduce) {
      ctx = gsap.context(() => {
        try {                                   // a motion error must never block navigation
          if (route.page === 'home') homeIntro();
          if (route.page === 'work') workIntro();
          if (route.page === 'project') projectIntro();
        } catch (err) { console.error(err); }
      }, pages[route.page]);
      ScrollTrigger.refresh();
    }
    if (route.anchor) requestAnimationFrame(() => scrollToAnchor(route.anchor, true));
    if (route.open) setTimeout(() => openWin(route.open), hasG && !reduce ? 1400 : 0);
  }

  /* reference page transition: lift page 7rem + scrim + white sheet up, then swap */
  function pageTransition() {
    return new Promise(done => {
      lenis && lenis.stop();
      gsap.set(overlay, { visibility: 'visible' });
      gsap.timeline({ onComplete: done })
        .to(app, { y: T.pageLift, duration: T.page, ease: EASE.page }, 0)
        .fromTo('.t-back', { opacity: 0 }, { opacity: 1, duration: T.page, ease: 'sine.inOut' }, 0)
        .fromTo('.t-block', { yPercent: 102 }, { yPercent: 0, duration: T.page, ease: EASE.page }, 0);
    });
  }
  function endTransition() {
    gsap.set(app, { clearProps: 'transform' });
    gsap.set('.t-back', { opacity: 0 });
    gsap.set('.t-block', { yPercent: 102 });
    gsap.set(overlay, { visibility: 'hidden' });
    lenis && lenis.start();
  }

  async function go(route, animate = true) {
    if (keyOf(route) === currentKey) {                 // same page: just scroll
      if (route.anchor) scrollToAnchor(route.anchor);
      else if (route.open) openWin(route.open);
      else if (route.page === 'home' || route.page === 'work') scrollToY(0);
      return;
    }
    if (busy) { queued = route; return; }              // ignore clicks mid-transition (last one wins)
    if (!animate || !hasG || reduce) { show(route); return; }
    busy = true;
    await pageTransition();
    show(route);
    endTransition();
    busy = false;
    if (queued) { const q = queued; queued = null; go(q); }
  }

  addEventListener('hashchange', () => go(parse(location.hash)));
  // a link to the hash we are already on doesn't fire hashchange — handle it here
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (a && a.getAttribute('href') === location.hash) { e.preventDefault(); go(parse(location.hash)); }
  });

  /* ---------- 4. motion ---------- */
  // masked text lines rise (reference txt-in)
  const rise = (targets, delay = 0, stagger = T.stagger) =>
    gsap.fromTo(targets, { yPercent: 105 }, { yPercent: 0, duration: T.text, ease: EASE.text, stagger, delay });
  // hairline draws from the left (reference border-in)
  const draw = (targets, delay = 0) =>
    gsap.fromTo(targets, { scaleX: 0 }, { scaleX: 1, duration: T.border, ease: EASE.text, delay });

  // reveal a block (border + its lines) once it scrolls into view
  function revealOnScroll(block, start = 'top 90%') {
    const lines = $$('.line > span', block), border = $('.w-border', block);
    gsap.set(lines, { yPercent: 105 });
    border && gsap.set(border, { scaleX: 0 });
    ScrollTrigger.create({
      trigger: block, start, once: true,
      onEnter: () => { border && draw(border); rise(lines, .05, .1); }
    });
  }

  function workIntro() {
    // hero title: lines rise one after another (reference)
    rise('.work-title .line > span', .05);
    $$('[data-reveal]').forEach(b => revealOnScroll(b));

    $$('.w-card').forEach(card => {
      const media = $('.w-media', card), par = $('.w-par', card);
      const border = $('.w-border', card), lines = $$('.w-info .line > span', card);
      // start states
      gsap.set(media, { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set(par, { scale: 1.25 });
      gsap.set(border, { scaleX: 0 });
      gsap.set(lines, { yPercent: 105 });
      // [ADDED] image mask opens upward while the image settles from 1.25×;
      // then the line draws and the text follows a beat later (image first → text = depth)
      ScrollTrigger.create({
        trigger: card, start: 'top 88%', once: true,
        onEnter: () => gsap.timeline()
          .to(media, { clipPath: 'inset(0% 0% 0% 0%)', duration: T.mask, ease: EASE.mask }, 0)
          .to(par, { scale: 1, duration: T.maskScale, ease: EASE.text }, 0)
          .add(draw(border), .3)
          .add(rise(lines, 0, .07), .45)
      });
      // [ADDED] parallax: the image drifts inside its frame while the frame scrolls past
      gsap.fromTo(par, { yPercent: -T.parallax }, {
        yPercent: T.parallax, ease: 'none',
        scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  function projectIntro() {
    const info = $('.p-info');
    rise($$('.line > span', info), .05, .05);           // reference: project page lines, 0.05s apart
    draw($('.w-border', info), .2);
    $$('.p-img').forEach((box, i) => {
      const img = $('img', box);
      gsap.set(box, { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set(img, { scale: 1.18 });
      const open = () => gsap.timeline()
        .to(box, { clipPath: 'inset(0% 0% 0% 0%)', duration: T.mask, ease: EASE.mask }, 0)
        .to(img, { scale: 1.06, duration: T.maskScale, ease: EASE.text }, 0);
      ScrollTrigger.create({ trigger: box, start: 'top 92%', once: true, onEnter: () => gsap.delayedCall(i < 2 ? .25 + i * .12 : 0, open) });
      gsap.fromTo(img, { yPercent: -3 }, {                    // [ADDED] light parallax
        yPercent: 3, ease: 'none',
        scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ---------- 5. Main (folder) + About — unchanged ---------- */
  /* ---------- 5. HOME (Main + About on one desktop) ---------- */
  const desk = $('#desk');
  const px = n => n * innerWidth / (innerWidth <= 768 ? 1080 : 1920);   // artboard px → screen px

  // home intro: frame draws, photo settles, text lines rise, the word gets "selected",
  // folders drop in, then the cursor glides over to a folder
  function homeIntro() {
    const tl = gsap.timeline({ defaults: { ease: EASE.text } });
    tl.from('.brace', { yPercent: 120, opacity: 0, duration: 1, stagger: .06 }, 0)
      .fromTo('.frame', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.6, ease: EASE.mask }, .1)
      .from('.me', { yPercent: 8, rotate: -2.5, opacity: 0, duration: 1.5 }, .2)
      .add(rise('.big:not(.big-r) .line > span', 0), .45)
      .fromTo('.select-fill', { scaleX: 0 }, { scaleX: 1, duration: .9, ease: EASE.mask }, .95)
      .fromTo('.select-edge', { scaleY: 0 }, { scaleY: 1, duration: .6 }, 1.25)
      .from('.select-dot', { scale: 0, duration: .5, stagger: .08 }, 1.4)
      .add(rise('.select-word .line > span', 0), 1.05)
      .add(rise('.big-r .line > span', 0), 1.2)
      .from('.folder-ic', { y: px(40), opacity: 0, duration: 1.1, stagger: .12 }, 1.3)
      .add(rise('.just .line > span', 0, .06), 1.4);
    // cursor: starts at the selection's corner handle, glides to the toolkit folder and "selects" it
    const cur = $('#cursor'), dot = $('.select-dot.tr'), kit = $('[data-open="winKit"].folder-ic');
    const c = cur.getBoundingClientRect(), d = dot.getBoundingClientRect();
    tl.from(cur, { x: d.left - c.left, y: d.top - c.top, opacity: 0, duration: 1.4, ease: 'power3.inOut' }, 1.8)
      .add(() => { kit.classList.add('is-sel'); gsap.delayedCall(1.4, () => kit.classList.remove('is-sel')); }, 3.2);
  }

  // windows (About content)
  let zTop = 30, winCount = 0;
  function openWin(id, from) {
    const w = $('#' + id); if (!w) return;
    const was = !w.hidden;
    w.hidden = false; w.style.zIndex = ++zTop;
    if (!w.dataset.placed && innerWidth > 768) {
      const off = (winCount++ % 3) * 36;
      w.style.left = Math.max(16, (innerWidth - w.offsetWidth) / 2 + off) + 'px';
      w.style.top = Math.max(16, innerHeight * .14 + off) + 'px';
      w.dataset.placed = '1';
    }
    if (was || !hasG || reduce) return;
    const r = w.getBoundingClientRect(), o = from ? from.getBoundingClientRect() : null;
    gsap.fromTo(w, o
      ? { x: o.left + o.width / 2 - (r.left + r.width / 2), y: o.top + o.height / 2 - (r.top + r.height / 2), scale: .2, opacity: 0 }
      : { y: 30, scale: .96, opacity: 0 },
      { x: 0, y: 0, scale: 1, opacity: 1, duration: .7, ease: EASE.text, clearProps: 'transform,opacity' });
  }
  function closeWin(w, instant) {
    if (w.hidden) return;
    if (instant || !hasG || reduce) { w.hidden = true; return; }
    gsap.to(w, { scale: .94, opacity: 0, duration: .25, ease: 'power2.in', onComplete: () => { w.hidden = true; gsap.set(w, { clearProps: 'transform,opacity' }); } });
  }
  function closeAllWindows(instant) { $$('.win').forEach(w => closeWin(w, instant)); }
  $$('.win').forEach(w => {
    w.addEventListener('pointerdown', () => { w.style.zIndex = ++zTop; });
    $('.win-x', w).addEventListener('click', () => closeWin(w));
    dragWith($('.win-bar', w), (dx, dy) => {
      w.style.left = (parseFloat(w.style.left) || w.offsetLeft) + dx + 'px';
      w.style.top = Math.max(0, (parseFloat(w.style.top) || w.offsetTop) + dy) + 'px';
    });
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') { const top = $$('.win:not([hidden])').sort((a, b) => b.style.zIndex - a.style.zIndex)[0]; top && closeWin(top); } });

  // anything with data-open opens that window (folders)
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-open]');
    if (t && !t.dataset.dragged) openWin(t.dataset.open, t);
  });

  // pointer drag helper: calls onMove(dx, dy) per move; marks the element so the click after a drag is ignored
  function dragWith(handle, onMove, target = handle) {
    handle.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('.win-x')) return;
      let lx = e.clientX, ly = e.clientY, moved = 0;
      const move = ev => {
        const dx = ev.clientX - lx, dy = ev.clientY - ly; lx = ev.clientX; ly = ev.clientY;
        moved += Math.abs(dx) + Math.abs(dy);
        if (moved > 6) { target.classList.add('dragging'); target.dataset.dragged = '1'; onMove(dx, dy); }
      };
      const up = () => {
        removeEventListener('pointermove', move); removeEventListener('pointerup', up);
        target.classList.remove('dragging');
        setTimeout(() => delete target.dataset.dragged, 0);
      };
      addEventListener('pointermove', move); addEventListener('pointerup', up);
    });
    target.addEventListener('click', e => { if (target.dataset.dragged) { e.preventDefault(); e.stopPropagation(); } }, true);
  }
  // folders can be moved around the desk
  $$('.folder-ic[data-drag]').forEach(f => {
    f.dataset.tx = 0; f.dataset.ty = 0;
    dragWith(f, (dx, dy) => {
      f.dataset.tx = +f.dataset.tx + dx; f.dataset.ty = +f.dataset.ty + dy;
      f.style.translate = `${f.dataset.tx}px ${f.dataset.ty}px`;
    });
  });

  /* ---------- start ---------- */
  renderWork();
  show(parse(location.hash));
})();
