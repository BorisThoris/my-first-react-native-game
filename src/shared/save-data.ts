import {
    SAVE_SCHEMA_VERSION,
    type AchievementId,
    type AchievementState,
    type BoardScreenSpaceAA,
    type CameraViewportModePreference,
    type GraphicsQualityPreset,
    type PlayerStatsPersisted,
    type RelicId,
    type SaveData,
    type Settings
} from './contracts';
import { utcDateKeyMinusOneDay } from './rng';

export const DEFAULT_SETTINGS: Settings = {
    masterVolume: 0.8,
    musicVolume: 0.55,
    sfxVolume: 0.8,
    displayMode: 'windowed',
    uiScale: 1,
    reduceMotion: false,
    graphicsQuality: 'medium',
    boardScreenSpaceAA: 'auto',
    boardBloomEnabled: false,
    debugFlags: {
        showDebugTools: false,
        allowBoardReveal: false,
        disableAchievementsOnDebug: true
    },
    boardPresentation: 'standard',
    cameraViewportModePreference: 'auto',
    tileFocusAssist: false,
    resolveDelayMultiplier: 1,
    weakerShuffleMode: 'full',
    echoFeedbackEnabled: true,
    distractionChannelEnabled: false,
    shuffleScoreTaxEnabled: false
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

const defaultPlayerStats = (): PlayerStatsPersisted => ({
    bestFloorNoPowers: 0,
    dailiesCompleted: 0,
    lastDailyDateKeyUtc: null,
    dailyStreakCosmetic: 0,
    relicPickCounts: {},
    encorePairKeysLastRun: []
});

export const createDefaultSaveData = (): SaveData => ({
    schemaVersion: SAVE_SCHEMA_VERSION,
    bestScore: 0,
    achievements: createAchievementState(),
    settings: { ...DEFAULT_SETTINGS, debugFlags: { ...DEFAULT_SETTINGS.debugFlags } },
    onboardingDismissed: false,
    lastRunSummary: null,
    playerStats: defaultPlayerStats(),
    unlocks: [],
    powersFtueSeen: false
});

export const normalizeSaveData = (input?: Partial<SaveData> | null): SaveData => {
    const defaults = createDefaultSaveData();

    if (!input) {
        return defaults;
    }

    const mergedSettingsBase: Settings = {
        ...defaults.settings,
        ...(input.settings ?? {}),
        debugFlags: {
            ...defaults.settings.debugFlags,
            ...(input.settings?.debugFlags ?? {})
        }
    };
    const aaRaw = mergedSettingsBase.boardScreenSpaceAA as BoardScreenSpaceAA | undefined;
    const boardScreenSpaceAA: BoardScreenSpaceAA =
        aaRaw === 'auto' || aaRaw === 'smaa' || aaRaw === 'msaa' || aaRaw === 'off' ? aaRaw : defaults.settings.boardScreenSpaceAA;
    const gqRaw = mergedSettingsBase.graphicsQuality as GraphicsQualityPreset | undefined;
    const graphicsQuality: GraphicsQualityPreset =
        gqRaw === 'low' || gqRaw === 'medium' || gqRaw === 'high' ? gqRaw : defaults.settings.graphicsQuality;
    const boardBloomEnabled =
        typeof mergedSettingsBase.boardBloomEnabled === 'boolean'
            ? mergedSettingsBase.boardBloomEnabled
            : defaults.settings.boardBloomEnabled;
    const cvRaw = mergedSettingsBase.cameraViewportModePreference as CameraViewportModePreference | undefined;
    const cameraViewportModePreference: CameraViewportModePreference =
        cvRaw === 'auto' || cvRaw === 'always' || cvRaw === 'never'
            ? cvRaw
            : defaults.settings.cameraViewportModePreference;

    return {
        schemaVersion: SAVE_SCHEMA_VERSION,
        bestScore: typeof input.bestScore === 'number' ? input.bestScore : defaults.bestScore,
        achievements: {
            ...defaults.achievements,
            ...(input.achievements ?? {})
        },
        settings: {
            ...mergedSettingsBase,
            boardScreenSpaceAA,
            boardBloomEnabled,
            graphicsQuality,
            cameraViewportModePreference
        },
        onboardingDismissed: typeof input.onboardingDismissed === 'boolean' ? input.onboardingDismissed : defaults.onboardingDismissed,
        lastRunSummary: input.lastRunSummary ?? defaults.lastRunSummary,
        playerStats: {
            ...defaultPlayerStats(),
            ...(input.playerStats ?? {}),
            encorePairKeysLastRun: Array.isArray(input.playerStats?.encorePairKeysLastRun)
                ? input.playerStats.encorePairKeysLastRun
                : defaultPlayerStats().encorePairKeysLastRun
        },
        unlocks: Array.isArray(input.unlocks) ? input.unlocks : defaults.unlocks ?? [],
        powersFtueSeen: typeof input.powersFtueSeen === 'boolean' ? input.powersFtueSeen : defaults.powersFtueSeen ?? false
    };
};

export const mergeDailyComplete = (save: SaveData, completedDateKeyUtc: string): SaveData => {
    const ps = save.playerStats ?? defaultPlayerStats();
    if (ps.lastDailyDateKeyUtc === completedDateKeyUtc) {
        return save;
    }
    const prev = ps.lastDailyDateKeyUtc;
    const streak =
        prev === utcDateKeyMinusOneDay(completedDateKeyUtc) ? ps.dailyStreakCosmetic + 1 : 1;

    return normalizeSaveData({
        ...save,
        playerStats: {
            ...ps,
            dailiesCompleted: ps.dailiesCompleted + 1,
            lastDailyDateKeyUtc: completedDateKeyUtc,
            dailyStreakCosmetic: streak
        }
    });
};

export const mergeBestFloorNoPowers = (save: SaveData, floor: number): SaveData => {
    const ps = save.playerStats ?? defaultPlayerStats();
    if (floor <= ps.bestFloorNoPowers) {
        return save;
    }
    return normalizeSaveData({
        ...save,
        playerStats: { ...ps, bestFloorNoPowers: floor }
    });
};

export const mergeEncoreFromRun = (save: SaveData, pairKeys: string[]): SaveData => {
    const ps = save.playerStats ?? defaultPlayerStats();
    const unique = [...new Set(pairKeys)].slice(0, 80);
    return normalizeSaveData({
        ...save,
        playerStats: { ...ps, encorePairKeysLastRun: unique }
    });
};

export const mergeRelicPickStat = (save: SaveData, relicId: RelicId): SaveData => {
    const ps = save.playerStats ?? defaultPlayerStats();
    const relicPickCounts: PlayerStatsPersisted['relicPickCounts'] = {
        ...ps.relicPickCounts,
        [relicId]: (ps.relicPickCounts[relicId] ?? 0) + 1
    };
    return normalizeSaveData({
        ...save,
        playerStats: { ...ps, relicPickCounts }
    });
};
