import { create } from 'zustand/react';
import { evaluateAchievementUnlocks } from '../../shared/achievements';
import { mergeHonorUnlockTags } from '../../shared/honorUnlocks';
import type {
    AchievementId,
    MutatorId,
    RelicId,
    RelicOfferServiceId,
    RunState,
    SaveData,
    Settings,
    SubscreenReturnView,
    ViewState
} from '../../shared/contracts';
import { BUILTIN_PUZZLES } from '../../shared/builtin-puzzles';
import {
    acceptEndlessRiskWager as acceptEndlessRiskWagerRule,
    advanceToNextLevel,
    applyDestroyPair,
    applyFlashPair,
    applyPeek,
    applyRegionShuffle,
    applyRouteChoiceOutcome,
    claimRouteSideRoomPrimary,
    applyShuffle,
    applyStrayRemove,
    armRegionShuffleRow,
    cancelResolvingWithUndo,
    completeRelicPickAndAdvance,
    createDailyRun,
    createGauntletRun,
    createMeditationRun,
    createNewRun,
    createPuzzleRun,
    createWildRun,
    createRunSummary,
    disableDebugPeek,
    enableDebugPeek,
    EXIT_PAIR_KEY,
    finishMemorizePhase,
    flipTile,
    activateDungeonExit,
    isGauntletExpired,
    openRelicOffer,
    openRouteSideRoom,
    pauseRun,
    purchaseShopOffer as purchaseShopOfferRule,
    rerollShopOffers as rerollShopOffersRule,
    applyRelicOfferServiceToRun,
    revealDungeonExit,
    revealDungeonRoom,
    revealDungeonShop,
    resolveBoardTurn,
    ROOM_PAIR_KEY,
    resumeRun,
    SHOP_PAIR_KEY,
    skipRouteSideRoom,
    togglePinnedTile,
    toggleStrayRemoveArmed,
    type DungeonExitActivationSpend
} from '../../shared/game';
import { trackEvent } from '../../shared/telemetry';
import {
    shouldScheduleDebugRevealTimerOnResume,
    shouldScheduleMemorizeTimerOnResume
} from './runTimerResumeConditions';
import {
    createDefaultSaveData,
    mergeBestFloorNoPowers,
    mergeDailyComplete,
    mergeEncoreFromRun,
    mergeRelicPickStat,
    metaRelicDraftExtraPerMilestoneFromSave,
    normalizeSaveData
} from '../../shared/save-data';
import { desktopClient } from '../desktop-client';
import { persistSaveDataThenUnlockAchievements } from './achievementPersistence';
import {
    persistSaveData,
    persistSaveSettings,
    persistenceNoticeForConsecutiveFailures,
    registerPersistenceWriteFailureHandler
} from './persistBridge';
import {
    BOARD_FLOATER_POP_CLEAR,
    buildMatchScorePopPayload,
    buildMismatchScorePopPayload,
    type MatchScorePop,
    type MismatchScorePop
} from './matchScorePop';
import type { DevSandboxConfig } from '../dev/devSandboxParams';
import { buildSandboxRun } from '../dev/runFixtures';
import { needsRelicPick } from '../../shared/relics';
import {
    playDestroyPairSfx,
    playFlipSfx,
    playGambitCommitSfx,
    playFloorClearSfx,
    playPeekPowerSfx,
    playPowerArmSfx,
    playRelicPickSfx,
    playResolveSfx,
    playStrayPowerSfx,
    playWagerArmSfx,
    resumeAudioContext,
    sfxGainFromSettings
} from '../audio/gameSfx';
import {
    playPauseOpenSfx,
    playPauseResumeSfx,
    playRunStartSfx,
    resumeUiSfxContext
} from '../audio/uiSfx';
import { resolveNavigationTransition } from './navigationModel';

const metaRelicOpts = (save: SaveData) => ({
    metaRelicDraftExtraPerMilestone: metaRelicDraftExtraPerMilestoneFromSave(save)
});

interface ActiveTimer {
    deadline: number;
    timeout: ReturnType<typeof setTimeout>;
}

interface AppState {
    hydrated: boolean;
    hydrating: boolean;
    steamConnected: boolean;
    view: ViewState;
    settingsReturnView: SubscreenReturnView;
    subscreenReturnView: SubscreenReturnView;
    saveData: SaveData;
    settings: Settings;
    run: RunState | null;
    newlyUnlockedAchievements: AchievementId[];
    /** Non-blocking copy when Steam achievement sync fails (local save still applied). */
    achievementBridgeNotice: string | null;
    clearAchievementBridgeNotice: () => void;
    /** Disk / localStorage save failures (autosave or settings write). */
    persistenceWriteNotice: string | null;
    clearPersistenceWriteNotice: () => void;
    boardPinMode: boolean;
    destroyPairArmed: boolean;
    peekModeArmed: boolean;
    dungeonExitPromptOpen: boolean;
    shopReturnMode: 'floor' | 'summary' | null;
    /** Transient floating +score near matched tiles (Gameplay column). */
    matchScorePop: MatchScorePop | null;
    dismissMatchScorePop: () => void;
    /** Transient miss floater after mismatch resolve (same anchor as match floater). */
    mismatchScorePop: MismatchScorePop | null;
    dismissMismatchScorePop: () => void;
    hydrate: () => Promise<void>;
    startRun: () => void;
    startDailyRun: () => void;
    startGauntletRun: (durationMs?: number) => void;
    startPuzzleRun: (puzzleId: string) => void;
    startPracticeRun: () => void;
    startScholarContractRun: () => void;
    startMeditationRun: () => void;
    startMeditationRunWithMutators: (mutators: MutatorId[]) => void;
    startPinVowRun: () => void;
    startWildRun: () => void;
    pickRelic: (relicId: RelicId) => void;
    applyRelicOfferService: (serviceId: RelicOfferServiceId, targetRelicId?: RelicId) => void;
    dismissPowersFtue: () => Promise<void>;
    goToMenu: () => void;
    openModeSelect: () => void;
    openCollection: () => void;
    openProfile: () => void;
    openInventoryFromMenu: () => void;
    openCodexFromMenu: () => void;
    openInventoryFromPlaying: () => void;
    openCodexFromPlaying: () => void;
    openShopFromLevelComplete: () => void;
    closeShopToFloorSummary: () => void;
    continueFromShop: () => void;
    closeSubscreen: () => void;
    openSettings: (returnView?: SubscreenReturnView) => void;
    closeSettings: () => void;
    updateSettings: (settings: Settings) => Promise<void>;
    dismissHowToPlay: () => Promise<void>;
    pressTile: (tileId: string) => void;
    closeDungeonExitPrompt: () => void;
    activateDungeonExitFromPrompt: (spend?: DungeonExitActivationSpend) => void;
    togglePeekMode: () => void;
    undoResolvingFlip: () => void;
    toggleStrayArm: () => void;
    shuffleBoard: () => void;
    armRegionShuffleRowPick: (row: number | null) => void;
    shuffleRegionRow: (row: number) => void;
    applyFlashPairPower: () => void;
    toggleBoardPinMode: () => void;
    toggleDestroyPairArmed: () => void;
    pause: () => void;
    resume: () => void;
    acceptEndlessRiskWager: () => void;
    purchaseShopOffer: (offerId: string) => void;
    rerollShopOffers: () => void;
    continueToNextLevel: () => void;
    chooseRouteAndContinue: (choiceId: string) => void;
    claimSideRoomPrimary: () => void;
    skipSideRoom: () => void;
    restartRun: () => void;
    endRun: () => void;
    triggerDebugReveal: () => void;
    /** DEV-only: jump to a screen / fixture from URL sandbox params. No-op in production. */
    __devApplySandbox: (config: DevSandboxConfig) => void;
}

let memorizeTimer: ActiveTimer | null = null;
let resolveTimer: ActiveTimer | null = null;
let debugRevealTimer: ActiveTimer | null = null;

const clearTimer = (timer: ActiveTimer | null): void => {
    if (timer) {
        clearTimeout(timer.timeout);
    }
};

const clearMemorizeTimer = (): void => {
    clearTimer(memorizeTimer);
    memorizeTimer = null;
};

const clearResolveTimer = (): void => {
    clearTimer(resolveTimer);
    resolveTimer = null;
};

const clearDebugRevealTimer = (): void => {
    clearTimer(debugRevealTimer);
    debugRevealTimer = null;
};

let gauntletExpiryIntervalId: ReturnType<typeof setInterval> | null = null;

const clearGauntletExpiryWatch = (): void => {
    if (gauntletExpiryIntervalId !== null) {
        clearInterval(gauntletExpiryIntervalId);
        gauntletExpiryIntervalId = null;
    }
};

const syncGauntletExpiryWatch = (): void => {
    const { run, view } = useAppStore.getState();
    const shouldWatch =
        view === 'playing' &&
        run &&
        run.gameMode === 'gauntlet' &&
        run.gauntletDeadlineMs !== null &&
        run.status !== 'gameOver';

    if (!shouldWatch) {
        clearGauntletExpiryWatch();
        return;
    }

    if (gauntletExpiryIntervalId !== null) {
        return;
    }

    gauntletExpiryIntervalId = setInterval(() => {
        const { run: currentRun, view: currentView } = useAppStore.getState();
        if (
            !currentRun ||
            currentView !== 'playing' ||
            currentRun.gameMode !== 'gauntlet' ||
            currentRun.gauntletDeadlineMs === null ||
            currentRun.status === 'gameOver'
        ) {
            clearGauntletExpiryWatch();
            return;
        }
        if (isGauntletExpired(currentRun)) {
            clearGauntletExpiryWatch();
            applyResolvedRun({ ...currentRun, status: 'gameOver', lives: 0 });
        }
    }, 300);
};

const clearAllTimers = (): void => {
    clearMemorizeTimer();
    clearResolveTimer();
    clearDebugRevealTimer();
    clearGauntletExpiryWatch();
};

const patchRunFromUserSettings = (run: RunState, settings: Settings): RunState => ({
    ...run,
    weakerShuffleMode: settings.weakerShuffleMode,
    shuffleScoreTaxActive: settings.shuffleScoreTaxEnabled,
    resolveDelayMultiplier: settings.resolveDelayMultiplier,
    echoFeedbackEnabled: settings.echoFeedbackEnabled
});

const getRemainingMs = (timer: ActiveTimer | null, fallback: number | null): number | null => {
    if (!timer) {
        return fallback;
    }

    return Math.max(timer.deadline - Date.now(), 0);
};

const sfxGainFromStore = (): number => {
    const { settings } = useAppStore.getState();
    return sfxGainFromSettings(settings.masterVolume, settings.sfxVolume);
};

const playRunStartUiSfxFromStore = (): void => {
    void resumeUiSfxContext();
    playRunStartSfx(sfxGainFromStore());
};

const applyResolveBoardTurn = (run: RunState): void => {
    const { saveData } = useAppStore.getState();
    const encore = saveData.playerStats?.encorePairKeysLastRun ?? [];
    const next = resolveBoardTurn(run, encore);
    const pop = buildMatchScorePopPayload(run, next);
    const missPop = buildMismatchScorePopPayload(run, next);
    if (pop) {
        useAppStore.setState({ ...BOARD_FLOATER_POP_CLEAR, matchScorePop: pop });
    } else if (missPop) {
        useAppStore.setState({ ...BOARD_FLOATER_POP_CLEAR, mismatchScorePop: missPop });
    } else {
        useAppStore.setState({ ...BOARD_FLOATER_POP_CLEAR });
    }
    void resumeAudioContext();
    playResolveSfx(run, next, sfxGainFromStore());
    applyResolvedRun(next);
};

const applyResolvedRun = (resolvedRun: RunState): void => {
    const state = useAppStore.getState();
    const prevStatus = state.run?.status;
    if (resolvedRun.status === 'levelComplete' && prevStatus !== 'levelComplete') {
        void resumeAudioContext();
        playFloorClearSfx(sfxGainFromStore());
    }
    let nextRun = resolvedRun.status === 'playing' ? resolvedRun : disableDebugPeek(resolvedRun);

    let saveForAchievements = state.saveData;
    if (nextRun.status === 'gameOver') {
        let projected = mergeEncoreFromRun(state.saveData, nextRun.matchedPairKeysThisRun);
        if (nextRun.gameMode === 'daily' && nextRun.dailyDateKeyUtc) {
            projected = mergeDailyComplete(projected, nextRun.dailyDateKeyUtc);
        }
        if (!nextRun.powersUsedThisRun) {
            projected = mergeBestFloorNoPowers(projected, nextRun.stats.highestLevel);
        }
        saveForAchievements = projected;
    }

    const unlockedAchievements = evaluateAchievementUnlocks(nextRun, saveForAchievements);
    let nextSave = normalizeSaveData({
        ...state.saveData,
        bestScore: Math.max(state.saveData.bestScore, nextRun.stats.bestScore)
    });

    if (unlockedAchievements.length > 0) {
        const unlockTags = unlockedAchievements.map((id) => `achievement:${id}`);
        nextSave = normalizeSaveData({
            ...nextSave,
            achievements: {
                ...nextSave.achievements,
                ...Object.fromEntries(unlockedAchievements.map((achievementId) => [achievementId, true]))
            },
            unlocks: [...new Set([...(nextSave.unlocks ?? []), ...unlockTags])]
        });
    }

    if (nextRun.status === 'gameOver') {
        nextSave = mergeEncoreFromRun(nextSave, nextRun.matchedPairKeysThisRun);
        nextRun = createRunSummary(nextRun, unlockedAchievements);
        if (nextRun.gameMode === 'daily' && nextRun.dailyDateKeyUtc) {
            nextSave = mergeDailyComplete(nextSave, nextRun.dailyDateKeyUtc);
        }
        if (!nextRun.powersUsedThisRun) {
            nextSave = mergeBestFloorNoPowers(nextSave, nextRun.stats.highestLevel);
        }
        nextSave = normalizeSaveData({
            ...nextSave,
            onboardingDismissed: true,
            lastRunSummary: nextRun.lastRunSummary
        });
        nextSave = mergeHonorUnlockTags(nextSave);

        const s = nextRun.lastRunSummary;
        if (s) {
            trackEvent('run_complete', {
                mode: s.gameMode ?? 'endless',
                practice: nextRun.practiceMode,
                highestLevel: s.highestLevel,
                totalScore: s.totalScore,
                mutatorCount: s.activeMutators?.length ?? 0,
                relicCount: s.relicIds?.length ?? 0
            });
        }

        useAppStore.setState({
            run: nextRun,
            view: 'gameOver',
            saveData: nextSave,
            settings: nextSave.settings,
            newlyUnlockedAchievements: unlockedAchievements,
            ...BOARD_FLOATER_POP_CLEAR
        });
    } else {
        nextSave = mergeHonorUnlockTags(nextSave);
        useAppStore.setState({
            run: nextRun,
            view: 'playing',
            saveData: nextSave,
            settings: nextSave.settings,
            newlyUnlockedAchievements: unlockedAchievements
        });
    }

    if (unlockedAchievements.length > 0) {
        void persistSaveDataThenUnlockAchievements(nextSave, unlockedAchievements).then(({ failures }) => {
            if (failures.length > 0) {
                useAppStore.setState({
                    achievementBridgeNotice:
                        'Some achievements could not sync with Steam. Your unlocks are saved in this build.'
                });
            }
        });
    } else {
        void persistSaveData(nextSave);
    }
};

function scheduleMemorizeTimer(duration: number): void {
    clearMemorizeTimer();

    if (duration <= 0) {
        const { run } = useAppStore.getState();

        if (run && run.status === 'memorize') {
            useAppStore.setState({ run: finishMemorizePhase(run) });
        }

        return;
    }

    memorizeTimer = {
        deadline: Date.now() + duration,
        timeout: setTimeout(() => {
            memorizeTimer = null;
            const { run } = useAppStore.getState();

            if (!run || run.status !== 'memorize') {
                return;
            }

            useAppStore.setState({ run: finishMemorizePhase(run) });
        }, duration)
    };
}

function scheduleResolveTimer(duration: number): void {
    clearResolveTimer();

    if (duration <= 0) {
        const { run } = useAppStore.getState();

        if (run && run.status === 'resolving') {
            applyResolveBoardTurn(run);
        }

        return;
    }

    resolveTimer = {
        deadline: Date.now() + duration,
        timeout: setTimeout(() => {
            resolveTimer = null;
            const { run } = useAppStore.getState();

            if (!run || run.status !== 'resolving') {
                return;
            }

            applyResolveBoardTurn(run);
        }, duration)
    };
}

function scheduleDebugRevealTimer(duration: number): void {
    clearDebugRevealTimer();

    if (duration <= 0) {
        const { run } = useAppStore.getState();

        if (run?.debugPeekActive) {
            useAppStore.setState({ run: disableDebugPeek(run) });
        }

        return;
    }

    debugRevealTimer = {
        deadline: Date.now() + duration,
        timeout: setTimeout(() => {
            debugRevealTimer = null;
            const { run } = useAppStore.getState();

            if (!run?.debugPeekActive) {
                return;
            }

            useAppStore.setState({ run: disableDebugPeek(run) });
        }, duration)
    };
}

const freezeRun = (run: RunState): RunState => {
    const pausedRun = pauseRun(run);

    return {
        ...pausedRun,
        timerState: {
            ...pausedRun.timerState,
            memorizeRemainingMs:
                run.status === 'memorize'
                    ? getRemainingMs(memorizeTimer, run.timerState.memorizeRemainingMs)
                    : pausedRun.timerState.memorizeRemainingMs,
            resolveRemainingMs:
                run.status === 'resolving'
                    ? getRemainingMs(resolveTimer, run.timerState.resolveRemainingMs)
                    : pausedRun.timerState.resolveRemainingMs,
            debugRevealRemainingMs: run.debugPeekActive
                ? getRemainingMs(debugRevealTimer, run.timerState.debugRevealRemainingMs)
                : pausedRun.timerState.debugRevealRemainingMs
        }
    };
};

/**
 * SIDE-013 — In-run meta overlays (settings modal, inventory/codex shell)
 * share one freeze policy: snapshot timers into `paused` for resumable states; leave user-pause and
 * floor-level overlays (`levelComplete`, `gameOver`) unchanged so `closeSubscreen` / `closeSettings`
 * do not double-clobber `pausedFromStatus`.
 */
const freezeRunSnapshotForPlayingMetaOverlay = (run: RunState): RunState =>
    run.status === 'paused' || run.status === 'levelComplete' || run.status === 'gameOver' ? run : freezeRun(run);

const resumeRunWithTimers = (run: RunState): RunState => {
    const resumedRun = resumeRun(run);

    if (shouldScheduleMemorizeTimerOnResume(resumedRun)) {
        scheduleMemorizeTimer(resumedRun.timerState.memorizeRemainingMs!);
    }

    if (resumedRun.status === 'resolving' && resumedRun.timerState.resolveRemainingMs !== null) {
        scheduleResolveTimer(resumedRun.timerState.resolveRemainingMs);
    }

    if (shouldScheduleDebugRevealTimerOnResume(resumedRun)) {
        scheduleDebugRevealTimer(resumedRun.timerState.debugRevealRemainingMs!);
    }

    return resumedRun;
};

export const useAppStore = create<AppState>((set, get) => ({
    hydrated: false,
    hydrating: false,
    steamConnected: false,
    view: 'boot',
    settingsReturnView: 'menu',
    subscreenReturnView: 'menu',
    saveData: createDefaultSaveData(),
    settings: createDefaultSaveData().settings,
    run: null,
    newlyUnlockedAchievements: [],
    achievementBridgeNotice: null,
    clearAchievementBridgeNotice: () => {
        set({ achievementBridgeNotice: null });
    },
    persistenceWriteNotice: null,
    clearPersistenceWriteNotice: () => {
        set({ persistenceWriteNotice: null });
    },
    boardPinMode: false,
    destroyPairArmed: false,
    peekModeArmed: false,
    dungeonExitPromptOpen: false,
    shopReturnMode: null,
    ...BOARD_FLOATER_POP_CLEAR,
    dismissMatchScorePop: () => {
        set({ matchScorePop: null });
    },
    dismissMismatchScorePop: () => {
        set({ mismatchScorePop: null });
    },

    hydrate: async () => {
        if (get().hydrating || get().hydrated) {
            return;
        }

        set({ hydrating: true });

        const [rawSave, steamConnected] = await Promise.all([
            desktopClient.getSaveData().then(normalizeSaveData).catch(() => createDefaultSaveData()),
            desktopClient.isSteamConnected().catch(() => false)
        ]);

        const saveData = mergeHonorUnlockTags(rawSave);
        if (saveData !== rawSave) {
            void persistSaveData(saveData);
        }

        set({
            hydrating: false,
            hydrated: true,
            steamConnected,
            saveData,
            settings: saveData.settings,
            view: 'menu'
        });
    },

    startRun: () => {
        clearAllTimers();
        const run = patchRunFromUserSettings(
            createNewRun(get().saveData.bestScore, metaRelicOpts(get().saveData)),
            get().settings
        );
        trackEvent('run_start', { mode: run.gameMode, practice: run.practiceMode });
        playRunStartUiSfxFromStore();

        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run
        });

        if (run.timerState.memorizeRemainingMs !== null) {
            scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
        }
    },

    startDailyRun: () => {
        clearAllTimers();
        const run = patchRunFromUserSettings(
            createDailyRun(get().saveData.bestScore, metaRelicOpts(get().saveData)),
            get().settings
        );
        trackEvent('run_start', { mode: run.gameMode, practice: run.practiceMode });
        playRunStartUiSfxFromStore();
        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run
        });
        if (run.timerState.memorizeRemainingMs !== null) {
            scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
        }
    },

    startGauntletRun: (durationMs = 10 * 60 * 1000) => {
        clearAllTimers();
        const run = patchRunFromUserSettings(
            createGauntletRun(get().saveData.bestScore, durationMs, metaRelicOpts(get().saveData)),
            get().settings
        );
        trackEvent('run_start', { mode: run.gameMode, practice: run.practiceMode });
        playRunStartUiSfxFromStore();
        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run
        });
        if (run.timerState.memorizeRemainingMs !== null) {
            scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
        }
    },

    startPuzzleRun: (puzzleId) => {
        const puzzle = BUILTIN_PUZZLES[puzzleId];
        if (!puzzle) {
            return;
        }
        clearAllTimers();
        const run = patchRunFromUserSettings(
            createPuzzleRun(get().saveData.bestScore, puzzle.id, puzzle.tiles, 1, metaRelicOpts(get().saveData)),
            get().settings
        );
        trackEvent('run_start', { mode: run.gameMode, practice: run.practiceMode, puzzleId: puzzle.id });
        playRunStartUiSfxFromStore();
        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run
        });
        if (run.timerState.memorizeRemainingMs !== null) {
            scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
        }
    },

    startPracticeRun: () => {
        clearAllTimers();
        const run = patchRunFromUserSettings(
            createNewRun(get().saveData.bestScore, { practiceMode: true, ...metaRelicOpts(get().saveData) }),
            get().settings
        );
        trackEvent('run_start', { mode: run.gameMode, practice: run.practiceMode });
        playRunStartUiSfxFromStore();
        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run
        });
        if (run.timerState.memorizeRemainingMs !== null) {
            scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
        }
    },

    startScholarContractRun: () => {
        clearAllTimers();
        const run = patchRunFromUserSettings(
            createNewRun(get().saveData.bestScore, {
                ...metaRelicOpts(get().saveData),
                activeContract: {
                    noShuffle: true,
                    noDestroy: true,
                    maxMismatches: null,
                    bonusRelicDraftPick: true
                }
            }),
            get().settings
        );
        trackEvent('run_start', { mode: run.gameMode, practice: run.practiceMode, scholar: true });
        playRunStartUiSfxFromStore();
        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run
        });
        if (run.timerState.memorizeRemainingMs !== null) {
            scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
        }
    },

    startMeditationRun: () => {
        clearAllTimers();
        const run = patchRunFromUserSettings(
            createMeditationRun(get().saveData.bestScore, undefined, metaRelicOpts(get().saveData)),
            get().settings
        );
        trackEvent('run_start', { mode: run.gameMode, practice: run.practiceMode });
        playRunStartUiSfxFromStore();
        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run
        });
        if (run.timerState.memorizeRemainingMs !== null) {
            scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
        }
    },

    startMeditationRunWithMutators: (mutators) => {
        clearAllTimers();
        const run = patchRunFromUserSettings(
            createMeditationRun(get().saveData.bestScore, mutators, metaRelicOpts(get().saveData)),
            get().settings
        );
        trackEvent('run_start', {
            mode: run.gameMode,
            practice: run.practiceMode,
            meditation_focus_count: mutators.length,
            meditation_focus: mutators.length > 0 ? mutators.join(',') : undefined
        });
        playRunStartUiSfxFromStore();
        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run
        });
        if (run.timerState.memorizeRemainingMs !== null) {
            scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
        }
    },

    startPinVowRun: () => {
        clearAllTimers();
        const run = patchRunFromUserSettings(
            createNewRun(get().saveData.bestScore, {
                ...metaRelicOpts(get().saveData),
                activeContract: { noShuffle: false, noDestroy: false, maxMismatches: null, maxPinsTotalRun: 10 }
            }),
            get().settings
        );
        trackEvent('run_start', { mode: run.gameMode, practice: run.practiceMode, pinVow: true });
        playRunStartUiSfxFromStore();
        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run
        });
        if (run.timerState.memorizeRemainingMs !== null) {
            scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
        }
    },

    startWildRun: () => {
        clearAllTimers();
        const run = patchRunFromUserSettings(
            createWildRun(get().saveData.bestScore, metaRelicOpts(get().saveData)),
            get().settings
        );
        trackEvent('run_start', { mode: run.gameMode, practice: run.practiceMode, wild: true });
        playRunStartUiSfxFromStore();
        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run
        });
        if (run.timerState.memorizeRemainingMs !== null) {
            scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
        }
    },

    pickRelic: (relicId) => {
        const { run } = get();
        if (!run?.relicOffer?.options.includes(relicId)) {
            return;
        }
        clearAllTimers();
        void resumeAudioContext();
        playRelicPickSfx(sfxGainFromStore());
        const nextRun = completeRelicPickAndAdvance(run, relicId);
        let nextSave = mergeRelicPickStat(get().saveData, relicId);
        nextSave = normalizeSaveData(nextSave);
        nextSave = mergeHonorUnlockTags(nextSave);
        set({
            run: nextRun,
            saveData: nextSave,
            settings: nextSave.settings,
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false
        });
        if (nextRun.timerState.memorizeRemainingMs !== null) {
            scheduleMemorizeTimer(nextRun.timerState.memorizeRemainingMs);
        }
        void persistSaveData(nextSave);
    },

    applyRelicOfferService: (serviceId, targetRelicId) => {
        const { run } = get();
        if (!run?.relicOffer) {
            return;
        }
        set({ run: applyRelicOfferServiceToRun(run, serviceId, targetRelicId) });
    },

    dismissPowersFtue: async () => {
        const nextSave = normalizeSaveData({
            ...get().saveData,
            powersFtueSeen: true
        });
        set({ saveData: nextSave, settings: nextSave.settings });
        await persistSaveData(nextSave);
    },

    /** Abandon confirm / NAV-004: clears the run and normalizes return pointers so meta overlays cannot strand `inventory|codex` without a run (SIDE-014). */
    goToMenu: () => {
        clearAllTimers();
        set({
            view: 'menu',
            run: null,
            newlyUnlockedAchievements: [],
            achievementBridgeNotice: null,
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            subscreenReturnView: 'menu',
            settingsReturnView: 'menu',
            ...BOARD_FLOATER_POP_CLEAR
        });
    },

    openModeSelect: () => {
        const transition = resolveNavigationTransition(get(), 'openModeSelect');
        set({ view: transition.view, subscreenReturnView: transition.subscreenReturnView });
    },

    openCollection: () => {
        const transition = resolveNavigationTransition(get(), 'openCollection');
        set({ view: transition.view, subscreenReturnView: transition.subscreenReturnView });
    },

    openProfile: () => {
        const transition = resolveNavigationTransition(get(), 'openProfile');
        set({ view: transition.view, subscreenReturnView: transition.subscreenReturnView });
    },

    openInventoryFromMenu: () => {
        const transition = resolveNavigationTransition(get(), 'openInventoryFromMenu');
        set({ view: transition.view, subscreenReturnView: transition.subscreenReturnView });
    },

    openCodexFromMenu: () => {
        const transition = resolveNavigationTransition(get(), 'openCodexFromMenu');
        set({ view: transition.view, subscreenReturnView: transition.subscreenReturnView });
    },

    openInventoryFromPlaying: () => {
        const { run, view } = get();
        if (!run || view !== 'playing') {
            return;
        }
        const nextRun = freezeRunSnapshotForPlayingMetaOverlay(run);
        clearAllTimers();
        const transition = resolveNavigationTransition(get(), 'openInventoryFromPlaying');
        set({
            view: transition.view,
            subscreenReturnView: transition.subscreenReturnView,
            run: nextRun
        });
    },

    openCodexFromPlaying: () => {
        const { run, view } = get();
        if (!run || view !== 'playing') {
            return;
        }
        const nextRun = freezeRunSnapshotForPlayingMetaOverlay(run);
        clearAllTimers();
        const transition = resolveNavigationTransition(get(), 'openCodexFromPlaying');
        set({
            view: transition.view,
            subscreenReturnView: transition.subscreenReturnView,
            run: nextRun
        });
    },

    openShopFromLevelComplete: () => {
        const { run, view } = get();
        if (
            !run ||
            view !== 'playing' ||
            run.status !== 'levelComplete' ||
            run.relicOffer ||
            run.sideRoom ||
            run.shopOffers.length === 0
        ) {
            return;
        }
        const transition = resolveNavigationTransition(get(), 'openShopFromLevelComplete');
        set({ view: transition.view, shopReturnMode: 'summary' });
    },

    closeShopToFloorSummary: () => {
        const { run, shopReturnMode } = get();
        const transition = resolveNavigationTransition(get(), 'closeShopToFloorSummary');
        set({
            view: transition.view,
            run: shopReturnMode === 'floor' && run ? resumeRunWithTimers(run) : run,
            shopReturnMode: null
        });
    },

    continueFromShop: () => {
        const { run, shopReturnMode } = get();
        if (shopReturnMode === 'floor') {
            const transition = resolveNavigationTransition(get(), 'closeShopToFloorSummary');
            set({
                view: transition.view,
                run: run ? resumeRunWithTimers(run) : run,
                shopReturnMode: null
            });
            return;
        }
        if (!run || run.status !== 'levelComplete') {
            const transition = resolveNavigationTransition(get(), 'closeShopToFloorSummary');
            set({ view: transition.view, shopReturnMode: null });
            return;
        }
        set({ shopReturnMode: null });
        get().continueToNextLevel();
    },

    claimSideRoomPrimary: () => {
        const { run } = get();
        if (!run || run.status !== 'levelComplete' || !run.sideRoom) {
            set({ view: 'playing' });
            return;
        }
        const nextRun = claimRouteSideRoomPrimary(run);
        if (nextRun.shopOffers.length > 0) {
            set({
                run: nextRun,
                view: 'shop',
                shopReturnMode: 'summary',
                boardPinMode: false,
                destroyPairArmed: false,
                peekModeArmed: false,
                ...BOARD_FLOATER_POP_CLEAR
            });
            return;
        }
        set({ run: nextRun, view: 'playing' });
        get().continueToNextLevel();
    },

    skipSideRoom: () => {
        const { run } = get();
        if (!run || run.status !== 'levelComplete' || !run.sideRoom) {
            set({ view: 'playing' });
            return;
        }
        const nextRun = skipRouteSideRoom(run);
        if (nextRun.shopOffers.length > 0) {
            set({
                run: nextRun,
                view: 'shop',
                shopReturnMode: 'summary',
                boardPinMode: false,
                destroyPairArmed: false,
                peekModeArmed: false,
                ...BOARD_FLOATER_POP_CLEAR
            });
            return;
        }
        set({ run: nextRun, view: 'playing' });
        get().continueToNextLevel();
    },

    closeSubscreen: () => {
        const { run } = get();
        const transition = resolveNavigationTransition(get(), 'closeSubscreen');

        if (transition.resumeRun) {
            const nextRun = run?.status === 'paused' ? resumeRunWithTimers(run) : run;
            set({
                view: transition.view,
                subscreenReturnView: transition.subscreenReturnView,
                run: nextRun ?? null
            });
            return;
        }

        set({ view: transition.view, subscreenReturnView: transition.subscreenReturnView });
    },

    openSettings: (returnView = 'menu') => {
        const { run } = get();
        const transition = resolveNavigationTransition(get(), 'openSettings', returnView);

        if (transition.freezeRun && run) {
            const nextRun = freezeRunSnapshotForPlayingMetaOverlay(run);

            clearAllTimers();
            set({
                view: transition.view,
                settingsReturnView: transition.settingsReturnView,
                run: nextRun
            });
            return;
        }

        set({
            view: transition.view,
            settingsReturnView: transition.settingsReturnView
        });
    },

    closeSettings: () => {
        const { run } = get();
        const transition = resolveNavigationTransition(get(), 'closeSettings');

        if (transition.resumeRun) {
            const nextRun = run?.status === 'paused' ? resumeRunWithTimers(run) : run;
            set({
                view: transition.view,
                settingsReturnView: transition.settingsReturnView,
                run: nextRun ?? null
            });
            return;
        }

        set({ view: transition.view, settingsReturnView: transition.settingsReturnView });
    },

    updateSettings: async (settings) => {
        const persistedSettings = await persistSaveSettings(settings);
        const nextSave = normalizeSaveData({
            ...get().saveData,
            settings: persistedSettings
        });

        set({
            settings: persistedSettings,
            saveData: nextSave
        });
    },

    dismissHowToPlay: async () => {
        const nextSave = normalizeSaveData({
            ...get().saveData,
            onboardingDismissed: true
        });

        set({
            saveData: nextSave,
            settings: nextSave.settings
        });

        await persistSaveData(nextSave);
    },

    pressTile: (tileId) => {
        const { run, view, boardPinMode, destroyPairArmed, peekModeArmed } = get();

        if (!run || view !== 'playing') {
            return;
        }

        const gambitThirdPick =
            run.status === 'resolving' &&
            run.board &&
            run.gambitAvailableThisFloor &&
            !run.gambitThirdFlipUsed &&
            run.board.flippedTileIds.length === 2;

        if (gambitThirdPick) {
            if (isGauntletExpired(run)) {
                applyResolvedRun({ ...run, status: 'gameOver', lives: 0 });
                return;
            }
            const flippedBefore = run.board?.flippedTileIds.length ?? 0;
            const nextRun = flipTile(run, tileId);
            if (nextRun === run) {
                return;
            }
            const flippedAfter = nextRun.board?.flippedTileIds.length ?? 0;
            if (flippedAfter > flippedBefore) {
                void resumeAudioContext();
                const g = sfxGainFromStore();
                playFlipSfx(g);
                if (flippedAfter === 3) {
                    playGambitCommitSfx(g);
                }
            }
            set({ run: nextRun, peekModeArmed: false });
            if (nextRun.status === 'resolving' && nextRun.timerState.resolveRemainingMs !== null) {
                scheduleResolveTimer(nextRun.timerState.resolveRemainingMs);
            }
            return;
        }

        if (run.status !== 'playing') {
            return;
        }

        if (isGauntletExpired(run)) {
            applyResolvedRun({ ...run, status: 'gameOver', lives: 0 });
            return;
        }

        const pressedTile = run.board?.tiles.find((tile) => tile.id === tileId) ?? null;
        if (pressedTile?.pairKey === EXIT_PAIR_KEY) {
            const nextRun = revealDungeonExit(run, tileId);
            if (nextRun !== run) {
                void resumeAudioContext();
                playFlipSfx(sfxGainFromStore());
            }
            set({
                run: nextRun,
                boardPinMode: false,
                destroyPairArmed: false,
                peekModeArmed: false,
                dungeonExitPromptOpen: true
            });
            return;
        }
        if (pressedTile?.pairKey === SHOP_PAIR_KEY) {
            const nextRun = revealDungeonShop(run, tileId);
            if (nextRun === run || nextRun.shopOffers.length === 0) {
                return;
            }
            void resumeAudioContext();
            playFlipSfx(sfxGainFromStore());
            clearAllTimers();
            set({
                run: freezeRunSnapshotForPlayingMetaOverlay(nextRun),
                view: 'shop',
                shopReturnMode: 'floor',
                boardPinMode: false,
                destroyPairArmed: false,
                peekModeArmed: false,
                ...BOARD_FLOATER_POP_CLEAR
            });
            return;
        }
        if (pressedTile?.pairKey === ROOM_PAIR_KEY) {
            const nextRun = revealDungeonRoom(run, tileId);
            if (nextRun !== run) {
                void resumeAudioContext();
                playFlipSfx(sfxGainFromStore());
                set({
                    run: nextRun,
                    boardPinMode: false,
                    destroyPairArmed: false,
                    peekModeArmed: false
                });
            }
            return;
        }

        if (boardPinMode) {
            const nextRun = togglePinnedTile(run, tileId);
            if (nextRun !== run) {
                set({ run: nextRun });
            }
            return;
        }

        if (run.strayRemoveArmed) {
            const nextRun = applyStrayRemove(run, tileId);
            if (nextRun !== run) {
                void resumeAudioContext();
                playStrayPowerSfx(sfxGainFromStore());
                set({ run: nextRun });
            }
            return;
        }

        if (peekModeArmed && run.peekCharges > 0 && run.board && run.board.flippedTileIds.length === 0) {
            const nextRun = applyPeek(run, tileId);
            if (nextRun !== run) {
                void resumeAudioContext();
                playPeekPowerSfx(sfxGainFromStore());
                set({ run: nextRun, peekModeArmed: false });
            }
            return;
        }

        if (destroyPairArmed) {
            const nextRun = applyDestroyPair(run, tileId);
            if (nextRun === run) {
                return;
            }

            void resumeAudioContext();
            playDestroyPairSfx(sfxGainFromStore());

            set({ run: nextRun, destroyPairArmed: false, peekModeArmed: false });

            if (nextRun.status === 'levelComplete' || nextRun.status === 'gameOver') {
                applyResolvedRun(nextRun);
            }
            return;
        }

        const flippedBefore = run.board?.flippedTileIds.length ?? 0;
        const nextRun = flipTile(run, tileId);

        if (nextRun === run) {
            return;
        }

        const flippedAfter = nextRun.board?.flippedTileIds.length ?? 0;
        if (flippedAfter > flippedBefore) {
            void resumeAudioContext();
            playFlipSfx(sfxGainFromStore());
        }

        set({ run: nextRun, peekModeArmed: false });

        if (nextRun.status === 'resolving' && nextRun.timerState.resolveRemainingMs !== null) {
            scheduleResolveTimer(nextRun.timerState.resolveRemainingMs);
        }
    },

    closeDungeonExitPrompt: () => {
        set({ dungeonExitPromptOpen: false });
    },

    activateDungeonExitFromPrompt: (spend = 'none') => {
        const { run, view } = get();
        if (!run || view !== 'playing') {
            return;
        }
        const nextRun = activateDungeonExit(run, spend);
        set({ dungeonExitPromptOpen: false });
        if (nextRun !== run) {
            applyResolvedRun(nextRun);
        }
    },

    togglePeekMode: () => {
        const { run, view, boardPinMode, destroyPairArmed, peekModeArmed } = get();
        if (!run || view !== 'playing' || run.status !== 'playing' || run.peekCharges < 1) {
            return;
        }
        if (boardPinMode || destroyPairArmed) {
            return;
        }
        const nextPeekArmed = !peekModeArmed;
        const nextRun = run.strayRemoveArmed ? { ...run, strayRemoveArmed: false } : run;
        if (nextPeekArmed) {
            void resumeAudioContext();
            playPowerArmSfx(sfxGainFromStore());
        }
        set({
            peekModeArmed: nextPeekArmed,
            run: nextRun
        });
    },

    undoResolvingFlip: () => {
        const { run, view } = get();
        if (!run || view !== 'playing' || run.status !== 'resolving') {
            return;
        }
        clearResolveTimer();
        const nextRun = cancelResolvingWithUndo(run);
        if (nextRun !== run) {
            set({ run: nextRun });
        }
    },

    toggleStrayArm: () => {
        const { run, view } = get();
        if (!run || view !== 'playing' || run.status !== 'playing') {
            return;
        }
        const wasArmed = run.strayRemoveArmed;
        const nextRun = toggleStrayRemoveArmed(run);
        if (nextRun !== run) {
            if (nextRun.strayRemoveArmed && !wasArmed) {
                void resumeAudioContext();
                playPowerArmSfx(sfxGainFromStore());
            }
            set({
                run: nextRun,
                boardPinMode: false,
                destroyPairArmed: false,
                peekModeArmed: false
            });
        }
    },

    shuffleBoard: () => {
        const { run, view } = get();

        if (!run || view !== 'playing' || run.status !== 'playing') {
            return;
        }

        const nextRun = applyShuffle(run);
        if (nextRun !== run) {
            set({ run: nextRun });
        }
    },

    armRegionShuffleRowPick: (row) => {
        const { run, view } = get();
        if (!run || view !== 'playing' || run.status !== 'playing') {
            return;
        }
        const nextRun = armRegionShuffleRow(run, row);
        if (nextRun !== run) {
            set({ run: nextRun, boardPinMode: false, destroyPairArmed: false, peekModeArmed: false });
        }
    },

    shuffleRegionRow: (row) => {
        const { run, view } = get();
        if (!run || view !== 'playing' || run.status !== 'playing') {
            return;
        }
        const nextRun = applyRegionShuffle(run, row);
        if (nextRun !== run) {
            set({ run: nextRun, boardPinMode: false, destroyPairArmed: false, peekModeArmed: false });
        }
    },

    applyFlashPairPower: () => {
        const { run, view } = get();
        if (!run || view !== 'playing' || run.status !== 'playing') {
            return;
        }
        if (!run.practiceMode && !run.wildMenuRun) {
            return;
        }
        const nextRun = applyFlashPair(run);
        if (nextRun !== run) {
            void resumeAudioContext();
            playPowerArmSfx(sfxGainFromStore() * 0.78);
            set({ run: nextRun });
        }
    },

    toggleBoardPinMode: () => {
        const { boardPinMode, run, view } = get();
        const next = !boardPinMode;
        if (next && run && view === 'playing' && run.status === 'playing') {
            void resumeAudioContext();
            playPowerArmSfx(sfxGainFromStore() * 0.92);
        }
        set({
            boardPinMode: next,
            destroyPairArmed: false,
            peekModeArmed: false
        });
    },

    toggleDestroyPairArmed: () => {
        const { destroyPairArmed, run, view } = get();
        const next = !destroyPairArmed;
        if (next && run && view === 'playing' && run.status === 'playing' && run.destroyPairCharges > 0) {
            void resumeAudioContext();
            playPowerArmSfx(sfxGainFromStore());
        }
        set({
            destroyPairArmed: next,
            boardPinMode: false,
            peekModeArmed: false
        });
    },

    pause: () => {
        const { run } = get();

        if (!run) {
            return;
        }

        const pausedRun = freezeRun(run);
        clearAllTimers();
        void resumeUiSfxContext();
        playPauseOpenSfx(sfxGainFromStore());
        set({ run: pausedRun, ...BOARD_FLOATER_POP_CLEAR });
    },

    resume: () => {
        const { run } = get();

        if (!run) {
            return;
        }

        void resumeUiSfxContext();
        playPauseResumeSfx(sfxGainFromStore());
        set({ run: resumeRunWithTimers(run) });
    },

    acceptEndlessRiskWager: () => {
        const { run } = get();

        if (!run) {
            return;
        }

        void resumeAudioContext();
        playWagerArmSfx(sfxGainFromStore());
        set({ run: acceptEndlessRiskWagerRule(run) });
    },

    purchaseShopOffer: (offerId) => {
        const { run, view, shopReturnMode } = get();
        if (!run || view !== 'shop' || (run.status !== 'levelComplete' && shopReturnMode !== 'floor')) {
            return;
        }
        set({ run: purchaseShopOfferRule(run, offerId) });
    },

    rerollShopOffers: () => {
        const { run, view, shopReturnMode } = get();
        if (!run || view !== 'shop' || (run.status !== 'levelComplete' && shopReturnMode !== 'floor')) {
            return;
        }
        set({ run: rerollShopOffersRule(run) });
    },

    continueToNextLevel: () => {
        const { run } = get();

        if (!run) {
            return;
        }

        clearAllTimers();

        if (run.status === 'levelComplete' && run.sideRoom) {
            set({
                view: 'sideRoom',
                run,
                boardPinMode: false,
                destroyPairArmed: false,
                peekModeArmed: false,
                ...BOARD_FLOATER_POP_CLEAR
            });
            return;
        }

        if (run.status === 'levelComplete' && needsRelicPick(run) && !run.relicOffer) {
            set({
                view: 'playing',
                run: openRelicOffer(run),
                boardPinMode: false,
                destroyPairArmed: false,
                peekModeArmed: false,
                ...BOARD_FLOATER_POP_CLEAR
            });
            return;
        }

        if (run.relicOffer) {
            return;
        }

        const nextRun = advanceToNextLevel(run);

        if (nextRun.status === 'gameOver') {
            applyResolvedRun(nextRun);
            return;
        }

        set({
            newlyUnlockedAchievements: [],
            view: 'playing',
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run: nextRun,
            ...BOARD_FLOATER_POP_CLEAR
        });

        if (nextRun.timerState.memorizeRemainingMs !== null) {
            scheduleMemorizeTimer(nextRun.timerState.memorizeRemainingMs);
        }
    },

    chooseRouteAndContinue: (choiceId) => {
        const { run } = get();

        if (!run || run.status !== 'levelComplete') {
            return;
        }
        if (run.pendingRouteCardPlan) {
            get().continueToNextLevel();
            return;
        }

        const routeOutcome = applyRouteChoiceOutcome(run, choiceId);
        if (!routeOutcome.applied) {
            return;
        }

        clearAllTimers();

        const routeRun = openRouteSideRoom(routeOutcome.run);

        if (routeRun.sideRoom) {
            set({
                view: 'sideRoom',
                run: routeRun,
                boardPinMode: false,
                destroyPairArmed: false,
                peekModeArmed: false,
                ...BOARD_FLOATER_POP_CLEAR
            });
            return;
        }

        if (routeRun.shopOffers.length > 0) {
            set({
                view: 'shop',
                run: routeRun,
                boardPinMode: false,
                destroyPairArmed: false,
                peekModeArmed: false,
                ...BOARD_FLOATER_POP_CLEAR
            });
            return;
        }

        if (needsRelicPick(routeRun) && !routeRun.relicOffer) {
            set({
                view: 'playing',
                run: openRelicOffer(routeRun),
                boardPinMode: false,
                destroyPairArmed: false,
                peekModeArmed: false,
                ...BOARD_FLOATER_POP_CLEAR
            });
            return;
        }

        if (routeRun.relicOffer) {
            set({ run: routeRun });
            return;
        }

        const nextRun = advanceToNextLevel(routeRun);

        if (nextRun.status === 'gameOver') {
            applyResolvedRun(nextRun);
            return;
        }

        set({
            newlyUnlockedAchievements: [],
            view: 'playing',
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run: nextRun,
            ...BOARD_FLOATER_POP_CLEAR
        });

        if (nextRun.timerState.memorizeRemainingMs !== null) {
            scheduleMemorizeTimer(nextRun.timerState.memorizeRemainingMs);
        }
    },

    restartRun: () => {
        clearAllTimers();
        const prev = get().run;
        const best = get().saveData.bestScore;
        const save = get().saveData;
        const meta = metaRelicOpts(save);
        const settings = get().settings;
        let run: RunState;
        if (prev?.gameMode === 'daily') {
            run = createDailyRun(best, meta);
        } else if (prev?.gameMode === 'gauntlet') {
            run = createGauntletRun(best, prev.gauntletSessionDurationMs ?? 10 * 60 * 1000, meta);
        } else if (prev?.gameMode === 'puzzle' && prev.puzzleId) {
            const puzzle = BUILTIN_PUZZLES[prev.puzzleId];
            run = puzzle ? createPuzzleRun(best, puzzle.id, puzzle.tiles, 1, meta) : createNewRun(best, meta);
        } else if (prev?.gameMode === 'meditation') {
            run = createMeditationRun(
                best,
                prev.activeMutators.length > 0 ? prev.activeMutators : undefined,
                meta
            );
        } else if (prev?.activeContract?.maxPinsTotalRun != null) {
            run = createNewRun(best, { ...meta, activeContract: prev.activeContract });
        } else if (prev?.wildMenuRun) {
            run = createWildRun(best, meta);
        } else if (prev?.practiceMode) {
            run = createNewRun(best, { practiceMode: true, ...meta });
        } else if (prev?.activeContract?.noShuffle && prev.activeContract.noDestroy) {
            run = createNewRun(best, {
                ...meta,
                activeContract: prev.activeContract
            });
        } else {
            run = createNewRun(best, meta);
        }
        run = patchRunFromUserSettings(run, settings);

        trackEvent('run_start', { mode: run.gameMode, practice: run.practiceMode, restarted: true });
        playRunStartUiSfxFromStore();

        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run,
            ...BOARD_FLOATER_POP_CLEAR
        });

        if (run.timerState.memorizeRemainingMs !== null) {
            scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
        }
    },

    endRun: () => {
        clearAllTimers();
        set({
            view: 'menu',
            run: null,
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            subscreenReturnView: 'menu',
            settingsReturnView: 'menu',
            ...BOARD_FLOATER_POP_CLEAR
        });
    },

    triggerDebugReveal: () => {
        const { run, settings } = get();

        if (!run || run.status !== 'playing' || !settings.debugFlags.allowBoardReveal) {
            return;
        }

        const nextRun = enableDebugPeek(run, settings.debugFlags.disableAchievementsOnDebug);

        set({ run: nextRun });

        if (nextRun.timerState.debugRevealRemainingMs !== null) {
            scheduleDebugRevealTimer(nextRun.timerState.debugRevealRemainingMs);
        }
    },

    __devApplySandbox: (config: DevSandboxConfig) => {
        if (!import.meta.env.DEV || !config.enabled) {
            return;
        }
        clearAllTimers();
        const { saveData, settings } = get();
        const best = saveData.bestScore;
        const screen = config.screen;
        if (!screen) {
            return;
        }

        const resetChrome = {
            newlyUnlockedAchievements: [] as AchievementId[],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            ...BOARD_FLOATER_POP_CLEAR
        };

        if (screen === 'menu') {
            set({
                view: 'menu',
                run: null,
                ...resetChrome,
                subscreenReturnView: 'menu',
                settingsReturnView: 'menu'
            });
            return;
        }

        if (screen === 'settings') {
            set({
                view: 'settings',
                run: null,
                ...resetChrome,
                subscreenReturnView: 'menu',
                settingsReturnView: 'menu'
            });
            return;
        }

        if (screen === 'modeSelect') {
            set({
                view: 'modeSelect',
                run: null,
                ...resetChrome,
                subscreenReturnView: 'menu',
                settingsReturnView: 'menu'
            });
            return;
        }

        if (screen === 'collection') {
            set({
                view: 'collection',
                run: null,
                ...resetChrome,
                subscreenReturnView: 'menu',
                settingsReturnView: 'menu'
            });
            return;
        }

        if (screen === 'profile') {
            set({
                view: 'profile',
                run: null,
                ...resetChrome,
                subscreenReturnView: 'menu',
                settingsReturnView: 'menu'
            });
            return;
        }

        if (screen === 'inventory' || screen === 'codex') {
            set({
                view: screen,
                run: null,
                ...resetChrome,
                subscreenReturnView: 'menu',
                settingsReturnView: 'menu'
            });
            return;
        }

        if (screen === 'playing') {
            const run = patchRunFromUserSettings(buildSandboxRun(config.fixture, best), settings);
            const seededAchievements =
                config.unlockAchievements.length > 0 ? config.unlockAchievements : resetChrome.newlyUnlockedAchievements;
            set({
                view: 'playing',
                run,
                ...resetChrome,
                newlyUnlockedAchievements: seededAchievements,
                subscreenReturnView: 'menu',
                settingsReturnView: 'menu'
            });
            if (run.timerState.memorizeRemainingMs !== null) {
                scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
            }
            if (
                run.status === 'resolving' &&
                run.timerState.resolveRemainingMs !== null &&
                run.timerState.resolveRemainingMs > 0
            ) {
                scheduleResolveTimer(run.timerState.resolveRemainingMs);
            }
            return;
        }

        if (screen === 'shop') {
            const run = patchRunFromUserSettings(buildSandboxRun(config.fixture ?? 'shop', best), settings);
            const shopRun =
                run.status === 'levelComplete' && run.shopOffers.length > 0
                    ? run
                    : patchRunFromUserSettings(buildSandboxRun('shop', best), settings);
            set({
                view: 'shop',
                run: shopRun,
                ...resetChrome,
                subscreenReturnView: 'menu',
                settingsReturnView: 'menu'
            });
            return;
        }

        if (screen === 'gameOver') {
            const run = patchRunFromUserSettings(buildSandboxRun(config.fixture ?? 'gameOver', best), settings);
            set({
                view: 'gameOver',
                run,
                ...resetChrome,
                subscreenReturnView: 'menu',
                settingsReturnView: 'menu'
            });
        }
    }
}));

useAppStore.subscribe(() => {
    syncGauntletExpiryWatch();
});

registerPersistenceWriteFailureHandler(({ consecutive }) => {
    useAppStore.setState({
        persistenceWriteNotice: persistenceNoticeForConsecutiveFailures(consecutive)
    });
});
