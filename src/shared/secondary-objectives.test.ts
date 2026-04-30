import { describe, expect, it } from 'vitest';
import { createNewRun, finishMemorizePhase } from './game-core';
import { getSecondaryObjectiveProgress } from './secondary-objectives';

describe('REG-048 secondary objective clarity', () => {
    it('explains active and failed objective states with bonus copy', () => {
        const active = finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false }));
        const row = getSecondaryObjectiveProgress(active);

        expect(row?.status).toBe('active');
        expect(row?.condition).toMatch(/match-resolution par/i);
        expect(row?.reward).toContain('+30');

        const failed = {
            ...active,
            matchResolutionsThisFloor: 999
        };
        const failedRow = getSecondaryObjectiveProgress(failed);
        expect(failedRow?.status).toBe('failed');
        expect(failedRow?.failureReason).toMatch(/par exceeded/i);
    });

    it('returns completed status from level result for floor-clear celebration', () => {
        const completed = {
            ...finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false })),
            lastLevelResult: {
                level: 1,
                scoreGained: 100,
                rating: 'S++' as const,
                livesRemaining: 5,
                perfect: true,
                mistakes: 0,
                clearLifeReason: 'perfect' as const,
                clearLifeGained: 1,
                featuredObjectiveId: 'flip_par' as const,
                featuredObjectiveCompleted: true,
                objectiveBonusScore: 30
            }
        };
        expect(getSecondaryObjectiveProgress(completed)?.status).toBe('completed');
    });
});
