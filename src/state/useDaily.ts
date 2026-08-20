import { useEffect, useState } from 'react';
import { buildDailyLevel } from '../domain/daily.ts';
import type { LevelDefinition } from '../domain/types.ts';
// `inline` incorpora il worker nel bundle: indispensabile perché la build
// a file singolo resti davvero autosufficiente e utilizzabile offline.
import DailyWorker from './dailyWorker.ts?worker&inline';

export type DailyStatus = 'loading' | 'ready' | 'error';

export interface DailyState {
  readonly status: DailyStatus;
  readonly level: LevelDefinition | null;
}

interface WorkerReply {
  readonly ok: boolean;
  readonly level?: LevelDefinition;
}

/**
 * Costruisce il livello del giorno fuori dal thread principale. Se i worker
 * non sono disponibili si ripiega sul calcolo sincrono: più lento, ma il
 * giocatore ottiene comunque il suo tabellone.
 */
export function useDaily(today: number): DailyState {
  const [state, setState] = useState<DailyState>({ status: 'loading', level: null });

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading', level: null });

    let worker: Worker | null = null;
    try {
      worker = new DailyWorker();
    } catch {
      worker = null;
    }

    if (worker === null) {
      try {
        setState({ status: 'ready', level: buildDailyLevel(new Date(today)) });
      } catch {
        setState({ status: 'error', level: null });
      }
      return;
    }

    const activeWorker = worker;
    activeWorker.addEventListener('message', (event: MessageEvent<WorkerReply>) => {
      if (!alive) return;
      const reply = event.data;
      setState(
        reply.ok && reply.level !== undefined
          ? { status: 'ready', level: reply.level }
          : { status: 'error', level: null },
      );
    });
    activeWorker.addEventListener('error', () => {
      if (alive) setState({ status: 'error', level: null });
    });
    activeWorker.postMessage(today);

    return () => {
      alive = false;
      activeWorker.terminate();
    };
  }, [today]);

  return state;
}
