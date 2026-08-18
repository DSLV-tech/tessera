import { Suspense, lazy, useCallback, useState } from 'react';
import { LEVELS } from './domain/levels/index.ts';
import type { LevelDefinition, MedalTier } from './domain/types.ts';
import { useCampaign } from './state/useCampaign.ts';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { Loader } from './components/Loader.tsx';
import { LevelSelect } from './components/LevelSelect.tsx';

const GameView = lazy(() => import('./components/GameView.tsx'));

export function App(): React.JSX.Element {
  const campaign = useCampaign();
  const [current, setCurrent] = useState<LevelDefinition | null>(null);

  const handleSelect = useCallback((level: LevelDefinition) => setCurrent(level), []);
  const handleExit = useCallback(() => setCurrent(null), []);
  const handleResult = useCallback(
    (levelId: string, tier: MedalTier) => campaign.record(levelId, tier),
    [campaign],
  );

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        {current === null ? (
          <LevelSelect
            progress={campaign.progress}
            medalsWon={campaign.medalsWon}
            completed={campaign.completed}
            isUnlocked={campaign.isUnlocked}
            persistent={campaign.persistent}
            onSelect={handleSelect}
            onReset={campaign.resetProgress}
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
    </ErrorBoundary>
  );
}

export const TOTAL_LEVELS = LEVELS.length;
