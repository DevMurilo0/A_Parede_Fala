# A Parede Fala — investigação do mural

Experiência interativa estática, em português, desenvolvida por **Murilo Gabriel** para acompanhar o mural físico **“E se o modernismo fosse hoje?”**.

## Como funciona

O visitante fica diante do cartaz e usa o celular para responder a **nove perguntas**. Para encontrar as respostas, precisa observar o mural físico (título, recortes, autor, capa de livro, manchetes, cartões musicais e frase na parte inferior). O próprio site **não exibe uma cópia do mural nem entrega respostas antecipadamente**.

O quiz oferece pistas de **localização no mural**, não de conteúdo. Respostas erradas permitem nova tentativa; somente a resposta correta desbloqueia a próxima pergunta. Ao acertar, o visitante recebe uma explicação curta. Há indicador de progresso, resultado final e reinício. O progresso é salvo com `localStorage` (chave nova para não reaproveitar respostas da versão anterior).

## De onde vêm as perguntas?

Da fotografia do mural físico fornecida pela organização, em novembro de 2026. Confira [FONTES.md](FONTES.md) para a relação de elementos usados. **Se o cartaz físico for alterado, revise as perguntas de `app.js`** para garantir que os alunos encontrem todas as respostas sem consultar a internet.

Não é necessário ler ou escanear os QR codes para concluir o quiz.

## Como editar perguntas

No arquivo `app.js`, modifique o array `questions`. Cada entrada inclui `section`, `area` (pista espacial), `question`, `choices`, `correct` (índice começando em zero), `hint` e `explanation`. Mantenha a resposta presente no mural.

## Como executar

Abra `index.html` com Live Server ou qualquer servidor de arquivos estáticos, por exemplo `python -m http.server 8000`. Não há dependências de npm, framework, API ou serviços externos.

Para publicar na Vercel: projeto vinculado a `DevMurilo0/A_Parede_Fala`, branch `main`, preset `Other`, sem comando de build. Se preferir GitHub Pages, o site também funciona diretamente.

## Estrutura

- `index.html`: apresentação do mural, instruções e experiência.
- `styles.css`: identidade editorial responsiva inspirada nas cores e recortes do cartaz.
- `app.js`: nove perguntas, verificação, novas tentativas, resultado e persistência.
- `assets/favicon.svg`: ícone do projeto.
- `FONTES.md`: descrição da fonte das perguntas.

O website foi propositalmente desenhado sem fotografias externas para que as respostas continuem no **mural real**.

## Edição com fotografias e símbolo gráfico

O visual agora incorpora fotografias históricas de artistas modernistas, com fontes abertas do Wikimedia Commons e crédito em `FONTES.md`. A marca anterior com letras foi substituída por um símbolo vetorial sem letras. Todos os símbolos decorativos pedidos para remover foram retirados.

As duas imagens que revelam diretamente respostas do questionário só são exibidas depois da conclusão das nove perguntas. Os títulos e textos de interface não usam hífens.


## Ajustes de transição e enquadramento

A lupa animada entra da parte superior da tela, faz um movimento de ampliação e desce sobre o botão da página inicial. Em telas de desktop menores, a seção inicial reduz sua altura e os espaços para exibir o botão sem exigir rolagem adicional.

Ao começar o desafio, o cabeçalho da seção é recolhido e o navegador rola diretamente até o cartão da pergunta. O efeito de explosão fica fixo na área visível e é acionado ao terminar a rolagem, com um tempo limite de segurança para navegadores que não disparam o evento de finalização. As preferências de movimento reduzido seguem respeitadas.


## Movimento suave

A abertura agora tem duração maior, com a logo deslizando suavemente e a lupa entrando de cima até o botão principal. A rolagem até o desafio utiliza uma curva de aceleração e desaceleração de aproximadamente 1,5 segundo e só então exibe a animação de entrada da pergunta. Os recortes e círculos se movem mais devagar e com menos saltos e rotações. A preferência do dispositivo por movimento reduzido continua sendo respeitada.


## Lupa com percurso contínuo

A animação inicial agora leva aproximadamente 8,65 segundos. O símbolo aparece primeiro e a lupa segue uma única curva Bézier, calculada continuamente pelo JavaScript com requestAnimationFrame, do topo da tela ao botão principal. A revelação circular só começa perto do fim do trajeto. Não há mudanças abruptas de caminho nem pulos no pouso. Em celulares, a lupa usa dimensões menores, a posição do botão é calculada no tamanho real da tela e as tipografias e os cartões têm ajustes para aparelhos compactos. A opção de reduzir movimentos e o botão de pular abertura permanecem disponíveis.


## Cronômetro e recorde pessoal

O contador é iniciado ao clicar em qualquer botão que inicia a investigação ou quando a seção de perguntas entra na área visível da página. O tempo é salvo com o progresso no navegador e continua contando ao atualizar ou sair da aba. Quando a nona resposta é acertada, o tempo é encerrado e comparado ao menor tempo anterior do mesmo navegador. A tela final mostra o tempo da rodada, o melhor recorde e incentiva o participante a tentar novamente. Reiniciar inicia uma nova contagem sem apagar o recorde. Os dados são armazenados apenas no dispositivo, sem ranking global ou cadastro.


## Sons e trilha

A abertura dura aproximadamente 1,35 segundo. O arquivo `audio.js` gera música instrumental original discreta e efeitos para botões, início, acertos, erros, conclusão e tique do relógio durante o cronômetro. O som começa configurado como ligado e pode ser silenciado pelo controle no cabeçalho. O ajuste fica salvo no navegador. Se o dispositivo bloquear áudio antes do primeiro gesto, a reprodução começa após o primeiro toque ou clique permitido. Não há serviços externos nem arquivos musicais de terceiros.
