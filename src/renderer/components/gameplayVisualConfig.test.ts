import { describe, expect, it } from 'vitest';
import { GAMEPLAY_BOARD_VISUALS } from './gameplayVisualConfig';

describe('REG-012 card materials and interaction FX tokens', () => {
    it('keeps match, mismatch, invalid, and combo feedback distinct and reduced-motion safe', () => {
        expect(GAMEPLAY_BOARD_VISUALS.interactionFeedback.match.material).toContain('victory');
        expect(GAMEPLAY_BOARD_VISUALS.interactionFeedback.mismatch.material).toContain('danger');
        expect(GAMEPLAY_BOARD_VISUALS.interactionFeedback.invalid.material).toContain('blocked');
        expect(GAMEPLAY_BOARD_VISUALS.interactionFeedback.combo.material).toContain('gold');
        expect(
            new Set(Object.values(GAMEPLAY_BOARD_VISUALS.interactionFeedback).map((entry) => entry.material)).size
        ).toBe(4);
        expect(Object.values(GAMEPLAY_BOARD_VISUALS.interactionFeedback).every((entry) => entry.reducedMotion.length > 0)).toBe(true);
    });
});
