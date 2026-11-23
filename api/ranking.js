/* Ranking global do mural. Credenciais só no servidor, nunca no navegador. */
const crypto = require('node:crypto');

const ANSWERS = [0, 1, 2, 0, 1, 1, 0, 1, 0];
const MAX_AGE = 2 * 60 * 60 * 1000;
const MIN_DURATION = 7500;
const MAX_DURATION = 2 * 60 * 60 * 1000;

function ready() {
  return Boolean(process.env.SUPABASE_URL &&
    (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY) &&
    process.env.LEADERBOARD_SECRET && process.env.LEADERBOARD_SECRET.length >= 32);
}
function secret() { return process.env.LEADERBOARD_SECRET; }
function sign(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret()).update(data).digest('base64url');
  return data + '.' + sig;
}
function verify(value) {
  if (typeof value !== 'string' || value.length > 1900) return null;
  const parts = value.split('.');
  if (parts.length !== 2) return null;
  const expected = crypto.createHmac('sha256', secret()).update(parts[0]).digest();
  let actual;
  try { actual = Buffer.from(parts[1], 'base64url'); } catch (_) { return null; }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
  try { return JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')); }
  catch (_) { return null; }
}
function alias(name) {
  const result = String(name || '').trim().replace(/\s+/g, ' ');
  return result.length >= 2 && result.length <= 22 &&
    /^[\p{L}\p{N}][\p{L}\p{N} ._]{1,21}$/u.test(result) ? result : null;
}
function fail(res, status, message, code) { return res.status(status).json({ ok: false, error: message, code }); }
async function db(path, method = 'GET', body) {
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = new URL(process.env.SUPABASE_URL);
  if (url.protocol !== 'https:') throw new Error('Endereco Supabase invalido');
  const headers = { apikey: key, 'Content-Type': 'application/json', Accept: 'application/json' };
  // As chaves modernas sb_secret_ nao sao JWT e vao somente no apikey.
  if (!key.startsWith('sb_secret_')) headers.Authorization = 'Bearer ' + key;
  const response = await fetch(url.origin + '/rest/v1/' + path, {
    method, headers, body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(9000)
  });
  const text = await response.text();
  if (!response.ok) throw new Error('Banco indisponivel: HTTP ' + response.status + ' ' + text.slice(0, 220));
  return text ? JSON.parse(text) : null;
}
async function placement(id) {
  if (!id) return null;
  const data = await db('rpc/wall_player_position', 'POST', { p_player_id: id });
  return Number.isInteger(data) && data > 0 ? data : null;
}
async function board(id) {
  const rows = await db('wall_players?select=nickname,best_ms,attempts&order=best_ms.asc,updated_at.asc&limit=30');
  const rank = await placement(id);
  return { ok: true, enabled: true, players: (rows || []).map((entry, i) => ({
    position: i + 1, nickname: entry.nickname, bestMs: entry.best_ms, attempts: entry.attempts
  })), myPosition: rank };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET' && req.method !== 'POST') return fail(res, 405, 'Metodo nao permitido', 'method');
  if (!ready()) return fail(res, 503, 'O ranking global ainda precisa ser conectado ao banco de dados.', 'unconfigured');
  try {
    if (req.method === 'GET') return res.status(200).json(await board(null));
    const length = Number(req.headers['content-length'] || 0);
    if (length > 4096) return fail(res, 413, 'Requisicao muito grande', 'size');
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (!body || typeof body !== 'object') return fail(res, 400, 'Dados invalidos', 'body');
    if (body.action === 'board') {
      const identity = verify(body.identity);
      const id = identity?.kind === 'identity' ? identity.id : null;
      return res.status(200).json(await board(id));
    }
    if (body.action === 'start') {
      const name = alias(body.nickname);
      if (!name) return fail(res, 400, 'Digite um apelido entre 2 e 22 caracteres.', 'nickname');
      const identity = verify(body.identity);
      const id = identity?.kind === 'identity' && typeof identity.id === 'string' &&
        /^[0-9a-f-]{36}$/i.test(identity.id) ? identity.id : crypto.randomUUID();
      const playerKey = sign({ kind: 'identity', id });
      const now = Date.now();
      const session = sign({
        kind: 'session', id, sid: crypto.randomUUID(), nickname: name, index: 0, startedAt: now
      });
      return res.status(200).json({ ok: true, session, playerKey, startedAt: now });
    }
    if (body.action === 'answer') {
      const session = verify(body.session);
      if (!session || session.kind !== 'session' || !Number.isInteger(session.index) ||
          session.index < 0 || session.index >= ANSWERS.length ||
          !Number.isFinite(session.startedAt) ||
          Date.now() - session.startedAt > MAX_AGE ||
          session.startedAt > Date.now() + 3000 ||
          typeof session.id !== 'string' || typeof session.sid !== 'string') {
        return fail(res, 409, 'Sessao expirada. Inicie uma nova tentativa.', 'expired');
      }
      const index = Number(body.index), choice = Number(body.choice);
      if (!Number.isInteger(index) || index !== session.index ||
          !Number.isInteger(choice) || choice < 0 || choice > 2) {
        return fail(res, 400, 'Etapa ou alternativa invalida.', 'answer');
      }
      if (choice !== ANSWERS[index]) return res.status(200).json({
        ok: true, correct: false, index: session.index, session: body.session
      });
      if (index < ANSWERS.length - 1) {
        const next = sign({ ...session, index: index + 1 });
        return res.status(200).json({ ok: true, correct: true, index: index + 1, session: next });
      }
      const elapsed = Date.now() - session.startedAt;
      if (elapsed < MIN_DURATION || elapsed > MAX_DURATION) {
        return fail(res, 422, 'Tempo fora dos limites do ranking. Tente novamente.', 'duration');
      }
      const result = await db('rpc/wall_save_result', 'POST', {
        p_session_id: session.sid, p_player_id: session.id,
        p_nickname: session.nickname, p_ms: elapsed
      });
      const rank = await placement(session.id);
      return res.status(200).json({
        ok: true, correct: true, completed: true,
        elapsedMs: elapsed, bestMs: Number(result), position: rank
      });
    }
    return fail(res, 400, 'Acao desconhecida', 'action');
  } catch (error) {
    // Nao devolva detalhes do banco ou chaves ao visitante.
    console.error('Ranking backend:', error.message.slice(0, 160));
    return fail(res, 503, 'Ranking temporariamente indisponivel.', 'backend');
  }
};
