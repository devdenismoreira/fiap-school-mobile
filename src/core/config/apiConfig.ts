import { Platform } from 'react-native';

export const DEV_API_URLS = {
  ios: 'http://localhost:3000',
  android: 'http://10.0.2.2:3000',
} as const;

export class ApiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiConfigError';
    Object.setPrototypeOf(this, ApiConfigError.prototype);
  }
}

type ApiUrlInput = {
  apiUrl: string | undefined;
  isDev: boolean;
  os: string;
};

const HTTP_URL = /^https?:\/\/[^\s/]+(\/[^\s]*)?$/;

export function resolveApiUrl({ apiUrl, isDev, os }: ApiUrlInput): string {
  const configured = apiUrl?.trim();

  if (!configured) {
    if (!isDev) {
      throw new ApiConfigError(
        'Defina API_URL (https://) ao gerar o bundle de release.',
      );
    }
    return os === 'android' ? DEV_API_URLS.android : DEV_API_URLS.ios;
  }

  if (!HTTP_URL.test(configured)) {
    throw new ApiConfigError('API_URL precisa ser uma URL http(s) válida.');
  }
  if (!isDev && !configured.startsWith('https://')) {
    throw new ApiConfigError('Em release, API_URL precisa usar https://.');
  }
  return configured.replace(/\/+$/, '');
}

export function getApiUrl(): string {
  return resolveApiUrl({
    apiUrl: process.env.API_URL,
    isDev: __DEV__,
    os: Platform.OS,
  });
}
