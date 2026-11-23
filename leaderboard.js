/* A Parede Fala: classificacao global com dados verificados no servidor. */
(() => {
  'use strict';
  const PROFILE_KEY = 'wall-ranking-profile-v1';
  const RUN_KEY = 'wall-ranking-run-v1';
  const API = 'https://jwkydvtvjwcrdqfmvrrk.supabase.co/functions/v1/wall-ranking';
  let identity = '';
  let nickname = '';
  let run = null;
  let requestQueue = Promise.resolve();
  let lastError = '';
  let loadedBoard = false;
  let latestBoard = null;
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
    identity = typeof saved?.identity === 'string' ? saved.identity : '';
    nickname = typeof saved?.nickname === 'string' ? saved.nickname : '';
    run = JSON.parse(localStorage.getItem(RUN_KEY) || 'null');
    if (!run || typeof run !== 'object' || typeof run.token !== 'string') run = null;
  } catch (_) { /* Navegacao privada */ }

  function persist() {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ identity, nickname }));
      if (run) localStorage.setItem(RUN_KEY, JSON.stringify(run));
      else localStorage.removeItem(RUN_KEY);
    } catch (_) {}
  }
  function validName(name) {
    return typeof name === 'string' && /^[\p{L}\p{N}][\p{L}\p{N} ._]{1,21}$/u.test(name.trim()) &&
      name.trim().length >= 2 && name.trim().length <= 22;
  }
  function sanitizeText(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }
  function time(ms) {
    const n = Math.max(0, Math.floor(Number(ms) / 1000));
    return String(Math.floor(n / 60)).padStart(2, '0') + ':' +
      String(n % 60).padStart(2, '0');
  }
  async function request(action, fields = {}) {
    const response = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ action, ...fields }),
      cache: 'no-store'
    });
    let result = {};
    try { result = await response.json(); } catch (_) {}
    if (!response.ok || !result.ok) {
      const error = new Error(result.error || 'Nao foi possivel consultar o ranking');
      error.code = result.code || 'network';
      throw error;
    }
    return result;
  }
  function previewMarkup(result) {
    const players = Array.isArray(result?.players) ? result.players.slice(0, 5) : [];
    const top = '<div class="rank-preview-title"><strong>RANKING GLOBAL</strong>' +
      '<a href="#ranking">VER RANKING COMPLETO ↗</a></div>';
    if (!players.length) return top +
      '<p class="rank-preview-empty">Ainda não há tempos registrados. Você pode ser a primeira pessoa no ranking!</p>';
    const list = players.map(player =>
      '<div class="rank-preview-player"><span>' + Number(player.position) + 'º</span>' +
      '<strong>' + sanitizeText(player.nickname) + '</strong>' +
      '<b>' + time(player.bestMs) + '</b></div>').join('');
    const placement = result.myPosition
      ? '<p class="rank-preview-position">Sua colocação atual: <b>' + Number(result.myPosition) + 'º lugar</b></p>'
      : '';
    return top + '<div class="rank-preview-list">' + list + '</div>' + placement;
  }
  function renderPreview(result, errorText) {
    const preview = document.getElementById('rank-preview');
    if (!preview) return;
    if (result) preview.innerHTML = previewMarkup(result);
    else preview.innerHTML = '<div class="rank-preview-title"><strong>RANKING GLOBAL</strong>' +
      '<a href="#ranking">VER RANKING COMPLETO ↗</a></div>' +
      '<p class="rank-preview-empty">' + sanitizeText(errorText || 'Não foi possível carregar a classificação agora.') + '</p>';
  }

  function showUnavailable(message) {
    const summary = document.getElementById('rank-summary');
    if (summary) summary.innerHTML =
      '<p class="ranking-unavailable">' + sanitizeText(message) + '</p>';
    const status = document.getElementById('ranking-status');
    if (status && !loadedBoard) status.textContent = message;
  }
  function begin(name) {
    nickname = String(name || '').trim();
    run = null;
    lastError = '';
    persist();
    requestQueue = request('start', { nickname, identity })
      .then(data => {
        identity = data.playerKey;
        run = { token: data.session, progress: 0, completed: null };
        persist();
        return run;
      }).catch(error => {
        lastError = error.message;
        showUnavailable('Seu quiz funciona normalmente. ' + error.message);
        return null;
      });
    return requestQueue;
  }
  function sync(solved) {
    if (!Array.isArray(solved)) return requestQueue;
    requestQueue = requestQueue.then(async () => {
      if (!run || run.completed) return;
      for (let i = run.progress; i < solved.length && solved[i] !== null; i++) {
        const choice = solved[i];
        if (!Number.isInteger(choice)) break;
        const result = await request('answer', {
          session: run.token, index: i, choice
        });
        if (!result.correct) throw new Error('Divergencia de respostas entre quiz e ranking.');
        run.progress = i + 1;
        if (result.session) run.token = result.session;
        if (result.completed) run.completed = result;
        persist();
      }
      if (run?.completed) {
        showResult();
        loadBoard(true);
      }
    }).catch(error => {
      lastError = error.message;
      showUnavailable('O tempo foi salvo neste aparelho, mas nao foi enviado ao ranking. ' + error.message);
    });
    return requestQueue;
  }
  function showResult() {
    const element = document.getElementById('rank-summary');
    if (!element) return;
    if (run?.completed) {
      const result = run.completed;
      element.innerHTML = '<div class="rank-finish-card"><span>RESULTADO GLOBAL</span>' +
        '<strong>' + (result.position ? result.position + 'º LUGAR' : 'CONCLUIDO') + '</strong>' +
        '<p>Tempo registrado no ranking: <b>' + time(result.elapsedMs) + '</b></p>' +
        '<p>Seu melhor tempo global: <b>' + time(result.bestMs) + '</b></p>' +
        '<a href="#ranking" class="button button-dark">VER CLASSIFICACAO <span aria-hidden="true">↗</span></a></div>';
    } else if (lastError) {
      showUnavailable('Seu tempo pessoal foi salvo. ' + lastError);
    } else if (!run) {
      element.innerHTML = '<div class="rank-legacy-notice">' +
        '<strong>SEU TEMPO AINDA NÃO ESTÁ NO RANKING</strong>' +
        '<p>Esta partida foi iniciada antes do ranking global ou sem uma sessão registrada. Seu recorde pessoal continua salvo, mas, para concorrer, você precisa responder às nove perguntas em uma nova tentativa.</p>' +
        '<button id="join-ranking-now" type="button" class="button button-dark">PARTICIPAR DO RANKING <span aria-hidden="true">↗</span></button>' +
        '</div>';
    } else {
      element.innerHTML = '<p class="ranking-wait">Verificando respostas e registrando seu tempo no ranking...</p>';
    }
    if (latestBoard) renderPreview(latestBoard);
  }
  async function loadBoard(force = false) {
    const list = document.getElementById('ranking-list');
    const status = document.getElementById('ranking-status');
    if (!list || (!force && loadedBoard)) return;
    if (status) status.textContent = 'Consultando os melhores tempos...';
    try {
      const result = await request('board', { identity });
      loadedBoard = true;
      latestBoard = result;
      renderPreview(result);
      if (!Array.isArray(result.players) || !result.players.length) {
        list.innerHTML = '<div class="ranking-empty">Ainda nao existem recordes registrados. Seja a primeira pessoa a completar as nove pistas!</div>';
      } else {
        list.innerHTML = result.players.map((player, i) =>
          '<div class="ranking-entry">' +
          '<span class="ranking-position">' + (i === 0 ? '★ ' : '') + Number(player.position) + 'º</span>' +
          '<strong class="ranking-name">' + sanitizeText(player.nickname) + '</strong>' +
          '<span class="ranking-time">' + time(player.bestMs) + '</span></div>'
        ).join('');
      }
      if (status) status.textContent = result.myPosition
        ? 'Sua colocacao atual: ' + result.myPosition + 'º lugar.'
        : 'Os melhores tempos ficam salvos online. Cada visitante aparece uma vez.';
    } catch (error) {
      loadedBoard = false;
      if (!latestBoard) renderPreview(null, 'A classificação está temporariamente indisponível. Tente atualizar.');
      if (status) status.textContent = error.code === 'unconfigured'
        ? 'Ranking global aguardando a conexao com o banco de dados.'
        : 'Nao foi possivel carregar a classificacao agora.';
      list.innerHTML = '<div class="ranking-empty">A classificacao online esta indisponivel. O quiz e o recorde pessoal continuam funcionando.</div>';
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    const refresh = document.getElementById('refresh-ranking');
    refresh?.addEventListener('click', () => loadBoard(true));
    loadBoard();
  });
  window.WallRanking = {
    begin, sync, showResult, loadBoard, nickname: () => nickname,
    validName, hasRun: () => Boolean(run), getRun: () => run
  };
})();