import { ACHIEVEMENTS } from '../../shared/achievements';
import type { RunState } from '../../shared/contracts';
import { useShallow } from 'zustand/react/shallow';
import { useViewportSize } from '../hooks/useViewportSize';
import { AccentBanner, Eyebrow, Panel, ScreenTitle, StatTile, UiButton } from '../ui';
import { useAppStore } from '../store/useAppStore';
import styles from './GameOverScreen.module.css';

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
            <Panel className={styles.panel} maxViewportHeight padding="lg" scrollable variant="strong">
                <div className={styles.lead}>
                    <Eyebrow>Run Complete</Eyebrow>
                    <ScreenTitle role="screenLg">Expedition Over</ScreenTitle>
                </div>
                <p className={styles.copy}>
                    You reached level {summary.highestLevel} and banked {summary.totalScore.toLocaleString()} points.
                </p>

                <div className={styles.summaryGrid}>
                    <StatTile label="Total Score" value={summary.totalScore.toLocaleString()} />
                    <StatTile label="Highest Level" value={summary.highestLevel} />
                    <StatTile label="Best Streak" value={summary.bestStreak} />
                    <StatTile label="Perfect Floors" value={summary.perfectClears} />
                    {!isCompact && (
                        <>
                            <StatTile label="Best Score" value={summary.bestScore.toLocaleString()} />
                            <StatTile label="Floors Cleared" value={summary.levelsCleared} />
                        </>
                    )}
                </div>

                <AccentBanner className={styles.statusBanner}>
                    {summary.achievementsEnabled
                        ? 'Achievements were enabled for this run.'
                        : 'Debug tools were used, so achievements were disabled for this run.'}
                </AccentBanner>

                {unlockedAchievements.length > 0 && (
                    <div className={styles.achievementBlock}>
                        <ScreenTitle as="h2" className={styles.unlockedHeading} role="section">
                            Unlocked
                        </ScreenTitle>
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
                    <UiButton variant="primary" onClick={restartRun}>
                        Play Again
                    </UiButton>
                    <UiButton variant="secondary" onClick={goToMenu}>
                        Main Menu
                    </UiButton>
                </div>
            </Panel>
        </section>
    );
};

export default GameOverScreen;
