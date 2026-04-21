import { describe, expect, it } from 'vitest';
import { mismatchFloaterLiveRegionText, mismatchFloaterVisualLabel } from './mismatchFloater';

describe('mismatchFloaterLiveRegionText', () => {
    it('returns stable phrase', () => {
        expect(mismatchFloaterLiveRegionText()).toBe('No match');
    });
});

describe('mismatchFloaterVisualLabel', () => {
    it('returns short board label', () => {
        expect(mismatchFloaterVisualLabel()).toBe('Miss');
    });
});
