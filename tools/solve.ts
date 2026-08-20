/**
 * Validazione offline di tutti i livelli della campagna: per ogni livello cerca
 * il massimo raggiungibile e verifica che la soglia d'oro sia davvero ottenibile.
 */
import { LEVELS } from '../src/domain/levels/index.ts';
import { simulate, parseBoard } from '../src/domain/engine.ts';
import { search } from '../src/domain/solver.ts';
import type { CellId, LevelDefinition } from '../src/domain/types.ts';

const playable = (board: ReturnType<typeof parseBoard>): CellId[] =>
  board.cells
    .filter((cell) => cell.kind === 'field' && !board.blightSources.includes(cell.id))
    .map((cell) => cell.id);

/** Enumerazione esaustiva: restituisce i punteggi raggiungibili e le pedine minime. */
export function enumerateScores(
  level: LevelDefinition,
  limit = 3_000_000,
): Map<number, number> | null {
  const board = parseBoard(level);
  const cells = playable(board);
  const reachable = new Map<number, number>();
  let visited = 0;

  const combo: CellId[] = [];
  const recurse = (start: number, depth: number): boolean => {
    const { score } = simulate(board, combo);
    const previous = reachable.get(score);
    if (previous === undefined || previous > combo.length) reachable.set(score, combo.length);
    visited += 1;
    if (visited > limit) return false;
    if (depth === 0) return true;
    for (let i = start; i < cells.length; i += 1) {
      combo.push(cells[i] as CellId);
      const ok = recurse(i + 1, depth - 1);
      combo.pop();
      if (!ok) return false;
    }
    return true;
  };

  return recurse(0, level.stones) ? reachable : null;
}

if (process.argv[1]?.endsWith('solve.ts')) {
  const only = process.argv[2];
  for (const level of LEVELS) {
    if (only !== undefined && !level.id.startsWith(only)) continue;
    const { score, moves } = search(level);
    const objective = level.objective;
    if (objective.kind === 'exact') {
      const exhaustive = enumerateScores(level);
      const minStones = exhaustive?.get(objective.target);
      const hit = score === objective.target;
      console.log(
        `${hit ? 'OK ' : 'KO '} ${level.id} ${level.name.padEnd(24)} bersaglio=${objective.target}` +
          ` raggiunto=${score} pedine=${moves.length}/${level.stones}` +
          ` minime=${minStones ?? (exhaustive === null ? 'n/d' : 'IRRAGGIUNGIBILE')} par=${objective.par}`,
      );
    } else {
      const { medals } = objective;
      const ok = medals.gold <= score;
      console.log(
        `${ok ? 'OK ' : 'KO '} ${level.id} ${level.name.padEnd(24)} max=${String(score).padStart(5)}` +
          ` oro=${String(medals.gold).padStart(5)} pedine=${moves.length}/${level.stones}`,
      );
    }
  }
}
