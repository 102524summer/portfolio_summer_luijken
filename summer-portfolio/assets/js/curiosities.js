/* curiosities.js — tabs, character files, ranking list, fallacies, scribble pad */
(function () {
  'use strict';
  var SL = window.SL;
  if (!document.querySelector('.cur')) return;
  var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- tabs ---- */
  var tabs = $$('[role=tab]'), panels = $$('[role=tabpanel]');
  function show(id, focus) {
    tabs.forEach(function (t) { var on = t.id === 'tab-' + id; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
    panels.forEach(function (p) { p.hidden = p.id !== 'p-' + id; });
    history.replaceState(null, '', '#' + id);
    if (window.ScrollTrigger) setTimeout(function () { window.ScrollTrigger.refresh(); }, 100);
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(t.id.slice(4)); });
    t.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
      if (n === null) return; e.preventDefault(); show(tabs[(n + tabs.length) % tabs.length].id.slice(4), true);
    });
  });
  var h = location.hash.slice(1); if (h && $('#p-' + h)) show(h);

  /* ---- character files ---- */
  var C = {
    name: ['Wilhelmina Voss', 'Tomas Hale', 'Ines Okafor', 'Anselm Reyes', 'Margit Lindqvist', 'Caspian Dray', 'Odette Marsh', 'Jonas Kerr', 'Liesel Brandt', 'Rafferty Lane', 'Noor Haddad', 'Bram Vos'],
    job: ['Field nurse', 'Forger of papers', 'Night-shift radio operator', 'Disgraced detective', 'Court musician', 'Cartographer', 'Smuggler of small things', 'Apprentice alchemist', 'Piano tuner', 'Translator', 'Lighthouse keeper', 'Boxer turned baker'],
    want: ['To be forgiven by someone who is gone', 'One ordinary morning', 'To prove them all wrong, quietly', 'To be chosen first, for once', 'To get everyone home', 'The truth, whatever it costs', 'A name that is theirs alone'],
    wound: ['Was the one who survived', 'Learned early that love is a debt', 'Said nothing when it mattered', 'Believed the wrong person', 'Left without saying goodbye', 'Was told they were too much'],
    secret: ['Has been writing letters they never send', 'Knows who really did it', 'Can no longer remember a parent’s voice', 'Is not who the papers say', 'Has already decided to leave', 'Is terrified of being seen as kind'],
    era: ['Occupied Europe, 1943', 'A rain-soaked harbour town', 'A kingdom one winter from collapse', 'Rotterdam, after the bombing', 'A city that never sleeps and never asks', 'A border that keeps moving'],
    line: ['slow burn. big feelings. no easy exits.', 'the quiet ones always have the loudest secrets.', 'someone is lying. it might be the narrator.', 'tenderness, but make it dangerous.']
  };
  var dos = $('[data-dossier]'), btnC = $('[data-draw-char]');
  function drawChar() {
    $$('[data-d]', dos).forEach(function (el) {
      var k = el.getAttribute('data-d');
      el.textContent = k === 'no' ? ('000' + Math.floor(Math.random() * 999 + 1)).slice(-3) : pick(C[k]);
    });
    dos.classList.remove('is-flip'); void dos.offsetWidth; dos.classList.add('is-flip');
  }
  if (btnC) { btnC.addEventListener('click', drawChar); drawChar(); }

  /* ---- ranking list ---- */
  var form = $('[data-rank-form]'), list = $('[data-rank-list]'), empty = $('[data-rank-empty]'), clr = $('[data-rank-clear]');
  var KEY = 'sl-rank', items = [], curated = (window.SITE_FILMS || []).length > 0;
  if (curated) { items = window.SITE_FILMS.slice(); form.hidden = true; clr.hidden = true; }
  else { try { items = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { items = []; } }
  function save() { if (curated) return; try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} }
  function render() {
    list.innerHTML = '';
    items.forEach(function (t, i) {
      var li = document.createElement('li');
      li.innerHTML = '<span class="rk__n">' + (i + 1) + '</span><span class="rk__t"></span><span class="rk__b"></span>';
      li.querySelector('.rk__t').textContent = t;
      if (!curated) {
        var b = li.querySelector('.rk__b');
        [['↑', -1, 'Move up'], ['↓', 1, 'Move down'], ['×', 0, 'Remove']].forEach(function (d) {
          var x = document.createElement('button'); x.type = 'button'; x.textContent = d[0]; x.setAttribute('aria-label', d[2] + ': ' + t);
          x.addEventListener('click', function () {
            if (d[1] === 0) items.splice(i, 1); else { var j = i + d[1]; if (j < 0 || j >= items.length) return; var tmp = items[i]; items[i] = items[j]; items[j] = tmp; }
            save(); render();
          });
          b.appendChild(x);
        });
      }
      list.appendChild(li);
    });
    empty.hidden = items.length > 0;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault(); var inp = form.querySelector('input'), v = inp.value.trim();
    if (!v || items.length >= 20) return; items.push(v); inp.value = ''; save(); render();
  });
  clr.addEventListener('click', function () { items = []; save(); render(); });
  render();

  /* ---- fallacy of the day ---- */
  var F = [
    ['Ad hominem', 'Attacking the person instead of the argument.', '"You can’t trust her design critique, she dresses weirdly."'],
    ['Straw man', 'Distorting a position so it is easier to knock down.', '"You want a deadline? So you think art should be a factory."'],
    ['Slippery slope', 'Claiming one small step must lead to disaster, without showing how.', '"One font swap and the whole brand collapses."'],
    ['False dilemma', 'Pretending there are only two options.', '"Either you ship it perfect, or you don’t ship."'],
    ['Appeal to popularity', 'Treating “many people believe it” as proof.', '"Everyone uses that template, so it must be good."'],
    ['Post hoc', 'Assuming that because B followed A, A caused B.', '"I wore the lucky ring and the build passed."'],
    ['Survivorship bias', 'Studying only the winners and ignoring everything that failed.', '"All successful founders dropped out, so dropping out works."'],
    ['Appeal to authority', 'Accepting a claim because an authority said it, outside their field.', '"A famous chef says this framework is the best."'],
    ['Circular reasoning', 'The conclusion is hiding inside the premise.', '"It’s the best design because it’s the most beautiful one."'],
    ['Sunk cost', 'Continuing because of what is already spent, not what is ahead.', '"We’ve used this layout for months, we can’t change it now."'],
    ['Texas sharpshooter', 'Drawing the target around the bullet holes after the shots.', '"Look, the data proves my idea. (I picked this data last.)"'],
    ['Hasty generalisation', 'Drawing a broad rule from too few cases.', '"Two users got lost, so the whole navigation is broken."']
  ], fi = -1, fal = $('[data-fallacy]'), fbtn = $('[data-fallacy-next]');
  function nextF() {
    var n; do { n = Math.floor(Math.random() * F.length); } while (n === fi); fi = n;
    $('[data-f=name]', fal).textContent = F[n][0]; $('[data-f=what]', fal).textContent = F[n][1]; $('[data-f=ex]', fal).textContent = F[n][2];
  }
  if (fal) { fbtn.addEventListener('click', nextF); var day = Math.floor(Date.now() / 864e5) % F.length; fi = -1; nextF(); $('[data-f=name]', fal).textContent = F[day][0]; $('[data-f=what]', fal).textContent = F[day][1]; $('[data-f=ex]', fal).textContent = F[day][2]; fi = day; }

  /* ---- scribble pad ---- */
  var cv = $('[data-pad]');
  if (cv) {
    var cx = cv.getContext('2d'), col = '#1E2450', down = false, lx = 0, ly = 0;
    cx.lineCap = 'round'; cx.lineJoin = 'round';
    function pos(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; }
    cv.addEventListener('pointerdown', function (e) { down = true; var p = pos(e); lx = p[0]; ly = p[1]; cv.setPointerCapture(e.pointerId); cx.fillStyle = col; cx.beginPath(); cx.arc(lx, ly, 2.2, 0, 7); cx.fill(); });
    cv.addEventListener('pointermove', function (e) {
      if (!down) return; var p = pos(e), sp = Math.hypot(p[0] - lx, p[1] - ly);
      cx.strokeStyle = col; cx.lineWidth = Math.max(1.5, 6 - sp * .12); cx.beginPath(); cx.moveTo(lx, ly); cx.lineTo(p[0], p[1]); cx.stroke(); lx = p[0]; ly = p[1];
    });
    ['pointerup', 'pointercancel'].forEach(function (n) { cv.addEventListener(n, function () { down = false; }); });
    $$('[data-ink]').forEach(function (b) { b.addEventListener('click', function () { col = b.getAttribute('data-ink'); $$('[data-ink]').forEach(function (o) { o.setAttribute('aria-pressed', o === b); }); }); });
    $('[data-pad-clear]').addEventListener('click', function () { cx.clearRect(0, 0, cv.width, cv.height); });
    $('[data-pad-save]').addEventListener('click', function () {
      var o = document.createElement('canvas'); o.width = cv.width; o.height = cv.height; var c = o.getContext('2d');
      c.fillStyle = '#F2EEE8'; c.fillRect(0, 0, o.width, o.height); c.drawImage(cv, 0, 0);
      var a = document.createElement('a'); a.download = 'scribble.png'; a.href = o.toDataURL('image/png'); a.click();
    });
  }

  /* ---- entrance ---- */
  var g = SL.gsap;
  if (g && !SL.reduce) SL.onReady(function () {
    g.from('.cu-title', { yPercent: 40, opacity: 0, duration: 1, ease: 'power3.out' });
    g.from('.cu-sub, .cu-note', { opacity: 0, y: 16, duration: .8, stagger: .15, delay: .4 });
    g.from('.cu-hero .sp', { opacity: 0, scale: .9, duration: 1, stagger: .15, delay: .2 });
    g.from('.cu-tabs button', { opacity: 0, duration: .6, stagger: .07, delay: .6, clearProps: 'opacity' });
  });
})();
