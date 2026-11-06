import { useEffect } from 'react';
import BootSplash from 'react-native-bootsplash';

import { useSession } from '@/app/providers/SessionProvider';

export function BootSplashGate() {
  const { state } = useSession();
  const ready = state.status !== 'restoring';

  useEffect(() => {
    if (ready) {
      BootSplash.hide({ fade: true });
    }
  }, [ready]);

  return null;
}
