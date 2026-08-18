import { canPlace, parseBoard, simulate } from '../domain/engine.ts';
import type { GameAction, GameState, LevelDefinition } from '../domain/types.ts';

export function createGameState(level: LevelDefinition): GameState {
  return {
    level,
    board: parseBoard(level),
    moves: [],
    stonesLeft: level.stones,
    status: 'playing',
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'load':
      return createGameState(action.level);

    case 'reset':
      return createGameState(state.level);

    case 'place': {
      if (state.status !== 'playing' || state.stonesLeft === 0) return state;
      const sim = simulate(state.board, state.moves);
      if (!canPlace(state.board, sim.claimed, sim.blight, action.cellId)) return state;

      const moves = [...state.moves, action.cellId];
      const stonesLeft = state.stonesLeft - 1;
      return {
        ...state,
        moves,
        stonesLeft,
        status: stonesLeft === 0 ? 'resolved' : 'playing',
      };
    }

    case 'undo': {
      if (state.moves.length === 0) return state;
      const moves = state.moves.slice(0, -1);
      return {
        ...state,
        moves,
        stonesLeft: state.level.stones - moves.length,
        status: 'playing',
      };
    }

    case 'resolve':
      return state.status === 'resolved' ? state : { ...state, status: 'resolved' };

    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}
