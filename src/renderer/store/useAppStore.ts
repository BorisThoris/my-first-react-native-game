import { create } from 'zustand';
import { evaluateAchievementUnlocks } from '../../shared/achievements';
import type { AchievementId, RunState, SaveData, Settings, ViewState } from '../../shared/contracts';
import {
    advanceToNextLevel,
    createNewRun,
    createRunSummary,
    disableDebugPeek,
    enableDebugPeek,
    finishMemorizePhase,
    flipTile,
    pauseRun,
    resolveBoardTurn,
    resumeRun
} from '../../shared/game';
import { createDefaultSaveData, normalizeSaveData } from '../../shared/save-data';
import { desktopClient } from '../desktop-client';

interface ActiveTimer {
    deadline: number;
    timeout: ReturnType<typeof setTimeout>;
}

interface AppState {
    hydrated: boolean;
    hydrating: boolean;
    steamConnected: boolean;
    view: ViewState;
    settingsReturnView: Exclude<ViewState, 'boot' | 'settings'>;
    saveData: SaveData;
    settings: Settings;
    run: RunState | null;
    newlyUnlockedAchievements: AchievementId[];
    hydrate: () => Promise<void>;
    startRun: () => void;
    goToMenu: () => void;
    openSettings: (returnView?: Exclude<ViewState, 'boot' | 'settings'>) => void;
    closeSettings: () => void;
    updateSettings: (settings: Settings) => Promise<void>;
    dismissHowToPlay: () => Promise<void>;
    pressTile: (tileId: string) => void;
    pause: () => void;
    resume: () => void;
    continueToNextLevel: () => void;
    restartRun: () => void;
    endRun: () => void;
    triggerDebugReveal: () => void;
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

const clearAllTimers = (): void => {
    clearMemorizeTimer();
    clearResolveTimer();
    clearDebugRevealTimer();
};

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
        nextSave = normalizeSaveData({
            ...nextSave,
            achievements: {
                ...nextSave.achievements,
                ...Object.fromEntries(unlockedAchievements.map((achievementId) => [achievementId, true]))
            }
        });

        void Promise.all(unlockedAchievements.map((achievementId) => desktopClient.unlockAchievement(achievementId)));
    }

    if (nextRun.status === 'gameOver') {
        nextRun = createRunSummary(nextRun, unlockedAchievements);
        nextSave = normalizeSaveData({
            ...nextSave,
            onboardingDismissed: true,
            lastRunSummary: nextRun.lastRunSummary
        });

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
        const { run } = useAppStore.getState();

        if (run && run.status === 'resolving') {
            applyResolvedRun(resolveBoardTurn(run));
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

            applyResolvedRun(resolveBoardTurn(run));
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

    if (resumedRun.status === 'resolving' && resumedRun.timerState.resolveRemainingMs) {
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
    saveData: createDefaultSaveData(),
    settings: createDefaultSaveData().settings,
    run: null,
    newlyUnlockedAchievements: [],

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
        const run = createNewRun(get().saveData.bestScore);

        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            run
        });

        if (run.timerState.memorizeRemainingMs) {
            scheduleMemorizeTimer(run.timerState.memorizeRemainingMs);
        }
    },

    goToMenu: () => {
        clearAllTimers();
        set({
            view: 'menu',
            run: null,
            newlyUnlockedAchievements: []
        });
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
        const { run, view } = get();

        if (!run || view !== 'playing' || run.status !== 'playing') {
            return;
        }

        const nextRun = flipTile(run, tileId);

        if (nextRun === run) {
            return;
        }

        set({ run: nextRun });

        if (nextRun.status === 'resolving' && nextRun.timerState.resolveRemainingMs) {
            scheduleResolveTimer(nextRun.timerState.resolveRemainingMs);
        }
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
        const nextRun = advanceToNextLevel(run);

        set({
            newlyUnlockedAchievements: [],
            view: 'playing',
            run: nextRun
        });

        if (nextRun.timerState.memorizeRemainingMs) {
            scheduleMemorizeTimer(nextRun.timerState.memorizeRemainingMs);
        }
    },

    restartRun: () => {
        clearAllTimers();
        const run = createNewRun(get().saveData.bestScore);

        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
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
            newlyUnlockedAchievements: []
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
    }
}));
