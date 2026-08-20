/**
 * IL LIVELLO DEL GIORNO.
 *
 * Una griglia nuova ogni giorno, identica per tutti: il seme è la data UTC, e
 * la generazione è puramente deterministica. Nessun server, nessuna sincronia —
 * due dispositivi che aprono l'app lo stesso giorno vedono lo stesso tabellone.
 *
 * Le soglie delle medaglie non sono scritte a mano: le calcola il solver del
 * progetto sul tabellone appena generato, così l'oro è sempre un risultato
 * davvero raggiungibile e il bronzo resta alla portata.
 */
import { search } from './solver.ts';
import type { LevelDefinition, LevelMode } from './types.ts';

/** Giorno zero della serie: da qui si contano i numeri di edizione. */
const EPOCH = Date.UTC(2026, 0, 1);
const DAY_MS = 86_400_000;

/**
 * splitmix32: deterministico e senza dipendenze, ma con un vero passo di
 * mescolamento. Serve davvero — con un semplice congruenziale lineare la prima
 * estrazione resta una funzione affine del seme, e giorni consecutivi finivano
 * sistematicamente nella stessa modalità.
 */
function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x9e37_79b9) >>> 0;
    let z = state;
    z = Math.imul(z ^ (z >>> 16), 0x21f0_aaad) >>> 0;
    z = Math.imul(z ^ (z >>> 15), 0x735a_2d97) >>> 0;
    z = (z ^ (z >>> 15)) >>> 0;
    return z / 0x1_0000_0000;
  };
}

/** Data (UTC) → numero progressivo dell'edizione. */
export function dailyNumber(now: Date): number {
  const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.max(1, Math.floor((midnight - EPOCH) / DAY_MS) + 1);
}

/** Chiave stabile per il salvataggio: `daily-2026-08-20`. */
export function dailyKey(now: Date): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `daily-${y}-${m}-${d}`;
}

/**
 * Le modalità che ruotano nel quotidiano. Restano fuori "bersaglio" (l'obiettivo
 * esatto richiede un'enumerazione troppo costosa da fare sul telefono) e
 * "sigilli" (i predicati vanno scelti a mano perché il livello resti leggibile).
 */
const DAILY_MODES: readonly LevelMode[] = ['dominio', 'assedio', 'ponti', 'simmetria'];

interface Shape {
  readonly width: number;
  readonly height: number;
  readonly stones: number;
}

const SHAPE: Readonly<Record<string, Shape>> = {
  dominio: { width: 7, height: 7, stones: 9 },
  assedio: { width: 7, height: 7, stones: 6 },
  ponti: { width: 7, height: 6, stones: 8 },
  simmetria: { width: 7, height: 6, stones: 8 },
};

/** Estrae un elemento con probabilità uniforme. */
function pick<T>(rng: () => number, items: readonly T[]): T {
  const chosen = items[Math.floor(rng() * items.length)];
  if (chosen === undefined) throw new Error('Estrazione da un insieme vuoto');
  return chosen;
}

/**
 * Costruisce la griglia testuale. Le rocce formano ostacoli sparsi ma mai un
 * muro che spezza il tabellone in due: la densità resta bassa e i bordi liberi.
 */
function buildGrid(rng: () => number, mode: LevelMode, shape: Shape): string[] {
  const { width, height } = shape;
  const symmetric = mode === 'simmetria';
  const rows: string[][] = [];

  for (let y = 0; y < height; y += 1) {
    const row: string[] = [];
    for (let x = 0; x < width; x += 1) {
      // La cornice esterna resta sempre campo libero: garantisce che ogni
      // casella sia raggiungibile e che i recinti si possano chiudere.
      const onBorder = x === 0 || y === 0 || x === width - 1 || y === height - 1;
      const mirrored = symmetric && x > (width - 1) / 2;
      if (mirrored) {
        const source = row[width - 1 - x];
        row.push(source ?? '.');
        continue;
      }

      const roll = rng();
      if (!onBorder && roll < 0.14) {
        row.push('#');
      } else if (roll < 0.34) {
        row.push('.');
      } else if (roll < 0.46) {
        row.push(String(-(1 + Math.floor(rng() * 4))));
      } else if (mode === 'ponti' && roll < 0.54) {
        row.push(`@${1 + Math.floor(rng() * 6)}`);
      } else if (roll < 0.9) {
        row.push(String(1 + Math.floor(rng() * 8)));
      } else {
        row.push(`${1 + Math.floor(rng() * 5)}x${pick(rng, [2, 2, 3])}`);
      }
    }
    rows.push(row);
  }

  if (symmetric) {
    // Ricostruisce la metà destra come riflesso esatto della sinistra.
    for (const row of rows) {
      for (let x = Math.ceil(width / 2); x < width; x += 1) {
        row[x] = row[width - 1 - x] ?? '.';
      }
    }
  }

  if (mode === 'assedio') {
    // Una sola sorgente di marea, su un bordo, così l'avanzata ha una direzione.
    const y = 1 + Math.floor(rng() * (height - 2));
    const side = rng() < 0.5 ? 0 : width - 1;
    const row = rows[y];
    if (row !== undefined) row[side] = '*';
  }

  if (mode === 'ponti') {
    // Servono almeno due città, altrimenti la rete non ha senso.
    const cities = rows.flat().filter((token) => token.startsWith('@')).length;
    if (cities < 2) {
      const a = rows[1];
      const b = rows[height - 2];
      if (a !== undefined) a[1] = '@4';
      if (b !== undefined) b[width - 2] = '@5';
    }
  }

  return rows.map((row) => row.join(' '));
}

/**
 * Riavvii del solver in browser: molti meno che nella validazione offline.
 * Su una griglia di questa taglia costa poche decine di millisecondi, e per
 * fissare le soglie una stima solida basta.
 */
/**
 * Taratura scelta misurando qualità contro costo: sotto questa soglia le stime
 * crollavano (in un caso l'oro finiva al 22% del massimo reale, rendendolo
 * privo di significato); sopra, il tempo raddoppia senza guadagno.
 * Gira in un worker, quindi non blocca l'interfaccia.
 */
const BROWSER_RESTARTS = 16;
const BROWSER_MAX_ITERATIONS = 26;

/** Costruisce (in modo deterministico) il livello del giorno per la data data. */
export function buildDailyLevel(now: Date): LevelDefinition {
  const number = dailyNumber(now);
  const rng = makeRng(number);
  const mode = pick(rng, DAILY_MODES);
  const shape = SHAPE[mode] ?? { width: 7, height: 7, stones: 8 };
  const grid = buildGrid(rng, mode, shape);

  const draft: LevelDefinition = {
    id: dailyKey(now),
    index: 0,
    name: `Edizione n. ${number}`,
    mode,
    lesson: 'Una griglia nuova ogni giorno, uguale per tutti. Hai un solo tabellone: fallo fruttare.',
    hint: 'Nessun indizio oggi: il quotidiano si risolve a mente fredda.',
    grid,
    stones: shape.stones,
    objective: { kind: 'maximize', medals: { bronze: 1, silver: 2, gold: 3 } },
    ...(mode === 'simmetria' ? { symmetry: 'vertical' as const } : {}),
  };

  // Il massimo stimato dal solver diventa l'oro; argento e bronzo sono frazioni
  // di quel massimo, arrotondate per difetto.
  const { score } = search(draft, {
    restarts: BROWSER_RESTARTS,
    maxIterations: BROWSER_MAX_ITERATIONS,
  });
  const gold = Math.max(3, score);

  return {
    ...draft,
    objective: {
      kind: 'maximize',
      medals: {
        bronze: Math.max(1, Math.floor(gold * 0.55)),
        silver: Math.max(2, Math.floor(gold * 0.8)),
        gold,
      },
    },
  };
}
