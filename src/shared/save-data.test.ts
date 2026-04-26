import { describe, expect, it } from 'vitest';
import { GAME_RULES_VERSION, SAVE_SCHEMA_VERSION } from './contracts';
import { createAchievementState, DEFAULT_SETTINGS, mergeDailyComplete, normalizeSaveData } from './save-data';
import type { SaveData } from './contracts';
import {
    CURRENT_VERSION_GATE,
    formatVersionGateSummary,
} from './version-gate';

const assertNoUndefinedDeep = (value: unknown, path: string): void => {
    if (value === undefined) {
        throw new Error(`Unexpected undefined at ${path}`);
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
            assertNoUndefinedDeep(v, `${path}.${k}`);
        }
    }
    if (Array.isArray(value)) {
        value.forEach((v, i) => assertNoUndefinedDeep(v, `${path}[${i}]`));
    }
};

describe('save normalization', () => {
    it('fills missing fields with defaults', () => {
        const saveData = normalizeSaveData({
            bestScore: 420
        });

        expect(saveData.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
        expect(saveData.bestScore).toBe(420);
        expect(saveData.settings.displayMode).toBe(DEFAULT_SETTINGS.displayMode);
        expect(saveData.achievements.ACH_FIRST_CLEAR).toBe(false);
        expect(saveData.onboardingDismissed).toBe(false);
    });

    it('merges nested debug settings without dropping defaults', () => {
        const saveData = normalizeSaveData({
            settings: {
                ...DEFAULT_SETTINGS,
                reduceMotion: true,
                debugFlags: {
                    showDebugTools: true,
                    allowBoardReveal: true,
                    disableAchievementsOnDebug: false
                }
            }
        });

        expect(saveData.settings.reduceMotion).toBe(true);
        expect(saveData.settings.debugFlags.showDebugTools).toBe(true);
        expect(saveData.settings.debugFlags.allowBoardReveal).toBe(true);
        expect(saveData.settings.debugFlags.disableAchievementsOnDebug).toBe(false);
        expect(saveData.settings.masterVolume).toBe(DEFAULT_SETTINGS.masterVolume);
    });

    it('normalizes invalid cameraViewportModePreference to default', () => {
        const saveData = normalizeSaveData({
            settings: {
                ...DEFAULT_SETTINGS,
                cameraViewportModePreference: 'bogus' as (typeof DEFAULT_SETTINGS)['cameraViewportModePreference']
            }
        });
        expect(saveData.settings.cameraViewportModePreference).toBe(DEFAULT_SETTINGS.cameraViewportModePreference);
    });

    it('normalizes invalid weakerShuffleMode and displayMode to defaults', () => {
        const saveData = normalizeSaveData({
            settings: {
                ...DEFAULT_SETTINGS,
                weakerShuffleMode: 'bogus' as (typeof DEFAULT_SETTINGS)['weakerShuffleMode'],
                displayMode: 'kiosk' as (typeof DEFAULT_SETTINGS)['displayMode']
            }
        });
        expect(saveData.settings.weakerShuffleMode).toBe(DEFAULT_SETTINGS.weakerShuffleMode);
        expect(saveData.settings.displayMode).toBe(DEFAULT_SETTINGS.displayMode);
    });

    it('round-trips valid displayMode, weakerShuffleMode, and boardPresentation', () => {
        const saveData = normalizeSaveData({
            settings: {
                ...DEFAULT_SETTINGS,
                displayMode: 'fullscreen',
                weakerShuffleMode: 'rows_only',
                boardPresentation: 'spaghetti'
            }
        });
        expect(saveData.settings.displayMode).toBe('fullscreen');
        expect(saveData.settings.weakerShuffleMode).toBe('rows_only');
        expect(saveData.settings.boardPresentation).toBe('spaghetti');
    });

    it('normalizes invalid boardPresentation to default', () => {
        const saveData = normalizeSaveData({
            settings: {
                ...DEFAULT_SETTINGS,
                boardPresentation: 'wide' as (typeof DEFAULT_SETTINGS)['boardPresentation']
            }
        });
        expect(saveData.settings.boardPresentation).toBe(DEFAULT_SETTINGS.boardPresentation);
    });

    it('sets relicShrineExtraPickUnlocked when seven-dailies achievement is present or dailies count is 7+', () => {
        const fromAchievement = normalizeSaveData({
            achievements: { ...createAchievementState(), ACH_SEVEN_DAILIES: true }
        });
        expect(fromAchievement.playerStats?.relicShrineExtraPickUnlocked).toBe(true);

        const fromCount = normalizeSaveData({
            playerStats: {
                bestFloorNoPowers: 0,
                dailiesCompleted: 7,
                lastDailyDateKeyUtc: null,
                dailyStreakCosmetic: 0,
                relicPickCounts: {},
                encorePairKeysLastRun: []
            }
        });
        expect(fromCount.playerStats?.relicShrineExtraPickUnlocked).toBe(true);
    });

    it('REG-053 tracks UTC daily streaks without freeze currency or pressure fields', () => {
        const first = mergeDailyComplete(normalizeSaveData({}), '20260425');
        expect(first.playerStats?.dailyStreakCosmetic).toBe(1);
        expect(first.playerStats?.lastDailyDateKeyUtc).toBe('20260425');

        const second = mergeDailyComplete(first, '20260426');
        expect(second.playerStats?.dailyStreakCosmetic).toBe(2);

        const missedDay = mergeDailyComplete(second, '20260428');
        expect(missedDay.playerStats?.dailyStreakCosmetic).toBe(1);
        expect(Object.keys(missedDay.playerStats ?? {})).not.toContain('streakFreezeCount');
    });

    it('table-driven legacy / partial fixtures normalize without undefined leaks (REF-065)', () => {
        const rows: { name: string; input: Partial<SaveData> | null | undefined }[] = [
            { name: 'null', input: null },
            { name: 'undefined', input: undefined },
            { name: 'empty_object', input: {} },
            { name: 'schema_only', input: { schemaVersion: 1 } },
            { name: 'missing_achievements', input: { bestScore: 10 } },
            {
                name: 'partial_player_stats',
                input: {
                    playerStats: {
                        bestFloorNoPowers: 3,
                        dailiesCompleted: 1,
                        lastDailyDateKeyUtc: '2026-01-01',
                        dailyStreakCosmetic: 2
                    } as SaveData['playerStats']
                }
            }
        ];

        for (const { name, input } of rows) {
            const normalized = normalizeSaveData(input);
            expect(normalized.schemaVersion, name).toBe(SAVE_SCHEMA_VERSION);
            assertNoUndefinedDeep(normalized, `${name}.`);
        }
    });
});

describe('REG-089 version gate', () => {
    it('summarizes current local version surfaces for release checks', () => {
        expect(CURRENT_VERSION_GATE.saveSchemaVersion).toBe(SAVE_SCHEMA_VERSION);
        expect(CURRENT_VERSION_GATE.gameRulesVersion).toBe(GAME_RULES_VERSION);
        expect(formatVersionGateSummary(CURRENT_VERSION_GATE)).toContain(
            `SAVE_SCHEMA_VERSION=${SAVE_SCHEMA_VERSION}`
        );
    });
});
