/* A Parede Fala — progressão local entre objetos da parede.
   Para trocar palavras secretas, edite o campo answer de cada missão.
   Nenhum texto ou resposta é enviado a servidores. */
(() => {
  'use strict';
  const STORAGE_KEY = 'parede-fala-v1';
  const tracks = [
    {title:'Aluga-se', artist:'Raul Seixas', id:'d3iI-ktX2WI', note:'Uma provocação irônica sobre a relação com o país.'},
    {title:'Que País É Este', artist:'Legião Urbana', id:'vA-3BYOW2wo', note:'Uma pergunta que atravessa gerações.'},
    {title:'Vamos Amigo Lute', artist:'Edson Gomes', id:'VCxcEfZAw5Y', note:'Reggae, denúncia social e mobilização.'},
    {title:'Brasil', artist:'Cazuza', id:'kCUZr_K8et8', note:'Um olhar crítico sobre contradições nacionais.'}
  ];
  const missions = [
    {
      short:'O VALOR DOS SÍMBOLOS', type:'CÉDULA', no:'01', tag:'A ARTE E O PODER',
      title:'Quanto vale <em>uma nação?</em>',
      description:'Cildo Meireles transformou objetos comuns em perguntas incômodas. Mas a resposta dessa fase não está na tela.',
      command:'Na parede, encontre a cédula <i>Zero Cruzeiro</i>, de Cildo Meireles. Puxe o cordão vermelho preso à nota. Leia a frase que apareceu atrás dela.',
      answer:'VALOR', hint:'Procure a nota vermelha com o número zero. A palavra está escrita no verso da pequena aba puxada pelo fio.',
      quote:'A arte questiona o VALOR dos símbolos.',
      revealTitle:'Nem tudo que vale tem preço.',
      reveal:'Em <i>Zero Cruzeiro</i> (1974–1978), Cildo Meireles usou a aparência do dinheiro para questionar noções de valor, circulação e invisibilidade social. Em outros trabalhos, fez mensagens críticas circularem em cédulas. É uma maneira de usar os símbolos cotidianos contra interpretações prontas.',
      medium:'cildo'
    },
    {
      short:'A RÁDIO NÃO SE CALA', type:'RÁDIO', no:'02', tag:'A MÚSICA E A CRÍTICA',
      title:'O país tem <em>trilha sonora.</em>',
      description:'Muito antes dos comentários nas redes, a música já discutia contradições, desigualdade, identidade e nacionalismo.',
      command:'Procure a rádio de papelão na parede. Gire o seletor até a marca vermelha. Abra a janelinha abaixo do botão e descubra a palavra escondida.',
      answer:'RESISTÊNCIA', hint:'Não está no título de nenhuma música. Está atrás da janela móvel da rádio, perto do seletor.',
      quote:'A música também é RESISTÊNCIA.',
      revealTitle:'Escutar também é questionar.',
      reveal:'Essas canções pertencem a décadas posteriores ao Modernismo histórico, mas dialogam com sua liberdade de linguagem e com o desejo de mostrar o Brasil sem idealizações. Hoje, artistas como Emicida e BaianaSystem continuam a expandir esse debate musical.',
      medium:'radio'
    },
    {
      short:'A VOZ QUE RASGA O PAPEL', type:'POESIA', no:'03', tag:'POESIA, SLAM E PRESENÇA',
      title:'Quem pode <em>falar?</em>',
      description:'A poesia contemporânea também vive nas ruas, no slam e nas telas. Mel Duarte e Ryane Leão mostram como a palavra pode ocupar novos espaços.',
      command:'Encontre o cartaz “Poesia e Slam”. Levante a camada de papel presa por um clipe ou puxe sua lingueta. Leia o verso autoral que está por baixo.',
      answer:'VOZ', hint:'A pista está na palavra destacada dentro do verso, atrás do recorte “Poesia e Slam”.',
      quote:'Toda VOZ pode romper o silêncio.',
      revealTitle:'A poesia não pede licença.',
      reveal:'Versos livres, linguagem do cotidiano e novas formas de circulação aproximam o espírito de experimentação modernista das poetas e dos slams contemporâneos. O verso secreto foi criado exclusivamente para esta exposição.',
      medium:'slam'
    },
    {
      short:'JORNAL EM DISPUTA', type:'JORNAL', no:'04', tag:'REDES, NOTÍCIAS E POLARIZAÇÃO',
      title:'Quem conta <em>a notícia?</em>',
      description:'Uma manchete pode informar. Uma publicação recortada pode também omitir informações. Polarização não é motivo para abandonar a verificação dos fatos.',
      command:'Na parede, abra o jornal dobrável com a manchete “BRASIL EM DISPUTA”. Atrás da primeira folha está uma frase com a palavra-chave.',
      answer:'CONTEXTO', hint:'Levante a primeira dobra do jornal. A palavra aparece depois de “Sem...”.',
      quote:'Sem CONTEXTO, uma notícia vira arma.',
      revealTitle:'O recorte muda a leitura.',
      reveal:'O problema não é discordar: é confundir interpretação com fato e transformar quem pensa diferente em inimigo. Ao analisar uma notícia, investigue sua fonte, sua data e o que ficou de fora do recorte.',
      medium:'news'
    },
    {
      short:'A BANDEIRA E AS VOZES', type:'BANDEIRA', no:'05', tag:'IDENTIDADE E UFANISMO',
      title:'De quem é <em>o Brasil?</em>',
      description:'Símbolos nacionais podem expressar pertencimento, mas também podem ser usados para silenciar críticas. A mesma bandeira admite leituras diferentes.',
      command:'Encontre a bandeira na seção “Artes visuais”. Vire a última aba e leia o pequeno manifesto que estava escondido atrás dela.',
      answer:'PLURAL', hint:'A palavra está no fim do manifesto escondido atrás da bandeira, em letras maiúsculas.',
      quote:'O Brasil é PLURAL.',
      revealTitle:'Uma bandeira. Muitas histórias.',
      reveal:'Em obra de 2020, Cildo Meireles subverteu a imagem da bandeira para criticar o autoritarismo. Debater o país não significa negar sua cultura: significa reconhecer que ele é composto por diferentes experiências, identidades e opiniões.',
      medium:'flag'
    }
  ];
  const $ = (sel) => document.querySelector(sel);
  const missionContainer = $('#mission-container');
  let current = 0;
  let unlocked = false;
  let attempts = 0;
  try { const data = JSON.parse(localStorage.getItem(STORAGE_KEY)); current = Number.isInteger(data?.current) ? Math.max(0,Math.min(5,data.current)) : 0; unlocked = !!data?.unlocked; } catch (_) { current = 0; unlocked = false; }
  function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({current,unlocked}));}catch(_){}}
  function norm(text){return String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase().replace(/[^A-Z0-9]/g,'');}
  function escapeHtml(text){return String(text).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));}
  function gallery(m){
    if(m.medium==='cildo')return `<figure class="cildo-image"><img src="assets/cildo-zero-cruzeiro.webp" alt="Reprodução de Zero Cruzeiro, de Cildo Meireles" loading="lazy"><figcaption>CILDO MEIRELES · ZERO CRUZEIRO · 1974–1978</figcaption></figure><span class="clue-stamp" aria-hidden="true">A PISTA ESTÁ<br>NA PAREDE ↘</span>`;
    if(m.medium==='radio')return `<div class="radio-device" role="img" aria-label="Rádio de época ilustrado com controles de sintonia"><div class="radio-wire"></div><div class="radio-speaker"></div><div class="radio-controls"><div class="radio-display">AM 19.22 / FM 20.26</div><div class="radio-dial"></div></div></div><span class="clue-stamp" aria-hidden="true">SINTONIZE<br>A PAREDE ↘</span>`;
    if(m.medium==='slam')return `<div class="slam-sheet" role="img" aria-label="Simulação de cartaz de poesia contemporânea"><span class="slam-hashtag">#POESIANA RUA</span><div class="slam-big">A palavra<br>ocupa<br>espaço.</div><p>Mel Duarte · Ryane Leão<br><small>Referências de poesia atual</small></p></div><span class="clue-stamp">POESIA É<br>MOVIMENTO ↗</span>`;
    if(m.medium==='news')return `<div class="newspaper"><div class="newspaper-row"><span>EDIÇÃO ESPECIAL</span><span>ARQUIVO DA EXPOSIÇÃO — 2026</span></div><h4>BRASIL EM DISPUTA</h4><p>Fato, opinião e manchete. Como diferenciar o que aconteceu da maneira como um acontecimento é contado? Uma notícia fora de contexto pode alimentar interpretações equivocadas. Esta manchete é uma simulação educativa.</p></div>`;
    return `<div class="flag-art"><img src="assets/cildo-bandeira.webp" alt="Bandeira brasileira reinterpretada por Cildo Meireles em obra crítica ao autoritarismo" loading="lazy"></div><div class="flag-side"><span>O símbolo nunca conta tudo.</span></div>`;
  }
  function renderMusic(){return `<div class="music-list" aria-label="Músicas vinculadas ao trabalho">${tracks.map((t,i)=>`<a class="music-track" href="https://youtu.be/${t.id}" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${escapeHtml(t.title)} de ${escapeHtml(t.artist)} no YouTube"><span class="track-idx">0${i+1}</span><span class="track-body"><strong>${escapeHtml(t.title)}</strong><small>${escapeHtml(t.artist)}</small></span><span class="track-open" aria-hidden="true">↗</span></a>`).join('')}</div><p class="reveal-note">São os quatro links distintos enviados para os QR codes. “Vamos Amigo Lute” apareceu duas vezes no chat, por isso há somente uma entrada.</p><p class="reveal-note">Outra obra relacionada ao tema: <em>Farsa Nacionalista</em>, dos Ratos de Porão (1989), discutida no painel. As faixas aqui abrem no YouTube; nenhuma música é armazenada ou reproduzida pelo site.</p>`;}
  function updateNavigation(){
    // Apenas a pista atual aparece na tela: não antecipar as próximas missões.
    $('#status-label').textContent = current >= missions.length ? 'INVESTIGAÇÃO CONCLUÍDA' : 'PISTA ATUAL';
    $('#start-button').innerHTML = current >= missions.length
      ? 'VER MEU MANIFESTO <span aria-hidden="true">↗</span>'
      : current === 0
        ? 'COMEÇAR A INVESTIGAÇÃO <span aria-hidden="true">↗</span>'
        : 'CONTINUAR A INVESTIGAÇÃO <span aria-hidden="true">↗</span>';
  }
  function missionMarkup(m){return `<div class="mission-inner"><div class="mission-serial"><span>DESCOBERTA ATUAL</span><span>${m.tag}</span></div><div class="mission-intro"><span class="mission-kicker">ENCONTRE A PISTA NA PAREDE</span><h3 class="mission-title">${m.title}</h3><p class="mission-desc">${m.description}</p></div><div class="mission-content"><div class="mission-work"><div class="mission-command-card"><span class="prompt-note">↙ O QUE VOCÊ PRECISA FAZER</span><p class="mission-command">${m.command}</p></div><form class="mission-form" id="mission-form" novalidate><label class="form-label" for="secret-input">QUAL PALAVRA VOCÊ ENCONTROU?</label><p class="form-explanation">Digite a palavra que foi revelada no objeto físico da parede.</p><div class="input-box"><input id="secret-input" name="secret" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="52" placeholder="Escreva a palavra secreta" required aria-describedby="feedback"><button class="button button--red" type="submit">DESBLOQUEAR <span aria-hidden="true">↗</span></button></div><p class="feedback" id="feedback" role="status" aria-live="polite"></p><div class="mission-hint"><span aria-hidden="true">✳</span> Ainda não encontrou? <button type="button" class="hint-toggle" id="hint-toggle" aria-expanded="false" aria-controls="hint-text">VER UMA DICA ↗</button></div><p class="hint-text" id="hint-text" hidden>${m.hint}</p></form></div><div class="mission-illustration" aria-label="Imagem relacionada à missão">${gallery(m)}</div></div><div id="reveal-box"></div></div>`;}
  function render(){
    attempts=0;
    updateNavigation();
    if(current>=5){renderEnding();return;}
    const m=missions[current];
    missionContainer.innerHTML=missionMarkup(m);
    $('#mission-form').addEventListener('submit',e=>{
      e.preventDefault();
      const val=$('#secret-input').value;
      if(!val.trim()){showFeedback('Digite a palavra encontrada na parede.','error');$('#secret-input').focus();return;}
      if(norm(val)===norm(m.answer)) unlock(m); else {
        attempts++;
        showFeedback(attempts>=2?'Ainda não. Confira a aba física da parede e tente outra vez.':'Essa palavra não abre o arquivo. Olhe novamente a pista da parede.','error');
        $('#secret-input').select();
      }
    });
    $('#hint-toggle').addEventListener('click',()=>{
      const el=$('#hint-text'), b=$('#hint-toggle');
      el.hidden=!el.hidden;
      b.setAttribute('aria-expanded',String(!el.hidden));
      b.textContent=el.hidden?'PEDIR PISTA':'ESCONDER PISTA';
    });
    if(unlocked) unlock(m,true);
  }
  function showFeedback(msg,type){const el=$('#feedback');el.textContent=msg;el.dataset.type=type;}
  function unlock(m,fromRestore=false){
    unlocked=true;save();
    showFeedback('Palavra correta. Arquivo recuperado.','ok');
    const form=$('#mission-form');form.querySelectorAll('input,button').forEach(el=>{el.disabled=true;});
    $('#reveal-box').innerHTML=`<div class="reveal" role="region" aria-label="Conteúdo desbloqueado"><h3>${m.revealTitle}</h3><div class="quote-revealed">${m.quote}</div><p>${m.reveal}</p>${m.medium==='radio'?renderMusic():''}<div class="reveal-actions"><button type="button" class="button button--ink" id="next-button">${current===4?'ABRIR MANIFESTO FINAL':'ABRIR PRÓXIMO ARQUIVO'} <span aria-hidden="true">↗</span></button><span class="archive-bonus">DESCOBERTA REVELADA ✓</span></div></div>`;
    if(!fromRestore) $('#reveal-box').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
    $('#next-button').addEventListener('click',()=>{current++;unlocked=false;save();render();document.getElementById('missao').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});
  }
  function renderEnding(){
    missionContainer.innerHTML=`<div class="mission-inner end-sheet"><div class="end-seal">ARQUIVO<br>ABERTO<br>✓</div><p class="eyebrow">INVESTIGAÇÃO CONCLUÍDA</p><h2>A PAREDE<br><em>FALOU.</em><br>E VOCÊ?</h2><p>Você encontrou cinco palavras, cinco formas de questionar o país e uma ideia que continua aberta: <strong>amar o Brasil não significa deixar de enxergar seus problemas.</strong></p><p>O Modernismo pertence à história. Seu impulso de experimentar, questionar e recriar linguagens ainda inspira outras manifestações artísticas.</p><label class="manifesto-label" for="manifesto-input">AGORA ESCREVA SEU PRÓPRIO MANIFESTO:</label><textarea class="manifesto-input" id="manifesto-input" maxlength="250" placeholder="Para mim, amar o Brasil é..." aria-describedby="manifesto-help"></textarea><p id="manifesto-help" class="reveal-note">Até 250 caracteres. Seu texto fica apenas neste navegador; não é publicado.</p><div class="manifesto-actions"><button class="button button--red" type="button" id="create-manifesto">CRIAR MEU CARTAZ ↗</button></div><div id="manifesto-output" aria-live="polite"></div></div>`;
    $('#create-manifesto').addEventListener('click',()=>{
      const value=$('#manifesto-input').value.trim();const output=$('#manifesto-output');
      if(!value){$('#manifesto-input').focus();output.textContent='Escreva ao menos uma frase para criar seu cartaz.';return;}
      output.innerHTML=`<div class="manifesto-result" id="manifesto-card"><small>MEU MANIFESTO · MODERNISMO HOJE</small><h3>O BRASIL<br>QUE EU VEJO.</h3><p id="manifesto-text"></p><small>A PAREDE FALA — EXPOSIÇÃO INTERATIVA</small></div><div class="manifesto-actions"><button type="button" class="button button--ink" id="copy-manifesto">COPIAR MINHA FRASE ↗</button><button type="button" class="button button--light" id="print-manifesto">IMPRIMIR CARTAZ ↗</button></div>`;
      $('#manifesto-text').textContent=value;
      $('#copy-manifesto').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(value);$('#copy-manifesto').textContent='COPIADO ✓';}catch(_){const ta=$('#manifesto-input');ta.select();document.execCommand('copy');$('#copy-manifesto').textContent='TEXTO SELECIONADO';}});
      $('#print-manifesto').addEventListener('click',()=>window.print());
      output.scrollIntoView({behavior:'smooth',block:'nearest'});
    });
  }
  $('#start-button').addEventListener('click',()=>{document.getElementById('missao').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});
  $('#reset-button').addEventListener('click',()=>{if(!confirm('Reiniciar todas as fases desta experiência neste navegador?'))return;current=0;unlocked=false;save();render();document.getElementById('missao').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});
  render();
})();
