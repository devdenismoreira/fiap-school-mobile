import { useEffect, useRef } from 'react';

import { useSession } from '@/app/providers/SessionProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { useConnectivity } from '@/core/network/useConnectivity';
import { motion } from '@/core/theme';

export const CONNECTIVITY_TOAST_ID = 'connectivity';
export const OFFLINE_MESSAGE = 'Sem conexão com a internet.';
export const ONLINE_MESSAGE = 'Conexão restabelecida.';

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
        duration: motion.toastDurationLong,
      });
      return;
    }
    showToast(ONLINE_MESSAGE, { id: CONNECTIVITY_TOAST_ID });
    if (unreachable) {
      retryRestore();
    }
  }, [online, unreachable, retryRestore, showToast]);

  return null;
}
