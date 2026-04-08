import type { MutatorId, RelicId, RunSummary, SaveData } from '../../shared/contracts';
import { MUTATOR_CATALOG } from '../../shared/mutators';
import { RELIC_CATALOG } from '../../shared/game-catalog';
import { formatNextUtcReset } from '../../shared/utc-countdown';
import { useEffect, useRef, useState } from 'react';
import { UI_ART } from '../assets/ui';
import { desktopClient } from '../desktop-client';
import { useViewportSize } from '../hooks/useViewportSize';
import { usePlatformTiltField } from '../platformTilt/usePlatformTiltField';
import { Eyebrow, Panel, ScreenTitle, UiButton } from '../ui';
import MainMenuBackground from './MainMenuBackground';
import OverlayModal from './OverlayModal';
import styles from './MainMenu.module.css';

const MEDITATION_PICK_MUTATOR_IDS = (Object.keys(MUTATOR_CATALOG) as MutatorId[]).sort((a, b) =>
    MUTATOR_CATALOG[a]!.title.localeCompare(MUTATOR_CATALOG[b]!.title)
);

interface MainMenuProps {
    bestScore: number;
    lastRunSummary: RunSummary | null;
    saveData: SaveData;
    reduceMotion: boolean;
    showHowToPlay: boolean;
    steamConnected: boolean;
    suppressMenuBackgroundFallback?: boolean;
    onDismissHowToPlay: () => Promise<void>;
    onPlay: () => void;
    onOpenCollection: () => void;
    onOpenCodex: () => void;
    onOpenInventory: () => void;
    onOpenSettings: () => void;
    onGauntletRun: () => void;
    onPuzzleStarter: () => void;
    onMirrorPuzzleRun: () => void;
    onPracticeRun: () => void;
    onScholarContractRun: () => void;
    onImportRun: () => void;
    onMeditationRun: () => void;
    onMeditationRunWithMutators: (mutators: MutatorId[]) => void;
    onPinVowRun: () => void;
    onWildRun: () => void;
}

const MainMenu = ({
    bestScore,
    lastRunSummary,
    saveData,
    reduceMotion,
    showHowToPlay,
    steamConnected,
    suppressMenuBackgroundFallback = false,
    onDismissHowToPlay,
    onPlay,
    onOpenCollection,
    onOpenCodex,
    onOpenInventory,
    onOpenSettings,
    onGauntletRun,
    onPuzzleStarter,
    onMirrorPuzzleRun,
    onPracticeRun,
    onScholarContractRun,
    onImportRun,
    onMeditationRun,
    onMeditationRunWithMutators,
    onPinVowRun,
    onWildRun
}: MainMenuProps) => {
    const shellRef = useRef<HTMLElement | null>(null);
    const [meditationOpen, setMeditationOpen] = useState(false);
    const [meditationSelection, setMeditationSelection] = useState<Set<MutatorId>>(() => new Set());
    const [nowMs, setNowMs] = useState(() => Date.now());
    const { tiltRef: menuFieldTiltRef } = usePlatformTiltField({
        enabled: true,
        reduceMotion,
        surfaceRef: shellRef,
        strength: 1
    });
    const { height, width } = useViewportSize();
    const isCompact = width <= 960 || height <= 760;
    const relicPickEntries = saveData.playerStats
        ? (Object.entries(saveData.playerStats.relicPickCounts) as [RelicId, number][])
              .filter(([, count]) => count > 0)
              .sort((left, right) => right[1] - left[1])
        : [];
    const lastRunLabel = lastRunSummary
        ? `${lastRunSummary.totalScore.toLocaleString()} score / Floor ${lastRunSummary.highestLevel} / ${lastRunSummary.bestStreak} streak`
        : 'No descent recorded yet.';
    const dailyCountdown = formatNextUtcReset(nowMs);

    const toggleMeditationMutator = (id: MutatorId): void => {
        setMeditationSelection((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    useEffect(() => {
        const id = window.setInterval(() => setNowMs(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, []);

    return (
        <section className={`${styles.shell} ${isCompact ? styles.compactShell : ''}`} ref={shellRef}>
            <MainMenuBackground
                fieldTiltRef={menuFieldTiltRef}
                graphicsQuality={saveData.settings.graphicsQuality}
                height={height}
                reduceMotion={reduceMotion}
                suppressLoadingFallback={suppressMenuBackgroundFallback}
                width={width}
            />
            <div
                aria-hidden="true"
                className={styles.sceneLayer}
                style={{ backgroundImage: `url(${UI_ART.menuScene})` }}
            />
            <div className={styles.scrim} />

            <div className={styles.content}>
                <header className={styles.metaRow}>
                    <div className={styles.metaCard}>
                        <span className={styles.metaLabel}>Build</span>
                        <strong className={styles.metaValue}>Steam Demo</strong>
                    </div>
                    <div className={styles.metaCard}>
                        <span className={styles.metaLabel}>Best Score</span>
                        <strong className={styles.metaValue}>
                            {bestScore > 0 ? bestScore.toLocaleString() : 'Unranked'}
                        </strong>
                    </div>
                    <div className={styles.metaCard}>
                        <span className={styles.metaLabel}>Daily Streak</span>
                        <strong className={styles.metaValue}>
                            {saveData.playerStats?.dailyStreakCosmetic ?? 0}
                        </strong>
                    </div>
                    <div className={styles.metaCard}>
                        <span className={styles.metaLabel}>Steam</span>
                        <strong className={styles.metaValue}>{steamConnected ? 'Connected' : 'Offline'}</strong>
                    </div>
                </header>

                <div className={styles.layout}>
                    <main className={styles.heroColumn}>
                        <div className={styles.brandLockup}>
                            <img alt="" className={styles.brandCrest} src={UI_ART.brandCrest} />
                            <Eyebrow className={styles.heroEyebrow} tone="menu">
                                Seeker of Shards
                            </Eyebrow>
                            <ScreenTitle className={styles.heroTitle} role="display">
                                Memory Dungeon
                            </ScreenTitle>
                            <img alt="" className={styles.divider} src={UI_ART.dividerOrnament} />
                            <p className={styles.tagline}>Test your mind. Conquer the depths.</p>
                        </div>

                        <div className={styles.actionStack} role="group" aria-label="Primary actions">
                            <UiButton
                                aria-label="Play"
                                className={styles.ctaButton}
                                fullWidth
                                size="lg"
                                variant="primary"
                                onClick={onPlay}
                            >
                                <span className={styles.ctaContent}>
                                    <span className={styles.ctaTitle}>Play</span>
                                    <span className={styles.ctaHint}>Choose Classic, Daily, or future modes</span>
                                </span>
                            </UiButton>
                            <UiButton
                                aria-label="Collection"
                                className={styles.ctaButton}
                                fullWidth
                                size="lg"
                                variant="secondary"
                                onClick={onOpenCollection}
                            >
                                <span className={styles.ctaContent}>
                                    <span className={styles.ctaTitle}>Collection</span>
                                    <span className={styles.ctaHint}>Achievements, relics, and run history</span>
                                </span>
                            </UiButton>
                            <UiButton
                                aria-label="Inventory"
                                className={styles.ctaButton}
                                fullWidth
                                size="lg"
                                variant="ghost"
                                onClick={onOpenInventory}
                            >
                                <span className={styles.ctaContent}>
                                    <span className={styles.ctaTitle}>Inventory</span>
                                    <span className={styles.ctaHint}>Expedition loadout when you are in a run</span>
                                </span>
                            </UiButton>
                            <UiButton
                                aria-label="Codex"
                                className={styles.ctaButton}
                                fullWidth
                                size="lg"
                                variant="ghost"
                                onClick={onOpenCodex}
                            >
                                <span className={styles.ctaContent}>
                                    <span className={styles.ctaTitle}>Codex</span>
                                    <span className={styles.ctaHint}>Rules, relics, mutators, and mode reference</span>
                                </span>
                            </UiButton>
                            <UiButton
                                aria-label="Settings"
                                className={styles.ctaButton}
                                fullWidth
                                size="lg"
                                variant="secondary"
                                onClick={onOpenSettings}
                            >
                                <span className={styles.ctaContent}>
                                    <span className={styles.ctaTitle}>Settings</span>
                                    <span className={styles.ctaHint}>Video, audio, controls, accessibility</span>
                                </span>
                            </UiButton>
                            <UiButton
                                aria-label="Exit Game"
                                className={styles.ctaButton}
                                fullWidth
                                size="lg"
                                variant="ghost"
                                onClick={() => void desktopClient.quitApp()}
                            >
                                <span className={styles.ctaContent}>
                                    <span className={styles.ctaTitle}>Exit Game</span>
                                    <span className={styles.ctaHint}>Close the desktop app</span>
                                </span>
                            </UiButton>
                        </div>

                        <div className={styles.bottomCards}>
                            <Panel className={styles.bottomPanel} padding="md" variant="strong">
                                <div className={styles.bottomPanelHeader}>
                                    <img alt="" className={styles.panelSeal} src={UI_ART.menuSeal} />
                                    <div>
                                        <span className={styles.panelKicker}>Daily Challenge</span>
                                        <strong className={styles.panelHeading}>New challenge in {dailyCountdown}</strong>
                                    </div>
                                </div>
                                <p className={styles.panelBodyCopy}>
                                    UTC seed rotation. Mutators, relic pacing, and floor pressure shift with each day.
                                </p>
                            </Panel>

                            <Panel className={styles.bottomPanel} padding="md" variant="default">
                                <div className={styles.bottomPanelHeader}>
                                    <img alt="" className={styles.panelSeal} src={UI_ART.menuSeal} />
                                    <div>
                                        <span className={styles.panelKicker}>Recent Descent</span>
                                        <strong className={styles.panelHeading}>
                                            {lastRunSummary ? `Floor ${lastRunSummary.highestLevel}` : 'No active record'}
                                        </strong>
                                    </div>
                                </div>
                                <p className={styles.panelBodyCopy}>{lastRunLabel}</p>
                            </Panel>
                        </div>
                    </main>

                    <aside className={styles.supportColumn}>
                        <Panel className={styles.supportPanel} padding="lg" variant="strong">
                            <Eyebrow>More Modes</Eyebrow>
                            <ScreenTitle as="h2" className={styles.supportHeading} role="screen">
                                Alternate descents
                            </ScreenTitle>
                            <div className={styles.modeGrid} role="group" aria-label="More run types">
                                <UiButton className={styles.modeButton} size="md" variant="secondary" onClick={onGauntletRun}>
                                    Gauntlet 10m
                                </UiButton>
                                <UiButton className={styles.modeButton} size="md" variant="secondary" onClick={onPuzzleStarter}>
                                    Puzzle
                                </UiButton>
                                <UiButton className={styles.modeButton} size="md" variant="secondary" onClick={onMirrorPuzzleRun}>
                                    Mirror Puzzle
                                </UiButton>
                                <UiButton
                                    className={styles.modeButton}
                                    size="md"
                                    variant="secondary"
                                    onClick={() => setMeditationOpen(true)}
                                >
                                    Meditation
                                </UiButton>
                                <UiButton className={styles.modeButton} size="md" variant="secondary" onClick={onWildRun}>
                                    Wild Run
                                </UiButton>
                                <UiButton className={styles.modeButton} size="md" variant="secondary" onClick={onPracticeRun}>
                                    Practice
                                </UiButton>
                                <UiButton
                                    className={styles.modeButton}
                                    size="md"
                                    variant="secondary"
                                    onClick={onScholarContractRun}
                                >
                                    Scholar
                                </UiButton>
                                <UiButton className={styles.modeButton} size="md" variant="secondary" onClick={onPinVowRun}>
                                    Pin vow
                                </UiButton>
                                <UiButton className={styles.modeButton} size="md" variant="ghost" onClick={onImportRun}>
                                    Import JSON
                                </UiButton>
                            </div>
                        </Panel>

                        <Panel className={styles.supportPanel} padding="lg" variant="default">
                            <Eyebrow>Run Archive</Eyebrow>
                            <ScreenTitle as="h2" className={styles.supportHeading} role="screen">
                                Profile and progress
                            </ScreenTitle>
                            <div className={styles.archiveStats}>
                                <div className={styles.archiveStat}>
                                    <span className={styles.archiveLabel}>Dailies Cleared</span>
                                    <strong className={styles.archiveValue}>
                                        {saveData.playerStats?.dailiesCompleted ?? 0}
                                    </strong>
                                </div>
                                <div className={styles.archiveStat}>
                                    <span className={styles.archiveLabel}>Best No-Powers Floor</span>
                                    <strong className={styles.archiveValue}>
                                        {saveData.playerStats?.bestFloorNoPowers ?? 0}
                                    </strong>
                                </div>
                            </div>
                            <details className={styles.relicDetails}>
                                <summary>Most-picked relics</summary>
                                {relicPickEntries.length > 0 ? (
                                    <ul className={styles.relicList}>
                                        {relicPickEntries.slice(0, 5).map(([id, count]) => (
                                            <li key={id}>
                                                <span>{RELIC_CATALOG[id]?.title ?? id}</span>
                                                <strong>{count}</strong>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className={styles.emptyState}>No relic history yet.</p>
                                )}
                            </details>
                        </Panel>

                        {showHowToPlay ? (
                            <Panel className={styles.supportPanel} padding="lg" variant="accent">
                                <Eyebrow tone="tight">How To Play</Eyebrow>
                                <ScreenTitle as="h2" className={styles.supportHeading} role="screen">
                                    Read, match, and protect the streak
                                </ScreenTitle>
                                <div className={styles.howToGrid}>
                                    <p>
                                        The board opens face-up for a short memorize window before the tiles hide again.
                                    </p>
                                    <p>Every clean pair grows score and streak. Wrong pairs cut the chain instead of wiping it.</p>
                                    <p>Every 2-pair chain earns a shard. Three shards restore one life.</p>
                                </div>
                                <UiButton fullWidth size="md" variant="secondary" onClick={() => void onDismissHowToPlay()}>
                                    Dismiss
                                </UiButton>
                            </Panel>
                        ) : null}
                    </aside>
                </div>
            </div>
            {meditationOpen ? (
                <OverlayModal
                    actions={[
                        {
                            label: 'Cancel',
                            onClick: () => setMeditationOpen(false),
                            variant: 'secondary'
                        },
                        {
                            label: 'Calm (no mutators)',
                            onClick: () => {
                                onMeditationRun();
                                setMeditationOpen(false);
                            },
                            variant: 'secondary'
                        },
                        {
                            label: 'Start with selection',
                            onClick: () => {
                                onMeditationRunWithMutators([...meditationSelection]);
                                setMeditationOpen(false);
                            },
                            variant: 'primary'
                        }
                    ]}
                    subtitle="Toggle mutators for a focused study run, or start calm with a clean ruleset."
                    title="Meditation setup"
                >
                    <ul className={styles.meditationMutatorList}>
                        {MEDITATION_PICK_MUTATOR_IDS.map((id) => {
                            const def = MUTATOR_CATALOG[id]!;
                            const inputId = `meditation-mutator-${id}`;
                            return (
                                <li className={styles.meditationMutatorRow} key={id}>
                                    <input
                                        checked={meditationSelection.has(id)}
                                        id={inputId}
                                        onChange={() => toggleMeditationMutator(id)}
                                        type="checkbox"
                                    />
                                    <label className={styles.meditationMutatorLabel} htmlFor={inputId}>
                                        <strong>{def.title}</strong>
                                        <span>{def.description}</span>
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                </OverlayModal>
            ) : null}
        </section>
    );
};

export default MainMenu;
