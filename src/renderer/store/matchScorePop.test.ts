import { describe, expect, it } from 'vitest';
import type { BoardState, RunState } from '../../shared/contracts';
import { buildMatchScorePopPayload, buildMismatchScorePopPayload } from './matchScorePop';

const minimalRun = (partial: Partial<RunState>): RunState =>
    ({
        stats: {
            matchesFound: 0,
            totalScore: 0,
            tries: 0,
            comboShards: 0,
            rating: '',
            highestLevel: 1,
            currentLevelScore: 0,
            bestScore: 0,
            currentStreak: 0,
            bestStreak: 0,
            levelsCleared: 0,
            mismatches: 0
        },
        board: null,
        ...partial
    }) as RunState;

describe('buildMatchScorePopPayload', () => {
    it('returns null when not a new match', () => {
        const run = minimalRun({
            board: {
                level: 1,
                rows: 2,
                columns: 2,
                flippedTileIds: ['a', 'b'],
                tiles: []
            } as unknown as BoardState,
            stats: { matchesFound: 1, totalScore: 10 } as RunState['stats']
        });
        const next = {
            ...run,
            stats: { ...run.stats, matchesFound: 1, totalScore: 10 }
        };
        expect(buildMatchScorePopPayload(run, next, 'k')).toBeNull();
    });

    it('returns payload with amount and tile ids when match score increases', () => {
        const run = minimalRun({
            board: {
                level: 3,
                rows: 2,
                columns: 2,
                flippedTileIds: ['t1', 't2'],
                tiles: []
            } as unknown as BoardState,
            stats: { matchesFound: 2, totalScore: 40 } as RunState['stats']
        });
        const next = {
            ...run,
            stats: { ...run.stats, matchesFound: 3, totalScore: 55 }
        };
        const pop = buildMatchScorePopPayload(run, next, 'fixture');
        expect(pop).toEqual({
            amount: 15,
            tileIdA: 't1',
            tileIdB: 't2',
            key: '3-fixture-t1-t2'
        });
    });

    it('returns null when score delta is not positive', () => {
        const run = minimalRun({
            board: {
                level: 1,
                flippedTileIds: ['a', 'b'],
                tiles: []
            } as unknown as BoardState,
            stats: { matchesFound: 2, totalScore: 10 } as RunState['stats']
        });
        const next = {
            ...run,
            stats: { ...run.stats, matchesFound: 3, totalScore: 10 }
        };
        expect(buildMatchScorePopPayload(run, next, 'k')).toBeNull();
    });

    it('gambit match anchors to resolveGambitThree pair (not third tile)', () => {
        const run = minimalRun({
            board: {
                level: 5,
                rows: 2,
                columns: 2,
                flippedTileIds: ['t1', 't3', 't2'],
                tiles: [
                    { id: 't1', pairKey: 'pk', symbol: 'a', label: 'a', state: 'hidden' },
                    { id: 't2', pairKey: 'pk', symbol: 'b', label: 'b', state: 'hidden' },
                    { id: 't3', pairKey: 'other', symbol: 'c', label: 'c', state: 'hidden' }
                ]
            } as unknown as BoardState,
            stats: { matchesFound: 1, totalScore: 20 } as RunState['stats']
        });
        const next = {
            ...run,
            stats: { ...run.stats, matchesFound: 2, totalScore: 35 }
        };
        expect(buildMatchScorePopPayload(run, next, 'g')).toEqual({
            amount: 15,
            tileIdA: 't1',
            tileIdB: 't2',
            key: '5-g-t1-t2'
        });
    });
});

describe('buildMismatchScorePopPayload', () => {
    it('returns null when mismatches do not increase', () => {
        const run = minimalRun({
            board: {
                level: 1,
                flippedTileIds: ['a', 'b'],
                tiles: []
            } as unknown as BoardState,
            stats: { mismatches: 2 } as RunState['stats']
        });
        const next = {
            ...run,
            stats: { ...run.stats, mismatches: 2 }
        };
        expect(buildMismatchScorePopPayload(run, next, 'k')).toBeNull();
    });

    it('returns tile ids and key when mismatches increase', () => {
        const run = minimalRun({
            board: {
                level: 2,
                flippedTileIds: ['x', 'y'],
                tiles: []
            } as unknown as BoardState,
            stats: { mismatches: 1 } as RunState['stats']
        });
        const next = {
            ...run,
            stats: { ...run.stats, mismatches: 2 }
        };
        expect(buildMismatchScorePopPayload(run, next, 'fix')).toEqual({
            tileIdA: 'x',
            tileIdB: 'y',
            key: 'miss-2-fix-x-y'
        });
    });

    it('gambit triple miss includes tileIdC and extended key', () => {
        const run = minimalRun({
            board: {
                level: 4,
                flippedTileIds: ['u', 'v', 'w'],
                tiles: []
            } as unknown as BoardState,
            stats: { mismatches: 3 } as RunState['stats']
        });
        const next = {
            ...run,
            stats: { ...run.stats, mismatches: 4 }
        };
        expect(buildMismatchScorePopPayload(run, next, 'trip')).toEqual({
            tileIdA: 'u',
            tileIdB: 'v',
            tileIdC: 'w',
            key: 'miss-4-trip-u-v-w'
        });
    });
});
