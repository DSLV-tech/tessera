/**
 * TESSERA — modello di dominio.
 *
 * Sei modalità di gioco condividono un solo motore. Ciò che cambia da una
 * modalità all'altra è dichiarativo: la presenza di sorgenti di marea, di città,
 * di sigilli logici, e il tipo di obiettivo. Nessun ramo speciale nel calcolo.
 */

/** Le sei tipologie di partita. */
export type LevelMode = 'dominio' | 'assedio' | 'bersaglio' | 'sigilli' | 'ponti' | 'simmetria';

/** Asse di simmetria centrale del tabellone (modalità simmetria). */
export type SymmetryAxis = 'vertical' | 'horizontal';

export type CellKind = 'field' | 'rock';

/** Stato di una casella durante la partita. */
export type CellState = 'empty' | 'claimed' | 'captured' | 'blighted';

export type CellId = number;

/**
 * Predicato booleano valutato su un territorio. È il cuore della modalità
 * "sigilli": una condizione logica che, se vera, attiva il fattore del sigillo.
 */
export type Predicate =
  | { readonly kind: 'sizeEven' }
  | { readonly kind: 'sizeOdd' }
  | { readonly kind: 'sizeAtLeast'; readonly n: number }
  | { readonly kind: 'sizeAtMost'; readonly n: number }
  | { readonly kind: 'noNegative' }
  | { readonly kind: 'hasNegative' }
  | { readonly kind: 'basePrime' }
  | { readonly kind: 'baseMultipleOf'; readonly n: number }
  | { readonly kind: 'capturedAtLeast'; readonly n: number };

/** Sigillo: se il predicato è vero sul territorio, il punteggio viene moltiplicato. */
export interface Seal {
  readonly predicate: Predicate;
  readonly factor: number;
}

export interface Cell {
  readonly id: CellId;
  readonly x: number;
  readonly y: number;
  readonly kind: CellKind;
  /** Valore aritmetico (può essere negativo). */
  readonly value: number;
  /** Moltiplicatore incondizionato del territorio. 1 = neutro. */
  readonly multiplier: number;
  /** Modalità ponti: la casella è una città e conta nella dimensione della rete. */
  readonly isCity: boolean;
  /** Modalità sigilli: condizione logica associata alla casella. */
  readonly seal: Seal | null;
}

export interface Board {
  readonly width: number;
  readonly height: number;
  readonly cells: readonly Cell[];
  /** Caselle già invase all'inizio della partita (modalità assedio). */
  readonly blightSources: readonly CellId[];
  /** In modalità ponti il punteggio del gruppo è moltiplicato per il numero di città. */
  readonly networkScoring: boolean;
  /**
   * Modalità simmetria: contano solo le caselle la cui immagine speculare
   * (rispetto all'asse centrale) è anch'essa posseduta. `null` altrimenti.
   */
  readonly symmetry: SymmetryAxis | null;
}

/** Gruppo connesso (4-connettività) di caselle possedute. */
export interface Territory {
  readonly cells: readonly CellId[];
  /** Somma algebrica dei valori. */
  readonly base: number;
  /** Prodotto dei moltiplicatori incondizionati. */
  readonly multiplier: number;
  /** Prodotto dei fattori dei sigilli soddisfatti. */
  readonly sealFactor: number;
  /** Numero di città (modalità ponti); 1 quando il punteggio di rete è spento. */
  readonly networkFactor: number;
  /** Sigilli presenti nel gruppo, con l'esito del loro predicato. */
  readonly sealStates: readonly { readonly cellId: CellId; readonly satisfied: boolean }[];
  readonly score: number;
}

/** Fotografia completa della partita dopo una sequenza di mosse. */
export interface Simulation {
  readonly claimed: ReadonlySet<CellId>;
  readonly blight: ReadonlySet<CellId>;
  readonly captured: ReadonlySet<CellId>;
  /** Modalità simmetria: caselle possedute ma non speculari, quindi non conteggiate. */
  readonly inactive: ReadonlySet<CellId>;
  readonly territories: readonly Territory[];
  readonly score: number;
}

export interface Medals {
  readonly bronze: number;
  readonly silver: number;
  readonly gold: number;
}

export type MedalTier = 'none' | 'bronze' | 'silver' | 'gold';

/**
 * Obiettivo del livello.
 * - `maximize`: soglie crescenti di punteggio.
 * - `exact`: colpire un valore preciso; l'oro premia anche l'economia di pedine.
 */
export type Objective =
  | { readonly kind: 'maximize'; readonly medals: Medals }
  | { readonly kind: 'exact'; readonly target: number; readonly par: number };

/** Sigillo posizionato su una casella del livello. */
export interface SealPlacement {
  readonly x: number;
  readonly y: number;
  readonly predicate: Predicate;
  readonly factor: number;
}

/** Livello senza numero d'ordine: la campagna assegna l'indice al montaggio. */
export interface LevelBlueprint {
  readonly id: string;
  readonly name: string;
  /** Concetto introdotto, mostrato in partita. */
  readonly lesson: string;
  readonly hint: string;
  readonly mode: LevelMode;
  /**
   * Griglia testuale. Token separati da spazi, una riga per riga di tabellone:
   *   `#`      roccia (invalicabile, non conquistabile)
   *   `.`      campo di valore 0
   *   `4`      campo di valore 4
   *   `-3`     campo di valore -3
   *   `4x2`    campo di valore 4 con moltiplicatore x2
   *   `*`      sorgente di marea (già invasa a inizio partita)
   *   `@7`     città di valore 7 (modalità ponti)
   */
  readonly grid: readonly string[];
  readonly stones: number;
  readonly objective: Objective;
  readonly seals?: readonly SealPlacement[];
  /** Attiva la modalità simmetria attorno all'asse centrale indicato. */
  readonly symmetry?: SymmetryAxis;
}

export interface LevelDefinition extends LevelBlueprint {
  readonly index: number;
}

export type GameStatus = 'playing' | 'resolved';

export interface GameState {
  readonly level: LevelDefinition;
  readonly board: Board;
  /** Sequenza ordinata delle pedine posate: in modalità assedio l'ordine conta. */
  readonly moves: readonly CellId[];
  readonly stonesLeft: number;
  readonly status: GameStatus;
}

export type GameAction =
  | { readonly type: 'load'; readonly level: LevelDefinition }
  | { readonly type: 'place'; readonly cellId: CellId }
  | { readonly type: 'undo' }
  | { readonly type: 'reset' }
  | { readonly type: 'resolve' };

export type CampaignProgress = Readonly<Record<string, MedalTier>>;
