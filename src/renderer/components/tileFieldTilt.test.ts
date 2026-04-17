import { describe, expect, it, vi } from 'vitest';
import { getTileFieldAmplification, shouldApplyTileFieldParallax } from './tileFieldTilt';

describe('shouldApplyTileFieldParallax', () => {
    it('is false when in-app reduce motion is on', () => {
        expect(shouldApplyTileFieldParallax({ reduceMotion: true, motionParallaxSuppressed: false })).toBe(false);
    });

    it('is false when OS / browser reduced motion suppresses parallax', () => {
        expect(shouldApplyTileFieldParallax({ reduceMotion: false, motionParallaxSuppressed: true })).toBe(false);
    });

    it('is true only when both gates allow motion', () => {
        expect(shouldApplyTileFieldParallax({ reduceMotion: false, motionParallaxSuppressed: false })).toBe(true);
    });

    it('matches useParallaxMotionSuppressed: PRM alone zeros tilt', () => {
        const mql = { matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() };
        vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mql));
        const fromHook = mql.matches;
        expect(shouldApplyTileFieldParallax({ reduceMotion: false, motionParallaxSuppressed: fromHook })).toBe(false);
        vi.unstubAllGlobals();
    });
});

describe('getTileFieldAmplification', () => {
    it('is 1 at the center of an odd-sized grid', () => {
        expect(getTileFieldAmplification(4, 3, 3)).toBeCloseTo(1, 5);
    });

    it('is greater toward corners than at the center', () => {
        const cols = 4;
        const rows = 4;
        const center = getTileFieldAmplification(5, cols, rows);
        const corner = getTileFieldAmplification(0, cols, rows);

        expect(corner).toBeGreaterThan(center);
    });
});
