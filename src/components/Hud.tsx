import { memo } from 'react';
import type { LevelDefinition, MedalTier, Simulation } from '../domain/types.ts';
import { Medal } from './Medal.tsx';
import styles from './Hud.module.css';

interface HudProps {
  readonly level: LevelDefinition;
  readonly sim: Simulation;
  readonly medal: MedalTier;
  readonly stonesUsed: number;
}

function formatDelta(delta: number): string {
  return delta > 0 ? `+${delta}` : String(delta);
}

/**
 * Pannello di riferimento: soglie/medaglie, dettaglio dei territori e regola del
 * livello. Il punteggio "vivo" (score, delta, pedine, titolo) vive nella barra di
 * stato di GameView, sempre visibile: qui restano solo le informazioni consultabili.
 */
function HudComponent({ level, sim, medal, stonesUsed }: HudProps): React.JSX.Element {
  const { objective } = level;

  return (
    <aside className={styles.panel} aria-label="Dettaglio della partita">
      {objective.kind === 'maximize' ? (
        <section>
          <p className={styles.metricLabel}>Medaglie</p>
          <div className={styles.track} aria-hidden="true">
            <div
              className={styles.fill}
              style={{ width: `${Math.max(0, Math.min(1, sim.score / objective.medals.gold)) * 100}%` }}
            />
            <span
              className={styles.notch}
              style={{ left: `${(objective.medals.bronze / objective.medals.gold) * 100}%` }}
            />
            <span
              className={styles.notch}
              style={{ left: `${(objective.medals.silver / objective.medals.gold) * 100}%` }}
            />
          </div>
          <ul className={styles.medals}>
            {(['bronze', 'silver', 'gold'] as const).map((tier) => (
              <li key={tier} className={medal === tier ? styles.medalActive : undefined}>
                <Medal tier={tier} size={18} />
                <span>{objective.medals[tier]}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className={styles.exactRow}>
          <p className={styles.metricLabel}>Bersaglio {objective.target}</p>
          <div className={styles.exactTrack} aria-hidden="true">
            <span className={styles.exactZero} />
            <span
              className={styles.exactMarker}
              style={{
                left: `${50 + Math.max(-50, Math.min(50, ((sim.score - objective.target) / Math.max(1, Math.abs(objective.target))) * 50))}%`,
              }}
            />
          </div>
          <p className={styles.exactHint}>
            {sim.score === objective.target
              ? `Esatto — con ${stonesUsed <= objective.par ? 'economia da oro' : 'più pedine del par'} (par ${objective.par}).`
              : `Distanza dal bersaglio: ${formatDelta(sim.score - objective.target)}`}
          </p>
        </section>
      )}

      {sim.territories.length > 0 ? (
        <section className={styles.territories}>
          <p className={styles.metricLabel}>Territori</p>
          <ul>
            {sim.territories.slice(0, 4).map((territory) => (
              <li key={territory.cells[0]}>
                <span className={styles.tCells}>
                  {territory.cells.length} {territory.cells.length === 1 ? 'casella' : 'caselle'}
                </span>
                <span className={styles.tMath}>
                  {territory.base}
                  {territory.multiplier > 1 ? ` ×${territory.multiplier}` : ''}
                  {territory.sealFactor > 1 ? ` ×${territory.sealFactor}[sig]` : ''}
                  {territory.networkFactor > 1 ? ` ×${territory.networkFactor}[rete]` : ''}
                  {' = '}
                  <b className={territory.score < 0 ? styles.negative : undefined}>
                    {territory.score}
                  </b>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={styles.lesson}>
        <p className={styles.metricLabel}>Regola del livello</p>
        <p>{level.lesson}</p>
      </section>
    </aside>
  );
}

export const Hud = memo(HudComponent);
