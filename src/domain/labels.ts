import type { MedalTier } from './types.ts';

/** Etichette in italiano dei livelli di medaglia, condivise fra i componenti. */
export const MEDAL_LABEL: Readonly<Record<MedalTier, string>> = {
  none: 'Nessuna medaglia',
  bronze: 'Bronzo',
  silver: 'Argento',
  gold: 'Oro',
};
