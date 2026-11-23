/* Trilha original e efeitos criados com Web Audio, sem conteúdo externo. */
(() => {
  'use strict';
  const button = document.getElementById('sound-toggle');
  if (!button) return;
  const label = button.querySelector('[data-sound-label]');
  const KEY = 'a-parede-fala-sound-choice';
  let enabled = true;
  try { enabled = localStorage.getItem(KEY) !== 'off'; } catch (_) {}
  const AudioAPI = window.AudioContext || window.webkitAudioContext;
  let ctx = null, master = null, musicTimer = null, clockTimer = null;
  let step = 0, tickStep = 0;
  // Volume amplificado para uso em celulares, limitado por compressor para evitar estouros.
  const LOUDNESS_BOOST = 4.5;

  function updateButton() {
    button.setAttribute('aria-pressed', String(enabled));
    button.setAttribute('aria-label', enabled ? 'Desligar o som' : 'Ligar o som');
    if (label) label.textContent = enabled ? 'SOM LIGADO' : 'SOM DESLIGADO';
  }

  function note(freq, duration, volume, wave = 'sine', delay = 0) {
    if (!enabled || !ctx || ctx.state !== 'running') return;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.linearRampToValueAtTime(Math.min(.65, volume * LOUDNESS_BOOST), start + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    osc.connect(gain); gain.connect(master);
    osc.start(start); osc.stop(start + duration + .04);
  }

  function emit(kind) {
    if (!enabled || !ctx || ctx.state !== 'running' || document.hidden) return;
    switch (kind) {
      case 'tap':
        note(580, .072, .06);
        note(840, .11, .025, 'triangle', .025);
        break;
      case 'start':
        [392, 523.25, 659.25].forEach((f,i) => note(f, .26, .041, 'sine', i * .12));
        break;
      case 'success':
        [523.25, 659.25, 783.99].forEach((f,i) => note(f, .25, .047, 'sine', i * .115));
        break;
      case 'error':
        note(240, .17, .043, 'triangle');
        note(190, .23, .031, 'sine', .12);
        break;
      case 'finish':
        [392, 523.25, 587.33, 783.99, 1046.5].forEach((f,i) =>
          note(f, i === 4 ? .7 : .25, .056, 'triangle', i * .16));
        break;
      case 'tick':
        tickStep += 1;
        note(tickStep % 2 ? 1170 : 920, .029, .019, 'square');
        note(tickStep % 2 ? 610 : 480, .054, .012, 'sine', .008);
        break;
    }
  }

  function music() {
    if (!enabled || document.hidden || !ctx || ctx.state !== 'running') return;
    const melody = [196, 220, 261.63, 293.66, 329.63, 293.66, 261.63, 220];
    note(melody[step % melody.length], .85, .018);
    if (step % 4 === 0) note(step % 8 === 0 ? 98 : 110, 1.6, .014, 'triangle');
    step += 1;
  }

  function clock() {
    if (!enabled || document.hidden) return;
    const started = document.getElementById('experiencia')?.classList.contains('is-playing');
    const active = document.querySelector('.quiz-app [data-quiz-clock]');
    if (started && active) emit('tick');
  }

  function stopLoops() {
    if (musicTimer !== null) window.clearInterval(musicTimer);
    if (clockTimer !== null) window.clearInterval(clockTimer);
    musicTimer = null; clockTimer = null;
  }

  function startLoops() {
    if (!enabled || !ctx || ctx.state !== 'running') return;
    if (musicTimer === null) { music(); musicTimer = window.setInterval(music, 970); }
    if (clockTimer === null) clockTimer = window.setInterval(clock, 1000);
  }

  async function unlock() {
    if (!enabled || !AudioAPI) return false;
    try {
      if (!ctx) {
        ctx = new AudioAPI();
        master = ctx.createGain();
        master.gain.value = .9;
        if (typeof ctx.createDynamicsCompressor === 'function') {
          const compressor = ctx.createDynamicsCompressor();
          compressor.threshold.value = -18;
          compressor.knee.value = 16;
          compressor.ratio.value = 5;
          compressor.attack.value = .004;
          compressor.release.value = .18;
          master.connect(compressor);
          compressor.connect(ctx.destination);
        } else {
          master.connect(ctx.destination);
        }
      }
      if (ctx.state !== 'running') await ctx.resume();
      if (ctx.state === 'running') { startLoops(); return true; }
    } catch (_) {}
    return false;
  }

  function play(kind) {
    if (!enabled) return;
    void unlock().then(ready => { if (ready) emit(kind); });
  }

  button.addEventListener('click', () => {
    enabled = !enabled;
    try { localStorage.setItem(KEY, enabled ? 'on' : 'off'); } catch (_) {}
    updateButton();
    if (enabled) play('success');
    else {
      stopLoops();
      if (ctx && ctx.state === 'running') void ctx.suspend().catch(() => {});
    }
  });

  // O primeiro toque também libera a trilha quando o navegador bloqueia autoplay.
  document.addEventListener('pointerdown', event => {
    if (!enabled) return;
    void unlock();
    const target = event.target;
    if (target.closest('button, a, label.answer') && !target.closest('#sound-toggle')) play('tap');
  }, true);

  document.addEventListener('keydown', event => {
    if (!enabled || event.repeat || (event.key !== 'Enter' && event.key !== ' ')) return;
    void unlock();
    if (event.target.closest('button, a, label.answer')) play('tap');
  }, true);
  document.addEventListener('visibilitychange', () => {
    if (enabled && !document.hidden) void unlock();
  });

  updateButton();
  window.WallAudio = { play, isEnabled: () => enabled };
  void unlock();
})();