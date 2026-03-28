import { describe, expect, it } from 'vitest';
import { evaluateAchievementUnlocks } from './achievements';
import { createNewRun } from './game';
import { createDefaultSaveData } from './save-data';

describe('achievement rules', () => {
    it('unlocks the expected achievements from a strong run state', () => {
        const run = {
            ...createNewRun(0),
            stats: {
                ...createNewRun(0).stats,
                totalScore: 1100,
                levelsCleared: 5,
                highestLevel: 5
            },
            lastLevelResult: {
                level: 5,
                scoreGained: 100,
                rating: 'S++' as const,
                livesRemaining: 1,
                perfect: true,
                mistakes: 0
            }
        };
        const unlocked = evaluateAchievementUnlocks(run, createDefaultSaveData());

        expect(unlocked).toEqual([
            'ACH_FIRST_CLEAR',
            'ACH_LEVEL_FIVE',
            'ACH_SCORE_THOUSAND',
            'ACH_PERFECT_CLEAR',
            'ACH_LAST_LIFE'
        ]);
    });

    it('returns no unlocks when achievements are disabled or already earned', () => {
        const run = {
            ...createNewRun(0),
            achievementsEnabled: false,
            stats: {
                ...createNewRun(0).stats,
                levelsCleared: 1
            }
        };
        const saveData = createDefaultSaveData();
        saveData.achievements.ACH_FIRST_CLEAR = true;

        expect(evaluateAchievementUnlocks(run, saveData)).toEqual([]);
    });
});
