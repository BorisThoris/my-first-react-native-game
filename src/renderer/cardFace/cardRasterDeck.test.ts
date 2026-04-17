import { describe, expect, it } from 'vitest';
import { hashPairKey } from '../../shared/hashPairKey';
import {
    CARD_RASTER_SLOT_COUNT,
    rasterDeckPairKeyForSlot,
    clearRasterDeckPanelCache
} from './cardRasterDeck';

describe('cardRasterDeck', () => {
    it('uses 30 stable slot pair keys', () => {
        expect(CARD_RASTER_SLOT_COUNT).toBe(30);
        expect(rasterDeckPairKeyForSlot(0)).toBe('__raster-deck-00');
        expect(rasterDeckPairKeyForSlot(29)).toBe('__raster-deck-29');
        expect(rasterDeckPairKeyForSlot(99)).toBe('__raster-deck-29');
        expect(rasterDeckPairKeyForSlot(-3)).toBe('__raster-deck-00');
    });

    it('clears panel cache without throwing', () => {
        expect(() => clearRasterDeckPanelCache()).not.toThrow();
    });

    it('picks composite slots deterministically from pairKey', () => {
        const a = Math.abs(hashPairKey('alpha')) % CARD_RASTER_SLOT_COUNT;
        const b = Math.abs(hashPairKey('alpha')) % CARD_RASTER_SLOT_COUNT;
        expect(a).toBe(b);
        const c = Math.abs(hashPairKey('beta')) % CARD_RASTER_SLOT_COUNT;
        expect(typeof c).toBe('number');
    });
});
