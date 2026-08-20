import { useCallback, useSyncExternalStore } from 'react';
import { canInstall, promptInstall, subscribeInstall } from './install.ts';

export interface InstallController {
  readonly available: boolean;
  readonly install: () => void;
}

/** Espone lo stato di installabilità PWA e l'azione di installazione. */
export function useInstall(): InstallController {
  const available = useSyncExternalStore(subscribeInstall, canInstall, () => false);
  const install = useCallback(() => {
    void promptInstall();
  }, []);
  return { available, install };
}
