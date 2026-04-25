import { useEffect, useMemo, useRef } from 'react';
import { ACHIEVEMENTS } from '../../shared/achievements';
import { MUTATOR_CATALOG, RELIC_CATALOG } from '../../shared/game-catalog';
import type { MutatorId, RelicId, RunState } from '../../shared/contracts';
import { useShallow } from 'zustand/react/shallow';
import { UI_ART } from '../assets/ui';
import { playGameOverOpenSfx, playUiBackSfx, resumeUiSfxContext, uiSfxGainFromSettings } from '../audio/uiSfx';
import { gameOverScreenCopy } from '../copy/gameOverScreen';
import { useViewportSize } from '../hooks/useViewportSize';
import { usePlatformTiltField } from '../platformTilt/usePlatformTiltField';
import { Eyebrow, Panel, ScreenTitle, StatTile, UiButton } from '../ui';
import { useAppStore } from '../store/useAppStore';
import MainMenuBackground from './MainMenuBackground';
import styles from './GameOverScreen.module.css';

interface GameOverScreenProps {
    run: RunState;
}

const mutatorLabel = (id: MutatorId): string => MUTATOR_CATALOG[id].title;

const relicLabel = (id: RelicId): string => RELIC_CATALOG[id].title;

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

    const politeRunSummaryText = useMemo(
        () =>
            summary
                ? gameOverScreenCopy.politeRunSummary(summary.totalScore, summary.highestLevel)
                : '',
        [summary]
    );
    const uiGain = uiSfxGainFromSettings(settings.masterVolume, settings.sfxVolume);

    useEffect(() => {
        resumeUiSfxContext();
        playGameOverOpenSfx(uiGain);
    }, [uiGain]);

    if (!summary) {
        return null;
    }

    const unlockedAchievements = summary.unlockedAchievements
        .map((achievementId) => ACHIEVEMENTS.find((achievement) => achievement.id === achievementId))
        .filter((achievement): achievement is (typeof ACHIEVEMENTS)[number] => Boolean(achievement));

    const flipCount = run.flipHistory?.length ?? 0;
    const metaItems = [
        ...(summary.activeMutators?.map((id) => mutatorLabel(id)) ?? []),
        ...(summary.relicIds?.map((id) => relicLabel(id)) ?? [])
    ];

    return (
        <section className={styles.shell} ref={shellRef}>
            <MainMenuBackground
                fieldTiltRef={fieldTiltRef}
                graphicsQuality={settings.graphicsQuality}
                height={height}
                reduceMotion={settings.reduceMotion}
                width={width}
            />
            <div
                aria-hidden="true"
                className={styles.sceneLayer}
                style={{ backgroundImage: `url(${UI_ART.menuScene})` }}
            />
            <div className={styles.scrim} />

            <div className={styles.foreground}>
                <p
                    aria-atomic="true"
                    aria-label="Run summary announcement"
                    aria-live="polite"
                    className={styles.visuallyHidden}
                    role="status"
                >
                    {politeRunSummaryText}
                </p>
                <div className={styles.layout}>
                    <Panel className={styles.heroPanel} padding="lg" variant="strong">
                        <div className={styles.heroLockup}>
                            <img alt="" className={styles.brandCrest} src={UI_ART.brandCrest} />
                            <Eyebrow>{gameOverScreenCopy.heroEyebrow}</Eyebrow>
                            <ScreenTitle as="h1" role="screenLg">
                                {gameOverScreenCopy.heroTitle}
                            </ScreenTitle>
                        </div>
                        <div
                            aria-label={`Total score ${summary.totalScore.toLocaleString()}`}
                            className={styles.scoreHero}
                        >
                            <span className={styles.scoreHeroLabel}>{gameOverScreenCopy.scoreLabel}</span>
                            <span className={styles.scoreHeroValue}>{summary.totalScore.toLocaleString()}</span>
                        </div>
                        <img alt="" className={styles.divider} src={UI_ART.dividerOrnament} />
                        <p className={styles.copy}>{gameOverScreenCopy.floorCaption(summary.highestLevel)}</p>

                        {metaItems.length > 0 ? (
                            <div className={styles.metaStrip}>
                                {metaItems.map((item) => (
                                    <span className={styles.metaChip} key={item}>
                                        {item}
                                    </span>
                                ))}
                            </div>
                        ) : null}

                        <div className={styles.summaryGrid}>
                            <StatTile
                                density="minimal"
                                label={gameOverScreenCopy.statLabels.highestFloor}
                                value={summary.highestLevel}
                            />
                            <StatTile
                                density="minimal"
                                label={gameOverScreenCopy.statLabels.bestStreak}
                                value={summary.bestStreak}
                            />
                            <StatTile
                                density="minimal"
                                label={gameOverScreenCopy.statLabels.perfectFloors}
                                value={summary.perfectClears}
                            />
                            <StatTile
                                density="minimal"
                                label={gameOverScreenCopy.statLabels.floorsCleared}
                                value={summary.levelsCleared}
                            />
                            <StatTile
                                density="minimal"
                                label={gameOverScreenCopy.statLabels.bestScore}
                                value={summary.bestScore.toLocaleString()}
                            />
                        </div>

                        <p className={styles.note}>
                            {summary.achievementsEnabled
                                ? gameOverScreenCopy.achievementsNoteOn
                                : gameOverScreenCopy.achievementsNoteOff}
                        </p>
                    </Panel>

                    <aside className={styles.sideRail}>
                        <Panel className={styles.actionPanel} padding="lg" variant="default">
                            <div className={styles.actionHeader}>
                                <img alt="" className={styles.actionSeal} src={UI_ART.menuSeal} />
                                <div>
                                    <span className={styles.panelKicker}>{gameOverScreenCopy.actionKicker}</span>
                                    <h2 className={styles.panelHeading}>{gameOverScreenCopy.actionHeading}</h2>
                                </div>
                            </div>
                            <div className={styles.actionButtons}>
                                <UiButton
                                    fullWidth
                                    aria-label={gameOverScreenCopy.playAgainAriaLabel}
                                    size="lg"
                                    variant="primary"
                                    onClick={restartRun}
                                >
                                    {gameOverScreenCopy.playAgainLabel}
                                </UiButton>
                                <UiButton
                                    fullWidth
                                    aria-label={gameOverScreenCopy.mainMenuAriaLabel}
                                    size="lg"
                                    variant="secondary"
                                    onClick={() => {
                                        resumeUiSfxContext();
                                        playUiBackSfx(uiGain);
                                        goToMenu();
                                    }}
                                >
                                    {gameOverScreenCopy.mainMenuLabel}
                                </UiButton>
                            </div>
                        </Panel>

                        <Panel className={styles.actionPanel} padding="lg" variant="muted">
                            <span className={styles.panelKicker}>{gameOverScreenCopy.runSnapshotKicker}</span>
                            <strong className={styles.panelHeading}>
                                {summary.gameMode === 'daily' && summary.dailyDateKeyUtc
                                    ? gameOverScreenCopy.runModeHeadings.daily(summary.dailyDateKeyUtc)
                                    : summary.gameMode === 'gauntlet'
                                      ? gameOverScreenCopy.runModeHeadings.gauntlet
                                      : summary.gameMode === 'meditation'
                                        ? gameOverScreenCopy.runModeHeadings.meditation
                                        : summary.gameMode === 'puzzle'
                                          ? gameOverScreenCopy.runModeHeadings.puzzle
                                          : gameOverScreenCopy.runModeHeadings.classic}
                            </strong>
                            <p className={styles.panelCopy}>{gameOverScreenCopy.flipHistoryCopy(flipCount)}</p>
                        </Panel>
                    </aside>
                </div>

                {unlockedAchievements.length > 0 ? (
                    <Panel className={styles.achievementPanel} padding="lg" variant="default">
                        <Eyebrow>{gameOverScreenCopy.achievementEyebrow}</Eyebrow>
                        <ScreenTitle as="h2" className={styles.achievementHeading} role="screen">
                            {gameOverScreenCopy.achievementHeading}
                        </ScreenTitle>
                        <ul className={styles.achievementList}>
                            {unlockedAchievements.map((achievement) => (
                                <li className={styles.achievementItem} key={achievement.id}>
                                    <strong>{achievement.title}</strong>
                                    <span>{achievement.description}</span>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                ) : null}

                {(run.flipHistory?.length ?? 0) > 0 ? (
                    <Panel className={styles.detailsPanel} padding="md" variant="muted">
                        <details className={styles.timelineDetails}>
                            <summary>{gameOverScreenCopy.flipTimelineSummary}</summary>
                            <ol className={styles.ghostSteps}>
                                {run.flipHistory!.map((id, index) => (
                                    <li key={`${id}-${index}`}>
                                        <span className={styles.ghostStepIndex}>{index + 1}</span>
                                        <code>{id}</code>
                                    </li>
                                ))}
                            </ol>
                        </details>
                    </Panel>
                ) : null}
            </div>
        </section>
    );
};

export default GameOverScreen;
