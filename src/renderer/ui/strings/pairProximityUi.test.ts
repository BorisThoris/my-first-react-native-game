import { describe, expect, it } from 'vitest';
import { pairProximityUiStrings, stretchPairProximityUiForPseudoLocale } from './pairProximityUi';

describe('pairProximityUi', () => {
    it('keeps settings copy within a reasonable layout budget (pseudo-locale stretch)', () => {
        const stretched = stretchPairProximityUiForPseudoLocale();
        expect(stretched.settingsHint.length).toBeGreaterThan(pairProximityUiStrings.settingsHint.length);
        expect(stretched.settingsHint.length).toBeLessThan(600);
    });

    it('formats focus pair steps with the numeric distance', () => {
        expect(pairProximityUiStrings.focusPairSteps(3)).toContain('3');
        expect(pairProximityUiStrings.focusPairSteps(12)).toContain('12');
    });
});
