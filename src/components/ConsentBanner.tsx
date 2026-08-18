import { memo } from 'react';
import styles from './ConsentBanner.module.css';

interface ConsentBannerProps {
  readonly onAccept: () => void;
  readonly onDetails: () => void;
}

/**
 * Banner informativo (non un gate di consenso: il gioco usa solo archiviazione
 * locale tecnica, che non richiede consenso). Serve alla trasparenza.
 */
function ConsentBannerComponent({ onAccept, onDetails }: ConsentBannerProps): React.JSX.Element {
  return (
    <div className={styles.banner} role="region" aria-label="Informativa privacy">
      <p className={styles.text}>
        Tessera salva i progressi solo sul tuo dispositivo (archivio locale), non usa cookie di
        tracciamento e non raccoglie dati personali.
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.link} onClick={onDetails}>
          Dettagli
        </button>
        <button type="button" className={styles.ok} onClick={onAccept}>
          Ho capito
        </button>
      </div>
    </div>
  );
}

export const ConsentBanner = memo(ConsentBannerComponent);
