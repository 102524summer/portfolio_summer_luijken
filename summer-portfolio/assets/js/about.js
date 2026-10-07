/* about.js — drawers + the progressive-overload bar */
(function () {
  'use strict';
  var SL = window.SL;
  if (!document.querySelector('.about')) return;

  function setOpen(dr, open) {
    var btn = dr.querySelector('.dr__btn'), body = dr.querySelector('.dr__body');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    body.classList.toggle('is-open', open);
    if (open) setTimeout(function () { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); }, 700);
  }
  var drawers = Array.prototype.slice.call(document.querySelectorAll('[data-drawer]'));
  drawers.forEach(function (dr) {
    dr.querySelector('.dr__btn').addEventListener('click', function () {
      var open = this.getAttribute('aria-expanded') !== 'true';
      drawers.forEach(function (o) { if (o !== dr) setOpen(o, false); });
      setOpen(dr, open);
      if (open) setTimeout(function () { var r = dr.getBoundingClientRect(); if (r.top < 70 || r.top > window.innerHeight * .5) window.scrollTo({ top: window.scrollY + r.top - 90, behavior: SL.reduce ? 'auto' : 'smooth' }); }, 120);
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-open]'), function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var dr = document.getElementById(a.getAttribute('data-open'));
      if (!dr) return;
      drawers.forEach(function (o) { setOpen(o, o === dr); });
      setTimeout(function () { window.scrollTo({ top: window.scrollY + dr.getBoundingClientRect().top - 90, behavior: SL.reduce ? 'auto' : 'smooth' }); }, 80);
      history.replaceState(null, '', '#' + dr.id);
    });
  });
  var h = location.hash.slice(1), target = h && document.getElementById(h);
  if (target && target.hasAttribute('data-drawer')) { setOpen(target, true); setTimeout(function () { window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top - 90 }); }, 400); }

  /* barbell: each click loads a plate on both sides (kg) */
  var bar = document.querySelector('[data-bar]');
  if (bar) {
    var BAR = 20, plates = [], total = bar.querySelector('[data-total]'), sides = bar.querySelectorAll('[data-side]');
    var spec = { 1.25: ['#C9BEE8', 46, 10], 2.5: ['#8F78C7', 62, 12], 5: ['#F1498C', 84, 15], 10: ['#E5226B', 108, 20], 20: ['#1E2450', 130, 26] };
    function draw() {
      var sum = BAR; plates.forEach(function (p) { sum += p * 2; });
      total.textContent = (Math.round(sum * 100) / 100).toString();
      Array.prototype.forEach.call(sides, function (s) {
        s.innerHTML = '';
        plates.slice().sort(function (a, b) { return b - a; }).forEach(function (p) {
          var el = document.createElement('div'), sp = spec[p];
          el.className = 'pl'; el.style.setProperty('--pc', sp[0]); el.style.setProperty('--ph', sp[1] * 1.15 + 'px'); el.style.setProperty('--pw', sp[2] + 'px');
          el.innerHTML = '<em>' + p + '</em>'; if (p === 20) el.querySelector('em').style.color = '#F2EEE8';
          s.appendChild(el);
        });
      });
    }
    Array.prototype.forEach.call(bar.querySelectorAll('[data-add]'), function (b) {
      b.addEventListener('click', function () { if (plates.length < 7) { plates.push(parseFloat(b.getAttribute('data-add'))); draw(); } });
    });
    bar.querySelector('[data-reset]').addEventListener('click', function () { plates = []; draw(); });
    draw();
  }

  /* hero entrance */
  var g = SL.gsap;
  if (g && !SL.reduce) SL.onReady(function () {
    g.from('.ab-title span', { yPercent: 60, opacity: 0, duration: 1, stagger: .15, ease: 'power3.out' });
    g.from('.ab-hero__p, .ab-hero__s, .ab-hero__eyebrow', { opacity: 0, y: 20, duration: .8, stagger: .12, delay: .5, ease: 'power3.out' });
    g.from('.ab-hero__paper .sp', { opacity: 0, scale: .92, duration: 1, stagger: .15, delay: .3, ease: 'power3.out' });
  });
})();
