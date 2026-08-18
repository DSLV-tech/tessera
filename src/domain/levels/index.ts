import type { LevelBlueprint, LevelDefinition, LevelMode } from '../types.ts';
import { DOMINIO_LEVELS } from './dominio.ts';
import { ASSEDIO_LEVELS } from './assedio.ts';
import { BERSAGLIO_LEVELS } from './bersaglio.ts';
import { SIGILLI_LEVELS } from './sigilli.ts';
import { PONTI_LEVELS } from './ponti.ts';
import { SIMMETRIA_LEVELS } from './simmetria.ts';

const ALL: readonly LevelBlueprint[] = [
  ...DOMINIO_LEVELS,
  ...ASSEDIO_LEVELS,
  ...BERSAGLIO_LEVELS,
  ...SIGILLI_LEVELS,
  ...PONTI_LEVELS,
  ...SIMMETRIA_LEVELS,
];

const BY_ID = new Map(ALL.map((level) => [level.id, level]));

/**
 * Ordine della campagna: le sei modalità sono interfogliate in modo che
 * ognuna venga introdotta presto e ripresa più volte, con difficoltà crescente
 * dentro ciascuna famiglia. `d12` resta il penultimo, `p06` chiude.
 */
const ORDER: readonly string[] = [
  'd01', 'd02', 'a01', 'd03', 'y01', 'a02',
  'b01', 'd04', 'a03', 'y02', 'b02', 'd05',
  's01', 'a04', 'y03', 'd06', 'b03', 's02',
  'p01', 'y04', 'd07', 'a05', 's03', 'p02',
  'y05', 'd08', 'b04', 's04', 'p03', 'y06',
  'd09', 'a06', 'b05', 's05', 'p04', 'd10',
  'b06', 's06', 'p05', 'd11', 'd12', 'p06',
];

export const LEVELS: readonly LevelDefinition[] = ORDER.map((id, position) => {
  const blueprint = BY_ID.get(id);
  if (blueprint === undefined) {
    throw new Error(`Campagna: livello "${id}" inesistente.`);
  }
  return { ...blueprint, index: position + 1 };
});

if (ORDER.length !== ALL.length) {
  throw new Error(
    `Campagna: ${ORDER.length} posizioni per ${ALL.length} livelli — l'ordine è incompleto.`,
  );
}

export const LEVEL_BY_ID: ReadonlyMap<string, LevelDefinition> = new Map(
  LEVELS.map((level) => [level.id, level]),
);

export const MODE_LABEL: Readonly<Record<LevelMode, string>> = {
  dominio: 'Dominio',
  assedio: 'Assedio',
  bersaglio: 'Bersaglio',
  sigilli: 'Sigilli',
  ponti: 'Ponti',
  simmetria: 'Simmetria',
};

export const MODE_TAGLINE: Readonly<Record<LevelMode, string>> = {
  dominio: 'Conquista e accerchia: massimizza il punteggio.',
  assedio: 'La marea avanza a ogni pedina. Le tue pedine sono dighe.',
  bersaglio: 'Colpisci il punteggio esatto. Superarlo è mancarlo.',
  sigilli: 'Predicati logici: il fattore si attiva solo se la condizione è vera.',
  ponti: 'Solo le città valgono, e una rete vale per quante ne collega.',
  simmetria: 'Contano solo le caselle la cui immagine speculare è anch’essa tua.',
};

export {
  DOMINIO_LEVELS,
  ASSEDIO_LEVELS,
  BERSAGLIO_LEVELS,
  SIGILLI_LEVELS,
  PONTI_LEVELS,
  SIMMETRIA_LEVELS,
};
