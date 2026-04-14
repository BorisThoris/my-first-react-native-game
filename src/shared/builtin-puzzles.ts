/**
 * Hand-authored puzzle boards (`createPuzzleRun`). Tiles pin explicit `symbol` / `label` / `atomicVariant` — keep in sync
 * with `tile-symbol-catalog.ts` when renaming bands. Optional run systems (cursed pair init, shifting spotlight keys, …)
 * are only present when `buildBoard` / callers supply them for `fixedTiles`.
 */
import type { Tile } from './contracts';

const t = (id: string, pairKey: string, symbol: string, atomicVariant?: number): Tile => ({
    id,
    pairKey,
    symbol,
    label: symbol,
    state: 'hidden',
    ...(atomicVariant !== undefined ? { atomicVariant } : {})
});

export const BUILTIN_PUZZLES: Record<string, { id: string; title: string; tiles: Tile[] }> = {
    starter_pairs: {
        id: 'starter_pairs',
        title: 'Starter 2×2',
        tiles: [t('s1a', 'p0', 'A'), t('s1b', 'p0', 'A'), t('s2a', 'p1', 'B'), t('s2b', 'p1', 'B')]
    },
    mirror_craft: {
        id: 'mirror_craft',
        title: 'Mirror craft 3×2',
        tiles: [
            t('m1a', 'mk0', 'α', 0),
            t('m1b', 'mk0', 'α', 0),
            t('m2a', 'mk1', 'β', 1),
            t('m2b', 'mk1', 'β', 1),
            t('m3a', 'mk2', 'γ', 2),
            t('m3b', 'mk2', 'γ', 2)
        ]
    }
};

export const listBuiltinPuzzleIds = (): string[] => Object.keys(BUILTIN_PUZZLES);
