// Dimensões fixas de componentes medidas no Figma (frame base 414 × 736 pt).
// Modelo adotado: o topo do frame do Figma corresponde ao topo da área segura
// (a barra de ações do cabeçalho começa em y = 0 nos frames).
export const sizes = {
  actionBarHeight: 48,
  tabBarHeight: 64,
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
} as const;
