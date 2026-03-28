import type { RunSummary } from '../../shared/contracts';
import styles from './MainMenu.module.css';

interface MainMenuProps {
    bestScore: number;
    lastRunSummary: RunSummary | null;
    steamConnected: boolean;
    onPlay: () => void;
    onOpenSettings: () => void;
}

const MainMenu = ({ bestScore, lastRunSummary, steamConnected, onPlay, onOpenSettings }: MainMenuProps) => (
    <section className={styles.shell}>
        <div className={styles.hero}>
            <p className={styles.eyebrow}>Steam Build Alpha</p>
            <h1 className={styles.title}>Memory Dungeon</h1>
            <p className={styles.lead}>
                A desktop-first arcade run built around clean reads, fast matches, and how long you can stay sharp
                under pressure.
            </p>

            <div className={styles.actions}>
                <button className={`${styles.button} ${styles.primary}`} onClick={onPlay} type="button">
                    Play Arcade
                </button>
                <button className={`${styles.button} ${styles.secondary}`} onClick={onOpenSettings} type="button">
                    Settings
                </button>
            </div>
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
                                <span className={styles.metricLabel}>Levels Cleared</span>
                            </div>
                            <div>
                                <strong className={styles.value}>{lastRunSummary.highestLevel}</strong>
                                <span className={styles.metricLabel}>Highest Level</span>
                            </div>
                        </div>
                        <p className={styles.subtext}>
                            {lastRunSummary.achievementsEnabled
                                ? 'Achievements were eligible in that run.'
                                : 'Debug tools were used, so achievements were disabled.'}
                        </p>
                    </>
                ) : (
                    <p className={styles.emptyState}>No completed run yet. Start a new arcade expedition.</p>
                )}
            </article>
        </div>
    </section>
);

export default MainMenu;
