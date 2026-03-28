import type { RunSummary } from '../../shared/contracts';
import { useViewportSize } from '../hooks/useViewportSize';
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
}: MainMenuProps) => {
    const { height, width } = useViewportSize();
    const isCompact = width <= 760 || height <= 760;
    const isTight = width <= 430 || height <= 620;
    const summaryMetrics = lastRunSummary
        ? isTight
            ? [
                  { value: lastRunSummary.totalScore.toLocaleString(), label: 'Total Score' },
                  { value: lastRunSummary.highestLevel, label: 'Highest Level' }
              ]
            : isCompact
              ? [
                  { value: lastRunSummary.totalScore.toLocaleString(), label: 'Total Score' },
                  { value: lastRunSummary.highestLevel, label: 'Highest Level' },
                  { value: lastRunSummary.bestStreak, label: 'Best Streak' }
              ]
            : [
                  { value: lastRunSummary.totalScore.toLocaleString(), label: 'Total Score' },
                  { value: lastRunSummary.levelsCleared, label: 'Floors Cleared' },
                  { value: lastRunSummary.highestLevel, label: 'Highest Level' },
                  { value: lastRunSummary.bestStreak, label: 'Best Streak' },
                  { value: lastRunSummary.perfectClears, label: 'Perfect Floors' }
              ]
        : [];

    return (
        <section className={styles.shell}>
            <div className={styles.hero}>
                <p className={styles.eyebrow}>Steam Demo Build</p>
                <h1 className={styles.title}>Memory Dungeon</h1>
                <p className={styles.lead}>
                    {isTight
                        ? 'Fast reads, climbing pressure, clean streaks.'
                        : 'A desktop-first arcade run built around fast reads, climbing pressure, and how cleanly you can keep a streak alive.'}
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
                {isCompact && (
                    <p className={styles.compactStatus}>
                        {steamConnected ? 'Steam connected' : 'Local dev mode'} · Desktop save data still works.
                    </p>
                )}

                {showHowToPlay && (
                    <aside className={`${styles.guideCard} ${isTight ? styles.guideCardTight : ''}`}>
                        {isTight ? (
                            <>
                                <div className={styles.guideCompactHeader}>
                                    <p className={styles.guideEyebrow}>How To Play</p>
                                    <button
                                        className={`${styles.dismissButton} ${styles.dismissButtonTight}`}
                                        onClick={() => void onDismissHowToPlay()}
                                        type="button"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div>
                                <p className={styles.guideEyebrow}>How To Play</p>
                                <h2 className={styles.guideTitle}>Memorize fast, play clean, protect the streak.</h2>
                            </div>
                        )}

                        {!isTight && (
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
                        )}

                        {!isTight && (
                            <button className={styles.dismissButton} onClick={() => void onDismissHowToPlay()} type="button">
                                Dismiss
                            </button>
                        )}
                    </aside>
                )}
            </div>

            {!(isTight && showHowToPlay) && (
                <div className={styles.grid}>
                    <article className={styles.card}>
                        <span className={styles.label}>Best Score</span>
                        <strong className={styles.value}>{bestScore.toLocaleString()}</strong>
                        {!isTight && <p className={styles.subtext}>Stored locally and carried across runs.</p>}
                    </article>

                    {!isCompact && (
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
                    )}

                    {!(isTight && showHowToPlay) && (
                    <article className={`${styles.card} ${isCompact ? styles.compactWide : styles.wide}`}>
                        <span className={styles.label}>Last Expedition</span>
                        {lastRunSummary ? (
                            <>
                                <div className={styles.summaryGrid}>
                                    {summaryMetrics.map((metric) => (
                                        <div key={metric.label}>
                                            <strong className={styles.value}>{metric.value}</strong>
                                            <span className={styles.metricLabel}>{metric.label}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className={styles.subtext}>
                                    {lastRunSummary.achievementsEnabled
                                        ? 'Achievements were eligible in that run.'
                                        : 'Debug tools were used, so achievements were disabled.'}
                                </p>
                            </>
                        ) : (
                            <p className={styles.emptyState}>
                                {isTight
                                    ? 'No completed run yet.'
                                    : 'No completed run yet. Start an expedition and set the first mark.'}
                            </p>
                        )}
                    </article>
                    )}
                </div>
            )}
        </section>
    );
};

export default MainMenu;
