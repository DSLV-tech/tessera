import { Suspense, lazy, useCallback, useMemo, useState } from 'react';
import { LEVELS } from './domain/levels/index.ts';
import type { LevelDefinition, MedalTier } from './domain/types.ts';
import { useCampaign } from './state/useCampaign.ts';
import { useDaily } from './state/useDaily.ts';
import { loadLegalAck, writeLegalAck } from './state/storage.ts';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { BrandLoader } from './components/BrandLoader.tsx';
import { Splash } from './components/Splash.tsx';
import { LevelSelect } from './components/LevelSelect.tsx';
import { ConsentBanner } from './components/ConsentBanner.tsx';
import { PrivacyOverlay } from './components/PrivacyOverlay.tsx';
import { SpriteSheet } from './components/SpriteSheet.tsx';
import { UpdateToast } from './components/UpdateToast.tsx';

const GameView = lazy(() => import('./components/GameView.tsx'));

export function App(): React.JSX.Element {
  const campaign = useCampaign();
  // Fissato al montaggio: la data non deve cambiare sotto i piedi a metà partita.
  const today = useMemo(() => Date.now(), []);
  const daily = useDaily(today);
  const [current, setCurrent] = useState<LevelDefinition | null>(null);
  const isDaily = current !== null && current.index === 0;
  const [legalAck, setLegalAck] = useState(() => loadLegalAck());
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const handleSelect = useCallback((level: LevelDefinition) => setCurrent(level), []);
  const handleExit = useCallback(() => setCurrent(null), []);
  const handleResult = useCallback(
    (levelId: string, tier: MedalTier, score: number) => {
      // L'indice 0 identifica il livello del giorno: i suoi esiti vanno in un
      // archivio separato, altrimenti inquinerebbero il conteggio di campagna.
      if (levelId.startsWith('daily-')) campaign.recordDaily(levelId, tier, score);
      else campaign.record(levelId, tier, score);
    },
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
      <SpriteSheet />
      <Splash />
      <Suspense fallback={<BrandLoader compact />}>
        {current === null ? (
          <LevelSelect
            progress={campaign.progress}
            records={campaign.records}
            dailyStatus={daily.status}
            dailyLevel={daily.level}
            dailyResult={daily.level === null ? undefined : campaign.daily[daily.level.id]}
            totalBest={campaign.totalBest}
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
            previousBest={
              (isDaily ? campaign.daily[current.id]?.best : campaign.records[current.id]?.best) ??
              null
            }
            onExit={handleExit}
            onResult={handleResult}
            onAdvance={handleSelect}
          />
        )}
      </Suspense>

      <UpdateToast />
      {!legalAck ? <ConsentBanner onAccept={acceptLegal} onDetails={openPrivacy} /> : null}
      {privacyOpen ? <PrivacyOverlay onClose={closePrivacy} /> : null}
    </ErrorBoundary>
  );
}

export const TOTAL_LEVELS = LEVELS.length;
