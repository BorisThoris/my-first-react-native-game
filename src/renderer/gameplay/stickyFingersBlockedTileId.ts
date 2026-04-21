import type { MutatorId } from '../../shared/contracts';

/** Tile that cannot open the next pair (`flipTile` matches `stickyBlockIndex`). */
export const getStickyBlockedTileId = (params: {
    activeMutators: readonly MutatorId[];
    flippedTileIds: readonly string[];
    stickyBlockIndex: number | null;
    tiles: readonly { id: string }[];
}): string | null => {
    if (!params.activeMutators.includes('sticky_fingers')) {
        return null;
    }
    if (params.flippedTileIds.length !== 0) {
        return null;
    }
    if (params.stickyBlockIndex == null) {
        return null;
    }
    const tile = params.tiles[params.stickyBlockIndex];
    return tile?.id ?? null;
};
