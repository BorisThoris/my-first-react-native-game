import { describe, expect, it } from 'vitest';
import type { RunState } from './contracts';
import { createNewRun } from './game';
import {
    MAX_RELIC_PICKS_PER_RUN,
    effectiveRelicDraftWeight,
    relicMilestoneIndexForFloor,
    needsRelicPick,
    rollRelicOptions,
    RELIC_POOL
} from './relics';

const levelCompleteRun = (level: number, tiersClaimed: number, overrides: Partial<RunState> = {}): RunState => {
    const base = createNewRun(0);
    return {
        ...base,
        gameMode: 'endless',
        status: 'levelComplete',
        relicTiersClaimed: tiersClaimed,
        relicOffer: null,
        lastLevelResult: {
            level,
            scoreGained: 10,
            rating: 'S',
            livesRemaining: 3,
            perfect: false,
            mistakes: 0,
            clearLifeReason: 'none',
            clearLifeGained: 0
        },
        ...overrides
    } as RunState;
};

describe('relicMilestoneIndexForFloor', () => {
    it('maps milestone floors to tier indices', () => {
        expect(relicMilestoneIndexForFloor(3)).toBe(0);
        expect(relicMilestoneIndexForFloor(6)).toBe(1);
        expect(relicMilestoneIndexForFloor(9)).toBe(2);
        expect(relicMilestoneIndexForFloor(12)).toBe(3);
        expect(relicMilestoneIndexForFloor(15)).toBe(4);
    });

    it('returns null for non-milestone floors', () => {
        expect(relicMilestoneIndexForFloor(2)).toBe(null);
        expect(relicMilestoneIndexForFloor(4)).toBe(null);
        expect(relicMilestoneIndexForFloor(7)).toBe(null);
    });
});

describe('needsRelicPick', () => {
    it('is true on milestone floor when tier not yet claimed', () => {
        expect(needsRelicPick(levelCompleteRun(3, 0))).toBe(true);
    });

    it('is false for puzzle mode', () => {
        expect(needsRelicPick(levelCompleteRun(3, 0, { gameMode: 'puzzle' }))).toBe(false);
    });

    it('is false after max picks', () => {
        expect(needsRelicPick(levelCompleteRun(15, MAX_RELIC_PICKS_PER_RUN))).toBe(false);
    });

    it('is true for floor 12 after three prior picks', () => {
        expect(needsRelicPick(levelCompleteRun(12, 3))).toBe(true);
    });
});

describe('effectiveRelicDraftWeight', () => {
    it('raises rare/common effective ratio as tierIndex increases (tier scaling)', () => {
        const commonId = 'extra_shuffle_charge';
        const rareId = 'parasite_ward_once';
        const r0 = effectiveRelicDraftWeight(rareId, 0) / effectiveRelicDraftWeight(commonId, 0);
        const r5 = effectiveRelicDraftWeight(rareId, 5) / effectiveRelicDraftWeight(commonId, 5);
        expect(r5).toBeGreaterThan(r0);
    });

    it('keeps common weight flat across tiers', () => {
        const w0 = effectiveRelicDraftWeight('memorize_bonus_ms', 0);
        const w10 = effectiveRelicDraftWeight('memorize_bonus_ms', 10);
        expect(w10).toBe(w0);
    });
});

describe('rollRelicOptions', () => {
    it('is deterministic for the same seed, tier, floor, and pickRound', () => {
        const run = createNewRun(0);
        const a = rollRelicOptions(run, 2, 9, 0);
        const b = rollRelicOptions(run, 2, 9, 0);
        expect(a).toEqual(b);
    });

    it('uses pickRound in the RNG (rerolls are not identical to round 0)', () => {
        const run = createNewRun(42);
        const r0 = rollRelicOptions(run, 0, 3, 0);
        const r1 = rollRelicOptions(run, 0, 3, 1);
        expect(r0.length).toBe(3);
        expect(r1.length).toBe(3);
        expect(r0).not.toEqual(r1);
    });

    it('returns at most three options from the pool', () => {
        const run = createNewRun(0);
        const opts = rollRelicOptions(run, 0, 3);
        expect(opts.length).toBeLessThanOrEqual(3);
        for (const id of opts) {
            expect(RELIC_POOL).toContain(id);
        }
    });

    it('when three or fewer relics remain, returns all remaining without duplicates', () => {
        const run = createNewRun(42);
        const taken = RELIC_POOL.slice(0, RELIC_POOL.length - 3);
        const runNarrow: RunState = { ...run, relicIds: taken };
        const opts = rollRelicOptions(runNarrow, 4, 21);
        expect(opts.length).toBe(3);
        expect(new Set(opts).size).toBe(3);
        for (const id of opts) {
            expect(taken).not.toContain(id);
        }
    });
});
