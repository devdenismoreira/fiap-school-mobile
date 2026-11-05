import * as Keychain from 'react-native-keychain';

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
};

export interface TokenStore {
  getAccessToken(): string | null;
  getRefreshToken(): Promise<string | null>;
  save(tokens: SessionTokens): Promise<void>;
  clear(): Promise<void>;
}

export type SecureKeychain = Pick<
  typeof Keychain,
  'setGenericPassword' | 'getGenericPassword' | 'resetGenericPassword'
>;

export const REFRESH_TOKEN_SERVICE = 'br.com.fiapschool.refresh-token';
const REFRESH_TOKEN_USERNAME = 'refresh-token';

export function createTokenStore(
  keychain: SecureKeychain = Keychain,
): TokenStore {
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  return {
    getAccessToken: () => accessToken,

    async getRefreshToken() {
      if (refreshToken) {
        return refreshToken;
      }
      const credentials = await keychain
        .getGenericPassword({ service: REFRESH_TOKEN_SERVICE })
        .catch(() => false as const);
      refreshToken = credentials ? credentials.password : null;
      return refreshToken;
    },

    async save(tokens) {
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
      await keychain
        .setGenericPassword(REFRESH_TOKEN_USERNAME, tokens.refreshToken, {
          service: REFRESH_TOKEN_SERVICE,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        })
        .catch(() => false);
    },

    async clear() {
      accessToken = null;
      refreshToken = null;
      await keychain
        .resetGenericPassword({ service: REFRESH_TOKEN_SERVICE })
        .catch(() => false);
    },
  };
}
