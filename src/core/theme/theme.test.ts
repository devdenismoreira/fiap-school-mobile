import { fonts } from './fonts';
import { theme } from './theme';

const resolveFile = (require as unknown as { resolve: (id: string) => string })
  .resolve;

describe('theme', () => {
  it('usa as cores medidas no Figma', () => {
    expect(theme.colors).toMatchObject({
      background: '#000000',
      textPrimary: '#FFFFFF',
      primary: '#29F4D5',
      onPrimary: '#000000',
      surface: '#262626',
      surfaceRaised: '#4D4D4D',
      timelineDot: '#CCCCCC',
      inputLine: '#525252',
      inputLineFilled: '#FFFFFF',
      textDisabled: '#777777',
    });
  });

  it('só usa fontes que existem em src/assets/fonts', () => {
    const families = new Set(
      Object.values(theme.textVariants).map(variant => variant.fontFamily),
    );

    for (const family of families) {
      expect(Object.values(fonts)).toContain(family);
      expect(() =>
        resolveFile(`../../assets/fonts/${family}.ttf`),
      ).not.toThrow();
    }
  });

  it('só referencia cores definidas no tema', () => {
    for (const variant of Object.values(theme.textVariants)) {
      if ('color' in variant) {
        expect(Object.keys(theme.colors)).toContain(variant.color);
      }
    }
  });

  it('aplica o line-height "normal" do Figma (~1,22 × tamanho da fonte)', () => {
    for (const [name, variant] of Object.entries(theme.textVariants)) {
      const ratio = variant.lineHeight / variant.fontSize;
      expect({ name, ok: ratio >= 1.2 && ratio <= 1.25 }).toEqual({
        name,
        ok: true,
      });
    }
  });
});
