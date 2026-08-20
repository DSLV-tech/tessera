import { memo } from 'react';
import { useAppUpdate } from '../state/useAppUpdate.ts';
import styles from './UpdateToast.module.css';

/**
 * Avviso di versione nuova. Non interrompe la partita in corso: è un invito,
 * non un blocco, e resta finché il giocatore non decide di ricaricare.
 */
function UpdateToastComponent(): React.JSX.Element | null {
  const update = useAppUpdate();
  if (!update.ready) return null;

  return (
    <div className={styles.toast} role="status">
      <span className={styles.text}>È disponibile una versione aggiornata.</span>
      <button type="button" className={styles.action} onClick={update.apply}>
        Ricarica
      </button>
    </div>
  );
}

export const UpdateToast = memo(UpdateToastComponent);
