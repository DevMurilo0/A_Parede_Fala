/* A Parede Fala: ranking global verificado no servidor.
   O segredo de assinatura e a chave de banco permanecem no Edge Runtime. */
const API_URL = Deno.env.get("SUPABASE_URL") || "";
const secretValues = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || secretValues.default || "";
const ANSWERS = [0,1,2,0,1,1,0,1,0];
const MAX_AGE = 2 * 60 * 60 * 1000;
const MIN_MS = 7500;
const MAX_MS = 2 * 60 * 60 * 1000;
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const corsOrigin = (request) => {
  const origin = request.headers.get("origin") || "";
  return origin === "https://aparedefala.vercel.app" || /^http:\/\/localhost(?::\d+)?$/.test(origin)
    ? origin : "https://aparedefala.vercel.app";
};
function headers(request) {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": corsOrigin(request),
    "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  };
}
function json(request, value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: headers(request) });
}
function failure(req, status, error, code) {
  return json(req, { ok:false, error, code }, status);
}
function enc(bytes) {
  let s = "";
  for (const v of bytes) s += String.fromCharCode(v);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function dec(s) {
  const value = s.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(value + "=".repeat((4 - value.length % 4) % 4));
  return Uint8Array.from(binary, ch => ch.charCodeAt(0));
}
let signingKey = null;
async function getSigningKey() {
  if (!SERVICE_KEY) throw new Error("missing database key");
  if (!signingKey) {
    signingKey = await crypto.subtle.importKey("raw",
      encoder.encode(SERVICE_KEY + ":wall-ranking-signature-v1"),
      { name:"HMAC", hash:"SHA-256" }, false, ["sign","verify"]);
  }
  return signingKey;
}
async function sign(obj) {
  const payload = enc(encoder.encode(JSON.stringify(obj)));
  const sig = await crypto.subtle.sign("HMAC", await getSigningKey(), encoder.encode(payload));
  return payload + "." + enc(new Uint8Array(sig));
}
async function verify(input) {
  if (typeof input !== "string" || input.length > 1900) return null;
  const pieces = input.split(".");
  if (pieces.length !== 2) return null;
  try {
    const valid = await crypto.subtle.verify("HMAC", await getSigningKey(),
      dec(pieces[1]), encoder.encode(pieces[0]));
    return valid ? JSON.parse(decoder.decode(dec(pieces[0]))) : null;
  } catch (_) { return null; }
}
function isUUID(value) {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
async function db(path, method = "GET", body) {
  if (!API_URL || !SERVICE_KEY) throw new Error("missing database connection");
  const url = new URL("/rest/v1/" + path, API_URL);
  const h = { "apikey": SERVICE_KEY, "Content-Type": "application/json", "Accept":"application/json" };
  if (!SERVICE_KEY.startsWith("sb_secret_")) h.Authorization = "Bearer " + SERVICE_KEY;
  const response = await fetch(url, {
    method, headers:h, body:body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(8500)
  });
  const raw = await response.text();
  if (!response.ok) throw new Error("database " + response.status + " " + raw.slice(0,200));
  return raw ? JSON.parse(raw) : null;
}
async function placement(id) {
  if (!isUUID(id)) return null;
  const p = await db("rpc/wall_player_position", "POST", { p_player_id:id });
  return Number.isInteger(p) && p > 0 ? p : null;
}
async function board(id) {
  const rows = await db("wall_players?select=nickname,best_ms,attempts&order=best_ms.asc,updated_at.asc,id.asc&limit=30");
  return {
    ok:true, enabled:true,
    players:(rows || []).map((r,i) => ({position:i+1,nickname:r.nickname,bestMs:r.best_ms,attempts:r.attempts})),
    leader:rows?.length ? rows[0].nickname : null,
    myPosition:await placement(id)
  };
}
Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response(null,{ status:204,headers:headers(req) });
  if (req.method !== "GET" && req.method !== "POST")
    return failure(req,405,"Metodo nao permitido","method");
  try {
    if (req.method === "GET") return json(req,await board(null));
    const bodyText = await req.text();
    if (bodyText.length > 4096) return failure(req,413,"Requisicao muito grande","size");
    let body;
    try { body=JSON.parse(bodyText); } catch (_) { return failure(req,400,"JSON invalido","body"); }
    if (!body || typeof body !== "object" || Array.isArray(body))
      return failure(req,400,"Dados invalidos","body");
    if (body.action === "board") {
      const ident = await verify(body.identity);
      return json(req,await board(ident?.kind === "identity" && isUUID(ident.id) ? ident.id : null));
    }
    if (body.action === "start") {
      const old = await verify(body.identity);
      const id = old?.kind === "identity" && isUUID(old.id) ? old.id : crypto.randomUUID();
      const number = await db("rpc/wall_register_player","POST",{p_player_id:id});
      if (!Number.isSafeInteger(number) || number < 1)
        throw new Error("numero do jogador invalido");
      const startedAt = Date.now();
      const session = await sign({
        kind:"session",id,sid:crypto.randomUUID(),index:0,startedAt
      });
      return json(req,{
        ok:true,session,playerKey:await sign({kind:"identity",id}),
        startedAt,playerNumber:number,playerName:"Player "+number
      });
    }
    if (body.action === "answer") {
      const session = await verify(body.session);
      const now = Date.now();
      if (!session || session.kind !== "session" ||
          !Number.isInteger(session.index) || session.index < 0 || session.index >= ANSWERS.length ||
          !Number.isFinite(session.startedAt) || now-session.startedAt > MAX_AGE ||
          session.startedAt > now + 3000 || !isUUID(session.id) || !isUUID(session.sid)) {
        return failure(req,409,"Sessao expirada. Inicie uma nova tentativa.","expired");
      }
      if (!Number.isInteger(body.index) || body.index !== session.index ||
          !Number.isInteger(body.choice) || body.choice < 0 || body.choice > 2) {
        return failure(req,400,"Etapa ou alternativa invalida.","answer");
      }
      if (body.choice !== ANSWERS[session.index])
        return json(req,{ok:true,correct:false,index:session.index,session:body.session});
      if (session.index < ANSWERS.length - 1) {
        const token = await sign({ ...session,index:session.index+1 });
        return json(req,{ok:true,correct:true,index:session.index+1,session:token});
      }
      const ms = now - session.startedAt;
      if (ms < MIN_MS || ms > MAX_MS) {
        return failure(req,422,"Tempo fora dos limites do ranking. Tente novamente.","duration");
      }
      const best = await db("rpc/wall_save_result","POST",{
        p_session_id:session.sid,p_player_id:session.id,p_nickname:"AUTOMATICO",p_ms:ms
      });
      return json(req,{
        ok:true,correct:true,completed:true,elapsedMs:ms,
        bestMs:Number(best),position:await placement(session.id)
      });
    }
    return failure(req,400,"Acao desconhecida","action");
  } catch (err) {
    console.error("wall-ranking",String(err?.message || err).slice(0,220));
    return failure(req,503,"Ranking temporariamente indisponivel.","backend");
  }
});