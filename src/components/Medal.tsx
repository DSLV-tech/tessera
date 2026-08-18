import type { MedalTier } from '../domain/types.ts';
import { MEDAL_LABEL } from '../domain/labels.ts';

const COLORS: Readonly<Record<MedalTier, string>> = {
  none: 'rgba(239, 228, 205, 0.22)',
  bronze: 'var(--bronze)',
  silver: 'var(--silver)',
  gold: 'var(--brass-100)',
};

interface MedalProps {
  readonly tier: MedalTier;
  readonly size?: number;
}

export function Medal({ tier, size = 22 }: MedalProps): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label={MEDAL_LABEL[tier]}
      style={{ display: 'block' }}
    >
      <circle cx="12" cy="12" r="9" fill={COLORS[tier]} opacity={tier === 'none' ? 0.5 : 1} />
      <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="1" />
      <circle cx="12" cy="12" r="5.4" fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="1" />
      <path d="M12 8.4l1.1 2.3 2.5.35-1.8 1.75.43 2.5L12 14.13l-2.23 1.17.43-2.5-1.8-1.75 2.5-.35z" fill="rgba(0,0,0,0.3)" />
    </svg>
  );
}
