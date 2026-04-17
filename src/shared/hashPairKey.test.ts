import { describe, expect, it } from 'vitest';
import { hashPairKey } from './hashPairKey';

describe('hashPairKey', () => {
    it('is deterministic', () => {
        expect(hashPairKey('pair-a')).toBe(hashPairKey('pair-a'));
    });

    it('returns non-negative integers', () => {
        expect(hashPairKey('x')).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(hashPairKey('hello'))).toBe(true);
    });
});
