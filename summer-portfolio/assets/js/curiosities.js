/* curiosities.js - tabs, character files, ranking list, fallacies, scribble pad */
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
    t.addEventListener('click', function () {
      show(t.id.slice(4));
      var bar = $('.cu-tabs'), g = SL && SL.gsap, pn = $('#p-' + t.id.slice(4));
      if (bar) window.scrollTo({ top: window.scrollY + bar.getBoundingClientRect().top - 90, behavior: SL.reduce ? 'auto' : 'smooth' });
      if (g && !SL.reduce && pn) g.from(pn.querySelectorAll(':scope > header > *, :scope > div > *'), { opacity: 0, y: 26, duration: .7, stagger: .08, ease: 'power3.out', clearProps: 'opacity,transform' });
    });
    t.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
      if (n === null) return; e.preventDefault(); show(tabs[(n + tabs.length) % tabs.length].id.slice(4), true);
    });
  });
  var h = location.hash.slice(1); if (h && $('#p-' + h)) show(h);

  /* ---- character files ---- */
  var CHARS = [
    { name: 'Vadim Sokolov', job: 'Russian mafia boss and billionaire', want: 'To go back and be brave at twenty', wound: 'Let fear win when it mattered most', secret: 'Still has every unopened letter his ex sent him for a decade', era: 'A New York office, interrupted by a secretary reading the wrong book' },
    { name: 'Matthias Vogler', job: 'Conscripted soldier, now a civilian with no war left to fight', want: 'To find out if the boy he loved made it home too', wound: 'Everything the war asked of him', secret: 'Loved his best friend the entire war and never said it', era: 'The day the surrender comes through' },
    { name: 'Dorian Vasquez', job: 'High schooler, the quiet one in the friend group', want: 'Nothing from Beckett, until Beckett actually asks', wound: 'A home life nobody in the friend group has ever been let in on', secret: 'He doesn\u2019t hate Beckett, he judges him, which is almost worse', era: 'A basketball court, then a bodega run that turns into an argument' },
    { name: 'Andrei Voss', job: 'ER doctor, secretly a century-old vampire', want: 'To never hurt the one human he has let himself love', wound: 'Decades of self-discipline, cracked in front of the person it was protecting', secret: 'Feeds only on animals and has never told Marcus what he is', era: 'A quiet living room, seconds after the control slips' },
    { name: 'Julian Cross', job: 'Former global pop star, now broke and alone', want: 'Proof his old life meant something to someone', wound: 'A fall from fame that nobody warned him about', secret: 'He is about to message the Olympic athlete who just credited him, live, on TV', era: 'A run-down apartment, the Olympics playing on an old TV' },
    { name: 'Marcus Doyle', job: 'Detective, formerly near-death', want: 'To understand what he just saw without losing the man he loves', wound: 'Has just seen something he cannot unsee', secret: 'None. He is the one receiving the secret tonight', era: 'A living room couch, moments after everything changed' },
    { name: 'Silas Bregman', job: 'Retired hitman, now a boxer', want: 'A real opponent, and maybe a real connection', wound: 'Six years of self-imposed silence', secret: 'Wrote \u201Cpromise\u201D on a notepad because he couldn\u2019t say it', era: 'A private, unmarked boxing ring after hours' },
    { name: 'Zaveri Rurikov', job: 'Russian mafia billionaire', want: 'Twenty years back, or at least the apology he never gave', wound: 'Chose his father\u2019s empire over the love of his life', secret: 'Just searched Caleb\u2019s name for the first time in two decades', era: 'A luxury grocery store, standing next to his wife' },
    { name: 'Julian Ashworth', job: 'Bestselling novelist, perpetually overlooked', want: 'To be seen by his own twin brother, just once', wound: 'A lifetime of being the \u201Cother\u201D twin', secret: 'None. He finally said the quiet part out loud', era: 'A Sunday family dinner that goes very wrong' },
    { name: 'Elliot Marsh', job: 'MIT student and part-time babysitter', want: 'Nothing in return, which is exactly why Julian notices him', wound: 'A deep instinct to care for people who are struggling', secret: 'None. He is an open book, which is the twist in a cast full of guarded men', era: 'A tired single dad\u2019s kitchen table, mid-homework-help' }
  ];
  var LINES = ['slow burn. big feelings. no easy exits.', 'the quiet ones always have the loudest secrets.', 'someone is lying. it might be the narrator.', 'tenderness, but make it dangerous.', 'everyone is guarded. someone is about to stop.'];
  var dos = $('[data-dossier]'), btnC = $('[data-draw-char]'), lastC = -1;
  function drawChar() {
    var n; do { n = Math.floor(Math.random() * CHARS.length); } while (n === lastC); lastC = n;
    var c = CHARS[n];
    $$('[data-d]', dos).forEach(function (el) {
      var k = el.getAttribute('data-d');
      el.textContent = k === 'no' ? ('000' + Math.floor(Math.random() * 999 + 1)).slice(-3) : k === 'line' ? pick(LINES) : c[k];
    });
    dos.classList.remove('is-flip'); void dos.offsetWidth; dos.classList.add('is-flip');
  }
  if (btnC) { btnC.addEventListener('click', drawChar); drawChar(); }

  /* ---- ranking list ---- */
  var form = $('[data-rank-form]'), list = $('[data-rank-list]'), empty = $('[data-rank-empty]'), clr = $('[data-rank-clear]');
  var KEY = 'sl-rank', items = [], curated = false;
  try { items = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { items = []; }
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
    ['Straw Man', 'Misrepresenting someone\u2019s argument to make it easier to attack.', '\u201CI said we should write tests. So you want us to stop shipping features.\u201D', 'coding'],
    ['Ad Hominem', 'Attacking the person instead of the argument.', '\u201CWhy listen to his feedback on our group project? He turned up late once.\u201D', 'school'],
    ['False Dilemma', 'Presenting only two options when more exist.', '\u201CEither you loved the ending, or you didn\u2019t understand the film.\u201D', 'film'],
    ['Slippery Slope', 'Claiming one event will inevitably lead to extreme consequences.', '\u201CIf the deadline moves once, nobody will ever hand anything in on time again.\u201D', 'school'],
    ['Appeal to Authority', 'Assuming a claim is true because an authority figure says so.', '\u201CA celebrity chef says never put yogurt in banana bread, so it must taste bad.\u201D', 'baking'],
    ['Bandwagon', 'Arguing something is true because many people believe it.', '\u201CThe whole cinema is sold out, so it must be a masterpiece.\u201D', 'film'],
    ['Post Hoc Ergo Propter Hoc', 'Assuming that because B followed A, A caused B.', '\u201CI changed the button colour and then the server crashed. The colour broke it.\u201D', 'coding'],
    ['No True Scotsman', 'Redefining a group to avoid counterexamples.', '\u201CNo real film fan would rewatch a superhero movie.\u201D', 'film'],
    ['Appeal to Nature', 'Assuming natural things are inherently good.', '\u201CIt is all-natural, so I can eat the whole tray of cinnamon rolls.\u201D', 'baking'],
    ['Circular Reasoning', 'Using the conclusion as evidence for itself.', '\u201CThis code is clean because it is well written, and it is well written because it is clean.\u201D', 'coding'],
    ['Ship of Theseus', 'Bonus paradox: if every part of something is replaced, is it still the same thing?', '\u201CIf we rewrite every file of the app over the years, is it still the same app?\u201D', 'coding \u00B7 bonus']
  ], fi = -1, fal = $('[data-fallacy]'), fbtn = $('[data-fallacy-next]');
  function showF(n) {
    fi = n;
    $('[data-f=name]', fal).textContent = F[n][0]; $('[data-f=what]', fal).textContent = F[n][1]; $('[data-f=ex]', fal).textContent = F[n][2]; $('[data-f=tag]', fal).textContent = F[n][3];
  }
  function nextF() { var n; do { n = Math.floor(Math.random() * F.length); } while (n === fi); showF(n); }
  if (fal) { fbtn.addEventListener('click', nextF); showF(Math.floor(Date.now() / 864e5) % F.length); }

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
