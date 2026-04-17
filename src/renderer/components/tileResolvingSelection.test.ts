import { describe, expect, it } from 'vitest';
import type { BoardState, Tile } from '../../shared/contracts';
import { getResolvingMatchWaveKey, getMatchResolvingPairTileIds } from './tileResolvingSelection';

const tile = (partial: Partial<Tile> & Pick<Tile, 'id' | 'pairKey'>): Tile =>
    ({
        state: 'flipped',
        symbol: 'A',
        label: 'A',
        ...partial
    }) as Tile;

const minimalBoard = (overrides: Partial<BoardState> & Pick<BoardState, 'tiles' | 'flippedTileIds'>): BoardState =>
    ({
        columns: overrides.columns ?? 2,
        rows: overrides.rows ?? 2,
        level: overrides.level ?? 1,
        pairCount: overrides.pairCount ?? 1,
        matchedPairs: overrides.matchedPairs ?? 0,
        ...overrides
    }) as BoardState;

describe('tileResolvingSelection (REF-080)', () => {
    it('getResolvingMatchWaveKey sorts ids so wave token is stable', () => {
        const board = minimalBoard({
            flippedTileIds: ['b', 'a'],
            tiles: [tile({ id: 'a', pairKey: 'pk' }), tile({ id: 'b', pairKey: 'pk' })]
        });
        expect(getMatchResolvingPairTileIds(board, 'resolving')).toEqual(['a', 'b']);
        expect(getResolvingMatchWaveKey(board, 'resolving')).toBe('a:b');
    });

    it('getResolvingMatchWaveKey is null when not resolving', () => {
        const board = minimalBoard({
            flippedTileIds: ['a', 'b'],
            tiles: [tile({ id: 'a', pairKey: 'pk' }), tile({ id: 'b', pairKey: 'pk' })]
        });
        expect(getResolvingMatchWaveKey(board, 'playing')).toBe(null);
    });
});
