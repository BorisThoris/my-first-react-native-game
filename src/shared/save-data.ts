import {
    SAVE_SCHEMA_VERSION,
    type AchievementId,
    type AchievementState,
    type BoardPresentationMode,
    type BoardScreenSpaceAA,
    type CameraViewportModePreference,
    type DisplayMode,
    type GraphicsQualityPreset,
    type PlayerStatsPersisted,
    type RelicId,
    type SaveData,
    type Settings,
    type WeakerShuffleMode
} from './contracts';
import { utcDateKeyMinusOneDay } from './rng';
import { evaluateSaveMigrationGate } from './version-gate';

export type DailyStreakFreezePolicy = 'not_supported';

export interface DailyStreakEthicsState {
    currentStreak: number;
    nextResetUtcKey: string;
    missedDayBehavior: 'reset_to_one_on_next_completion' | 'no_clear_recorded_yet';
    freezePolicy: DailyStreakFreezePolicy;
    rewardLimit: 'cosmetic_and_meta_only';
    tone: 'friendly_no_shame';
    copy: string;
}

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
    shuffleScoreTaxEnabled: false,
    pairProximityHintsEnabled: true
};

export const ACHIEVEMENT_IDS: AchievementId[] = [
    'ACH_FIRST_CLEAR',
    'ACH_LEVEL_FIVE',
    'ACH_SCORE_THOUSAND',
    'ACH_PERFECT_CLEAR',
    'ACH_LAST_LIFE',
    'ACH_ENDLESS_TEN',
    'ACH_SEVEN_DAILIES'
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
    encorePairKeysLastRun: [],
    puzzleCompletions: {},
    relicShrineExtraPickUnlocked: false
});

/** +1 relic pick at each milestone when meta unlock is active (copied into `RunState.metaRelicDraftExtraPerMilestone`). */
export const metaRelicDraftExtraPerMilestoneFromSave = (save: SaveData): number =>
    save.playerStats?.relicShrineExtraPickUnlocked === true ? 1 : 0;

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
    const migrationGate = evaluateSaveMigrationGate(input);

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
    const pairProximityHintsEnabled =
        typeof mergedSettingsBase.pairProximityHintsEnabled === 'boolean'
            ? mergedSettingsBase.pairProximityHintsEnabled
            : defaults.settings.pairProximityHintsEnabled;
    const cvRaw = mergedSettingsBase.cameraViewportModePreference as CameraViewportModePreference | undefined;
    const cameraViewportModePreference: CameraViewportModePreference =
        cvRaw === 'auto' || cvRaw === 'always' || cvRaw === 'never'
            ? cvRaw
            : defaults.settings.cameraViewportModePreference;
    const displayModeRaw = mergedSettingsBase.displayMode as DisplayMode | undefined;
    const displayMode: DisplayMode =
        displayModeRaw === 'windowed' || displayModeRaw === 'fullscreen'
            ? displayModeRaw
            : defaults.settings.displayMode;
    const weakerShuffleRaw = mergedSettingsBase.weakerShuffleMode as WeakerShuffleMode | undefined;
    const weakerShuffleMode: WeakerShuffleMode =
        weakerShuffleRaw === 'full' || weakerShuffleRaw === 'rows_only'
            ? weakerShuffleRaw
            : defaults.settings.weakerShuffleMode;
    const boardPresentationRaw = mergedSettingsBase.boardPresentation as BoardPresentationMode | undefined;
    const boardPresentation: BoardPresentationMode =
        boardPresentationRaw === 'standard' || boardPresentationRaw === 'spaghetti' || boardPresentationRaw === 'breathing'
            ? boardPresentationRaw
            : defaults.settings.boardPresentation;

    const mergedAchievements = {
        ...defaults.achievements,
        ...(input.achievements ?? {})
    };
    const psIn: Partial<PlayerStatsPersisted> = input.playerStats ?? {};
    const dailiesCount =
        typeof psIn.dailiesCompleted === 'number' ? psIn.dailiesCompleted : defaultPlayerStats().dailiesCompleted;
    const relicPickCounts =
        psIn.relicPickCounts && typeof psIn.relicPickCounts === 'object' && !Array.isArray(psIn.relicPickCounts)
            ? psIn.relicPickCounts
            : defaultPlayerStats().relicPickCounts;
    const relicShrineExtraPickUnlocked =
        psIn.relicShrineExtraPickUnlocked === true ||
        mergedAchievements.ACH_SEVEN_DAILIES === true ||
        dailiesCount >= 7;

    return {
        schemaVersion: SAVE_SCHEMA_VERSION,
        bestScore: typeof input.bestScore === 'number' ? input.bestScore : defaults.bestScore,
        achievements: mergedAchievements,
        settings: {
            ...mergedSettingsBase,
            boardScreenSpaceAA,
            boardBloomEnabled,
            graphicsQuality,
            cameraViewportModePreference,
            pairProximityHintsEnabled,
            displayMode,
            weakerShuffleMode,
            boardPresentation
        },
        onboardingDismissed: typeof input.onboardingDismissed === 'boolean' ? input.onboardingDismissed : defaults.onboardingDismissed,
        lastRunSummary: migrationGate.keepLastRunSummary ? (input.lastRunSummary ?? defaults.lastRunSummary) : null,
        playerStats: {
            ...defaultPlayerStats(),
            ...(input.playerStats ?? {}),
            encorePairKeysLastRun: Array.isArray(input.playerStats?.encorePairKeysLastRun)
                ? input.playerStats.encorePairKeysLastRun
                : defaultPlayerStats().encorePairKeysLastRun,
            puzzleCompletions:
                input.playerStats?.puzzleCompletions && typeof input.playerStats.puzzleCompletions === 'object'
                    ? input.playerStats.puzzleCompletions
                    : defaultPlayerStats().puzzleCompletions,
            relicPickCounts,
            relicShrineExtraPickUnlocked
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
    const newDailies = ps.dailiesCompleted + 1;

    return normalizeSaveData({
        ...save,
        playerStats: {
            ...ps,
            dailiesCompleted: newDailies,
            lastDailyDateKeyUtc: completedDateKeyUtc,
            dailyStreakCosmetic: streak,
            relicShrineExtraPickUnlocked: newDailies >= 7 || ps.relicShrineExtraPickUnlocked === true
        }
    });
};

export const getDailyStreakEthicsState = (save: SaveData, todayDateKeyUtc: string): DailyStreakEthicsState => {
    const ps = save.playerStats ?? defaultPlayerStats();
    const alreadyCompletedToday = ps.lastDailyDateKeyUtc === todayDateKeyUtc;
    const continuedFromYesterday = ps.lastDailyDateKeyUtc === utcDateKeyMinusOneDay(todayDateKeyUtc);
    const noClearYet = ps.lastDailyDateKeyUtc == null || ps.dailiesCompleted <= 0;
    const missedDayBehavior: DailyStreakEthicsState['missedDayBehavior'] =
        noClearYet || alreadyCompletedToday || continuedFromYesterday
            ? 'no_clear_recorded_yet'
            : 'reset_to_one_on_next_completion';

    return {
        currentStreak: ps.dailyStreakCosmetic,
        nextResetUtcKey: todayDateKeyUtc,
        missedDayBehavior,
        freezePolicy: 'not_supported',
        rewardLimit: 'cosmetic_and_meta_only',
        tone: 'friendly_no_shame',
        copy:
            missedDayBehavior === 'reset_to_one_on_next_completion'
                ? 'Missed days simply reset the cosmetic streak on the next clear. No core run fairness is lost.'
                : 'Daily streaks are optional local motivation. Clear today before UTC reset if you want to extend it.'
    };
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
