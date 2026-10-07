/* ==========================================================================
   core.js - shared behaviour (plain script, no build step, works on GitHub Pages)
   cursor · page veil · parallax · reveals · torn paper · small helpers
   ========================================================================== */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  if (hasGsap && window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);

  /* every page starts at the top, and every visit plays its entrance again */
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (_) {}
  if (!location.hash) { window.scrollTo(0, 0); window.addEventListener('load', function () { if (!location.hash) window.scrollTo(0, 0); }); }

  var SL = (window.SL = { reduce: reduce, fine: fine, gsap: hasGsap ? window.gsap : null, q: function (s, c) { return (c || d).querySelector(s); }, qa: function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }, ready: [] });
  SL.onReady = function (fn) { if (root.classList.contains('is-ready')) fn(); else SL.ready.push(fn); };
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  /* ---------- twinkle: every star gets its own rhythm ---------- */
  SL.qa('.tw').forEach(function (s) { s.style.setProperty('--d', (-rnd(0, 5)).toFixed(2) + 's'); s.style.setProperty('--t', rnd(2.8, 5.2).toFixed(2) + 's'); });

  /* ---------- torn paper edges ---------- */
  SL.qa('[data-torn]').forEach(function (el) {
    var mode = el.getAttribute('data-torn') || 'b', n = 26, pts = [], i, j = function (m) { return (Math.random() * m).toFixed(2); };
    for (i = 0; i <= n; i++) pts.push((i / n * 100).toFixed(2) + '% ' + (mode.indexOf('t') > -1 ? j(1.6) : 0) + '%');
    for (i = n; i >= 0; i--) pts.push((i / n * 100).toFixed(2) + '% ' + (mode.indexOf('b') > -1 ? (100 - j(1.8)).toFixed(2) : 100) + '%');
    el.style.clipPath = 'polygon(' + pts.join(',') + ')';
  });

  /* ---------- custom cursor ---------- */
  if (fine && !reduce) {
    var cur = d.createElement('div');
    cur.className = 'cursor'; cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<div class="cursor__star"><svg viewBox="0 0 100 100"><use href="#star4"/></svg></div><div class="cursor__label"></div>';
    d.body.appendChild(cur);
    var lab = cur.querySelector('.cursor__label'), cx = -100, cy = -100, tx = -100, ty = -100, on = false;
    root.classList.add('has-cursor');
    window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; if (!on) { cx = tx; cy = ty; on = true; } }, { passive: true });
    d.addEventListener('pointerleave', function () { cur.style.opacity = 0; });
    d.addEventListener('pointerenter', function () { cur.style.opacity = ''; });
    window.addEventListener('pointerdown', function () { cur.classList.add('is-down'); });
    window.addEventListener('pointerup', function () { cur.classList.remove('is-down'); });
    d.addEventListener('pointerover', function (e) {
      var t = e.target.closest ? e.target.closest('a, button, [role="button"], [data-cursor], summary, label, input, textarea') : null;
      cur.classList.toggle('is-link', !!t);
      var text = t && t.getAttribute && t.getAttribute('data-cursor');
      cur.classList.toggle('has-label', !!text);
      if (text) lab.textContent = text;
    });
    (function loop() { cx = lerp(cx, tx, .22); cy = lerp(cy, ty, .22); cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)'; requestAnimationFrame(loop); })();
  }

  /* ---------- page veil: panels of coloured paper sweep across ---------- */
  var veil = d.querySelector('.veil');
  function veilOut() {
    if (!veil || !root.classList.contains('veil-on')) return root.classList.remove('veil-on');
    var spans = veil.children;
    if (hasGsap && !reduce) {
      window.gsap.fromTo(spans, { yPercent: 0 }, { yPercent: 101, duration: .7, ease: 'power3.inOut', stagger: { each: .055, from: 'random' }, onComplete: function () { root.classList.remove('veil-on'); window.gsap.set(spans, { clearProps: 'transform' }); } });
    } else root.classList.remove('veil-on');
  }
  function veilIn(done) {
    if (!veil || !hasGsap || reduce) return done();
    root.classList.remove('veil-on');
    window.gsap.fromTo(veil.children, { yPercent: -101 }, { yPercent: 0, duration: .55, ease: 'power3.inOut', stagger: { each: .05, from: 'start' }, onComplete: done });
    veil.style.pointerEvents = 'auto';
  }
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || a.target === '_blank' || a.hasAttribute('download') || /^(mailto:|tel:|https?:)/i.test(href)) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin && location.protocol !== 'file:') return;
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    try { sessionStorage.setItem('sl-veil', '1'); } catch (_) {}
    veilIn(function () { location.href = a.href; });
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) { location.reload(); return; } if (false) { root.classList.remove('veil-on'); if (veil) { veil.style.pointerEvents = ''; if (hasGsap) window.gsap.set(veil.children, { yPercent: -101 }); } } });

  /* ---------- parallax: pointer drives --mx / --my on each .px-root ---------- */
  var roots = SL.qa('.px-root');
  if (roots.length && fine && !reduce) {
    roots.forEach(function (r) {
      var s = { x: 0, y: 0, tx: 0, ty: 0, run: false };
      function frame() {
        s.x = lerp(s.x, s.tx, .08); s.y = lerp(s.y, s.ty, .08);
        r.style.setProperty('--mx', s.x.toFixed(3)); r.style.setProperty('--my', s.y.toFixed(3));
        if (Math.abs(s.x - s.tx) > .002 || Math.abs(s.y - s.ty) > .002) requestAnimationFrame(frame); else s.run = false;
      }
      function go() { if (!s.run) { s.run = true; requestAnimationFrame(frame); } }
      r.addEventListener('pointermove', function (e) { var b = r.getBoundingClientRect(); s.tx = ((e.clientX - b.left) / b.width - .5) * 2; s.ty = ((e.clientY - b.top) / b.height - .5) * 2; go(); });
      r.addEventListener('pointerleave', function () { s.tx = 0; s.ty = 0; go(); });
    });
  }

  /* ---------- scroll: depth + reveals ---------- */
  function scrollFx() {
    if (!hasGsap || !window.ScrollTrigger) { SL.qa('.rv').forEach(function (el) { el.classList.add('is-in'); }); return; }
    var g = window.gsap;
    if (!reduce) {
      SL.qa('[data-speed]').forEach(function (el) {
        var sp = parseFloat(el.getAttribute('data-speed')) || 0;
        g.to(el, { yPercent: sp * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: .6 } });
      });
    }
    SL.qa('.rv').forEach(function (el) {
      var kind = el.getAttribute('data-rv') || 'lift', rot = parseFloat(el.getAttribute('data-rot') || rnd(-1.6, 1.6));
      if (reduce) { el.classList.add('is-in'); return; }
      var from = { opacity: 0 }, to = { opacity: 1, duration: .9, ease: 'power3.out', clearProps: 'transform' };
      if (kind === 'stamp') { from.scale = 1.7; from.rotate = rot * 4; to.scale = 1; to.rotate = rot; to.clearProps = ''; to.ease = 'back.out(2.2)'; to.duration = .55; }
      else if (kind === 'slide') { from.x = -40; to.x = 0; }
      else if (kind === 'slide-r') { from.x = 40; to.x = 0; }
      else if (kind === 'drop') { from.y = -60; from.rotate = rot * 3; to.y = 0; to.rotate = rot; to.clearProps = ''; to.ease = 'bounce.out'; to.duration = 1; }
      else { from.y = 28; from.rotate = rot * 2.2; to.y = 0; to.rotate = rot; to.clearProps = ''; }
      el.classList.add('is-in');
      g.fromTo(el, from, Object.assign({ scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reset' } }, to));
    });
    SL.qa('[data-draw]').forEach(function (svg) {
      SL.qa('path, line, circle, polyline', svg).forEach(function (p) {
        var len = 0; try { len = p.getTotalLength(); } catch (_) {}
        if (!len) return;
        p.style.strokeDasharray = len; p.style.strokeDashoffset = reduce ? 0 : len;
        if (!reduce) g.to(p, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', scrollTrigger: { trigger: svg, start: 'top 85%', toggleActions: 'play none none reset' } });
      });
    });
  }

  /* ---------- photo slots: real pictures from content.js drop onto the designed frames ---------- */
  var IMGS = window.SITE_IMAGES || {};
  SL.qa('[data-img-key]').forEach(function (slot) {
    var src = IMGS[slot.getAttribute('data-img-key')];
    if (!src) return;
    var im = new Image();
    im.alt = slot.getAttribute('data-alt') || ''; im.decoding = 'async'; im.loading = 'lazy';
    im.onload = function () { slot.classList.add('is-art'); };
    im.src = src; slot.appendChild(im);
  });

  /* ---------- copy buttons ---------- */
  SL.qa('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var txt = b.getAttribute('data-copy'), done = function () { b.classList.add('is-copied'); setTimeout(function () { b.classList.remove('is-copied'); }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, done); else done();
    });
  });

  /* ---------- go ---------- */
  function boot() {
    var fin = false;
    function ready() {
      if (fin) return; fin = true;
      root.classList.add('is-ready');
      scrollFx();
      veilOut();
      SL.ready.forEach(function (fn) { try { fn(); } catch (err) { console.error(err); } });
      SL.ready.length = 0;
      if (window.ScrollTrigger) setTimeout(function () { window.ScrollTrigger.refresh(); }, 600);
    }
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(ready); else ready();
    setTimeout(ready, 2200);

    /* three.js artifacts load last, only on pages that carry one */
    if (SL.q('[data-artifact]') && !/[?&]no3d/.test(location.search)) {
      var go = function () {
        import('./artifacts.js').then(function (m) { return m.init(); }).catch(function (err) { root.classList.add('no-3d'); console.warn('3D unavailable, showing the flat version.', err); });
      };
      if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 1500 }); else setTimeout(go, 300);
    }
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})();
