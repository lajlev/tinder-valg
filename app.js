// State
let currentIndex = 0;
let scores = {};
let topResult = null;
let dilemmas = [];

Object.keys(candidates).forEach(p => scores[p] = 0);

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

async function startGame() {
  currentIndex = 0;
  Object.keys(candidates).forEach(p => scores[p] = 0);

  // Try to generate AI dilemmas if API key is set
  if (hasApiKey()) {
    showScreen('generating');
    startGenAnimations();
    try {
      dilemmas = await generateDilemmas();
    } catch (e) {
      console.warn('AI generation failed, using fallback:', e.message);
      document.getElementById('genError').textContent = `AI fejlede: ${e.message}. Bruger standard-dilemmaer.`;
      document.getElementById('genError').classList.remove('hidden');
      await new Promise(r => setTimeout(r, 2000));
      dilemmas = [...fallbackDilemmas];
    }
    stopGenAnimations();
  } else {
    dilemmas = [...fallbackDilemmas];
  }

  showScreen('game');
  renderCard();
}

function renderCard() {
  if (currentIndex >= dilemmas.length) {
    showResults();
    return;
  }
  const d = dilemmas[currentIndex];
  const container = document.getElementById('cardContainer');
  container.innerHTML = `
    <div class="card" id="currentCard">
      <div class="card-inner">
        <div class="overlay-a" id="overlayA">← VALG A</div>
        <div class="overlay-b" id="overlayB">VALG B →</div>
        <div class="text-sm font-extrabold text-red-400 uppercase tracking-widest mb-5">${d.category}</div>
        <div class="flex gap-5 items-stretch">
          <div class="flex-1 text-left">
            <div class="text-xs uppercase tracking-wider text-red-400/70 mb-2 font-extrabold">← Valg A</div>
            <p class="text-lg font-extrabold leading-snug">${d.optionA}</p>
          </div>
          <div class="w-px bg-gray-600/50 self-stretch"></div>
          <div class="flex-1 text-right">
            <div class="text-xs uppercase tracking-wider text-blue-400/70 mb-2 font-extrabold">Valg B →</div>
            <p class="text-lg font-extrabold leading-snug">${d.optionB}</p>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('progressText').textContent = `${currentIndex + 1} / ${dilemmas.length}`;
  document.getElementById('categoryText').textContent = d.category;
  document.getElementById('progressBar').style.width = `${((currentIndex + 1) / dilemmas.length) * 100}%`;
  setupSwipe();
}

function setupSwipe() {
  const card = document.getElementById('currentCard');
  if (!card) return;
  let startX = 0, startY = 0, currentX = 0, isDragging = false;

  function onStart(x, y) {
    isDragging = true; startX = x; startY = y; currentX = 0;
    card.style.transition = 'none';
  }
  function onMove(x) {
    if (!isDragging) return;
    currentX = x - startX;
    const rotate = currentX * 0.1;
    card.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;
    const overlayA = document.getElementById('overlayA');
    const overlayB = document.getElementById('overlayB');
    if (overlayA) overlayA.style.opacity = currentX < -30 ? Math.min(1, (-currentX - 30) / 80) : 0;
    if (overlayB) overlayB.style.opacity = currentX > 30 ? Math.min(1, (currentX - 30) / 80) : 0;
  }
  function onEnd() {
    if (!isDragging) return;
    isDragging = false;
    if (Math.abs(currentX) > 80) {
      swipeAway(currentX > 0 ? 'B' : 'A');
    } else {
      card.classList.add('animating');
      card.style.transform = 'translateX(0) rotate(0deg)';
      const oA = document.getElementById('overlayA');
      const oB = document.getElementById('overlayB');
      if (oA) oA.style.opacity = 0;
      if (oB) oB.style.opacity = 0;
    }
  }

  card.addEventListener('touchstart', e => {
    onStart(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  card.addEventListener('touchmove', e => {
    onMove(e.touches[0].clientX);
  }, { passive: true });
  card.addEventListener('touchend', onEnd);

  card.addEventListener('mousedown', e => {
    e.preventDefault();
    onStart(e.clientX, e.clientY);
    const moveHandler = ev => onMove(ev.clientX);
    const upHandler = () => { onEnd(); document.removeEventListener('mousemove', moveHandler); document.removeEventListener('mouseup', upHandler); };
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  });
}

// === CRAZY SWIPE EFFECTS ===

const swipeEmojis = {
  A: ['🔥', '💥', '⚡', '🎯', '👊', '💣', '🚀'],
  B: ['✨', '🌊', '💎', '🎆', '⭐', '🌈', '🦄']
};

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function spawnParticles(x, y, color, count) {
  const container = document.createElement('div');
  container.className = 'particle-container';
  document.body.appendChild(container);

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = randomBetween(4, 16);
    const tx = randomBetween(-300, 300);
    const ty = randomBetween(-400, 100);
    const rot = randomBetween(-720, 720);
    p.style.cssText = `
      left: ${x}px; top: ${y}px; width: ${size}px; height: ${size}px;
      background: ${color}; --tx: ${tx}px; --ty: ${ty}px; --rot: ${rot}deg;
      animation-duration: ${randomBetween(0.4, 1)}s;
      animation-delay: ${randomBetween(0, 0.15)}s;
      ${Math.random() > 0.5 ? 'border-radius: 2px;' : ''}
    `;
    container.appendChild(p);
  }
  setTimeout(() => container.remove(), 1200);
}

function spawnEmojis(x, y, choice) {
  const emojis = swipeEmojis[choice];
  const count = randomBetween(5, 9) | 0;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'emoji-particle';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    const tx = randomBetween(-200, 200);
    const ty = randomBetween(-350, -50);
    const rot = randomBetween(-360, 360);
    el.style.cssText = `
      left: ${x}px; top: ${y}px;
      --tx: ${tx}px; --ty: ${ty}px; --rot: ${rot}deg;
      animation-delay: ${randomBetween(0, 0.2)}s;
      font-size: ${randomBetween(1, 2.5)}rem;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }
}

function screenFlash(color) {
  const flash = document.createElement('div');
  flash.className = 'screen-flash';
  flash.style.background = color;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 500);
}

function shockwave(x, y, color) {
  const el = document.createElement('div');
  el.className = 'shockwave';
  el.style.cssText = `left: ${x}px; top: ${y}px; border-color: ${color};`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

function spawnLightning(x, y, color) {
  const count = randomBetween(2, 5) | 0;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'lightning';
    const height = randomBetween(40, 120);
    const angle = randomBetween(-45, 45);
    el.style.cssText = `
      left: ${x + randomBetween(-60, 60)}px;
      top: ${y + randomBetween(-80, 0)}px;
      height: ${height}px; color: ${color};
      transform: rotate(${angle}deg);
      animation-delay: ${randomBetween(0, 0.15)}s;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 500);
  }
}

function screenShake() {
  const game = document.getElementById('game');
  game.classList.remove('shake');
  void game.offsetWidth; // force reflow
  game.classList.add('shake');
  setTimeout(() => game.classList.remove('shake'), 500);
}

function playCrazyEffects(choice) {
  const card = document.getElementById('currentCard');
  const rect = card ? card.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const colorA = '#ef4444';
  const colorB = '#3b82f6';
  const color = choice === 'A' ? colorA : colorB;

  // Always do: particles + emojis + shake
  spawnParticles(cx, cy, color, 25);
  spawnEmojis(cx, cy, choice);
  screenShake();

  // Randomly pick 1-2 extra effects for variety
  const extras = [
    () => screenFlash(color),
    () => shockwave(cx, cy, color),
    () => spawnLightning(cx, cy, color),
    () => spawnParticles(cx, cy, '#fff', 10),
    () => { shockwave(cx, cy, '#fff'); screenFlash(color); }
  ];
  const numExtras = (Math.random() > 0.4) ? 2 : 1;
  const shuffled = extras.sort(() => Math.random() - 0.5);
  for (let i = 0; i < numExtras; i++) shuffled[i]();
}

// === END CRAZY EFFECTS ===

function swipeAway(choice) {
  const card = document.getElementById('currentCard');
  if (!card) return;

  // Fire the crazy effects!
  playCrazyEffects(choice);

  const dir = choice === 'B' ? 1 : -1;
  card.classList.add('animating');
  card.style.transform = `translateX(${dir * 500}px) rotate(${dir * 30}deg)`;
  card.style.opacity = '0';

  const d = dilemmas[currentIndex];
  const key = choice === 'A' ? 'optionA' : 'optionB';
  const s = d.scoring[key];
  if (s) {
    Object.entries(s).forEach(([party, pts]) => { scores[party] = (scores[party] || 0) + pts; });
  }

  currentIndex++;
  setTimeout(renderCard, 400);
}

function choose(choice) {
  swipeAway(choice);
}

// Keyboard
document.addEventListener('keydown', e => {
  if (document.getElementById('game').classList.contains('active')) {
    if (e.key === 'ArrowLeft') choose('A');
    if (e.key === 'ArrowRight') choose('B');
  }
});

async function showResults() {
  showScreen('loading');

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const maxScore = sorted[0][1];
  const top5 = sorted.slice(0, 5);
  topResult = top5[0];

  // Try AI analysis
  let aiAnalysis = '';
  if (hasApiKey()) {
    try {
      aiAnalysis = await generateResultAnalysis(top5);
    } catch (e) {
      console.warn('AI analysis failed:', e.message);
    }
  }

  showScreen('results');
  const list = document.getElementById('resultsList');
  list.innerHTML = top5.map(([party, score], i) => {
    const c = candidates[party];
    const pct = Math.round((score / maxScore) * 100);
    const delay = i * 0.15;
    const isTop = i === 0;
    return `
      <div class="candidate-card ${isTop ? 'ring-2 ring-red-500' : ''}" style="animation-delay: ${delay}s">
        <div class="flex items-center gap-4">
          <div class="text-4xl">${c.emoji}</div>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              ${isTop ? '<span class="text-sm bg-red-600 text-white px-3 py-1 rounded-full font-extrabold tracking-wide">BEDSTE MATCH</span>' : ''}
            </div>
            <div class="font-extrabold text-xl">${c.name}</div>
            <div class="text-base text-gray-400 font-semibold">${c.party}</div>
          </div>
          <div class="text-3xl font-black" style="color: ${c.color}">${pct}%</div>
        </div>
        <div class="match-bar mt-3">
          <div class="match-fill" style="width: ${pct}%; background: ${c.color};"></div>
        </div>
      </div>
    `;
  }).join('');

  // Show AI analysis if available
  const analysisEl = document.getElementById('aiAnalysis');
  if (aiAnalysis && analysisEl) {
    analysisEl.innerHTML = `
      <div class="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mt-4">
        <div class="ai-badge mb-2">AI-analyse</div>
        <p class="text-gray-300 text-sm leading-relaxed">${aiAnalysis}</p>
      </div>
    `;
  } else if (analysisEl) {
    analysisEl.innerHTML = '';
  }
}

function shareResult() {
  if (!topResult) return;
  const [party, score] = topResult;
  const c = candidates[party];
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const maxScore = sorted[0][1];
  const pct = Math.round((score / maxScore) * 100);
  const text = `${c.emoji} Jeg fik ${pct}% match med ${c.name} (${c.party}) på Valg Tinder 26! Hvem er du?`;

  if (navigator.share) {
    navigator.share({ title: 'Valg Tinder 26', text }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      const msg = document.getElementById('shareMsg');
      msg.style.opacity = '1';
      setTimeout(() => msg.style.opacity = '0', 2000);
    });
  }
}

function restart() {
  currentIndex = 0;
  Object.keys(candidates).forEach(p => scores[p] = 0);
  topResult = null;
  showScreen('splash');
}

// API key setup
function openSettings() {
  const current = getApiKey();
  document.getElementById('apiKeyInput').value = current;
  document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettings() {
  document.getElementById('settingsModal').classList.add('hidden');
}

function saveSettings() {
  const key = document.getElementById('apiKeyInput').value.trim();
  saveApiKey(key);
  closeSettings();
  updateKeyStatus();
}

function updateKeyStatus() {
  const badge = document.getElementById('aiBadge');
  if (badge) {
    badge.classList.toggle('hidden', !hasApiKey());
  }
}

// === GENERATING SCREEN ANIMATIONS ===

const genFacts = [
  "Mixer politik og kaos...",
  "Konsulterer partierne...",
  "Opfinder vilde dilemmaer...",
  "Tjekker Christiansborg...",
  "Analyserer valgløfter...",
  "Ryster posen godt...",
  "Finder de svære valg...",
  "Kalibrerer demokratiet...",
  "Forbereder dine 25 swipes...",
  "Bager friske dilemmaer..."
];
let genFactInterval = null;
let genParticleInterval = null;

function startGenAnimations() {
  // Rotating fun facts
  let factIdx = 0;
  const factEl = document.getElementById('genFact');
  if (factEl) {
    factEl.textContent = genFacts[0];
    genFactInterval = setInterval(() => {
      factIdx = (factIdx + 1) % genFacts.length;
      factEl.style.opacity = '0';
      setTimeout(() => {
        factEl.textContent = genFacts[factIdx];
        factEl.style.opacity = '';
      }, 300);
    }, 3000);
  }

  // Floating background particles
  const container = document.getElementById('genBgParticles');
  if (container) {
    container.innerHTML = '';
    genParticleInterval = setInterval(() => {
      const p = document.createElement('div');
      p.className = 'gen-bg-particle';
      const size = randomBetween(3, 8);
      const colors = ['#ef4444', '#3b82f6', '#a855f7', '#22c55e', '#eab308', '#fff'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      p.style.cssText = `
        left: ${randomBetween(5, 95)}%;
        width: ${size}px; height: ${size}px;
        background: ${color};
        animation-duration: ${randomBetween(3, 7)}s;
        animation-delay: ${randomBetween(0, 0.5)}s;
      `;
      container.appendChild(p);
      setTimeout(() => p.remove(), 8000);
    }, 200);
  }
}

function stopGenAnimations() {
  if (genFactInterval) { clearInterval(genFactInterval); genFactInterval = null; }
  if (genParticleInterval) { clearInterval(genParticleInterval); genParticleInterval = null; }
  const container = document.getElementById('genBgParticles');
  if (container) container.innerHTML = '';
}

// === END GENERATING ANIMATIONS ===

// How it works modal
function openHowItWorks() {
  document.getElementById('howItWorksModal').classList.remove('hidden');
}

function closeHowItWorks() {
  document.getElementById('howItWorksModal').classList.add('hidden');
}

// Init
document.addEventListener('DOMContentLoaded', updateKeyStatus);
