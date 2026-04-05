import { ACHIEVEMENTS } from '../../shared/achievements';
import { MAX_LIVES, type AchievementId, type MutatorId, type RelicId, type RunState } from '../../shared/contracts';
import { canShuffleBoard } from '../../shared/game';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { UI_ART } from '../assets/ui';
import { VIEWPORT_MOBILE_MAX, VIEWPORT_TIGHT_MAX_H, VIEWPORT_TIGHT_MAX_W } from '../breakpoints';
import { useViewportSize } from '../hooks/useViewportSize';
import { usePlatformTiltField } from '../platformTilt/usePlatformTiltField';
import { StatTile, UiButton } from '../ui';
import { useAppStore } from '../store/useAppStore';
import MainMenuBackground from './MainMenuBackground';
import OverlayModal from './OverlayModal';
import TileBoard, { type TileBoardHandle } from './TileBoard';
import styles from './GameScreen.module.css';

interface GameScreenProps {
    achievements: AchievementId[];
    run: RunState;
    suppressStatusOverlays?: boolean;
}

const FORGIVENESS_HINT =
    'First miss each floor is free. Wrong pairs halve your streak (not zero). Lose a life → extra memorize next floor. Every 2-pair chain earns a shard; 3 shards heal 1 life.';

const BOARD_POWER_HINT =
    'Powers: Shuffle once per run (needs 2+ hidden pairs). Pin up to 3 hidden tiles. Destroy removes a pair for no score — earn charges on clean floors (≤1 miss), then tap Destroy and a tile.';

const MUTATOR_HUD_LABELS: Record<MutatorId, string> = {
    glass_floor: 'Glass floor',
    sticky_fingers: 'Sticky fingers',
    score_parasite: 'Score parasite',
    category_letters: 'Letters',
    short_memorize: 'Short memorize',
    wide_recall: 'Wide recall',
    silhouette_twist: 'Silhouette',
    n_back_anchor: 'N-back',
    distraction_channel: 'Distraction'
};

const RELIC_LABELS: Record<RelicId, string> = {
    extra_shuffle_charge: '+1 shuffle charge (now)',
    first_shuffle_free_per_floor: 'First shuffle each floor is free',
    memorize_bonus_ms: 'Longer memorize phases',
    destroy_bank_plus_one: '+1 destroy charge (now)',
    combo_shard_plus_step: '+1 combo shard (now)'
};

const getClearLifeBonusLabel = (result: NonNullable<RunState['lastLevelResult']>): string | null => {
    if (result.clearLifeGained !== 1) {
        return null;
    }

    if (result.clearLifeReason === 'perfect') {
        return 'Perfect floor bonus: +1 Life';
    }

    if (result.clearLifeReason === 'clean') {
        return 'Clean floor bonus: +1 Life';
    }

    return null;
};

const PauseIcon = () => (
    <svg aria-hidden="true" className={styles.actionIcon} viewBox="0 0 24 24">
        <path d="M8 5.5v13" />
        <path d="M16 5.5v13" />
    </svg>
);

const PlayIcon = () => (
    <svg aria-hidden="true" className={styles.actionIcon} viewBox="0 0 24 24">
        <path d="M9 7.25 17 12l-8 4.75V7.25Z" fill="currentColor" stroke="none" />
    </svg>
);

const SettingsIcon = () => (
    <svg aria-hidden="true" className={styles.actionIcon} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3.25" />
        <circle cx="12" cy="12" r="6.4" />
        <path d="M12 2.75v2.2" />
        <path d="M12 19.05v2.2" />
        <path d="m4.93 4.93 1.56 1.56" />
        <path d="m17.51 17.51 1.56 1.56" />
        <path d="M2.75 12h2.2" />
        <path d="M19.05 12h2.2" />
        <path d="m4.93 19.07 1.56-1.56" />
        <path d="m17.51 6.49 1.56-1.56" />
    </svg>
);

const MenuIcon = () => (
    <svg aria-hidden="true" className={styles.actionIcon} viewBox="0 0 24 24">
        <path d="M5 7.5h14" />
        <path d="M5 12h14" />
        <path d="M5 16.5h14" />
    </svg>
);

const FitBoardIcon = () => (
    <svg aria-hidden="true" className={styles.actionIcon} viewBox="0 0 24 24">
        <path d="M5 9V5h4" />
        <path d="M15 5h4v4" />
        <path d="M19 15v4h-4" />
        <path d="M9 19H5v-4" />
    </svg>
);

const ShuffleIcon = () => (
    <svg aria-hidden="true" className={styles.actionIcon} viewBox="0 0 24 24">
        <path d="M4 8h4l2-3h6" />
        <path d="M4 16h4l2 3h6" />
        <path d="M17 5l3 3-3 3" />
        <path d="M17 19l3-3-3-3" />
    </svg>
);

const PinIcon = () => (
    <svg aria-hidden="true" className={styles.actionIcon} viewBox="0 0 24 24">
        <path d="M12 3v8" />
        <path d="M8 11h8l-2 10H10L8 11Z" />
    </svg>
);

const DestroyIcon = () => (
    <svg aria-hidden="true" className={styles.actionIcon} viewBox="0 0 24 24">
        <path d="M6 6l12 12" />
        <path d="M18 6L6 18" />
        <rect height="14" rx="1.5" width="10" x="7" y="5" />
    </svg>
);

const PeekIcon = () => (
    <svg aria-hidden="true" className={styles.actionIcon} viewBox="0 0 24 24">
        <ellipse cx="12" cy="12" rx="9" ry="5.5" />
        <circle cx="12" cy="12" r="2.75" />
    </svg>
);

const UndoIcon = () => (
    <svg aria-hidden="true" className={styles.actionIcon} viewBox="0 0 24 24">
        <path d="M9 14 4 9l5-5" fill="none" />
        <path d="M5 9h11a4 4 0 0 1 4 4v0" fill="none" />
    </svg>
);

const StrayIcon = () => (
    <svg aria-hidden="true" className={styles.actionIcon} viewBox="0 0 24 24">
        <path d="M7 7h10v10H7z" />
        <path d="M10 10h4v4h-4z" fill="currentColor" opacity="0.35" />
    </svg>
);

const GameScreen = ({ achievements, run, suppressStatusOverlays = false }: GameScreenProps) => {
    const shellRef = useRef<HTMLElement | null>(null);
    const tileBoardRef = useRef<TileBoardHandle>(null);
    const { height, width } = useViewportSize();
    const [viewportResetToken, setViewportResetToken] = useState(0);
    const [gauntletNowMs, setGauntletNowMs] = useState(() => Date.now());
    const [distractionTick, setDistractionTick] = useState(0);
    const [rulesHintsExpanded, setRulesHintsExpanded] = useState(true);
    const [utilityFlyoutOpen, setUtilityFlyoutOpen] = useState(false);
    useEffect(() => {
        if (run.gauntletDeadlineMs === null) {
            return;
        }
        const tick = (): void => {
            setGauntletNowMs(Date.now());
        };
        tick();
        const id = window.setInterval(tick, 300);
        return () => window.clearInterval(id);
    }, [run.gauntletDeadlineMs]);
    const {
        boardPinMode,
        continueToNextLevel,
        destroyPairArmed,
        dismissPowersFtue,
        goToMenu,
        openCodexFromPlaying,
        openInventoryFromPlaying,
        openSettings,
        pause,
        peekModeArmed,
        pickRelic,
        pressTile,
        resume,
        saveData,
        settings,
        shuffleBoard,
        toggleBoardPinMode,
        toggleDestroyPairArmed,
        togglePeekMode,
        toggleStrayArm,
        triggerDebugReveal,
        undoResolvingFlip
    } = useAppStore(
        useShallow((state) => ({
            boardPinMode: state.boardPinMode,
            continueToNextLevel: state.continueToNextLevel,
            destroyPairArmed: state.destroyPairArmed,
            dismissPowersFtue: state.dismissPowersFtue,
            goToMenu: state.goToMenu,
            openCodexFromPlaying: state.openCodexFromPlaying,
            openInventoryFromPlaying: state.openInventoryFromPlaying,
            openSettings: state.openSettings,
            pause: state.pause,
            peekModeArmed: state.peekModeArmed,
            pickRelic: state.pickRelic,
            pressTile: state.pressTile,
            resume: state.resume,
            saveData: state.saveData,
            settings: state.settings,
            shuffleBoard: state.shuffleBoard,
            toggleBoardPinMode: state.toggleBoardPinMode,
            toggleDestroyPairArmed: state.toggleDestroyPairArmed,
            togglePeekMode: state.togglePeekMode,
            toggleStrayArm: state.toggleStrayArm,
            triggerDebugReveal: state.triggerDebugReveal,
            undoResolvingFlip: state.undoResolvingFlip
        }))
    );
    const distractionHudOn =
        run.activeMutators.includes('distraction_channel') &&
        settings.distractionChannelEnabled &&
        !settings.reduceMotion &&
        run.status === 'playing';
    useEffect(() => {
        if (!distractionHudOn) {
            return;
        }
        const id = window.setInterval(() => setDistractionTick((n) => n + 1), 880);
        return () => window.clearInterval(id);
    }, [distractionHudOn]);
    const { tiltRef: gameFieldTiltRef } = usePlatformTiltField({
        enabled: true,
        reduceMotion: settings.reduceMotion,
        surfaceRef: shellRef,
        strength: 1
    });
    const focusDimmedTileIds = useMemo(() => {
        const b = run.board;
        if (!b || !settings.tileFocusAssist || run.status !== 'playing') {
            return undefined;
        }
        if (b.flippedTileIds.length !== 1) {
            return undefined;
        }
        const openId = b.flippedTileIds[0];
        const idx = b.tiles.findIndex((t) => t.id === openId);
        if (idx < 0) {
            return undefined;
        }
        const c = b.columns;
        const row = Math.floor(idx / c);
        const col = idx % c;
        const neighborIdx: number[] = [];
        if (col > 0) {
            neighborIdx.push(idx - 1);
        }
        if (col < c - 1) {
            neighborIdx.push(idx + 1);
        }
        if (row > 0) {
            neighborIdx.push(idx - c);
        }
        if (row < b.rows - 1) {
            neighborIdx.push(idx + c);
        }
        const keep = new Set<number>([idx, ...neighborIdx]);
        const dim = new Set<string>();
        b.tiles.forEach((t, i) => {
            if (t.state === 'hidden' && !keep.has(i)) {
                dim.add(t.id);
            }
        });
        return dim;
    }, [run.board, run.status, settings.tileFocusAssist]);
    const allowGambitThirdFlip = run.gambitAvailableThisFloor && !run.gambitThirdFlipUsed;
    const wideRecallInPlay = run.activeMutators.includes('wide_recall');
    const silhouetteDuringPlay = run.activeMutators.includes('silhouette_twist');
    const nBackMutatorActive = run.activeMutators.includes('n_back_anchor');
    const isCompact = width <= VIEWPORT_MOBILE_MAX || height <= VIEWPORT_MOBILE_MAX;
    const isTight = width <= VIEWPORT_TIGHT_MAX_W || height <= VIEWPORT_TIGHT_MAX_H;
    const cameraViewportMode = true;
    const pauseActionLabel = run.status === 'paused' ? 'Resume' : 'Pause';
    const clearLifeBonusLabel = run.lastLevelResult ? getClearLifeBonusLabel(run.lastLevelResult) : null;

    if (!run.board) {
        return null;
    }

    const unlockedDefinitions = achievements
        .map((achievementId) => ACHIEVEMENTS.find((item) => item.id === achievementId))
        .filter((achievement): achievement is (typeof ACHIEVEMENTS)[number] => Boolean(achievement));
    const cols = run.board.columns;
    const rows = run.board.rows;
    /** Space above the board: single-row HUD + shell / foreground padding (compact rules in GameScreen.module.css). */
    const chromeReserveY = isTight ? 92 : 84;
    /** Horizontal insets: shell + gameForeground padding + left action toolbar. */
    const chromeReserveX = (isTight ? 20 : 32) + 56;
    const boardHorizontalBudget = Math.max(160, width - chromeReserveX);
    const boardVerticalBudget = Math.max(200, height - chromeReserveY);
    const minTile = isCompact ? 48 : 56;
    const tileFit = Math.floor(Math.min(boardHorizontalBudget / cols, boardVerticalBudget / rows));
    /** No artificial max on small viewports — tiles scale up to fill the playable area. */
    const tileSize = Math.max(minTile, tileFit);
    const boardStyle = {
        ['--board-width' as string]: `${tileSize * cols}px`,
        ['--board-height' as string]: `${tileSize * rows}px`
    };
    const showForgivenessHint =
        run.board.level <= 3 &&
        (run.status === 'memorize' || run.status === 'playing') &&
        run.board.matchedPairs === 0 &&
        run.stats.tries === 0;
    const showBoardPowerBar = run.status === 'playing';
    const shuffleDisabled = !canShuffleBoard(run);
    const shuffleTitle = run.activeContract?.noShuffle
        ? 'Scholar contract: shuffle disabled'
        : shuffleDisabled
          ? run.shuffleCharges < 1 &&
              !(run.freeShuffleThisFloor && run.relicIds.includes('first_shuffle_free_per_floor'))
            ? 'No shuffle charges'
            : run.board.flippedTileIds.length > 0
              ? 'Finish the current flip first'
              : 'Need at least two hidden pairs to shuffle'
          : 'Shuffle hidden tiles (1 charge this run)';
    const showPowersFtue =
        (run.status === 'playing' || run.status === 'memorize') &&
        run.board.level <= 2 &&
        !saveData.powersFtueSeen;
    void distractionTick;
    const gauntletRemainingMs =
        run.gauntletDeadlineMs !== null ? Math.max(0, run.gauntletDeadlineMs - gauntletNowMs) : null;
    const hudModeLabel =
        run.gameMode === 'daily' && run.dailyDateKeyUtc
            ? `Daily ${run.dailyDateKeyUtc}`
            : gauntletRemainingMs !== null
              ? `Gauntlet ${Math.ceil(gauntletRemainingMs / 1000)}s`
              : run.activeContract?.noShuffle
                ? 'Scholar Contract'
                : run.gameMode === 'meditation'
                  ? 'Meditation Run'
                  : run.wildMenuRun
                    ? 'Wild Run'
                    : 'Arcade Run';
    const nBackLabel =
        run.nBackAnchorPairKey && nBackMutatorActive ? `Anchor ${run.nBackAnchorPairKey.slice(0, 6)}` : null;
    const boardPresentationClass =
        settings.boardPresentation === 'spaghetti'
            ? styles.boardStageSpaghetti
            : settings.boardPresentation === 'breathing' && !settings.reduceMotion
              ? styles.boardStageBreathing
              : '';
    const destroyDisabled = run.destroyPairCharges < 1 && !destroyPairArmed;
    return (
        <section
            className={`${styles.shell} ${cameraViewportMode ? styles.mobileCameraShell : ''}`}
            data-mobile-camera-mode={cameraViewportMode ? 'true' : 'false'}
            data-testid="game-shell"
            ref={shellRef}
        >
            <MainMenuBackground
                fieldTiltRef={gameFieldTiltRef}
                height={height}
                reduceMotion={settings.reduceMotion}
                width={width}
            />
            <div
                aria-hidden="true"
                className={styles.stageBackdrop}
                style={{ backgroundImage: `url(${UI_ART.gameplayScene})` }}
            />
            <div className={`${styles.gameForeground} ${cameraViewportMode ? styles.mobileCameraForeground : ''}`}>
                <h1 className={styles.srOnly}>Level {run.board.level}</h1>
                <div
                    className={`${styles.gamePlayLayout} ${cameraViewportMode ? styles.mobileCameraGamePlayLayout : ''}`.trim()}
                >
                    <aside
                        aria-label="Game actions"
                        className={`${styles.leftToolbar} ${cameraViewportMode ? styles.mobileCameraLeftToolbar : ''}`.trim()}
                    >
                        <div
                            aria-label="Game controls"
                            aria-orientation="vertical"
                            className={styles.toolbarSection}
                            role="toolbar"
                        >
                            <button
                                aria-expanded={utilityFlyoutOpen}
                                aria-label={utilityFlyoutOpen ? 'Hide utility menu' : 'Show utility menu'}
                                className={`${styles.iconAction} ${utilityFlyoutOpen ? styles.iconActionActive : ''}`}
                                onClick={() => setUtilityFlyoutOpen((open) => !open)}
                                title="Open utility menu"
                                type="button"
                            >
                                <MenuIcon />
                            </button>
                            {cameraViewportMode ? (
                                <button
                                    aria-label="Fit board"
                                    className={styles.iconAction}
                                    onClick={() => {
                                        setViewportResetToken((current) => current + 1);
                                    }}
                                    title="Fit board"
                                    type="button"
                                >
                                    <FitBoardIcon />
                                </button>
                            ) : null}
                            <button
                                aria-label={pauseActionLabel}
                                className={styles.iconAction}
                                onClick={run.status === 'paused' ? resume : pause}
                                title={pauseActionLabel}
                                type="button"
                            >
                                {run.status === 'paused' ? <PlayIcon /> : <PauseIcon />}
                            </button>
                            <button
                                aria-label="Settings"
                                className={styles.iconAction}
                                onClick={() => openSettings('playing')}
                                title="Settings"
                                type="button"
                            >
                                <SettingsIcon />
                            </button>
                            {import.meta.env.DEV &&
                            settings.debugFlags.showDebugTools &&
                            settings.debugFlags.allowBoardReveal ? (
                                <UiButton
                                    className={styles.toolbarDebugBtn}
                                    size="sm"
                                    variant="debug"
                                    onClick={triggerDebugReveal}
                                >
                                    Reveal
                                </UiButton>
                            ) : null}
                        </div>
                        {utilityFlyoutOpen ? (
                            <div className={styles.utilityFlyout} role="group" aria-label="In-game menu">
                                <button
                                    className={styles.flyoutAction}
                                    onClick={run.status === 'paused' ? resume : pause}
                                    type="button"
                                >
                                    <strong>{pauseActionLabel}</strong>
                                    <span>{run.status === 'paused' ? 'Return to the board' : 'Freeze the run immediately'}</span>
                                </button>
                                <button className={styles.flyoutAction} onClick={() => openSettings('playing')} type="button">
                                    <strong>Settings</strong>
                                    <span>Open the live run-settings shell</span>
                                </button>
                                <button
                                    className={styles.flyoutAction}
                                    onClick={() => {
                                        setUtilityFlyoutOpen(false);
                                        openInventoryFromPlaying();
                                    }}
                                    type="button"
                                >
                                    <strong>Inventory</strong>
                                    <span>Active run loadout and charges</span>
                                </button>
                                <button
                                    className={styles.flyoutAction}
                                    onClick={() => {
                                        setUtilityFlyoutOpen(false);
                                        openCodexFromPlaying();
                                    }}
                                    type="button"
                                >
                                    <strong>Codex</strong>
                                    <span>Read-only rules and reference</span>
                                </button>
                            </div>
                        ) : null}
                        {showForgivenessHint ? (
                            <div className={styles.toolbarSection}>
                                <button
                                    aria-expanded={rulesHintsExpanded}
                                    aria-label={rulesHintsExpanded ? 'Hide rule tips' : 'Show rule tips'}
                                    className={styles.rulesToggle}
                                    onClick={() => setRulesHintsExpanded((v) => !v)}
                                    type="button"
                                >
                                    {rulesHintsExpanded ? 'Hide' : 'Rules'}
                                </button>
                            </div>
                        ) : null}
                        {showBoardPowerBar ? (
                            <div
                                aria-label="Board powers"
                                aria-orientation="vertical"
                                className={styles.toolbarSection}
                                role="toolbar"
                            >
                                <button
                                    aria-label={`Shuffle hidden tiles. Charges: ${run.shuffleCharges}`}
                                    aria-pressed={false}
                                    className={`${styles.iconAction} ${styles.iconActionWithBadge}`}
                                    disabled={shuffleDisabled}
                                    onClick={() => {
                                        if (shuffleDisabled) {
                                            return;
                                        }
                                        const handle = tileBoardRef.current;
                                        if (handle) {
                                            handle.runShuffleAnimation(() => shuffleBoard());
                                        } else {
                                            shuffleBoard();
                                        }
                                    }}
                                    title={shuffleTitle}
                                    type="button"
                                >
                                    <ShuffleIcon />
                                    <span className={styles.powerBadge}>{run.shuffleCharges}</span>
                                </button>
                                <button
                                    aria-label={boardPinMode ? 'Exit pin mode' : 'Pin mode — tap tiles to mark'}
                                    aria-pressed={boardPinMode}
                                    className={`${styles.iconAction} ${boardPinMode ? styles.iconActionActive : ''}`}
                                    onClick={() => toggleBoardPinMode()}
                                    title="Pin up to 3 hidden tiles for planning"
                                    type="button"
                                >
                                    <PinIcon />
                                </button>
                                <button
                                    aria-label={`Destroy a hidden pair. Charges: ${run.destroyPairCharges}. ${destroyPairArmed ? 'Tap a tile' : 'Arm then tap a tile'}`}
                                    aria-pressed={destroyPairArmed}
                                    className={`${styles.iconAction} ${styles.iconActionWithBadge} ${destroyPairArmed ? styles.iconActionActive : ''}`}
                                    disabled={destroyDisabled}
                                    onClick={() => toggleDestroyPairArmed()}
                                    title={
                                        run.destroyPairCharges < 1
                                            ? 'Earn destroy charges on clean floors (≤1 miss)'
                                            : destroyPairArmed
                                              ? 'Tap a hidden tile to destroy its pair (no score)'
                                              : 'Arm destroy, then tap a hidden tile'
                                    }
                                    type="button"
                                >
                                    <DestroyIcon />
                                    <span className={styles.powerBadge}>{run.destroyPairCharges}</span>
                                </button>
                                <button
                                    aria-label={`Peek one hidden tile. Charges: ${run.peekCharges}. ${peekModeArmed ? 'Tap a tile' : 'Arm peek then tap'}`}
                                    aria-pressed={peekModeArmed}
                                    className={`${styles.iconAction} ${styles.iconActionWithBadge} ${peekModeArmed ? styles.iconActionActive : ''}`}
                                    disabled={run.peekCharges < 1}
                                    onClick={() => togglePeekMode()}
                                    title={
                                        run.peekCharges < 1
                                            ? 'No peek charges this floor'
                                            : peekModeArmed
                                              ? 'Tap a hidden tile to peek (uses 1 charge)'
                                              : 'Arm peek, then tap a hidden tile'
                                    }
                                    type="button"
                                >
                                    <PeekIcon />
                                    <span className={styles.powerBadge}>{run.peekCharges}</span>
                                </button>
                                <button
                                    aria-label={`Remove one stray tile. Charges: ${run.strayRemoveCharges}. ${run.strayRemoveArmed ? 'Tap a tile' : 'Arm then tap'}`}
                                    aria-pressed={run.strayRemoveArmed}
                                    className={`${styles.iconAction} ${styles.iconActionWithBadge} ${run.strayRemoveArmed ? styles.iconActionActive : ''}`}
                                    disabled={run.strayRemoveCharges < 1}
                                    onClick={() => toggleStrayArm()}
                                    title={
                                        run.strayRemoveCharges < 1
                                            ? 'No stray-remove charges'
                                            : run.strayRemoveArmed
                                              ? 'Tap a hidden tile to remove it from play'
                                              : 'Arm stray remove, then tap a hidden tile'
                                    }
                                    type="button"
                                >
                                    <StrayIcon />
                                    <span className={styles.powerBadge}>{run.strayRemoveCharges}</span>
                                </button>
                            </div>
                        ) : null}
                        {run.status === 'resolving' && run.undoUsesThisFloor > 0 ? (
                            <div
                                aria-label="Resolve options"
                                aria-orientation="vertical"
                                className={styles.toolbarSection}
                                role="toolbar"
                            >
                                <button
                                    aria-label="Undo last flip (uses your one undo this floor)"
                                    className={styles.iconAction}
                                    onClick={() => undoResolvingFlip()}
                                    title="Undo the current flip before it resolves"
                                    type="button"
                                >
                                    <UndoIcon />
                                </button>
                            </div>
                        ) : null}
                    </aside>
                    <div
                        className={`${styles.mainGameColumn} ${cameraViewportMode ? styles.mobileCameraMainColumn : ''}`.trim()}
                    >
                        {showPowersFtue ? (
                            <div className={styles.ftueBanner} role="status">
                                <span>
                                    Board powers: shuffle (charges), pin mode, destroy (earn charges on clean floors). Try
                                    Daily / Scholar run from the main menu for more challenge types.
                                </span>
                                <button className={styles.ftueDismiss} onClick={() => void dismissPowersFtue()} type="button">
                                    Got it
                                </button>
                            </div>
                        ) : null}
                        <header
                            className={`${styles.hudRow} ${cameraViewportMode ? styles.mobileCameraHud : ''}`}
                            data-testid="game-hud"
                        >
                            <div className={`${styles.floatingDeck} ${styles.statsDeck} ${styles.hudDeck}`} role="group" aria-label="Run stats">
                                <div className={styles.deckCluster}>
                                    <div className={`${styles.hudSegment} ${styles.hudScoreSegment}`}>
                                        <span className={styles.statKey}>Score</span>
                                        <span className={`${styles.statVal} ${styles.statValScore}`}>
                                            {run.stats.totalScore.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className={`${styles.hudSegment} ${styles.floorBadge}`} title="Current floor">
                                        <span className={styles.floorLabel}>Floor</span>
                                        <span className={styles.floorValue}>{run.board.level}</span>
                                    </div>
                                    <div className={`${styles.hudSegment} ${styles.hudLivesSegment}`}>
                                        <span className={styles.statKey}>Lives</span>
                                        <div className={styles.lifeTrack} aria-label={`${run.lives} lives remaining`}>
                                            {Array.from({ length: MAX_LIVES }).map((_, index) => (
                                                <span
                                                    aria-hidden="true"
                                                    className={index < run.lives ? styles.lifeHeartActive : styles.lifeHeartInactive}
                                                    key={`life-${index}`}
                                                >
                                                    ♥
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={`${styles.hudSegment} ${styles.statPill}`}>
                                        <span className={styles.statKey}>Shards</span>
                                        <span className={styles.statVal}>{run.stats.comboShards}</span>
                                        <span className={styles.statSubline}>Guards {run.stats.guardTokens}</span>
                                    </div>
                                    <div className={`${styles.hudSegment} ${styles.hudMetaSegment}`}>
                                        <span className={styles.statKey}>Mode</span>
                                        <span className={styles.statVal}>{hudModeLabel}</span>
                                        {nBackLabel ? <span className={styles.statSubline}>{nBackLabel}</span> : null}
                                        {run.activeMutators.length > 0 ? (
                                            <div className={styles.mutatorRow}>
                                                {run.activeMutators.map((mutator) => (
                                                    <div
                                                        className={styles.mutatorChip}
                                                        key={mutator}
                                                        title={MUTATOR_HUD_LABELS[mutator] ?? mutator}
                                                    >
                                                        {MUTATOR_HUD_LABELS[mutator] ?? mutator}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className={styles.statSubline}>No active mutators</span>
                                        )}
                                    </div>
                                    <div className={styles.statRail}>
                                        {gauntletRemainingMs !== null ? (
                                            <div className={styles.statPillCompact} title="Gauntlet time left">
                                                <span className={styles.statKey}>Time</span>
                                                <span className={styles.statVal}>
                                                    {Math.ceil(gauntletRemainingMs / 1000)}s
                                                </span>
                                            </div>
                                        ) : null}
                                        {run.activeContract?.noShuffle ? (
                                            <div className={styles.statPillCompact}>
                                                <span className={styles.statKey}>Contract</span>
                                                <span className={styles.statVal}>Scholar</span>
                                            </div>
                                        ) : null}
                                        {run.gameMode === 'meditation' ? (
                                            <div className={styles.statPillCompact} title="Meditation run">
                                                <span className={styles.statKey}>Mode</span>
                                                <span className={styles.statVal}>Meditation</span>
                                            </div>
                                        ) : null}
                                        {run.wildMenuRun ? (
                                            <div className={styles.statPillCompact} title="Wild joker run">
                                                <span className={styles.statKey}>Wild</span>
                                                <span className={styles.statVal}>On</span>
                                            </div>
                                        ) : null}
                                        {run.gameMode === 'daily' && run.dailyDateKeyUtc ? (
                                            <div className={styles.statPillCompact} title="UTC daily id">
                                                <span className={styles.statKey}>Daily</span>
                                                <span className={styles.statVal}>{run.dailyDateKeyUtc}</span>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </header>
                        {showForgivenessHint && rulesHintsExpanded ? (
                            <div className={styles.ruleHintStack}>
                                <p className={styles.ruleHint} data-testid="forgiveness-hint" role="note">
                                    {FORGIVENESS_HINT}
                                </p>
                                <p className={styles.ruleHint} data-testid="board-power-hint" role="note">
                                    {BOARD_POWER_HINT}
                                </p>
                            </div>
                        ) : null}

                        <div
                            className={`${styles.boardStage} ${cameraViewportMode ? styles.boardStageCamera : ''} ${boardPresentationClass}`.trim()}
                        >
                            <div className={styles.boardGlow} aria-hidden="true" />
                            <TileBoard
                                ref={tileBoardRef}
                                allowGambitThirdFlip={allowGambitThirdFlip}
                                board={run.board}
                                debugPeekActive={run.debugPeekActive}
                                dimmedTileIds={focusDimmedTileIds}
                                interactive={run.status === 'playing'}
                                frameStyle={cameraViewportMode ? undefined : boardStyle}
                                mobileCameraMode={cameraViewportMode}
                                nBackAnchorPairKey={run.nBackAnchorPairKey}
                                nBackMutatorActive={nBackMutatorActive}
                                peekRevealedTileIds={run.peekRevealedTileIds}
                                pinnedTileIds={run.pinnedTileIds}
                                onTileSelect={(tileId) => {
                                    if (run.status === 'playing') {
                                        pressTile(tileId);
                                    }
                                }}
                                previewActive={run.status === 'memorize'}
                                reduceMotion={settings.reduceMotion}
                                runStatus={run.status}
                                silhouetteDuringPlay={silhouetteDuringPlay}
                                viewportResetToken={viewportResetToken}
                                wideRecallInPlay={wideRecallInPlay}
                            />
                            {distractionHudOn ? (
                                <div aria-hidden className={styles.distractionHud}>
                                    {(distractionTick % 7) + 3}
                                </div>
                            ) : null}
                            {unlockedDefinitions.length > 0 ? (
                                <div
                                    className={`${styles.toastRail} ${cameraViewportMode ? styles.mobileCameraToastRail : ''}`}
                                    role="status"
                                >
                                    {unlockedDefinitions.map((a) => (
                                        <div className={styles.toast} key={a.id}>
                                            <span className={styles.toastTitle}>{a.title}</span>
                                            <span className={styles.toastDesc}>{a.description}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                {!suppressStatusOverlays && run.status === 'paused' && (
                    <OverlayModal
                        actions={[
                            { label: 'Resume', onClick: resume, variant: 'primary' },
                            { label: 'Retreat', onClick: goToMenu, variant: 'danger' }
                        ]}
                        subtitle="The board, memorize phase, and debug timers are frozen until you return."
                        title="Run Paused"
                    />
                )}

                {!suppressStatusOverlays && run.relicOffer ? (
                    <OverlayModal
                        actions={run.relicOffer.options.map((id) => ({
                            label: RELIC_LABELS[id] ?? id,
                            onClick: () => pickRelic(id),
                            variant: 'primary' as const
                        }))}
                        subtitle="Choose one relic. It applies immediately and lasts the rest of the run."
                        title={`Relic — tier ${run.relicOffer.tier}`}
                    />
                ) : null}

                {!suppressStatusOverlays && run.status === 'levelComplete' && run.lastLevelResult && !run.relicOffer && (
                    <OverlayModal
                        actions={[
                            { label: 'Continue', onClick: continueToNextLevel, variant: 'primary' },
                            { label: 'Main Menu', onClick: goToMenu, variant: 'secondary' }
                        ]}
                        subtitle={`Level ${run.lastLevelResult.level} cleared. Score +${run.lastLevelResult.scoreGained}. Try Daily or Scholar contract from the menu for different goals.`}
                        title="Floor Cleared"
                    >
                        {clearLifeBonusLabel ? <p className={styles.modalNote}>{clearLifeBonusLabel}</p> : null}
                        <div className={styles.modalStats}>
                            <StatTile
                                density="minimal"
                                label="Rating"
                                value={run.lastLevelResult.rating}
                                valueFirst
                            />
                            <StatTile
                                density="minimal"
                                label="Mistakes"
                                value={run.lastLevelResult.mistakes}
                                valueFirst
                            />
                            <StatTile
                                density="minimal"
                                label="Lives"
                                value={run.lastLevelResult.livesRemaining}
                                valueFirst
                            />
                            <StatTile
                                density="minimal"
                                label="Total"
                                value={run.stats.totalScore.toLocaleString()}
                                valueFirst
                            />
                        </div>
                    </OverlayModal>
                )}
            </div>
        </section>
    );
};

export default GameScreen;
