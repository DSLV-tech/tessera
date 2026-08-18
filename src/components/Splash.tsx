import { useCallback, useEffect, useState } from 'react';
import { BrandLoader } from './BrandLoader.tsx';
import styles from './Splash.module.css';

type Phase = 'show' | 'hiding' | 'gone';

/**
 * Splash iniziale con il marchio animato. Sfuma dopo un breve momento (o al tocco)
 * e si smonta a transizione conclusa. Con prefers-reduced-motion resta minimo.
 */
export function Splash(): React.JSX.Element | null {
  const [phase, setPhase] = useState<Phase>('show');

  useEffect(() => {
    const reduce = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const timer = globalThis.setTimeout(() => setPhase('hiding'), reduce ? 250 : 1150);
    return () => globalThis.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== 'hiding') return;
    const timer = globalThis.setTimeout(() => setPhase('gone'), 480);
    return () => globalThis.clearTimeout(timer);
  }, [phase]);

  const skip = useCallback(() => setPhase((p) => (p === 'show' ? 'hiding' : p)), []);

  if (phase === 'gone') return null;

  return (
    <div
      className={`${styles.splash} ${phase === 'hiding' ? styles.hiding : ''}`}
      onClick={skip}
      role="presentation"
    >
      <BrandLoader caption="" />
    </div>
  );
}
