/* A Parede Fala — investigação do mural físico, edição 2026.
   As respostas são verificadas localmente. Nenhuma pista depende de QR code,
   link externo ou conhecimento que não esteja legível no cartaz. */
(() => {
  'use strict';

  const questions = [
    {
      section: 'IDENTIDADE DO MURAL', area: 'No alto, na faixa amarela',
      question: 'Qual pergunta forma o título principal do mural?',
      choices: ['E se o modernismo fosse hoje?', 'Onde nasceu o modernismo?', 'Por que a arte precisa de regras?'],
      correct: 0,
      hint: 'Volte ao alto do cartaz e leia as palavras montadas como recortes.',
      explanation: 'O título convida a imaginar o modernismo diante das questões do presente.'
    },
    {
      section: 'IDENTIDADE DO MURAL', area: 'Na lateral direita, sobre o fundo roxo',
      question: 'Qual escritor aparece identificado junto ao grande retrato?',
      choices: ['Mário de Andrade', 'Lima Barreto', 'Manuel Bandeira'],
      correct: 1,
      hint: 'Procure o retrato em preto e branco com letras recortadas logo abaixo.',
      explanation: 'O escritor é uma das referências centrais da montagem.'
    },
    {
      section: 'LITERATURA', area: 'No canto superior direito',
      question: 'Qual livro aparece em destaque na parte de cima do mural?',
      choices: ['Macunaíma', 'O Cortiço', 'Triste fim de Policarpo Quaresma'],
      correct: 2,
      hint: 'Procure a capa clara de um romance, na área amarela.',
      explanation: 'A obra e a imagem do escritor fazem parte das referências literárias da exposição.'
    },
    {
      section: 'NOTÍCIAS', area: 'Na região superior do painel roxo',
      question: 'Segundo a manchete sobre um incêndio, qual universidade perdeu pesquisas científicas?',
      choices: ['Universidade Federal de Pernambuco', 'Universidade de São Paulo', 'Universidade Federal do Rio de Janeiro'],
      correct: 0,
      hint: 'Leia a notícia sobre o incêndio. O nome da instituição está na manchete.',
      explanation: 'A manchete destaca a perda de pesquisas científicas na Universidade Federal de Pernambuco.'
    },
    {
      section: 'NOTÍCIAS', area: 'No centro do painel roxo',
      question: 'Quantos casos de violência política o governo diz acompanhar em uma das notícias?',
      choices: ['20', '45', '80'],
      correct: 1,
      hint: 'Encontre a manchete sobre violência política nas eleições e procure o número.',
      explanation: 'O recorte informa que o governo acompanha 45 casos de violência política.'
    },
    {
      section: 'NOTÍCIAS', area: 'Na metade esquerda, sobre o fundo roxo',
      question: 'Qual cidade aparece na notícia sobre dois casos de agressão no domingo de eleições?',
      choices: ['Brasília', 'Rio Verde', 'Recife'],
      correct: 1,
      hint: 'Procure a manchete que fala em dois casos de agressão.',
      explanation: 'A cidade mencionada nessa manchete é Rio Verde.'
    },
    {
      section: 'NOTÍCIAS', area: 'Na parte inferior esquerda da faixa roxa',
      question: 'Segundo a manchete, qual medida o governo federal anunciou diante das ameaças contra indígenas?',
      choices: ['Criar uma força tarefa para receber denúncias e apurar ameaças', 'Suspender todas as eleições municipais', 'Encerrar investigações já em andamento'],
      correct: 0,
      hint: 'Procure a notícia sobre ameaças contra indígenas e identifique a ação anunciada.',
      explanation: 'A manchete informa a criação de uma força tarefa para receber denúncias e apurar ameaças.'
    },
    {
      section: 'MÚSICA', area: 'Na faixa verde, próximo ao retrato central',
      question: 'Qual banda aparece identificada no cartão musical de “Que País É Este”?',
      choices: ['Titãs', 'Legião Urbana', 'Os Paralamas do Sucesso'],
      correct: 1,
      hint: 'Procure o cartão cinza com o título da música e leia a linha do artista.',
      explanation: 'O cartão musical identifica a banda Legião Urbana.'
    },
    {
      section: 'PROVOCAÇÃO FINAL', area: 'Na faixa azul e amarela, na base do mural',
      question: 'Na frase “O Brasil não tem povo, tem ...”, qual é a última palavra?',
      choices: ['público', 'governo', 'história'],
      correct: 0,
      hint: 'Olhe para a frase grande que está na parte mais baixa da montagem.',
      explanation: 'O mural apresenta a frase de Lima Barreto como provocação para pensar a sociedade.'
    }
  ];

  const STORAGE_KEY = 'a-parede-fala-mural-2026-v2';
  const app = document.getElementById('quiz-app');
  const begin = document.getElementById('begin-button');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const empty = () => ({
    started: false, index: 0,
    solved: Array(questions.length).fill(null),
    errors: Array(questions.length).fill(0)
  });

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && typeof saved.started === 'boolean'
        && Number.isInteger(saved.index) && saved.index >= 0 && saved.index <= questions.length
        && Array.isArray(saved.solved) && saved.solved.length === questions.length
        && saved.solved.every((value, i) => value === null || value === questions[i].correct)
        && Array.isArray(saved.errors) && saved.errors.length === questions.length
        && saved.errors.every(value => Number.isInteger(value) && value >= 0)) return saved;
    } catch (_) { /* localStorage pode estar desativado */ }
    return empty();
  }

  let state = load();
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) { /* modo privado */ }
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function start() {
    state = empty();
    state.started = true;
    save();
    render();
  }

  // A página desliza até o cartão de perguntas, com aceleração e desaceleração suave.
  // A posição é recalculada durante o movimento porque o cabeçalho do quiz se recolhe.
  let scrollSequence = 0;
  function scrollToQuiz(onArrive) {
    const sequence = ++scrollSequence;
    if (reduceMotion.matches || typeof window.scrollTo !== 'function') {
      app.scrollIntoView({ behavior: 'auto', block: 'start' });
      onArrive?.();
      return;
    }

    const initialY = window.scrollY || window.pageYOffset || 0;
    const duration = 1480;
    let startedAt = null;
    const smoothStep = progress => progress * progress * (3 - 2 * progress);

    function move(timestamp) {
      if (sequence !== scrollSequence) return;
      if (startedAt === null) startedAt = timestamp;
      const progress = Math.min((timestamp - startedAt) / duration, 1);
      const position = window.scrollY || window.pageYOffset || 0;
      const targetY = position + app.getBoundingClientRect().top - 14;
      const nextY = initialY + (targetY - initialY) * smoothStep(progress);
      window.scrollTo({ top: nextY, behavior: 'instant' });
      if (progress < 1) {
        window.requestAnimationFrame(move);
      } else {
        window.scrollTo({ top: targetY, behavior: 'instant' });
        onArrive?.();
      }
    }
    window.requestAnimationFrame(move);
  }

  function renderStart() {
    app.innerHTML = `<div class="quiz-intro">
      <span class="quiz-intro-kicker">PRONTO PARA INVESTIGAR?</span>
      <h3>NOVE PISTAS.<br>UMA PAREDE.<br><em>O SEU OLHAR.</em></h3>
      <p>Antes de começar, fique diante do mural. Você vai encontrar cada resposta nele.</p>
      <button type="button" class="button button-light" id="start-quiz">INICIAR PERGUNTAS <span aria-hidden="true">↗</span></button>
    </div>`;
    document.getElementById('start-quiz').addEventListener('click', () => {
      start();
      scrollToQuiz(() => animateQuestion(true));
    });
  }

  function renderQuestion() {
    const q = questions[state.index];
    const solved = state.solved[state.index] !== null;
    const percent = Math.round((state.index / questions.length) * 100);
    app.innerHTML = `
      <div class="quiz-progress-header"><span>PISTA ${String(state.index + 1).padStart(2, '0')} / ${String(questions.length).padStart(2, '0')}</span><span>${escapeHTML(q.section)}</span></div>
      <div class="progress-track" role="progressbar" aria-label="Progresso do desafio" aria-valuemin="0" aria-valuemax="${questions.length}" aria-valuenow="${state.index}"><span style="width:${percent}%"></span></div>
      <div class="question-area">
        <div class="question-eyebrow">INVESTIGAÇÃO ${String(state.index + 1).padStart(2, '0')}</div>
        <h3 class="question-title" tabindex="-1">${escapeHTML(q.question)}</h3>
        <div class="location-hint"><span aria-hidden="true">⌖</span> ONDE PROCURAR: <strong>${escapeHTML(q.area)}</strong></div>
        <form id="question-form" novalidate>
          <fieldset class="answers"><legend class="visually-hidden">Escolha uma alternativa</legend>
          ${q.choices.map((choice, number) => `<label class="answer ${solved ? 'locked' : ''} ${solved && q.correct === number ? 'correct' : ''}">
            <input type="radio" name="answer" value="${number}" ${solved && q.correct === number ? 'checked' : ''} ${solved ? 'disabled' : ''}>
            <span class="answer-letter">${String.fromCharCode(65 + number)}</span><span class="answer-label">${escapeHTML(choice)}</span>
            <span class="answer-arrow" aria-hidden="true">${solved && q.correct === number ? '✓' : '↗'}</span>
          </label>`).join('')}
          </fieldset>
          <p id="feedback" class="feedback ${solved ? 'success' : ''}" role="status" aria-live="polite">${solved ? `✓ Você encontrou a pista! ${escapeHTML(q.explanation)}` : ''}</p>
          <div class="quiz-controls">
            <button type="button" id="restart-quiz" class="text-button">RECOMEÇAR</button>
            <button type="submit" class="button button-dark">${solved ? (state.index === questions.length - 1 ? 'VER RESULTADO' : 'PRÓXIMA PISTA') : 'CONFERIR RESPOSTA'} <span aria-hidden="true">↗</span></button>
          </div>
        </form>
      </div>`;

    document.getElementById('restart-quiz').addEventListener('click', start);
    document.getElementById('question-form').addEventListener('submit', event => {
      event.preventDefault();
      if (state.solved[state.index] !== null) {
        state.index += 1;
        save();
        render();
        if (state.index < questions.length) animateQuestion(false);
        document.querySelector('.quiz-app .question-title, .quiz-app .result-title')?.focus();
        return;
      }
      const choice = app.querySelector('input[name="answer"]:checked');
      const feedback = document.getElementById('feedback');
      if (!choice) {
        feedback.className = 'feedback warning';
        feedback.textContent = 'Escolha uma alternativa antes de conferir.';
        return;
      }
      const value = Number(choice.value);
      if (value !== q.correct) {
        state.errors[state.index] += 1;
        save();
        feedback.className = 'feedback warning';
        feedback.textContent = 'Ainda não! ' + q.hint + ' Você pode tentar outra vez.';
        return;
      }
      state.solved[state.index] = value;
      save();
      render();
      document.querySelector('.quiz-app .question-title')?.focus();
    });
  }

  function renderResult() {
    const firstTry = state.errors.filter(count => count === 0).length;
    app.innerHTML = `<div class="result">
      <span class="result-kicker">TODAS AS PISTAS ENCONTRADAS</span>
      <h3 class="result-title" tabindex="-1">VOCÊ LEU<br><em>A PAREDE!</em></h3>
      <div class="result-score"><strong>09 / 09</strong><span>PISTAS CONCLUÍDAS</span></div>
      <p>Você encontrou informações na literatura, nas notícias, na música e nas frases do mural. O importante é olhar para além da primeira impressão.</p>
      <p class="result-detail">Pistas resolvidas na primeira tentativa: <strong>${firstTry} de ${questions.length}</strong>.</p>
      <div class="result-gallery" aria-label="Imagens reveladas depois de concluir o quiz">
          <figure><img src="https://upload.wikimedia.org/wikipedia/commons/0/0f/LimaBarreto.jpg" alt="Retrato histórico do escritor Lima Barreto" width="472" height="704" loading="lazy" decoding="async"><figcaption>UM DOS ROSTOS DO MURAL</figcaption></figure>
          <figure><img src="https://upload.wikimedia.org/wikipedia/commons/7/76/Triste_fim_de_policarpo_quaresma_1a_edicao.png" alt="Capa da primeira edição de Triste fim de Policarpo Quaresma de 1915" width="339" height="551" loading="lazy" decoding="async"><figcaption>UMA OBRA REVELADA</figcaption></figure>
        </div>
        <button type="button" id="play-again" class="button button-dark">INVESTIGAR DE NOVO <span aria-hidden="true">↗</span></button>
    </div>`;
    document.getElementById('play-again').addEventListener('click', start);
  }

  function render() {
    document.getElementById('experiencia')?.classList.toggle('is-playing', state.started);
    if (!state.started) renderStart();
    else if (state.index >= questions.length) renderResult();
    else renderQuestion();
  }

  begin.addEventListener('click', () => {
    if (!state.started) start();
    scrollToQuiz(() => animateQuestion(true));
  });
  render();

  // Ajusta o letreiro sem ocultar nenhuma letra dentro do papel recortado.
  function fitHeroTitle() {
    const headline = document.getElementById('hero-title');
    const cutout = document.getElementById('hero-cut-title');
    if (!headline || !cutout) return;
    cutout.style.fontSize = '1em';
    const available = Math.max(1, headline.clientWidth - 13);
    const actual = cutout.getBoundingClientRect().width;
    if (actual > available) {
      const inherited = Number.parseFloat(window.getComputedStyle(headline).fontSize);
      if (Number.isFinite(inherited)) {
        cutout.style.fontSize = (inherited * available / actual * 0.976).toFixed(2) + 'px';
      }
    }
  }

  function playOpening() {
    const opening = document.getElementById('opening-screen');
    const skip = document.getElementById('skip-opening');
    if (!opening || !skip || reduceMotion.matches || window.location.hash === '#experiencia') {
      opening?.remove();
      return;
    }
    const button = document.getElementById('begin-button');
    if (!button) { opening.remove(); return; }
    const rect = button.getBoundingClientRect();
    const focusX = rect.left + rect.width / 2;
    const focusY = rect.top + rect.height / 2;
    const offsetX = focusX - window.innerWidth / 2;
    const offsetY = focusY - window.innerHeight / 2;
    opening.style.setProperty('--drop-x', offsetX + 'px');
    opening.style.setProperty('--drop-y', offsetY + 'px');
    opening.style.setProperty('--glide-x', (offsetX * .63) + 'px');
    opening.style.setProperty('--glide-y', (offsetY * .63) + 'px');

    let closed = false;
    let finishTimer;
    const complete = () => {
      if (closed) return;
      closed = true;
      window.clearTimeout(finishTimer);
      opening.classList.remove('is-running');
      opening.remove();
      if (!reduceMotion.matches && rect.top < window.innerHeight && rect.bottom > 0) {
        button.classList.remove('is-landing');
        void button.offsetWidth;
        button.classList.add('is-landing');
        button.addEventListener('animationend', () => button.classList.remove('is-landing'), { once: true });
      }
    };
    skip.addEventListener('click', complete);
    window.requestAnimationFrame(() => opening.classList.add('is-running'));
    finishTimer = window.setTimeout(complete, 4220);
  }

  function animateQuestion(burst) {
    if (reduceMotion.matches) return;
    app.classList.remove('is-question-revealing');
    void app.offsetWidth;
    app.classList.add('is-question-revealing');
    if (!burst) {
      window.setTimeout(() => app.classList.remove('is-question-revealing'), 1560);
      return;
    }
    app.querySelector('.quiz-burst')?.remove();
    const effect = document.createElement('div');
    effect.className = 'quiz-burst';
    effect.setAttribute('aria-hidden', 'true');
    const rings = document.createElement('span');
    rings.className = 'quiz-burst-ring';
    const second = document.createElement('span');
    second.className = 'quiz-burst-ring second';
    const label = document.createElement('span');
    label.className = 'quiz-burst-core';
    label.textContent = 'PISTA ' + String(state.index + 1).padStart(2,'0') + '!';
    effect.append(rings, second, label);
    const colors = ['#f6df53', '#5141a6', '#29895a', '#ef9daa', '#4da7d8'];
    for (let i = 0; i < 20; i++) {
      const a = (Math.PI * 2 * i) / 20;
      const range = 94 + (i % 5) * 24;
      const scrap = document.createElement('span');
      scrap.className = 'quiz-burst-piece';
      scrap.style.setProperty('--dx', (Math.cos(a) * range).toFixed(1) + 'px');
      scrap.style.setProperty('--dy', (Math.sin(a) * range).toFixed(1) + 'px');
      scrap.style.setProperty('--spin', (i % 2 === 0 ? 128 : -148) + 'deg');
      scrap.style.setProperty('--piece-delay', ((i % 5) * 36) + 'ms');
      scrap.style.setProperty('--piece-w', (10 + i % 4 * 5) + 'px');
      scrap.style.setProperty('--piece-h', (14 + i % 3 * 7) + 'px');
      scrap.style.setProperty('--piece-color', colors[i % colors.length]);
      effect.appendChild(scrap);
    }
    app.appendChild(effect);
    window.setTimeout(() => {
      effect.remove();
      app.classList.remove('is-question-revealing');
    }, 2130);
  }

  // O selo da abertura não é uma etapa do questionário.
  fitHeroTitle();
  window.addEventListener('resize', fitHeroTitle, { passive: true });
  if (document.fonts?.ready) document.fonts.ready.then(fitHeroTitle);
  playOpening();
})();
