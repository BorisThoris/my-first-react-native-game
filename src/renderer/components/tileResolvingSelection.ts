import type { BoardState, RunStatus, Tile } from '../../shared/contracts';
import { tilesArePairMatch } from '../../shared/game';

export type ResolvingSelectionState = 'match' | 'mismatch' | 'gambitNeutral' | null;

const classifyTwo = (tiles: Tile[]): ResolvingSelectionState => {
    if (tiles.length !== 2) {
        return null;
    }

    return tilesArePairMatch(tiles[0], tiles[1]) ? 'match' : 'mismatch';
};

/** Which two tiles (if any) form the gambit match while three are flipped — mirrors `resolveGambitThree`. */
const gambitMatchPairIds = (tiles: [Tile, Tile, Tile]): { matchA: string; matchB: string; thirdId: string } | null => {
    const [ta, tb, tc] = tiles;

    if (tilesArePairMatch(ta, tb)) {
        return { matchA: ta.id, matchB: tb.id, thirdId: tc.id };
    }

    if (tilesArePairMatch(ta, tc)) {
        return { matchA: ta.id, matchB: tc.id, thirdId: tb.id };
    }

    if (tilesArePairMatch(tb, tc)) {
        return { matchA: tb.id, matchB: tc.id, thirdId: ta.id };
    }

    return null;
};

/** Flipped tiles in flip-sequence order — must match `resolveGambitThree` / `flipTile` (`CARD-008`). */
const flippedTilesInFlipOrder = (board: BoardState): Tile[] => {
    const out: Tile[] = [];

    for (const id of board.flippedTileIds) {
        const tile = board.tiles.find((candidate) => candidate.id === id);

        if (tile) {
            out.push(tile);
        }
    }

    return out;
};

export const getResolvingSelectionState = (
    board: BoardState,
    runStatus: RunStatus,
    tileId: string
): ResolvingSelectionState => {
    if (runStatus !== 'resolving' || !board.flippedTileIds.includes(tileId)) {
        return null;
    }

    const flippedTiles = flippedTilesInFlipOrder(board);

    if (flippedTiles.length === 2) {
        return classifyTwo(flippedTiles);
    }

    if (flippedTiles.length === 3) {
        const triplet = flippedTiles as [Tile, Tile, Tile];
        const pair = gambitMatchPairIds(triplet);

        if (!pair) {
            return 'mismatch';
        }

        if (tileId === pair.thirdId) {
            return 'gambitNeutral';
        }

        if (tileId === pair.matchA || tileId === pair.matchB) {
            return 'match';
        }

        return 'mismatch';
    }

    return null;
};

/** FX-017: the two tiles currently in `match` resolving highlight (two flips or gambit pair). */
export const getMatchResolvingPairTileIds = (
    board: BoardState,
    runStatus: RunStatus
): readonly [string, string] | null => {
    if (runStatus !== 'resolving') {
        return null;
    }

    const matchIds: string[] = [];

    for (const tile of board.tiles) {
        if (getResolvingSelectionState(board, runStatus, tile.id) === 'match') {
            matchIds.push(tile.id);
        }
    }

    if (matchIds.length !== 2) {
        return null;
    }

    return [matchIds[0], matchIds[1]] as const;
};
