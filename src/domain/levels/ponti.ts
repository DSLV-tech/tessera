import type { LevelBlueprint } from '../types.ts';

/**
 * MODALITÀ PONTI — teoria dei grafi.
 * Solo le città hanno valore, e il punteggio di una rete è la somma dei suoi
 * valori moltiplicata per il numero di città che contiene. Collegare conviene
 * in modo superlineare, ma ogni casella di collegamento costa una pedina:
 * è un problema di albero di Steiner travestito da gioco da tavolo.
 */
export const PONTI_LEVELS: readonly LevelBlueprint[] = [
  {
    id: 'p01',
    mode: 'ponti',
    name: 'Il primo ponte',
    lesson: 'Solo le città valgono. Una rete vale la somma delle sue città moltiplicata per quante ne collega.',
    hint: 'Due città isolate valgono 6 ciascuna. Unite in una sola rete valgono il doppio in totale.',
    grid: [
      '. . . . . . .',
      '. @6 . . . @6 .',
      '. . . . . . .',
      '. . . . . . .',
    ],
    stones: 5,
    objective: { kind: 'maximize', medals: { bronze: 12, silver: 18, gold: 24 } },
  },
  {
    id: 'p02',
    mode: 'ponti',
    name: 'Il costo del guado',
    lesson: 'Il percorso più corto non è sempre il più conveniente: le caselle che attraversi entrano nella somma.',
    hint: 'La linea diretta passa nella palude. Aggirarla costa una pedina in più e ne vale la pena.',
    grid: [
      '. . . . . . .',
      '. . . . . . .',
      '. @8 -6 -6 -6 @8 .',
      '. . . . . . .',
      '. . . . . . .',
    ],
    stones: 7,
    objective: { kind: 'maximize', medals: { bronze: 8, silver: 12, gold: 16 } },
  },
  {
    id: 'p03',
    mode: 'ponti',
    name: 'Il nodo',
    lesson: 'Con tre città il fattore diventa ×3: conviene un solo nodo centrale invece di due ponti separati.',
    hint: 'Non collegarle a catena. Cerca il punto che le raggiunge tutte con meno caselle.',
    grid: [
      '. . . . . . .',
      '. . . @5 . . .',
      '. . . . . . .',
      '. @5 . . . @5 .',
      '. . . . . . .',
    ],
    stones: 8,
    objective: { kind: 'maximize', medals: { bronze: 20, silver: 33, gold: 45 } },
  },
  {
    id: 'p04',
    mode: 'ponti',
    name: 'Albero',
    lesson: 'Quattro città e un centro: l’albero che le unisce tutte costa meno della somma dei collegamenti a coppie.',
    hint: 'La croce è la forma giusta. Ogni braccio serve una sola città, il tronco le serve tutte.',
    grid: [
      '. . . . . . . . .',
      '. . . . @4 . . . .',
      '. . . . . . . . .',
      '. @4 . . . . . @4 .',
      '. . . . . . . . .',
      '. . . . @4 . . . .',
      '. . . . . . . . .',
    ],
    stones: 12,
    objective: { kind: 'maximize', medals: { bronze: 18, silver: 30, gold: 40 } },
  },
  {
    id: 'p05',
    mode: 'ponti',
    name: 'La città lontana',
    lesson: 'Non ogni città va collegata: valuta il guadagno marginale del quarto nodo contro le pedine che costa.',
    hint: 'Il gruppo compatto a sinistra rende molto. La città in fondo a destra è ricca, ma quanto costa raggiungerla?',
    grid: [
      '. . . . . . . . . .',
      '. @6 . @6 . . . . . .',
      '. . . . . . . . . .',
      '. @6 . @6 . . . . @12 .',
      '. . . . . . . . . .',
      '. . . . . . . . . .',
    ],
    stones: 10,
    objective: { kind: 'maximize', medals: { bronze: 48, silver: 80, gold: 108 } },
  },
  {
    id: 'p06',
    mode: 'ponti',
    name: 'La rete',
    lesson: 'Rocce, paludi e un budget stretto: la rete ottima non è la più estesa, è quella con il miglior rapporto fra città e pedine.',
    hint: 'Le rocce non si attraversano ma nemmeno costano. Falle lavorare come parte del percorso.',
    grid: [
      '. . . . . . . . . .',
      '. @7 . . # . . @7 . .',
      '. . . . # . . . . .',
      '. . -5 . . . -5 . . .',
      '. . . . # . . . . .',
      '. @7 . . # . . @7 . .',
      '. . . . . . . . . .',
    ],
    stones: 14,
    objective: { kind: 'maximize', medals: { bronze: 18, silver: 30, gold: 42 } },
  },
];
