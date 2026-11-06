import { useEffect, useRef } from 'react';

import { useSession } from '@/app/providers/SessionProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { useConnectivity } from '@/core/network/useConnectivity';
import { motion } from '@/core/theme';

export const CONNECTIVITY_TOAST_ID = 'connectivity';
export const OFFLINE_TITLE = 'Sem conexão';
export const OFFLINE_MESSAGE = 'Verifique sua internet.';
export const ONLINE_TITLE = 'Conexão restabelecida';
export const ONLINE_MESSAGE = 'Você está online novamente.';

export function ConnectivityFeedback() {
  const online = useConnectivity();
  const previous = useRef<boolean | null>(null);
  const { showToast } = useToast();
  const { state, retryRestore } = useSession();
  const unreachable = state.status === 'unreachable';

  useEffect(() => {
    const before = previous.current;
    previous.current = online;
    if (online === null || before === null || before === online) {
      return;
    }
    if (!online) {
      showToast(OFFLINE_MESSAGE, {
        id: CONNECTIVITY_TOAST_ID,
        title: OFFLINE_TITLE,
        variant: 'error',
        duration: motion.toastDurationLong,
      });
      return;
    }
    showToast(ONLINE_MESSAGE, {
      id: CONNECTIVITY_TOAST_ID,
      title: ONLINE_TITLE,
      variant: 'success',
    });
    if (unreachable) {
      retryRestore();
    }
  }, [online, unreachable, retryRestore, showToast]);

  return null;
}
