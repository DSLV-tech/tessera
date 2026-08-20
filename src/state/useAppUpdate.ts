import { useCallback, useSyncExternalStore } from 'react';
import { applyUpdate, subscribeUpdate, updateReady } from './appUpdate.ts';

export interface AppUpdateState {
  /** true quando una versione nuova è scaricata e pronta ad attivarsi. */
  readonly ready: boolean;
  readonly apply: () => void;
}

export function useAppUpdate(): AppUpdateState {
  const ready = useSyncExternalStore(subscribeUpdate, updateReady, () => false);
  const apply = useCallback(() => applyUpdate(), []);
  return { ready, apply };
}
