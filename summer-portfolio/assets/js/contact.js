/* contact.js — headline entrance */
(function () {
  'use strict';
  var SL = window.SL, g = SL && SL.gsap;
  if (!document.querySelector('.ct') || !g || SL.reduce) return;
  SL.onReady(function () {
    g.from('.ct-title span', { yPercent: 55, opacity: 0, duration: 1.1, stagger: .18, ease: 'power3.out' });
    g.from('.ct-eyebrow, .ct-p, .ct-mail, .ct-soc li, .ct-where', { opacity: 0, y: 18, duration: .8, stagger: .1, delay: .5, ease: 'power3.out' });
    g.from('.ct-angel, .ct-raven', { opacity: 0, scale: .94, duration: 1.2, stagger: .15, delay: .2, ease: 'power3.out' });
  });
})();
