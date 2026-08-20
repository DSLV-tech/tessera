/** Verifiche puntuali sulle regole, per tutte e sei le modalità. */
import { LEVEL_BY_ID } from '../src/domain/levels/index.ts';
import { simulate, parseBoard } from '../src/domain/engine.ts';
import type { CellId, LevelDefinition } from '../src/domain/types.ts';

let failed = 0;

function check(label: string, actual: number, expected: number): void {
  const ok = actual === expected;
  if (!ok) failed += 1;
  console.log(`${ok ? 'OK ' : 'KO '} ${label}: atteso ${expected}, ottenuto ${actual}`);
}

function level(id: string): LevelDefinition {
  const found = LEVEL_BY_ID.get(id);
  if (found === undefined) throw new Error(`Livello ${id} inesistente`);
  return found;
}

function scoreOfSeq(id: string, moves: readonly (readonly [number, number])[]): number {
  const def = level(id);
  const board = parseBoard(def);
  if (moves.length > def.stones) throw new Error(`${id}: ${moves.length} mosse > ${def.stones} pedine`);
  const seq = moves.map(([x, y]) => y * board.width + x) as CellId[];
  return simulate(board, seq).score;
}

// ── DOMINIO ─────────────────────────────────────────────────────────
check('D01 anello di 4 pedine cattura il 5', scoreOfSeq('d01', [[2, 1], [1, 2], [3, 2], [2, 3]]), 13);
check('D01 soluzione oro', scoreOfSeq('d01', [[2, 1], [1, 2], [3, 2], [2, 3], [1, 1], [3, 1], [1, 3], [3, 3]]), 17);
check('D02 un varco, una pedina', scoreOfSeq('d02', [[3, 5]]), 36);
check('D03 nessuna pedina, nessun punto', scoreOfSeq('d03', []), 0);
check('D03 sfondamento su casella nulla', scoreOfSeq('d03', [[4, 2]]), 18);
check('D04 il tesoro isolato vale 8', scoreOfSeq('d04', [[3, 3]]), 8);
check('D07 senza ponte niente moltiplicatore', scoreOfSeq('d07', [[1, 1], [2, 1], [3, 1]]), 15);
check('D07 con il ponte fino al x3', scoreOfSeq('d07', [[1, 1], [2, 1], [3, 1], [4, 1], [3, 2], [3, 3]]), 75);
check('D09 la trappola x5 su base negativa', scoreOfSeq('d09', [[2, 1], [1, 2], [3, 2], [2, 3]]), -160);
check('D11 sigillo a tre pedine', scoreOfSeq('d11', [[4, 7], [5, 7], [6, 7]]), 144);

// ── ASSEDIO ─────────────────────────────────────────────────────────
// La marea avanza di un passo per ogni pedina posata: l'ordine conta, e a
// volte la mossa migliore è lasciare che sia lei a sigillare un varco largo.
check('A01 sequenza oro nota (sigillo tardivo ma in tempo)', scoreOfSeq('a01', [[2, 5], [1, 4], [1, 2], [3, 2]]), 40);
check('A01 sigillare il varco al primo colpo perde il resto della stanza', scoreOfSeq('a01', [[3, 2]]), 36);
check(
  'A03 lasciar sigillare il varco largo tre alla marea batte il sigillo manuale',
  scoreOfSeq('a03', [[8, 4], [0, 4], [3, 2]]) > scoreOfSeq('a03', [[2, 3], [3, 3], [4, 3]]) ? 1 : 0,
  1,
);

// ── BERSAGLIO ───────────────────────────────────────────────────────
check('B01 due caselle sommano al bersaglio esatto', scoreOfSeq('b01', [[3, 3], [3, 2]]), 15);
check('B02 il fattore ×2 raggiunge 20 con tre pedine', scoreOfSeq('b02', [[2, 1], [2, 2], [2, 3]]), 20);

// ── SIGILLI ─────────────────────────────────────────────────────────
check('S01 quattro caselle connesse al sigillo (pari): si attiva ×3', scoreOfSeq('s01', [[2, 1], [3, 1], [4, 1], [3, 2]]), 54);
check('S01 tre caselle connesse al sigillo (dispari): resta muto', scoreOfSeq('s01', [[3, 1], [4, 1], [3, 2]]), 12);
check('S02 gruppo puro connesso al sigillo attiva ×4', scoreOfSeq('s02', [[2, 1], [3, 1], [4, 1], [3, 2]]), 60);
check('S02 un solo negativo nel gruppo spegne il sigillo', scoreOfSeq('s02', [[1, 2], [1, 1], [2, 1], [3, 1], [3, 2]]), 12);

// ── PONTI ───────────────────────────────────────────────────────────
check('P01 due città isolate: nessun fattore di rete', scoreOfSeq('p01', [[1, 1], [5, 1]]), 12);
check('P01 due città connesse: fattore ×2 su tutta la somma', scoreOfSeq('p01', [[1, 1], [2, 1], [3, 1], [4, 1], [5, 1]]), 24);

// ── SIMMETRIA ───────────────────────────────────────────────────────
// Conta solo ciò che ha il proprio riflesso: una casella spaiata resta tua ma
// non vale nulla, e chi sta sull'asse è riflesso di sé stesso.
check('Y01 un 5 spaiato non vale nulla', scoreOfSeq('y01', [[1, 1]]), 0);
check('Y01 la coppia speculare incassa entrambi', scoreOfSeq('y01', [[1, 1], [5, 1]]), 10);
check('Y01 la casella sull\u2019asse conta da sola', scoreOfSeq('y01', [[3, 1]]), 4);
check('Y02 tre caselle sull\u2019asse, nessun riflesso da pagare', scoreOfSeq('y02', [[3, 1], [3, 2], [3, 3]]), 27);
check('Y03 il 9 costa il suo riflesso negativo', scoreOfSeq('y03', [[1, 1], [5, 1]]), 1);
check('Y03 il 6 si specchia in una casella vuota', scoreOfSeq('y03', [[1, 3], [5, 3]]), 6);
check('Y06 asse orizzontale: la coppia sopra-sotto conta', scoreOfSeq('y06', [[1, 1], [1, 5]]), 12);
check('Y06 asse orizzontale: lo spaiato resta muto', scoreOfSeq('y06', [[3, 1]]), 0);

console.log(failed === 0 ? '\nTutte le regole si comportano come previsto.' : `\n${failed} verifiche fallite.`);
process.exit(failed === 0 ? 0 : 1);
