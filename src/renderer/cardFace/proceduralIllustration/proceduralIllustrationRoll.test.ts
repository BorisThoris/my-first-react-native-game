import { describe, expect, it } from 'vitest';
import { rollProceduralIllustrationSpec } from './proceduralIllustrationSpec';

describe('rollProceduralIllustrationSpec', () => {
    it('is deterministic per pairKey and tier', () => {
        const a = rollProceduralIllustrationSpec('pair-key-1', 'full');
        const b = rollProceduralIllustrationSpec('pair-key-1', 'full');
        expect(a).toEqual(b);
    });

    it('differs across distinct pairKeys', () => {
        expect(rollProceduralIllustrationSpec('pair-alpha', 'standard')).not.toEqual(
            rollProceduralIllustrationSpec('pair-beta', 'standard')
        );
    });

    it('rolls bounded noise strength and symmetry flags', () => {
        const spec = rollProceduralIllustrationSpec('pair-inv-1', 'full');
        expect([0, 1, 2]).toContain(spec.noiseStrength);
        expect(['none', 'mirrorV']).toContain(spec.symmetry);
        expect(spec.ringLayers).toBeGreaterThanOrEqual(1);
        expect(spec.ringLayers).toBeLessThanOrEqual(5);
        expect(spec.motifSides).toBeGreaterThanOrEqual(3);
        expect(spec.motifSides).toBeLessThanOrEqual(14);
    });

    it('clamps maximal noise on minimal tier', () => {
        const spec = rollProceduralIllustrationSpec('pair-min-noise', 'minimal');
        expect(spec.noiseStrength).not.toBe(2);
    });
});
