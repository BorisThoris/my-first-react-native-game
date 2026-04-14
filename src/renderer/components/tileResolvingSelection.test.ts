import { describe, expect, it } from 'vitest';
import type { BoardState } from '../../shared/contracts';
import { WILD_PAIR_KEY } from '../../shared/game';
import { getMatchResolvingPairTileIds, getResolvingSelectionState } from './tileResolvingSelection';

const tile = (id: string, pairKey: string, state: 'hidden' | 'flipped' = 'flipped') => ({
    id,
    label: id,
    pairKey,
    state,
    symbol: 'A'
});

describe('getResolvingSelectionState', () => {
    it('classifies two-tile match', () => {
        const board: BoardState = {
            columns: 2,
            flippedTileIds: ['a', 'b'],
            level: 1,
            matchedPairs: 0,
            pairCount: 1,
            rows: 1,
            tiles: [tile('a', 'pk1'), tile('b', 'pk1')]
        };
        expect(getResolvingSelectionState(board, 'resolving', 'a')).toBe('match');
        expect(getResolvingSelectionState(board, 'resolving', 'b')).toBe('match');
    });

    it('classifies gambit third tile: pair match + spare', () => {
        const board: BoardState = {
            columns: 3,
            flippedTileIds: ['a', 'b', 'c'],
            level: 1,
            matchedPairs: 0,
            pairCount: 3,
            rows: 1,
            tiles: [tile('a', 'pk1'), tile('b', 'pk1'), tile('c', 'pk2')]
        };
        expect(getResolvingSelectionState(board, 'resolving', 'a')).toBe('match');
        expect(getResolvingSelectionState(board, 'resolving', 'b')).toBe('match');
        expect(getResolvingSelectionState(board, 'resolving', 'c')).toBe('gambitNeutral');
    });

    it('classifies gambit with wild pairing', () => {
        const board: BoardState = {
            columns: 3,
            flippedTileIds: ['w', 'x', 'y'],
            level: 1,
            matchedPairs: 0,
            pairCount: 3,
            rows: 1,
            tiles: [tile('w', WILD_PAIR_KEY), tile('x', 'pk9'), tile('y', 'pk2')]
        };
        expect(getResolvingSelectionState(board, 'resolving', 'w')).toBe('match');
        expect(getResolvingSelectionState(board, 'resolving', 'x')).toBe('match');
        expect(getResolvingSelectionState(board, 'resolving', 'y')).toBe('gambitNeutral');
    });

    it('marks all three mismatch when no pair exists', () => {
        const board: BoardState = {
            columns: 3,
            flippedTileIds: ['a', 'b', 'c'],
            level: 1,
            matchedPairs: 0,
            pairCount: 3,
            rows: 1,
            tiles: [tile('a', 'p1'), tile('b', 'p2'), tile('c', 'p3')]
        };
        expect(getResolvingSelectionState(board, 'resolving', 'a')).toBe('mismatch');
        expect(getResolvingSelectionState(board, 'resolving', 'b')).toBe('mismatch');
        expect(getResolvingSelectionState(board, 'resolving', 'c')).toBe('mismatch');
    });

    /** CARD-008: triplet classification must follow `flippedTileIds` order (same tie-break as `resolveGambitThree`), not `board.tiles` iteration order. */
    it('orders gambit triplet by flippedTileIds for wild tie-break', () => {
        const board: BoardState = {
            columns: 3,
            flippedTileIds: ['x', 'y', 'z'],
            level: 1,
            matchedPairs: 0,
            pairCount: 3,
            rows: 1,
            tiles: [tile('y', 'pk1'), tile('z', 'pk1'), tile('x', WILD_PAIR_KEY)]
        };
        expect(getResolvingSelectionState(board, 'resolving', 'x')).toBe('match');
        expect(getResolvingSelectionState(board, 'resolving', 'y')).toBe('match');
        expect(getResolvingSelectionState(board, 'resolving', 'z')).toBe('gambitNeutral');
    });
});

describe('getMatchResolvingPairTileIds', () => {
    it('returns null when not resolving', () => {
        const board: BoardState = {
            columns: 2,
            flippedTileIds: ['a', 'b'],
            level: 1,
            matchedPairs: 0,
            pairCount: 1,
            rows: 1,
            tiles: [tile('a', 'pk1'), tile('b', 'pk1')]
        };
        expect(getMatchResolvingPairTileIds(board, 'playing')).toBeNull();
    });

    it('returns the two matching flipped tiles', () => {
        const board: BoardState = {
            columns: 2,
            flippedTileIds: ['a', 'b'],
            level: 1,
            matchedPairs: 0,
            pairCount: 1,
            rows: 1,
            tiles: [tile('a', 'pk1'), tile('b', 'pk1')]
        };
        expect(getMatchResolvingPairTileIds(board, 'resolving')).toEqual(['a', 'b']);
    });

    it('returns gambit pair ids (not the spare)', () => {
        const board: BoardState = {
            columns: 3,
            flippedTileIds: ['a', 'b', 'c'],
            level: 1,
            matchedPairs: 0,
            pairCount: 3,
            rows: 1,
            tiles: [tile('a', 'pk1'), tile('b', 'pk1'), tile('c', 'pk2')]
        };
        expect(getMatchResolvingPairTileIds(board, 'resolving')).toEqual(['a', 'b']);
    });

    it('returns null on mismatch triplet', () => {
        const board: BoardState = {
            columns: 3,
            flippedTileIds: ['a', 'b', 'c'],
            level: 1,
            matchedPairs: 0,
            pairCount: 3,
            rows: 1,
            tiles: [tile('a', 'p1'), tile('b', 'p2'), tile('c', 'p3')]
        };
        expect(getMatchResolvingPairTileIds(board, 'resolving')).toBeNull();
    });
});
