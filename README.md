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
