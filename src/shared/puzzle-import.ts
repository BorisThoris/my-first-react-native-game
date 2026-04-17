import type { Tile } from './contracts';

/** Keep in sync with `game.ts` glass decoy key. */
const DECOY_PAIR_KEY = '__decoy__';

export type PuzzleImportPayload = {
    title?: string;
    tiles: Tile[];
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

/**
 * Runtime checks for tiles accepted by `parsePuzzleImportJson` / `createPuzzleRun`:
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

/**
 * Validates a JSON puzzle definition for `createPuzzleRun`.
 * Expects `{ "title"?: string, "tiles": [ { "id", "pairKey", "symbol", "label", "atomicVariant"? } ] }`.
 */
export const parsePuzzleImportJson = (raw: string): { title: string; tiles: Tile[] } | null => {
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw) as unknown;
    } catch {
        return null;
    }
    if (!isRecord(parsed) || !Array.isArray(parsed.tiles)) {
        return null;
    }
    const tilesIn: unknown[] = parsed.tiles;
    if (tilesIn.length < 4 || tilesIn.length > 64) {
        return null;
    }
    const tiles: Tile[] = [];
    for (const item of tilesIn) {
        if (!isRecord(item)) {
            return null;
        }
        const id = item.id;
        const pairKey = item.pairKey;
        const symbol = item.symbol;
        const label = item.label;
        if (typeof id !== 'string' || typeof pairKey !== 'string' || typeof symbol !== 'string' || typeof label !== 'string') {
            return null;
        }
        if (!id.trim() || !pairKey.trim()) {
            return null;
        }
        const atomicVariant = item.atomicVariant;
        const t: Tile = {
            id,
            pairKey,
            symbol,
            label,
            state: 'hidden',
            ...(typeof atomicVariant === 'number' && Number.isFinite(atomicVariant) ? { atomicVariant } : {})
        };
        tiles.push(t);
    }
    if (!isValidPuzzleImportTileSet(tiles)) {
        return null;
    }
    const title =
        typeof parsed.title === 'string' && parsed.title.trim().length > 0 ? parsed.title.trim() : 'Imported puzzle';
    return { title, tiles };
};
