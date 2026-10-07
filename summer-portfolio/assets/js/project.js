/* project.js - rail follows you down the file; the title writes itself in */
(function () {
  'use strict';
  var SL = window.SL, g = SL && SL.gsap;
  if (!document.querySelector('.proj')) return;

  SL.onReady(function () {
    /* active section in the left rail */
    var links = SL.qa('.proj__rail a'), map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { links.forEach(function (a) { a.classList.remove('is-active'); }); var a = map[e.target.id]; if (a) a.classList.add('is-active'); } });
      }, { rootMargin: '-35% 0px -55% 0px' });
      SL.qa('.pg').forEach(function (s) { io.observe(s); });
    }
    if (!g || SL.reduce) return;

    var t = document.querySelector('.proj__title');
    if (t) {
      var parts = t.innerHTML.split(/<br\s*\/?>/i); t.setAttribute('aria-label', t.textContent); t.innerHTML = '';
      parts.forEach(function (line, li) {
        var row = document.createElement('span'); row.style.display = 'block'; row.style.whiteSpace = 'nowrap';
        line.split('').forEach(function (c) { var s = document.createElement('span'); s.className = 'ch'; s.style.display = 'inline-block'; s.textContent = c === ' ' ? ' ' : c; s.setAttribute('aria-hidden', 'true'); row.appendChild(s); });
        t.appendChild(row);
      });
      g.from(t.querySelectorAll('.ch'), { yPercent: 70, opacity: 0, rotate: function (i) { return (i % 2 ? 1 : -1) * 8; }, duration: .8, stagger: .045, ease: 'back.out(1.5)', delay: .1 });
    }
    g.from('.proj__no', { opacity: 0, scale: .85, duration: 1, ease: 'power3.out' });
    g.from('.h-art > *', { opacity: 0, y: 40, duration: 1, stagger: .12, ease: 'power3.out', delay: .3 });
    g.from('.proj__tagline, .proj__meta, .proj__file', { opacity: 0, y: 18, duration: .8, stagger: .12, delay: .7, ease: 'power3.out' });
    g.from('.proj__coin', { opacity: 0, scale: .6, rotate: -20, duration: 1.1, ease: 'back.out(1.6)', delay: .5 });
  });
})();
