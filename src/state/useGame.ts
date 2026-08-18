import { useCallback, useMemo, useReducer } from 'react';
import { medalFor, simulate } from '../domain/engine.ts';
import type { CellId, GameState, LevelDefinition, MedalTier, Simulation } from '../domain/types.ts';
import { createGameState, gameReducer } from './gameReducer.ts';

export interface GameController {
  readonly state: GameState;
  readonly sim: Simulation;
  readonly medal: MedalTier;
  readonly canUndo: boolean;
  readonly place: (cellId: CellId) => void;
  readonly undo: () => void;
  readonly reset: () => void;
  readonly resolve: () => void;
  readonly load: (level: LevelDefinition) => void;
}

export function useGame(level: LevelDefinition): GameController {
  const [state, dispatch] = useReducer(gameReducer, level, createGameState);

  const sim = useMemo(() => simulate(state.board, state.moves), [state.board, state.moves]);
  const medal = useMemo(
    () => medalFor(sim.score, state.moves.length, state.level.objective),
    [sim.score, state.moves.length, state.level.objective],
  );

  const place = useCallback((cellId: CellId) => dispatch({ type: 'place', cellId }), []);
  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);
  const resolve = useCallback(() => dispatch({ type: 'resolve' }), []);
  const load = useCallback(
    (next: LevelDefinition) => dispatch({ type: 'load', level: next }),
    [],
  );

  return {
    state,
    sim,
    medal,
    canUndo: state.moves.length > 0,
    place,
    undo,
    reset,
    resolve,
    load,
  };
}
