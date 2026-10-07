/* home.js - the one orchestrated entrance, loupe lens, letters that lean away from the cursor */
(function () {
  'use strict';
  var SL = window.SL, g = SL && SL.gsap;
  var home = document.querySelector('.home');
  if (!home) return;
  var art = home.querySelector('.home__art');

  SL.onReady(function () {
    var chars = SL.qa('.home__name .ch');
    var intro = null;

    if (g && !SL.reduce) {
      intro = g.timeline({ defaults: { ease: 'power3.out' } });
      intro
        .from('.home__angel-wrap', { opacity: 0, scale: 1.06, y: 30, duration: 1.4, transformOrigin: '60% 40%' }, 0)
        .from('.home__celestial', { opacity: 0, rotate: -25, duration: 2, ease: 'power2.out' }, 0)
        .from(chars, { yPercent: 70, opacity: 0, rotate: function (i) { return (i % 2 ? 1 : -1) * 9; }, duration: .9, stagger: .06, ease: 'back.out(1.6)' }, .25)
        .from('.home__raven-wrap', { opacity: 0, y: 40, duration: 1 }, .6)
        .from('.home__swash', { clipPath: 'inset(0 100% 0 0)', duration: 1.2, ease: 'power2.inOut' }, 1)
        .from('.home__armillary', { opacity: 0, scale: .7, duration: 1.2, ease: 'back.out(1.4)' }, .9)
        .from('.home__coords, .home__roles li, .home__tag, .home__est, .home__motto, .home__code', { opacity: 0, x: -14, duration: .7, stagger: .06 }, 1.1)
        .from('.home__cta', { opacity: 0, y: 16, duration: .7 }, 1.5)
        .from('.home__star', { scale: 0, opacity: 0, duration: .6, stagger: { each: .05, from: 'random' }, ease: 'back.out(3)' }, 1.2)
        .from('.hot__s', { scale: 0, duration: .7, stagger: .12, ease: 'back.out(3)' }, 1.7);
    }

    /* letters lean away from the cursor, like loose type on a bed */
    if (g && SL.fine && !SL.reduce && chars.length) {
      var cache = [], R = Math.max(220, window.innerWidth * .2);
      var setters = chars.map(function (c) { return { x: g.quickTo(c, 'x', { duration: .7, ease: 'power3' }), y: g.quickTo(c, 'y', { duration: .7, ease: 'power3' }), r: g.quickTo(c, 'rotation', { duration: .8, ease: 'power3' }) }; });
      var measure = function () { cache = chars.map(function (c) { var b = c.getBoundingClientRect(); return { x: b.left + b.width / 2 - (parseFloat(g.getProperty(c, 'x')) || 0), y: b.top + b.height / 2 - (parseFloat(g.getProperty(c, 'y')) || 0) }; }); R = Math.max(220, window.innerWidth * .2); };
      var live = false;
      var arm = function () { measure(); live = true; };
      if (intro) intro.eventCallback('onComplete', arm); else arm();
      window.addEventListener('resize', function () { if (live) measure(); });
      window.addEventListener('scroll', function () { if (live) measure(); }, { passive: true });
      home.addEventListener('pointermove', function (e) {
        if (!live) return;
        chars.forEach(function (c, i) {
          var dx = cache[i].x - e.clientX, dy = cache[i].y - e.clientY, dist = Math.hypot(dx, dy) || 1;
          var f = Math.max(0, 1 - dist / R); f = f * f;
          setters[i].x(dx / dist * f * 26); setters[i].y(dy / dist * f * 18); setters[i].r(-dx / R * f * 22);
        });
      });
      home.addEventListener('pointerleave', function () { setters.forEach(function (s) { s.x(0); s.y(0); s.r(0); }); });
    }

    /* loupe lens */
    var lens = home.querySelector('.lens');
    if (lens && SL.fine && !SL.reduce) {
      var lx = 0, ly = 0, tx = 0, ty = 0, started = false, raf = 0;
      var loop = function () {
        lx += (tx - lx) * .2; ly += (ty - ly) * .2;
        lens.style.setProperty('--lx', lx.toFixed(1) + 'px'); lens.style.setProperty('--ly', ly.toFixed(1) + 'px');
        raf = lens.classList.contains('is-on') || Math.abs(tx - lx) > .5 ? requestAnimationFrame(loop) : 0;
      };
      home.addEventListener('pointermove', function (e) {
        var b = art.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
        var over = e.target.closest && e.target.closest('.hot, .home__cta, .top, a, button');
        var inside = x > 0 && y > 0 && x < b.width && y < b.height && !over;
        tx = x; ty = y;
        if (!started) { lx = tx; ly = ty; started = true; }
        lens.classList.toggle('is-on', inside);
        if (!raf) raf = requestAnimationFrame(loop);
      });
      home.addEventListener('pointerleave', function () { lens.classList.remove('is-on'); });
    }
  });
})();
