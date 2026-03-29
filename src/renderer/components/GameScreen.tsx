import { ACHIEVEMENTS } from '../../shared/achievements';
import type { AchievementId, RunState, SaveData } from '../../shared/contracts';
import { useShallow } from 'zustand/react/shallow';
import OverlayModal from './OverlayModal';
import TileBoard from './TileBoard';
import { useViewportSize } from '../hooks/useViewportSize';
import styles from './GameScreen.module.css';
import { useAppStore } from '../store/useAppStore';

interface GameScreenProps {
    achievements: AchievementId[];
    run: RunState;
    saveData: SaveData;
    steamConnected: boolean;
}

const getPhaseCopy = (run: RunState): string => {
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
            return 'Stay sharp. Clean reads and streaks are worth more now.';
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
    const isSplitLayout = width > 1220;
    const boardHorizontalBudget = isCompact
        ? Math.max(180, width - (isTight ? 24 : 32))
        : isSplitLayout
          ? Math.max(320, width - 64 - 336)
          : Math.max(320, width - 64);
    const boardVerticalBudget = isCompact
        ? Math.max(180, height - (isTight ? 330 : 400))
        : Math.max(300, height - 340);

    if (!run.board) {
        return null;
    }

    const unlockedDefinitions = achievements
        .map((achievementId) => ACHIEVEMENTS.find((item) => item.id === achievementId))
        .filter((achievement): achievement is (typeof ACHIEVEMENTS)[number] => Boolean(achievement));
    const tileSize = Math.max(
        isCompact ? 48 : 64,
        Math.min(
            isCompact ? (isTight ? 96 : width <= 390 ? 112 : 120) : Number.POSITIVE_INFINITY,
            Math.floor(Math.min(boardHorizontalBudget / run.board.columns, boardVerticalBudget / run.board.rows))
        )
    );
    const boardStyle = {
        ['--board-width' as string]: `${tileSize * run.board.columns}px`,
        ['--board-height' as string]: `${tileSize * run.board.rows}px`
    };
    const metrics = isCompact
        ? isTight
            ? [
                  { label: 'Lives', value: run.lives },
                  { label: 'Run Score', value: run.stats.totalScore.toLocaleString() }
              ]
            : [
                  { label: 'Lives', value: run.lives },
                  { label: 'Run Score', value: run.stats.totalScore.toLocaleString() },
                  { label: 'Streak', value: run.stats.currentStreak },
                  { label: 'Best Score', value: saveData.bestScore.toLocaleString() }
              ]
        : [
              { label: 'Lives', value: run.lives },
              { label: 'Run Score', value: run.stats.totalScore.toLocaleString() },
              { label: 'Level Score', value: run.stats.currentLevelScore.toLocaleString() },
              { label: 'Streak', value: run.stats.currentStreak },
              { label: 'Mistakes', value: run.stats.tries },
              { label: 'Best Score', value: saveData.bestScore.toLocaleString() }
          ];
    const phaseCopy = getPhaseCopy(run);

    return (
        <section className={styles.shell}>
            <header className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>Arcade Expedition</p>
                    <h1 className={styles.title}>Level {run.board.level}</h1>
                    <p className={styles.statusLine}>
                        {steamConnected ? 'Steam bridge online' : 'Local desktop mode'} ·{' '}
                        {run.achievementsEnabled ? 'Achievements active' : 'Achievements disabled'}
                    </p>
                </div>

                <div className={styles.actions}>
                    <button
                        className={styles.actionButton}
                        onClick={run.status === 'paused' ? resume : pause}
                        type="button"
                    >
                        {run.status === 'paused' ? 'Resume' : 'Pause'}
                    </button>
                    <button className={styles.actionButton} onClick={() => openSettings('playing')} type="button">
                        Settings
                    </button>
                    {import.meta.env.DEV && settings.debugFlags.showDebugTools && settings.debugFlags.allowBoardReveal && (
                        <button className={styles.debugButton} onClick={triggerDebugReveal} type="button">
                            Reveal Board
                        </button>
                    )}
                </div>
            </header>

            <div className={styles.hudGrid}>
                {metrics.map((metric) => (
                    <article className={styles.metricCard} key={metric.label}>
                        <span className={styles.metricLabel}>{metric.label}</span>
                        <strong className={styles.metricValue}>{metric.value}</strong>
                    </article>
                ))}
            </div>

            <div className={styles.phaseBanner}>{phaseCopy}</div>

            <div className={styles.boardArea}>
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

                {!isCompact && (
                    <aside className={styles.sidePanel}>
                        <div className={styles.panelBlock}>
                            <span className={styles.panelLabel}>Pairs Remaining</span>
                            <strong className={styles.panelValue}>{run.board.pairCount - run.board.matchedPairs}</strong>
                            <p className={styles.panelCopy}>
                                Perfect floors restore one life. Mistakes break streaks and cost momentum.
                            </p>
                        </div>

                        <div className={styles.panelBlock}>
                            <span className={styles.panelLabel}>Run Stats</span>
                            <div className={styles.inlineStats}>
                                <div>
                                    <strong>{run.stats.matchesFound}</strong>
                                    <span>Matches</span>
                                </div>
                                <div>
                                    <strong>{run.stats.bestStreak}</strong>
                                    <span>Best Streak</span>
                                </div>
                                <div>
                                    <strong>{run.stats.perfectClears}</strong>
                                    <span>Perfect Floors</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.panelBlock}>
                            <span className={styles.panelLabel}>Controls</span>
                            <p className={styles.panelCopy}>Tap or click a tile to flip it.</p>
                        </div>

                        {unlockedDefinitions.length > 0 && (
                            <div className={styles.panelBlock}>
                                <span className={styles.panelLabel}>Unlocked This Turn</span>
                                <div className={styles.achievementRail}>
                                    {unlockedDefinitions.map((achievement) => (
                                        <article className={styles.achievementCard} key={achievement.id}>
                                            <strong>{achievement.title}</strong>
                                            <p>{achievement.description}</p>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                )}
            </div>

            {!isCompact && <p className={styles.footerHint}>Deeper floors rotate symbol themes and compress the memorize window.</p>}

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
                        <div>
                            <strong>{run.lastLevelResult.rating}</strong>
                            <span>Rating</span>
                        </div>
                        <div>
                            <strong>{run.lastLevelResult.mistakes}</strong>
                            <span>Mistakes</span>
                        </div>
                        <div>
                            <strong>{run.lastLevelResult.livesRemaining}</strong>
                            <span>Lives</span>
                        </div>
                        <div>
                            <strong>{run.stats.totalScore.toLocaleString()}</strong>
                            <span>Total</span>
                        </div>
                    </div>
                </OverlayModal>
            )}
        </section>
    );
};

export default GameScreen;
