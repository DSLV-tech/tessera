import { useCallback, useEffect, useMemo, useState } from 'react';
import { bestTier, tierRank } from '../domain/engine.ts';
import { LEVEL_BY_ID, LEVELS } from '../domain/levels/index.ts';
import type { CampaignProgress, LevelDefinition, MedalTier } from '../domain/types.ts';
import type { LevelRecord, SaveShape } from './storage.ts';
import {
  clearSave,
  loadDaily,
  loadSave,
  persistenceAvailable,
  writeDaily,
  writeSave,
} from './storage.ts';

/** Esito registrato di una partita: medaglia migliore e punteggio record. */
export interface LevelProgress {
  readonly tier: MedalTier;
  readonly best: number;
}

export type CampaignRecords = Readonly<Record<string, LevelProgress>>;

export interface CampaignController {
  readonly progress: CampaignProgress;
  /** Medaglia e record per livello, per mostrare "il tuo miglior punteggio". */
  readonly records: CampaignRecords;
  /** Registra l'esito di una partita: tiene la medaglia e il punteggio migliori. */
  readonly record: (levelId: string, tier: MedalTier, score: number) => void;
  readonly isUnlocked: (level: LevelDefinition) => boolean;
  readonly medalsWon: number;
  readonly completed: number;
  /** Somma dei record personali su tutti i livelli affrontati. */
  readonly totalBest: number;
  /** Esiti del livello del giorno, per data. Vivono a parte dalla campagna. */
  readonly daily: CampaignRecords;
  readonly recordDaily: (key: string, tier: MedalTier, score: number) => void;
  /** true se i progressi verranno ricordati fra le sessioni. */
  readonly persistent: boolean;
  /** Cancella l'avanzamento salvato e riparte da zero. */
  readonly resetProgress: () => void;
}

const VALID_TIERS: ReadonlySet<string> = new Set(['bronze', 'silver', 'gold']);

/** Applica un esito a una mappa di record, tenendo il meglio di entrambi. */
function merge(
  current: CampaignRecords,
  id: string,
  tier: MedalTier,
  score: number,
): CampaignRecords {
  const previous = current[id];
  const previousTier = previous?.tier ?? 'none';
  const previousBest = previous?.best ?? Number.NEGATIVE_INFINITY;
  const nextTier = bestTier(previousTier, tier);
  // Un record vale solo se il livello è stato davvero superato: un punteggio
  // alto ma sotto il bronzo non è un risultato da ricordare.
  const beats = tierRank(tier) > 0 && score > previousBest;
  if (nextTier === previousTier && !beats) return current;
  return {
    ...current,
    [id]: { tier: nextTier, best: beats ? score : (previous?.best ?? 0) },
  };
}

/** Filtra il salvataggio: solo livelli esistenti e medaglie valide. */
function sanitize(raw: Readonly<Record<string, LevelRecord>> | undefined): CampaignRecords {
  if (raw === undefined) return {};
  const clean: Record<string, LevelProgress> = {};
  for (const [id, entry] of Object.entries(raw)) {
    if (LEVEL_BY_ID.has(id) && VALID_TIERS.has(entry.tier)) {
      clean[id] = { tier: entry.tier as MedalTier, best: entry.best };
    }
  }
  return clean;
}

function toSave(records: CampaignRecords): SaveShape {
  const levels: Record<string, LevelRecord> = {};
  for (const [id, entry] of Object.entries(records)) {
    levels[id] = { tier: entry.tier, best: entry.best };
  }
  return { version: 2, levels };
}

/**
 * Avanzamento di campagna con memoria persistente e a prova di sandbox.
 * All'avvio recupera i progressi salvati (se lo storage è disponibile) e li
 * riscrive a ogni cambiamento; dove lo storage è vietato, resta tutto in memoria.
 */
export function useCampaign(): CampaignController {
  const [records, setRecords] = useState<CampaignRecords>(() => sanitize(loadSave()?.levels));
  // Il quotidiano non filtra per LEVEL_BY_ID: le sue chiavi sono date, non id
  // di campagna, e devono sopravvivere anche a un cambio dei livelli.
  const [daily, setDaily] = useState<CampaignRecords>(() => {
    const clean: Record<string, LevelProgress> = {};
    for (const [key, entry] of Object.entries(loadDaily())) {
      if (VALID_TIERS.has(entry.tier)) {
        clean[key] = { tier: entry.tier as MedalTier, best: entry.best };
      }
    }
    return clean;
  });

  useEffect(() => {
    writeSave(toSave(records));
  }, [records]);

  useEffect(() => {
    writeDaily(daily);
  }, [daily]);

  const record = useCallback((levelId: string, tier: MedalTier, score: number): void => {
    setRecords((current) => merge(current, levelId, tier, score));
  }, []);

  const recordDaily = useCallback((key: string, tier: MedalTier, score: number): void => {
    setDaily((current) => merge(current, key, tier, score));
  }, []);

  const resetProgress = useCallback(() => {
    clearSave();
    setRecords({});
    setDaily({});
  }, []);

  const progress = useMemo<CampaignProgress>(() => {
    const flat: Record<string, MedalTier> = {};
    for (const [id, entry] of Object.entries(records)) flat[id] = entry.tier;
    return flat;
  }, [records]);

  const isUnlocked = useCallback(
    (level: LevelDefinition) => {
      if (level.index === 1) return true;
      const previous = LEVELS[level.index - 2];
      if (previous === undefined) return true;
      return tierRank(records[previous.id]?.tier ?? 'none') > 0;
    },
    [records],
  );

  const medalsWon = useMemo(
    () => Object.values(records).reduce((sum, entry) => sum + tierRank(entry.tier), 0),
    [records],
  );

  const completed = useMemo(
    () => Object.values(records).filter((entry) => tierRank(entry.tier) > 0).length,
    [records],
  );

  const totalBest = useMemo(
    () => Object.values(records).reduce((sum, entry) => sum + entry.best, 0),
    [records],
  );

  return {
    progress,
    records,
    record,
    isUnlocked,
    medalsWon,
    completed,
    totalBest,
    daily,
    recordDaily,
    persistent: persistenceAvailable,
    resetProgress,
  };
}
