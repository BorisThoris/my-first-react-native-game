import { ACHIEVEMENTS } from '../../shared/achievements';
import {
    MAX_PINNED_TILES,
    type AchievementId,
    type RelicId,
    type RunState,
    type Settings
} from '../../shared/contracts';
import { computeFocusDimmedTileIds } from '../../shared/focusDimmedTileIds';
import { canRegionShuffle, canRegionShuffleRow, canShuffleBoard } from '../../shared/game';
import { RELIC_MILESTONE_FLOORS } from '../../shared/relics';
import { useNotificationStore } from '@cross-repo-libs/notifications';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { UI_ART } from '../assets/ui';
import { isNarrowShortLandscapeForMenuStack, VIEWPORT_MOBILE_MAX } from '../breakpoints';
import { deriveCameraViewportMode } from '../../shared/cameraViewportMode';
import { useDistractionChannelTick } from '../hooks/useDistractionChannelTick';
import { useHudPoliteLiveAnnouncement } from '../hooks/useHudPoliteLiveAnnouncement';
import { useViewportSize } from '../hooks/useViewportSize';
import { usePlatformTiltField } from '../platformTilt/usePlatformTiltField';
import { StatTile } from '../ui';
import { useAppStore } from '../store/useAppStore';
import GameLeftToolbar from './GameLeftToolbar';
import GameplayHudBar from './GameplayHudBar';
import MainMenuBackground from './MainMenuBackground';
import OverlayModal from './OverlayModal';
import TileBoard, { type TileBoardHandle } from './TileBoard';
import styles from './GameScreen.module.css';

/** OVR-007 / HUD-020: decoy readout for `distraction_channel` — not gameplay state; hidden when reduce motion or assist toggle is off. */
const DISTRACTION_CHANNEL_LABEL = 'Chaff';

interface GameScreenProps {
    achievements: AchievementId[];
    run: RunState;
    suppressStatusOverlays?: boolean;
}

const FORGIVENESS_HINT =
    'First miss each floor is free. Wrong pairs halve your streak (not zero). Lose a life → extra memorize next floor. Every 2-pair chain earns a shard; 3 shards heal 1 life.';

const BOARD_POWER_HINT =
    'Powers: Shuffle once per run (needs 2+ hidden pairs). Pin up to 3 hidden tiles. Destroy removes a pair for no score — earn charges on clean floors (≤1 miss), then tap Destroy and a tile.';

const POWERS_FTUE_TOAST =
    'Board powers: shuffle (charges), pin mode, destroy (earn charges on clean floors). Try Daily / Scholar run from the main menu for more challenge types.';

/** PLAY-009: pair-index rings on face-down DOM tiles only for very early floors + until powers FTUE is cleared. */
const TUTORIAL_PAIR_MARKER_MAX_LEVEL = 2;

const RELIC_LABELS: Record<RelicId, string> = {
    extra_shuffle_charge: '+1 shuffle charge (now)',
    first_shuffle_free_per_floor: 'First shuffle each floor is free',
    memorize_bonus_ms: 'Longer memorize phases',
    destroy_bank_plus_one: '+1 destroy charge (now)',
    combo_shard_plus_step: '+1 combo shard (now)',
    memorize_under_short_memorize: '+220ms memorize when Short memorize is active',
    parasite_ward_once: 'Ignore next parasite life loss once',
    region_shuffle_free_first: 'First row shuffle each floor is free'
};

/** OVR-012 — milestone tiers 1–3 align with floors in {@link RELIC_MILESTONE_FLOORS} (reference 05–07 modal family). */
const getRelicOfferTitle = (tier: number): string =>
    `Relic offer (${tier} of ${RELIC_MILESTONE_FLOORS.length})`;

const getRelicOfferSubtitle = (tier: number): string => {
    const idx = Math.max(0, Math.min(tier - 1, RELIC_MILESTONE_FLOORS.length - 1));
    const floor = RELIC_MILESTONE_FLOORS[idx];
    const which = ['First', 'Second', 'Third'][idx] ?? 'Milestone';

    return `${which} milestone relic after clearing floor ${floor}. Choose one relic; it applies immediately and lasts the rest of the run.`;
};

const BONUS_TAG_LABELS: Record<string, string> = {
    scholar_style: 'Scholar style',
    glass_witness: 'Glass witness',
    cursed_last: 'Cursed last',
    flip_par: 'Flip par',
    boss_floor: 'Boss floor'
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

const formatBonusTagsLine = (tags: string[] | undefined): string | null => {
    if (!tags || tags.length === 0) {
        return null;
    }
    return tags.map((t) => BONUS_TAG_LABELS[t] ?? t).join(' · ');
};

/** FX-019: land after the tile match check pop peak (`matchedCheckPop` ≈ 420ms in TileBoard.module.css). */
const SCORE_POP_AFTER_MATCH_MS = 220;
const SCORE_POP_AFTER_MATCH_REDUCE_MOTION_MS = 90;
/** OVR-005: coalesce rapid matches to a single concurrent score burst in the notification rail. */
const MATCH_SCORE_TOAST_STACK_KEY = 'match-score';

const GameScreen = ({ achievements, run, suppressStatusOverlays = false }: GameScreenProps) => {
    const shellRef = useRef<HTMLElement | null>(null);
    const tileBoardRef = useRef<TileBoardHandle>(null);
    const scorePopRevealTimerRef = useRef<number | null>(null);
    const { height, width } = useViewportSize();
    const isPhoneViewport = width <= VIEWPORT_MOBILE_MAX;
    const compactTouchChrome = isPhoneViewport || isNarrowShortLandscapeForMenuStack(width, height);
    const [viewportResetToken, setViewportResetToken] = useState(0);
    const [gauntletNowMs, setGauntletNowMs] = useState(() => Date.now());
    const [rulesHintsExpanded, setRulesHintsExpanded] = useState(() => !compactTouchChrome);
    const [utilityFlyoutOpen, setUtilityFlyoutOpen] = useState(false);
    const [abandonRunConfirmOpen, setAbandonRunConfirmOpen] = useState(false);
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
    useEffect(() => {
        if (!compactTouchChrome) {
            return;
        }
        const id = window.setTimeout(() => {
            setRulesHintsExpanded(false);
        }, 0);
        return () => window.clearTimeout(id);
    }, [compactTouchChrome]);
    const gameScreenActions = useAppStore(
        useShallow((state) => ({
            applyFlashPairPower: state.applyFlashPairPower,
            continueToNextLevel: state.continueToNextLevel,
            dismissPowersFtue: state.dismissPowersFtue,
            goToMenu: state.goToMenu,
            openCodexFromPlaying: state.openCodexFromPlaying,
            openInventoryFromPlaying: state.openInventoryFromPlaying,
            openSettings: state.openSettings,
            pause: state.pause,
            pickRelic: state.pickRelic,
            resume: state.resume,
            shuffleBoard: state.shuffleBoard,
            shuffleRegionRow: state.shuffleRegionRow,
            toggleBoardPinMode: state.toggleBoardPinMode,
            toggleDestroyPairArmed: state.toggleDestroyPairArmed,
            togglePeekMode: state.togglePeekMode,
            toggleStrayArm: state.toggleStrayArm,
            triggerDebugReveal: state.triggerDebugReveal,
            undoResolvingFlip: state.undoResolvingFlip
        }))
    );
    const saveData = useAppStore((state) => state.saveData);
    const showTutorialPairMarkers = useMemo(
        () =>
            Boolean(
                run.board &&
                    !saveData.powersFtueSeen &&
                    run.board.level <= TUTORIAL_PAIR_MARKER_MAX_LEVEL
            ),
        [run.board, saveData.powersFtueSeen]
    );
    const { boardPinMode, destroyPairArmed, peekModeArmed } = useAppStore(
        useShallow((state) => ({
            boardPinMode: state.boardPinMode,
            destroyPairArmed: state.destroyPairArmed,
            peekModeArmed: state.peekModeArmed
        }))
    );
    const settingsReduceMotion = useAppStore((state) => state.settings.reduceMotion);
    const seenAchievementToastIdsRef = useRef<Set<string>>(new Set());
    /** OVR-014: queue unlock toasts while the floor-cleared dialog is up; `continueToNextLevel` clears `newlyUnlockedAchievements` before the next paint. */
    const pendingAchievementToastIdsRef = useRef<AchievementId[]>([]);
    const settingsDistractionChannelEnabled = useAppStore((state) => state.settings.distractionChannelEnabled);
    const settingsTileFocusAssist = useAppStore((state) => state.settings.tileFocusAssist);
    const settingsPairProximityHintsEnabled = useAppStore((state) => state.settings.pairProximityHintsEnabled);
    const settingsBoardPresentation = useAppStore((state) => state.settings.boardPresentation);
    const settingsGraphicsQuality = useAppStore((state) => state.settings.graphicsQuality);
    const settingsBoardBloomEnabled = useAppStore((state) => state.settings.boardBloomEnabled);
    /** FX-015: WebGL bloom is medium+ when the toggle is on; add a light CSS rim only on High to avoid doubling cost on phones at Medium. */
    const boardStageCssBloomClass =
        settingsBoardBloomEnabled && settingsGraphicsQuality === 'high' ? styles.boardStageCssBloom : '';
    const settingsBoardScreenSpaceAA = useAppStore((state) => state.settings.boardScreenSpaceAA);
    const settingsCameraViewportModePreference = useAppStore((state) => state.settings.cameraViewportModePreference);
    const debugAllowBoardReveal = useAppStore((state) => state.settings.debugFlags.allowBoardReveal);
    const debugShowDebugTools = useAppStore((state) => state.settings.debugFlags.showDebugTools);
    const debugDisableAchievementsOnDebug = useAppStore((state) => state.settings.debugFlags.disableAchievementsOnDebug);
    const toolbarDebugFlags = useMemo(
        (): Settings['debugFlags'] => ({
            allowBoardReveal: debugAllowBoardReveal,
            disableAchievementsOnDebug: debugDisableAchievementsOnDebug,
            showDebugTools: debugShowDebugTools
        }),
        [debugAllowBoardReveal, debugDisableAchievementsOnDebug, debugShowDebugTools]
    );
    const {
        applyFlashPairPower,
        continueToNextLevel,
        dismissPowersFtue,
        goToMenu,
        openCodexFromPlaying,
        openInventoryFromPlaying,
        openSettings,
        pause,
        pickRelic,
        resume,
        shuffleBoard,
        shuffleRegionRow,
        toggleBoardPinMode,
        toggleDestroyPairArmed,
        togglePeekMode,
        toggleStrayArm,
        triggerDebugReveal,
        undoResolvingFlip
    } = gameScreenActions;

    useEffect(() => {
        const floorClearedModalBlocksToasts =
            !suppressStatusOverlays &&
            !abandonRunConfirmOpen &&
            run.status === 'levelComplete' &&
            Boolean(run.lastLevelResult) &&
            !run.relicOffer;

        const enqueuePending = (ids: AchievementId[]): void => {
            for (const achievementId of ids) {
                if (!pendingAchievementToastIdsRef.current.includes(achievementId)) {
                    pendingAchievementToastIdsRef.current.push(achievementId);
                }
            }
        };

        const emitAchievementToasts = (ids: AchievementId[]): void => {
            if (ids.length === 0) {
                return;
            }
            const infoDuration = settingsReduceMotion ? 3500 : 5500;
            const { showAchievement } = useNotificationStore.getState();
            for (const achievementId of ids) {
                if (seenAchievementToastIdsRef.current.has(achievementId)) {
                    continue;
                }
                seenAchievementToastIdsRef.current.add(achievementId);
                const def = ACHIEVEMENTS.find((item) => item.id === achievementId);
                if (def) {
                    showAchievement(`${def.title} — ${def.description}`, infoDuration, {
                        stackKey: `achievement:${achievementId}`
                    });
                }
            }
        };

        if (floorClearedModalBlocksToasts) {
            if (achievements.length > 0) {
                enqueuePending(achievements);
            }
            return;
        }

        const combined: AchievementId[] = [...pendingAchievementToastIdsRef.current];
        pendingAchievementToastIdsRef.current = [];
        for (const achievementId of achievements) {
            if (!combined.includes(achievementId)) {
                combined.push(achievementId);
            }
        }
        emitAchievementToasts(combined);
    }, [
        abandonRunConfirmOpen,
        achievements,
        run.lastLevelResult,
        run.relicOffer,
        run.status,
        settingsReduceMotion,
        suppressStatusOverlays
    ]);

    useEffect(() => {
        const stripRuleHintToasts = () => {
            const { notifications, removeNotification } = useNotificationStore.getState();
            for (const n of notifications) {
                if (n.message === FORGIVENESS_HINT || n.message === BOARD_POWER_HINT) {
                    removeNotification(n.id);
                }
            }
        };

        if (!rulesHintsExpanded) {
            stripRuleHintToasts();
            return;
        }

        const board = run.board;
        if (!board) {
            return;
        }

        const eligible =
            board.level <= 3 &&
            (run.status === 'memorize' || run.status === 'playing') &&
            board.matchedPairs === 0 &&
            run.stats.tries === 0;

        if (!eligible) {
            stripRuleHintToasts();
            return;
        }

        const { notifications, addNotification } = useNotificationStore.getState();
        if (notifications.some((n) => n.message === FORGIVENESS_HINT)) {
            return;
        }

        const hintDuration = settingsReduceMotion ? 10_000 : 14_000;
        addNotification(FORGIVENESS_HINT, 'info', hintDuration, null, null);
        addNotification(BOARD_POWER_HINT, 'info', hintDuration + 400, null, null);
    }, [rulesHintsExpanded, run.board, run.status, run.stats.tries, settingsReduceMotion]);

    useEffect(() => {
        const board = run.board;
        if (!board) {
            return;
        }

        const showPowersFtueNow =
            (run.status === 'playing' || run.status === 'memorize') &&
            board.level <= 2 &&
            !saveData.powersFtueSeen;

        if (!showPowersFtueNow) {
            return;
        }

        const { notifications, addNotification } = useNotificationStore.getState();
        if (notifications.some((n) => n.message === POWERS_FTUE_TOAST)) {
            return;
        }

        addNotification(POWERS_FTUE_TOAST, 'info', 0, null, () => {
            void dismissPowersFtue();
        }, { surface: 'powers-ftue', stackKey: 'powers-ftue', ariaLive: 'polite' });
    }, [dismissPowersFtue, run.board, run.status, saveData.powersFtueSeen]);

    useEffect(() => {
        return () => {
            if (scorePopRevealTimerRef.current !== null) {
                window.clearTimeout(scorePopRevealTimerRef.current);
                scorePopRevealTimerRef.current = null;
            }
        };
    }, []);

    const prevMatchStatsRef = useRef<{ matches: number; total: number } | null>(null);
    useEffect(() => {
        if (run.status !== 'playing' || !run.board) {
            if (scorePopRevealTimerRef.current !== null) {
                window.clearTimeout(scorePopRevealTimerRef.current);
                scorePopRevealTimerRef.current = null;
            }
            return;
        }
        if (prevMatchStatsRef.current === null) {
            prevMatchStatsRef.current = {
                matches: run.stats.matchesFound,
                total: run.stats.totalScore
            };
            return;
        }
        const prev = prevMatchStatsRef.current;
        if (run.stats.matchesFound > prev.matches) {
            const gained = run.stats.totalScore - prev.total;
            if (gained > 0) {
                if (scorePopRevealTimerRef.current !== null) {
                    window.clearTimeout(scorePopRevealTimerRef.current);
                }
                const dismissMs = settingsReduceMotion ? 1400 : 2400;
                const delayMs = settingsReduceMotion
                    ? SCORE_POP_AFTER_MATCH_REDUCE_MOTION_MS
                    : SCORE_POP_AFTER_MATCH_MS;
                scorePopRevealTimerRef.current = window.setTimeout(() => {
                    scorePopRevealTimerRef.current = null;
                    useNotificationStore.getState().showSuccess(`+${gained.toLocaleString()}`, dismissMs, {
                        stackKey: MATCH_SCORE_TOAST_STACK_KEY,
                        ariaLive: 'off'
                    });
                }, delayMs);
            }
        }
        prevMatchStatsRef.current = {
            matches: run.stats.matchesFound,
            total: run.stats.totalScore
        };
    }, [run.board, run.stats.matchesFound, run.stats.totalScore, run.status, settingsReduceMotion]);
    const distractionHudOn =
        run.activeMutators.includes('distraction_channel') &&
        settingsDistractionChannelEnabled &&
        !settingsReduceMotion &&
        run.status === 'playing';
    const distractionTick = useDistractionChannelTick(distractionHudOn);
    const { tiltRef: gameFieldTiltRef } = usePlatformTiltField({
        enabled: true,
        reduceMotion: settingsReduceMotion,
        surfaceRef: shellRef,
        strength: 1
    });
    const focusDimmedTileIds = useMemo(
        () => computeFocusDimmedTileIds(run.board, run.status, settingsTileFocusAssist),
        [run.board, run.status, settingsTileFocusAssist]
    );
    const mergedPeekTileIds = useMemo(() => {
        const merged = new Set<string>([...run.peekRevealedTileIds, ...run.flashPairRevealedTileIds]);
        return [...merged];
    }, [run.peekRevealedTileIds, run.flashPairRevealedTileIds]);
    const allowGambitThirdFlip = run.gambitAvailableThisFloor && !run.gambitThirdFlipUsed;
    const gambitThirdPickActive =
        run.status === 'resolving' &&
        allowGambitThirdFlip &&
        (run.board?.flippedTileIds.length ?? 0) === 2;
    const wideRecallInPlay = run.activeMutators.includes('wide_recall');
    const silhouetteDuringPlay = run.activeMutators.includes('silhouette_twist');
    const nBackMutatorActive = run.activeMutators.includes('n_back_anchor');
    const viewportWantsMobileCamera = compactTouchChrome;
    const cameraViewportMode = deriveCameraViewportMode(settingsCameraViewportModePreference, viewportWantsMobileCamera);
    const pauseActionLabel = run.status === 'paused' ? 'Resume' : 'Pause';
    const clearLifeBonusLabel = run.lastLevelResult ? getClearLifeBonusLabel(run.lastLevelResult) : null;
    const objectiveBonusLine =
        run.lastLevelResult && (run.lastLevelResult.objectiveBonusScore ?? 0) > 0
            ? `Objective bonuses: +${run.lastLevelResult.objectiveBonusScore!.toLocaleString()}`
            : null;
    const bonusTagsLine = run.lastLevelResult ? formatBonusTagsLine(run.lastLevelResult.bonusTags) : null;

    const gauntletRemainingMs =
        run.gauntletDeadlineMs !== null ? Math.max(0, run.gauntletDeadlineMs - gauntletNowMs) : null;
    const gauntletActive = run.gameMode === 'gauntlet' && run.gauntletDeadlineMs !== null;
    const politeHudAnnouncement = useHudPoliteLiveAnnouncement({
        boardLevel: run.board?.level ?? null,
        gauntletActive,
        gauntletRemainingMs,
        lives: run.lives,
        parasiteFloors: run.parasiteFloors,
        parasiteWardRemaining: run.parasiteWardRemaining,
        scoreParasiteActive: run.activeMutators.includes('score_parasite')
    });

    if (!run.board) {
        return null;
    }

    const showForgivenessHint =
        run.board.level <= 3 &&
        (run.status === 'memorize' || run.status === 'playing') &&
        run.board.matchedPairs === 0 &&
        run.stats.tries === 0;
    const showBoardPowerBar = run.status === 'playing';
    const shuffleDisabled = !canShuffleBoard(run);
    const regionShuffleDisabled = !canRegionShuffle(run);
    const regionShuffleTitle = run.activeContract?.noShuffle
        ? 'Scholar contract: row shuffle disabled'
        : regionShuffleDisabled
          ? run.regionShuffleCharges < 1 &&
              !(run.regionShuffleFreeThisFloor && run.relicIds.includes('region_shuffle_free_first'))
            ? 'No row shuffle charges'
            : run.board.flippedTileIds.length > 0
              ? 'Finish the current flip first'
              : 'Need at least one hidden pair on the board'
          : 'Shuffle hidden tiles within one row (uses 1 row charge)';
    const showFlashPairPower = (run.practiceMode || run.wildMenuRun) && run.status === 'playing';
    const flashPairDisabled =
        !showFlashPairPower ||
        run.flashPairCharges < 1 ||
        run.board.flippedTileIds.length > 0;
    const flashPairTitle =
        run.flashPairCharges < 1
            ? 'No flash charges this floor'
            : run.board.flippedTileIds.length > 0
              ? 'Finish the current flip first'
              : 'Briefly reveal a random hidden pair (practice / wild)';
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
    const boardPresentationClass =
        settingsBoardPresentation === 'spaghetti'
            ? styles.boardStageSpaghetti
            : settingsBoardPresentation === 'breathing' && !settingsReduceMotion
              ? styles.boardStageBreathing
              : '';
    const destroyDisabled = run.destroyPairCharges < 1 && !destroyPairArmed;
    /*
     * A11Y-006 — backdrop inert behind OverlayModal surfaces (pause, relic, floor clear, abandon):
     * - Native `inert` is supported in Chromium (Electron) and current Safari/Firefox; very old browsers
     *   ignore it, so `aria-hidden` is set in tandem to reduce stray tab stops where the attribute is honored.
     * - Do not wrap modal markup in this subtree: nesting focused dialogs inside `aria-hidden` breaks SR semantics.
     * - `inert` alone should block pointer events on descendants; keep modal siblings outside this wrapper.
     */
    const gameplayShellInert =
        !suppressStatusOverlays &&
        (abandonRunConfirmOpen ||
            run.status === 'paused' ||
            Boolean(run.relicOffer) ||
            (run.status === 'levelComplete' && Boolean(run.lastLevelResult) && !run.relicOffer));
    return (
        <section
            className={`${styles.shell} ${cameraViewportMode ? styles.mobileCameraShell : ''}`}
            data-mobile-camera-mode={cameraViewportMode ? 'true' : 'false'}
            data-testid="game-shell"
            ref={shellRef}
        >
            <MainMenuBackground
                fieldTiltRef={gameFieldTiltRef}
                graphicsQuality={settingsGraphicsQuality}
                height={height}
                reduceMotion={settingsReduceMotion}
                width={width}
            />
            <div
                aria-hidden="true"
                className={styles.stageBackdrop}
                style={{ backgroundImage: `url(${UI_ART.gameplayScene})` }}
            />
            <div className={`${styles.gameForeground} ${cameraViewportMode ? styles.mobileCameraForeground : ''}`}>
                <div
                    aria-hidden={gameplayShellInert ? true : undefined}
                    className={styles.gameplayInertScope}
                    data-a11y-gameplay-inert={gameplayShellInert ? 'true' : 'false'}
                    inert={gameplayShellInert ? true : undefined}
                >
                    <h1 className={styles.srOnly}>Level {run.board.level}</h1>
                    <div
                        className={`${styles.gamePlayLayout} ${cameraViewportMode ? styles.mobileCameraGamePlayLayout : ''}`.trim()}
                    >
                    <GameLeftToolbar
                        applyFlashPairPower={applyFlashPairPower}
                        boardPinMode={boardPinMode}
                        cameraViewportMode={cameraViewportMode}
                        canRegionShuffleRow={(row) => canRegionShuffleRow(run, row)}
                        destroyDisabled={destroyDisabled}
                        destroyPairArmed={destroyPairArmed}
                        flashPairDisabled={flashPairDisabled}
                        flashPairTitle={flashPairTitle}
                        maxPinnedTiles={MAX_PINNED_TILES}
                        onRequestAbandonRun={() => setAbandonRunConfirmOpen(true)}
                        onViewportReset={() => setViewportResetToken((current) => current + 1)}
                        openCodexFromPlaying={openCodexFromPlaying}
                        openInventoryFromPlaying={openInventoryFromPlaying}
                        openSettingsPlaying={() => openSettings('playing')}
                        pause={pause}
                        pauseActionLabel={pauseActionLabel}
                        peekModeArmed={peekModeArmed}
                        regionShuffleDisabled={regionShuffleDisabled}
                        regionShuffleTitle={regionShuffleTitle}
                        resume={resume}
                        rulesHintsExpanded={rulesHintsExpanded}
                        run={run}
                        setRulesHintsExpanded={setRulesHintsExpanded}
                        setUtilityFlyoutOpen={setUtilityFlyoutOpen}
                        debugFlags={toolbarDebugFlags}
                        showBoardPowerBar={showBoardPowerBar}
                        showFlashPairPower={showFlashPairPower}
                        showForgivenessHint={showForgivenessHint}
                        shuffleBoard={shuffleBoard}
                        shuffleDisabled={shuffleDisabled}
                        shuffleRegionRow={shuffleRegionRow}
                        shuffleTitle={shuffleTitle}
                        tileBoardRef={tileBoardRef}
                        toggleBoardPinMode={toggleBoardPinMode}
                        toggleDestroyPairArmed={toggleDestroyPairArmed}
                        togglePeekMode={togglePeekMode}
                        toggleStrayArm={toggleStrayArm}
                        triggerDebugReveal={triggerDebugReveal}
                        undoResolvingFlip={undoResolvingFlip}
                        utilityFlyoutOpen={utilityFlyoutOpen}
                    />
                    <div
                        className={`${styles.mainGameColumn} ${cameraViewportMode ? styles.mobileCameraMainColumn : ''}`.trim()}
                    >
                        <GameplayHudBar
                            cameraViewportMode={cameraViewportMode}
                            gauntletRemainingMs={gauntletRemainingMs}
                            politeHudAnnouncement={politeHudAnnouncement}
                            run={run}
                        />

                        <div
                            className={`${styles.boardStage} ${cameraViewportMode ? styles.boardStageCamera : ''} ${boardPresentationClass} ${boardStageCssBloomClass}`.trim()}
                        >
                            <div className={styles.boardGlow} aria-hidden="true" />
                            <TileBoard
                                ref={tileBoardRef}
                                allowGambitThirdFlip={allowGambitThirdFlip}
                                board={run.board}
                                cursedPairKey={run.board.cursedPairKey ?? null}
                                wardPairKey={run.board.wardPairKey ?? null}
                                bountyPairKey={run.board.bountyPairKey ?? null}
                                debugPeekActive={run.debugPeekActive}
                                dimmedTileIds={focusDimmedTileIds}
                                interactive={run.status === 'playing' || gambitThirdPickActive}
                                mobileCameraMode={cameraViewportMode}
                                nBackAnchorPairKey={run.nBackAnchorPairKey}
                                nBackMutatorActive={nBackMutatorActive}
                                peekRevealedTileIds={mergedPeekTileIds}
                                pinnedTileIds={run.pinnedTileIds}
                                onTileSelect={(tileId) => {
                                    useAppStore.getState().pressTile(tileId);
                                }}
                                pairProximityHintsEnabled={settingsPairProximityHintsEnabled}
                                previewActive={run.status === 'memorize'}
                                boardBloomEnabled={settingsBoardBloomEnabled}
                                boardScreenSpaceAA={settingsBoardScreenSpaceAA}
                                graphicsQuality={settingsGraphicsQuality}
                                reduceMotion={settingsReduceMotion}
                                runStatus={run.status}
                                showTutorialPairMarkers={showTutorialPairMarkers}
                                silhouetteDuringPlay={silhouetteDuringPlay}
                                viewportResetToken={viewportResetToken}
                                wideRecallInPlay={wideRecallInPlay}
                            />
                            {distractionHudOn ? (
                                <div
                                    aria-hidden="true"
                                    className={styles.distractionHud}
                                    data-testid="distraction-channel-hud"
                                >
                                    <div className={styles.distractionHudPlate}>
                                        <span className={styles.distractionHudLabel}>{DISTRACTION_CHANNEL_LABEL}</span>
                                        <span className={styles.distractionHudValue}>
                                            {(distractionTick % 7) + 3}
                                        </span>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
                </div>

                {!suppressStatusOverlays && !abandonRunConfirmOpen && run.status === 'paused' && (
                    <OverlayModal
                        actions={[
                            { label: 'Resume', onClick: resume, variant: 'primary' },
                            { label: 'Retreat', onClick: () => setAbandonRunConfirmOpen(true), variant: 'danger' }
                        ]}
                        headerPlateTone="pause"
                        ornamentalHeaderPlate
                        subtitle="Game is paused. The board, memorize phase, and debug timers stay frozen until you resume or retreat."
                        testId="game-pause-overlay"
                        title="Run paused"
                    />
                )}

                {!suppressStatusOverlays && run.relicOffer ? (
                    <OverlayModal
                        actions={run.relicOffer.options.map((id) => ({
                            label: RELIC_LABELS[id] ?? id,
                            onClick: () => pickRelic(id),
                            variant: 'primary' as const
                        }))}
                        headerPlateTone="relic"
                        ornamentalHeaderPlate
                        subtitle={getRelicOfferSubtitle(run.relicOffer.tier)}
                        testId="game-relic-offer-overlay"
                        title={getRelicOfferTitle(run.relicOffer.tier)}
                    />
                ) : null}

                {!suppressStatusOverlays &&
                    !abandonRunConfirmOpen &&
                    run.status === 'levelComplete' &&
                    run.lastLevelResult &&
                    !run.relicOffer && (
                    <OverlayModal
                        actions={[
                            { label: 'Continue', onClick: continueToNextLevel, variant: 'primary' },
                            {
                                label: 'Main Menu',
                                onClick: () => setAbandonRunConfirmOpen(true),
                                variant: 'secondary'
                            }
                        ]}
                        headerPlateTone="success"
                        ornamentalHeaderPlate
                        subtitle={`Level ${run.lastLevelResult.level} cleared. Score +${run.lastLevelResult.scoreGained}. Try Daily or Scholar contract from the menu for different goals.`}
                        title="Floor cleared"
                    >
                        {clearLifeBonusLabel ? <p className={styles.modalNote}>{clearLifeBonusLabel}</p> : null}
                        {objectiveBonusLine ? <p className={styles.modalNote}>{objectiveBonusLine}</p> : null}
                        {bonusTagsLine ? <p className={styles.modalNote}>{bonusTagsLine}</p> : null}
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

                {!suppressStatusOverlays && abandonRunConfirmOpen ? (
                    <OverlayModal
                        actions={[
                            {
                                label: 'Cancel',
                                onClick: () => setAbandonRunConfirmOpen(false),
                                variant: 'secondary'
                            },
                            {
                                label: 'Abandon run',
                                onClick: () => {
                                    setAbandonRunConfirmOpen(false);
                                    goToMenu();
                                },
                                variant: 'danger'
                            }
                        ]}
                        subtitle="You will lose this run and return to the main menu. This cannot be undone."
                        title="Abandon run?"
                    />
                ) : null}
            </div>
        </section>
    );
};

export default GameScreen;
