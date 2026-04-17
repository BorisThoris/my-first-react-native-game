import { describe, expect, it } from 'vitest';
import { createIllustrationRng } from './illustrationRng';

describe('createIllustrationRng', () => {
    it('is deterministic for the same seed', () => {
        const a = createIllustrationRng(42_424_242);
        const b = createIllustrationRng(42_424_242);
        for (let i = 0; i < 20; i++) {
            expect(a.nextU32()).toBe(b.nextU32());
            expect(a.nextFloat01()).toBe(b.nextFloat01());
        }
    });

    it('pickWeighted respects weights', () => {
        const rng = createIllustrationRng(9001);
        const picks = { x: 0, y: 0 };
        for (let i = 0; i < 200; i++) {
            const r = rng.pickWeighted([
                { value: 'x' as const, weight: 3 },
                { value: 'y' as const, weight: 1 }
            ]);
            picks[r] += 1;
        }
        expect(picks.x).toBeGreaterThan(picks.y);
    });
});
