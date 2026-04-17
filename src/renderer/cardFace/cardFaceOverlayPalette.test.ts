import { describe, expect, it } from 'vitest';
import { getCardFaceOverlayColors } from './cardFaceOverlayPalette';

describe('cardFaceOverlayPalette', () => {
    it('returns distinct frame tones per variant', () => {
        const a = getCardFaceOverlayColors('active');
        const m = getCardFaceOverlayColors('matched');
        const x = getCardFaceOverlayColors('mismatch');
        expect(a.frameFillTop).not.toBe(m.frameFillTop);
        expect(m.sigilFillLight).not.toBe(x.sigilFillLight);
        expect(a.symbolFill).toMatch(/^#/);
        expect(a.plateStroke).toContain('rgba');
    });
});
