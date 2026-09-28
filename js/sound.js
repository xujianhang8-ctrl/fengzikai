/* 护生之约 · sound.js
 * Every sound is synthesised with the Web Audio API, so there are no audio
 * files. Melodies use the Chinese pentatonic scale (宫商角徵羽). */
(function () {
  'use strict';

  let ctx = null, master = null, noiseBuf = null;
  let enabled = true;

  const NOTES = { C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.0, A4: 440.0, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0, C6: 1046.5 };

  function ensure() {
    if (!enabled) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function env(g, t, a, peak, dur) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }

  /* A plucked-string tone, a little like a guqin or zheng. */
  function pluck(freq, when = 0, dur = 1.4, vol = 0.22) {
    const c = ensure(); if (!c) return;
    const t = c.currentTime + when;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(freq * 6, t);
    lp.frequency.exponentialRampToValueAtTime(freq * 1.5, t + dur * 0.6);
    const g = c.createGain();
    env(g, t, 0.006, vol, dur);
    const o1 = c.createOscillator(); o1.type = 'triangle'; o1.frequency.value = freq;
    const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 2.005;
    const g2 = c.createGain(); g2.gain.value = 0.35;
    o1.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(master);
    o1.start(t); o2.start(t); o1.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }

  function melody(names, step = 0.18, vol = 0.2) {
    names.forEach((n, i) => { if (n) pluck(NOTES[n] || n, i * step, 1.3, vol); });
  }

  function noise(when, dur, f1, f2, vol, type = 'bandpass', q = 1) {
    const c = ensure(); if (!c) return;
    const t = c.currentTime + when;
    const src = c.createBufferSource(); src.buffer = noiseBuf;
    const bp = c.createBiquadFilter(); bp.type = type; bp.Q.value = q;
    bp.frequency.setValueAtTime(f1, t); bp.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = c.createGain(); env(g, t, 0.02, vol, dur);
    src.connect(bp); bp.connect(g); g.connect(master);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
  }

  function tone(f1, f2, when, dur, vol, type = 'sine') {
    const c = ensure(); if (!c) return;
    const t = c.currentTime + when;
    const o = c.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = c.createGain(); env(g, t, 0.01, vol, dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }

  const Sound = {
    unlock: ensure,
    setEnabled(on) {
      enabled = !!on;
      if (!ctx) return;
      if (!enabled && ctx.state === 'running') ctx.suspend().catch(() => {});
      if (enabled && ctx.state === 'suspended') ctx.resume().catch(() => {});
    },
    get enabled() { return enabled; },
    tap() { pluck(NOTES.G5, 0, 0.5, 0.08); },
    page() { noise(0, 0.28, 1800, 700, 0.06, 'bandpass', 0.8); },
    swish() { noise(0, 0.22, 900, 2600, 0.12, 'bandpass', 0.9); },
    plop() { tone(520, 160, 0, 0.18, 0.18); noise(0.02, 0.12, 1200, 500, 0.04); },
    splash() { noise(0, 0.35, 2400, 600, 0.09, 'bandpass', 0.6); tone(300, 120, 0, 0.2, 0.08); },
    chirp(n = 2, base = 2600) {
      for (let i = 0; i < n; i++) { tone(base, base * 1.45, i * 0.13, 0.08, 0.07); tone(base * 1.4, base * 1.1, i * 0.13 + 0.07, 0.06, 0.05); }
    },
    oops() { pluck(NOTES.D4, 0, 0.6, 0.18); pluck(NOTES.C4 * 0.94, 0.12, 0.8, 0.14); },
    soft() { pluck(NOTES.E5, 0, 0.9, 0.12); },
    good() { melody(['E5', 'G5', 'A5'], 0.1, 0.13); },
    hot() { noise(0, 0.25, 3000, 1200, 0.08, 'highpass', 0.7); tone(700, 300, 0, 0.18, 0.06, 'triangle'); },
    bump() { tone(180, 90, 0, 0.14, 0.2); noise(0, 0.08, 800, 300, 0.05); },
    stamp() { tone(140, 60, 0, 0.22, 0.28); noise(0, 0.07, 1500, 400, 0.08, 'lowpass', 0.5); },
    blow() { noise(0, 0.7, 600, 250, 0.1, 'bandpass', 0.5); },
    wind() { noise(0, 1.4, 300, 900, 0.12, 'bandpass', 0.4); },
    win() { melody(['C5', 'D5', 'E5', 'G5', 'A5', 'C6'], 0.14, 0.16); },
    song() { melody(['E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'E5', 'G5', 'C6', 'A5'], 0.2, 0.14); },
    promise() { melody(['G4', 'A4', 'C5', null, 'D5', 'E5', 'D5', 'C5'], 0.26, 0.15); },
  };

  window.Sound = Sound;
})();
