import { describe, expect, it } from 'vitest';
import type { BoardState, RunState, Tile } from './contracts';
import {
    advanceToNextLevel,
    buildBoard,
    createNewRun,
    enableDebugPeek,
    flipTile,
    resolveBoardTurn
} from './game';

const createBoard = (tiles: Tile[]): BoardState => ({
    level: 1,
    pairCount: tiles.length / 2,
    columns: 2,
    rows: Math.ceil(tiles.length / 2),
    tiles,
    flippedTileIds: [],
    matchedPairs: 0
});

const createRun = (tiles: Tile[]): RunState => ({
    ...createNewRun(0),
    lives: 3,
    board: createBoard(tiles)
});

describe('game rules', () => {
    it('builds a progressively larger board by level', () => {
        const board = buildBoard(4);

        expect(board.level).toBe(4);
        expect(board.pairCount).toBe(5);
        expect(board.tiles).toHaveLength(10);
        expect(board.columns).toBeGreaterThanOrEqual(2);
    });

    it('spends a life and increments tries on a mismatch', () => {
        const tiles: Tile[] = [
            { id: 'a1', pairKey: 'A', state: 'hidden', symbol: 'A' },
            { id: 'a2', pairKey: 'A', state: 'hidden', symbol: 'A' },
            { id: 'b1', pairKey: 'B', state: 'hidden', symbol: 'B' },
            { id: 'b2', pairKey: 'B', state: 'hidden', symbol: 'B' }
        ];
        const flippedOnce = flipTile(createRun(tiles), 'a1');
        const flippedTwice = flipTile(flippedOnce, 'b1');
        const resolved = resolveBoardTurn(flippedTwice);

        expect(resolved.lives).toBe(2);
        expect(resolved.stats.tries).toBe(1);
        expect(resolved.stats.mismatches).toBe(1);
        expect(resolved.board?.tiles.every((tile) => tile.state === 'hidden')).toBe(true);
    });

    it('completes a level and banks score on the final match', () => {
        const tiles: Tile[] = [
            { id: 'a1', pairKey: 'A', state: 'hidden', symbol: 'A' },
            { id: 'a2', pairKey: 'A', state: 'hidden', symbol: 'A' }
        ];
        const run = {
            ...createRun(tiles),
            lives: 4
        };
        const flippedOnce = flipTile(run, 'a1');
        const flippedTwice = flipTile(flippedOnce, 'a2');
        const resolved = resolveBoardTurn(flippedTwice);

        expect(resolved.status).toBe('levelComplete');
        expect(resolved.lives).toBe(5);
        expect(resolved.stats.totalScore).toBe(100);
        expect(resolved.stats.levelsCleared).toBe(1);
        expect(resolved.lastLevelResult?.perfect).toBe(true);
    });

    it('advances to the next level and resets per-level stats', () => {
        const run = {
            ...createNewRun(250),
            status: 'levelComplete' as const,
            stats: {
                ...createNewRun(250).stats,
                tries: 4,
                totalScore: 300,
                highestLevel: 1
            }
        };
        const nextRun = advanceToNextLevel(run);

        expect(nextRun.status).toBe('playing');
        expect(nextRun.board?.level).toBe(2);
        expect(nextRun.stats.tries).toBe(0);
        expect(nextRun.stats.totalScore).toBe(300);
        expect(nextRun.stats.highestLevel).toBe(2);
    });

    it('can disable achievements when debug reveal is used', () => {
        const run = enableDebugPeek(createNewRun(0), true);

        expect(run.debugPeekActive).toBe(true);
        expect(run.debugUsed).toBe(true);
        expect(run.achievementsEnabled).toBe(false);
    });
});
