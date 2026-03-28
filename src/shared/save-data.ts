import {
    SAVE_SCHEMA_VERSION,
    type AchievementId,
    type AchievementState,
    type SaveData,
    type Settings
} from './contracts';

export const DEFAULT_SETTINGS: Settings = {
    masterVolume: 0.8,
    musicVolume: 0.55,
    sfxVolume: 0.8,
    displayMode: 'windowed',
    uiScale: 1,
    reduceMotion: false,
    debugFlags: {
        showDebugTools: false,
        allowBoardReveal: false,
        disableAchievementsOnDebug: true
    }
};

export const ACHIEVEMENT_IDS: AchievementId[] = [
    'ACH_FIRST_CLEAR',
    'ACH_LEVEL_FIVE',
    'ACH_SCORE_THOUSAND',
    'ACH_PERFECT_CLEAR',
    'ACH_LAST_LIFE'
];

export const createAchievementState = (): AchievementState =>
    ACHIEVEMENT_IDS.reduce<AchievementState>(
        (state, achievementId) => {
            state[achievementId] = false;
            return state;
        },
        {} as AchievementState
    );

export const createDefaultSaveData = (): SaveData => ({
    schemaVersion: SAVE_SCHEMA_VERSION,
    bestScore: 0,
    achievements: createAchievementState(),
    settings: { ...DEFAULT_SETTINGS, debugFlags: { ...DEFAULT_SETTINGS.debugFlags } },
    lastRunSummary: null
});

export const normalizeSaveData = (input?: Partial<SaveData> | null): SaveData => {
    const defaults = createDefaultSaveData();

    if (!input) {
        return defaults;
    }

    return {
        schemaVersion: SAVE_SCHEMA_VERSION,
        bestScore: typeof input.bestScore === 'number' ? input.bestScore : defaults.bestScore,
        achievements: {
            ...defaults.achievements,
            ...(input.achievements ?? {})
        },
        settings: {
            ...defaults.settings,
            ...(input.settings ?? {}),
            debugFlags: {
                ...defaults.settings.debugFlags,
                ...(input.settings?.debugFlags ?? {})
            }
        },
        lastRunSummary: input.lastRunSummary ?? defaults.lastRunSummary
    };
};
