import type {
  Board,
  Cell,
  CellId,
  LevelBlueprint,
  MedalTier,
  Objective,
  Predicate,
  Seal,
  Simulation,
  Territory,
} from './types.ts';

const TOKEN = /^(#|\*|@-?\d+|-?\d+|\.)(?:x(\d+))?$/;

/** Converte la griglia testuale di un livello in un tabellone tipizzato. */
export function parseBoard(level: LevelBlueprint): Board {
  const rows = level.grid.map((row) => row.trim().split(/\s+/));
  const height = rows.length;
  const width = rows[0]?.length ?? 0;

  if (height === 0 || width === 0) {
    throw new Error(`Livello "${level.id}": griglia vuota.`);
  }

  const sealsAt = new Map<string, Seal>();
  for (const placement of level.seals ?? []) {
    sealsAt.set(`${placement.x},${placement.y}`, {
      predicate: placement.predicate,
      factor: placement.factor,
    });
  }

  const cells: Cell[] = [];
  const blightSources: CellId[] = [];
  let hasCity = false;

  rows.forEach((row, y) => {
    if (row.length !== width) {
      throw new Error(
        `Livello "${level.id}": la riga ${y} ha ${row.length} caselle invece di ${width}.`,
      );
    }
    row.forEach((token, x) => {
      const match = TOKEN.exec(token);
      if (!match) {
        throw new Error(`Livello "${level.id}": token non valido "${token}" in (${x}, ${y}).`);
      }
      const head = match[1] as string;
      const mult = match[2];
      const id = y * width + x;
      const isCity = head.startsWith('@');

      if (head === '*') blightSources.push(id);
      if (isCity) hasCity = true;

      const value =
        head === '#' || head === '.' || head === '*'
          ? 0
          : Number.parseInt(isCity ? head.slice(1) : head, 10);

      cells.push({
        id,
        x,
        y,
        kind: head === '#' ? 'rock' : 'field',
        value,
        multiplier: mult === undefined ? 1 : Number.parseInt(mult, 10),
        isCity,
        seal: sealsAt.get(`${x},${y}`) ?? null,
      });
    });
  });

  for (const placement of level.seals ?? []) {
    if (!sealsAt.has(`${placement.x},${placement.y}`)) continue;
    const target = cells[placement.y * width + placement.x];
    if (target === undefined || target.kind === 'rock') {
      throw new Error(
        `Livello "${level.id}": sigillo su casella non valida (${placement.x}, ${placement.y}).`,
      );
    }
  }

  return {
    width,
    height,
    cells,
    blightSources,
    networkScoring: hasCity,
    symmetry: level.symmetry ?? null,
  };
}

/** Immagine speculare di una casella rispetto all'asse centrale del tabellone. */
export function mirrorOf(board: Board, id: CellId): CellId {
  const cell = board.cells[id];
  if (cell === undefined || board.symmetry === null) return id;
  const mx = board.symmetry === 'vertical' ? board.width - 1 - cell.x : cell.x;
  const my = board.symmetry === 'horizontal' ? board.height - 1 - cell.y : cell.y;
  return my * board.width + mx;
}

/** Indici delle quattro caselle ortogonalmente adiacenti, filtrate sui bordi. */
export function neighbours(board: Board, id: CellId): CellId[] {
  const cell = board.cells[id];
  if (cell === undefined) return [];
  const out: CellId[] = [];
  if (cell.x > 0) out.push(id - 1);
  if (cell.x < board.width - 1) out.push(id + 1);
  if (cell.y > 0) out.push(id - board.width);
  if (cell.y < board.height - 1) out.push(id + board.width);
  return out;
}

const isRock = (board: Board, id: CellId): boolean => board.cells[id]?.kind === 'rock';

/**
 * Un passo di avanzata della marea: ogni casella libera adiacente alla macchia
 * viene invasa. Le pedine del giocatore e le rocce la fermano: le pedine sono dighe.
 */
export function spreadBlight(
  board: Board,
  blight: ReadonlySet<CellId>,
  claimed: ReadonlySet<CellId>,
): Set<CellId> {
  const next = new Set(blight);
  for (const id of blight) {
    for (const candidate of neighbours(board, id)) {
      if (next.has(candidate) || claimed.has(candidate) || isRock(board, candidate)) continue;
      next.add(candidate);
    }
  }
  return next;
}

/**
 * Caselle catturate per accerchiamento.
 *
 * Una regione vuota è catturata quando non ha vie d'uscita verso il bordo — rocce
 * e marea bloccano il passaggio — e confina con almeno una pedina del giocatore.
 * Le sacche chiuse dalle sole rocce non regalano punti.
 */
export function computeCaptured(
  board: Board,
  claimed: ReadonlySet<CellId>,
  blight: ReadonlySet<CellId>,
): Set<CellId> {
  const total = board.cells.length;
  const visited = new Uint8Array(total);
  const captured = new Set<CellId>();
  const blocked = (id: CellId): boolean =>
    isRock(board, id) || claimed.has(id) || blight.has(id);

  for (let start = 0; start < total; start += 1) {
    if (visited[start] === 1 || blocked(start)) continue;

    const region: CellId[] = [];
    const stack: CellId[] = [start];
    visited[start] = 1;
    let escapes = false;
    let touchesClaimed = false;

    while (stack.length > 0) {
      const id = stack.pop() as CellId;
      region.push(id);
      const cell = board.cells[id] as Cell;

      if (
        cell.x === 0 ||
        cell.y === 0 ||
        cell.x === board.width - 1 ||
        cell.y === board.height - 1
      ) {
        escapes = true;
      }

      for (const next of neighbours(board, id)) {
        if (claimed.has(next)) {
          touchesClaimed = true;
          continue;
        }
        if (isRock(board, next) || blight.has(next) || visited[next] === 1) continue;
        visited[next] = 1;
        stack.push(next);
      }
    }

    if (!escapes && touchesClaimed) {
      for (const id of region) captured.add(id);
    }
  }

  return captured;
}

function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) {
    if (n % d === 0) return false;
  }
  return true;
}

interface GroupFacts {
  readonly size: number;
  readonly base: number;
  readonly negatives: number;
  readonly capturedCount: number;
}

/** Valuta un predicato logico su un territorio. */
export function evaluatePredicate(predicate: Predicate, facts: GroupFacts): boolean {
  switch (predicate.kind) {
    case 'sizeEven':
      return facts.size % 2 === 0;
    case 'sizeOdd':
      return facts.size % 2 === 1;
    case 'sizeAtLeast':
      return facts.size >= predicate.n;
    case 'sizeAtMost':
      return facts.size <= predicate.n;
    case 'noNegative':
      return facts.negatives === 0;
    case 'hasNegative':
      return facts.negatives > 0;
    case 'basePrime':
      return isPrime(facts.base);
    case 'baseMultipleOf':
      return predicate.n !== 0 && facts.base % predicate.n === 0;
    case 'capturedAtLeast':
      return facts.capturedCount >= predicate.n;
    default: {
      const exhaustive: never = predicate;
      return exhaustive;
    }
  }
}

/** Testo compatto del predicato, usato nella UI. */
export function describePredicate(predicate: Predicate): string {
  switch (predicate.kind) {
    case 'sizeEven':
      return 'numero pari di caselle';
    case 'sizeOdd':
      return 'numero dispari di caselle';
    case 'sizeAtLeast':
      return `almeno ${predicate.n} caselle`;
    case 'sizeAtMost':
      return `al massimo ${predicate.n} caselle`;
    case 'noNegative':
      return 'nessuna casella negativa';
    case 'hasNegative':
      return 'almeno una casella negativa';
    case 'basePrime':
      return 'somma base numero primo';
    case 'baseMultipleOf':
      return `somma base multipla di ${predicate.n}`;
    case 'capturedAtLeast':
      return `almeno ${predicate.n} caselle catturate`;
    default: {
      const exhaustive: never = predicate;
      return exhaustive;
    }
  }
}

/** Simbolo breve del predicato per il badge sulla casella. */
export function predicateBadge(predicate: Predicate): string {
  switch (predicate.kind) {
    case 'sizeEven':
      return '2n';
    case 'sizeOdd':
      return '2n+1';
    case 'sizeAtLeast':
      return `≥${predicate.n}`;
    case 'sizeAtMost':
      return `≤${predicate.n}`;
    case 'noNegative':
      return '¬−';
    case 'hasNegative':
      return '∃−';
    case 'basePrime':
      return 'P';
    case 'baseMultipleOf':
      return `|${predicate.n}`;
    case 'capturedAtLeast':
      return `⊂${predicate.n}`;
    default: {
      const exhaustive: never = predicate;
      return exhaustive;
    }
  }
}

/** Raggruppa le caselle possedute in territori connessi e ne calcola il punteggio. */
export function computeTerritories(
  board: Board,
  owned: ReadonlySet<CellId>,
  captured: ReadonlySet<CellId>,
): Territory[] {
  const visited = new Set<CellId>();
  const territories: Territory[] = [];

  for (const start of owned) {
    if (visited.has(start)) continue;

    const group: CellId[] = [];
    const stack: CellId[] = [start];
    visited.add(start);

    while (stack.length > 0) {
      const id = stack.pop() as CellId;
      group.push(id);
      for (const next of neighbours(board, id)) {
        if (!owned.has(next) || visited.has(next)) continue;
        visited.add(next);
        stack.push(next);
      }
    }

    let base = 0;
    let multiplier = 1;
    let negatives = 0;
    let cities = 0;
    let capturedCount = 0;
    const seals: { cellId: CellId; seal: Seal }[] = [];

    for (const id of group) {
      const cell = board.cells[id] as Cell;
      base += cell.value;
      multiplier *= cell.multiplier;
      if (cell.value < 0) negatives += 1;
      if (cell.isCity) cities += 1;
      if (captured.has(id)) capturedCount += 1;
      if (cell.seal !== null) seals.push({ cellId: id, seal: cell.seal });
    }

    const facts: GroupFacts = { size: group.length, base, negatives, capturedCount };
    let sealFactor = 1;
    const sealStates = seals.map(({ cellId, seal }) => {
      const satisfied = evaluatePredicate(seal.predicate, facts);
      if (satisfied) sealFactor *= seal.factor;
      return { cellId, satisfied };
    });

    const networkFactor = board.networkScoring ? cities : 1;

    group.sort((a, b) => a - b);
    territories.push({
      cells: group,
      base,
      multiplier,
      sealFactor,
      networkFactor,
      sealStates,
      score: base * multiplier * sealFactor * networkFactor,
    });
  }

  territories.sort((a, b) => b.score - a.score);
  return territories;
}

/**
 * Replay completo di una partita a partire dalla sequenza di mosse.
 *
 * L'ordine conta: in modalità assedio la marea avanza di un passo dopo ogni
 * pedina posata. Ricalcolare tutto dallo stato iniziale rende l'annullamento
 * banale e lo stato di gioco minimale (la sola lista ordinata delle mosse).
 */
export function simulate(board: Board, moves: readonly CellId[]): Simulation {
  const claimed = new Set<CellId>();
  let blight: Set<CellId> = new Set(board.blightSources);

  for (const id of moves) {
    claimed.add(id);
    if (board.blightSources.length > 0) {
      blight = spreadBlight(board, blight, claimed);
    }
  }

  const captured = computeCaptured(board, claimed, blight);
  const owned = new Set<CellId>(claimed);
  for (const id of captured) owned.add(id);

  // Modalità simmetria: solo le caselle la cui immagine speculare è anch'essa
  // posseduta partecipano al punteggio; le altre restano possedute ma inerti.
  const inactive = new Set<CellId>();
  let active: Set<CellId> = owned;
  if (board.symmetry !== null) {
    active = new Set<CellId>();
    for (const id of owned) {
      if (owned.has(mirrorOf(board, id))) active.add(id);
      else inactive.add(id);
    }
  }

  const territories = computeTerritories(board, active, captured);
  const score = territories.reduce((sum, territory) => sum + territory.score, 0);

  return { claimed, blight, captured, inactive, territories, score };
}

/** Caselle che la marea invaderebbe al passo successivo. */
export function previewSpread(
  board: Board,
  blight: ReadonlySet<CellId>,
  claimed: ReadonlySet<CellId>,
): Set<CellId> {
  if (board.blightSources.length === 0) return new Set();
  const next = spreadBlight(board, blight, claimed);
  for (const id of blight) next.delete(id);
  return next;
}

/** Una pedina può essere posata solo su un campo libero e non invaso. */
export function canPlace(
  board: Board,
  claimed: ReadonlySet<CellId>,
  blight: ReadonlySet<CellId>,
  id: CellId,
): boolean {
  const cell = board.cells[id];
  return (
    cell !== undefined && cell.kind === 'field' && !claimed.has(id) && !blight.has(id)
  );
}

export function medalFor(score: number, stonesUsed: number, objective: Objective): MedalTier {
  if (objective.kind === 'exact') {
    const distance = Math.abs(score - objective.target);
    if (distance === 0) return stonesUsed <= objective.par ? 'gold' : 'silver';
    return distance <= 3 ? 'bronze' : 'none';
  }
  const { medals } = objective;
  if (score >= medals.gold) return 'gold';
  if (score >= medals.silver) return 'silver';
  if (score >= medals.bronze) return 'bronze';
  return 'none';
}

const TIER_RANK: Readonly<Record<MedalTier, number>> = {
  none: 0,
  bronze: 1,
  silver: 2,
  gold: 3,
};

export function bestTier(a: MedalTier, b: MedalTier): MedalTier {
  return TIER_RANK[a] >= TIER_RANK[b] ? a : b;
}

export function tierRank(tier: MedalTier): number {
  return TIER_RANK[tier];
}
