# T02 — Design system e assets

**Depende de:** T01 · **Specs:** `03-design-system.md`

## Objetivo

Centralizar tokens no tema Restyle, vincular a fonte Montserrat e versionar os assets do Figma.

## Escopo

1. Assets do Figma já salvos em `src/assets/` (2026-11-04). Nesta tarefa: decidir como carregar os SVGs com `react-native-svg` (transformer do Metro ou componente) sem redesenhar paths, e conferir as dimensões dos PNGs para @2x/@3x.
2. Fontes Montserrat Regular/Medium/SemiBold/Bold (OFL) em `src/assets/fonts/` + `react-native.config.js` + `npx react-native-asset`.
3. `src/core/theme/theme.ts`: `colors`, `spacing`, `borderRadii`, `textVariants`, constantes de movimento; `Box` e `Text` via Restyle; `ThemeProvider` no `AppProviders`.
4. Componente `Icon` com `react-native-svg` (D-05).
5. `PrimaryButton` (disabled/enabled/loading vazio, como no Figma) com variantes Restyle.

## Fora de escopo

Componentes específicos de feature (ficam nas respectivas tarefas).

## Critérios de aceite

- [x] Todas as cores, tamanhos de fonte, espaçamentos e raios usados vêm do tema (sem valores soltos nos componentes).
- [ ] Montserrat renderiza nos 4 pesos em Android e iOS — **pendente**: depende de rodar o app (builds nativos adiados a pedido do desenvolvedor).
- [x] `PrimaryButton` tem testes para os 3 estados.
- [x] Assets versionados sem referências a URLs do Figma.

## Validação

typecheck, lint, testes; captura de tela Android e iOS com amostra de tipografia.

## Status (2026-11-04)

Concluído:

- Tema Restyle (`src/core/theme/`): cores do Figma (+ `onPrimary` para texto sobre o ciano), espaçamentos, raios, 15 variantes de texto, `sizes` e `motion`. `Box` e `Text` (com `maxFontSizeMultiplier` 1,3). `ThemeProvider` no `AppProviders`; placeholder do `App` usa o token `background`.
- Montserrat oficial (OFL) em `src/assets/fonts/`, nomes PostScript conferidos; licença em `src/assets/licenses/`. Vinculada com `npx react-native-asset@2.3.0` (Info.plist só ganhou `UIAppFonts`; formatação original restaurada).
- `Icon` com `LocalSvg` de `react-native-svg/css` (decisão do desenvolvedor: sem dependência nova). Caixa fixa do Figma + SVG no tamanho original, centralizado.
- `PrimaryButton`: habilitado, desabilitado e carregando (vazio, `busy`), com área segura inferior pintada com a cor do botão. Optou-se por estados com cor condicional em vez de variantes Restyle (só há um tipo de botão no Figma).
- `src/test-utils/renderWithTheme.tsx` para testes de componentes.
- Testes: tokens do tema (cores do Figma, fontes existentes, cores referenciadas, line-height ~1,22), `Icon` (7 ícones, acessibilidade) e `PrimaryButton` (3 estados + área segura). Total do projeto: 12 suítes, 84 testes.

Pendente:

- Verificação visual da fonte e dos ícones em dispositivo (junto com a retomada dos builds nativos da T01).
- PNGs do Figma só em @1x (ver limitação em `03-design-system.md` §6).
