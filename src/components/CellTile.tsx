import { memo } from 'react';
import { predicateBadge } from '../domain/engine.ts';
import type { Cell, CellId, CellState } from '../domain/types.ts';
import styles from './CellTile.module.css';

interface CellTileProps {
  readonly cell: Cell;
  readonly state: CellState;
  /** Modalità simmetria: posseduta ma non speculare, quindi non conteggiata. */
  readonly inactive: boolean;
  /** La casella verrebbe catturata se si posasse la pedina in anteprima. */
  readonly previewCaptured: boolean;
  /** La marea invaderebbe questa casella al passo successivo (anteprima). */
  readonly previewBlight: boolean;
  /** La casella è quella attualmente sorvolata dal puntatore. */
  readonly previewTarget: boolean;
  /** Il sigillo su questa casella è soddisfatto nella configurazione attuale. */
  readonly sealSatisfied: boolean | null;
  readonly interactive: boolean;
  /** Roving tabindex: 0 per l'unica casella nel ciclo di Tab, -1 per le altre. */
  readonly tabIndex: number;
  readonly onSelect: (id: CellId) => void;
  readonly onHover: (id: CellId | null) => void;
  readonly onFocusCell: (id: CellId) => void;
}

function valueClass(value: number): string {
  if (value > 0) return styles.positive as string;
  if (value < 0) return styles.negative as string;
  return styles.zero as string;
}

function CellTileComponent({
  cell,
  state,
  inactive,
  previewCaptured,
  previewBlight,
  previewTarget,
  sealSatisfied,
  interactive,
  tabIndex,
  onSelect,
  onHover,
  onFocusCell,
}: CellTileProps): React.JSX.Element {
  if (cell.kind === 'rock') {
    return <div className={`${styles.tile} ${styles.rock}`} aria-hidden="true" />;
  }

  const label =
    `Casella ${cell.x + 1},${cell.y + 1} — ` +
    (cell.isCity ? `città di valore ${cell.value}` : `valore ${cell.value}`) +
    (cell.multiplier > 1 ? `, moltiplicatore per ${cell.multiplier}` : '') +
    (cell.seal !== null ? `, sigillo ${predicateBadge(cell.seal.predicate)}` : '') +
    (state === 'claimed'
      ? ', occupata'
      : state === 'captured'
        ? ', catturata'
        : state === 'blighted'
          ? ', invasa dalla marea'
          : '') +
    (inactive ? ', non speculare: non conta' : '');

  const classes = [
    styles.tile,
    styles.field,
    state === 'claimed' ? styles.claimed : '',
    state === 'captured' ? styles.captured : '',
    state === 'blighted' ? styles.blighted : '',
    previewCaptured ? styles.previewCaptured : '',
    previewBlight ? styles.previewBlight : '',
    previewTarget ? styles.previewTarget : '',
    cell.multiplier > 1 ? styles.hasMultiplier : '',
    cell.isCity ? styles.city : '',
    cell.seal !== null ? styles.hasSeal : '',
    inactive ? styles.inactive : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      aria-label={label}
      tabIndex={tabIndex}
      data-cell={cell.id}
      disabled={!interactive || state !== 'empty'}
      onClick={() => onSelect(cell.id)}
      onPointerEnter={() => onHover(cell.id)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => {
        onHover(cell.id);
        onFocusCell(cell.id);
      }}
      onBlur={() => onHover(null)}
    >
      {state === 'blighted' ? (
        <svg
          className={styles.blightMark}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <use href="#spr-drop" />
        </svg>
      ) : (
        <span className={`${styles.value} ${valueClass(cell.value)}`}>
          {cell.value === 0 ? '·' : cell.value}
        </span>
      )}
      {cell.multiplier > 1 ? <span className={styles.multiplier}>×{cell.multiplier}</span> : null}
      {cell.isCity ? (
        <svg
          className={styles.cityMark}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <use href="#spr-city" />
        </svg>
      ) : null}
      {cell.seal !== null ? (
        <span
          className={`${styles.sealBadge} ${sealSatisfied === true ? styles.sealOn : ''}`}
        >
          {predicateBadge(cell.seal.predicate)}×{cell.seal.factor}
        </span>
      ) : null}
      {state === 'claimed' ? (
        <svg
          className={styles.stone}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <use href="#spr-stone" />
        </svg>
      ) : null}
    </button>
  );
}

export const CellTile = memo(CellTileComponent);
