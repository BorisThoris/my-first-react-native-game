import type { Tile } from '../../shared/contracts';
import { hashPairKey } from '../../shared/hashPairKey';

export type CardIllustrationRegistry = {
    /** Exact `tile.symbol` (trimmed) → asset URL */
    bySymbol: Record<string, string>;
    /** Optional `symbol|variantMod` keys for atomic styling */
    bySymbolVariant?: Record<string, string>;
    /** Ordered pool URLs cycled for numeric ranks without a dedicated asset */
    numericFallbackPool: readonly string[];
    /** Ordered pool for non-digit symbols without a dedicated asset */
    nonDigitFallbackPool: readonly string[];
};

/**
 * Deterministic illustration URL for a tile, or `null` when the registry has no usable assets.
 */
export const resolveCardIllustrationUrl = (tile: Tile, registry: CardIllustrationRegistry): string | null => {
    const { bySymbol, bySymbolVariant, numericFallbackPool, nonDigitFallbackPool } = registry;
    const sym = tile.symbol.trim();

    const direct = bySymbol[sym];
    if (direct) {
        return direct;
    }

    if (bySymbolVariant && tile.atomicVariant != null) {
        const variantKey = `${sym}|${tile.atomicVariant}`;
        const v = bySymbolVariant[variantKey];
        if (v) {
            return v;
        }
    }

    const digitOnly = /^\d{1,4}$/.test(sym);
    if (digitOnly && numericFallbackPool.length > 0) {
        const n = Number.parseInt(sym, 10);
        const idx = ((n - 1) % numericFallbackPool.length + numericFallbackPool.length) % numericFallbackPool.length;
        return numericFallbackPool[idx] ?? null;
    }

    if (nonDigitFallbackPool.length > 0) {
        const idx = hashPairKey(tile.pairKey) % nonDigitFallbackPool.length;
        return nonDigitFallbackPool[idx] ?? null;
    }

    return null;
};
