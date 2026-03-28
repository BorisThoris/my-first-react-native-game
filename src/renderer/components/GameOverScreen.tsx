import { ACHIEVEMENTS } from '../../shared/achievements';
import type { RunState } from '../../shared/contracts';
import { useShallow } from 'zustand/react/shallow';
import { useViewportSize } from '../hooks/useViewportSize';
import styles from './GameOverScreen.module.css';
import { useAppStore } from '../store/useAppStore';

interface GameOverScreenProps {
    run: RunState;
}

const GameOverScreen = ({ run }: GameOverScreenProps) => {
    const { height, width } = useViewportSize();
    const { goToMenu, restartRun } = useAppStore(
        useShallow((state) => ({
            goToMenu: state.goToMenu,
            restartRun: state.restartRun
        }))
    );
    const summary = run.lastRunSummary;
    const isCompact = width <= 760 || height <= 760;

    if (!summary) {
        return null;
    }

    const unlockedAchievements = summary.unlockedAchievements
        .map((achievementId) => ACHIEVEMENTS.find((achievement) => achievement.id === achievementId))
        .filter((achievement): achievement is (typeof ACHIEVEMENTS)[number] => Boolean(achievement));

    return (
        <section className={styles.shell}>
            <div className={styles.panel}>
                <p className={styles.eyebrow}>Run Complete</p>
                <h1 className={styles.title}>Expedition Over</h1>
                <p className={styles.copy}>
                    You reached level {summary.highestLevel} and banked {summary.totalScore.toLocaleString()} points.
                </p>

                <div className={styles.summaryGrid}>
                    <article className={styles.card}>
                        <span>Total Score</span>
                        <strong>{summary.totalScore.toLocaleString()}</strong>
                    </article>
                    <article className={styles.card}>
                        <span>Highest Level</span>
                        <strong>{summary.highestLevel}</strong>
                    </article>
                    <article className={styles.card}>
                        <span>Best Streak</span>
                        <strong>{summary.bestStreak}</strong>
                    </article>
                    <article className={styles.card}>
                        <span>Perfect Floors</span>
                        <strong>{summary.perfectClears}</strong>
                    </article>
                    {!isCompact && (
                        <>
                            <article className={styles.card}>
                                <span>Best Score</span>
                                <strong>{summary.bestScore.toLocaleString()}</strong>
                            </article>
                            <article className={styles.card}>
                                <span>Floors Cleared</span>
                                <strong>{summary.levelsCleared}</strong>
                            </article>
                        </>
                    )}
                </div>

                <div className={styles.statusBanner}>
                    {summary.achievementsEnabled
                        ? 'Achievements were enabled for this run.'
                        : 'Debug tools were used, so achievements were disabled for this run.'}
                </div>

                {unlockedAchievements.length > 0 && (
                    <div className={styles.achievementBlock}>
                        <h2 className={styles.sectionTitle}>Unlocked</h2>
                        <div className={styles.achievementGrid}>
                            {unlockedAchievements.map((achievement) => (
                                <article className={styles.achievementCard} key={achievement.id}>
                                    <strong>{achievement.title}</strong>
                                    <p>{achievement.description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles.actions}>
                    <button className={styles.primaryButton} onClick={restartRun} type="button">
                        Play Again
                    </button>
                    <button className={styles.secondaryButton} onClick={goToMenu} type="button">
                        Main Menu
                    </button>
                </div>
            </div>
        </section>
    );
};

export default GameOverScreen;
