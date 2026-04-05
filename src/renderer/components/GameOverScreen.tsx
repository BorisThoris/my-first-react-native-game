import { useRef, useState } from 'react';
import { ACHIEVEMENTS } from '../../shared/achievements';
import { MUTATOR_CATALOG, RELIC_CATALOG } from '../../shared/game-catalog';
import type { MutatorId, RelicId, RunState } from '../../shared/contracts';
import { serializeRunPayloadFromSummary } from '../../shared/run-export';
import { useShallow } from 'zustand/react/shallow';
import { UI_ART } from '../assets/ui';
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
    const [copyHint, setCopyHint] = useState<string | null>(null);
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

    if (!summary) {
        return null;
    }

    const unlockedAchievements = summary.unlockedAchievements
        .map((achievementId) => ACHIEVEMENTS.find((achievement) => achievement.id === achievementId))
        .filter((achievement): achievement is (typeof ACHIEVEMENTS)[number] => Boolean(achievement));

    const sharePayload = serializeRunPayloadFromSummary(summary);
    const flipCount = run.flipHistory?.length ?? 0;
    const metaItems = [
        ...(summary.activeMutators?.map((id) => mutatorLabel(id)) ?? []),
        ...(summary.relicIds?.map((id) => relicLabel(id)) ?? [])
    ];

    const copyRunSeed = async (): Promise<void> => {
        if (!sharePayload) {
            setCopyHint('No run export is available for this summary.');
            return;
        }
        try {
            await navigator.clipboard.writeText(sharePayload);
            setCopyHint('Copied run JSON to clipboard.');
        } catch {
            setCopyHint('Clipboard access failed. Use the text block below.');
        }
    };

    return (
        <section className={styles.shell} ref={shellRef}>
            <MainMenuBackground
                fieldTiltRef={fieldTiltRef}
                height={height}
                reduceMotion={settings.reduceMotion}
                width={width}
            />
            <div className={styles.scrim} />

            <div className={styles.foreground}>
                <div className={styles.layout}>
                    <Panel className={styles.heroPanel} padding="lg" variant="strong">
                        <Eyebrow>Run Complete</Eyebrow>
                        <ScreenTitle role="screenLg">Expedition Over</ScreenTitle>
                        <div aria-label={`Total score ${summary.totalScore.toLocaleString()}`} className={styles.scoreHero}>
                            <span className={styles.scoreHeroLabel}>Score</span>
                            <span className={styles.scoreHeroValue}>{summary.totalScore.toLocaleString()}</span>
                        </div>
                        <img alt="" className={styles.divider} src={UI_ART.dividerOrnament} />
                        <p className={styles.copy}>
                            Floor {summary.highestLevel} reached before the archive sealed — details below.
                        </p>

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
                            <StatTile density="minimal" label="Highest Floor" value={summary.highestLevel} />
                            <StatTile density="minimal" label="Best Streak" value={summary.bestStreak} />
                            <StatTile density="minimal" label="Perfect Floors" value={summary.perfectClears} />
                            <StatTile density="minimal" label="Floors Cleared" value={summary.levelsCleared} />
                            <StatTile density="minimal" label="Best Score" value={summary.bestScore.toLocaleString()} />
                        </div>

                        <p className={styles.note}>
                            {summary.achievementsEnabled
                                ? 'Achievements counted for this run.'
                                : 'Achievements were off (debug tools used).'}
                        </p>
                    </Panel>

                    <aside className={styles.sideRail}>
                        <Panel className={styles.actionPanel} padding="lg" variant="default">
                            <div className={styles.actionHeader}>
                                <img alt="" className={styles.actionSeal} src={UI_ART.menuSeal} />
                                <div>
                                    <span className={styles.panelKicker}>Next Move</span>
                                    <strong className={styles.panelHeading}>Continue the archive</strong>
                                </div>
                            </div>
                            <div className={styles.actionButtons}>
                                <UiButton fullWidth size="lg" variant="primary" onClick={restartRun}>
                                    Play Again
                                </UiButton>
                                <UiButton fullWidth size="lg" variant="secondary" onClick={goToMenu}>
                                    Main Menu
                                </UiButton>
                            </div>
                        </Panel>

                        <Panel className={styles.actionPanel} padding="lg" variant="muted">
                            <span className={styles.panelKicker}>Run Snapshot</span>
                            <strong className={styles.panelHeading}>
                                {summary.gameMode === 'daily' && summary.dailyDateKeyUtc
                                    ? `Daily ${summary.dailyDateKeyUtc}`
                                    : summary.gameMode === 'gauntlet'
                                      ? 'Gauntlet descent'
                                      : summary.gameMode === 'meditation'
                                        ? 'Meditation descent'
                                        : summary.gameMode === 'puzzle'
                                          ? 'Puzzle descent'
                                          : 'Classic descent'}
                            </strong>
                            <p className={styles.panelCopy}>
                                {flipCount > 0
                                    ? `${flipCount} flips recorded locally for this session.`
                                    : 'No flip history stored for this run.'}
                            </p>
                        </Panel>
                    </aside>
                </div>

                {unlockedAchievements.length > 0 ? (
                    <Panel className={styles.achievementPanel} padding="lg" variant="default">
                        <Eyebrow>Unlocked</Eyebrow>
                        <ScreenTitle as="h2" className={styles.achievementHeading} role="screen">
                            New archive entries
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

                <Panel className={styles.detailsPanel} padding="md" variant="muted">
                    <details className={styles.exportDetails}>
                        <summary>Advanced — export and replay</summary>
                        <div className={styles.exportBody}>
                            <UiButton size="md" variant="secondary" onClick={() => void copyRunSeed()}>
                                Copy run seed (JSON)
                            </UiButton>
                            {copyHint ? <p className={styles.copyHint}>{copyHint}</p> : null}
                            {sharePayload ? (
                                <pre className={styles.sharePre} tabIndex={0}>
                                    {sharePayload}
                                </pre>
                            ) : (
                                <p className={styles.copyHint}>Seed export is unavailable for this legacy summary.</p>
                            )}

                            {run.flipHistory.length > 0 ? (
                                <details className={styles.timelineDetails}>
                                    <summary>Flip timeline</summary>
                                    <ol className={styles.ghostSteps}>
                                        {run.flipHistory.map((id, index) => (
                                            <li key={`${id}-${index}`}>
                                                <span className={styles.ghostStepIndex}>{index + 1}</span>
                                                <code>{id}</code>
                                            </li>
                                        ))}
                                    </ol>
                                </details>
                            ) : null}
                        </div>
                    </details>
                </Panel>
            </div>
        </section>
    );
};

export default GameOverScreen;
