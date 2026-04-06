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
