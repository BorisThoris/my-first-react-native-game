import { describe, expect, it } from 'vitest';
import { getBoardAnisotropyCap, getBoardDprCap, getMenuPixiResolutionCap } from './graphicsQuality';

describe('graphicsQuality caps', () => {
    it('getBoardAnisotropyCap tiers', () => {
        expect(getBoardAnisotropyCap('low')).toBe(2);
        expect(getBoardAnisotropyCap('medium')).toBe(4);
        expect(getBoardAnisotropyCap('high')).toBe(8);
    });

    it('getBoardDprCap is positive', () => {
        expect(getBoardDprCap('low', false)).toBeGreaterThan(0);
        expect(getBoardDprCap('high', true)).toBeGreaterThan(0);
    });

    it('getMenuPixiResolutionCap is positive', () => {
        expect(getMenuPixiResolutionCap('medium')).toBeGreaterThan(0);
    });
});
