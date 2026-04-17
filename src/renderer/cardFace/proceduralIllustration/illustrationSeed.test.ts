import { describe, expect, it } from 'vitest';
import { deriveIllustrationSeed } from './illustrationSeed';

describe('deriveIllustrationSeed', () => {
    it('is stable per pairKey', () => {
        expect(deriveIllustrationSeed('pk-a')).toBe(deriveIllustrationSeed('pk-a'));
    });

    it('usually differs across pairKeys', () => {
        expect(deriveIllustrationSeed('alpha')).not.toBe(deriveIllustrationSeed('beta'));
    });
});
