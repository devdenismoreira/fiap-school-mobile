import AsyncStorage from '@react-native-async-storage/async-storage';

export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const keyValueStorage: KeyValueStorage = AsyncStorage;
