import { describe, expect, it } from 'vitest';
import type { BoardState, Tile } from './contracts';
import { computeFocusDimmedTileIds } from './focusDimmedTileIds';

const tile = (id: string, pairKey: string, state: Tile['state']): Tile => ({
    id,
    pairKey,
    state,
    symbol: '1',
    label: '1'
});

describe('computeFocusDimmedTileIds', () => {
    it('returns undefined when assist off or not playing', () => {
        const board: BoardState = {
            level: 1,
            pairCount: 2,
            columns: 2,
            rows: 2,
            tiles: [
                tile('a', 'A', 'hidden'),
                tile('b', 'A', 'hidden'),
                tile('c', 'B', 'hidden'),
                tile('d', 'B', 'hidden')
            ],
            flippedTileIds: ['a'],
            matchedPairs: 0
        };
        expect(computeFocusDimmedTileIds(board, 'playing', false)).toBeUndefined();
        expect(computeFocusDimmedTileIds(board, 'memorize', true)).toBeUndefined();
    });

    it('dims non-neighbor hidden tiles for a 2x2 with one flip', () => {
        const board: BoardState = {
            level: 1,
            pairCount: 2,
            columns: 2,
            rows: 2,
            tiles: [
                tile('a', 'A', 'flipped'),
                tile('b', 'A', 'hidden'),
                tile('c', 'B', 'hidden'),
                tile('d', 'B', 'hidden')
            ],
            flippedTileIds: ['a'],
            matchedPairs: 0
        };
        const dim = computeFocusDimmedTileIds(board, 'playing', true);
        expect(dim).toBeDefined();
        expect(dim!.has('d')).toBe(true);
        expect(dim!.has('b')).toBe(false);
        expect(dim!.has('c')).toBe(false);
    });
});
