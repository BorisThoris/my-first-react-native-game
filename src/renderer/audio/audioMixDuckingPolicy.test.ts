import { describe, expect, it } from 'vitest';
import { getReg114DuckRow, REG114_MIX_DUCKING_TABLE } from './audioMixDuckingPolicy';

describe('REG-114 audio mix and ducking policy', () => {
    it('keeps a stable ducking table with coverage flags', () => {
        expect(REG114_MIX_DUCKING_TABLE.length).toBeGreaterThan(4);
        expect(REG114_MIX_DUCKING_TABLE.every((r) => r.audioInteractionCoverage)).toBe(true);
    });

    it('hard-stops music on pause and game over routes', () => {
        expect(getReg114DuckRow('pause')?.musicVolumeMultiplier).toBe(0);
        expect(getReg114DuckRow('game_over')?.musicVolumeMultiplier).toBe(0);
    });
});
