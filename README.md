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


## Volume reforçado

Os efeitos e a trilha foram amplificados significativamente. Um compressor de dinâmica evita picos excessivos quando vários sons tocam juntos. O botão de som continua permitindo silenciar a experiência e o volume final ainda depende das configurações do aparelho e do navegador.


## Sons para todas as interações

A trilha instrumental original agora tem uma melodia mais presente, com harmonia reforçada e o mesmo compressor de áudio. O site tenta iniciar o áudio ao carregar e solicita a liberação no primeiro toque, inclusive durante a animação da lupa. Os cliques têm sons distintos para botões, navegação, seleção de alternativas, reinício, mudança de pergunta e cartões de conteúdo, além de sons para seções, respostas, resultado e tique do relógio. O áudio continua ligado por padrão e respeita a opção de silenciar. Navegadores que bloqueiam autoplay precisam de uma interação real antes da reprodução.


## Destaque na chamada da abertura

Ao terminar a entrada da lupa, o botão principal da investigação recebe uma pulsação roxa com contorno amarelo e um recorte editorial convidando a pessoa a apertá-lo. O destaque também é oferecido quando a abertura é pulada e respeita a preferência por animações reduzidas. O aviso desaparece ao iniciar o quiz e lembra como aumentar o volume no celular. Os navegadores não têm permissão para consultar ou alterar o volume físico do telefone; a reprodução segue com o áudio do site já amplificado.

## Ranking global

O site inclui uma classificacao global por apelido e melhor tempo. O visitante informa um apelido antes de iniciar as perguntas; o cronometro comeca quando ele inicia a partida. O navegador envia respostas sucessivas para a API da Vercel em /api/ranking, que usa tokens assinados e mede o tempo no servidor. Ao terminar, somente a melhor marca do dispositivo entra na classificacao. Uma partida antiga concluida antes de configurar o banco nao entra retroativamente no ranking. O recorde pessoal local permanece funcional quando o banco esta indisponivel.

O banco já está implantado no Supabase (projeto A Parede Fala - Ranking, região São Paulo), e a Edge Function publica o ranking no endpoint público `https://jwkydvtvjwcrdqfmvrrk.supabase.co/functions/v1/wall-ranking`. O navegador usa esta função diretamente; portanto não exige chaves nem variáveis de ambiente na Vercel. Os segredos são fornecidos automaticamente ao servidor Supabase e nunca aparecem no JavaScript do site. O arquivo `api/ranking.js` permanece como proxy de compatibilidade. Apenas os apelidos e os tempos ficam disponíveis publicamente, e as tabelas usam RLS sem políticas públicas. Não há ranking fictício ou contas exigidas.

Se o banco ainda nao estiver vinculado, a lista informa claramente que o ranking nao esta disponivel e nenhum participante ficticio aparece. Para testar um deploy, acesse /api/ranking: antes da configuracao retorna 503 com code unconfigured; depois retorna a lista JSON.


O código da função Supabase está versionado em `supabase/functions/wall-ranking/index.ts`, enquanto o SQL está em `supabase/leaderboard.sql`. O ranking só usa o tempo real medido no servidor e não aceita dados de cronometragem enviados pelo navegador. Os testes finais devem incluir a função online e a mesma classificação em dois aparelhos distintos.


## Ranking também na tela final

A tela de conclusão agora exibe uma prévia pública dos cinco melhores tempos e um link para a classificação completa, mesmo quando a partida salva é anterior à criação do ranking. Nesses casos, mostra uma explicação em português e um botão para começar uma nova rodada com apelido. O botão de jogar novamente retorna ao formulário sem apagar o recorde pessoal; a rodada anterior não é enviada retroativamente porque o servidor precisa validar as nove respostas e medir o tempo.


## Numeração automática dos jogadores

Não existe cadastro nem campo para escolher apelido. Cada navegador recebe no servidor um identificador estável na primeira vez que clicar em Iniciar Perguntas. A tabela wall_registrations e uma sequência PostgreSQL atribuem Player 1, Player 2, Player 3 na ordem das primeiras entradas, de forma atômica. O mesmo navegador mantém seu número em novas tentativas. O ranking é ordenado pelo menor tempo finalizado, independente do número recebido: Player 7 pode ser o primeiro colocado. Uma faixa informa Em primeiro lugar está: Player 7 quando houver resultados. Participantes que não terminarem ainda recebem seu número, mas não aparecem entre os melhores tempos. O cronômetro só começa após o servidor confirmar o registro. A estrutura adicional está na migração supabase/migrations/automatic_player_registration_order.sql.
