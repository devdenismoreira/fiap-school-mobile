import { formatAbsences, formatGrade, NOT_EVALUATED } from './formatGrade';

describe('formatGrade', () => {
  it('exibe "-" quando a nota é null (não avaliado)', () => {
    expect(formatGrade(null)).toBe(NOT_EVALUATED);
    expect(NOT_EVALUATED).toBe('-');
  });

  it.each([
    [9.5, '9,5'],
    [8, '8,0'],
    [10, '10,0'],
    [0, '0,0'],
    [6.5, '6,5'],
  ])('usa vírgula e uma casa decimal: %p → %p', (grade, expected) => {
    expect(formatGrade(grade)).toBe(expected);
  });
});

describe('formatAbsences', () => {
  it('exibe "-" quando as faltas são null', () => {
    expect(formatAbsences(null)).toBe('-');
  });

  it('exibe o inteiro, inclusive zero', () => {
    expect(formatAbsences(0)).toBe('0');
    expect(formatAbsences(4)).toBe('4');
  });
});
