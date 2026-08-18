import type { LevelBlueprint } from '../types.ts';

/**
 * MODALITÀ SIMMETRIA — geometria e riflessione.
 * Contano solo le caselle la cui immagine speculare rispetto all'asse centrale
 * è anch'essa posseduta: una casella spaiata resta tua ma non vale nulla. Per
 * incassare un valore fuori asse devi pagare anche il suo riflesso — che a volte
 * è gratis (uno zero), a volte è una perdita (una casella negativa).
 */
export const SIMMETRIA_LEVELS: readonly LevelBlueprint[] = [
  {
    id: 'y01',
    mode: 'simmetria',
    name: 'Lo specchio',
    lesson: 'Una casella conta solo se anche la sua immagine speculare è tua. Da sola, non vale nulla.',
    hint: 'Prendere un solo 5 non dà punti: devi prendere anche il suo riflesso dall’altra parte dell’asse.',
    symmetry: 'vertical',
    grid: [
      '. . . . . . .',
      '. 5 . 4 . 5 .',
      '. . . . . . .',
      '. 5 . . . 5 .',
      '. . . . . . .',
    ],
    stones: 6,
    objective: { kind: 'maximize', medals: { bronze: 12, silver: 18, gold: 24 } },
  },
  {
    id: 'y02',
    mode: 'simmetria',
    name: 'Sull’asse',
    lesson: 'Le caselle sull’asse sono immagine di sé stesse: contano da sole, senza bisogno di un riflesso.',
    hint: 'I 9 al centro stanno sull’asse: una pedina ciascuno e sono già simmetrici. Il resto va in coppia.',
    symmetry: 'vertical',
    grid: [
      '. . . . . . .',
      '. 3 . 9 . 3 .',
      '. . . 9 . . .',
      '. 3 . 9 . 3 .',
      '. . . . . . .',
    ],
    stones: 8,
    objective: { kind: 'maximize', medals: { bronze: 20, silver: 30, gold: 39 } },
  },
  {
    id: 'y03',
    mode: 'simmetria',
    name: 'Il costo del riflesso',
    lesson: 'Per incassare un valore fuori asse paghi anche il suo riflesso: se è uno zero è gratis, se è negativo è una tassa.',
    hint: 'Il 9 di sinistra ha per riflesso un −8: prenderlo costa caro. Il 6, invece, si specchia in una casella vuota.',
    symmetry: 'vertical',
    grid: [
      '. . . . . . .',
      '. 9 . . . -8 .',
      '. . . . . . .',
      '. 6 . . . . .',
      '. . . 4 . . .',
    ],
    stones: 6,
    objective: { kind: 'maximize', medals: { bronze: 5, silver: 8, gold: 11 } },
  },
  {
    id: 'y04',
    mode: 'simmetria',
    name: 'Riflesso di pietra',
    lesson: 'Anche le caselle catturate per accerchiamento devono avere il loro riflesso posseduto per contare.',
    hint: 'Le rocce sono già disposte in modo simmetrico: chiudi la stanza in modo speculare e l’interno cadrà, riflesso compreso.',
    symmetry: 'vertical',
    grid: [
      '. . . . . . . . .',
      '. # # . . . # # .',
      '. # 7 . 5 . 7 # .',
      '. # 7 . 5 . 7 # .',
      '. # # . . . # # .',
      '. . . . . . . . .',
    ],
    stones: 8,
    objective: { kind: 'maximize', medals: { bronze: 18, silver: 28, gold: 38 } },
  },
  {
    id: 'y05',
    mode: 'simmetria',
    name: 'Il moltiplicatore riflesso',
    lesson: 'Un moltiplicatore conta solo se è attivo: il suo territorio deve essere speculare, riflesso del moltiplicatore incluso.',
    hint: 'C’è un ×3 su ciascun lato. Costruisci le due cittadelle identiche: ogni ×3 triplica il suo lato.',
    symmetry: 'vertical',
    grid: [
      '. . . . . . . . .',
      '. 4 4 4 . 4 4 4 .',
      '. 4 .x3 4 . 4 .x3 4 .',
      '. 4 4 4 . 4 4 4 .',
      '. . . . . . . . .',
    ],
    stones: 12,
    objective: { kind: 'maximize', medals: { bronze: 90, silver: 180, gold: 360 } },
  },
  {
    id: 'y06',
    mode: 'simmetria',
    name: 'Asse orizzontale',
    lesson: 'L’asse può essere orizzontale: lo specchio è sopra-sotto invece che destra-sinistra. La logica non cambia.',
    hint: 'Rifletti in verticale. Le caselle in alto contano solo se possiedi anche le gemelle in basso.',
    symmetry: 'horizontal',
    grid: [
      '. . . . . . .',
      '. 6 . 8 . 6 .',
      '. . . -9 . . .',
      '. . . . . . .',
      '. . . -9 . . .',
      '. 6 . 8 . 6 .',
      '. . . . . . .',
    ],
    stones: 10,
    objective: { kind: 'maximize', medals: { bronze: 20, silver: 30, gold: 40 } },
  },
];
