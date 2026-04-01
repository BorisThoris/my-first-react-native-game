import { ACHIEVEMENTS } from '../../shared/achievements';
import type { AchievementId, RunState } from '../../shared/contracts';
import { useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useViewportSize } from '../hooks/useViewportSize';
import { usePlatformTiltField } from '../platformTilt/usePlatformTiltField';
import { StatTile, UiButton } from '../ui';
import { useAppStore } from '../store/useAppStore';
import MainMenuBackground from './MainMenuBackground';
import OverlayModal from './OverlayModal';
import TileBoard from './TileBoard';
import styles from './GameScreen.module.css';

interface GameScreenProps {
    achievements: AchievementId[];
    run: RunState;
    suppressStatusOverlays?: boolean;
}

const PauseIcon = () => (
    <svg aria-hidden="true" className={styles.actionIcon} viewBox="0 0 24 24">
        <path d="M8 5.5v13" />
        <path d="M16 5.5v13" />
    </svg>
);

const PlayIcon = () => (
    <svg aria-hidden="true" className={styles.actionIcon} viewBox="0 0 24 24">
        <path d="M9 7.25 17 12l-8 4.75V7.25Z" fill="currentColor" stroke="none" />
    </svg>
);

const SettingsIcon = () => (
    <svg aria-hidden="true" className={styles.actionIcon} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3.25" />
        <circle cx="12" cy="12" r="6.4" />
        <path d="M12 2.75v2.2" />
        <path d="M12 19.05v2.2" />
        <path d="m4.93 4.93 1.56 1.56" />
        <path d="m17.51 17.51 1.56 1.56" />
        <path d="M2.75 12h2.2" />
        <path d="M19.05 12h2.2" />
        <path d="m4.93 19.07 1.56-1.56" />
        <path d="m17.51 6.49 1.56-1.56" />
    </svg>
);

const GameScreen = ({ achievements, run, suppressStatusOverlays = false }: GameScreenProps) => {
    const shellRef = useRef<HTMLElement | null>(null);
    const { height, width } = useViewportSize();
    const { continueToNextLevel, goToMenu, openSettings, pause, pressTile, resume, settings, triggerDebugReveal } =
        useAppStore(
            useShallow((state) => ({
                continueToNextLevel: state.continueToNextLevel,
                goToMenu: state.goToMenu,
                openSettings: state.openSettings,
                pause: state.pause,
                pressTile: state.pressTile,
                resume: state.resume,
                settings: state.settings,
                triggerDebugReveal: state.triggerDebugReveal
            }))
    );
    const { tiltRef: gameFieldTiltRef } = usePlatformTiltField({
        enabled: true,
        reduceMotion: settings.reduceMotion,
        surfaceRef: shellRef,
        strength: 1
    });
    const isCompact = width <= 760 || height <= 760;
    const isTight = width <= 430 || height <= 620;
    const pauseActionLabel = run.status === 'paused' ? 'Resume' : 'Pause';

    if (!run.board) {
        return null;
    }

    const unlockedDefinitions = achievements
        .map((achievementId) => ACHIEVEMENTS.find((item) => item.id === achievementId))
        .filter((achievement): achievement is (typeof ACHIEVEMENTS)[number] => Boolean(achievement));
    const cols = run.board.columns;
    const rows = run.board.rows;
    /** Tight reserve → larger tiles; flex boardStage still absorbs leftover vertical space under the deck. */
    const deckReserve = isCompact ? (isTight ? 100 : 118) : 82;
    const boardHorizontalBudget = Math.max(160, width - (isTight ? 10 : 16));
    const boardVerticalBudget = Math.max(200, height - deckReserve);
    const tileSize = Math.max(
        isCompact ? 48 : 56,
        Math.min(
            isCompact ? (isTight ? 96 : width <= 390 ? 112 : 120) : Number.POSITIVE_INFINITY,
            Math.floor(Math.min(boardHorizontalBudget / cols, boardVerticalBudget / rows))
        )
    );
    const boardStyle = {
        ['--board-width' as string]: `${tileSize * cols}px`,
        ['--board-height' as string]: `${tileSize * rows}px`
    };
    return (
        <section className={styles.shell} ref={shellRef}>
            <MainMenuBackground
                fieldTiltRef={gameFieldTiltRef}
                height={height}
                reduceMotion={settings.reduceMotion}
                width={width}
            />
            <div className={styles.gameForeground}>
                <h1 className={styles.srOnly}>Level {run.board.level}</h1>
                <header className={styles.hudRow}>
                    <div className={`${styles.floatingDeck} ${styles.statsDeck}`}>
                        <div className={styles.deckCluster}>
                            <div className={styles.floorBadge} title="Current floor">
                                <span className={styles.floorLabel}>Floor</span>
                                <span className={styles.floorValue}>{run.board.level}</span>
                            </div>
                            <div className={styles.statRail} role="group" aria-label="Run stats">
                                <div className={styles.statPill}>
                                    <span className={styles.statKey}>Lives</span>
                                    <span className={styles.statVal}>{run.lives}</span>
                                </div>
                                <div className={styles.statPill}>
                                    <span className={styles.statKey}>Guards</span>
                                    <span className={styles.statVal}>{run.stats.guardTokens}</span>
                                </div>
                                <div className={styles.statPill}>
                                    <span className={styles.statKey}>Score</span>
                                    <span className={styles.statVal}>{run.stats.totalScore.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.actionControls} role="group" aria-label="Game controls">
                        <button
                            aria-label={pauseActionLabel}
                            className={styles.iconAction}
                            onClick={run.status === 'paused' ? resume : pause}
                            title={pauseActionLabel}
                            type="button"
                        >
                            {run.status === 'paused' ? <PlayIcon /> : <PauseIcon />}
                        </button>
                        <button
                            aria-label="Settings"
                            className={styles.iconAction}
                            onClick={() => openSettings('playing')}
                            title="Settings"
                            type="button"
                        >
                            <SettingsIcon />
                        </button>
                        {import.meta.env.DEV && settings.debugFlags.showDebugTools && settings.debugFlags.allowBoardReveal && (
                            <UiButton size="sm" variant="debug" onClick={triggerDebugReveal}>
                                Reveal
                            </UiButton>
                        )}
                    </div>
                </header>

                <div className={styles.boardStage}>
                    <div className={styles.boardGlow} aria-hidden="true" />
                    <TileBoard
                        board={run.board}
                        debugPeekActive={run.debugPeekActive}
                        interactive={run.status === 'playing'}
                        frameStyle={boardStyle}
                        onTileSelect={(tileId) => {
                            if (run.status === 'playing') {
                                pressTile(tileId);
                            }
                        }}
                        previewActive={run.status === 'memorize'}
                        reduceMotion={settings.reduceMotion}
                    />
                    {unlockedDefinitions.length > 0 ? (
                        <div className={styles.toastRail} role="status">
                            {unlockedDefinitions.map((a) => (
                                <div className={styles.toast} key={a.id}>
                                    <span className={styles.toastTitle}>{a.title}</span>
                                    <span className={styles.toastDesc}>{a.description}</span>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>

                {!suppressStatusOverlays && run.status === 'paused' && (
                    <OverlayModal
                        actions={[
                            { label: 'Resume', onClick: resume, variant: 'primary' },
                            { label: 'Retreat', onClick: goToMenu, variant: 'danger' }
                        ]}
                        subtitle="The board, memorize phase, and debug timers are frozen until you return."
                        title="Run Paused"
                    />
                )}

                {!suppressStatusOverlays && run.status === 'levelComplete' && run.lastLevelResult && (
                    <OverlayModal
                        actions={[
                            { label: 'Continue', onClick: continueToNextLevel, variant: 'primary' },
                            { label: 'Main Menu', onClick: goToMenu, variant: 'secondary' }
                        ]}
                        subtitle={`Level ${run.lastLevelResult.level} cleared. Score +${run.lastLevelResult.scoreGained}.`}
                        title="Floor Cleared"
                    >
                        <div className={styles.modalStats}>
                            <StatTile
                                density="minimal"
                                label="Rating"
                                value={run.lastLevelResult.rating}
                                valueFirst
                            />
                            <StatTile
                                density="minimal"
                                label="Mistakes"
                                value={run.lastLevelResult.mistakes}
                                valueFirst
                            />
                            <StatTile
                                density="minimal"
                                label="Lives"
                                value={run.lastLevelResult.livesRemaining}
                                valueFirst
                            />
                            <StatTile
                                density="minimal"
                                label="Total"
                                value={run.stats.totalScore.toLocaleString()}
                                valueFirst
                            />
                        </div>
                    </OverlayModal>
                )}
            </div>
        </section>
    );
};

export default GameScreen;
