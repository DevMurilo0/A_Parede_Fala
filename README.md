# A PAREDE FALA — Modernismo Hoje

Site estático e interativo, desenvolvido por **Murilo Gabriel**, para trabalho escolar sobre **polarização e ufanismo exacerbado**. A parede física contém cinco peças manipuláveis; cada peça revela uma palavra que libera a próxima etapa do site.

## Abrir

- Abra `index.html` no Firefox, Chromium ou pelo Live Server no VS Code.
- Não é necessário npm, Node, conta, Firebase ou backend.
- Para usar QR code, publique a pasta em uma hospedagem estática (Netlify, Vercel, GitHub Pages etc.) e gere um QR para a URL pública.

## Conteúdo do ZIP

- `index.html` — experiência do visitante (cinco fases e final com manifesto).
- `styles.css` — estilos de base da exposição.
- `refine.css` — composição responsiva: hero, colagens, instruções, investigação sem barra lateral e crédito ao desenvolvedor.
- `app.js` — roteiro, respostas, verificação, links do YouTube, progresso e manifesto.
- `guia-da-parede.html` — **gabarito e cartões imprimíveis apenas para os organizadores**.
- `assets/` — texturas, favicon e obras de Cildo Meireles enviadas pelo usuário.

## Palavras-chave e peças da parede

| Fase | Peça manipulável | Frase no verso | Palavra |
| --- | --- | --- | --- |
| 1 | Cédula Zero Cruzeiro com cordão | A arte questiona o VALOR dos símbolos. | `VALOR` |
| 2 | Seletor da rádio com aba | A música também é RESISTÊNCIA. | `RESISTÊNCIA` |
| 3 | Folha dobrável de poesia e slam | Toda VOZ pode romper o silêncio. | `VOZ` |
| 4 | Jornal dobrável | Sem CONTEXTO, uma notícia vira arma. | `CONTEXTO` |
| 5 | Bandeira com aba | O Brasil é PLURAL. | `PLURAL` |

As frases são originais para a exposição — **não são citações de artistas**. As palavras ficam no código JS para verificação local, então não se trata de um sistema antifraude; o objetivo é pedagógico.

## Músicas

Os links enviados no chat foram identificados assim:
1. Raul Seixas — **Aluga-se**: https://youtu.be/d3iI-ktX2WI
2. Legião Urbana — **Que País É Este**: https://youtu.be/vA-3BYOW2wo
3. Edson Gomes — **Vamos Amigo Lute**: https://youtu.be/VCxcEfZAw5Y
4. Cazuza — **Brasil**: https://youtu.be/kCUZr_K8et8

O link de Edson Gomes foi recebido duas vezes com parâmetros diferentes. Para evitar duplicidade há só quatro faixas distintas. Músicas abrem no YouTube; nenhum áudio com direitos autorais é distribuído no ZIP.

## Personalizar

Em `app.js`, altere os objetos da lista `missions`: `command` (ordem exibida), `answer` (palavra), `quote` (frase da parede) e `reveal` (explicação). Ajuste as frases impressas no guia para coincidirem com as palavras do site. O progresso fica salvo em `localStorage`, apenas no dispositivo em que a pessoa visita.

## Observações históricas

- O Modernismo brasileiro marcou um período histórico; artistas apresentados como inspirações contemporâneas **não são integrantes do movimento de 1922**.
- A obra *Zero Cruzeiro* de Cildo Meireles é de 1974–1978. A bandeira reinterpretada com mensagem contra a ditadura foi divulgada em 2020.
- Não usar a imagem de uma notícia atual para insinuar autoria, motivação ou filiação política sem comprovação.

## Fontes de contexto

- Google Arts & Culture: https://artsandculture.google.com/asset/zero-cruzeiro-cildo-meireles/7AFeUVhUVS3Zuw?hl=pt
- Folha de S.Paulo (Cildo e bandeira, 2020): https://www1.folha.uol.com.br/ilustrada/2020/10/cildo-meireles-satiriza-regimes-totalitarios-em-obra-de-serie-pela-democracia.shtml
- Modernismo e manifestos: https://www.todamateria.com.br/manifestos-modernistas-pau-brasil-antropofagia-verde-amarelismo-e-anta/

Sem coleta de dados e sem envio de opiniões. O manifesto final pode ser copiado ou impresso localmente.

## Código no GitHub

O código foi preparado para atualização em uma branch isolada no repositório da revista escolar, sem modificar a branch `main`. Para executar: baixe este ZIP, extraia, e abra `index.html` pelo Live Server. O site não depende de build.

## Segurança e autoria

As palavras de resposta são verificadas no navegador (não constituem autenticação). Os QR codes e links levam ao YouTube; não há músicas incorporadas nem coleta de respostas. As imagens das obras de Cildo foram fornecidas como referência pelo organizador da exposição; confira direitos de reprodução para publicação pública.

## Atualização — navegação sem antecipações

A interface mostra **somente a missão atual**, sem prévias das próximas perguntas,
sem faixa numerada e sem indicação do total de etapas. O avanço é progressivo,
acionado apenas quando a palavra correta é digitada.

**Desenvolvimento do website: Murilo Gabriel.**

O arquivo `GABARITO_DA_PAREDE.md` é de uso dos organizadores e deve ser mantido
fora da hospedagem pública caso o objetivo seja preservar a surpresa da experiência.
