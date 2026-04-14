import { describe, expect, it } from 'vitest';
import type { BoardState, Tile } from './contracts';
import { WILD_PAIR_KEY } from './game';
import { getPairProximityGridDistance } from './pairProximityHint';

const tile = (id: string, pairKey: string, state: Tile['state']): Tile => ({
    id,
    pairKey,
    symbol: id,
    label: id,
    state
});

const board2x2 = (tiles: Tile[]): BoardState => ({
    level: 1,
    pairCount: 2,
    columns: 2,
    rows: 2,
    tiles,
    flippedTileIds: tiles.filter((t) => t.state === 'flipped').map((t) => t.id),
    matchedPairs: 0
});

describe('getPairProximityGridDistance', () => {
    it('returns Manhattan distance to the matching partner', () => {
        const b = board2x2([
            tile('a', 'p1', 'flipped'),
            tile('b', 'p1', 'hidden'),
            tile('c', 'p2', 'hidden'),
            tile('d', 'p2', 'hidden')
        ]);
        expect(getPairProximityGridDistance(b, 'a')).toBe(1);
    });

    it('returns diagonal distance as sum of row and column deltas', () => {
        const b = board2x2([
            tile('a', 'p1', 'flipped'),
            tile('c', 'p2', 'hidden'),
            tile('d', 'p2', 'hidden'),
            tile('b', 'p1', 'hidden')
        ]);
        expect(getPairProximityGridDistance(b, 'a')).toBe(2);
    });

    it('returns null for decoy tiles', () => {
        const b = board2x2([
            tile('a', '__decoy__', 'flipped'),
            tile('b', '__decoy__', 'hidden'),
            tile('c', 'p1', 'hidden'),
            tile('d', 'p1', 'hidden')
        ]);
        expect(getPairProximityGridDistance(b, 'a')).toBeNull();
    });

    it('uses minimum distance among wild-card legal partners', () => {
        const b = board2x2([
            tile('w', WILD_PAIR_KEY, 'flipped'),
            tile('a', 'p1', 'hidden'),
            tile('b', 'p2', 'hidden'),
            tile('c', 'p3', 'hidden')
        ]);
        expect(getPairProximityGridDistance(b, 'w')).toBe(1);
    });
});
