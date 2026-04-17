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
});
