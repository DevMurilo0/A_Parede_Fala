/* Proxy de compatibilidade para o ranking hospedado no Supabase.
   O navegador usa diretamente a Edge Function, evitando custo de funções Vercel. */
const ENDPOINT = "https://jwkydvtvjwcrdqfmvrrk.supabase.co/functions/v1/wall-ranking";
module.exports = async function handler(req,res) {
  res.setHeader("Cache-Control","no-store");
  if (req.method !== "GET" && req.method !== "POST")
    return res.status(405).json({ok:false,error:"Metodo nao permitido",code:"method"});
  try {
    const body = req.method === "POST" ? JSON.stringify(req.body || {}) : undefined;
    if (body && body.length > 4096)
      return res.status(413).json({ok:false,error:"Requisicao muito grande",code:"size"});
    const response=await fetch(ENDPOINT,{
      method:req.method,
      headers:{ "Content-Type":"application/json", "Accept":"application/json" },
      body,
      signal:AbortSignal.timeout(9000)
    });
    const text=await response.text();
    res.status(response.status).setHeader("Content-Type","application/json; charset=utf-8");
    return res.send(text);
  }catch(e){
    console.error("Ranking proxy:",String(e?.message||e).slice(0,120));
    return res.status(503).json({ok:false,error:"Ranking temporariamente indisponivel.",code:"network"});
  }
};