import styles from './Loader.module.css';

interface LoaderProps {
  readonly label?: string;
}

export function Loader({ label = 'Preparazione del tavolo…' }: LoaderProps): React.JSX.Element {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <div className={styles.stones} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className={styles.label}>{label}</p>
    </div>
  );
}
