import { Suspense, lazy, useCallback, useState } from 'react';
import { LEVELS } from './domain/levels/index.ts';
import type { LevelDefinition, MedalTier } from './domain/types.ts';
import { useCampaign } from './state/useCampaign.ts';
import { loadLegalAck, writeLegalAck } from './state/storage.ts';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { BrandLoader } from './components/BrandLoader.tsx';
import { Splash } from './components/Splash.tsx';
import { LevelSelect } from './components/LevelSelect.tsx';
import { ConsentBanner } from './components/ConsentBanner.tsx';
import { PrivacyOverlay } from './components/PrivacyOverlay.tsx';

const GameView = lazy(() => import('./components/GameView.tsx'));

export function App(): React.JSX.Element {
  const campaign = useCampaign();
  const [current, setCurrent] = useState<LevelDefinition | null>(null);
  const [legalAck, setLegalAck] = useState(() => loadLegalAck());
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const handleSelect = useCallback((level: LevelDefinition) => setCurrent(level), []);
  const handleExit = useCallback(() => setCurrent(null), []);
  const handleResult = useCallback(
    (levelId: string, tier: MedalTier) => campaign.record(levelId, tier),
    [campaign],
  );
  const acceptLegal = useCallback(() => {
    writeLegalAck();
    setLegalAck(true);
  }, []);
  const openPrivacy = useCallback(() => setPrivacyOpen(true), []);
  const closePrivacy = useCallback(() => setPrivacyOpen(false), []);

  return (
    <ErrorBoundary>
      <Splash />
      <Suspense fallback={<BrandLoader compact />}>
        {current === null ? (
          <LevelSelect
            progress={campaign.progress}
            medalsWon={campaign.medalsWon}
            completed={campaign.completed}
            isUnlocked={campaign.isUnlocked}
            persistent={campaign.persistent}
            onSelect={handleSelect}
            onReset={campaign.resetProgress}
            onPrivacy={openPrivacy}
          />
        ) : (
          <GameView
            key={current.id}
            level={current}
            onExit={handleExit}
            onResult={handleResult}
            onAdvance={handleSelect}
          />
        )}
      </Suspense>

      {!legalAck ? <ConsentBanner onAccept={acceptLegal} onDetails={openPrivacy} /> : null}
      {privacyOpen ? <PrivacyOverlay onClose={closePrivacy} /> : null}
    </ErrorBoundary>
  );
}

export const TOTAL_LEVELS = LEVELS.length;
