import type { BoardState, RunStatus, Tile } from '../../shared/contracts';
import { WILD_PAIR_KEY } from '../../shared/game';

export type ResolvingSelectionState = 'match' | 'mismatch' | null;

const areResolvingTilesMatch = (tiles: Tile[]): boolean => {
    if (tiles.length < 2 || tiles.length > 2) {
        return false;
    }

    const [first, second] = tiles;

    if (first.pairKey === second.pairKey && first.pairKey !== '__decoy__') {
        return true;
    }

    if (first.pairKey === WILD_PAIR_KEY && second.pairKey !== WILD_PAIR_KEY) {
        return true;
    }

    if (second.pairKey === WILD_PAIR_KEY && first.pairKey !== WILD_PAIR_KEY) {
        return true;
    }

    return false;
};

export const getResolvingSelectionState = (
    board: BoardState,
    runStatus: RunStatus,
    tileId: string
): ResolvingSelectionState => {
    if (runStatus !== 'resolving' || !board.flippedTileIds.includes(tileId)) {
        return null;
    }

    const flippedTiles = board.tiles.filter((tile) => board.flippedTileIds.includes(tile.id));

    if (flippedTiles.length === 2) {
        return areResolvingTilesMatch(flippedTiles) ? 'match' : 'mismatch';
    }

    if (flippedTiles.length === 3) {
        return 'mismatch';
    }

    return null;
};
