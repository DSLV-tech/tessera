import type { LevelBlueprint } from '../types.ts';

/**
 * MODALITÀ SIGILLI — logica proposizionale sul tabellone.
 * Ogni sigillo porta un predicato valutato sul territorio che lo contiene:
 * se è vero il fattore si attiva, altrimenti il sigillo è muto. Due sigilli
 * nello stesso gruppo sono una congiunzione; due gruppi separati permettono
 * di soddisfare condizioni fra loro incompatibili.
 */
export const SIGILLI_LEVELS: readonly LevelBlueprint[] = [
  {
    id: 's01',
    mode: 'sigilli',
    name: 'Pari',
    lesson: 'Un sigillo moltiplica il territorio solo se il suo predicato è vero. Qui chiede un numero pari di caselle.',
    hint: 'Il sigillo conta anche sé stesso. Aggiungere una casella in più può spegnerlo.',
    grid: [
      '. . . . . . .',
      '. 6 6 6 6 6 .',
      '. . . . . . .',
      '. . . . . . .',
    ],
    seals: [{ x: 3, y: 2, predicate: { kind: 'sizeEven' }, factor: 3 }],
    stones: 6,
    objective: { kind: 'maximize', medals: { bronze: 40, silver: 65, gold: 90 } },
  },
  {
    id: 's02',
    mode: 'sigilli',
    name: 'Purezza',
    lesson: 'Un predicato di negazione: il sigillo si attiva solo se nel territorio non c’è nessuna casella negativa.',
    hint: 'I -3 sono a portata di mano e fanno gola. Ma valgono meno del fattore che ti fanno perdere.',
    grid: [
      '. . . . . . .',
      '. 5 5 5 5 5 .',
      '. -3 . . . -3 .',
      '. . . . . . .',
      '. . . . . . .',
    ],
    seals: [{ x: 3, y: 2, predicate: { kind: 'noNegative' }, factor: 4 }],
    stones: 6,
    objective: { kind: 'maximize', medals: { bronze: 40, silver: 70, gold: 100 } },
  },
  {
    id: 's03',
    mode: 'sigilli',
    name: 'Massa critica',
    lesson: 'Un predicato di soglia rende utili anche le caselle da zero punti: servono a fare numero.',
    hint: 'Le caselle vuote non valgono nulla di per sé, ma portano il gruppo oltre la soglia.',
    grid: [
      '. . . . . . .',
      '. 4 . . . 4 .',
      '. . . . . . .',
      '. 4 . . . 4 .',
      '. . . . . . .',
    ],
    seals: [{ x: 3, y: 2, predicate: { kind: 'sizeAtLeast', n: 8 }, factor: 3 }],
    stones: 9,
    objective: { kind: 'maximize', medals: { bronze: 16, silver: 32, gold: 48 } },
  },
  {
    id: 's04',
    mode: 'sigilli',
    name: 'Congiunzione',
    lesson: 'Due sigilli nello stesso territorio sono un AND: i fattori si compongono solo se entrambi i predicati reggono.',
    hint: 'Pari e senza negativi insieme: ×2 per ×3 fa ×6. Conta le caselle prima di posare l’ultima pedina.',
    grid: [
      '. . . . . . . .',
      '. 5 5 5 5 5 5 .',
      '. . . . . . . .',
      '. -4 . . . . -4 .',
      '. . . . . . . .',
    ],
    seals: [
      { x: 2, y: 2, predicate: { kind: 'sizeEven' }, factor: 2 },
      { x: 5, y: 2, predicate: { kind: 'noNegative' }, factor: 3 },
    ],
    stones: 8,
    objective: { kind: 'maximize', medals: { bronze: 80, silver: 130, gold: 180 } },
  },
  {
    id: 's05',
    mode: 'sigilli',
    name: 'Incompatibili',
    lesson: 'Predicati contraddittori non possono stare nello stesso gruppo: separali in due territori distinti.',
    hint: 'Un sigillo vuole un gruppo pari, l’altro un gruppo dispari. Uniti si annullano a vicenda.',
    grid: [
      '. . . . . . . . .',
      '. 6 6 . . . 6 6 .',
      '. . . . # . . . .',
      '. 6 6 . # . 6 6 .',
      '. . . . . . . . .',
    ],
    seals: [
      { x: 1, y: 2, predicate: { kind: 'sizeEven' }, factor: 3 },
      { x: 7, y: 2, predicate: { kind: 'sizeOdd' }, factor: 3 },
    ],
    stones: 8,
    objective: { kind: 'maximize', medals: { bronze: 40, silver: 70, gold: 96 } },
  },
  {
    id: 's06',
    mode: 'sigilli',
    name: 'Il sigillo primo',
    lesson: 'Il predicato più severo: la somma base del territorio deve essere un numero primo.',
    hint: 'I primi si diradano salendo. Cerca la combinazione più alta che resta indivisibile.',
    grid: [
      '. . . . . . .',
      '. 7 . 5 . 3 .',
      '. . . . . . .',
      '. 4 . 2 . 6 .',
      '. . . . . . .',
    ],
    seals: [{ x: 3, y: 2, predicate: { kind: 'basePrime' }, factor: 5 }],
    stones: 6,
    objective: { kind: 'maximize', medals: { bronze: 28, silver: 50, gold: 72 } },
  },
];
