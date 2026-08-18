import { memo } from 'react';
import { LEVELS, MODE_LABEL, MODE_TAGLINE } from '../domain/levels/index.ts';
import type { CampaignProgress, LevelDefinition, LevelMode } from '../domain/types.ts';
import { Medal } from './Medal.tsx';
import styles from './LevelSelect.module.css';

interface LevelSelectProps {
  readonly progress: CampaignProgress;
  readonly medalsWon: number;
  readonly completed: number;
  readonly isUnlocked: (level: LevelDefinition) => boolean;
  readonly persistent: boolean;
  readonly onSelect: (level: LevelDefinition) => void;
  readonly onReset: () => void;
}

const MODE_ORDER: readonly LevelMode[] = [
  'dominio',
  'assedio',
  'bersaglio',
  'sigilli',
  'ponti',
  'simmetria',
];

function LevelSelectComponent({
  progress,
  medalsWon,
  completed,
  isUnlocked,
  persistent,
  onSelect,
  onReset,
}: LevelSelectProps): React.JSX.Element {
  const totalMedals = LEVELS.length * 3;
  const hasProgress = completed > 0;

  const handleReset = (): void => {
    if (!hasProgress) return;
    const confirmed =
      typeof globalThis.confirm === 'function'
        ? globalThis.confirm('Azzerare tutti i progressi? L’operazione non è reversibile.')
        : true;
    if (confirmed) onReset();
  };

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Gioco di strategia matematica</p>
        <h1 className={styles.title}>TESSERA</h1>
        <p className={styles.subtitle}>
          Sei modi di ragionare sullo stesso tabellone: conquista, assedio, bersaglio
          esatto, logica dei sigilli, reti di città, simmetria.
        </p>
        <p className={styles.stats}>
          {completed}/{LEVELS.length} livelli · {medalsWon}/{totalMedals} medaglie
        </p>
        <p className={styles.memory}>
          {persistent
            ? 'I progressi vengono salvati su questo dispositivo.'
            : 'Progressi non salvati in questo contesto: validi solo per la sessione.'}
          {hasProgress ? (
            <>
              {' · '}
              <button type="button" className={styles.resetLink} onClick={handleReset}>
                Azzera
              </button>
            </>
          ) : null}
        </p>
      </header>

      <ol className={styles.grid}>
        {LEVELS.map((level) => {
          const unlocked = isUnlocked(level);
          const tier = progress[level.id] ?? 'none';
          return (
            <li key={level.id}>
              <button
                type="button"
                className={`${styles.card} ${unlocked ? '' : styles.locked} ${styles[`mode-${level.mode}`]}`}
                disabled={!unlocked}
                onClick={() => onSelect(level)}
              >
                <span className={styles.index}>{String(level.index).padStart(2, '0')}</span>
                <span className={styles.name}>{unlocked ? level.name : 'Bloccato'}</span>
                <span className={styles.meta}>
                  {unlocked ? (
                    <>
                      <span className={styles.modeBadge}>{MODE_LABEL[level.mode]}</span>
                      {' · '}
                      {level.stones} pedine
                    </>
                  ) : (
                    'Completa il livello precedente'
                  )}
                </span>
                <span className={styles.medal}>
                  <Medal tier={tier} size={20} />
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <footer className={styles.legend}>
        <h2>Le sei modalità</h2>
        <ul>
          {MODE_ORDER.map((mode) => (
            <li key={mode}>
              <b className={styles[`label-${mode}`]}>{MODE_LABEL[mode]}</b> — {MODE_TAGLINE[mode]}
            </li>
          ))}
        </ul>
      </footer>
    </main>
  );
}

export const LevelSelect = memo(LevelSelectComponent);
