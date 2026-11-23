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
      question: 'Qual estado aparece abreviado na notícia sobre ameaças contra indígenas?',
      choices: ['São Paulo (SP)', 'Bahia (BA)', 'Mato Grosso do Sul (MS)'],
      correct: 2,
      hint: 'Olhe a manchete sobre a força-tarefa e leia a sigla no final.',
      explanation: 'A notícia cita ameaças a indígenas em MS, sigla de Mato Grosso do Sul.'
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

  function scrollToQuiz() {
    document.getElementById('experiencia').scrollIntoView({
      behavior: reduceMotion.matches ? 'auto' : 'smooth',
      block: 'start'
    });
  }

  function renderStart() {
    app.innerHTML = `<div class="quiz-intro">
      <span class="quiz-intro-kicker">PRONTO PARA INVESTIGAR?</span>
      <h3>NOVE PISTAS.<br>UMA PAREDE.<br><em>O SEU OLHAR.</em></h3>
      <p>Antes de começar, fique diante do mural. Você vai encontrar cada resposta nele.</p>
      <button type="button" class="button button-light" id="start-quiz">INICIAR PERGUNTAS <span aria-hidden="true">↗</span></button>
    </div>`;
    document.getElementById('start-quiz').addEventListener('click', start);
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
      <span class="result-kicker">TODAS AS PISTAS ENCONTRADAS ✳</span>
      <h3 class="result-title" tabindex="-1">VOCÊ LEU<br><em>A PAREDE!</em></h3>
      <div class="result-score"><strong>09 / 09</strong><span>PISTAS CONCLUÍDAS</span></div>
      <p>Você encontrou informações na literatura, nas notícias, na música e nas frases do mural. O importante é olhar para além da primeira impressão.</p>
      <p class="result-detail">Pistas resolvidas na primeira tentativa: <strong>${firstTry} de ${questions.length}</strong>.</p>
      <button type="button" id="play-again" class="button button-dark">INVESTIGAR DE NOVO <span aria-hidden="true">↗</span></button>
    </div>`;
    document.getElementById('play-again').addEventListener('click', start);
  }

  function render() {
    if (!state.started) renderStart();
    else if (state.index >= questions.length) renderResult();
    else renderQuestion();
  }

  begin.addEventListener('click', () => {
    if (!state.started) start();
    scrollToQuiz();
  });
  render();
})();
