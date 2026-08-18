import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Board as BoardModel, Cell, CellId, CellState, Simulation } from '../domain/types.ts';
import { CellTile } from './CellTile.tsx';
import styles from './Board.module.css';

/** Anteprima della mossa sorvolata: calcolata a monte, il tabellone la disegna soltanto. */
export interface MovePreview {
  readonly cellId: CellId;
  readonly delta: number;
  readonly sim: Simulation;
}

interface BoardProps {
  readonly board: BoardModel;
  readonly sim: Simulation;
  readonly preview: MovePreview | null;
  readonly interactive: boolean;
  readonly onPlace: (id: CellId) => void;
  readonly onHover: (id: CellId | null) => void;
}

function BoardComponent({
  board,
  sim,
  preview,
  interactive,
  onPlace,
  onHover,
}: BoardProps): React.JSX.Element {
  const gridRef = useRef<HTMLDivElement>(null);

  const stateOf = useCallback(
    (cell: Cell): CellState =>
      sim.claimed.has(cell.id)
        ? 'claimed'
        : sim.captured.has(cell.id)
          ? 'captured'
          : sim.blight.has(cell.id)
            ? 'blighted'
            : 'empty',
    [sim],
  );

  /** Una casella è raggiungibile da tastiera solo se ci si può posare una pedina. */
  const isTarget = useCallback(
    (cell: Cell): boolean => interactive && cell.kind === 'field' && stateOf(cell) === 'empty',
    [interactive, stateOf],
  );

  /** Roving tabindex: un solo punto di ingresso al tabellone via Tab, poi frecce. */
  const firstTargetId = useMemo(
    () => board.cells.find((c) => isTarget(c))?.id ?? board.cells.find((c) => c.kind === 'field')?.id ?? -1,
    [board.cells, isTarget],
  );
  const [rovingId, setRovingId] = useState<CellId>(firstTargetId);
  useEffect(() => setRovingId(firstTargetId), [firstTargetId]);

  const sealSatisfaction = useMemo(() => {
    const map = new Map<CellId, boolean>();
    for (const territory of sim.territories) {
      for (const { cellId, satisfied } of territory.sealStates) map.set(cellId, satisfied);
    }
    return map;
  }, [sim.territories]);

  const focusCell = useCallback((id: CellId) => {
    setRovingId(id);
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-cell="${id}"]`)?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const deltas: Record<string, readonly [number, number]> = {
        ArrowRight: [1, 0],
        ArrowLeft: [-1, 0],
        ArrowDown: [0, 1],
        ArrowUp: [0, -1],
      };
      const step = deltas[event.key];
      if (step === undefined) return;
      const origin = board.cells[rovingId];
      if (origin === undefined) return;
      event.preventDefault();
      let x = origin.x;
      let y = origin.y;
      for (let i = 0; i < board.width + board.height; i += 1) {
        x += step[0];
        y += step[1];
        if (x < 0 || y < 0 || x >= board.width || y >= board.height) break;
        const candidate = board.cells[y * board.width + x];
        if (candidate !== undefined && isTarget(candidate)) {
          focusCell(candidate.id);
          return;
        }
      }
    },
    [board, focusCell, isTarget, rovingId],
  );

  return (
    <div className={styles.frame} style={{ '--cols': board.width } as React.CSSProperties}>
      <div
        ref={gridRef}
        className={styles.grid}
        role="group"
        aria-label="Tabellone di gioco. Usa le frecce per muoverti, Invio per posare una pedina."
        onKeyDown={handleKeyDown}
      >
        {board.symmetry === 'vertical' ? (
          <span className={styles.axisV} aria-hidden="true" />
        ) : null}
        {board.symmetry === 'horizontal' ? (
          <span className={styles.axisH} aria-hidden="true" />
        ) : null}
        {board.cells.map((cell) => (
          <CellTile
            key={cell.id}
            cell={cell}
            state={stateOf(cell)}
            inactive={sim.inactive.has(cell.id)}
            tabIndex={cell.id === rovingId ? 0 : -1}
            previewCaptured={
              preview !== null && preview.sim.captured.has(cell.id) && !sim.captured.has(cell.id)
            }
            previewBlight={
              preview !== null && preview.sim.blight.has(cell.id) && !sim.blight.has(cell.id)
            }
            previewTarget={preview !== null && preview.cellId === cell.id}
            sealSatisfied={sealSatisfaction.get(cell.id) ?? null}
            interactive={interactive}
            onSelect={onPlace}
            onHover={onHover}
            onFocusCell={setRovingId}
          />
        ))}
      </div>
    </div>
  );
}

export const Board = memo(BoardComponent);
