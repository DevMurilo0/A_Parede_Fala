/* O Brasil em Três Canções — seis perguntas, sem interações físicas. */
(() => {
  'use strict';
  const songs = [
    {artist:'RAUL SEIXAS', title:'Aluga-se', year:'1980', fallback:'assets/fallback-raul.svg', image:'https://lastfm.freetls.fastly.net/i/u/ar0/fa813ffde42679d4e07db1c37093287d.jpg', link:'https://youtu.be/d3iI-ktX2WI?is=1yUYdp_tKhb2sOEx', insight:'A ironia questiona o que acontece quando as riquezas nacionais viram mercadoria.'},
    {artist:'LEGIÃO URBANA', title:'Que País É Este', year:'1987', fallback:'assets/fallback-legiao.svg', image:'https://rawmusicstore.com/product/legiao-urbana-que-pais-e-este-1978-1987/2401-208-3.jpg', link:'https://youtu.be/vA-3BYOW2wo?is=EOaK3CR3gpI-I2Rr', insight:'O protesto denuncia a corrupção e o desencanto com as instituições.'},
    {artist:'CAZUZA', title:'Brasil', year:'1988', fallback:'assets/fallback-cazuza.svg', image:'https://p2.trrsf.com/image/fget/cf/1200/900/middle/images.terra.com/2025/06/27/1858155718-cazuza-1988-foto-reproducao-youtube.jpg', link:'https://youtu.be/kCUZr_K8et8?is=OaU8g8vS9VH5PDBc', insight:'A voz inquieta mostra que é possível criticar o país sem deixar de se importar com ele.'}
  ];
  // O gabarito é armazenado no próprio JS. Não há qualquer etapa ligada à parede física.
  const questions = [
    {song:0, text:'Na música “Aluga-se”, o que Raul Seixas sugere fazer com o Brasil?', choices:['Alugar o país','Mudar a capital','Fechar todas as praias'], correct:0, explanation:'A sugestão de alugar o Brasil é uma ironia usada para fazer crítica social.'},
    {song:0, text:'A proposta apresentada na música é principalmente...', choices:['Uma propaganda de turismo','Uma crítica feita com ironia','Um convite para comprar imóveis'], correct:1, explanation:'Raul usa humor e exagero para questionar a entrega de riquezas e a dependência econômica.'},
    {song:1, text:'Que problema aparece como crítica central em “Que País É Este”?', choices:['A falta de feriados','A corrupção','O excesso de shows'], correct:1, explanation:'A canção questiona a corrupção e outras contradições da vida política e social.'},
    {song:1, text:'A pergunta do título expressa principalmente qual sentimento?', choices:['Indignação','Orgulho sem críticas','Curiosidade geográfica'], correct:0, explanation:'É uma pergunta de protesto, não uma dúvida sobre a localização do país.'},
    {song:2, text:'Na música “Brasil”, Cazuza apresenta um olhar...', choices:['Que só elogia o país','Crítico sobre a realidade brasileira','Voltado apenas às paisagens naturais'], correct:1, explanation:'O cantor usa a música para apontar problemas da vida pública e da sociedade.'},
    {song:2, text:'Qual tema combina mais com a mensagem de “Brasil”?', choices:['Desigualdades e problemas políticos','Receitas culinárias','Uma viagem pelo espaço'], correct:0, explanation:'A música coloca em evidência contradições políticas e sociais do Brasil.'}
  ];
  const $ = (selector) => document.querySelector(selector);
  const app = $('#quiz-app');
  const progressKey = 'parede-fala-musicas-v1';
  function load() {
    try { const saved=JSON.parse(localStorage.getItem(progressKey)); if(saved && Number.isInteger(saved.i) && saved.i>=0 && saved.i<=questions.length && Array.isArray(saved.picks) && saved.picks.length===questions.length) return saved; }catch(_){}
    return {i:0,picks:Array(questions.length).fill(null),started:false};
  }
  let state=load();
  // A experiência fica no estado de apresentação até o usuário clicar em começar.
  if(!state.started) state={i:0,picks:Array(questions.length).fill(null),started:false};
  function save(){try{localStorage.setItem(progressKey,JSON.stringify(state));}catch(_){}}
  function escapeHtml(str){return String(str).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function setStart(){state={i:0,picks:Array(questions.length).fill(null),started:true};save();render();}
  function render(){
    if(!state.started){app.innerHTML=`<div class="initial-quiz"><p class="mini-prelude">PRONTO PARA COMEÇAR?</p><h3>Três músicas.<br>Seis perguntas.<br><em>Seu olhar.</em></h3><p>A experiência dura poucos minutos e funciona inteiramente pelo celular.</p><button class="button button-light" id="start-quiz" type="button">INICIAR PERGUNTAS <span aria-hidden="true">↗</span></button></div>`;$('#start-quiz').addEventListener('click',setStart);return;}
    if(state.i>=questions.length){renderResult();return;}
    const q=questions[state.i],song=songs[q.song],picked=state.picks[state.i],answered=picked!==null;
    const photo=`<figure class="quiz-track-art"><img src="${song.image}" onerror="this.onerror=null;this.src='${song.fallback}'" alt="Imagem de ${escapeHtml(song.artist)}" loading="lazy"><figcaption>ARQUIVO SONORO · ${song.year}</figcaption></figure>`;
    app.innerHTML=`<div class="quiz-topline"><span>O BRASIL EM TRÊS CANÇÕES</span><span>UMA PERGUNTA DE CADA VEZ</span></div><div class="quiz-track">${photo}<div class="quiz-track-copy"><span class="track-subtitle">${escapeHtml(song.artist)} · ${song.year}</span><h3>${escapeHtml(song.title)}</h3><p>${escapeHtml(song.insight)}</p><a class="listen-link" href="${song.link}" target="_blank" rel="noopener noreferrer">OUVIR A MÚSICA NO YOUTUBE ↗</a></div></div><div class="question-container"><div class="question-meta">RESPONDA SOBRE A MÚSICA</div><h4>${escapeHtml(q.text)}</h4><form id="question-form" novalidate><div class="answers" role="radiogroup" aria-label="Alternativas da pergunta">${q.choices.map((option,j)=>`<label class="answer-option ${answered?'is-locked':''} ${answered&&q.correct===j?'is-correct':''} ${answered&&picked===j&&picked!==q.correct?'is-incorrect':''}"><input type="radio" name="alternative" value="${j}" ${picked===j?'checked':''} ${answered?'disabled':''} required><span class="answer-text">${escapeHtml(option)}</span></label>`).join('')}</div><div class="quiz-actions"><div class="feedback ${answered?(picked===q.correct?'positive':'negative'):''}" id="question-feedback" role="status">${answered?`${picked===q.correct?'✓ Isso mesmo!':'✕ Não foi dessa vez.'} ${escapeHtml(q.explanation)}`:''}</div><button class="button" id="answer-button" type="submit">${answered?(state.i===questions.length-1?'VER RESULTADO':'PRÓXIMA PERGUNTA'):'CONFIRMAR RESPOSTA'} <span aria-hidden="true">↗</span></button></div></form></div>`;
    $('#question-form').addEventListener('submit',(event)=>{event.preventDefault();if(state.picks[state.i]===null){const checked=$('input[name="alternative"]:checked');if(!checked){$('#question-feedback').textContent='Escolha uma das alternativas para continuar.';$('#question-feedback').className='feedback negative';return;}state.picks[state.i]=Number(checked.value);save();render();}else{state.i++;save();render();if(window.matchMedia('(max-width:600px)').matches)$('#quiz-app').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}});
  }
  function renderResult(){let correct=0;questions.forEach((q,i)=>{if(q.correct===state.picks[i])correct++;});app.innerHTML=`<div class="result-page"><span class="result-seal">FIM DA ESCUTA · COMEÇO DA CONVERSA</span><h3>O BRASIL<br><em>AINDA PERGUNTA.</em></h3><span class="result-score">VOCÊ ACERTOU ${correct} DE 6 PERGUNTAS</span><p>Essas canções mostram que amar o país não precisa significar ignorar seus problemas.</p><button class="button" id="restart-quiz" type="button">OUVIR E RESPONDER NOVAMENTE <span aria-hidden="true">↗</span></button></div>`;$('#restart-quiz').addEventListener('click',setStart);}
  $('#begin-button').addEventListener('click',()=>{if(!state.started){setStart();}$('#experiencia').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});
  render();
})();