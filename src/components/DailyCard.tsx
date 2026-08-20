import { memo } from 'react';
import type { LevelDefinition } from '../domain/types.ts';
import type { DailyStatus } from '../state/useDaily.ts';
import { MODE_LABEL } from '../domain/levels/index.ts';
import { Medal } from './Medal.tsx';
import type { LevelProgress } from '../state/useCampaign.ts';
import styles from './DailyCard.module.css';

interface DailyCardProps {
  readonly status: DailyStatus;
  readonly level: LevelDefinition | null;
  readonly result: LevelProgress | undefined;
  readonly onPlay: (level: LevelDefinition) => void;
}

function DailyCardComponent({
  status,
  level,
  result,
  onPlay,
}: DailyCardProps): React.JSX.Element {
  return (
    <section className={styles.wrap} aria-labelledby="daily-heading">
      <h2 id="daily-heading" className={styles.heading}>
        Livello del giorno
      </h2>

      {status === 'loading' ? (
        <div className={styles.card} aria-busy="true">
          <span className={styles.spinner} aria-hidden="true" />
          <span className={styles.loadingText}>Preparo il tabellone di oggi…</span>
        </div>
      ) : status === 'error' || level === null ? (
        <div className={styles.card}>
          <span className={styles.loadingText}>
            Il livello di oggi non è disponibile. La campagna resta giocabile.
          </span>
        </div>
      ) : (
        <button type="button" className={styles.card} onClick={() => onPlay(level)}>
          <span className={styles.info}>
            <span className={styles.name}>{level.name}</span>
            <span className={styles.meta}>
              {MODE_LABEL[level.mode]} · {level.stones} pedine
              {result !== undefined ? ` · record ${result.best}` : ''}
            </span>
          </span>
          <span className={styles.right}>
            <Medal tier={result?.tier ?? 'none'} size={22} />
            <span className={styles.cta}>{result === undefined ? 'Gioca' : 'Rigioca'}</span>
          </span>
        </button>
      )}

      <p className={styles.note}>
        Stesso tabellone per tutti, fino a mezzanotte UTC.
      </p>
    </section>
  );
}

export const DailyCard = memo(DailyCardComponent);
