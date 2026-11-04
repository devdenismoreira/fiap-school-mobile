// Nomes PostScript da Montserrat, iguais aos nomes dos arquivos em src/assets/fonts.
// Assim o mesmo fontFamily funciona no iOS e no Android. Não usar fontWeight junto
// com fonte customizada: no Android isso faz o sistema trocar a fonte.
export const fonts = {
  regular: 'Montserrat-Regular',
  medium: 'Montserrat-Medium',
  semiBold: 'Montserrat-SemiBold',
  bold: 'Montserrat-Bold',
} as const;
