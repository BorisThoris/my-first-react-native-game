import { useRef } from 'react';
import { ACHIEVEMENTS } from '../../shared/achievements';
import type { RunState } from '../../shared/contracts';
import { useShallow } from 'zustand/react/shallow';
import { useViewportSize } from '../hooks/useViewportSize';
import { usePlatformTiltField } from '../platformTilt/usePlatformTiltField';
import { Eyebrow, ScreenTitle, StatTile, UiButton } from '../ui';
import { useAppStore } from '../store/useAppStore';
import MainMenuBackground from './MainMenuBackground';
import styles from './GameOverScreen.module.css';

interface GameOverScreenProps {
    run: RunState;
}

const GameOverScreen = ({ run }: GameOverScreenProps) => {
    const shellRef = useRef<HTMLElement | null>(null);
    const { height, width } = useViewportSize();
    const { goToMenu, restartRun, settings } = useAppStore(
        useShallow((state) => ({
            goToMenu: state.goToMenu,
            restartRun: state.restartRun,
            settings: state.settings
        }))
    );
    const { tiltRef: fieldTiltRef } = usePlatformTiltField({
        enabled: true,
        reduceMotion: settings.reduceMotion,
        surfaceRef: shellRef,
        strength: 1
    });
    const summary = run.lastRunSummary;
    const isCompact = width <= 760 || height <= 760;

    if (!summary) {
        return null;
    }

    const unlockedAchievements = summary.unlockedAchievements
        .map((achievementId) => ACHIEVEMENTS.find((achievement) => achievement.id === achievementId))
        .filter((achievement): achievement is (typeof ACHIEVEMENTS)[number] => Boolean(achievement));

    return (
        <section className={styles.shell} ref={shellRef}>
            <MainMenuBackground
                fieldTiltRef={fieldTiltRef}
                height={height}
                reduceMotion={settings.reduceMotion}
                width={width}
            />
            <div className={styles.foreground}>
                <div className={styles.layout}>
                    <div className={styles.main}>
                        <div className={styles.lead}>
                            <Eyebrow>Run Complete</Eyebrow>
                            <ScreenTitle role="screenLg">Expedition Over</ScreenTitle>
                        </div>
                        <p className={styles.copy}>
                            You reached level {summary.highestLevel} and banked{' '}
                            {summary.totalScore.toLocaleString()} points.
                        </p>

                        <div className={styles.summaryGrid}>
                            <StatTile density="minimal" label="Total Score" value={summary.totalScore.toLocaleString()} />
                            <StatTile density="minimal" label="Highest Level" value={summary.highestLevel} />
                            <StatTile density="minimal" label="Best Streak" value={summary.bestStreak} />
                            <StatTile density="minimal" label="Perfect Floors" value={summary.perfectClears} />
                            {!isCompact && (
                                <>
                                    <StatTile density="minimal" label="Best Score" value={summary.bestScore.toLocaleString()} />
                                    <StatTile density="minimal" label="Floors Cleared" value={summary.levelsCleared} />
                                </>
                            )}
                        </div>

                        <p className={styles.note}>
                            {summary.achievementsEnabled
                                ? 'Achievements were enabled for this run.'
                                : 'Debug tools were used, so achievements were disabled for this run.'}
                        </p>

                        {unlockedAchievements.length > 0 && (
                            <div className={styles.achievementBlock}>
                                <ScreenTitle as="h2" className={styles.unlockedHeading} role="section">
                                    Unlocked
                                </ScreenTitle>
                                <ul className={styles.achievementList}>
                                    {unlockedAchievements.map((achievement) => (
                                        <li className={styles.achievementItem} key={achievement.id}>
                                            <strong>{achievement.title}</strong>
                                            <span>{achievement.description}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className={styles.actionRail} role="group" aria-label="Run summary actions">
                        <UiButton variant="primary" onClick={restartRun}>
                            Play Again
                        </UiButton>
                        <UiButton variant="secondary" onClick={goToMenu}>
                            Main Menu
                        </UiButton>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GameOverScreen;
