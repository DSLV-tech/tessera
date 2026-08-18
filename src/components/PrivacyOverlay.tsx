import { memo } from 'react';
import { PRIVACY_SECTIONS } from './legalContent.ts';
import styles from './PrivacyOverlay.module.css';

interface PrivacyOverlayProps {
  readonly onClose: () => void;
}

function PrivacyOverlayComponent({ onClose }: PrivacyOverlayProps): React.JSX.Element {
  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="Informativa privacy e cookie">
      <div className={styles.card}>
        <header className={styles.head}>
          <h2 className={styles.title}>Privacy &amp; cookie</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Chiudi">
            ✕
          </button>
        </header>
        <div className={styles.body}>
          {PRIVACY_SECTIONS.map((section) => (
            <section key={section.heading} className={styles.section}>
              <h3>{section.heading}</h3>
              {section.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </section>
          ))}
        </div>
        <footer className={styles.footer}>
          <button type="button" className={styles.primary} onClick={onClose}>
            Chiudi
          </button>
        </footer>
      </div>
    </div>
  );
}

export const PrivacyOverlay = memo(PrivacyOverlayComponent);
