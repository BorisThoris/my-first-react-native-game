import type { MutatorId, RelicId, RunSummary, SaveData } from '../../shared/contracts';
import { MUTATOR_CATALOG } from '../../shared/mutators';
import { RELIC_CATALOG } from '../../shared/game-catalog';
import { formatNextUtcReset } from '../../shared/utc-countdown';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useFitShellZoom } from '../hooks/useFitShellZoom';
import { useShallow } from 'zustand/react/shallow';
import { UI_ART } from '../assets/ui';
import { desktopClient } from '../desktop-client';
import {
    isNarrowShortLandscapeForMenuStack,
    isShortLandscapeViewport,
    VIEWPORT_MOBILE_MAX,
    VIEWPORT_TABLET_MAX
} from '../breakpoints';
import { useViewportSize } from '../hooks/useViewportSize';
import { usePlatformTiltField } from '../platformTilt/usePlatformTiltField';
import { useAppStore } from '../store/useAppStore';
import { Eyebrow, MetaFrame, Panel, ScreenTitle, UiButton } from '../ui';
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
    onGauntletRun: (durationMs: number) => void;
    onPuzzleStarter: () => void;
    onMirrorPuzzleRun: () => void;
    onPracticeRun: () => void;
    onScholarContractRun: () => void;
    onMeditationRun: () => void;
    onMeditationRunWithMutators: (mutators: MutatorId[]) => void;
    onPinVowRun: () => void;
    onWildRun: () => void;
    onImportPuzzleJson: (rawJson: string) => boolean;
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
    onMeditationRun,
    onMeditationRunWithMutators,
    onPinVowRun,
    onWildRun,
    onImportPuzzleJson
}: MainMenuProps) => {
    const { importRunFromClipboard } = useAppStore(
        useShallow((state) => ({
            importRunFromClipboard: state.importRunFromClipboard
        }))
    );
    const puzzleImportInputRef = useRef<HTMLInputElement | null>(null);
    const shellRef = useRef<HTMLElement | null>(null);
    const menuFitMeasureRef = useRef<HTMLDivElement | null>(null); /* outer box; zoom applied on inner .content */
    const [meditationOpen, setMeditationOpen] = useState(false);
    const [meditationSelection, setMeditationSelection] = useState<Set<MutatorId>>(() => new Set());
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importJsonText, setImportJsonText] = useState('');
    const [importError, setImportError] = useState<string | null>(null);
    const [puzzleImportError, setPuzzleImportError] = useState<string | null>(null);
    const [nowMs, setNowMs] = useState(() => Date.now());
    const { tiltRef: menuFieldTiltRef } = usePlatformTiltField({
        enabled: true,
        reduceMotion,
        surfaceRef: shellRef,
        strength: 1
    });
    const { height, width } = useViewportSize();
    const isCompact = width <= 960 || height <= 760;
    const isPhoneViewport = width <= VIEWPORT_MOBILE_MAX;
    const isShortLandscapeShell = isShortLandscapeViewport(width, height);
    const ultraCompactPhone = width <= 430 && height <= 700;
    const touchCompactLayout = isPhoneViewport || isNarrowShortLandscapeForMenuStack(width, height);
    const prioritizeModesInHero = width <= VIEWPORT_TABLET_MAX;
    /** Layout-only compaction for wide, short desktop (not tied to fit-zoom, which runs for all sizes). */
    const shortDesktopShell = !touchCompactLayout && width >= 1024 && height <= 760;
    const ultraShortDesktopShell = shortDesktopShell && height <= 700;
    const fitShellPadding = width >= 1024 && height <= 760 ? 8 : 12;
    /* App.tsx sets outer .content zoom from --ui-scale when not compact; useFitShellZoom scales the menu column only (no DOM scroll). */
    const { fitZoom: rawFitZoom } = useFitShellZoom({
        enabled: true,
        measureRef: menuFitMeasureRef,
        viewportWidth: width,
        viewportHeight: height,
        padding: fitShellPadding
    });
    const shellFitZoom = rawFitZoom;
    const ctaSize = touchCompactLayout || shortDesktopShell ? 'md' : 'lg';
    const modeButtonSize = touchCompactLayout || shortDesktopShell ? 'sm' : 'md';
    const showArchivePanel = !prioritizeModesInHero;
    const showBottomCards = !(ultraCompactPhone || ultraShortDesktopShell || (isShortLandscapeShell && height <= 720));
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

    const openImportModal = (): void => {
        setImportModalOpen(true);
        setImportJsonText('');
        setImportError(null);
    };

    const closeImportModal = (): void => {
        setImportModalOpen(false);
        setImportJsonText('');
        setImportError(null);
    };

    const submitImport = (): void => {
        const ok = importRunFromClipboard(importJsonText);
        if (ok) {
            closeImportModal();
            return;
        }
        setImportError('Could not import that payload. Check the JSON and try again.');
    };

    const openPuzzleImportPicker = (): void => {
        setPuzzleImportError(null);
        puzzleImportInputRef.current?.click();
    };

    const onPuzzleImportSelected = (event: ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = (): void => {
            const text = typeof reader.result === 'string' ? reader.result : '';
            const ok = onImportPuzzleJson(text);
            if (ok) {
                setPuzzleImportError(null);
            } else {
                setPuzzleImportError('Invalid puzzle JSON. Expected a title (optional) and a tiles array with valid pairs.');
            }
        };
        reader.onerror = (): void => {
            setPuzzleImportError('Could not read that file.');
        };
        reader.readAsText(file);
    };

    useEffect(() => {
        const id = window.setInterval(() => setNowMs(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, []);

    const moreModesPanel = (
        <Panel
            className={`${styles.supportPanel} ${prioritizeModesInHero ? styles.inlineModesPanel : ''}`.trim()}
            padding="lg"
            variant="strong"
        >
            <Eyebrow>More Modes</Eyebrow>
            <ScreenTitle as="h2" className={styles.supportHeading} role="screen">
                Alternate descents
            </ScreenTitle>
            <div className={styles.modeGrid} role="group" aria-label="More run types">
                <UiButton
                    className={styles.modeButton}
                    size={modeButtonSize}
                    variant="secondary"
                    onClick={() => onGauntletRun(5 * 60 * 1000)}
                >
                    Gauntlet 5m
                </UiButton>
                <UiButton
                    className={styles.modeButton}
                    size={modeButtonSize}
                    variant="secondary"
                    onClick={() => onGauntletRun(10 * 60 * 1000)}
                >
                    Gauntlet 10m
                </UiButton>
                <UiButton
                    className={styles.modeButton}
                    size={modeButtonSize}
                    variant="secondary"
                    onClick={() => onGauntletRun(15 * 60 * 1000)}
                >
                    Gauntlet 15m
                </UiButton>
                <UiButton className={styles.modeButton} size={modeButtonSize} variant="secondary" onClick={onPuzzleStarter}>
                    Puzzle
                </UiButton>
                <UiButton className={styles.modeButton} size={modeButtonSize} variant="secondary" onClick={onMirrorPuzzleRun}>
                    Mirror Puzzle
                </UiButton>
                <UiButton className={styles.modeButton} size={modeButtonSize} variant="secondary" onClick={() => setMeditationOpen(true)}>
                    Meditation
                </UiButton>
                <UiButton className={styles.modeButton} size={modeButtonSize} variant="secondary" onClick={onWildRun}>
                    Wild Run
                </UiButton>
                <UiButton className={styles.modeButton} size={modeButtonSize} variant="secondary" onClick={onPracticeRun}>
                    Practice
                </UiButton>
                <UiButton className={styles.modeButton} size={modeButtonSize} variant="secondary" onClick={onScholarContractRun}>
                    Scholar
                </UiButton>
                <UiButton className={styles.modeButton} size={modeButtonSize} variant="secondary" onClick={onPinVowRun}>
                    Pin vow
                </UiButton>
                <UiButton
                    className={styles.modeButton}
                    data-testid="main-menu-low-cta"
                    size={modeButtonSize}
                    variant="ghost"
                    onClick={openImportModal}
                >
                    Import run JSON
                </UiButton>
                <input
                    accept="application/json,.json"
                    aria-hidden
                    ref={puzzleImportInputRef}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    type="file"
                    onChange={onPuzzleImportSelected}
                />
                <UiButton className={styles.modeButton} size={modeButtonSize} variant="ghost" onClick={openPuzzleImportPicker}>
                    Import puzzle JSON
                </UiButton>
            </div>
            {puzzleImportError ? (
                <p className={styles.importError} data-testid="puzzle-import-error" role="status">
                    {puzzleImportError}
                </p>
            ) : null}
        </Panel>
    );

    const archivePanel = showArchivePanel ? (
        <Panel className={styles.supportPanel} padding="lg" variant="default">
            <Eyebrow>Run Archive</Eyebrow>
            <ScreenTitle as="h2" className={styles.supportHeading} role="screen">
                Profile and progress
            </ScreenTitle>
            <div className={styles.archiveStats}>
                <div className={styles.archiveStat}>
                    <span className={styles.archiveLabel}>Dailies Cleared</span>
                    <strong className={styles.archiveValue}>{saveData.playerStats?.dailiesCompleted ?? 0}</strong>
                </div>
                <div className={styles.archiveStat}>
                    <span className={styles.archiveLabel}>Best No-Powers Floor</span>
                    <strong className={styles.archiveValue}>{saveData.playerStats?.bestFloorNoPowers ?? 0}</strong>
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
    ) : null;

    const howToPanel = showHowToPlay ? (
        <Panel className={styles.supportPanel} padding="lg" variant="accent">
            <Eyebrow tone="tight">How To Play</Eyebrow>
            <ScreenTitle as="h2" className={styles.supportHeading} role="screen">
                Read, match, and protect the streak
            </ScreenTitle>
            <div className={styles.howToGrid}>
                <p>The board opens face-up for a short memorize window before the tiles hide again.</p>
                <p>Every clean pair grows score and streak. Wrong pairs cut the chain instead of wiping it.</p>
                <p>Every 2-pair chain earns a shard. Three shards restore one life.</p>
            </div>
            <UiButton fullWidth size="md" variant="secondary" onClick={() => void onDismissHowToPlay()}>
                Dismiss
            </UiButton>
        </Panel>
    ) : null;

    return (
        <section
            className={`${styles.shell} ${isCompact ? styles.compactShell : ''} ${touchCompactLayout ? styles.touchCompactShell : ''} ${isShortLandscapeShell ? styles.shortTouchLandscapeShell : ''} ${shortDesktopShell ? styles.shortDesktopShell : ''} ${ultraShortDesktopShell ? styles.ultraShortDesktopShell : ''} ${ultraCompactPhone ? styles.ultraCompactPhoneShell : ''}`.trim()}
            ref={shellRef}
        >
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

            <div className={styles.fitViewport}>
                <div ref={menuFitMeasureRef} className={styles.fitMeasureOuter}>
                    <div className={styles.content} style={{ zoom: shellFitZoom }}>
                <header className={styles.metaRow} data-testid="main-menu-meta-strip">
                    <MetaFrame className={styles.metaPlaqueFrame}>
                        <div className={styles.metaCard}>
                            <span className={styles.metaLabel}>Build</span>
                            <strong className={styles.metaValue}>Steam Demo</strong>
                        </div>
                    </MetaFrame>
                    <MetaFrame className={styles.metaPlaqueFrame}>
                        <div className={styles.metaCard}>
                            <span className={styles.metaLabel}>Best Score</span>
                            <strong className={styles.metaValue}>
                                {bestScore > 0 ? bestScore.toLocaleString() : 'Unranked'}
                            </strong>
                        </div>
                    </MetaFrame>
                    <MetaFrame className={styles.metaPlaqueFrame}>
                        <div className={styles.metaCard}>
                            <span className={styles.metaLabel}>Daily Streak</span>
                            <strong className={styles.metaValue}>
                                {saveData.playerStats?.dailyStreakCosmetic ?? 0}
                            </strong>
                        </div>
                    </MetaFrame>
                    <MetaFrame className={styles.metaPlaqueFrame}>
                        <div className={styles.metaCard}>
                            <span className={styles.metaLabel}>Steam</span>
                            <strong className={styles.metaValue}>{steamConnected ? 'Connected' : 'Offline'}</strong>
                        </div>
                    </MetaFrame>
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

                        <MetaFrame className={styles.ctaMetaFrame} data-testid="main-menu-primary-meta-frame">
                            <Panel className={styles.ctaPanel} padding="md" variant="strong">
                                <div aria-hidden className={styles.ctaIllustratedBand}>
                                    <img alt="" className={styles.ctaBandSeal} src={UI_ART.menuSeal} />
                                    <img alt="" className={styles.ctaBandFlourish} src={UI_ART.dividerOrnament} />
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
                                        size={ctaSize}
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
                                        size={ctaSize}
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
                                        size={ctaSize}
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
                                        size={ctaSize}
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
                                        size={ctaSize}
                                        variant="ghost"
                                        onClick={() => void desktopClient.quitApp()}
                                    >
                                        <span className={styles.ctaContent}>
                                            <span className={styles.ctaTitle}>Exit Game</span>
                                            <span className={styles.ctaHint}>Close the desktop app</span>
                                        </span>
                                    </UiButton>
                                </div>
                            </Panel>
                        </MetaFrame>

                        {prioritizeModesInHero && ultraCompactPhone && showHowToPlay ? howToPanel : null}
                        {prioritizeModesInHero ? moreModesPanel : null}

                        {showBottomCards ? (
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
                        ) : null}

                        {prioritizeModesInHero && !(ultraCompactPhone && showHowToPlay) ? howToPanel : null}
                    </main>

                    {!prioritizeModesInHero || showArchivePanel || (!prioritizeModesInHero && showHowToPlay) ? (
                        <aside className={styles.supportColumn}>
                            {!prioritizeModesInHero ? moreModesPanel : null}
                            {archivePanel}
                            {!prioritizeModesInHero ? howToPanel : null}
                        </aside>
                    ) : null}
                </div>
                    </div>
                </div>
            </div>
            {importModalOpen ? (
                <OverlayModal
                    actions={[
                        {
                            label: 'Cancel',
                            onClick: closeImportModal,
                            variant: 'secondary'
                        },
                        {
                            label: 'Import',
                            disabled: importJsonText.trim().length === 0,
                            onClick: submitImport,
                            variant: 'primary'
                        }
                    ]}
                    subtitle="Paste a Memory Dungeon run JSON (from Copy run seed on game over)."
                    testId="run-import-modal"
                    title="Import run"
                >
                    <textarea
                        aria-invalid={importError ? 'true' : undefined}
                        aria-label="Run export JSON"
                        className={styles.importJsonField}
                        data-testid="run-import-json"
                        onChange={(event) => {
                            setImportJsonText(event.target.value);
                            if (importError) {
                                setImportError(null);
                            }
                        }}
                        placeholder='Example: {"v":1,"seed":0,"rules":7,"mode":"endless","mutators":[]}'
                        spellCheck={false}
                        value={importJsonText}
                    />
                    {importError ? (
                        <p className={styles.importError} data-testid="run-import-error" role="alert">
                            {importError}
                        </p>
                    ) : null}
                </OverlayModal>
            ) : null}
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
