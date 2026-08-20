/**
 * Ricerca della soluzione migliore, condivisa fra la validazione offline dei
 * livelli e la generazione del livello del giorno (che ne ha bisogno per
 * calcolare soglie di medaglia sensate).
 *
 * - modalità assedio: l'ordine delle mosse conta, quindi la ricerca lavora su
 *   sequenze (sostituzione, scambio, troncamento, estensione).
 * - altre modalità: l'ordine è irrilevante, si cerca su insiemi.
 * - modalità bersaglio: enumerazione esaustiva quando il tabellone è piccolo,
 *   altrimenti ricerca locale che minimizza la distanza dal bersaglio.
 */
import { simulate, parseBoard, mirrorOf } from './engine.ts';
import type { Board, CellId, LevelDefinition } from './types.ts';

/** Riavvii casuali di default: taratura per la validazione offline dei livelli. */
export const DEFAULT_RESTARTS = 400;
const DEFAULT_MAX_ITERATIONS = 45;

export interface SearchOptions {
  /** Quanti riavvii casuali. Abbassalo per una stima rapida (es. in browser). */
  readonly restarts?: number;
  /** Tetto ai passi di salita per riavvio: limita il caso peggiore. */
  readonly maxIterations?: number;
}

function makeRng(seed: number): () => number {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

const playable = (board: Board): CellId[] =>
  board.cells
    .filter((cell) => cell.kind === 'field' && !board.blightSources.includes(cell.id))
    .map((cell) => cell.id);

type Fitness = (moves: readonly CellId[]) => number;

function makeFitness(board: Board, level: LevelDefinition): Fitness {
  if (level.objective.kind === 'exact') {
    const { target } = level.objective;
    return (moves) => {
      const { score } = simulate(board, moves);
      // Massimizzare: distanza nulla è l'ottimo; a parità, meno pedine.
      return -Math.abs(score - target) * 1000 - moves.length;
    };
  }
  return (moves) => simulate(board, moves).score;
}

/** Ricerca locale steepest-ascent su sequenze ordinate. */
function climb(
  board: Board,
  cells: readonly CellId[],
  budget: number,
  fitness: Fitness,
  start: readonly CellId[],
  ordered: boolean,
  maxIterations: number,
): { moves: CellId[]; value: number } {
  let current = [...start];
  let value = fitness(current);

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    let bestMoves: CellId[] | null = null;
    let bestValue = value;
    const used = new Set(current);

    const consider = (candidate: CellId[]): void => {
      const v = fitness(candidate);
      if (v > bestValue) {
        bestValue = v;
        bestMoves = candidate;
      }
    };

    if (current.length < budget) {
      for (const id of cells) {
        if (used.has(id)) continue;
        if (ordered) {
          for (let pos = 0; pos <= current.length; pos += 1) {
            consider([...current.slice(0, pos), id, ...current.slice(pos)]);
          }
        } else {
          consider([...current, id]);
        }
      }
      // Simmetria: aggiungere una casella e il suo riflesso insieme. Senza questa
      // mossa la ricerca si blocca, perché una casella spaiata vale 0 e nessun
      // passo singolo migliora il punteggio (ricompensa differita).
      if (board.symmetry !== null) {
        for (const id of cells) {
          const mirror = mirrorOf(board, id);
          if (used.has(id) || used.has(mirror) || id === mirror) continue;
          if (current.length + 2 > budget) continue;
          consider([...current, id, mirror]);
        }
      }
    }

    for (let i = 0; i < current.length; i += 1) {
      const without = current.filter((_, index) => index !== i);
      consider(without);
      for (const id of cells) {
        if (used.has(id)) continue;
        consider([...without.slice(0, i), id, ...without.slice(i)]);
      }
    }

    if (ordered) {
      for (let i = 0; i < current.length; i += 1) {
        for (let j = i + 1; j < current.length; j += 1) {
          const swapped = [...current];
          swapped[i] = current[j] as CellId;
          swapped[j] = current[i] as CellId;
          consider(swapped);
        }
      }
    }

    if (bestMoves === null) break;
    current = bestMoves;
    value = bestValue;
  }

  return { moves: current, value };
}

/** Costruzione greedy: aggiunge ripetutamente la casella dal miglior guadagno marginale. */
function greedySeed(
  cells: readonly CellId[],
  budget: number,
  fitness: Fitness,
): CellId[] {
  const chosen: CellId[] = [];
  const used = new Set<CellId>();
  for (let step = 0; step < budget; step += 1) {
    let bestId: CellId | null = null;
    let bestValue = fitness(chosen);
    for (const id of cells) {
      if (used.has(id)) continue;
      const v = fitness([...chosen, id]);
      if (v > bestValue) {
        bestValue = v;
        bestId = id;
      }
    }
    if (bestId === null) break;
    chosen.push(bestId);
    used.add(bestId);
  }
  return chosen;
}

export function search(
  level: LevelDefinition,
  options: SearchOptions = {},
): { moves: CellId[]; score: number } {
  const restarts = options.restarts ?? DEFAULT_RESTARTS;
  const maxIterations = options.maxIterations ?? DEFAULT_MAX_ITERATIONS;
  const board = parseBoard(level);
  const cells = playable(board);
  const ordered = level.mode === 'assedio';
  const fitness = makeFitness(board, level);
  const rng = makeRng(level.index * 7919 + 13);

  let best: CellId[] = [];
  let bestValue = fitness([]);

  // Semi deterministici che coprono i massimi locali "a soglia": il greedy e la
  // sua estensione al budget pieno aiutano dove i riavvii casuali si arenano.
  for (const seed of [greedySeed(cells, level.stones, fitness)]) {
    const result = climb(board, cells, level.stones, fitness, seed, ordered, maxIterations);
    if (result.value > bestValue) {
      bestValue = result.value;
      best = result.moves;
    }
  }

  for (let restart = 0; restart < restarts; restart += 1) {
    const size = 1 + Math.floor(rng() * level.stones);
    const pool = [...cells];
    const seed: CellId[] = [];
    for (let i = 0; i < size && pool.length > 0; i += 1) {
      const pick = Math.floor(rng() * pool.length);
      seed.push(pool[pick] as CellId);
      pool.splice(pick, 1);
    }
    const result = climb(board, cells, level.stones, fitness, seed, ordered, maxIterations);
    if (result.value > bestValue) {
      bestValue = result.value;
      best = result.moves;
    }
  }

  return { moves: best, score: simulate(board, best).score };
}

