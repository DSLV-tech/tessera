import styles from './BrandLoader.module.css';

/** I sei tasselli del marchio, con i colori delle sei modalità. */
const SHARDS: readonly { points: string; color: string }[] = [
  { points: '56,56 196,56 186.5,245.8 56,236', color: '#f0d47a' },
  { points: '196,56 316,56 326,256.25 186.5,245.8', color: '#4aa88c' },
  { points: '316,56 456,56 456,266 326,256.25', color: '#c94c4c' },
  { points: '56,236 186.5,245.8 176,456 56,456', color: '#a487d8' },
  { points: '186.5,245.8 326,256.25 336,456 176,456', color: '#6f97cc' },
  { points: '326,256.25 456,266 456,456 336,456', color: '#d98ab0' },
];

interface BrandLoaderProps {
  readonly caption?: string;
  /** true = versione compatta (fallback Suspense), false = splash a schermo intero. */
  readonly compact?: boolean;
}

export function BrandLoader({
  caption = 'Caricamento…',
  compact = false,
}: BrandLoaderProps): React.JSX.Element {
  return (
    <div className={compact ? styles.wrapCompact : styles.wrap} role="status" aria-live="polite">
      <svg
        className={styles.mark}
        viewBox="0 0 512 512"
        width="128"
        height="128"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="loaderRound">
            <rect x="40" y="40" width="432" height="432" rx="96" />
          </clipPath>
          <linearGradient id="loaderSheen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="1" stopColor="#000000" stopOpacity="0.14" />
          </linearGradient>
        </defs>
        <g clipPath="url(#loaderRound)">
          <rect x="40" y="40" width="432" height="432" fill="#0d0906" />
          {SHARDS.map((shard, i) => (
            <g key={shard.points} className={styles.shard} style={{ animationDelay: `${i * 0.13}s` }}>
              <polygon points={shard.points} fill={shard.color} />
              <polygon points={shard.points} fill="url(#loaderSheen)" />
            </g>
          ))}
          {SHARDS.map((shard) => (
            <polygon
              key={`g-${shard.points}`}
              points={shard.points}
              fill="none"
              stroke="#0d0906"
              strokeWidth="7"
              strokeLinejoin="round"
            />
          ))}
        </g>
        <rect
          x="40.5"
          y="40.5"
          width="431"
          height="431"
          rx="95"
          fill="none"
          stroke="#000"
          strokeOpacity="0.45"
          strokeWidth="1.5"
        />
      </svg>
      {!compact ? <p className={styles.word}>TESSERA</p> : null}
      <p className={styles.caption}>{caption}</p>
    </div>
  );
}
