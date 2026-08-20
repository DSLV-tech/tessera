import { memo } from 'react';
import { LEVELS, MODE_LABEL, MODE_TAGLINE } from '../domain/levels/index.ts';
import type { CampaignProgress, LevelDefinition, LevelMode } from '../domain/types.ts';
import type { CampaignRecords, LevelProgress } from '../state/useCampaign.ts';
import type { DailyStatus } from '../state/useDaily.ts';
import { DailyCard } from './DailyCard.tsx';
import { isIosSafari } from '../state/install.ts';
import { useInstall } from '../state/useInstall.ts';
import { Medal } from './Medal.tsx';
import { Mark } from './Mark.tsx';
import styles from './LevelSelect.module.css';

interface LevelSelectProps {
  readonly progress: CampaignProgress;
  readonly records: CampaignRecords;
  readonly dailyStatus: DailyStatus;
  readonly dailyLevel: LevelDefinition | null;
  readonly dailyResult: LevelProgress | undefined;
  readonly totalBest: number;
  readonly medalsWon: number;
  readonly completed: number;
  readonly isUnlocked: (level: LevelDefinition) => boolean;
  readonly persistent: boolean;
  readonly onSelect: (level: LevelDefinition) => void;
  readonly onReset: () => void;
  readonly onPrivacy: () => void;
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
  records,
  dailyStatus,
  dailyLevel,
  dailyResult,
  totalBest,
  medalsWon,
  completed,
  isUnlocked,
  persistent,
  onSelect,
  onReset,
  onPrivacy,
}: LevelSelectProps): React.JSX.Element {
  const totalMedals = LEVELS.length * 3;
  const hasProgress = completed > 0;
  const install = useInstall();
  const iosInstall = !install.available && isIosSafari();

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
        <Mark size={84} className={styles.mark} />
        <p className={styles.eyebrow}>Gioco di strategia matematica</p>
        <h1 className={styles.title}>TESSERA</h1>
        <p className={styles.subtitle}>
          Sei modi di ragionare sullo stesso tabellone: conquista, assedio, bersaglio
          esatto, logica dei sigilli, reti di città, simmetria.
        </p>
        <p className={styles.stats}>
          {completed}/{LEVELS.length} livelli · {medalsWon}/{totalMedals} medaglie
          {totalBest > 0 ? ` · ${totalBest} punti totali` : ''}
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

        {install.available ? (
          <button type="button" className={styles.install} onClick={install.install}>
            <span aria-hidden="true">↓</span> Installa l’app
          </button>
        ) : null}
        {iosInstall ? (
          <p className={styles.iosHint}>
            Per installarla su iPhone: tocca <b>Condividi</b> e poi{' '}
            <b>Aggiungi a Home</b>.
          </p>
        ) : null}
      </header>

      <DailyCard
        status={dailyStatus}
        level={dailyLevel}
        result={dailyResult}
        onPlay={onSelect}
      />

      <ol className={styles.grid}>
        {LEVELS.map((level) => {
          const unlocked = isUnlocked(level);
          const tier = progress[level.id] ?? 'none';
          const best = records[level.id]?.best ?? null;
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
                      {best !== null ? (
                        <>
                          {' · '}
                          <span className={styles.best}>record {best}</span>
                        </>
                      ) : null}
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

      <section className={styles.legend}>
        <h2>Le sei modalità</h2>
        <ul>
          {MODE_ORDER.map((mode) => (
            <li key={mode}>
              <b className={styles[`label-${mode}`]}>{MODE_LABEL[mode]}</b> — {MODE_TAGLINE[mode]}
            </li>
          ))}
        </ul>
      </section>

      <footer className={styles.credits}>
        <p className={styles.creditLine}>
          Un gioco{' '}
          <a
            className={styles.creditLink}
            href="https://dslv.tech"
            target="_blank"
            rel="noopener noreferrer"
          >
            DSLV.tech
          </a>
        </p>
        <p className={styles.creditMeta}>
          <button type="button" className={styles.creditButton} onClick={onPrivacy}>
            Privacy &amp; cookie
          </button>
          <span aria-hidden="true"> · </span>
          <span>© 2026 Digital Solving</span>
        </p>
      </footer>
    </main>
  );
}

export const LevelSelect = memo(LevelSelectComponent);
