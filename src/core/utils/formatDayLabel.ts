const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const WEEKDAYS = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
];

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function formatDayLabel(isoDate: string): string {
  const match = ISO_DATE.exec(isoDate);
  if (!match) {
    return isoDate;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  const isRealDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
  if (!isRealDate) {
    return isoDate;
  }

  return `${day} de ${MONTHS[month - 1]}, ${WEEKDAYS[date.getUTCDay()]}`;
}
