import { ACHIEVEMENTS } from '../../shared/achievements';
import type { AchievementId, RunState, SaveData } from '../../shared/contracts';
import { useShallow } from 'zustand/react/shallow';
import { useViewportSize } from '../hooks/useViewportSize';
import { StatTile, UiButton } from '../ui';
import { useAppStore } from '../store/useAppStore';
import OverlayModal from './OverlayModal';
import TileBoard from './TileBoard';
import styles from './GameScreen.module.css';

interface GameScreenProps {
    achievements: AchievementId[];
    run: RunState;
    saveData: SaveData;
    steamConnected: boolean;
}

const getPhaseDetail = (run: RunState): string => {
    switch (run.status) {
        case 'memorize':
            return 'Memorize the layout before the veil drops.';
        case 'resolving':
            return 'Hold steady. The board is resolving.';
        case 'paused':
            return 'Run paused. Resume when ready.';
        case 'levelComplete':
            return 'Floor cleared. Bank the bonus and descend.';
        case 'gameOver':
            return 'Expedition complete.';
        default:
            return 'Find pairs. Streaks earn guards and extra lives.';
    }
};

const getPhaseLabel = (run: RunState): string => {
    switch (run.status) {
        case 'memorize':
            return 'Memorize';
        case 'resolving':
            return 'Resolving';
        case 'paused':
            return 'Paused';
        case 'levelComplete':
            return 'Cleared';
        case 'gameOver':
            return 'Over';
        default:
            return 'Play';
    }
};

const GameScreen = ({ achievements, run, saveData, steamConnected }: GameScreenProps) => {
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
    const isCompact = width <= 760 || height <= 760;
    const isTight = width <= 430 || height <= 620;

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
    const extraMetrics = isTight
        ? []
        : isCompact
          ? [
                { label: 'Streak', value: run.stats.currentStreak },
                { label: 'Best', value: saveData.bestScore.toLocaleString() }
            ]
          : [
                { label: 'Floor pts', value: run.stats.currentLevelScore.toLocaleString() },
                { label: 'Streak', value: run.stats.currentStreak },
                { label: 'Miss', value: run.stats.tries },
                { label: 'Best', value: saveData.bestScore.toLocaleString() }
            ];
    const phaseDetail = getPhaseDetail(run);
    const phaseLabel = getPhaseLabel(run);
    const phaseState =
        run.status === 'memorize'
            ? 'memorize'
            : run.status === 'resolving'
              ? 'resolving'
              : run.status === 'paused'
                ? 'paused'
                : run.status === 'levelComplete'
                  ? 'cleared'
                  : run.status === 'gameOver'
                    ? 'over'
                    : 'play';

    return (
        <section className={styles.shell}>
            <h1 className={styles.srOnly}>Level {run.board.level}</h1>
            <header className={styles.topDeck}>
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
                    <div
                        className={styles.phaseChip}
                        data-phase={phaseState}
                        title={phaseDetail}
                    >
                        <span className={styles.phaseLabel}>{phaseLabel}</span>
                        <span className={styles.phaseHint}>{phaseDetail}</span>
                    </div>
                </div>

                <div className={styles.deckActions}>
                    {extraMetrics.length > 0 ? (
                        <details className={styles.moreStats}>
                            <summary className={styles.moreStatsSummary}>+ Stats</summary>
                            <div className={styles.moreStatsGrid}>
                                {extraMetrics.map((m) => (
                                    <div className={styles.moreStatsRow} key={m.label}>
                                        <span>{m.label}</span>
                                        <strong>{m.value}</strong>
                                    </div>
                                ))}
                            </div>
                        </details>
                    ) : null}
                    <details className={styles.sessionFold}>
                        <summary className={styles.sessionSummary}>Session</summary>
                        <div className={styles.sessionBody}>
                            <p>{steamConnected ? 'Steam' : 'Local save'}</p>
                            <p>{run.achievementsEnabled ? 'Achievements on' : 'Achievements off'}</p>
                        </div>
                    </details>
                    <UiButton size="sm" variant="secondary" onClick={run.status === 'paused' ? resume : pause}>
                        {run.status === 'paused' ? 'Resume' : 'Pause'}
                    </UiButton>
                    <UiButton size="sm" variant="secondary" onClick={() => openSettings('playing')}>
                        Settings
                    </UiButton>
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

            {run.status === 'paused' && (
                <OverlayModal
                    actions={[
                        { label: 'Resume', onClick: resume, variant: 'primary' },
                        { label: 'Settings', onClick: () => openSettings('playing'), variant: 'secondary' },
                        { label: 'Retreat', onClick: goToMenu, variant: 'danger' }
                    ]}
                    subtitle="The board, memorize phase, and debug timers are frozen until you return."
                    title="Run Paused"
                />
            )}

            {run.status === 'levelComplete' && run.lastLevelResult && (
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
                            density="modalChild"
                            label="Rating"
                            value={run.lastLevelResult.rating}
                            valueFirst
                        />
                        <StatTile
                            density="modalChild"
                            label="Mistakes"
                            value={run.lastLevelResult.mistakes}
                            valueFirst
                        />
                        <StatTile
                            density="modalChild"
                            label="Lives"
                            value={run.lastLevelResult.livesRemaining}
                            valueFirst
                        />
                        <StatTile
                            density="modalChild"
                            label="Total"
                            value={run.stats.totalScore.toLocaleString()}
                            valueFirst
                        />
                    </div>
                </OverlayModal>
            )}
        </section>
    );
};

export default GameScreen;
