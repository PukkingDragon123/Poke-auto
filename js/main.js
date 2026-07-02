/* =========================================================
   AUTOMON ARENA — bootstrap + sound
   ========================================================= */
'use strict';

/* ---------------- tiny synth sfx (no assets) ---------------- */

let audioCtx = null;
function sfx(kind) {
  if (State.profile && State.profile.muted) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const t = audioCtx.currentTime;
    const play = (freq, dur, type = 'square', vol = 0.04, delay = 0, slide = 0) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t + delay);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + delay + dur);
      g.gain.setValueAtTime(vol, t + delay);
      g.gain.exponentialRampToValueAtTime(0.0001, t + delay + dur);
      o.connect(g).connect(audioCtx.destination);
      o.start(t + delay);
      o.stop(t + delay + dur + 0.02);
    };
    switch (kind) {
      case 'tap':    play(440, 0.06, 'square', 0.03); break;
      case 'buy':    play(520, 0.07); play(780, 0.09, 'square', 0.04, 0.07); break;
      case 'merge':  play(392, 0.08); play(523, 0.08, 'square', 0.04, 0.08); play(659, 0.12, 'square', 0.04, 0.16); break;
      case 'hit':    play(180, 0.08, 'sawtooth', 0.05, 0, -80); break;
      case 'super':  play(240, 0.1, 'sawtooth', 0.06, 0, -120); play(160, 0.12, 'sawtooth', 0.05, 0.06, -60); break;
      case 'move':   play(600, 0.1, 'triangle', 0.05, 0, 300); break;
      case 'faint':  play(300, 0.25, 'triangle', 0.05, 0, -220); break;
      case 'fight':  play(330, 0.09); play(440, 0.09, 'square', 0.04, 0.09); play(554, 0.16, 'square', 0.05, 0.18); break;
      case 'craft':  play(700, 0.06); play(900, 0.1, 'square', 0.04, 0.06); break;
      case 'throw':  play(500, 0.2, 'triangle', 0.05, 0, 400); break;
      case 'catch':  play(523, 0.1); play(659, 0.1, 'square', 0.04, 0.1); play(784, 0.2, 'square', 0.05, 0.2); break;
      case 'fail':   play(220, 0.2, 'sawtooth', 0.05, 0, -100); break;
      case 'reward': play(523, 0.09); play(659, 0.09, 'square', 0.04, 0.09); play(784, 0.09, 'square', 0.04, 0.18); play(1046, 0.18, 'square', 0.05, 0.27); break;
      case 'victory':play(392, 0.12); play(523, 0.12, 'square', 0.04, 0.12); play(659, 0.12, 'square', 0.04, 0.24); play(784, 0.3, 'square', 0.05, 0.36); break;
    }
  } catch (e) { /* audio unavailable */ }
}

/* ---------------- init ---------------- */

function initGame() {
  load();
  renderAll();
  // A run decided right before a reload still owes its end-of-run rewards.
  resolveFinishedRun();
  // countdown labels & idle refresher
  setInterval(refreshTimers, 1000);
  // periodic autosave (timers etc. are derived from timestamps, but cheap insurance)
  setInterval(save, 15000);
}

document.addEventListener('DOMContentLoaded', initGame);
