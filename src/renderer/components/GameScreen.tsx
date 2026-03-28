import { ACHIEVEMENTS } from '../../shared/achievements';
import type { AchievementId, RunState, SaveData } from '../../shared/contracts';
import { useShallow } from 'zustand/react/shallow';
import OverlayModal from './OverlayModal';
import TileBoard from './TileBoard';
import styles from './GameScreen.module.css';
import { useAppStore } from '../store/useAppStore';

interface GameScreenProps {
    achievements: AchievementId[];
    run: RunState;
    saveData: SaveData;
    steamConnected: boolean;
}

const GameScreen = ({ achievements, run, saveData, steamConnected }: GameScreenProps) => {
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

    if (!run.board) {
        return null;
    }

    const unlockedDefinitions = achievements
        .map((achievementId) => ACHIEVEMENTS.find((item) => item.id === achievementId))
        .filter((achievement): achievement is (typeof ACHIEVEMENTS)[number] => Boolean(achievement));

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
                <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Lives</span>
                    <strong className={styles.metricValue}>{run.lives}</strong>
                </article>
                <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Score</span>
                    <strong className={styles.metricValue}>{run.stats.totalScore.toLocaleString()}</strong>
                </article>
                <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Level Rating</span>
                    <strong className={styles.metricValue}>{run.stats.rating}</strong>
                </article>
                <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Mistakes</span>
                    <strong className={styles.metricValue}>{run.stats.tries}</strong>
                </article>
                <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Best Score</span>
                    <strong className={styles.metricValue}>{saveData.bestScore.toLocaleString()}</strong>
                </article>
            </div>

            <div className={styles.boardArea}>
                <TileBoard
                    board={run.board}
                    debugPeekActive={run.debugPeekActive}
                    onTileSelect={(tileId) => {
                        if (run.status === 'playing') {
                            pressTile(tileId);
                        }
                    }}
                />

                <aside className={styles.sidePanel}>
                    <div className={styles.panelBlock}>
                        <span className={styles.panelLabel}>Pairs Remaining</span>
                        <strong className={styles.panelValue}>{run.board.pairCount - run.board.matchedPairs}</strong>
                        <p className={styles.panelCopy}>Clear the board to descend deeper and bank the level score.</p>
                    </div>

                    <div className={styles.panelBlock}>
                        <span className={styles.panelLabel}>Run Stats</span>
                        <div className={styles.inlineStats}>
                            <div>
                                <strong>{run.stats.matchesFound}</strong>
                                <span>Matches</span>
                            </div>
                            <div>
                                <strong>{run.stats.mismatches}</strong>
                                <span>Mismatches</span>
                            </div>
                            <div>
                                <strong>{run.stats.highestLevel}</strong>
                                <span>Highest</span>
                            </div>
                        </div>
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
            </div>

            <p className={styles.footerHint}>
                Match fast and stay clean. Each mistake drops a life and drags your level rating down.
            </p>

            {run.status === 'paused' && (
                <OverlayModal
                    actions={[
                        { label: 'Resume', onClick: resume, variant: 'primary' },
                        { label: 'Settings', onClick: () => openSettings('playing'), variant: 'secondary' },
                        { label: 'Retreat', onClick: goToMenu, variant: 'danger' }
                    ]}
                    subtitle="The board is frozen until you return."
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
