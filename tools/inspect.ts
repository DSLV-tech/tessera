import { LEVELS } from '../src/domain/levels/index.ts';
import { simulate, parseBoard } from '../src/domain/engine.ts';
import { search } from './solve.ts';

const only = process.argv[2];
for (const level of LEVELS) {
  if (only !== undefined && !level.id.startsWith(only)) continue;
  const board = parseBoard(level);
  const { moves, score } = search(level);
  const sim = simulate(board, moves);
  const order = new Map(moves.map((id, i) => [id, i + 1]));
  console.log(`\n${level.id} — ${level.name} [${level.mode}] → ${score} con ${moves.length}/${level.stones}`);
  for (let y = 0; y < board.height; y += 1) {
    let line = '';
    for (let x = 0; x < board.width; x += 1) {
      const id = y * board.width + x;
      const cell = board.cells[id]!;
      let mark: string;
      if (cell.kind === 'rock') mark = '##';
      else if (sim.claimed.has(id)) mark = String(order.get(id) ?? 0).padStart(2, '0');
      else if (sim.blight.has(id)) mark = '~~';
      else if (sim.captured.has(id)) mark = '::';
      else mark = ' .';
      line += mark + ' ';
    }
    console.log(line);
  }
  console.log(
    sim.territories
      .map(
        (t) =>
          `[${t.cells.length}c base=${t.base} ×${t.multiplier} sig×${t.sealFactor} rete×${t.networkFactor} = ${t.score}]`,
      )
      .join(' '),
  );
}
