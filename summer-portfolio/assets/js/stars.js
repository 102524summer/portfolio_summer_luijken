/* ==========================================================================
   stars.js - the "Dancing stars" end assignment, running live on the Three.js page.
   Same idea as the original (nine extruded stars, GSAP float + sway, raycaster
   hover and click), adapted to live inside a box instead of the whole window.
   Needs gsap (loaded before this file). three.js comes from assets/vendor.
   ========================================================================== */
import * as THREE from '../vendor/three/three.module.min.js';

const YELLOW = 0xf2c12e;
const STAR_COUNT = 9;

function boot(host) {
  const gsap = window.gsap;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stage = host.querySelector('.stars__stage');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); }
  catch (e) { host.classList.add('is-failed'); return; }
  if (!gsap) { host.classList.add('is-failed'); return; }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x0d0d12, 1);
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
  camera.position.z = 9.5;

  const key = new THREE.DirectionalLight(0xffffff, 2); key.position.set(4, 5, 6); scene.add(key);
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  function starGeometry() {
    const shape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 1.4 : 0.55;
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
    }
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.4, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 2 });
    g.center(); g.scale(0.55, 0.55, 0.55);
    return g;
  }

  const stars = [];
  function dance(m) {
    if (reduce) return;
    m.userData.floatTween = gsap.to(m.position, { y: m.userData.baseY + 0.4, duration: 1.2 + Math.random() * 0.8, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: Math.random() });
    m.userData.swayTween = gsap.to(m.rotation, { z: 0.25, duration: 1.5 + Math.random(), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: Math.random() });
  }
  for (let i = 0; i < STAR_COUNT; i++) {
    const m = new THREE.Mesh(starGeometry(), new THREE.MeshStandardMaterial({ color: YELLOW, roughness: 0.4, metalness: 0.1 }));
    m.rotation.x = Math.PI;
    const baseX = ((i % 3) - 1) * 3.2, baseY = (Math.floor(i / 3) - 1) * 2.6;
    m.position.set(baseX, baseY, 0);
    m.userData = { baseX, baseY, hovering: false, hue: Math.random() };
    scene.add(m); stars.push(m); dance(m);
  }

  const ray = new THREE.Raycaster(), pointer = new THREE.Vector2(9, 9);
  let hovered = null, visible = false, raf = 0;

  function setPointer(e) {
    const r = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  }
  function setHover(m, on) {
    if (m.userData.hovering === on) return;
    m.userData.hovering = on;
    if (on) {
      gsap.to(m.scale, { x: 1.35, y: 1.35, z: 1.35, duration: 0.35, ease: 'back.out(3)' });
      gsap.to(m.rotation, { y: m.rotation.y + Math.PI * 2, duration: 0.8, ease: 'power2.out' });
    } else {
      gsap.to(m.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'power2.out' });
      gsap.to(m.material.color, { r: ((YELLOW >> 16) & 255) / 255, g: ((YELLOW >> 8) & 255) / 255, b: (YELLOW & 255) / 255, duration: 0.5 });
    }
  }
  function pop(m) {
    m.userData.floatTween && m.userData.floatTween.kill();
    m.userData.swayTween && m.userData.swayTween.kill();
    gsap.to(m.scale, { x: 0, y: 0, z: 0, duration: 0.4, ease: 'back.in(2)', onComplete: () => respawn(m) });
    gsap.to(m.rotation, { z: m.rotation.z + Math.PI * 3, duration: 0.4, ease: 'power1.in' });
  }
  function respawn(m) {
    m.position.set(m.userData.baseX, m.userData.baseY, 0);
    m.rotation.set(Math.PI, 0, 0);
    m.material.color.setHex(YELLOW);
    m.userData.hovering = false;
    gsap.to(m.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'back.out(3)' });
    dance(m);
  }

  const el = renderer.domElement;
  el.addEventListener('pointermove', setPointer);
  el.addEventListener('pointerleave', () => pointer.set(9, 9));
  el.addEventListener('pointerdown', (e) => {
    setPointer(e);
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(stars)[0];
    if (hit) pop(hit.object);
    if (e.pointerType !== 'mouse') setTimeout(() => pointer.set(9, 9), 120);
  });

  function frame() {
    raf = requestAnimationFrame(frame);
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(stars)[0];
    const next = hit ? hit.object : null;
    if (next !== hovered) { hovered && setHover(hovered, false); next && setHover(next, true); hovered = next; }
    el.style.cursor = next ? 'pointer' : 'default';
    stars.forEach((m) => { if (m.userData.hovering) { m.userData.hue = (m.userData.hue + 0.01) % 1; m.material.color.setHSL(m.userData.hue, 0.75, 0.55); } });
    renderer.render(scene, camera);
  }

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, true);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  new IntersectionObserver((es) => {
    visible = es[0].isIntersecting;
    if (visible && !raf) frame();
    if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
  }, { rootMargin: '120px' }).observe(host);
  host.classList.add('is-live');
}

document.querySelectorAll('[data-demo="stars"]').forEach(boot);
