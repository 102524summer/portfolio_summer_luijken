/* ==========================================================================
   artifacts.js — the 3D objects (three.js, ES module, loaded last and only where needed)
   One shared WebGL renderer draws every artifact on the page into its own
   little 2D canvas, so they scroll natively with the paper and stay cheap.
   Objects: armillary sphere · engraved coins · compass · chrome knot
   ========================================================================== */
import * as THREE from '../vendor/three/three.module.min.js';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const DPR = Math.min(window.devicePixelRatio || 1, 2);

/* ---------- studio environment painted on a canvas: paper-white softboxes, lilac and magenta light, navy floor ---------- */
function paintEnvironment() {
  const W = 1536, H = 768, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#ffffff'); g.addColorStop(.26, '#f1edf8'); g.addColorStop(.46, '#cfc6e6');
  g.addColorStop(.52, '#8f86c4'); g.addColorStop(.72, '#4d5391'); g.addColorStop(1, '#262b63');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  const box = (u, v, w, h, col, a = 1, blur = 18) => { x.save(); x.filter = `blur(${blur}px)`; x.globalAlpha = a; x.fillStyle = col; x.fillRect(u * W, v * H, w * W, h * H); x.restore(); };
  // big softboxes
  box(.04, .06, .16, .34, '#ffffff'); box(.30, .03, .14, .40, '#ffffff'); box(.55, .08, .18, .30, '#fffaf4'); box(.80, .05, .12, .38, '#ffffff'); box(.15, .55, .3, .14, '#ffffff', .6, 24); box(.65, .58, .25, .12, '#ffffff', .55, 24);
  // coloured strips = the magenta + lilac kicker lights
  box(.24, .0, .018, .75, '#F1498C', .95, 8); box(.52, .0, .022, .70, '#F1498C', .9, 10); box(.76, .0, .016, .74, '#8F78C7', 1, 8); box(.95, .0, .02, .70, '#F1498C', .85, 9);
  // horizon glow and a warm bounce from below
  box(0, .46, 1, .035, '#ffffff', .75, 10); box(.1, .72, .25, .12, '#F1498C', .35, 30); box(.6, .78, .3, .1, '#8F78C7', .4, 30);
  // window mullions: thin dark verticals through the softboxes make the chrome look chrome
  x.fillStyle = 'rgba(30,36,80,.55)';
  for (const u of [.095, .135, .395, .685, .73, .885]) x.fillRect(u * W, 0, 4, H * .46);
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const chromeProps = { color: 0xffffff, metalness: 1, roughness: .11, iridescence: .42, iridescenceIOR: 1.5, iridescenceThicknessRange: [120, 480], envMapIntensity: 1.5 };
const makeChrome = (over = {}) => new THREE.MeshPhysicalMaterial({ ...chromeProps, ...over });

/* ---------- geometry helpers ---------- */
function starGeometry(R = 1, neck = .06, depth = .16) {
  // same sparkle outline as the SVG star: tip -> tip with a pinched, concave edge
  const sh = new THREE.Shape(), rot = (x, y, k) => { const c = [1, 0, -1, 0][k % 4], s = [0, -1, 0, 1][k % 4]; return [x * c - y * s, x * s + y * c]; };
  sh.moveTo(0, R);
  for (let k = 0; k < 4; k++) {
    const c1 = rot(neck * R, .32 * R, k), c2 = rot(.32 * R, neck * R, k), t = rot(R, 0, k);
    sh.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], t[0], t[1]);
  }
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: depth * .35, bevelSize: R * .03, bevelSegments: 5, curveSegments: 32 });
  g.center();
  return g;
}

function ticks(R, count, len, long, mat, thick = .012) {
  const m = new THREE.InstancedMesh(new THREE.BoxGeometry(thick, 1, thick), mat, count), o = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const a = i / count * Math.PI * 2, L = i % long === 0 ? len * 1.9 : len;
    o.position.set(Math.cos(a) * (R + L / 2), Math.sin(a) * (R + L / 2), 0);
    o.rotation.set(0, 0, a - Math.PI / 2); o.scale.set(1, L, 1); o.updateMatrix(); m.setMatrixAt(i, o.matrix);
  }
  return m;
}

/* ---------- coin face (height map painted on canvas; white = raised) ---------- */
function coinMaps(glyph, label) {
  const S = 1024, c = document.createElement('canvas'); c.width = c.height = S;
  const x = c.getContext('2d'), m = S / 2;
  x.fillStyle = '#000'; x.fillRect(0, 0, S, S);
  x.translate(m, m);
  x.strokeStyle = x.fillStyle = '#fff';
  const ring = (r, w, dash) => { x.lineWidth = w; x.setLineDash(dash || []); x.beginPath(); x.arc(0, 0, r, 0, Math.PI * 2); x.stroke(); x.setLineDash([]); };
  ring(m * .985, 26); ring(m * .9, 5); ring(m * .58, 6); ring(m * .54, 2, [2, 9]);
  // beaded border
  for (let i = 0; i < 120; i++) { const a = i / 120 * Math.PI * 2; x.beginPath(); x.arc(Math.cos(a) * m * .94, Math.sin(a) * m * .94, 5, 0, 7); x.fill(); }
  // rim lettering
  x.font = '700 62px "Space Mono", monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
  const unit = (label || 'LIFE IMITATES ART') + ' ✦ ', cap = Math.floor(Math.PI * 2 * m * .74 / 40), reps = Math.max(1, Math.round(cap / unit.length));
  const rep = unit.repeat(reps);
  for (let i = 0; i < rep.length; i++) {
    const a = i / rep.length * Math.PI * 2;
    x.save(); x.rotate(a); x.translate(0, -m * .74); x.fillText(rep[i], 0, 0); x.restore();
  }
  // glyphs
  x.lineJoin = 'round'; x.lineCap = 'round';
  const star4 = (R, k = .13) => { x.beginPath(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 - Math.PI / 2, b = a + Math.PI / 4, n = a + Math.PI / 2; if (i === 0) x.moveTo(Math.cos(a) * R, Math.sin(a) * R); x.quadraticCurveTo(Math.cos(b) * R * k, Math.sin(b) * R * k, Math.cos(n) * R, Math.sin(n) * R); } x.fill(); };
  if (glyph === 'star') {
    star4(m * .5); x.save(); x.rotate(Math.PI / 4); star4(m * .33, .18); x.restore();
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; x.lineWidth = i % 2 ? 2 : 4; x.beginPath(); x.moveTo(Math.cos(a) * m * .52, Math.sin(a) * m * .52); x.lineTo(Math.cos(a) * m * .57, Math.sin(a) * m * .57); x.stroke(); }
  } else if (glyph === 'tide') {
    x.lineWidth = 7;
    for (let k = -3; k <= 3; k++) { x.beginPath(); for (let i = -m * .5; i <= m * .5; i += 6) { const yy = k * 54 + Math.sin(i / 52 + k * .8) * 22; if (Math.hypot(i, yy) < m * .53) { if (i === -m * .5 || Math.hypot(i - 6, yy) >= m * .53) x.moveTo(i, yy); else x.lineTo(i, yy); } } x.stroke(); }
    x.beginPath(); x.arc(0, -m * .2, 36, 0, 7); x.fill();
  } else if (glyph === 'moth') {
    const wing = s => { x.save(); x.scale(s, 1); x.beginPath(); x.moveTo(8, -10); x.bezierCurveTo(120, -230, 300, -150, 250, -20); x.bezierCurveTo(230, 40, 130, 20, 8, 12); x.closePath(); x.moveTo(8, 18); x.bezierCurveTo(100, 40, 200, 70, 170, 180); x.bezierCurveTo(130, 230, 40, 150, 8, 30); x.closePath(); x.fill('evenodd'); x.restore(); };
    wing(1); wing(-1); x.lineWidth = 12; x.beginPath(); x.moveTo(0, -60); x.lineTo(0, 110); x.stroke();
    x.lineWidth = 5; x.beginPath(); x.moveTo(0, -60); x.quadraticCurveTo(-40, -150, -90, -170); x.moveTo(0, -60); x.quadraticCurveTo(40, -150, 90, -170); x.stroke();
    x.globalCompositeOperation = 'destination-out'; x.globalCompositeOperation = 'source-over';
  } else if (glyph === 'cube') {
    x.lineWidth = 11; const R = m * .36, p = i => [Math.cos(i * Math.PI / 3 - Math.PI / 2) * R, Math.sin(i * Math.PI / 3 - Math.PI / 2) * R];
    x.beginPath(); for (let i = 0; i < 6; i++) { const [a, b] = p(i); i ? x.lineTo(a, b) : x.moveTo(a, b); } x.closePath(); x.stroke();
    x.beginPath(); x.moveTo(0, 0); x.lineTo(...p(1)); x.moveTo(0, 0); x.lineTo(...p(3)); x.moveTo(0, 0); x.lineTo(...p(5)); x.stroke();
    ring(m * .16, 6);
  } else { star4(m * .4); }
  const tex = new THREE.CanvasTexture(c); tex.anisotropy = 8; tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

/* ---------- the objects ---------- */
const BUILDERS = {
  armillary(mat) {
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner);
    const ring = (R, t, rx, ry, rz, parent = inner) => { const m = new THREE.Mesh(new THREE.TorusGeometry(R, t, 24, 180), mat); m.rotation.set(rx, ry, rz); parent.add(m); return m; };
    const eq = ring(.98, .03, Math.PI / 2, 0, 0);
    const ecl = ring(.9, .024, Math.PI / 2, 0, .41);
    const mer = ring(1.0, .036, 0, 0, 0);
    const mer2 = ring(.8, .026, 0, Math.PI / 2, 0);
    const ring3 = ring(.62, .02, Math.PI / 2, 0, -.2);
    const tk = ticks(1.0, 96, .05, 8, mat); tk.rotation.x = Math.PI / 2; tk.position.set(0, 0, 0); inner.add(tk);
    const axis = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, 2.5, 12), mat); inner.add(axis);
    for (const s of [-1, 1]) { const cap = new THREE.Mesh(new THREE.SphereGeometry(.05, 24, 16), mat); cap.position.y = s * 1.25; inner.add(cap); }
    const core = new THREE.Mesh(new THREE.SphereGeometry(.27, 64, 48), makeChrome({ roughness: .03, iridescence: .4 })); inner.add(core);
    const star = new THREE.Mesh(starGeometry(.55, .06, .06), makeChrome({ roughness: .1 })); star.rotation.x = Math.PI / 2; star.position.y = 0; inner.add(star);
    const planets = [0xF1498C, 0x8F78C7, 0xffffff].map((col, i) => {
      const p = new THREE.Mesh(new THREE.SphereGeometry(.058 - i * .008, 32, 24), new THREE.MeshPhysicalMaterial({ color: col, metalness: .9, roughness: .12, envMapIntensity: 1.4 }));
      p.userData = { R: [.9, .98, .62][i], sp: [.6, -.38, .9][i], ph: i * 2.1, tilt: [.41, 0, -.2][i] }; inner.add(p); return p;
    });
    g.rotation.z = -.38; g.rotation.x = .28;
    return {
      obj: g, cam: { fov: 26, z: 6.3 },
      update(t, dt, p) {
        inner.rotation.y += dt * .22; mer2.rotation.y -= dt * .1; ring3.rotation.z += dt * .16;
        g.rotation.x = lerp(g.rotation.x, .28 + p.y * .4, .06); g.rotation.z = lerp(g.rotation.z, -.38 + p.x * -.28, .06);
        planets.forEach(q => { const a = t * q.userData.sp + q.userData.ph, R = q.userData.R; q.position.set(Math.cos(a) * R, 0, Math.sin(a) * R); q.position.applyAxisAngle(new THREE.Vector3(0, 0, 1), q.userData.tilt); });
      }
    };
  },

  coin(mat, el) {
    const glyph = el.dataset.glyph || 'star', label = el.dataset.label || 'LIFE IMITATES ART';
    const bump = coinMaps(glyph, label);
    const face = makeChrome({ bumpMap: bump, bumpScale: 5, roughness: .2, iridescence: .6 });
    const side = makeChrome({ roughness: .22 });
    const geo = new THREE.CylinderGeometry(1, 1, .13, 128, 1); geo.rotateX(Math.PI / 2);
    const coin = new THREE.Mesh(geo, [side, face, face]);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1, .05, 24, 160), mat); rim.position.z = 0;
    const rim2 = rim.clone(); rim.position.z = .065; rim2.position.z = -.065;
    const g = new THREE.Group(); g.add(coin, rim, rim2);
    const speed = parseFloat(el.dataset.spin || '.5');
    return {
      obj: g, cam: { fov: 24, z: 6.2 },
      update(t, dt, p, hover) {
        g.rotation.y += dt * speed * (hover ? 3.2 : 1);
        g.rotation.x = lerp(g.rotation.x, p.y * .5 + Math.sin(t * .6) * .08, .06);
        g.rotation.z = lerp(g.rotation.z, -p.x * .12 + .1, .06);
      }
    };
  },

  compass(mat) {
    const g = new THREE.Group(), needle = new THREE.Group();
    const ringM = new THREE.Mesh(new THREE.TorusGeometry(1, .035, 28, 200), mat), ring2 = new THREE.Mesh(new THREE.TorusGeometry(.8, .014, 20, 160), mat);
    const tk = ticks(1.04, 96, .05, 8, mat); const tk2 = ticks(.8, 48, .035, 4, mat, .008);
    const long = new THREE.Mesh(starGeometry(.92, .045, .1), mat), short = new THREE.Mesh(starGeometry(.58, .06, .08), makeChrome({ iridescence: 1 }));
    short.rotation.z = Math.PI / 4; short.position.z = -.04;
    const hub = new THREE.Mesh(new THREE.SphereGeometry(.1, 48, 32), makeChrome({ roughness: .03 })); hub.position.z = .09;
    needle.add(long, short, hub); g.add(ringM, ring2, tk, tk2, needle);
    g.rotation.x = .35;
    let ang = 0;
    return {
      obj: g, cam: { fov: 26, z: 5.6 },
      update(t, dt, p) {
        const target = reduce ? 0 : Math.atan2(-p.y, p.x) - Math.PI / 2 + Math.sin(t * .8) * .08;
        let d = target - ang; d = Math.atan2(Math.sin(d), Math.cos(d)); ang += d * .07;
        needle.rotation.z = ang; g.rotation.x = lerp(g.rotation.x, .3 + p.y * .25, .05); g.rotation.y = lerp(g.rotation.y, p.x * .35, .05);
      }
    };
  },

  knot(mat) {
    const m = new THREE.Mesh(new THREE.TorusKnotGeometry(.62, .21, 280, 40, 2, 3), makeChrome({ iridescence: .8, roughness: .08 }));
    const g = new THREE.Group(); g.add(m);
    return {
      obj: g, cam: { fov: 26, z: 6.6 },
      update(t, dt, p) { m.rotation.y += dt * .35; m.rotation.x += dt * .12; g.rotation.x = lerp(g.rotation.x, p.y * .5, .06); g.rotation.z = lerp(g.rotation.z, -p.x * .3, .06); }
    };
  }
};

/* ---------- hub: one renderer, many boxes ---------- */
export async function init() {
  const nodes = [...document.querySelectorAll('[data-artifact]')].filter(n => BUILDERS[n.dataset.artifact]);
  if (!nodes.length) return;
  const gl = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas: gl, alpha: true, antialias: true, powerPreference: 'high-performance', premultipliedAlpha: true });
  renderer.setPixelRatio(DPR); renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const pm = new THREE.PMREMGenerator(renderer), envTex = paintEnvironment(), env = pm.fromEquirectangular(envTex).texture;
  envTex.dispose(); pm.dispose();
  const mat = makeChrome();

  const pointer = { x: 0, y: 0, cx: innerWidth / 2, cy: innerHeight / 2 };
  addEventListener('pointermove', e => { pointer.cx = e.clientX; pointer.cy = e.clientY; }, { passive: true });

  const items = nodes.map(el => {
    const kind = el.dataset.artifact, b = BUILDERS[kind](mat, el), scene = new THREE.Scene();
    scene.environment = env; scene.add(b.obj);
    scene.add(new THREE.AmbientLight(0xffffff, .25));
    const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(3, 4, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0xF1498C, 1.2); rim.position.set(-4, -2, 3); scene.add(rim);
    const cam = new THREE.PerspectiveCamera(b.cam.fov, 1, .1, 50); cam.position.z = b.cam.z;
    const cv = el.querySelector('canvas'), ctx = cv.getContext('2d');
    const it = { el, b, scene, cam, cv, ctx, w: 0, h: 0, visible: true, hover: false, p: { x: 0, y: 0 } };
    const hoverTarget = el.closest('[data-hover-spin]') || el;
    hoverTarget.addEventListener('pointerenter', () => { it.hover = true; });
    hoverTarget.addEventListener('pointerleave', () => { it.hover = false; });
    return it;
  });

  let maxW = 0, maxH = 0;
  const size = () => {
    items.forEach(it => {
      const r = it.el.getBoundingClientRect(), w = Math.max(2, Math.round(r.width)), h = Math.max(2, Math.round(r.height));
      if (w !== it.w || h !== it.h) { it.w = w; it.h = h; it.cv.width = Math.round(w * DPR); it.cv.height = Math.round(h * DPR); it.cam.aspect = w / h; it.cam.updateProjectionMatrix(); }
      maxW = Math.max(maxW, w); maxH = Math.max(maxH, h);
    });
    renderer.setSize(maxW, maxH, false);
  };
  size();
  new ResizeObserver(() => { size(); drawAll(0, 0); }).observe(document.body);

  const io = new IntersectionObserver(es => es.forEach(e => { const it = items.find(i => i.el === e.target); if (it) it.visible = e.isIntersecting; }), { rootMargin: '120px' });
  items.forEach(it => io.observe(it.el));

  const clock = new THREE.Clock();
  function drawAll(t, dt) {
    renderer.setScissorTest(true);
    for (const it of items) {
      if (!it.visible && t) continue;
      const r = it.el.getBoundingClientRect();
      const nx = clamp((pointer.cx - (r.left + r.width / 2)) / (innerWidth * .5), -1, 1), ny = clamp((pointer.cy - (r.top + r.height / 2)) / (innerHeight * .5), -1, 1);
      it.p.x = reduce ? 0 : nx; it.p.y = reduce ? 0 : ny;
      it.b.update(t, dt, it.p, it.hover);
      renderer.setViewport(0, 0, it.w, it.h); renderer.setScissor(0, 0, it.w, it.h);
      renderer.clear(); renderer.render(it.scene, it.cam);
      const bufH = renderer.domElement.height, ph = Math.round(it.h * DPR), pw = Math.round(it.w * DPR);
      it.ctx.clearRect(0, 0, it.cv.width, it.cv.height);
      it.ctx.drawImage(renderer.domElement, 0, bufH - ph, pw, ph, 0, 0, it.cv.width, it.cv.height);
      if (!it.live) { it.live = true; it.el.classList.add('is-live'); }
    }
    renderer.setScissorTest(false);
  }

  if (reduce) { items.forEach(it => it.b.update(1.2, 0, it.p)); drawAll(1, 0); return; }
  (function loop() {
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime + .001;
    if (!document.hidden) drawAll(t, dt);
    requestAnimationFrame(loop);
  })();
  window.SL3D = { renderer, items };
}
