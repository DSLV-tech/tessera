import styles from './BrandLoader.module.css';

/** I sei tasselli del marchio (geometria full-bleed), colori delle sei modalità. */
const SHARDS: readonly { points: string; color: string }[] = [
  { points: '0,0 179.2,0 167.04,242.94 0,230.4', color: '#f0d47a' },
  { points: '179.2,0 332.8,0 345.6,256 167.04,242.94', color: '#4aa88c' },
  { points: '332.8,0 512,0 512,268.8 345.6,256', color: '#c94c4c' },
  { points: '0,230.4 167.04,242.94 153.6,512 0,512', color: '#a487d8' },
  { points: '167.04,242.94 345.6,256 358.4,512 153.6,512', color: '#6f97cc' },
  { points: '345.6,256 512,268.8 512,512 358.4,512', color: '#d98ab0' },
];

/** Linee di fuga interne (senza bordo esterno). */
const SEAMS: readonly string[] = [
  'M 179.2,0 L 167.04,242.94 L 153.6,512',
  'M 332.8,0 L 345.6,256 L 358.4,512',
  'M 0,230.4 L 167.04,242.94 L 345.6,256 L 512,268.8',
];

interface BrandLoaderProps {
  readonly caption?: string;
  readonly compact?: boolean;
}

export function BrandLoader({
  caption = 'Caricamento…',
  compact = false,
}: BrandLoaderProps): React.JSX.Element {
  return (
    <div className={compact ? styles.wrapCompact : styles.wrap} role="status" aria-live="polite">
      <svg className={styles.mark} viewBox="0 0 512 512" width="128" height="128" aria-hidden="true">
        <defs>
          <clipPath id="loaderRound">
            <rect x="0" y="0" width="512" height="512" rx="96" />
          </clipPath>
          <linearGradient id="loaderGloss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.42" />
            <stop offset="0.34" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g clipPath="url(#loaderRound)">
          {SHARDS.map((shard, i) => (
            <polygon
              key={shard.points}
              className={styles.shard}
              style={{ animationDelay: `${i * 0.13}s` }}
              points={shard.points}
              fill={shard.color}
            />
          ))}
          <rect x="0" y="0" width="512" height="512" fill="url(#loaderGloss)" />
          {SEAMS.map((d) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke="#0a0705"
              strokeOpacity="0.9"
              strokeWidth="9"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
        </g>
        <rect
          x="1.5"
          y="1.5"
          width="509"
          height="509"
          rx="95"
          fill="none"
          stroke="#000"
          strokeOpacity="0.3"
          strokeWidth="2"
        />
      </svg>
      {!compact ? <p className={styles.word}>TESSERA</p> : null}
      <p className={styles.caption}>{caption}</p>
    </div>
  );
}
