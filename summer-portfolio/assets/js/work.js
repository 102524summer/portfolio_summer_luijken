/* work.js — the archive: title writes in, each file settles onto the desk when you reach it */
(function () {
  'use strict';
  var SL = window.SL, g = SL && SL.gsap;
  if (!document.querySelector('.work')) return;

  SL.onReady(function () {
    if (!g || SL.reduce) return;

    var title = document.querySelector('.w-title');
    if (title) {
      SL.qa('span', title).forEach(function (line) {
        var txt = line.textContent; line.textContent = '';
        txt.split('').forEach(function (c) { var s = document.createElement('span'); s.className = 'ch'; s.textContent = c; s.setAttribute('aria-hidden', 'true'); line.appendChild(s); });
      });
      title.setAttribute('aria-label', 'The Archive');
      g.from(title.querySelectorAll('.ch'), { yPercent: 80, opacity: 0, rotate: function (i) { return (i % 2 ? 1 : -1) * 10; }, duration: .9, stagger: .05, ease: 'back.out(1.5)', delay: .15 });
      g.from('.w-index li', { x: 40, opacity: 0, duration: .8, stagger: .09, ease: 'power3.out', delay: .7 });
      g.from('.w-intro .sp > *', { opacity: 0, y: 50, duration: 1, stagger: .12, ease: 'power3.out', delay: .4 });
      g.from('.w-lede', { opacity: 0, duration: 1, delay: 1.1 });
    }

    /* every file arrives once, when you reach it */
    SL.qa('.spec').forEach(function (spec) {
      var items = SL.qa('.layer .sp > *, .spec__num', spec), title = spec.querySelector('.spec__title'), rest = SL.qa('.spec__lede, .label, .open', spec);
      g.set(items, { opacity: 0, y: 46 });
      g.set(title, { opacity: 0, x: -30 });
      g.set(rest, { opacity: 0, y: 22 });
      ScrollTrigger.create({
        trigger: spec, start: 'top 68%', once: true,
        onEnter: function () {
          var tl = g.timeline({ defaults: { ease: 'power3.out' } });
          tl.to(items, { opacity: 1, y: 0, duration: 1, stagger: .09 }, 0)
            .to(title, { opacity: 1, x: 0, duration: .9 }, .15)
            .to(rest, { opacity: 1, y: 0, duration: .8, stagger: .1 }, .45);
        }
      });
    });
  });
})();
