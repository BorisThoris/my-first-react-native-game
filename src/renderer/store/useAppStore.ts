import { create } from 'zustand/react';
import { evaluateAchievementUnlocks } from '../../shared/achievements';
import type {
    AchievementId,
    MutatorId,
    RelicId,
    RunState,
    SaveData,
    Settings,
    SubscreenReturnView,
    ViewState
} from '../../shared/contracts';
import { BUILTIN_PUZZLES } from '../../shared/builtin-puzzles';
import {
    advanceToNextLevel,
    applyDestroyPair,
    applyFlashPair,
    applyPeek,
    applyRegionShuffle,
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
    createRunFromExportPayload,
    createWildRun,
    createRunSummary,
    disableDebugPeek,
    enableDebugPeek,
    finishMemorizePhase,
    flipTile,
    isGauntletExpired,
    openRelicOffer,
    pauseRun,
    resolveBoardTurn,
    resumeRun,
    togglePinnedTile,
    toggleStrayRemoveArmed
} from '../../shared/game';
import { parseRunImport } from '../../shared/run-export';
import { trackEvent } from '../../shared/telemetry';
import {
    createDefaultSaveData,
    mergeBestFloorNoPowers,
    mergeDailyComplete,
    mergeEncoreFromRun,
    mergeRelicPickStat,
    normalizeSaveData
} from '../../shared/save-data';
import { desktopClient } from '../desktop-client';
import type { DevSandboxConfig } from '../dev/devSandboxParams';
import { buildSandboxRun } from '../dev/runFixtures';
import { needsRelicPick } from '../../shared/relics';

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
    boardPinMode: boolean;
    destroyPairArmed: boolean;
    peekModeArmed: boolean;
    hydrate: () => Promise<void>;
    startRun: () => void;
    startDailyRun: () => void;
    startGauntletRun: () => void;
    startPuzzleRun: (puzzleId: string) => void;
    startPracticeRun: () => void;
    startScholarContractRun: () => void;
    startMeditationRun: () => void;
    startMeditationRunWithMutators: (mutators: MutatorId[]) => void;
    startPinVowRun: () => void;
    startWildRun: () => void;
    importRunFromClipboard: (raw: string) => boolean;
    pickRelic: (relicId: RelicId) => void;
    dismissPowersFtue: () => Promise<void>;
    goToMenu: () => void;
    openModeSelect: () => void;
    openCollection: () => void;
    openInventoryFromMenu: () => void;
    openCodexFromMenu: () => void;
    openInventoryFromPlaying: () => void;
    openCodexFromPlaying: () => void;
    closeSubscreen: () => void;
    openSettings: (returnView?: SubscreenReturnView) => void;
    closeSettings: () => void;
    updateSettings: (settings: Settings) => Promise<void>;
    dismissHowToPlay: () => Promise<void>;
    pressTile: (tileId: string) => void;
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
    continueToNextLevel: () => void;
    restartRun: () => void;
    endRun: () => void;
    triggerDebugReveal: () => void;
    /** DEV-only: jump to a screen / fixture from URL sandbox params. No-op in production. */
    __devApplySandbox: (config: DevSandboxConfig) => void;
}

let memorizeTimer: ActiveTimer | null = null;
let resolveTimer: ActiveTimer | null = null;
let debugRevealTimer: ActiveTimer | null = null;

const persistSaveData = async (saveData: SaveData): Promise<SaveData> => normalizeSaveData(await desktopClient.saveGame(saveData));

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

const applyResolvedRun = (resolvedRun: RunState): void => {
    const state = useAppStore.getState();
    let nextRun = resolvedRun.status === 'playing' ? resolvedRun : disableDebugPeek(resolvedRun);
    const unlockedAchievements = evaluateAchievementUnlocks(nextRun, state.saveData);
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

        void Promise.all(unlockedAchievements.map((achievementId) => desktopClient.unlockAchievement(achievementId)));
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
            newlyUnlockedAchievements: unlockedAchievements
        });
    } else {
        useAppStore.setState({
            run: nextRun,
            view: 'playing',
            saveData: nextSave,
            settings: nextSave.settings,
            newlyUnlockedAchievements: unlockedAchievements
        });
    }

    void persistSaveData(nextSave);
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
        const { run, saveData } = useAppStore.getState();

        if (run && run.status === 'resolving') {
            applyResolvedRun(resolveBoardTurn(run, saveData.playerStats?.encorePairKeysLastRun ?? []));
        }

        return;
    }

    resolveTimer = {
        deadline: Date.now() + duration,
        timeout: setTimeout(() => {
            resolveTimer = null;
            const { run, saveData } = useAppStore.getState();

            if (!run || run.status !== 'resolving') {
                return;
            }

            applyResolvedRun(resolveBoardTurn(run, saveData.playerStats?.encorePairKeysLastRun ?? []));
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

const resumeRunWithTimers = (run: RunState): RunState => {
    const resumedRun = resumeRun(run);

    if (resumedRun.status === 'memorize' && resumedRun.timerState.memorizeRemainingMs) {
        scheduleMemorizeTimer(resumedRun.timerState.memorizeRemainingMs);
    }

    if (resumedRun.status === 'resolving' && resumedRun.timerState.resolveRemainingMs !== null) {
        scheduleResolveTimer(resumedRun.timerState.resolveRemainingMs);
    }

    if (resumedRun.debugPeekActive && resumedRun.timerState.debugRevealRemainingMs) {
        scheduleDebugRevealTimer(resumedRun.timerState.debugRevealRemainingMs);
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
    boardPinMode: false,
    destroyPairArmed: false,
    peekModeArmed: false,

    hydrate: async () => {
        if (get().hydrating || get().hydrated) {
            return;
        }

        set({ hydrating: true });

        const [saveData, steamConnected] = await Promise.all([
            desktopClient.getSaveData().then(normalizeSaveData).catch(() => createDefaultSaveData()),
            desktopClient.isSteamConnected().catch(() => false)
        ]);

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
        const run = patchRunFromUserSettings(createNewRun(get().saveData.bestScore), get().settings);
        trackEvent('run_start', { mode: run.gameMode, practice: run.practiceMode });

        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run
        });

        if (run.timerState.memorizeRemainingMs) {
            scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
        }
    },

    startDailyRun: () => {
        clearAllTimers();
        const run = patchRunFromUserSettings(createDailyRun(get().saveData.bestScore), get().settings);
        trackEvent('run_start', { mode: run.gameMode, practice: run.practiceMode });
        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run
        });
        if (run.timerState.memorizeRemainingMs) {
            scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
        }
    },

    startGauntletRun: () => {
        clearAllTimers();
        const run = patchRunFromUserSettings(createGauntletRun(get().saveData.bestScore), get().settings);
        trackEvent('run_start', { mode: run.gameMode, practice: run.practiceMode });
        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run
        });
        if (run.timerState.memorizeRemainingMs) {
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
            createPuzzleRun(get().saveData.bestScore, puzzle.id, puzzle.tiles),
            get().settings
        );
        trackEvent('run_start', { mode: run.gameMode, practice: run.practiceMode, puzzleId: puzzle.id });
        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run
        });
        if (run.timerState.memorizeRemainingMs) {
            scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
        }
    },

    startPracticeRun: () => {
        clearAllTimers();
        const run = patchRunFromUserSettings(
            createNewRun(get().saveData.bestScore, { practiceMode: true }),
            get().settings
        );
        trackEvent('run_start', { mode: run.gameMode, practice: run.practiceMode });
        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run
        });
        if (run.timerState.memorizeRemainingMs) {
            scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
        }
    },

    startScholarContractRun: () => {
        clearAllTimers();
        const run = patchRunFromUserSettings(
            createNewRun(get().saveData.bestScore, {
                activeContract: { noShuffle: true, noDestroy: true, maxMismatches: null }
            }),
            get().settings
        );
        trackEvent('run_start', { mode: run.gameMode, practice: run.practiceMode, scholar: true });
        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run
        });
        if (run.timerState.memorizeRemainingMs) {
            scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
        }
    },

    startMeditationRun: () => {
        clearAllTimers();
        const run = patchRunFromUserSettings(createMeditationRun(get().saveData.bestScore), get().settings);
        trackEvent('run_start', { mode: run.gameMode, practice: run.practiceMode });
        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run
        });
        if (run.timerState.memorizeRemainingMs) {
            scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
        }
    },

    startMeditationRunWithMutators: (mutators) => {
        clearAllTimers();
        const run = patchRunFromUserSettings(
            createMeditationRun(get().saveData.bestScore, mutators),
            get().settings
        );
        trackEvent('run_start', {
            mode: run.gameMode,
            practice: run.practiceMode,
            meditation_focus_count: mutators.length,
            meditation_focus: mutators.length > 0 ? mutators.join(',') : undefined
        });
        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run
        });
        if (run.timerState.memorizeRemainingMs) {
            scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
        }
    },

    startPinVowRun: () => {
        clearAllTimers();
        const run = patchRunFromUserSettings(
            createNewRun(get().saveData.bestScore, {
                activeContract: { noShuffle: false, noDestroy: false, maxMismatches: null, maxPinsTotalRun: 10 }
            }),
            get().settings
        );
        trackEvent('run_start', { mode: run.gameMode, practice: run.practiceMode, pinVow: true });
        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run
        });
        if (run.timerState.memorizeRemainingMs) {
            scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
        }
    },

    startWildRun: () => {
        clearAllTimers();
        const run = patchRunFromUserSettings(createWildRun(get().saveData.bestScore), get().settings);
        trackEvent('run_start', { mode: run.gameMode, practice: run.practiceMode, wild: true });
        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run
        });
        if (run.timerState.memorizeRemainingMs) {
            scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
        }
    },

    importRunFromClipboard: (raw) => {
        const payload = parseRunImport(raw.trim());
        if (!payload) {
            return false;
        }
        clearAllTimers();
        const run = patchRunFromUserSettings(createRunFromExportPayload(get().saveData.bestScore, payload), get().settings);
        trackEvent('run_start', { mode: run.gameMode, practice: run.practiceMode, imported: true });
        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run
        });
        if (run.timerState.memorizeRemainingMs) {
            scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
        }
        return true;
    },

    pickRelic: (relicId) => {
        const { run } = get();
        if (!run?.relicOffer?.options.includes(relicId)) {
            return;
        }
        clearAllTimers();
        const nextRun = completeRelicPickAndAdvance(run, relicId);
        let nextSave = mergeRelicPickStat(get().saveData, relicId);
        nextSave = normalizeSaveData(nextSave);
        set({
            run: nextRun,
            saveData: nextSave,
            settings: nextSave.settings,
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false
        });
        if (nextRun.timerState.memorizeRemainingMs) {
            scheduleMemorizeTimer(nextRun.timerState.memorizeRemainingMs);
        }
        void persistSaveData(nextSave);
    },

    dismissPowersFtue: async () => {
        const nextSave = normalizeSaveData({
            ...get().saveData,
            powersFtueSeen: true
        });
        set({ saveData: nextSave, settings: nextSave.settings });
        await persistSaveData(nextSave);
    },

    goToMenu: () => {
        clearAllTimers();
        set({
            view: 'menu',
            run: null,
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            subscreenReturnView: 'menu',
            settingsReturnView: 'menu'
        });
    },

    openModeSelect: () => {
        set({ view: 'modeSelect', subscreenReturnView: 'menu' });
    },

    openCollection: () => {
        set({ view: 'collection', subscreenReturnView: 'menu' });
    },

    openInventoryFromMenu: () => {
        set({ view: 'inventory', subscreenReturnView: 'menu' });
    },

    openCodexFromMenu: () => {
        set({ view: 'codex', subscreenReturnView: 'menu' });
    },

    openInventoryFromPlaying: () => {
        const { run, view } = get();
        if (!run || view !== 'playing') {
            return;
        }
        const nextRun =
            run.status === 'paused' || run.status === 'levelComplete' || run.status === 'gameOver'
                ? run
                : freezeRun(run);
        clearAllTimers();
        set({
            view: 'inventory',
            subscreenReturnView: 'playing',
            run: nextRun
        });
    },

    openCodexFromPlaying: () => {
        const { run, view } = get();
        if (!run || view !== 'playing') {
            return;
        }
        const nextRun =
            run.status === 'paused' || run.status === 'levelComplete' || run.status === 'gameOver'
                ? run
                : freezeRun(run);
        clearAllTimers();
        set({
            view: 'codex',
            subscreenReturnView: 'playing',
            run: nextRun
        });
    },

    closeSubscreen: () => {
        const { subscreenReturnView, run, view } = get();

        if (subscreenReturnView === 'playing' && run && (view === 'inventory' || view === 'codex')) {
            const nextRun = run.status === 'paused' ? resumeRunWithTimers(run) : run;
            set({
                view: 'playing',
                run: nextRun
            });
            return;
        }

        set({ view: subscreenReturnView });
    },

    openSettings: (returnView = 'menu') => {
        const { run } = get();

        if (returnView === 'playing' && run) {
            const nextRun =
                run.status === 'paused' || run.status === 'levelComplete' || run.status === 'gameOver'
                    ? run
                    : freezeRun(run);

            clearAllTimers();
            set({
                view: 'settings',
                settingsReturnView: returnView,
                run: nextRun
            });
            return;
        }

        set({
            view: 'settings',
            settingsReturnView: returnView
        });
    },

    closeSettings: () => {
        const { settingsReturnView, run } = get();

        if (settingsReturnView === 'playing' && run) {
            const nextRun = run.status === 'paused' ? resumeRunWithTimers(run) : run;

            set({
                view: 'playing',
                run: nextRun
            });
            return;
        }

        set({ view: settingsReturnView });
    },

    updateSettings: async (settings) => {
        const persistedSettings = await desktopClient.saveSettings(settings);
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
            const nextRun = flipTile(run, tileId);
            if (nextRun === run) {
                return;
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
                set({ run: nextRun });
            }
            return;
        }

        if (peekModeArmed && run.peekCharges > 0 && run.board && run.board.flippedTileIds.length === 0) {
            const nextRun = applyPeek(run, tileId);
            if (nextRun !== run) {
                set({ run: nextRun, peekModeArmed: false });
            }
            return;
        }

        if (destroyPairArmed) {
            const nextRun = applyDestroyPair(run, tileId);
            if (nextRun === run) {
                return;
            }

            set({ run: nextRun, destroyPairArmed: false, peekModeArmed: false });

            if (nextRun.status === 'levelComplete' || nextRun.status === 'gameOver') {
                applyResolvedRun(nextRun);
            }
            return;
        }

        const nextRun = flipTile(run, tileId);

        if (nextRun === run) {
            return;
        }

        set({ run: nextRun, peekModeArmed: false });

        if (nextRun.status === 'resolving' && nextRun.timerState.resolveRemainingMs !== null) {
            scheduleResolveTimer(nextRun.timerState.resolveRemainingMs);
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
        const nextRun = run.strayRemoveArmed ? { ...run, strayRemoveArmed: false } : run;
        set({
            peekModeArmed: !peekModeArmed,
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
        const nextRun = toggleStrayRemoveArmed(run);
        if (nextRun !== run) {
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
        const nextRun = applyFlashPair(run);
        if (nextRun !== run) {
            set({ run: nextRun });
        }
    },

    toggleBoardPinMode: () => {
        const { boardPinMode } = get();
        set({
            boardPinMode: !boardPinMode,
            destroyPairArmed: false,
            peekModeArmed: false
        });
    },

    toggleDestroyPairArmed: () => {
        const { destroyPairArmed } = get();
        set({
            destroyPairArmed: !destroyPairArmed,
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
        set({ run: pausedRun });
    },

    resume: () => {
        const { run } = get();

        if (!run) {
            return;
        }

        set({ run: resumeRunWithTimers(run) });
    },

    continueToNextLevel: () => {
        const { run } = get();

        if (!run) {
            return;
        }

        clearAllTimers();

        if (run.status === 'levelComplete' && needsRelicPick(run) && !run.relicOffer) {
            set({
                run: openRelicOffer(run),
                boardPinMode: false,
                destroyPairArmed: false,
                peekModeArmed: false
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
            run: nextRun
        });

        if (nextRun.timerState.memorizeRemainingMs) {
            scheduleMemorizeTimer(nextRun.timerState.memorizeRemainingMs);
        }
    },

    restartRun: () => {
        clearAllTimers();
        const prev = get().run;
        const best = get().saveData.bestScore;
        const settings = get().settings;
        let run: RunState;
        if (prev?.gameMode === 'daily') {
            run = createDailyRun(best);
        } else if (prev?.gameMode === 'gauntlet') {
            run = createGauntletRun(best);
        } else if (prev?.gameMode === 'puzzle' && prev.puzzleId) {
            const puzzle = BUILTIN_PUZZLES[prev.puzzleId];
            run = puzzle ? createPuzzleRun(best, puzzle.id, puzzle.tiles) : createNewRun(best);
        } else if (prev?.gameMode === 'meditation') {
            run = createMeditationRun(best, prev.activeMutators.length > 0 ? prev.activeMutators : undefined);
        } else if (prev?.activeContract?.maxPinsTotalRun != null) {
            run = createNewRun(best, { activeContract: prev.activeContract });
        } else if (prev?.wildMenuRun) {
            run = createWildRun(best);
        } else if (prev?.practiceMode) {
            run = createNewRun(best, { practiceMode: true });
        } else if (prev?.activeContract?.noShuffle && prev.activeContract.noDestroy) {
            run = createNewRun(best, {
                activeContract: { noShuffle: true, noDestroy: true, maxMismatches: null }
            });
        } else {
            run = createNewRun(best);
        }
        run = patchRunFromUserSettings(run, settings);

        trackEvent('run_start', { mode: run.gameMode, practice: run.practiceMode, restarted: true });

        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            boardPinMode: false,
            destroyPairArmed: false,
            peekModeArmed: false,
            run
        });

        if (run.timerState.memorizeRemainingMs) {
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
            settingsReturnView: 'menu'
        });
    },

    triggerDebugReveal: () => {
        const { run, settings } = get();

        if (!run || run.status !== 'playing' || !settings.debugFlags.allowBoardReveal) {
            return;
        }

        const nextRun = enableDebugPeek(run, settings.debugFlags.disableAchievementsOnDebug);

        set({ run: nextRun });

        if (nextRun.timerState.debugRevealRemainingMs) {
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
            peekModeArmed: false
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
            set({
                view: 'playing',
                run,
                ...resetChrome,
                subscreenReturnView: 'menu',
                settingsReturnView: 'menu'
            });
            if (run.timerState.memorizeRemainingMs) {
                scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
            }
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
