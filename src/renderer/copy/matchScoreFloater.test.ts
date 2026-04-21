import { describe, expect, it } from 'vitest';
import { matchScoreFloaterLiveRegionText } from './matchScoreFloater';

describe('matchScoreFloaterLiveRegionText', () => {
    it('formats amount with locale stringing', () => {
        expect(matchScoreFloaterLiveRegionText(99)).toMatch(/^Plus 99 points$/);
    });
});
