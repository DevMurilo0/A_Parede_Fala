# A Parede Fala — O Brasil em Três Canções

Site estático independente, desenvolvido por **Murilo Gabriel**.

## Nova experiência

Três músicas indicadas pela organização:

1. **Aluga-se**, Raul Seixas — https://youtu.be/d3iI-ktX2WI?is=1yUYdp_tKhb2sOEx
2. **Que País É Este**, Legião Urbana — https://youtu.be/vA-3BYOW2wo?is=EOaK3CR3gpI-I2Rr
3. **Brasil**, Cazuza — https://youtu.be/kCUZr_K8et8?is=OaU8g8vS9VH5PDBc

O visitante responde **seis perguntas de múltipla escolha**, duas para cada música, sem interação física com a parede. As respostas são verificadas localmente, com explicações curtas e resultado final. O progresso permanece no navegador até a experiência ser reiniciada.

## Como rodar

Abra `index.html` com Live Server ou um servidor estático (`python -m http.server 8000`). Sem npm, framework ou build. Testado em telas pequenas e desktop.

## Arquivos

- `index.html`: layout e conteúdo.
- `styles.css`: colagens, tipografia, composição, responsividade e animações.
- `app.js`: as seis perguntas, validação, resultado e persistência local.
- `assets/`: texturas e elementos gráficos originais do projeto anterior.
- `FONTES.md`: imagens externas e pesquisa factual.

## Imagens

As três fotografias/capa são carregadas de fontes externas públicas (Last.fm, Raw Music Store e Terra). O site preserva sua composição mesmo caso alguma dessas fontes fique temporariamente indisponível. A disponibilidade depende dos sites de origem. Os créditos estão em `FONTES.md`.

## Publicação

Para publicar no Vercel: importação do repositório independente `DevMurilo0/A_Parede_Fala`, framework `Other`, raiz `./`, branch de produção `main`, sem build command e sem output directory.