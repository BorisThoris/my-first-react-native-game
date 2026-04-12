import { ACHIEVEMENTS } from '../../shared/achievements';
import {
    MAX_LIVES,
    MAX_PINNED_TILES,
    type AchievementId,
    type MutatorId,
    type RelicId,
    type RunState,
    type Settings
} from '../../shared/contracts';
import { computeFocusDimmedTileIds } from '../../shared/focusDimmedTileIds';
import { canRegionShuffle, canRegionShuffleRow, canShuffleBoard } from '../../shared/game';
import { hasMutator } from '../../shared/mutators';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { UI_ART } from '../assets/ui';
import { VIEWPORT_MOBILE_MAX, VIEWPORT_TIGHT_MAX_H, VIEWPORT_TIGHT_MAX_W } from '../breakpoints';
import { useDistractionChannelTick } from '../hooks/useDistractionChannelTick';
import { useViewportSize } from '../hooks/useViewportSize';
import { usePlatformTiltField } from '../platformTilt/usePlatformTiltField';
import { StatTile } from '../ui';
import { useAppStore } from '../store/useAppStore';
import GameLeftToolbar from './GameLeftToolbar';
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
    distraction_channel: 'Distraction',
    findables_floor: 'Findables',
    shifting_spotlight: 'Shifting spotlight'
};

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

const GameScreen = ({ achievements, run, suppressStatusOverlays = false }: GameScreenProps) => {
    const shellRef = useRef<HTMLElement | null>(null);
    const tileBoardRef = useRef<TileBoardHandle>(null);
    const { height, width } = useViewportSize();
    const compactTouchChrome = width <= VIEWPORT_MOBILE_MAX || height <= VIEWPORT_MOBILE_MAX;
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
        if (compactTouchChrome) {
            setRulesHintsExpanded(false);
        }
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
    const { boardPinMode, destroyPairArmed, peekModeArmed } = useAppStore(
        useShallow((state) => ({
            boardPinMode: state.boardPinMode,
            destroyPairArmed: state.destroyPairArmed,
            peekModeArmed: state.peekModeArmed
        }))
    );
    const settingsReduceMotion = useAppStore((state) => state.settings.reduceMotion);
    const settingsDistractionChannelEnabled = useAppStore((state) => state.settings.distractionChannelEnabled);
    const settingsTileFocusAssist = useAppStore((state) => state.settings.tileFocusAssist);
    const settingsBoardPresentation = useAppStore((state) => state.settings.boardPresentation);
    const settingsGraphicsQuality = useAppStore((state) => state.settings.graphicsQuality);
    const settingsBoardBloomEnabled = useAppStore((state) => state.settings.boardBloomEnabled);
    const settingsBoardScreenSpaceAA = useAppStore((state) => state.settings.boardScreenSpaceAA);
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
    const [scorePops, setScorePops] = useState<Array<{ id: number; points: number }>>([]);
    const prevMatchStatsRef = useRef<{ matches: number; total: number } | null>(null);
    useEffect(() => {
        if (run.status !== 'playing' || !run.board) {
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
                const id = Date.now() + Math.floor(Math.random() * 1000);
                setScorePops((current) => [...current, { id, points: gained }]);
                const dismissMs = settingsReduceMotion ? 1400 : 2400;
                window.setTimeout(() => {
                    setScorePops((current) => current.filter((item) => item.id !== id));
                }, dismissMs);
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
    const scoreParasiteActive = run.activeMutators.includes('score_parasite');
    const parasiteFloorProgress = Math.min(1, run.parasiteFloors / 4);
    const silhouetteDuringPlay = run.activeMutators.includes('silhouette_twist');
    const nBackMutatorActive = run.activeMutators.includes('n_back_anchor');
    const isCompact = compactTouchChrome;
    const isTight = width <= VIEWPORT_TIGHT_MAX_W || height <= VIEWPORT_TIGHT_MAX_H;
    const cameraViewportMode = isCompact;
    const pauseActionLabel = run.status === 'paused' ? 'Resume' : 'Pause';
    const clearLifeBonusLabel = run.lastLevelResult ? getClearLifeBonusLabel(run.lastLevelResult) : null;
    const objectiveBonusLine =
        run.lastLevelResult && (run.lastLevelResult.objectiveBonusScore ?? 0) > 0
            ? `Objective bonuses: +${run.lastLevelResult.objectiveBonusScore!.toLocaleString()}`
            : null;
    const bonusTagsLine = run.lastLevelResult ? formatBonusTagsLine(run.lastLevelResult.bonusTags) : null;

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
    const showPowersFtue =
        (run.status === 'playing' || run.status === 'memorize') &&
        run.board.level <= 2 &&
        !saveData.powersFtueSeen;
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
        settingsBoardPresentation === 'spaghetti'
            ? styles.boardStageSpaghetti
            : settingsBoardPresentation === 'breathing' && !settingsReduceMotion
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
                                    {/*
                                      Wings: floor → lives → shards | centered score | context + mutators + rail.
                                    */}
                                    <div className={styles.hudWingLeft} data-testid="hud-wing-left">
                                        <div className={`${styles.hudSegment} ${styles.floorBadge}`} title="Current floor">
                                            <span className={styles.floorLabel}>Floor</span>
                                            <span className={styles.floorValue}>{run.board.level}</span>
                                            {run.board.floorTag === 'boss' ? (
                                                <span className={styles.floorTagPill} title="Boss floor scoring">
                                                    Boss
                                                </span>
                                            ) : run.board.floorTag === 'breather' ? (
                                                <span className={styles.floorTagPill} title="Breather floor">
                                                    Rest
                                                </span>
                                            ) : null}
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
                                    </div>
                                    <div className={styles.hudWingCenter} data-testid="hud-wing-center">
                                        <div className={`${styles.hudSegment} ${styles.hudScoreSegment}`}>
                                            <span className={styles.statKey}>Score</span>
                                            <span className={`${styles.statVal} ${styles.statValScore}`}>
                                                {run.stats.totalScore.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.hudWingRight} data-testid="hud-wing-right">
                                        {scoreParasiteActive ? (
                                            <div
                                                aria-label={`Score parasite progress, floor ${run.parasiteFloors} of 4`}
                                                className={styles.hudParasiteSegment}
                                                title="Every four floors with this mutator triggers a score penalty event"
                                            >
                                                <span className={styles.hudParasiteLabel}>
                                                    {MUTATOR_HUD_LABELS.score_parasite}
                                                </span>
                                                <div className={styles.hudParasiteTrack}>
                                                    <div
                                                        className={styles.hudParasiteFill}
                                                        style={{ width: `${parasiteFloorProgress * 100}%` }}
                                                    />
                                                </div>
                                                <span className={styles.hudParasiteCaption}>
                                                    {run.parasiteFloors} / 4 floors
                                                </span>
                                            </div>
                                        ) : null}
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
                                            {hasMutator(run, 'findables_floor') ? (
                                                <div
                                                    className={styles.statPillCompact}
                                                    data-testid="hud-findables-claimed"
                                                    title="Bonus pickups claimed by matching pairs this floor"
                                                >
                                                    <span className={styles.statKey}>Findables</span>
                                                    <span className={styles.statVal}>{run.findablesClaimedThisFloor}</span>
                                                </div>
                                            ) : null}
                                            {run.activeContract?.noShuffle ? (
                                                <div className={styles.statPillCompact}>
                                                    <span className={styles.statKey}>Contract</span>
                                                    <span className={styles.statVal}>Scholar</span>
                                                </div>
                                            ) : null}
                                            {run.activeContract?.maxPinsTotalRun != null ? (
                                                <div className={styles.statPillCompact} title="Pin vow contract">
                                                    <span className={styles.statKey}>Pins</span>
                                                    <span className={styles.statVal}>
                                                        {run.pinsPlacedCountThisRun}/{run.activeContract.maxPinsTotalRun}
                                                    </span>
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
                                cursedPairKey={run.board.cursedPairKey ?? null}
                                wardPairKey={run.board.wardPairKey ?? null}
                                bountyPairKey={run.board.bountyPairKey ?? null}
                                debugPeekActive={run.debugPeekActive}
                                dimmedTileIds={focusDimmedTileIds}
                                interactive={run.status === 'playing' || gambitThirdPickActive}
                                frameStyle={cameraViewportMode ? undefined : boardStyle}
                                mobileCameraMode={cameraViewportMode}
                                nBackAnchorPairKey={run.nBackAnchorPairKey}
                                nBackMutatorActive={nBackMutatorActive}
                                peekRevealedTileIds={mergedPeekTileIds}
                                pinnedTileIds={run.pinnedTileIds}
                                onTileSelect={(tileId) => {
                                    useAppStore.getState().pressTile(tileId);
                                }}
                                previewActive={run.status === 'memorize'}
                                boardBloomEnabled={settingsBoardBloomEnabled}
                                boardScreenSpaceAA={settingsBoardScreenSpaceAA}
                                graphicsQuality={settingsGraphicsQuality}
                                reduceMotion={settingsReduceMotion}
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
                            {unlockedDefinitions.length > 0 || scorePops.length > 0 ? (
                                <div
                                    className={`${styles.toastRailStack} ${cameraViewportMode ? styles.mobileCameraToastRail : ''}`}
                                >
                                    {scorePops.length > 0 ? (
                                        <div
                                            aria-atomic="false"
                                            aria-live="polite"
                                            className={styles.toastRail}
                                            data-testid="game-toast-score-rail"
                                        >
                                            {scorePops.map((pop) => (
                                                <div className={styles.scorePop} key={pop.id}>
                                                    +{pop.points.toLocaleString()}
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                    {unlockedDefinitions.length > 0 ? (
                                        <div
                                            aria-atomic="true"
                                            aria-live="polite"
                                            className={styles.toastRail}
                                            data-testid="game-toast-achievement-rail"
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
                            ) : null}
                        </div>
                    </div>
                </div>

                {!suppressStatusOverlays && !abandonRunConfirmOpen && run.status === 'paused' && (
                    <OverlayModal
                        actions={[
                            { label: 'Resume', onClick: resume, variant: 'primary' },
                            { label: 'Retreat', onClick: () => setAbandonRunConfirmOpen(true), variant: 'danger' }
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
                        subtitle={`Level ${run.lastLevelResult.level} cleared. Score +${run.lastLevelResult.scoreGained}. Try Daily or Scholar contract from the menu for different goals.`}
                        title="Floor Cleared"
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
