import type { RunSummary } from '../../shared/contracts';
import { useRef } from 'react';
import { useViewportSize } from '../hooks/useViewportSize';
import { usePlatformTiltField } from '../platformTilt/usePlatformTiltField';
import { Eyebrow, Panel, ScreenTitle, UiButton } from '../ui';
import MainMenuBackground from './MainMenuBackground';
import styles from './MainMenu.module.css';

interface MainMenuProps {
    bestScore: number;
    lastRunSummary: RunSummary | null;
    reduceMotion: boolean;
    showHowToPlay: boolean;
    suppressMenuBackgroundFallback?: boolean;
    onDismissHowToPlay: () => Promise<void>;
    onPlay: () => void;
    onOpenSettings: () => void;
}

const MainMenu = ({
    bestScore,
    lastRunSummary,
    reduceMotion,
    showHowToPlay,
    suppressMenuBackgroundFallback = false,
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
    const lastRunLine = lastRunSummary
        ? isTight
            ? `${lastRunSummary.totalScore.toLocaleString()} pts · Floor ${lastRunSummary.highestLevel}`
            : `${lastRunSummary.totalScore.toLocaleString()} pts · ${lastRunSummary.levelsCleared} floors · high ${lastRunSummary.highestLevel} · streak ${lastRunSummary.bestStreak} · ${lastRunSummary.perfectClears} perfect`
        : null;

    return (
        <section
            className={`${styles.shell} ${isCompact ? styles.compactShell : styles.roomyShell}`}
            ref={shellRef}
        >
            <MainMenuBackground
                fieldTiltRef={menuFieldTiltRef}
                height={height}
                reduceMotion={reduceMotion}
                suppressLoadingFallback={suppressMenuBackgroundFallback}
                width={width}
            />

            <div className={styles.hero}>
                <div className={styles.heroSmallTitleTilt}>
                    <Eyebrow
                        tone="menu"
                        style={{
                            fontSize: 'clamp(0.62rem, 1.15vw, 0.74rem)',
                            letterSpacing: '0.28em',
                            marginBottom: '0.55rem'
                        }}
                    >
                        Steam Demo Build
                    </Eyebrow>
                </div>

                <ScreenTitle className={`${styles.heroTitle} ${styles.heroBigTitleTilt}`} role="display">
                    Memory Dungeon
                </ScreenTitle>

                <div className={`${styles.actions} ${styles.heroActionsTilt}`}>
                    <UiButton size="lg" variant="primary" onClick={onPlay}>
                        Play Arcade
                    </UiButton>
                    <UiButton size="lg" variant="secondary" onClick={onOpenSettings}>
                        Settings
                    </UiButton>
                </div>

                {showHowToPlay && (
                    <aside className={`${styles.guideCard} ${isTight ? styles.guideCardTight : ''}`}>
                        {isTight ? (
                            <>
                                <div className={styles.guideCompactHeader}>
                                    <Eyebrow tone="tight">How To Play</Eyebrow>
                                    <UiButton
                                        className={styles.dismissButtonTight}
                                        onClick={() => void onDismissHowToPlay()}
                                        size="sm"
                                        variant="secondary"
                                    >
                                        Dismiss
                                    </UiButton>
                                </div>
                            </>
                        ) : (
                            <div>
                                <Eyebrow tone="tight">How To Play</Eyebrow>
                                <ScreenTitle as="h2" className={styles.guideTitleSpacing} role="screenMd">
                                    Memorize fast, play clean, protect the streak.
                                </ScreenTitle>
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
                            <div className={styles.dismissWrap}>
                                <UiButton
                                    fullWidth
                                    onClick={() => void onDismissHowToPlay()}
                                    size="md"
                                    variant="secondary"
                                >
                                    Dismiss
                                </UiButton>
                            </div>
                        )}
                    </aside>
                )}
            </div>

            {!(isTight && showHowToPlay) && (
                <div className={styles.grid}>
                    <Panel
                        className={`${styles.dossierUnified} ${styles.tiltSurface}`}
                        padding="md"
                        variant="strong"
                    >
                        <span className={styles.label}>Record & last run</span>

                        <div className={styles.dossierColumns}>
                            <div className={styles.dossierCol}>
                                <span className={styles.colEyebrow}>Personal best</span>
                                <strong className={styles.colFigure}>
                                    {bestScore > 0 ? bestScore.toLocaleString() : '—'}
                                </strong>
                            </div>
                            <div className={`${styles.dossierCol} ${lastRunSummary ? '' : styles.dossierColMuted}`}>
                                <span className={styles.colEyebrow}>Last run</span>
                                {lastRunSummary && lastRunLine ? (
                                    <>
                                        <p className={styles.lastRunLine}>{lastRunLine}</p>
                                        <p className={styles.colNote}>
                                            {lastRunSummary.achievementsEnabled
                                                ? 'Achievements counted for that run.'
                                                : 'Achievements off (debug tools).'}
                                        </p>
                                    </>
                                ) : (
                                    <p className={styles.colPlaceholder}>
                                        {bestScore > 0
                                            ? 'Finish a run to see score, floors, and streaks here.'
                                            : 'Your last run summary appears after your first expedition.'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Panel>
                </div>
            )}
        </section>
    );
};

export default MainMenu;
