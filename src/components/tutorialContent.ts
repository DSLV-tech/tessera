import type { LevelMode } from '../domain/types.ts';

export interface TutorialStep {
  readonly title: string;
  readonly body: string;
}

export interface TutorialContent {
  readonly steps: readonly TutorialStep[];
}

/** Micro-tutorial mostrato la prima volta che si entra in ciascuna modalità. */
export const TUTORIALS: Readonly<Record<LevelMode, TutorialContent>> = {
  dominio: {
    steps: [
      {
        title: 'Conquista',
        body: 'Tocca una casella libera per posarci una pedina: incassi il valore stampato sulla casella.',
      },
      {
        title: 'Accerchiamento',
        body: 'Chiudi una zona vuota tutt’intorno con le tue pedine e le rocce: la catturi gratis, senza spendere pedine.',
      },
      {
        title: 'Territorio',
        body: 'Le tue caselle adiacenti formano un gruppo: vale la somma dei valori moltiplicata per i moltiplicatori che contiene. Attento ai numeri negativi.',
      },
    ],
  },
  assedio: {
    steps: [
      {
        title: 'La marea',
        body: 'Dopo ogni pedina che posi, la marea avanza di una casella. Le tue pedine la fermano: sono dighe.',
      },
      {
        title: 'L’ordine conta',
        body: 'Non solo dove posi, ma quando: ogni mossa nutre la marea. A volte la mossa migliore è chiudere la partita in anticipo.',
      },
    ],
  },
  bersaglio: {
    steps: [
      {
        title: 'Il conto esatto',
        body: 'Qui non vince il punteggio più alto: vince quello esatto. Superare il bersaglio è come mancarlo.',
      },
      {
        title: 'Scomponi',
        body: 'Usa somme, moltiplicatori e persino le caselle negative per correggere l’eccesso e centrare il numero.',
      },
    ],
  },
  sigilli: {
    steps: [
      {
        title: 'I sigilli',
        body: 'Un sigillo moltiplica il territorio solo se la sua condizione è vera — per esempio “un numero pari di caselle”.',
      },
      {
        title: 'Vero o muto',
        body: 'Costruisci il gruppo perché la condizione regga. Se è falsa, il sigillo resta muto e non vale nulla.',
      },
    ],
  },
  ponti: {
    steps: [
      {
        title: 'Solo le città',
        body: 'Le caselle normali non valgono niente: contano solo le città (bordo azzurro).',
      },
      {
        title: 'La rete',
        body: 'Una rete vale la somma delle sue città moltiplicata per quante ne collega. Collegare conviene, ma ogni ponte costa una pedina.',
      },
    ],
  },
  simmetria: {
    steps: [
      {
        title: 'Lo specchio',
        body: 'Conta una casella solo se anche la sua immagine speculare, rispetto all’asse tratteggiato, è tua. Da sola non vale nulla.',
      },
      {
        title: 'Il costo del riflesso',
        body: 'Per incassare un valore fuori asse paghi anche il suo riflesso: gratis se è una casella vuota, una tassa se è negativa.',
      },
    ],
  },
};
