import { describe, expect, it } from 'vitest';
import { getTileFieldAmplification } from './tileFieldTilt';

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
