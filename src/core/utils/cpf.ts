export const CPF_LENGTH = 11;

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function normalizeCpf(value: string): string {
  return onlyDigits(value).slice(0, CPF_LENGTH);
}

export function formatCpf(value: string): string {
  const digits = normalizeCpf(value);

  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
    6,
    9,
  )}-${digits.slice(9)}`;
}

function checkDigit(digits: string, length: number): number {
  let sum = 0;
  for (let i = 0; i < length; i += 1) {
    sum += Number(digits[i]) * (length + 1 - i);
  }
  return ((sum * 10) % 11) % 10;
}

export function isValidCpf(value: string): boolean {
  const digits = onlyDigits(value);

  if (digits.length !== CPF_LENGTH || /^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  return (
    checkDigit(digits, 9) === Number(digits[9]) &&
    checkDigit(digits, 10) === Number(digits[10])
  );
}
