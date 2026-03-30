import { describe, expect, it } from 'vitest';
import {
    createIntroSeed,
    pickWeightedIntroPreset,
    resolveIntroVariant
} from './startupIntroConfig';

describe('startup intro seed + preset selection', () => {
    it('creates a stable session seed for fixed time and entropy inputs', () => {
        const seed = createIntroSeed({
            entropy: 0x12345678,
            now: new Date('2026-03-30T12:34:56.000')
        });

        expect(seed).toEqual({
            entropy: 0x12345678,
            hourBucket: '2026-03-30-12',
            sessionSeed: 1070675851
        });
    });

    it('matches the planned intro runtime based on the motion setting', () => {
        expect(
            resolveIntroVariant({
                entropy: 0x89abcdef,
                now: new Date('2026-03-30T12:34:56.000'),
                reduceMotion: false
            }).durationMs
        ).toBe(3200);

        expect(
            resolveIntroVariant({
                entropy: 0x89abcdef,
                now: new Date('2026-03-30T12:34:56.000'),
                reduceMotion: true
            }).durationMs
        ).toBe(1400);
    });

    it('avoids fire and liquify presets when reduced motion is enabled', () => {
        const seenPresets = new Set<string>();

        for (let seed = 1; seed <= 256; seed += 1) {
            seenPresets.add(pickWeightedIntroPreset(seed, true));
        }

        expect(Array.from(seenPresets).sort()).toEqual(['arcane-pulse', 'royal-sheen']);
    });
});
