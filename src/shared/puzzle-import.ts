import type { Tile } from './contracts';

/** Keep in sync with `game.ts` glass decoy key. */
const DECOY_PAIR_KEY = '__decoy__';

/**
 * Runtime checks for hand-authored puzzle tile lists (builtins and tests):
 * count 4–64, required string fields (non-empty id/pairKey after trim), optional finite `atomicVariant`,
 * and exactly two tiles per non-decoy `pairKey`.
 */
export const isValidPuzzleImportTileSet = (tiles: Tile[]): boolean => {
    if (tiles.length < 4 || tiles.length > 64) {
        return false;
    }
    for (const tile of tiles) {
        const { id, pairKey, symbol, label } = tile;
        if (typeof id !== 'string' || typeof pairKey !== 'string' || typeof symbol !== 'string' || typeof label !== 'string') {
            return false;
        }
        if (!id.trim() || !pairKey.trim()) {
            return false;
        }
        if ('atomicVariant' in tile && tile.atomicVariant !== undefined) {
            if (typeof tile.atomicVariant !== 'number' || !Number.isFinite(tile.atomicVariant)) {
                return false;
            }
        }
    }
    const pairKeys = tiles.map((x) => x.pairKey).filter((k) => k !== DECOY_PAIR_KEY);
    const counts = new Map<string, number>();
    for (const k of pairKeys) {
        counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    for (const c of counts.values()) {
        if (c !== 2) {
            return false;
        }
    }
    return true;
};
