import { memo } from 'react';
import type { LevelDefinition, MedalTier } from '../domain/types.ts';
import { Medal } from './Medal.tsx';
import { MEDAL_LABEL } from '../domain/labels.ts';
import styles from './ResultOverlay.module.css';

interface ResultOverlayProps {
  readonly level: LevelDefinition;
  readonly score: number;
  readonly stonesUsed: number;
  readonly medal: MedalTier;
  readonly hasNext: boolean;
  readonly onRetry: () => void;
  readonly onNext: () => void;
  readonly onMap: () => void;
}

const HEADLINE: Readonly<Record<MedalTier, string>> = {
  none: 'Obiettivo mancato',
  bronze: 'Livello superato',
  silver: 'Ottimo lavoro',
  gold: 'Perfetto',
};

function detailFor(level: LevelDefinition, score: number, stonesUsed: number, medal: MedalTier): string {
  const { objective } = level;

  if (objective.kind === 'exact') {
    const distance = Math.abs(score - objective.target);
    if (distance === 0) {
      return medal === 'gold'
        ? `Esatto in ${stonesUsed} pedine — dentro il par di ${objective.par}.`
        : `Esatto, ma con ${stonesUsed} pedine contro un par di ${objective.par}: l’oro chiede più economia.`;
    }
    return `Mancano ${distance} punti dal bersaglio di ${objective.target}.`;
  }

  if (medal === 'none') {
    return `Ti mancano ${objective.medals.bronze - score} punti per il bronzo.`;
  }
  return `${MEDAL_LABEL[medal]} · oro a ${objective.medals.gold} punti.`;
}

function ResultOverlayComponent({
  level,
  score,
  stonesUsed,
  medal,
  hasNext,
  onRetry,
  onNext,
  onMap,
}: ResultOverlayProps): React.JSX.Element {
  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="Esito del livello">
      <div className={styles.card}>
        <span className={`${styles.medalPop} ${medal === 'gold' ? styles.medalGold : ''}`}>
          <Medal tier={medal} size={64} />
        </span>
        <h2 className={styles.title}>{HEADLINE[medal]}</h2>
        <p className={styles.score}>
          {score} <span>punti</span>
        </p>
        <p className={styles.detail}>{detailFor(level, score, stonesUsed, medal)}</p>
        <div className={styles.actions}>
          <button type="button" className={styles.ghost} onClick={onMap}>
            Mappa
          </button>
          <button type="button" className={styles.ghost} onClick={onRetry}>
            Riprova
          </button>
          {medal !== 'none' && hasNext ? (
            <button type="button" className={styles.primary} onClick={onNext}>
              Livello successivo
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export const ResultOverlay = memo(ResultOverlayComponent);
