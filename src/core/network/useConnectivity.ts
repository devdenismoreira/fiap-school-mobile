import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export const CONNECTIVITY_SETTLE_MS = 1000;

export const isOnline = (
  state: Pick<NetInfoState, 'isConnected' | 'isInternetReachable'>,
) => state.isConnected !== false && state.isInternetReachable !== false;

export function useConnectivity(): boolean | null {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let settled: boolean | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const unsubscribe = NetInfo.addEventListener(state => {
      const next = isOnline(state);
      clearTimeout(timer);
      if (settled === null) {
        settled = next;
        setOnline(next);
        return;
      }
      timer = setTimeout(() => {
        if (next !== settled) {
          settled = next;
          setOnline(next);
        }
      }, CONNECTIVITY_SETTLE_MS);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  return online;
}
