import { describe, expect, it } from 'vitest';
import { GAMEPLAY_BOARD_VISUALS } from '../renderer/components/gameplayVisualConfig';
import {
    getBoardAnisotropyCap,
    getBoardDprCap,
    getGraphicsQualityTierSnapshot,
    getMenuPixiResolutionCap
} from './graphicsQuality';

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

    it('tier snapshot matches individual getters; gameplay rim table covers same presets', () => {
        const presets = ['low', 'medium', 'high'] as const;
        for (const q of presets) {
            const snap = getGraphicsQualityTierSnapshot(q);
            expect(snap.boardDprCapStandard).toBe(getBoardDprCap(q, false));
            expect(snap.boardDprCapCompact).toBe(getBoardDprCap(q, true));
            expect(snap.menuPixiResolutionCap).toBe(getMenuPixiResolutionCap(q));
            expect(snap.boardAnisotropyCap).toBe(getBoardAnisotropyCap(q));
            expect(snap.tileBoardBloomPostPath).toBe(q !== 'low');
            expect(typeof GAMEPLAY_BOARD_VISUALS.faceUpHoverRimOpacityMul[q]).toBe('number');
        }
        expect(Object.keys(GAMEPLAY_BOARD_VISUALS.faceUpHoverRimOpacityMul).sort()).toEqual(['high', 'low', 'medium']);
    });
});
