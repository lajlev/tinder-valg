// Web Audio API synthesized sound effects — muted by default

let audioCtx = null;
let soundEnabled = false;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('sound_enabled', soundEnabled ? '1' : '0');
  updateSoundIcon();
  if (soundEnabled) {
    getAudioCtx();
    playTone(440, 0.08, 'sine', 0.15);
  }
}

function updateSoundIcon() {
  const btn = document.getElementById('soundToggle');
  if (btn) btn.textContent = soundEnabled ? '🔊' : '🔇';
}

function initSound() {
  soundEnabled = localStorage.getItem('sound_enabled') === '1';
  updateSoundIcon();
}

// === SYNTH PRIMITIVES ===

function playTone(freq, duration, type = 'sine', volume = 0.2, delay = 0) {
  if (!soundEnabled) return;
  const ctx = getAudioCtx();
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration);
}

function playNoise(duration, volume = 0.1, delay = 0) {
  if (!soundEnabled) return;
  const ctx = getAudioCtx();
  const t = ctx.currentTime + delay;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  src.connect(gain).connect(ctx.destination);
  src.start(t);
}

// === SOUND EFFECTS ===

function playSwipeSound(choice) {
  if (!soundEnabled) return;
  if (choice === 'A') {
    // Punchy bass swoosh left
    playTone(200, 0.2, 'sawtooth', 0.15);
    playTone(120, 0.3, 'sine', 0.2, 0.03);
    playNoise(0.15, 0.08);
  } else {
    // Bright swoosh right
    playTone(400, 0.15, 'square', 0.1);
    playTone(600, 0.2, 'sine', 0.15, 0.03);
    playNoise(0.12, 0.06);
  }
}

function playExplosionSound() {
  if (!soundEnabled) return;
  // Impact boom
  playTone(80, 0.4, 'sine', 0.25);
  playTone(60, 0.5, 'triangle', 0.15, 0.02);
  playNoise(0.25, 0.12);
}

function playGeneratingLoop() {
  if (!soundEnabled) return null;
  const ctx = getAudioCtx();
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const masterGain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.value = 220;
  osc2.type = 'triangle';
  osc2.frequency.value = 330;

  lfo.type = 'sine';
  lfo.frequency.value = 0.5;
  lfoGain.gain.value = 30;
  lfo.connect(lfoGain);
  lfoGain.connect(osc1.frequency);
  lfoGain.connect(osc2.frequency);

  masterGain.gain.value = 0;
  masterGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1);

  osc1.connect(masterGain);
  osc2.connect(masterGain);
  masterGain.connect(ctx.destination);

  osc1.start();
  osc2.start();
  lfo.start();

  return { osc1, osc2, lfo, masterGain, ctx };
}

function stopGeneratingLoop(loop) {
  if (!loop) return;
  const t = loop.ctx.currentTime;
  loop.masterGain.gain.linearRampToValueAtTime(0.001, t + 0.5);
  setTimeout(() => {
    loop.osc1.stop();
    loop.osc2.stop();
    loop.lfo.stop();
  }, 600);
}

function playResultFanfare() {
  if (!soundEnabled) return;
  // Ascending arpeggio
  const notes = [262, 330, 392, 523, 659];
  notes.forEach((freq, i) => {
    playTone(freq, 0.3, 'sine', 0.12, i * 0.12);
    playTone(freq * 1.005, 0.3, 'triangle', 0.06, i * 0.12);
  });
  // Final chord
  playTone(523, 0.8, 'sine', 0.1, 0.7);
  playTone(659, 0.8, 'sine', 0.08, 0.7);
  playTone(784, 0.8, 'sine', 0.06, 0.7);
}

function playCardAppear() {
  if (!soundEnabled) return;
  playTone(880, 0.08, 'sine', 0.06);
  playTone(1100, 0.1, 'sine', 0.04, 0.02);
}

function playStartSound() {
  if (!soundEnabled) return;
  playTone(330, 0.15, 'square', 0.08);
  playTone(440, 0.15, 'square', 0.08, 0.1);
  playTone(660, 0.2, 'square', 0.1, 0.2);
}
