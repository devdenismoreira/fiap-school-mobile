import * as Keychain from 'react-native-keychain';

import {
  createTokenStore,
  REFRESH_TOKEN_SERVICE,
  type SecureKeychain,
} from './tokenStore';

function makeKeychain(stored: string | null = null) {
  let password = stored;
  return {
    setGenericPassword: jest.fn(
      async (_username: string, value: string, _options?: unknown) => {
        password = value;
        return { service: REFRESH_TOKEN_SERVICE, storage: 'keychain' };
      },
    ),
    getGenericPassword: jest.fn(async () =>
      password === null
        ? (false as const)
        : {
            username: 'refresh-token',
            password,
            service: REFRESH_TOKEN_SERVICE,
            storage: 'keychain',
          },
    ),
    resetGenericPassword: jest.fn(async () => {
      password = null;
      return true;
    }),
  };
}

const asKeychain = (keychain: ReturnType<typeof makeKeychain>) =>
  keychain as unknown as SecureKeychain;

describe('createTokenStore', () => {
  it('guarda o refresh no Keychain com WHEN_UNLOCKED_THIS_DEVICE_ONLY e o access só em memória', async () => {
    const keychain = makeKeychain();
    const store = createTokenStore(asKeychain(keychain));

    await store.save({ accessToken: 'access-1', refreshToken: 'refresh-1' });

    expect(keychain.setGenericPassword).toHaveBeenCalledTimes(1);
    const [, value, options] = keychain.setGenericPassword.mock.calls[0];
    expect(value).toBe('refresh-1');
    expect(options).toEqual({
      service: REFRESH_TOKEN_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    expect(
      JSON.stringify(keychain.setGenericPassword.mock.calls),
    ).not.toContain('access-1');
    expect(store.getAccessToken()).toBe('access-1');
    await expect(store.getRefreshToken()).resolves.toBe('refresh-1');
  });

  it('ao abrir o app, lê o refresh do Keychain e não tem access em memória', async () => {
    const store = createTokenStore(asKeychain(makeKeychain('refresh-salvo')));

    expect(store.getAccessToken()).toBeNull();
    await expect(store.getRefreshToken()).resolves.toBe('refresh-salvo');
  });

  it('sem nada guardado, devolve null', async () => {
    const store = createTokenStore(asKeychain(makeKeychain()));

    await expect(store.getRefreshToken()).resolves.toBeNull();
  });

  it('clear apaga a memória e o Keychain', async () => {
    const keychain = makeKeychain();
    const store = createTokenStore(asKeychain(keychain));
    await store.save({ accessToken: 'a', refreshToken: 'r' });

    await store.clear();

    expect(keychain.resetGenericPassword).toHaveBeenCalledWith({
      service: REFRESH_TOKEN_SERVICE,
    });
    expect(store.getAccessToken()).toBeNull();
    await expect(store.getRefreshToken()).resolves.toBeNull();
  });

  it('falha do Keychain não derruba a sessão em memória', async () => {
    const keychain = makeKeychain();
    keychain.setGenericPassword.mockRejectedValue(new Error('keychain'));
    const store = createTokenStore(asKeychain(keychain));

    await store.save({ accessToken: 'a', refreshToken: 'r' });

    expect(store.getAccessToken()).toBe('a');
    await expect(store.getRefreshToken()).resolves.toBe('r');
  });
});
