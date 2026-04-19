import { describe, expect, it } from 'vitest';
import {
    BAKE_CLI_TIER_ALIASES,
    overlayDrawTierFromGraphicsQuality,
    parseBakeTierTokenList
} from './overlayDrawTier';

describe('overlayDrawTierFromGraphicsQuality', () => {
    it('maps graphics presets to overlay tiers', () => {
        expect(overlayDrawTierFromGraphicsQuality('low')).toBe('minimal');
        expect(overlayDrawTierFromGraphicsQuality('medium')).toBe('standard');
        expect(overlayDrawTierFromGraphicsQuality('high')).toBe('full');
    });
});

describe('parseBakeTierTokenList (bake script --tiers=)', () => {
    it('defaults to full when empty or all invalid', () => {
        expect(parseBakeTierTokenList([])).toEqual(['full']);
        expect(parseBakeTierTokenList(['', '  '])).toEqual(['full']);
        expect(parseBakeTierTokenList(['not-a-tier'])).toEqual(['full']);
    });

    it('maps CLI aliases like the bake script', () => {
        expect(parseBakeTierTokenList(['min', 'medium', 'high'])).toEqual(['minimal', 'standard', 'full']);
        expect(parseBakeTierTokenList(['MIN', 'Standard', 'FULL'])).toEqual(['minimal', 'standard', 'full']);
    });

    it('preserves canonical tier names', () => {
        expect(parseBakeTierTokenList(['minimal', 'standard', 'full'])).toEqual(['minimal', 'standard', 'full']);
    });

    it('documents alias parity with BAKE_CLI_TIER_ALIASES', () => {
        expect(BAKE_CLI_TIER_ALIASES.min).toBe('minimal');
        expect(BAKE_CLI_TIER_ALIASES.medium).toBe('standard');
        expect(BAKE_CLI_TIER_ALIASES.high).toBe('full');
    });
});
