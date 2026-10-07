// votes stored in localStorage
const TOTAL = 10;
const STORAGE_KEY = "aivh";

let votes = {};
try {
  votes = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
} catch (e) {
  votes = {};
}
let cur = 0;

const $ = id => document.getElementById(id);

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(votes)); } catch (e) {}
}

function total()  { return Object.keys(votes).length; }
function count(t) { return Object.values(votes).filter(v => v === t).length; }
function nextOpen(from = 0) {
  for (let i = from; i < TOTAL; i++) if (!votes[i + 1]) return i;
  return undefined;
}

// ── NAVIGATION ──
function show(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  $("page-" + page).classList.add("active");
  document.querySelectorAll(".nav-links button").forEach(b =>
    b.classList.toggle("active", b.dataset.page === page)
  );
  window.scrollTo(0, 0);

  if (page === "vote")    renderVote();
  if (page === "results") renderResults();
  if (page === "home")    $("home-total").textContent = total();
}

// ── VOTE PAGE ──
function renderVote() {
  const first = nextOpen();
  cur = first !== undefined ? first : 0;
  renderCard();
  renderDots();
}

function renderCard() {
  const n = cur + 1;
  $("vote-label").textContent = n + " / " + TOTAL;
  $("img-ai").src    = IMGS["ai"   + n];
  $("img-human").src = IMGS["real" + n];
  $("card-ai").classList.remove("selected");
  $("card-human").classList.remove("selected");
}

function renderDots() {
  $("dots").innerHTML = Array.from({ length: TOTAL }, (_, i) => {
    let c = "dot";
    if (votes[i + 1]) c += " done";
    if (i === cur)    c += " cur";
    return `<div class="${c}"></div>`;
  }).join("");
}

function pick(side) {
  $("card-ai").classList.toggle("selected",    side === "ai");
  $("card-human").classList.toggle("selected", side === "human");
}

function vote(type) {
  votes[cur + 1] = type;
  save();

  if (total() >= TOTAL) {
    renderDots();
    launchConfetti();
    setTimeout(() => $("overlay").classList.add("show"), 400);
    return;
  }

  const nx = nextOpen(cur + 1) ?? nextOpen();
  if (nx !== undefined) cur = nx;
  renderCard();
  renderDots();
}

function prevEx() {
  if (cur > 0) { cur--; renderCard(); renderDots(); }
}

function skipEx() {
  const nx = nextOpen(cur + 1);
  if (nx !== undefined) { cur = nx; renderCard(); renderDots(); }
}

// ── RESULTS PAGE ──
function renderResults() {
  const t = total(), ai = count("ai"), human = count("human"), eq = count("equal");

  $("r-total").textContent = t;
  $("r-ai").textContent    = t ? Math.round(ai    / t * 100) + "%" : "—";
  $("r-human").textContent = t ? Math.round(human / t * 100) + "%" : "—";

  $("bars").innerHTML = [
    { l: "AI-gegenereerd beter",      v: ai,    cls: "ai"    },
    { l: "Menselijk ontworpen beter", v: human, cls: "human" },
    { l: "Geen voorkeur",             v: eq,    cls: "light" }
  ].map(({ l, v, cls }) => {
    const pct = t ? Math.round(v / t * 100) : 0;
    return `<div class="bar-row">
      <div class="bar-top"><span>${l}</span><span>${v} ${v === 1 ? "stem" : "stemmen"} (${pct}%)</span></div>
      <div class="bar-track"><div class="bar-fill ${cls}" style="width:${pct}%"></div></div>
    </div>`;
  }).join("");
}

// ── RESET & OVERLAY ──
function resetVotes() {
  votes = {};
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  cur = 0;
  show("vote");
}

function closeOverlay() {
  $("overlay").classList.remove("show");
  $("confetti").innerHTML = "";
}

// ── CONFETTI ──
function launchConfetti() {
  const w = $("confetti");
  const colors = ["#FFFFFF", "#7997E6", "#B37AD4", "#206ABC", "#CAA9F3"];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement("div");
    p.className = "cp";
    const c = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = `left:${Math.random()*100}vw;width:${5+Math.random()*7}px;height:${5+Math.random()*7}px;background:${c};animation-duration:${1.5+Math.random()*2}s;animation-delay:${Math.random()*0.5}s;border-radius:${Math.random()>.5?"50%":"2px"}`;
    w.appendChild(p);
  }
  setTimeout(() => { w.innerHTML = ""; }, 3500);
}

// ── EVENTS ──
document.querySelectorAll(".nav-links button").forEach(b =>
  b.addEventListener("click", () => show(b.dataset.page))
);
document.querySelectorAll("[data-go]").forEach(b =>
  b.addEventListener("click", () => show(b.dataset.go))
);
document.querySelectorAll("[data-pick]").forEach(b =>
  b.addEventListener("click", () => pick(b.dataset.pick))
);
document.querySelectorAll("[data-vote]").forEach(b =>
  b.addEventListener("click", () => vote(b.dataset.vote))
);
$("btn-prev").addEventListener("click", prevEx);
$("btn-skip").addEventListener("click", skipEx);
$("btn-reset").addEventListener("click", resetVotes);
$("btn-overlay-results").addEventListener("click", () => { closeOverlay(); show("results"); });
$("btn-overlay-reset").addEventListener("click", () => { closeOverlay(); resetVotes(); });

// ── INIT ──
$("home-total").textContent = total();
