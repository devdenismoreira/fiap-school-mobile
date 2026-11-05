import {
  CPF_LENGTH,
  formatCpf,
  isValidCpf,
  normalizeCpf,
  onlyDigits,
} from './cpf';

const VALID_CPF = '52998224725';

describe('onlyDigits', () => {
  it('remove tudo que não é dígito', () => {
    expect(onlyDigits('529.982.247-25')).toBe(VALID_CPF);
    expect(onlyDigits(' 529 982 247 25 ')).toBe(VALID_CPF);
    expect(onlyDigits('abc')).toBe('');
  });
});

describe('normalizeCpf', () => {
  it('produz os mesmos 11 dígitos para entradas com ou sem máscara', () => {
    expect(normalizeCpf('529.982.247-25')).toBe(VALID_CPF);
    expect(normalizeCpf('52998224725')).toBe(VALID_CPF);
    expect(normalizeCpf('529 982 247 25')).toBe(VALID_CPF);
  });

  it(`limita a ${CPF_LENGTH} dígitos`, () => {
    expect(normalizeCpf('5299822472599')).toBe(VALID_CPF);
  });
});

describe('formatCpf', () => {
  it.each([
    ['', ''],
    ['5', '5'],
    ['529', '529'],
    ['5299', '529.9'],
    ['529982', '529.982'],
    ['5299822', '529.982.2'],
    ['529982247', '529.982.247'],
    ['5299822472', '529.982.247-2'],
    ['52998224725', '529.982.247-25'],
  ])('aplica a máscara progressiva: %p → %p', (input, expected) => {
    expect(formatCpf(input)).toBe(expected);
  });

  it('reformata um valor já mascarado e ignora o excedente', () => {
    expect(formatCpf('529.982.247-25')).toBe('529.982.247-25');
    expect(formatCpf('529.982.247-2599')).toBe('529.982.247-25');
  });
});

describe('isValidCpf', () => {
  it('aceita CPF válido com ou sem máscara', () => {
    expect(isValidCpf(VALID_CPF)).toBe(true);
    expect(isValidCpf('529.982.247-25')).toBe(true);
  });

  it('rejeita dígito verificador errado', () => {
    expect(isValidCpf('52998224724')).toBe(false);
    expect(isValidCpf('52998224715')).toBe(false);
  });

  it('rejeita tamanho diferente de 11', () => {
    expect(isValidCpf('5299822472')).toBe(false);
    expect(isValidCpf('529982247250')).toBe(false);
    expect(isValidCpf('')).toBe(false);
  });

  it('rejeita dígitos todos iguais', () => {
    expect(isValidCpf('00000000000')).toBe(false);
    expect(isValidCpf('11111111111')).toBe(false);
  });
});
