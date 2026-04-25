import { describe, expect, it } from 'vitest';
import { getChallengeModeProgressionRows, getChallengeModeGateForMode } from './challenge-progression';
import { createDefaultSaveData } from './save-data';

describe('REG-081 challenge mode progression gates', () => {
    it('projects offline-resolvable challenge gates from local save data', () => {
        const save = createDefaultSaveData();
        save.achievements.ACH_FIRST_CLEAR = true;
        save.playerStats = {
            ...save.playerStats!,
            dailiesCompleted: 2,
            bestFloorNoPowers: 5
        };
        save.lastRunSummary = {
            totalScore: 100,
            bestScore: 100,
            levelsCleared: 1,
            highestLevel: 2,
            achievementsEnabled: true,
            unlockedAchievements: [],
            bestStreak: 2,
            perfectClears: 0,
            gameMode: 'gauntlet'
        };

        const rows = getChallengeModeProgressionRows(save);
        expect(rows.map((row) => row.modeId)).toEqual(['daily', 'gauntlet', 'puzzle_glyph_cross', 'scholar', 'pin_vow']);
        expect(rows.find((row) => row.modeId === 'gauntlet')?.status).toBe('unlocked');
        expect(rows.find((row) => row.modeId === 'puzzle_glyph_cross')?.status).toBe('in_progress');
        expect(rows.every((row) => row.offlineOnly)).toBe(true);
        expect(rows.every((row) => row.onlineRequired === false)).toBe(true);
    });

    it('returns explicit lock copy for a selected mode', () => {
        const gate = getChallengeModeGateForMode(createDefaultSaveData(), 'gauntlet');
        expect(gate?.status).toBe('locked');
        expect(gate?.lockReason).toContain('First clear');
    });
});
