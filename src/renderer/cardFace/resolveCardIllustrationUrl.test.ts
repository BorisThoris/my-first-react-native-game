import { describe, expect, it } from 'vitest';
import type { Tile } from '../../shared/contracts';
import type { CardIllustrationRegistry } from './resolveCardIllustrationUrl';
import { resolveCardIllustrationUrl } from './resolveCardIllustrationUrl';

const tile = (overrides: Partial<Tile>): Tile => ({
    id: 't',
    pairKey: 'pk',
    symbol: '01',
    label: 'One',
    state: 'flipped',
    ...overrides
});

const registry: CardIllustrationRegistry = {
    bySymbol: {
        '★': '/direct.svg'
    },
    bySymbolVariant: {
        '07|2': '/variant.svg'
    },
    numericFallbackPool: ['/num-a.svg', '/num-b.svg'],
    nonDigitFallbackPool: ['/sym-a.svg', '/sym-b.svg']
};

describe('resolveCardIllustrationUrl', () => {
    it('returns direct bySymbol match', () => {
        expect(resolveCardIllustrationUrl(tile({ symbol: '★' }), registry)).toBe('/direct.svg');
    });

    it('matches symbol|atomicVariant before pools', () => {
        expect(
            resolveCardIllustrationUrl(tile({ symbol: '07', atomicVariant: 2 }), registry)
        ).toBe('/variant.svg');
    });

    it('cycles numericFallbackPool by rank for digit-only symbols', () => {
        expect(resolveCardIllustrationUrl(tile({ symbol: '01' }), registry)).toBe('/num-a.svg');
        expect(resolveCardIllustrationUrl(tile({ symbol: '02' }), registry)).toBe('/num-b.svg');
        expect(resolveCardIllustrationUrl(tile({ symbol: '03' }), registry)).toBe('/num-a.svg');
    });

    it('uses hashed pairKey for non-digit fallback', () => {
        const a = resolveCardIllustrationUrl(tile({ symbol: '☾', pairKey: 'aaa' }), registry);
        const b = resolveCardIllustrationUrl(tile({ symbol: '☾', pairKey: 'aaa' }), registry);
        expect(a).toBe(b);
        expect(['/sym-a.svg', '/sym-b.svg']).toContain(a);
    });

    it('returns null when no assets are available', () => {
        const empty: CardIllustrationRegistry = {
            bySymbol: {},
            numericFallbackPool: [],
            nonDigitFallbackPool: []
        };
        expect(resolveCardIllustrationUrl(tile({ symbol: '99' }), empty)).toBeNull();
    });
});
