# 03 — Design system (Restyle)

> Status: **aprovada e implementada** (T02, T09) · Fonte: Figma `YBBIc9PlBhxcLuHTOi4V9p`, via `get_design_context` dos frames `2:6`, `3:1232`, `3:1262`, `2:48`, `2:88`, `3:1054`, `3:775`, `2:5`, `3:908` e cores dos SVGs exportados

**Diretriz: Perfect Pixel** — medidas, cores, tipografia e estados seguem o Figma; a única exceção são as normalizações da §7.

O arquivo **não tem variáveis nem estilos** do Figma. Os tokens abaixo foram derivados dos valores brutos e consolidados quando o mesmo valor se repete. Frame base 414 × 736 pt; o layout será fluido (flex), não posicionado em absoluto.

## 1. Cores

| Token | Hex | Uso no Figma |
|---|---|---|
| `background` | `#000000` | Fundo de todas as telas |
| `onPrimary` | `#000000` | Texto sobre fundo `primary` (botão habilitado) |
| `textPrimary` | `#FFFFFF` | Textos; sublinhado do input preenchido |
| `primary` | `#29F4D5` | Botão de login, títulos de seção, aba ativa, setas, "FECHAR", ícone fechar, erro do login, borda do aluno selecionado, título do trimestre |
| `surface` | `#262626` | Dropdowns (fechado e painel de opções), barra de abas |
| `surfaceRaised` | `#4D4D4D` | Cards de trimestre e de aluno |
| `timelineDot` | `#CCCCCC` | Borda do marcador da lista de aulas |
| `inputLine` | `#525252` | Sublinhado do input vazio |
| `inputLineFilled` | `#FFFFFF` | Sublinhado do input preenchido |
| `textDisabled` | `#777777` | Texto "FAZER LOGIN" desabilitado |

O rosa de "SCHOOL" faz parte do logo (imagem) e não vira token.

### Contraste (WCAG 2.x)

| Combinação | Razão | Situação |
|---|---|---|
| `textPrimary` / `background` | 21:1 | OK |
| `primary` / `background` | 15:1 | OK |
| `background` / `primary` (botão) | 15:1 | OK |
| `textDisabled` / `primary` (botão desabilitado) | 3,2:1 | Isento (desabilitado) |
| `textPrimary` / `surface` | 15,1:1 | OK |
| `textPrimary` / `surfaceRaised` | 8,4:1 | OK |
| `primary` / `surfaceRaised` | 6,0:1 | OK |
| `inputLine` / `background` | 2,7:1 | Abaixo de 3:1 para componente de UI; o rótulo "CPF"/"SENHA" garante a identificação. Mantido por fidelidade |

## 2. Tipografia

Família: **Montserrat** — Regular 400, Medium 500, SemiBold 600, Bold 700. Line-height "normal" do Figma ≈ 1,22 × tamanho, confirmado pelas alturas das caixas de texto.

| Variante Restyle | Peso | Tamanho / line-height | Uso |
|---|---|---|---|
| `inputValue` | Regular | 32 / 39 | Valor de CPF e senha |
| `greeting` | Regular | 24 / 29 | "Olá, " |
| `greetingBold` | Bold | 24 / 29 | Nome em "Olá, **GUSTAVO**" (Text aninhado) |
| `headline` | Regular | 24 / 29 | "Escolha o perfil que você quer visualizar" |
| `sectionTitle` | Bold, `primary` | 20 / 24 | "AGENDA", "BOLETIM" |
| `fieldLabel` | Regular | 20 / 24 | "CPF", "SENHA" |
| `button` | Medium | 20 / 24 | "FAZER LOGIN" |
| `emptyState` | Regular | 20 / 24 | "Sem aulas neste dia" |
| `body` | Regular | 16 / 20 | Opções de dropdown, "7EF - RM 12567 - Matutino" |
| `bodyMedium` | Medium | 16 / 20 | Nome do aluno; mensagem de erro (`primary`) |
| `bodySemiBold` | SemiBold | 16 / 20 | Disciplina na lista de aulas |
| `bodyBold` | Bold | 16 / 20 | "1º TRIMESTRE" (`primary`), "FECHAR" (`primary`) |
| `caption` | Regular | 12 / 15 | Horário da aula, "TROCAR PERFIL", "SAIR" |
| `captionMedium` | Medium | 12 / 15 | Disciplina no boletim, "Nota:"/"Faltas:" |
| `tabLabel` | Bold | 10 / 12 | "AGENDA"/"BOLETIM" na barra de abas |

Implementação da fonte:

- Arquivos estáticos TTF da Montserrat (repositório oficial JulietaUla/Montserrat, licença OFL) em `src/assets/fonts/`. Os nomes PostScript, conferidos na tabela `name` de cada arquivo, são iguais aos nomes dos arquivos (`Montserrat-Regular`, `-Medium`, `-SemiBold`, `-Bold`). Assim, o mesmo `fontFamily` funciona em iOS e Android.
- Licença em `src/assets/licenses/Montserrat-OFL.txt`, fora da pasta vinculada, para não ir para o bundle.
- Vinculação feita com `react-native.config.js` (`assets: ['./src/assets/fonts']`) + `npx react-native-asset@2.3.0`, sem dependência no `package.json`. Resultado: `UIAppFonts` no Info.plist, recursos no Xcode, `android/app/src/main/assets/fonts/` e os manifestos `link-assets-manifest.json`.
- Código: `src/core/theme/fonts.ts` (nomes), `theme.ts` (cores, espaçamentos, raios, variantes), `sizes.ts` (dimensões fixas do Figma), `motion.ts` (tokens de movimento) e `components.tsx` (`Box` e `Text`; o `Text` aplica `maxFontSizeMultiplier` = 1,3).
- Cada variante define `fontFamily` com o peso; **não** usar `fontWeight` junto com fonte customizada (no Android isso causa fallback).
- Caixa alta: textos que vêm do JSON (nome do responsável/aluno, disciplina no boletim) são transformados com `toLocaleUpperCase('pt-BR')` no componente, sem alterar o dado.

## 3. Espaçamento

| Token | Valor | Ocorrências principais |
|---|---|---|
| `xxs` | 4 | Entre "Nota" e "Faltas"; entre ícone e rótulo da aba |
| `xs` | 8 | Entre texto e ícone em "FECHAR ✕"; entre horário e disciplina |
| `s` | 10 | Entre marcador e texto da aula |
| `sm` | 12 | Padding horizontal interno dos cards/dropdown do Boletim |
| `m` | 16 | Margens laterais (cabeçalho, Boletim, Mudança), gaps entre cards, padding do dropdown da Agenda |
| `ml` | 20 | Entre disciplinas no boletim |
| `l` | 24 | Margem lateral da Agenda; entre dropdown e lista |
| `xl` | 32 | Título de seção → dropdown (Agenda); última disciplina → próximo trimestre |
| `xxl` | 40 | Sublinhado do CPF → rótulo SENHA; recuo da lista de aulas |
| `xxxl` | 48 | Margem lateral dos inputs do Login |
| `huge` | 64 | Cabeçalho → título de seção; título → cards (Mudança) |

## 4. Raios e dimensões

| Token / constante | Valor | Uso |
|---|---|---|
| `borderRadii.m` | 8 | Dropdowns, painel de opções, cards |
| `borderRadii.round` | 999 | Marcador da lista de aulas (6 × 6) |
| Barra de ações | altura 48 | Topo: logo 100 × 16 + ações |
| Barra de abas | altura 64 + inset inferior | Fundo `surface` |
| Botão de login | altura 60 + inset inferior, largura total | Fixo na base |
| Dropdown fechado | altura 45 | Dia (Agenda) e ano (Boletim) |
| Card de trimestre / aluno | altura 90 | Trimestre: título centralizado verticalmente; aluno: 2 linhas |
| Ícones | 24 (abas, fechar), 14 (setas), 10 (sair) | |
| Inputs do Login | largura total − 2 × 48 | Rótulo acima, valor centralizado, sublinhado de 1 pt |

## 5. Componentes

| Componente | Onde | Estados / variantes | Notas |
|---|---|---|---|
| `Text`, `Box` | Todos | Variantes da §2 | Gerados por Restyle (`createText`, `createBox`) |
| `PrimaryButton` | Login | `disabled` (texto `textDisabled`), `enabled` (texto `background`), `loading` (sem texto nem indicador, como no frame `3:1232`) | Fundo sempre `primary`; ocupa largura total; respeita inset inferior |
| `UnderlineInput` | Login | vazio (linha `inputLine`), preenchido (linha `inputLineFilled`) | Rótulo centralizado acima; valor 32 pt centralizado; `secureTextEntry` na senha |
| `AppActionBar` | Área logada (fixa) | Ações: TROCAR PERFIL + SAIR / só SAIR (D-03) | Barra de 48 pt com logo; não rola nem anima na troca de aba |
| `StudentGreeting` | Agenda, Boletim (rola) | — | "Olá, NOME" + nome do aluno + "turma - RM n - período" |
| `SectionTitle` | Agenda, Boletim | — | Variante `sectionTitle`, centralizado |
| `Dropdown` | Agenda (dia), Boletim (ano) | fechado / aberto (seta invertida) | Painel de opções sobreposto ao conteúdo, 7 pt abaixo, itens a cada 36 pt |
| `ClassItem` | Agenda | — | Marcador 6 pt (borda `timelineDot`) + horário (`caption`) + disciplina (`bodySemiBold`) |
| `NoClassesState` | Agenda | — | Ilustração 328 × 208 + "Sem aulas neste dia" |
| `TermAccordion` | Boletim | recolhido / expandido | Card `surfaceRaised` 90 pt, título `bodyBold primary`, seta à direita; lista dentro de `Collapsible` |
| `Collapsible` | Boletim (trimestre) | aberto / fechando / fechado | Altura animada até a altura medida do conteúdo; montado até o fim do fechamento e oculto de leitores de tela enquanto fecha |
| `SubjectRow` | Boletim | recolhido / expandido | Nome `captionMedium` em caixa alta + seta; expandido mostra "Nota: x,x" e "Faltas: n" |
| `StudentCard` | Mudança de aluno | normal / selecionado (borda 1 pt `primary`) | Nome completo em caixa alta (`bodyMedium`) + linha de turma/RM/período (`body`) |
| `Card` (`variant="raised"`) | Base de `StudentCard` e `TermAccordion` | — | Variante Restyle `cardVariants.raised`: `surfaceRaised`, raio `m`, altura `sizes.cardHeight` |
| `TabBar` | Abas | aba ativa (`primary`) / inativa (`textPrimary`) | Ícone 24 + rótulo `tabLabel`; duas metades iguais |
| `Icon` | Vários | cor via prop | Ver §6 |

## 6. Assets

Arquivos originais exportados do Figma, versionados em `src/assets/` (D-16). SVGs renderizados com `react-native-svg` (D-05).

| Asset | Arquivo | Uso | Observação |
|---|---|---|---|
| Logo FIAP School | `images/logo.png` (250 × 40 px) | Login (306 × 49) e barra de ações (100 × 16) | As duas instâncias do Figma usam o mesmo bitmap; `Image` com `resizeMode="cover"`, como no Figma |
| Ilustração "no-classroom" | `images/no-classroom.png` (328 × 290 px) | Estado sem aulas (328 × 208) | No Figma a imagem tem 139,42 % da altura do frame (208 × 1,3942 ≈ 290), alinhada ao topo e recortada; reproduzir com container 328 × 208 e `overflow: hidden` |
| Seta | `icons/down-arrow.svg` (14 × 14, `#29F4D5`) | Dropdowns, trimestres, disciplinas | As 4 exportações do Figma são o mesmo desenho (diferenças < 0,4 pt); a seta para cima é a mesma rotacionada 180°, como no Figma (`-scale-y-100`) |
| Calendário | `icons/calendar-active.svg`, `icons/calendar-inactive.svg` (24 × 24) | Aba Agenda | Uma exportação por estado |
| Boletim | `icons/check-file-active.svg`, `icons/check-file-inactive.svg` (24 × 24) | Aba Boletim | Uma exportação por estado |
| Fechar | `icons/close.svg` (24 × 24) | Mudança de aluno | — |
| Sair | `icons/logout.svg` (10 × 10) | "SAIR" | — |

**Limitação de resolução:** os bitmaps do próprio Figma estão em @1x. O logo é exibido maior que o arquivo no Login (306 pt para 250 px), e a ilustração não tem versão @2x/@3x. Em telas de alta densidade os dois ficam levemente suavizados. Fidelidade total exige bitmaps maiores ou o logo em vetor, que precisariam vir do designer.

Os sublinhados do Login (1 pt, `#525252`/`#FFFFFF`) são bordas, sem arquivo.

**Carregamento dos SVGs (decidido na T02, sem dependência nova):** `LocalSvg` de `react-native-svg/css`, com o `.svg` tratado como asset pelo Metro (padrão do RN; tipado em `src/types/assets.d.ts`). O componente `Icon` (`src/shared/components/Icon.tsx`) tem uma caixa fixa no tamanho do Figma (24/14/10 pt) e desenha o SVG no tamanho original do arquivo, centralizado e sem esticar. Como o `LocalSvg` carrega de forma assíncrona, a caixa fixa evita deslocamento de layout. Nos testes, o `LocalSvg` é mockado em `jest.setup.ts`.

## 7. Normalizações do Figma (D-12)

Única exceção à diretriz Perfect Pixel: quando o próprio Figma desenha o mesmo elemento com posições diferentes, vale o valor que ele repete na maioria das ocorrências.

| Observado | Normalizado |
|---|---|
| Itens da lista de aulas com recuo 40/43/46 pt | 40 pt para todos |
| "3º TRIMESTRE" no frame `3:549` em x = 32,7 | 28 pt (igual aos demais) |
| Card de aluno: nome em x = 32 e linha de info em x = 29 | Padding 16 pt para ambos |
| Painel de opções da Agenda 2 pt mais estreito que o dropdown | Mesma largura do dropdown |
| Margem lateral: Agenda 24 + padding 16; Boletim 16 + padding 12 | Mantido como no Figma (diferença intencional ou não, o resultado visual é o desenhado) |
| Seta do dropdown de ano 13,96 × 14 | 14 × 14 |
| Barra de abas: centros em x = 98 (Agenda) e 310 (Boletim); ícone da Boletim 1 pt mais baixo | Duas metades iguais (centros 103,5 e 310,5); ícones a 11 pt do topo |

**Modelo vertical:** nos frames, a barra de ações do cabeçalho começa em y = 0, ou seja, o Figma não reserva espaço para a barra de status. Por isso, todas as medidas verticais partem do topo da área segura (`useSafeAreaInsets().top`), inclusive o logo do Login (100 pt).

## 8. Movimento (proposta — o Figma não especifica animações)

Princípios: feedback de toque curto (150 ms); aberturas e transições longas (400–480 ms) com a curva suave do Material, `smoothEasing` = `bezier(0.4, 0, 0.2, 1)`, que acelera e desacelera devagar. Após o teste em aparelho (2026-11-04), a curva *emphasized decelerate* foi descartada nas aberturas: concentrava o movimento no início e soava "seca". Nada bloqueia ações nem atrasa a resposta ao toque. Reanimated respeita "Reduzir movimento" do sistema (`ReduceMotion.System`); com ele ativo, as animações viram troca instantânea e os navegadores usam `animation: 'none'`.

| Tokens | Valor |
|---|---|
| `motion.fast` | 150 ms (feedback e saídas rápidas) |
| `motion.normal` | 220 ms (fechamento do dropdown) |
| `motion.slow` | 320 ms (itens de lista) |
| `motion.open` | 400 ms (dropdown, seta, acordeão, entrada de tela) |
| `motion.transition` | 480 ms (troca de aba e troca de perfil) |
| `motion.sectionStagger` | 80 ms entre blocos de uma tela |
| `motion.stagger` | 30 ms por item (máx. 6 itens) |

Presets em `src/shared/animations.ts`: `openTiming` (`open` + `smoothEasing`), `fadeInSmooth`, `fadeInFast`, `fadeOutFast`, `layoutTransition`, `listItemEntering`, `screenSectionEntering`.

| Interação | Animação | Motivo |
|---|---|---|
| Login → abas / logout → Login | `animation: 'fade'` no native-stack | Troca de contexto sem sugerir hierarquia |
| Mensagem de erro do login | Fade in/out (`fast`) | Feedback perceptível sem deslocar layout (espaço reservado) |
| Botão → loading | Texto some com fade (`fast`); botão fica vazio, como no Figma | Continuidade do estado |
| Abrir/fechar dropdown | Abre com `openTiming` (400 ms): fade, desce 8 pt e cresce de 96% a 100% a partir do topo. Fecha em 220 ms (*emphasized accelerate*) e só então remove o Modal. A seta gira com `openTiming` | Relação visual entre gatilho e painel, sem abertura "seca" |
| Troca de dia na Agenda | Itens entram com fade + 8 pt (`slow`, `smoothEasing`), escalonados | Sinaliza conteúdo novo |
| Estado sem aulas | `fadeInSmooth` | — |
| Abrir/fechar trimestre | `Collapsible`: a altura vai de 0 à altura medida da lista (e volta) com `openTiming`, com fade junto, e empurra os trimestres abaixo. Ao abrir, a rolagem do `TabScreenLayout` desce no mesmo ritmo até mostrar a lista inteira, sem esconder o card. Ao fechar, se a rolagem ficaria além do novo fim, sobe junto. Se a pessoa arrastar, a rolagem automática para | "Desce e foca" ao abrir; o inverso ao fechar |
| Abrir/fechar disciplina | Detalhes com `fadeInSmooth` / `fadeOutFast`; as linhas abaixo deslizam (`layoutTransition`, 400 ms); a lista do trimestre acompanha a nova altura | Mantém o contexto espacial no acordeão |
| Troca de aba | Crossfade de 480 ms com deslize lateral de 16 pt (`smoothEasing`); a barra de ações fixa não anima | Suave, sem o fade linear de 150 ms padrão |
| Primeira abertura da aba | Saudação, título e conteúdo entram com fade + 12 pt (400 ms, `smoothEasing`), 80 ms entre eles | Conteúdo não "surge" de uma vez |
| Abrir/fechar Mudança de aluno | `slide_from_bottom` empilhado (`presentation: 'card'`) com `animationDuration` 480 ms e *ease-in-out* nos dois sentidos (iOS). Gesto de voltar desligado, como no modal anterior | O modal nativo do iOS (`fullScreenModal`) não aceita duração e fechava rápido demais |
| Toque em itens pressionáveis | Opacidade 0,7 durante o press | Feedback de toque |

No Android, o `slide_from_bottom` usa as animações da `react-native-screens` (`config_mediumAnimTime`, 400 ms, simétricas na abertura e no fechamento). Não foram sobrescritas.

## 9. Acessibilidade

- Área de toque mínima de 44 × 44 pt (`hitSlop` em "TROCAR PERFIL", "SAIR", "FECHAR" e linhas de disciplina, que têm 15–17 pt de altura).
- `accessibilityRole`: `button` (botões, dropdown, acordeões), `tab` (abas, com `selected`), `radio` (cards de aluno, com `checked`).
- `accessibilityState.expanded` em dropdowns e acordeões; `disabled`/`busy` no botão de login.
- Mensagem de erro anunciada (`accessibilityLiveRegion="polite"` no Android, `AccessibilityInfo.announceForAccessibility` no iOS).
- Ícones decorativos ocultos de leitores de tela; ícones-ação com `accessibilityLabel`.
- Fonte dinâmica: `allowFontScaling` mantido, com `maxFontSizeMultiplier` = 1,3 aplicado pelo `Text` do tema. Valor a validar em dispositivo.
- `StatusBar` com `barStyle="light-content"` e fundo preto; Android edge-to-edge já ativo, então os insets são tratados por `SafeAreaView`/`useSafeAreaInsets`.
