# T01 — Fundação e ambiente

**Depende de:** aprovação do plano · **Specs:** `00-project-overview.md` §3, `01-architecture.md` §2

## Objetivo

Deixar o projeto compilando e rodando em Android e iOS com as bibliotecas já instaladas configuradas corretamente, antes de qualquer tela.

## Escopo

1. Ambiente: `.nvmrc` com `22` (nvm já tem 22.22.2 como padrão; o shell do editor estava em 20) e documentar no README.
2. Declarar `react-native-worklets@0.13.x` em `dependencies` (hoje só instalado como peer → fora do autolinking).
3. `babel.config.js`: adicionar `react-native-worklets/plugin`.
4. Instalar `react-native-svg` (aprovado, D-05) e `@testing-library/react-native` (dev).
5. `jest.setup.ts`: mocks de AsyncStorage (mock do pacote), Reanimated e Gesture Handler; registrar em `jest.config.js`.
6. Script `typecheck` (`tsc --noEmit`) no `package.json`.
7. iOS: `bundle install` + `bundle exec pod install`.
8. Mover o `App.tsx` raiz para `src/app/App.tsx` (o raiz só reexporta), com `GestureHandlerRootView` + `SafeAreaProvider` e uma tela placeholder preta.

## Fora de escopo

Tema, telas, navegação real, troca de bundle id/nome do app.

## Critérios de aceite

- [x] `npm run typecheck`, `npm run lint` e `npm test` passam.
- [x] Android e iOS compilam com as libs nativas novas: confirmado pelo desenvolvedor ao rodar o app em aparelho e emulador (ver T09).
- [x] Um teste de fumaça renderiza o `App` com os providers.

## Validação

Executar e reportar os 3 comandos de qualidade e os 2 builds; registrar limitações do ambiente (ex.: simulador indisponível). Por decisão do desenvolvedor, os builds só compilam (`assembleDebug` / `xcodebuild` para simulador), sem abrir emulador ou simulador.

## Status (2026-11-04)

Concluído:

- `.nvmrc` = `22`; todos os comandos rodados com Node 22.22.2.
- Dependências: `react-native-svg@15.16.0`, `react-native-worklets@0.13.1` (agora declarado), `@testing-library/react-native@14.1.0` + `test-renderer@1.3.1` (dev). Sem conflitos de peer. `npm audit`: só alertas baixos/moderados em ferramentas de dev (CLI, ESLint, Jest); nenhum no runtime do app.
- `babel.config.js` com `react-native-worklets/plugin`.
- Jest: resolver do Reanimated, setup do Gesture Handler e `jest.setup.ts` com mocks de worklets (o GH 3 usa o runtime de UI ao carregar), AsyncStorage e safe-area-context (sem medidas nativas, o provider não renderiza filhos).
- Script `typecheck`.
- `pod install` (CocoaPods 1.16.2 global): 93 pods, incluindo RNSVG, RNWorklets, RNReanimated, RNGestureHandler, RNScreens, safe-area e AsyncStorage.
- `App.tsx` raiz reexporta `src/app/App.tsx`; providers em `src/app/providers/AppProviders.tsx`; tela placeholder preta.
- Assets do Figma em `src/assets/` (ícones SVG, `logo.png`, `no-classroom.png`).

Pendente:

- ~~Compilação nativa não concluída.~~ Resolvido: o desenvolvedor compilou e rodou o app em Android e iOS. Os scripts `yarn android` e `yarn ios` compilam só a arquitetura do aparelho em uso.
- ~~Documentação do Node no README~~: feita na T10.
