import { isAxiosError } from 'axios';

import { NetworkError } from '@/core/errors/NetworkError';

export class ApiError extends Error {
  constructor(readonly status: number, readonly code: string | null) {
    super(`Erro da API (${status})`);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

function readErrorCode(data: unknown): string | null {
  if (typeof data !== 'object' || data === null || !('erro' in data)) {
    return null;
  }
  const { erro } = data as { erro?: { codigo?: unknown } };
  return typeof erro?.codigo === 'string' ? erro.codigo : null;
}

export function normalizeApiError(error: unknown): unknown {
  if (!isAxiosError(error)) {
    return error;
  }
  const { response } = error;
  if (!response || response.status >= 500) {
    return new NetworkError();
  }
  return new ApiError(response.status, readErrorCode(response.data));
}
