import { create } from 'zustand';
import { evaluateAchievementUnlocks } from '../../shared/achievements';
import { DEBUG_REVEAL_MS, MATCH_DELAY_MS, type AchievementId, type RunState, type SaveData, type Settings, type ViewState } from '../../shared/contracts';
import {
    advanceToNextLevel,
    createNewRun,
    createRunSummary,
    disableDebugPeek,
    enableDebugPeek,
    flipTile,
    pauseRun,
    resolveBoardTurn,
    resumeRun
} from '../../shared/game';
import { createDefaultSaveData, normalizeSaveData } from '../../shared/save-data';
import { desktopClient } from '../desktop-client';

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
    pressTile: (tileId: string) => void;
    pause: () => void;
    resume: () => void;
    continueToNextLevel: () => void;
    restartRun: () => void;
    endRun: () => void;
    triggerDebugReveal: () => void;
}

let resolveTurnTimer: ReturnType<typeof setTimeout> | null = null;
let debugRevealTimer: ReturnType<typeof setTimeout> | null = null;

const clearTimers = (): void => {
    if (resolveTurnTimer) {
        clearTimeout(resolveTurnTimer);
        resolveTurnTimer = null;
    }

    if (debugRevealTimer) {
        clearTimeout(debugRevealTimer);
        debugRevealTimer = null;
    }
};

const persistSaveData = async (saveData: SaveData): Promise<SaveData> => normalizeSaveData(await desktopClient.saveGame(saveData));

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
        clearTimers();
        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            run: createNewRun(get().saveData.bestScore)
        });
    },

    goToMenu: () => {
        clearTimers();
        set({
            view: 'menu',
            run: null,
            newlyUnlockedAchievements: []
        });
    },

    openSettings: (returnView = 'menu') => {
        const { run } = get();

        if (returnView === 'playing' && run) {
            set({
                view: 'settings',
                settingsReturnView: returnView,
                run: pauseRun(run)
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
            set({
                view: 'playing',
                run: resumeRun(run)
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

        if (nextRun.board?.flippedTileIds.length !== 2) {
            return;
        }

        if (resolveTurnTimer) {
            clearTimeout(resolveTurnTimer);
        }

        resolveTurnTimer = setTimeout(() => {
            const currentRun = get().run;

            if (!currentRun) {
                return;
            }

            let resolvedRun = resolveBoardTurn(currentRun);
            const unlockedAchievements = evaluateAchievementUnlocks(resolvedRun, get().saveData);
            let nextSave = get().saveData;

            if (unlockedAchievements.length > 0) {
                nextSave = normalizeSaveData({
                    ...nextSave,
                    achievements: {
                        ...nextSave.achievements,
                        ...Object.fromEntries(unlockedAchievements.map((achievementId) => [achievementId, true]))
                    },
                    bestScore: Math.max(nextSave.bestScore, resolvedRun.stats.bestScore)
                });

                void Promise.all(unlockedAchievements.map((achievementId) => desktopClient.unlockAchievement(achievementId)));
            }

            if (resolvedRun.status === 'gameOver') {
                resolvedRun = createRunSummary(resolvedRun, unlockedAchievements);
                nextSave = normalizeSaveData({
                    ...nextSave,
                    bestScore: Math.max(nextSave.bestScore, resolvedRun.stats.bestScore),
                    lastRunSummary: resolvedRun.lastRunSummary
                });

                set({
                    run: resolvedRun,
                    view: 'gameOver',
                    saveData: nextSave,
                    settings: nextSave.settings,
                    newlyUnlockedAchievements: unlockedAchievements
                });
            } else {
                nextSave = normalizeSaveData({
                    ...nextSave,
                    bestScore: Math.max(nextSave.bestScore, resolvedRun.stats.bestScore)
                });

                set({
                    run: resolvedRun,
                    saveData: nextSave,
                    settings: nextSave.settings,
                    newlyUnlockedAchievements: unlockedAchievements
                });
            }

            void persistSaveData(nextSave);
            resolveTurnTimer = null;
        }, MATCH_DELAY_MS);
    },

    pause: () => {
        const { run } = get();
        if (!run) return;
        set({ run: pauseRun(run) });
    },

    resume: () => {
        const { run } = get();
        if (!run) return;
        set({ run: resumeRun(run) });
    },

    continueToNextLevel: () => {
        const { run } = get();
        if (!run) return;

        set({
            newlyUnlockedAchievements: [],
            view: 'playing',
            run: advanceToNextLevel(run)
        });
    },

    restartRun: () => {
        clearTimers();
        set({
            view: 'playing',
            newlyUnlockedAchievements: [],
            run: createNewRun(get().saveData.bestScore)
        });
    },

    endRun: () => {
        clearTimers();
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

        if (debugRevealTimer) {
            clearTimeout(debugRevealTimer);
        }

        set({
            run: enableDebugPeek(run, settings.debugFlags.disableAchievementsOnDebug)
        });

        debugRevealTimer = setTimeout(() => {
            const currentRun = get().run;
            if (!currentRun) return;
            set({ run: disableDebugPeek(currentRun) });
            debugRevealTimer = null;
        }, DEBUG_REVEAL_MS);
    }
}));
