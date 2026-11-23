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
  let lastSelect = 0;
  let audioActivated = false;
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
        note(560, .095, .075, 'triangle');
        note(850, .135, .033, 'sine', .036);
        break;
      case 'select':
        note(725, .10, .062, 'sine');
        note(1030, .15, .038, 'triangle', .045);
        break;
      case 'navigate':
        note(290, .17, .048, 'triangle');
        note(435, .22, .040, 'sine', .085);
        break;
      case 'next':
        note(430, .12, .065, 'triangle');
        note(610, .16, .055, 'sine', .07);
        note(820, .19, .031, 'sine', .15);
        break;
      case 'reset':
        note(650, .1, .058, 'sine');
        note(410, .23, .050, 'triangle', .075);
        break;
      case 'reveal':
        note(392, .22, .048, 'triangle');
        note(587.33, .29, .051, 'sine', .10);
        note(783.99, .44, .035, 'sine', .22);
        break;
      case 'page':
        note(460, .16, .034, 'triangle');
        note(630, .20, .034, 'sine', .08);
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
        note(tickStep % 2 ? 1170 : 920, .041, .030, 'square');
        note(tickStep % 2 ? 610 : 480, .09, .022, 'sine', .012);
        break;
    }
  }

  function music() {
    if (!enabled || document.hidden || !ctx || ctx.state !== 'running') return;
    const melody = [293.66, 349.23, 392, 440, 392, 349.23, 329.63, 293.66];
    const current = melody[step % melody.length];
    note(current, .96, .034, 'triangle');
    if (step % 2 === 0) note(current / 2, 1.17, .020, 'sine', .01);
    if (step % 4 === 0) note(step % 8 === 0 ? 146.83 : 174.61, 1.70, .022, 'sine');
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
      if (ctx.state === 'running') {
        startLoops();
        if (!audioActivated) {
          audioActivated = true;
          emit('reveal');
        }
        return true;
      }
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

  // Desbloqueia a música no gesto mais cedo disponível no navegador.
  // O autoplay é tentado na inicialização, mas Chrome e Safari podem exigir um toque.
  document.addEventListener('pointerdown', () => {
    if (enabled) void unlock();
  }, { capture: true, passive: true });
  document.addEventListener('touchstart', () => {
    if (enabled) void unlock();
  }, { capture: true, passive: true });
  document.addEventListener('keydown', event => {
    if (enabled && !event.repeat && (event.key === 'Enter' || event.key === ' ')) void unlock();
  }, true);

  function interactionSound(target) {
    if (!enabled || !target || typeof target.closest !== 'function') return;
    if (target.closest('#sound-toggle')) return;
    if (target.closest('label.answer, input[name="answer"]')) {
      lastSelect = Date.now();
      play('select');
    } else if (target.closest('#restart-quiz, #play-again')) {
      play('reset');
    } else if (target.closest('button[type="submit"], #start-quiz, #begin-button')) {
      play('next');
    } else if (target.closest('a[href]')) {
      play('navigate');
    } else if (target.closest('button, [role="button"]')) {
      play('tap');
    } else if (target.closest('.clue-card, .archive-card, .step')) {
      play('page');
    }
  }

  // Um único som por clique, inclusive em controles criados dinamicamente.
  document.addEventListener('click', event => interactionSound(event.target), true);

  // As setas do teclado podem selecionar alternativas sem disparar clique.
  document.addEventListener('change', event => {
    if (!enabled || !event.target?.matches?.('input[name="answer"]')) return;
    if (Date.now() - lastSelect > 160) {
      lastSelect = Date.now();
      play('select');
    }
  }, true);

  // Som breve de passagem ao descobrir uma nova seção durante a leitura.
  if ('IntersectionObserver' in window) {
    const seen = new WeakSet();
    const sections = document.querySelectorAll('main > section');
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !seen.has(entry.target)) {
          seen.add(entry.target);
          if (audioActivated && enabled) play('page');
        }
      });
    }, { threshold: .22 });
    sections.forEach(section => sectionObserver.observe(section));
  }

  document.addEventListener('visibilitychange', () => {
    if (enabled && !document.hidden) void unlock();
  });

  updateButton();
  window.WallAudio = { play, isEnabled: () => enabled };
  // Se autoplay estiver autorizado, a trilha começa na própria abertura.
  // Caso contrário, o primeiro toque inicia a música imediatamente.
  void unlock();
})();