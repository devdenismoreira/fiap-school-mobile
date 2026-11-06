import { formatDayLabel } from './formatDayLabel';

declare const process: { env: Record<string, string | undefined> };

describe('formatDayLabel', () => {
  it.each([
    ['2025-03-16', '16 de março, domingo'],
    ['2025-03-17', '17 de março, segunda-feira'],
    ['2025-03-18', '18 de março, terça-feira'],
    ['2025-03-19', '19 de março, quarta-feira'],
    ['2025-03-20', '20 de março, quinta-feira'],
    ['2025-03-21', '21 de março, sexta-feira'],
    ['2025-03-22', '22 de março, sábado'],
  ])('formata os dias da agenda como no Figma: %s → %s', (iso, label) => {
    expect(formatDayLabel(iso)).toBe(label);
  });

  it('não usa zero à esquerda no dia', () => {
    expect(formatDayLabel('2025-03-05')).toBe('5 de março, quarta-feira');
  });

  it('cobre os nomes dos meses', () => {
    expect(formatDayLabel('2025-01-01')).toBe('1 de janeiro, quarta-feira');
    expect(formatDayLabel('2025-12-31')).toBe('31 de dezembro, quarta-feira');
  });

  it.each([
    'UTC',
    'America/Sao_Paulo',
    'Pacific/Kiritimati',
    'Pacific/Pago_Pago',
  ])('não sofre deslocamento de fuso (TZ=%s)', timeZone => {
    const original = process.env.TZ;
    process.env.TZ = timeZone;
    try {
      expect(formatDayLabel('2025-03-16')).toBe('16 de março, domingo');
    } finally {
      process.env.TZ = original;
    }
  });

  it('devolve a entrada sem alteração quando não é uma data ISO válida', () => {
    expect(formatDayLabel('')).toBe('');
    expect(formatDayLabel('16/03/2025')).toBe('16/03/2025');
    expect(formatDayLabel('2025-02-30')).toBe('2025-02-30');
    expect(formatDayLabel('2025-13-01')).toBe('2025-13-01');
  });
});
