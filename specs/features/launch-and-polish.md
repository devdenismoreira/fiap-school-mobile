# Feature — Abertura do app e ajustes de experiência

> Status: **implementada e validada em aparelho** (T15) · Decisões: D-36, D-37 · Feedback do teste em aparelho depois da T12

## 1. Itens

| # | Ajuste | Decisão |
|---|---|---|
| 1 | **Launch screen até restaurar a sessão** com `react-native-bootsplash` 7.3.3 (versão fixa): `BootSplashGate` esconde a tela quando o estado deixa de ser `restoring`. Nativo: `SceneDelegate.swift`, `MainActivity.kt`, `BootTheme` | D-36 |
| 2 | **Toast redesenhado**: variantes `success`, `error`, `info`, `warning`, ícone, título, barra de progresso que se esvazia e fechamento ao arrastar para baixo | D-27 a D-34 (evolução) |
| 3 | **Teclado no iOS**: o botão de entrar sobe junto com o teclado (`useAnimatedKeyboard`); no Android continua o `KeyboardAvoidingView` | — |
| 4 | **Loading no botão de entrar**: `ActivityIndicator` (`primary-button-spinner`) no `PrimaryButton` | — |
| 5 | **Animações mais rápidas**: tokens `fast 150`, `normal 220`, `quick 260`, `tab 320`; o modal de perfil e a abertura dos trimestres ficaram como estavam | D-09 (ajuste) |
| 6 | **URL única da API** (produção, HTTPS), sem variável de ambiente | D-37 |

## 2. Critérios de aceite

Automatizados: `BootSplashGate`, toast (variantes, barra, arrasto), spinner do botão, `apiConfig` (https e sem barra final), tokens de movimento.
Manuais (feitos pelo desenvolvedor em aparelho): sem tela preta na abertura, teclado e botão em sincronia no iOS, fluidez das animações.
