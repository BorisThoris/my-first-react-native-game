import { describe, expect, it } from 'vitest';
import {
    FLIP_DURATION_MS,
    STAGGER_MS,
    computeShuffleMotionBudgetMs,
    computeStaggeredShuffleDealZ
} from './shuffleFlipAnimation';

describe('computeStaggeredShuffleDealZ (FX-013)', () => {
    it('returns 0 outside the shuffle window', () => {
        const budget = computeShuffleMotionBudgetMs(4);
        const deadline = 10_000 + budget;

        expect(computeStaggeredShuffleDealZ(9999, deadline, budget, 0, 4)).toBe(0);
        expect(computeStaggeredShuffleDealZ(deadline, deadline, budget, 0, 4)).toBe(0);
        expect(computeStaggeredShuffleDealZ(10_000, deadline, 0, 0, 4)).toBe(0);
    });

    it('ramps later tiles so stagger matches FLIP reading order', () => {
        const n = 4;
        const budget = computeShuffleMotionBudgetMs(n);
        const start = 50_000;
        const deadline = start + budget;
        const t = start + 200;

        const z0 = computeStaggeredShuffleDealZ(t, deadline, budget, 0, n);
        const zLast = computeStaggeredShuffleDealZ(t, deadline, budget, n - 1, n);

        expect(z0).toBeGreaterThan(0);
        expect(zLast).toBeGreaterThan(0);
        expect(z0).toBeGreaterThan(zLast);
    });

    it('peaks within the first FLIP duration after a tile’s stagger start', () => {
        const n = 3;
        const budget = computeShuffleMotionBudgetMs(n);
        const start = 100_000;
        const deadline = start + budget;
        const idx = 1;
        const tileStart = start + idx * STAGGER_MS;
        const peakTime = tileStart + FLIP_DURATION_MS * 0.5;
        const afterArc = tileStart + FLIP_DURATION_MS * 1.05;

        const zPeak = computeStaggeredShuffleDealZ(peakTime, deadline, budget, idx, n);
        const zAfter = computeStaggeredShuffleDealZ(afterArc, deadline, budget, idx, n);

        expect(zPeak).toBeGreaterThan(zAfter);
    });
});
