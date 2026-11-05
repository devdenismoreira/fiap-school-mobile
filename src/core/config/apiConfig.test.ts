import { ApiConfigError, DEV_API_URLS, resolveApiUrl } from './apiConfig';

describe('resolveApiUrl', () => {
  it('em debug sem API_URL usa o padrão de cada plataforma', () => {
    expect(resolveApiUrl({ apiUrl: undefined, isDev: true, os: 'ios' })).toBe(
      DEV_API_URLS.ios,
    );
    expect(resolveApiUrl({ apiUrl: '  ', isDev: true, os: 'android' })).toBe(
      DEV_API_URLS.android,
    );
  });

  it('usa a API_URL definida, sem barra final', () => {
    expect(
      resolveApiUrl({
        apiUrl: 'https://exemplo.trycloudflare.com/',
        isDev: true,
        os: 'ios',
      }),
    ).toBe('https://exemplo.trycloudflare.com');
  });

  it('em debug aceita http (simulador, emulador ou rede local)', () => {
    expect(
      resolveApiUrl({
        apiUrl: 'http://localhost:3000',
        isDev: true,
        os: 'ios',
      }),
    ).toBe('http://localhost:3000');
  });

  it('em release exige API_URL', () => {
    expect(() =>
      resolveApiUrl({ apiUrl: undefined, isDev: false, os: 'ios' }),
    ).toThrow(ApiConfigError);
  });

  it('em release recusa http', () => {
    expect(() =>
      resolveApiUrl({
        apiUrl: 'http://api.exemplo.com',
        isDev: false,
        os: 'android',
      }),
    ).toThrow('https://');
  });

  it('em release aceita https', () => {
    expect(
      resolveApiUrl({
        apiUrl: 'https://api.exemplo.com',
        isDev: false,
        os: 'android',
      }),
    ).toBe('https://api.exemplo.com');
  });

  it('recusa valores que não são URL http(s)', () => {
    for (const apiUrl of [
      'localhost:3000',
      'ftp://x.com',
      'https://',
      'https://a b.com',
    ]) {
      expect(() => resolveApiUrl({ apiUrl, isDev: true, os: 'ios' })).toThrow(
        ApiConfigError,
      );
    }
  });
});
