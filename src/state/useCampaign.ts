import { useCallback, useEffect, useMemo, useState } from 'react';
import { bestTier, tierRank } from '../domain/engine.ts';
import { LEVEL_BY_ID, LEVELS } from '../domain/levels/index.ts';
import type { CampaignProgress, LevelDefinition, MedalTier } from '../domain/types.ts';
import { clearSave, loadSave, persistenceAvailable, writeSave } from './storage.ts';

export interface CampaignController {
  readonly progress: CampaignProgress;
  readonly record: (levelId: string, tier: MedalTier) => void;
  readonly isUnlocked: (level: LevelDefinition) => boolean;
  readonly medalsWon: number;
  readonly completed: number;
  /** true se i progressi verranno ricordati fra le sessioni. */
  readonly persistent: boolean;
  /** Cancella l'avanzamento salvato e riparte da zero. */
  readonly resetProgress: () => void;
}

const VALID_TIERS: ReadonlySet<string> = new Set(['bronze', 'silver', 'gold']);

/** Filtra il salvataggio: solo livelli esistenti e medaglie valide. */
function sanitize(raw: Record<string, string> | undefined): CampaignProgress {
  if (raw === undefined) return {};
  const clean: Record<string, MedalTier> = {};
  for (const [id, tier] of Object.entries(raw)) {
    if (LEVEL_BY_ID.has(id) && VALID_TIERS.has(tier)) {
      clean[id] = tier as MedalTier;
    }
  }
  return clean;
}

/**
 * Avanzamento di campagna con memoria persistente e a prova di sandbox.
 * All'avvio recupera i progressi salvati (se lo storage è disponibile) e li
 * riscrive a ogni cambiamento; dove lo storage è vietato, resta tutto in memoria.
 */
export function useCampaign(): CampaignController {
  const [progress, setProgress] = useState<CampaignProgress>(
    () => sanitize(loadSave()?.progress),
  );

  useEffect(() => {
    writeSave({ progress });
  }, [progress]);

  const record = useCallback((levelId: string, tier: MedalTier) => {
    setProgress((current) => {
      const previous = current[levelId] ?? 'none';
      const next = bestTier(previous, tier);
      return next === previous ? current : { ...current, [levelId]: next };
    });
  }, []);

  const resetProgress = useCallback(() => {
    clearSave();
    setProgress({});
  }, []);

  const isUnlocked = useCallback(
    (level: LevelDefinition) => {
      if (level.index === 1) return true;
      const previous = LEVELS[level.index - 2];
      if (previous === undefined) return true;
      return tierRank(progress[previous.id] ?? 'none') > 0;
    },
    [progress],
  );

  const medalsWon = useMemo(
    () => Object.values(progress).reduce((sum, tier) => sum + tierRank(tier), 0),
    [progress],
  );

  const completed = useMemo(
    () => Object.values(progress).filter((tier) => tierRank(tier) > 0).length,
    [progress],
  );

  return {
    progress,
    record,
    isUnlocked,
    medalsWon,
    completed,
    persistent: persistenceAvailable,
    resetProgress,
  };
}
