import { memo, useState } from 'react';
import { MODE_LABEL } from '../domain/levels/index.ts';
import type { LevelMode } from '../domain/types.ts';
import { TUTORIALS } from './tutorialContent.ts';
import styles from './TutorialOverlay.module.css';

interface TutorialOverlayProps {
  readonly mode: LevelMode;
  readonly onClose: () => void;
}

function TutorialOverlayComponent({ mode, onClose }: TutorialOverlayProps): React.JSX.Element {
  const steps = TUTORIALS[mode].steps;
  const [index, setIndex] = useState(0);
  const step = steps[index] ?? steps[0]!;
  const isLast = index === steps.length - 1;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label={`Come si gioca: ${MODE_LABEL[mode]}`}>
      <div className={`${styles.card} ${styles[`mode-${mode}`] ?? ''}`}>
        <p className={styles.eyebrow}>Come si gioca · {MODE_LABEL[mode]}</p>
        <h2 className={styles.title}>{step.title}</h2>
        <p className={styles.body}>{step.body}</p>

        <div className={styles.dots} aria-hidden="true">
          {steps.map((s, i) => (
            <span key={s.title} className={i === index ? styles.dotActive : styles.dot} />
          ))}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.ghost} onClick={onClose}>
            Salta
          </button>
          {isLast ? (
            <button type="button" className={styles.primary} onClick={onClose}>
              Ho capito
            </button>
          ) : (
            <button
              type="button"
              className={styles.primary}
              onClick={() => setIndex((i) => Math.min(i + 1, steps.length - 1))}
            >
              Avanti
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const TutorialOverlay = memo(TutorialOverlayComponent);
