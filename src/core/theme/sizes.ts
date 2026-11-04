// Dimensões fixas de componentes medidas no Figma (frame base 414 × 736 pt).
// Modelo adotado: o topo do frame do Figma corresponde ao topo da área segura
// (a barra de ações do cabeçalho começa em y = 0 nos frames).
export const sizes = {
  actionBarHeight: 48,
  primaryButtonHeight: 60,
  dropdownHeight: 45,
  cardHeight: 90,
  timelineDot: 6,
  borderHairline: 1,
  logoLogin: { width: 306, height: 49 },
  logoHeader: { width: 100, height: 16 },
  /** Distância do topo da área segura até o logo do Login. */
  loginLogoTop: 100,
  /** Campo do Login: rótulo (24) + 25 + valor (39) + 7 + linha (1) = 96 pt. */
  underlineInput: { labelToValue: 25, valueHeight: 39, valueToLine: 7 },
  /** Cabeçalho: barra (48) + 16 + saudação (29) + 36 + nome (20) + 8 + info (20) = 177 pt. */
  appHeader: { greetingToStudent: 36 },
  /** Barra de abas: 64 pt + área segura; ícone 11 pt abaixo do topo, rótulo 4 pt abaixo do ícone. */
  tabBar: { height: 64, iconTop: 11, iconToLabel: 4 },
  /** Mudança de aluno: "FECHAR ✕" a 16 pt do topo; título a 209 pt do topo. */
  studentSelection: { closeTop: 16, closeIcon: 24, titleTop: 209 },
  /** Dropdown: painel de opções 7 pt abaixo do gatilho. */
  dropdown: { panelGap: 7 },
  /** Item de aula: marcador de 6 pt alinhado à linha do horário (5 pt do topo). */
  classItem: { dotOffset: 5 },
  /** Ilustração "sem aulas": caixa 328 × 208 recortando a imagem de 328 × 290 pelo topo. */
  noClassroom: { width: 328, height: 208, imageHeight: 290 },
} as const;
