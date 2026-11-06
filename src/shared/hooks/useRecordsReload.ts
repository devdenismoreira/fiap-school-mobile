import { useState } from 'react';

import { useSession } from '@/app/providers/SessionProvider';
import { useToast } from '@/app/providers/ToastProvider';

export function useRecordsReload() {
  const { reloadRecords } = useSession();
  const { showToast } = useToast();
  const [isReloading, setReloading] = useState(false);

  const reload = async () => {
    setReloading(true);
    try {
      await reloadRecords();
    } catch {
      showToast('Verifique sua internet e tente novamente.', {
        title: 'Não foi possível atualizar',
        variant: 'error',
      });
    } finally {
      setReloading(false);
    }
  };

  return { isReloading, reload };
}
