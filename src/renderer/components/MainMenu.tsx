import type { RunSummary } from '../../shared/contracts';
import { useRef } from 'react';
import { useViewportSize } from '../hooks/useViewportSize';
import { usePlatformTiltField } from '../platformTilt/usePlatformTiltField';
import MainMenuBackground from './MainMenuBackground';
import styles from './MainMenu.module.css';

interface MainMenuProps {
    bestScore: number;
    lastRunSummary: RunSummary | null;
    reduceMotion: boolean;
    showHowToPlay: boolean;
    onDismissHowToPlay: () => Promise<void>;
    onPlay: () => void;
    onOpenSettings: () => void;
}

const MainMenu = ({
    bestScore,
    lastRunSummary,
    reduceMotion,
    showHowToPlay,
    onDismissHowToPlay,
    onPlay,
    onOpenSettings
}: MainMenuProps) => {
    const shellRef = useRef<HTMLElement | null>(null);
    const { tiltRef: menuFieldTiltRef } = usePlatformTiltField({
        enabled: true,
        reduceMotion,
        surfaceRef: shellRef,
        strength: 1
    });
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
        <section
            className={`${styles.shell} ${isCompact ? styles.compactShell : styles.roomyShell}`}
            ref={shellRef}
        >
            <MainMenuBackground
                fieldTiltRef={menuFieldTiltRef}
                height={height}
                reduceMotion={reduceMotion}
                width={width}
            />

            <div className={styles.hero}>
                <p className={styles.eyebrow}>Steam Demo Build</p>

                <h1 className={styles.title}>Memory Dungeon</h1>

                <div className={styles.actions}>
                    <button className={`${styles.button} ${styles.primary}`} onClick={onPlay} type="button">
                        Play Arcade
                    </button>
                    <button className={`${styles.button} ${styles.secondary}`} onClick={onOpenSettings} type="button">
                        Settings
                    </button>
                </div>

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
                                    <strong>3. Build survival chains</strong>
                                    <p>Each 4-match streak grants a guard. Each 8-match streak restores one life.</p>
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
                    <article className={`${styles.card} ${styles.featuredCard}`}>
                        <span className={styles.label}>Best Score</span>
                        <strong className={`${styles.value} ${styles.featuredValue}`}>{bestScore.toLocaleString()}</strong>
                        <p className={styles.cardNote}>All-time record</p>
                    </article>

                    <article className={`${styles.card} ${styles.dossierCard} ${isCompact ? styles.compactWide : styles.wide}`}>
                        <span className={styles.label}>Last Expedition</span>
                        {lastRunSummary ? (
                            <>
                                <div className={styles.summaryStrip}>
                                    {summaryMetrics.map((metric) => (
                                        <div className={styles.summaryChip} key={metric.label}>
                                            <span className={styles.summaryChipLabel}>{metric.label}</span>
                                            <strong className={styles.summaryChipValue}>{metric.value}</strong>
                                        </div>
                                    ))}
                                </div>
                                <p className={styles.cardNote}>
                                    {lastRunSummary.achievementsEnabled
                                        ? 'Achievements were eligible in that run.'
                                        : 'Debug tools were used, so achievements were disabled.'}
                                </p>
                            </>
                        ) : (
                            <div className={styles.expeditionEmpty}>
                                <strong>No expedition logged yet.</strong>
                                <p>Start a run and the recap will appear here.</p>
                            </div>
                        )}
                    </article>
                </div>
            )}
        </section>
    );
};

export default MainMenu;
