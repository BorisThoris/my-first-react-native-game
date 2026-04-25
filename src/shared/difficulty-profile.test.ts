import { describe, expect, it } from 'vitest';
import { INITIAL_LIVES, MAX_LIVES, MEMORIZE_BASE_MS, MEMORIZE_MIN_MS, MEMORIZE_STEP_MS } from './contracts';
import { getCurrentDifficultyProfile, getDifficultyProfileRows } from './difficulty-profile';

describe('REG-046 difficulty profile contract', () => {
    it('keeps shipped default explicit and distinguishes deferred variants', () => {
        const current = getCurrentDifficultyProfile();
        expect(current.id).toBe('classic_fair');
        expect(current.status).toBe('shipped');
        expect(current.constants).toEqual({
            initialLives: INITIAL_LIVES,
            maxLives: MAX_LIVES,
            memorizeBaseMs: MEMORIZE_BASE_MS,
            memorizeStepMs: MEMORIZE_STEP_MS,
            memorizeMinMs: MEMORIZE_MIN_MS
        });
        expect(current.rules).toContain('first mismatch each floor is life-free');

        const rows = getDifficultyProfileRows();
        expect(rows.map((row) => row.id)).toEqual(['classic_fair', 'practice_soft', 'purist_hard']);
        expect(rows.filter((row) => row.status === 'deferred')).toHaveLength(2);
        expect(rows.every((row) => row.dailyComparable === (row.id === 'classic_fair'))).toBe(true);
    });
});
