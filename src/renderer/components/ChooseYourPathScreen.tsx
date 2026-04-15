import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type CSSProperties,
    type ReactElement
} from 'react';
import { useFitShellZoom } from '../hooks/useFitShellZoom';
import { useDragScroll } from '../hooks/useDragScroll';
import { isNarrowShortLandscapeForMenuStack, isShortLandscapeViewport, VIEWPORT_MOBILE_MAX } from '../breakpoints';
import { useViewportSize } from '../hooks/useViewportSize';
import { useShallow } from 'zustand/react/shallow';
import { formatNextUtcReset } from '../../shared/utc-countdown';
import type { MutatorId } from '../../shared/contracts';
import { MUTATOR_CATALOG } from '../../shared/mutators';
import {
    choosePathHeroModes,
    choosePathLibraryModes,
    RUN_MODE_GROUP_LABEL,
    type RunModeDefinition
} from '../../shared/run-mode-catalog';
import { resolveModePosterUrl } from '../assets/ui/modeArt';
import { UI_ART } from '../assets/ui';
import { Eyebrow, MetaFrame, ScreenTitle, UiButton } from '../ui';
import { useAppStore } from '../store/useAppStore';
import OverlayModal from './OverlayModal';
import metaStyles from './MetaScreen.module.css';
import styles from './ChooseYourPathScreen.module.css';

const MEDITATION_PICK_MUTATOR_IDS = (Object.keys(MUTATOR_CATALOG) as MutatorId[]).sort((a, b) =>
    MUTATOR_CATALOG[a]!.title.localeCompare(MUTATOR_CATALOG[b]!.title)
);

function cardsPerPageFromWidth(widthPx: number): number {
    if (widthPx <= 0) {
        return 1;
    }
    if (widthPx < 640) {
        return 2;
    }
    if (widthPx < 1100) {
        return 4;
    }
    return 5;
}

function LibrarySearchMagnifierIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
            <circle cx="10.5" cy="10.5" fill="none" r="6.75" stroke="currentColor" strokeWidth="2" />
            <path d="M16.25 16.25 21 21" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        </svg>
    );
}

function BackChevronIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 16 16" aria-hidden>
            <path
                d="M9.75 3.25 5 8l4.75 4.75"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.75"
            />
        </svg>
    );
}

const ChooseYourPathScreen = () => {
    const {
        bestFloorNoPowers,
        bestScore,
        closeSubscreen,
        importRunFromClipboard,
        startDailyRun,
        startGauntletRun,
        startMeditationRun,
        startMeditationRunWithMutators,
        startPinVowRun,
        startPracticeRun,
        startPuzzleRun,
        startPuzzleRunFromImport,
        startRun,
        startScholarContractRun,
        startWildRun
    } = useAppStore(
        useShallow((state) => ({
            bestFloorNoPowers: state.saveData.playerStats?.bestFloorNoPowers ?? 0,
            bestScore: state.saveData.bestScore,
            closeSubscreen: state.closeSubscreen,
            importRunFromClipboard: state.importRunFromClipboard,
            startDailyRun: state.startDailyRun,
            startGauntletRun: state.startGauntletRun,
            startMeditationRun: state.startMeditationRun,
            startMeditationRunWithMutators: state.startMeditationRunWithMutators,
            startPinVowRun: state.startPinVowRun,
            startPracticeRun: state.startPracticeRun,
            startPuzzleRun: state.startPuzzleRun,
            startPuzzleRunFromImport: state.startPuzzleRunFromImport,
            startRun: state.startRun,
            startScholarContractRun: state.startScholarContractRun,
            startWildRun: state.startWildRun
        }))
    );
    const [nowMs, setNowMs] = useState(() => Date.now());
    const dailyCountdown = formatNextUtcReset(nowMs);
    const pathFitMeasureRef = useRef<HTMLDivElement | null>(null);
    const puzzleImportInputRef = useRef<HTMLInputElement | null>(null);
    const librarySearchInputRef = useRef<HTMLInputElement | null>(null);
    const libraryScrollerRef = useRef<HTMLDivElement | null>(null);
    const { onPointerDownCapture: onLibraryDragPointerDown } = useDragScroll(libraryScrollerRef);
    const { height: vpH, width: vpW } = useViewportSize();
    const isPhoneViewport = vpW <= VIEWPORT_MOBILE_MAX;
    const isShortLandscapeShell = isShortLandscapeViewport(vpW, vpH);
    const pathFitPadding = vpW >= 1024 && vpH <= 760 ? 8 : 14;
    const pathTouchCompact = isPhoneViewport || isNarrowShortLandscapeForMenuStack(vpW, vpH);
    const presetButtonSize = pathTouchCompact ? 'sm' : 'md';
    const { fitZoom: rawPathFitZoom } = useFitShellZoom({
        enabled: true,
        measureRef: pathFitMeasureRef,
        viewportWidth: vpW,
        viewportHeight: vpH,
        padding: pathFitPadding
    });
    const pathShellFitZoom = rawPathFitZoom;

    const [libraryQuery, setLibraryQuery] = useState('');
    const [librarySearchOpen, setLibrarySearchOpen] = useState(false);
    const [cardsPerPage, setCardsPerPage] = useState(2);
    const [libraryPageIndex, setLibraryPageIndex] = useState(0);

    const [libraryDetailMode, setLibraryDetailMode] = useState<RunModeDefinition | null>(null);
    const [meditationOpen, setMeditationOpen] = useState(false);
    const [meditationSelection, setMeditationSelection] = useState<Set<MutatorId>>(() => new Set());
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importJsonText, setImportJsonText] = useState('');
    const [importError, setImportError] = useState<string | null>(null);
    const [puzzleImportError, setPuzzleImportError] = useState<string | null>(null);

    const heroModes = useMemo((): readonly RunModeDefinition[] => choosePathHeroModes(), []);

    const filteredLibraryModes = useMemo(() => {
        const q = libraryQuery.trim().toLowerCase();
        const base = choosePathLibraryModes();
        if (!q) {
            return base;
        }
        return base.filter(
            (m) => m.title.toLowerCase().includes(q) || m.shortDescription.toLowerCase().includes(q)
        );
    }, [libraryQuery]);

    const libraryPages = useMemo(() => {
        if (filteredLibraryModes.length === 0 || cardsPerPage < 1) {
            return [];
        }
        const chunks: RunModeDefinition[][] = [];
        for (let i = 0; i < filteredLibraryModes.length; i += cardsPerPage) {
            chunks.push(filteredLibraryModes.slice(i, i + cardsPerPage));
        }
        return chunks;
    }, [filteredLibraryModes, cardsPerPage]);

    const libraryPageCount = libraryPages.length;
    const hasLibrarySearchQuery = libraryQuery.trim().length > 0;

    useLayoutEffect(() => {
        const el = libraryScrollerRef.current;
        if (!el) {
            return undefined;
        }
        const ro = new ResizeObserver((entries) => {
            const w = entries[0]?.contentRect.width ?? el.clientWidth;
            setCardsPerPage(cardsPerPageFromWidth(Math.min(w, vpW)));
        });
        ro.observe(el);
        setCardsPerPage(cardsPerPageFromWidth(Math.min(el.clientWidth, vpW)));
        return () => {
            ro.disconnect();
        };
    }, [filteredLibraryModes.length, vpW]);

    useEffect(() => {
        const el = libraryScrollerRef.current;
        if (el) {
            el.scrollLeft = 0;
        }
        setLibraryPageIndex(0);
    }, [libraryQuery, filteredLibraryModes.length]);

    const onLibraryScroll = useCallback((): void => {
        const el = libraryScrollerRef.current;
        if (!el) {
            return;
        }
        const w = el.clientWidth;
        if (w <= 0 || libraryPageCount <= 0) {
            setLibraryPageIndex(0);
            return;
        }
        setLibraryPageIndex(Math.min(libraryPageCount - 1, Math.max(0, Math.round(el.scrollLeft / w))));
    }, [libraryPageCount]);

    useEffect(() => {
        if (!librarySearchOpen) {
            return undefined;
        }
        const id = window.requestAnimationFrame(() => {
            librarySearchInputRef.current?.focus();
        });
        return () => window.cancelAnimationFrame(id);
    }, [librarySearchOpen]);

    useEffect(() => {
        if (!librarySearchOpen) {
            return undefined;
        }
        const onKeyDown = (e: KeyboardEvent): void => {
            if (e.key === 'Escape') {
                e.preventDefault();
                setLibrarySearchOpen(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [librarySearchOpen]);

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
            const ok = startPuzzleRunFromImport(text);
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

    const runModeAction = (def: RunModeDefinition): void => {
        const { action } = def;
        switch (action.type) {
            case 'startRun':
                startRun();
                return;
            case 'startDailyRun':
                startDailyRun();
                return;
            case 'locked':
                return;
            case 'gauntlet':
                return;
            case 'puzzle':
                startPuzzleRun(action.puzzleId);
                return;
            case 'startWildRun':
                startWildRun();
                return;
            case 'startPracticeRun':
                startPracticeRun();
                return;
            case 'startScholarContractRun':
                startScholarContractRun();
                return;
            case 'startPinVowRun':
                startPinVowRun();
                return;
            case 'meditationSetup':
                setMeditationOpen(true);
                return;
            case 'importRunModal':
                openImportModal();
                return;
            case 'importPuzzleFile':
                openPuzzleImportPicker();
                return;
        }
    };

    const closeLibraryDetail = useCallback((): void => {
        setLibraryDetailMode(null);
    }, []);

    const cardVariantClass = (def: RunModeDefinition): string => {
        if (def.id === 'classic') {
            return styles.cardClassic;
        }
        if (def.id === 'daily') {
            return styles.cardDaily;
        }
        if (def.id === 'endless') {
            return `${styles.cardEndless} ${styles.cardDisabled}`;
        }
        if (def.group === 'utilities') {
            return styles.cardUtility;
        }
        if (def.action.type === 'gauntlet') {
            return styles.cardGauntlet;
        }
        return styles.cardMode;
    };

    const renderModeSurface = (def: RunModeDefinition): ReactElement => {
        const poster = resolveModePosterUrl(def.posterKey);
        const variant = cardVariantClass(def);
        const isLocked = def.availability === 'locked';
        const testId = def.testId;

        if (def.action.type === 'gauntlet') {
            return (
                <div className={`${styles.card} ${variant}`}>
                    <span className={styles.cardPoster} aria-hidden="true">
                        <img alt="" src={poster} />
                    </span>
                    <div className={styles.cardBodyWrap}>
                        <span className={styles.cardTitle}>{def.title}</span>
                        <p className={styles.cardBody}>{def.shortDescription}</p>
                        <div
                            className={styles.gauntletPresets}
                            data-gauntlet-presets
                            role="group"
                            aria-label="Gauntlet duration"
                        >
                            {def.action.presets.map((p) => (
                                <UiButton
                                    key={p.label}
                                    size={presetButtonSize}
                                    type="button"
                                    variant="secondary"
                                    onClick={() => startGauntletRun(p.durationMs)}
                                >
                                    {p.label}
                                </UiButton>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <button
                className={`${styles.card} ${variant}`}
                data-testid={testId}
                disabled={isLocked}
                type="button"
                onClick={() => runModeAction(def)}
            >
                <span className={styles.cardPoster} aria-hidden="true">
                    <img alt="" src={poster} />
                </span>
                <span className={styles.cardBodyWrap}>
                    {def.id === 'daily' ? <span className={styles.badge}>Featured</span> : null}
                    {isLocked ? <span className={`${styles.badge} ${styles.lockedBadge}`}>Locked</span> : null}
                    <span className={styles.cardTitle}>{def.title}</span>
                    <p className={styles.cardBody}>{def.shortDescription}</p>
                    {def.id === 'classic' ? (
                        <div className={styles.cardFooter}>
                            <span className={styles.cardStatLine}>
                                <span className={styles.cardStatValue}>
                                    {bestScore > 0 ? bestScore.toLocaleString() : '—'}
                                </span>
                                <span className={styles.cardStatLabel}>best score</span>
                            </span>
                            <span className={styles.cardStatLine}>
                                <span className={styles.cardStatValue}>
                                    {bestFloorNoPowers > 0 ? bestFloorNoPowers.toLocaleString() : '—'}
                                </span>
                                <span className={styles.cardStatLabel}>best floor</span>
                            </span>
                        </div>
                    ) : null}
                    {def.id === 'daily' ? <div className={styles.cardFooter}>Next rotation in {dailyCountdown}</div> : null}
                    {def.id === 'endless' ? <div className={styles.cardFooter}>Best floor: —</div> : null}
                </span>
            </button>
        );
    };

    const renderLibraryModeTile = (def: RunModeDefinition): ReactElement => {
        const poster = resolveModePosterUrl(def.posterKey);
        const variant = cardVariantClass(def);
        const groupLabel = RUN_MODE_GROUP_LABEL[def.group];
        return (
            <button
                aria-label={`${def.title}. Open details.`}
                className={`${styles.card} ${styles.libraryTileCard} ${variant}`}
                data-testid={def.testId}
                type="button"
                onClick={() => setLibraryDetailMode(def)}
            >
                <span className={styles.cardPoster} aria-hidden="true">
                    <img alt="" src={poster} />
                </span>
                <span className={styles.cardBodyWrap}>
                    <span className={styles.libraryTileKicker}>{groupLabel}</span>
                    <span className={`${styles.cardTitle} ${styles.libraryTileTitle}`}>{def.title}</span>
                    <p className={`${styles.cardBody} ${styles.libraryTileBody}`}>{def.shortDescription}</p>
                </span>
            </button>
        );
    };

    const buildLibraryDetailModalActions = (def: RunModeDefinition) => {
        const closeAct = { label: 'Close', onClick: closeLibraryDetail, variant: 'secondary' as const };
        if (def.availability !== 'available') {
            return [closeAct];
        }
        if (def.action.type === 'gauntlet') {
            return [closeAct];
        }
        switch (def.action.type) {
            case 'importRunModal':
                return [
                    {
                        label: 'Import run…',
                        onClick: (): void => {
                            closeLibraryDetail();
                            openImportModal();
                        },
                        variant: 'primary' as const
                    },
                    closeAct
                ];
            case 'importPuzzleFile':
                return [
                    {
                        label: 'Choose puzzle file…',
                        onClick: (): void => {
                            closeLibraryDetail();
                            openPuzzleImportPicker();
                        },
                        variant: 'primary' as const
                    },
                    closeAct
                ];
            case 'meditationSetup':
                return [
                    {
                        label: 'Set up run…',
                        onClick: (): void => {
                            closeLibraryDetail();
                            setMeditationOpen(true);
                        },
                        variant: 'primary' as const
                    },
                    closeAct
                ];
            default:
                return [
                    {
                        label: 'Play',
                        onClick: (): void => {
                            closeLibraryDetail();
                            runModeAction(def);
                        },
                        variant: 'primary' as const
                    },
                    closeAct
                ];
        }
    };

    useEffect(() => {
        const id = window.setInterval(() => setNowMs(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, []);

    return (
        <section
            aria-label="Choose Your Path"
            className={`${metaStyles.shell} ${styles.pathShell} ${pathTouchCompact ? styles.compactPathShell : ''} ${isShortLandscapeShell ? styles.shortTouchLandscapeShell : ''}`.trim()}
            role="region"
        >
            <input
                accept="application/json,.json"
                aria-hidden
                ref={puzzleImportInputRef}
                style={{ display: 'none' }}
                tabIndex={-1}
                type="file"
                onChange={onPuzzleImportSelected}
            />
            <div
                aria-hidden="true"
                className={styles.sceneBaseLayer}
                data-testid="choose-path-scene-layer"
                style={{ backgroundImage: `url(${UI_ART.gameplayScene})` }}
            />
            <div
                aria-hidden="true"
                className={styles.sceneLayer}
                data-testid="choose-path-scene-texture"
                style={{ backgroundImage: `url(${UI_ART.choosePathScene})` }}
            />
            <div aria-hidden="true" className={styles.scrim} />
            <div className={styles.pathFitViewport}>
                <div ref={pathFitMeasureRef} className={styles.pathFitMeasureOuter}>
                    <div className={styles.pathFitZoomInner} style={{ zoom: pathShellFitZoom }}>
                        <div className={styles.pathFitStack}>
                            <header className={`${metaStyles.header} ${styles.pathStackHeader}`}>
                                <div className={`${metaStyles.headerText} ${styles.pathHeaderText}`}>
                                    <button
                                        className={styles.pathBackButton}
                                        data-testid="choose-path-inline-back"
                                        type="button"
                                        onClick={closeSubscreen}
                                    >
                                        <BackChevronIcon className={styles.pathBackIcon} />
                                        <span>Back</span>
                                    </button>
                                    <Eyebrow tone="menu">Start a run</Eyebrow>
                                    <ScreenTitle as="h1" role="display">
                                        Choose Your Path
                                    </ScreenTitle>
                                    <p className={`${metaStyles.subtitle} ${styles.pathSubtitle}`}>
                                        Featured paths first. Tap a mode in More modes for full details and Play. Drag or
                                        swipe the row to browse. Use the search icon to filter.
                                    </p>
                                </div>
                            </header>

                            <div className={`${metaStyles.body} ${styles.pathBody}`}>
                                <section aria-label="Featured paths" className={styles.heroSection}>
                                    <Eyebrow className={styles.sectionEyebrow} tone="menu">
                                        Featured paths
                                    </Eyebrow>
                                    <div className={styles.cardGrid}>
                                        {heroModes.map((def) => (
                                            <div key={def.id} className={styles.cardShell}>
                                                <MetaFrame
                                                    className={
                                                        def.availability === 'locked'
                                                            ? `${styles.cardFrame} ${styles.cardFrameMuted}`
                                                            : styles.cardFrame
                                                    }
                                                >
                                                    {renderModeSurface(def)}
                                                </MetaFrame>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section
                                    aria-label="More modes"
                                    className={styles.librarySection}
                                    data-testid="choose-path-more-modes"
                                >
                                    <Eyebrow className={styles.sectionEyebrow} tone="menu">
                                        More modes
                                    </Eyebrow>
                                    {filteredLibraryModes.length === 0 ? (
                                        <>
                                            <div className={styles.libraryToolbar}>
                                                <div className={`${styles.librarySearchRail} ${styles.librarySearchRailWide}`}>
                                                    <div className={styles.librarySearchFieldLead}>
                                                        <span className={styles.librarySearchLeadIcon} aria-hidden>
                                                            <LibrarySearchMagnifierIcon className={styles.librarySearchIconGlyph} />
                                                        </span>
                                                        <label className={styles.libraryFilterLabel} htmlFor="choose-path-mode-filter">
                                                            Filter modes
                                                        </label>
                                                        <input
                                                            ref={librarySearchInputRef}
                                                            autoComplete="off"
                                                            className={`${styles.libraryFilterInput} ${styles.libraryFilterInputInset}`}
                                                            id="choose-path-mode-filter"
                                                            onChange={(e) => setLibraryQuery(e.target.value)}
                                                            placeholder="Search by name or description…"
                                                            type="search"
                                                            value={libraryQuery}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <p className={styles.libraryEmpty} role="status">
                                                No modes match this search.
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <div
                                                className={`${styles.libraryToolbar} ${librarySearchOpen ? styles.libraryToolbarSearchOpen : ''}`.trim()}
                                            >
                                                <div
                                                    className={`${styles.librarySearchRail} ${librarySearchOpen ? styles.librarySearchRailOpen : styles.librarySearchRailCollapsed}`}
                                                >
                                                    <button
                                                        aria-controls="choose-path-library-search-panel"
                                                        aria-expanded={librarySearchOpen}
                                                        aria-label={
                                                            librarySearchOpen
                                                                ? 'Close search'
                                                                : hasLibrarySearchQuery
                                                                  ? 'Edit search filter'
                                                                  : 'Search modes'
                                                        }
                                                        className={`${styles.librarySearchIconBtn} ${hasLibrarySearchQuery && !librarySearchOpen ? styles.librarySearchIconBtnFiltered : ''}`.trim()}
                                                        type="button"
                                                        onClick={() => setLibrarySearchOpen((open) => !open)}
                                                    >
                                                        <LibrarySearchMagnifierIcon className={styles.librarySearchIconGlyph} />
                                                    </button>
                                                    {librarySearchOpen ? (
                                                        <div className={styles.librarySearchExpand} id="choose-path-library-search-panel">
                                                            <label className={styles.libraryFilterLabel} htmlFor="choose-path-mode-filter">
                                                                Filter modes
                                                            </label>
                                                            <input
                                                                ref={librarySearchInputRef}
                                                                autoComplete="off"
                                                                className={styles.libraryFilterInput}
                                                                id="choose-path-mode-filter"
                                                                onChange={(e) => setLibraryQuery(e.target.value)}
                                                                placeholder="Search by name or description…"
                                                                type="search"
                                                                value={libraryQuery}
                                                            />
                                                        </div>
                                                    ) : null}
                                                </div>
                                                {libraryPageCount > 1 ? (
                                                    <div aria-label="Library pages" className={styles.libraryDotsWrap} role="group">
                                                        {libraryPages.map((_, i) => (
                                                            <button
                                                                key={i}
                                                                aria-current={i === libraryPageIndex ? 'true' : undefined}
                                                                aria-label={`Page ${i + 1} of ${libraryPageCount}`}
                                                                className={`${styles.libraryDot} ${i === libraryPageIndex ? styles.libraryDotActive : ''}`}
                                                                type="button"
                                                                onClick={() => {
                                                                    const el = libraryScrollerRef.current;
                                                                    if (!el) {
                                                                        return;
                                                                    }
                                                                    el.scrollTo({
                                                                        left: i * el.clientWidth,
                                                                        behavior: 'smooth'
                                                                    });
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </div>

                                            <div className={styles.libraryScrollerWrap}>
                                                <div
                                                    ref={libraryScrollerRef}
                                                    aria-label="More modes library, swipe or drag sideways to browse pages"
                                                    className={styles.libraryScroller}
                                                    onPointerDownCapture={onLibraryDragPointerDown}
                                                    onScroll={onLibraryScroll}
                                                >
                                                    {libraryPages.map((pageModes, pageIndex) => (
                                                        <div
                                                            key={pageIndex}
                                                            className={styles.libraryPage}
                                                            data-library-page-index={pageIndex}
                                                            style={
                                                                {
                                                                    '--path-library-cols': Math.min(
                                                                        cardsPerPage,
                                                                        pageModes.length
                                                                    )
                                                                } as CSSProperties
                                                            }
                                                        >
                                                            {pageModes.map((def) => (
                                                            <div
                                                                key={def.id}
                                                                className={styles.libraryCardCell}
                                                                data-library-card-cell
                                                                data-mode-group={def.group}
                                                                data-poster-key={def.posterKey}
                                                            >
                                                                    <MetaFrame
                                                                        className={
                                                                            def.availability === 'locked'
                                                                                ? `${styles.cardFrame} ${styles.cardFrameMuted}`
                                                                                : styles.cardFrame
                                                                        }
                                                                    >
                                                                        {renderLibraryModeTile(def)}
                                                                    </MetaFrame>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {puzzleImportError ? (
                                        <p className={styles.importError} data-testid="puzzle-import-error" role="status">
                                            {puzzleImportError}
                                        </p>
                                    ) : null}
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {libraryDetailMode ? (
                <OverlayModal
                    actions={buildLibraryDetailModalActions(libraryDetailMode)}
                    subtitle={RUN_MODE_GROUP_LABEL[libraryDetailMode.group]}
                    testId="library-mode-detail-modal"
                    title={libraryDetailMode.title}
                >
                    <p className={styles.libraryDetailDescription}>{libraryDetailMode.shortDescription}</p>
                    {libraryDetailMode.availability !== 'available' ? (
                        <p className={styles.libraryDetailMuted}>This mode is not available from here yet.</p>
                    ) : null}
                    {libraryDetailMode.action.type === 'gauntlet' && libraryDetailMode.availability === 'available' ? (
                        <div aria-label="Gauntlet duration" className={styles.libraryDetailGauntlet} role="group">
                            {libraryDetailMode.action.presets.map((p) => (
                                <UiButton
                                    key={p.label}
                                    size={presetButtonSize}
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        closeLibraryDetail();
                                        startGauntletRun(p.durationMs);
                                    }}
                                >
                                    {p.label}
                                </UiButton>
                            ))}
                        </div>
                    ) : null}
                </OverlayModal>
            ) : null}
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
                                startMeditationRun();
                                setMeditationOpen(false);
                            },
                            variant: 'secondary'
                        },
                        {
                            label: 'Start with selection',
                            onClick: () => {
                                startMeditationRunWithMutators([...meditationSelection]);
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
                            const inputId = `choose-path-meditation-mutator-${id}`;
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

export default ChooseYourPathScreen;
