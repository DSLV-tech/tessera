import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { canPlace, simulate } from '../domain/engine.ts';
import { LEVELS, MODE_LABEL } from '../domain/levels/index.ts';
import type { CellId, LevelDefinition, MedalTier } from '../domain/types.ts';
import { useGame } from '../state/useGame.ts';
import { haptic, sound } from '../audio/sound.ts';
import { loadSeenModes, markSeenMode } from '../state/storage.ts';
import { Board } from './Board.tsx';
import type { MovePreview } from './Board.tsx';
import { Hud } from './Hud.tsx';
import { Medal } from './Medal.tsx';
import { ResultOverlay } from './ResultOverlay.tsx';
import { TutorialOverlay } from './TutorialOverlay.tsx';
import styles from './GameView.module.css';

interface GameViewProps {
  readonly level: LevelDefinition;
  readonly onExit: () => void;
  readonly onResult: (levelId: string, tier: MedalTier) => void;
  readonly onAdvance: (level: LevelDefinition) => void;
}

function formatDelta(delta: number): string {
  return delta > 0 ? `+${delta}` : String(delta);
}

export default function GameView({
  level,
  onExit,
  onResult,
  onAdvance,
}: GameViewProps): React.JSX.Element {
  const game = useGame(level);
  const [hovered, setHovered] = useState<CellId | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(sound.enabled);
  // Il tutorial della modalità appare solo la prima volta che la si incontra.
  const [tutorialOpen, setTutorialOpen] = useState(() => !loadSeenModes().has(level.mode));

  const { load, state, sim, medal, resolve } = game;

  useEffect(() => {
    load(level);
    setHovered(null);
    setHintOpen(false);
  }, [level, load]);

  const resolved = state.status === 'resolved';

  // Feedback sonoro e tattile su posa e cattura, senza diffing esplicito dello stato.
  const prevMoves = useRef(0);
  const prevCaptured = useRef(0);
  useEffect(() => {
    const moves = state.moves.length;
    const captured = sim.captured.size;
    if (moves > prevMoves.current) {
      if (captured > prevCaptured.current) {
        sound.play('capture');
        haptic([12, 26, 18]);
      } else {
        sound.play('place');
        haptic(10);
      }
    }
    prevMoves.current = moves;
    prevCaptured.current = captured;
  }, [state.moves.length, sim.captured.size]);

  useEffect(() => {
    if (!resolved) return;
    onResult(state.level.id, medal);
    if (medal === 'gold') haptic([20, 40, 20, 40, 60]);
    else if (medal !== 'none') haptic([16, 30, 24]);
    sound.play(
      medal === 'gold'
        ? 'win-gold'
        : medal === 'silver'
          ? 'win-silver'
          : medal === 'bronze'
            ? 'win-bronze'
            : 'deny',
    );
  }, [resolved, medal, onResult, state.level.id]);

  const toggleSound = useCallback(() => {
    const next = !sound.enabled;
    sound.setEnabled(next);
    setSoundOn(next);
  }, []);

  const closeTutorial = useCallback(() => {
    markSeenMode(level.mode);
    setTutorialOpen(false);
  }, [level.mode]);

  const preview = useMemo<MovePreview | null>(() => {
    if (hovered === null || resolved || !canPlace(state.board, sim.claimed, sim.blight, hovered)) {
      return null;
    }
    const nextSim = simulate(state.board, [...state.moves, hovered]);
    return { cellId: hovered, delta: nextSim.score - sim.score, sim: nextSim };
  }, [hovered, resolved, sim, state.board, state.moves]);

  const handleHover = useCallback((id: CellId | null) => setHovered(id), []);

  const nextLevel = LEVELS[level.index] ?? null;
  const handleNext = useCallback(() => {
    if (nextLevel !== null) onAdvance(nextLevel);
  }, [nextLevel, onAdvance]);

  const { objective } = level;
  const previewDelta = preview?.delta ?? null;

  return (
    <main className={styles.layout}>
      <header className={styles.statusbar}>
        <div className={styles.sbLeft}>
          <button type="button" className={styles.back} onClick={onExit} aria-label="Torna alla mappa">
            ←
          </button>
          <div className={styles.sbHead}>
            <p className={styles.sbEyebrow}>
              {MODE_LABEL[level.mode]} · {level.index}/{LEVELS.length}
            </p>
            <h1 className={styles.sbTitle}>{level.name}</h1>
          </div>
        </div>

        <div className={styles.sbStats}>
          <div className={styles.sbBlock}>
            <span className={styles.sbLabel}>
              {objective.kind === 'exact' ? `Punti → ${objective.target}` : 'Punti'}
            </span>
            <span className={styles.sbScore}>
              <span key={sim.score} className={styles.scoreNum}>
                {sim.score}
              </span>
              {previewDelta !== null && previewDelta !== 0 ? (
                <span className={previewDelta > 0 ? styles.deltaUp : styles.deltaDown}>
                  {formatDelta(previewDelta)}
                </span>
              ) : null}
            </span>
          </div>
          <div className={`${styles.sbBlock} ${styles.sbRight}`}>
            <span className={styles.sbLabel}>Pedine</span>
            <span className={styles.sbStones}>
              {state.stonesLeft}
              <span className={styles.sbOf}>/{level.stones}</span>
            </span>
          </div>
          <button
            type="button"
            className={styles.soundBtn}
            onClick={() => setTutorialOpen(true)}
            aria-label="Come si gioca questa modalità"
            title="Come si gioca"
          >
            ?
          </button>
          <button
            type="button"
            className={styles.soundBtn}
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Disattiva il suono' : 'Attiva il suono'}
            title={soundOn ? 'Suono attivo' : 'Suono spento'}
          >
            {soundOn ? '♪' : '⊘'}
          </button>
          <div className={styles.sbMedal} aria-hidden="true">
            <Medal tier={medal} size={26} />
          </div>
        </div>
      </header>

      {hintOpen ? <p className={styles.hint}>{level.hint}</p> : null}

      <div className={styles.stage}>
        <Board
          board={state.board}
          sim={sim}
          preview={preview}
          interactive={!resolved && state.stonesLeft > 0}
          onPlace={game.place}
          onHover={handleHover}
        />
        <Hud level={level} sim={sim} medal={medal} stonesUsed={state.moves.length} />
      </div>

      <footer className={styles.actionbar}>
        <button
          type="button"
          className={styles.action}
          onClick={() => setHintOpen((open) => !open)}
          aria-expanded={hintOpen}
        >
          {hintOpen ? 'Nascondi' : 'Indizio'}
        </button>
        <button type="button" className={styles.action} onClick={game.undo} disabled={!game.canUndo}>
          Annulla
        </button>
        <button type="button" className={styles.action} onClick={game.reset}>
          Ricomincia
        </button>
        <button
          type="button"
          className={styles.confirm}
          onClick={resolve}
          disabled={resolved || state.moves.length === 0}
        >
          Chiudi
        </button>
      </footer>

      {resolved ? (
        <ResultOverlay
          level={level}
          score={sim.score}
          stonesUsed={state.moves.length}
          medal={medal}
          hasNext={nextLevel !== null}
          onRetry={game.reset}
          onNext={handleNext}
          onMap={onExit}
        />
      ) : null}

      {tutorialOpen ? <TutorialOverlay mode={level.mode} onClose={closeTutorial} /> : null}
    </main>
  );
}
