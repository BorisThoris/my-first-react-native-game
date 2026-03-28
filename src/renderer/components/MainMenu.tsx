import type { RunSummary } from '../../shared/contracts';
import styles from './MainMenu.module.css';

interface MainMenuProps {
    bestScore: number;
    lastRunSummary: RunSummary | null;
    steamConnected: boolean;
    showHowToPlay: boolean;
    onDismissHowToPlay: () => Promise<void>;
    onPlay: () => void;
    onOpenSettings: () => void;
}

const MainMenu = ({
    bestScore,
    lastRunSummary,
    steamConnected,
    showHowToPlay,
    onDismissHowToPlay,
    onPlay,
    onOpenSettings
}: MainMenuProps) => (
    <section className={styles.shell}>
        <div className={styles.hero}>
            <p className={styles.eyebrow}>Steam Demo Build</p>
            <h1 className={styles.title}>Memory Dungeon</h1>
            <p className={styles.lead}>
                A desktop-first arcade run built around fast reads, climbing pressure, and how cleanly you can keep a
                streak alive.
            </p>

            <div className={styles.actions}>
                <button className={`${styles.button} ${styles.primary}`} onClick={onPlay} type="button">
                    Play Arcade
                </button>
                <button className={`${styles.button} ${styles.secondary}`} onClick={onOpenSettings} type="button">
                    Settings
                </button>
            </div>

            <p className={styles.controls}>Arrow keys move focus. Enter or Space flips. Escape pauses.</p>

            {showHowToPlay && (
                <aside className={styles.guideCard}>
                    <div>
                        <p className={styles.guideEyebrow}>How To Play</p>
                        <h2 className={styles.guideTitle}>Memorize fast, play clean, protect the streak.</h2>
                    </div>

                    <div className={styles.guideGrid}>
                        <div>
                            <strong>1. Read the board</strong>
                            <p>Each level opens with a short memorize window before the tiles hide again.</p>
                        </div>
                        <div>
                            <strong>2. Keep the chain</strong>
                            <p>Matches award immediate score and streak bonus. Mistakes break the chain.</p>
                        </div>
                        <div>
                            <strong>3. Perfect floors heal</strong>
                            <p>There is no life gain per match. Clear a floor with zero mistakes to recover one life.</p>
                        </div>
                    </div>

                    <button className={styles.dismissButton} onClick={() => void onDismissHowToPlay()} type="button">
                        Dismiss
                    </button>
                </aside>
            )}
        </div>

        <div className={styles.grid}>
            <article className={styles.card}>
                <span className={styles.label}>Best Score</span>
                <strong className={styles.value}>{bestScore.toLocaleString()}</strong>
                <p className={styles.subtext}>Stored locally and carried across runs.</p>
            </article>

            <article className={styles.card}>
                <span className={styles.label}>Steam Status</span>
                <strong className={steamConnected ? styles.good : styles.warn}>
                    {steamConnected ? 'Connected' : 'Local Dev Mode'}
                </strong>
                <p className={styles.subtext}>
                    {steamConnected
                        ? 'Achievements can unlock through Steamworks.'
                        : 'The mock adapter is active. Desktop save data still works.'}
                </p>
            </article>

            <article className={`${styles.card} ${styles.wide}`}>
                <span className={styles.label}>Last Expedition</span>
                {lastRunSummary ? (
                    <>
                        <div className={styles.summaryGrid}>
                            <div>
                                <strong className={styles.value}>{lastRunSummary.totalScore.toLocaleString()}</strong>
                                <span className={styles.metricLabel}>Total Score</span>
                            </div>
                            <div>
                                <strong className={styles.value}>{lastRunSummary.levelsCleared}</strong>
                                <span className={styles.metricLabel}>Floors Cleared</span>
                            </div>
                            <div>
                                <strong className={styles.value}>{lastRunSummary.highestLevel}</strong>
                                <span className={styles.metricLabel}>Highest Level</span>
                            </div>
                            <div>
                                <strong className={styles.value}>{lastRunSummary.bestStreak}</strong>
                                <span className={styles.metricLabel}>Best Streak</span>
                            </div>
                            <div>
                                <strong className={styles.value}>{lastRunSummary.perfectClears}</strong>
                                <span className={styles.metricLabel}>Perfect Floors</span>
                            </div>
                        </div>
                        <p className={styles.subtext}>
                            {lastRunSummary.achievementsEnabled
                                ? 'Achievements were eligible in that run.'
                                : 'Debug tools were used, so achievements were disabled.'}
                        </p>
                    </>
                ) : (
                    <p className={styles.emptyState}>No completed run yet. Start an expedition and set the first mark.</p>
                )}
            </article>
        </div>
    </section>
);

export default MainMenu;
