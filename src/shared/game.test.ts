import { describe, expect, it } from 'vitest';
import type { BoardState, MutatorId, RunState, Tile } from './contracts';
import {
    FINDABLE_MATCH_SCORE,
    GAME_RULES_VERSION,
    MATCH_DELAY_MS,
    MAX_DESTROY_PAIR_BANK,
    SHIFTING_BOUNTY_MATCH_BONUS,
    SHIFTING_WARD_MATCH_PENALTY
} from './contracts';
import {
    advanceToNextLevel,
    applyDestroyPair,
    applyRegionShuffle,
    applyShuffle,
    buildBoard,
    calculateMatchScore,
    canRegionShuffle,
    canRegionShuffleRow,
    canShuffleBoard,
    countFullyHiddenPairs,
    createDailyRun,
    createNewRun,
    createWildRun,
    enableDebugPeek,
    finishMemorizePhase,
    flipTile,
    getMemorizeDuration,
    getMemorizeDurationForRun,
    getPresentationMutatorMatchPenalty,
    isGauntletExpired,
    resolveBoardTurn,
    togglePinnedTile,
    WILD_PAIR_KEY
} from './game';
import { DAILY_MUTATOR_TABLE } from './mutators';

const createTile = (id: string, pairKey: string, symbol: string): Tile => ({
    id,
    pairKey,
    state: 'hidden',
    symbol,
    label: symbol
});

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
    ...finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false, gameMode: 'puzzle' })),
    board: createBoard(tiles)
});

describe('createDailyRun', () => {
    it('uses daily mode, one table mutator, and a UTC date key', () => {
        const run = createDailyRun(0);
        expect(run.gameMode).toBe('daily');
        expect(run.activeMutators).toHaveLength(1);
        expect(DAILY_MUTATOR_TABLE).toContain(run.activeMutators[0]);
        expect(run.dailyDateKeyUtc).toMatch(/^\d{8}$/);
    });
});

describe('game rules', () => {
    it('builds a progressively larger board and memorize duration falls on a gentler step than pair growth', () => {
        const board = buildBoard(4);

        expect(board.level).toBe(4);
        expect(board.pairCount).toBe(5);
        expect(board.tiles).toHaveLength(10);
        expect(board.columns).toBeGreaterThanOrEqual(2);
        expect(getMemorizeDuration(1)).toBe(1300);
        expect(getMemorizeDuration(2)).toBe(1300);
        expect(getMemorizeDuration(3)).toBe(1250);
        expect(getMemorizeDuration(20)).toBe(850);
        expect(getMemorizeDuration(29)).toBe(600);
    });

    it('uses staged symbol bands by level when category_letters is off', () => {
        const numericBand = buildBoard(4, { runSeed: 11_022, runRulesVersion: GAME_RULES_VERSION });
        expect(numericBand.tiles.some((t) => /^\d{2}$/.test(t.symbol))).toBe(true);
        const letterBand = buildBoard(10, { runSeed: 11_022, runRulesVersion: GAME_RULES_VERSION });
        expect(letterBand.tiles.some((t) => /^[A-Z1-4]$/.test(t.symbol))).toBe(true);
    });

    it('applies flat presentation mutator penalties to each match score', () => {
        const tiles: Tile[] = [
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A'),
            createTile('b1', 'B', 'B'),
            createTile('b2', 'B', 'B')
        ];
        const started = {
            ...createRun(tiles),
            activeMutators: ['wide_recall', 'silhouette_twist', 'distraction_channel'] as MutatorId[]
        };
        const penalty = getPresentationMutatorMatchPenalty(started);
        expect(penalty).toBe(8);
        const resolved = resolveBoardTurn(flipTile(flipTile(started, 'a1'), 'a2'));
        const base = calculateMatchScore(1, 1, 1);
        expect(resolved.stats.totalScore).toBe(Math.max(0, base - penalty));
    });

    it('forgives the first mismatch on a floor without spending a life or guard', () => {
        const tiles: Tile[] = [
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A'),
            createTile('b1', 'B', 'B'),
            createTile('b2', 'B', 'B')
        ];
        const started = {
            ...createRun(tiles),
            stats: {
                ...createRun(tiles).stats,
                currentStreak: 2,
                guardTokens: 1
            }
        };
        const flippedOnce = flipTile(started, 'a1');
        const flippedTwice = flipTile(flippedOnce, 'b1');
        const resolved = resolveBoardTurn(flippedTwice);

        expect(resolved.status).toBe('playing');
        expect(resolved.lives).toBe(4);
        expect(resolved.stats.tries).toBe(1);
        expect(resolved.stats.mismatches).toBe(1);
        expect(resolved.stats.currentStreak).toBe(1);
        expect(resolved.stats.guardTokens).toBe(1);
        expect(resolved.stats.totalScore).toBe(0);
        expect(resolved.board?.tiles.every((tile) => tile.state === 'hidden')).toBe(true);
    });

    it('spends a life on the second mismatch of a floor when no guard is available', () => {
        const tiles: Tile[] = [
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A'),
            createTile('b1', 'B', 'B'),
            createTile('b2', 'B', 'B')
        ];
        const started = {
            ...createRun(tiles),
            stats: {
                ...createRun(tiles).stats,
                tries: 1
            }
        };

        const resolved = resolveBoardTurn(flipTile(flipTile(started, 'a1'), 'b1'));

        expect(resolved.status).toBe('playing');
        expect(resolved.lives).toBe(3);
        expect(resolved.stats.tries).toBe(2);
        expect(resolved.stats.mismatches).toBe(1);
        expect(resolved.stats.currentStreak).toBe(0);
    });

    it('banks memorize bonus when a life is lost and applies it on the next level', () => {
        const tiles: Tile[] = [
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A'),
            createTile('b1', 'B', 'B'),
            createTile('b2', 'B', 'B')
        ];
        const started = {
            ...createRun(tiles),
            stats: { ...createRun(tiles).stats, tries: 1 }
        };
        const afterLifeLoss = resolveBoardTurn(flipTile(flipTile(started, 'a1'), 'b1'));
        expect(afterLifeLoss.lives).toBe(3);
        expect(afterLifeLoss.pendingMemorizeBonusMs).toBeGreaterThan(0);

        const finishedLevel = {
            ...afterLifeLoss,
            status: 'levelComplete' as const,
            board: afterLifeLoss.board
                ? {
                      ...afterLifeLoss.board,
                      matchedPairs: afterLifeLoss.board.pairCount,
                      flippedTileIds: [],
                      tiles: afterLifeLoss.board.tiles.map((t) => ({ ...t, state: 'matched' as const }))
                  }
                : null
        };
        const bankedMs = afterLifeLoss.pendingMemorizeBonusMs;
        const nextRun = advanceToNextLevel(finishedLevel);
        expect(nextRun.pendingMemorizeBonusMs).toBe(0);
        expect(nextRun.timerState.memorizeRemainingMs).toBe(getMemorizeDuration(2) + bankedMs);
    });

    it('consumes a guard token on mismatch and prevents life loss', () => {
        const tiles: Tile[] = [
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A'),
            createTile('b1', 'B', 'B'),
            createTile('b2', 'B', 'B')
        ];
        const started = {
            ...createRun(tiles),
            lives: 1,
            stats: {
                ...createRun(tiles).stats,
                tries: 1,
                currentStreak: 5,
                guardTokens: 1
            }
        };

        const resolved = resolveBoardTurn(flipTile(flipTile(started, 'a1'), 'b1'));

        expect(resolved.status).toBe('playing');
        expect(resolved.lives).toBe(1);
        expect(resolved.stats.guardTokens).toBe(0);
        expect(resolved.stats.currentStreak).toBe(2);
        expect(resolved.stats.tries).toBe(2);
        expect(resolved.stats.mismatches).toBe(1);
    });

    it('keeps mismatch resolve delay but resolves matching flips immediately', () => {
        const tiles: Tile[] = [
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A'),
            createTile('b1', 'B', 'B'),
            createTile('b2', 'B', 'B')
        ];
        const started = createRun(tiles);

        const mismatchPending = flipTile(flipTile(started, 'a1'), 'b1');
        expect(mismatchPending.status).toBe('resolving');
        expect(mismatchPending.timerState.resolveRemainingMs).toBe(MATCH_DELAY_MS);

        const matchPending = flipTile(flipTile(started, 'a1'), 'a2');
        expect(matchPending.status).toBe('resolving');
        expect(matchPending.timerState.resolveRemainingMs).toBe(0);
    });

    it('awards immediate match score and perfect clear bonuses on a flawless level', () => {
        const tiles: Tile[] = [createTile('a1', 'A', 'A'), createTile('a2', 'A', 'A')];
        const started = createRun(tiles);
        const flippedOnce = flipTile(started, 'a1');
        const flippedTwice = flipTile(flippedOnce, 'a2');
        const resolved = resolveBoardTurn(flippedTwice);

        expect(resolved.status).toBe('levelComplete');
        expect(resolved.lives).toBe(5);
        expect(resolved.stats.totalScore).toBe(145);
        expect(resolved.stats.currentLevelScore).toBe(145);
        expect(resolved.stats.bestStreak).toBe(1);
        expect(resolved.stats.perfectClears).toBe(1);
        expect(resolved.lastLevelResult?.perfect).toBe(true);
        expect(resolved.lastLevelResult?.mistakes).toBe(0);
        expect(resolved.lastLevelResult?.clearLifeReason).toBe('perfect');
        expect(resolved.lastLevelResult?.clearLifeGained).toBe(1);
    });

    it('scales streak score within a level before the clear bonus lands', () => {
        const tiles: Tile[] = [
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A'),
            createTile('b1', 'B', 'B'),
            createTile('b2', 'B', 'B')
        ];
        const started = createRun(tiles);
        const firstMatch = resolveBoardTurn(flipTile(flipTile(started, 'a1'), 'a2'));
        const secondMatch = resolveBoardTurn(flipTile(flipTile(firstMatch, 'b1'), 'b2'));

        expect(firstMatch.stats.totalScore).toBe(30);
        expect(firstMatch.stats.currentStreak).toBe(1);
        expect(secondMatch.status).toBe('levelComplete');
        expect(secondMatch.stats.totalScore).toBe(215);
        expect(secondMatch.stats.bestStreak).toBe(2);
    });

    it('grants a clean-clear life bonus for floors finished with one mistake', () => {
        const tiles: Tile[] = [
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A'),
            createTile('b1', 'B', 'B'),
            createTile('b2', 'B', 'B')
        ];
        const mismatched = resolveBoardTurn(flipTile(flipTile(createRun(tiles), 'a1'), 'b1'));
        const firstMatch = resolveBoardTurn(flipTile(flipTile(mismatched, 'a1'), 'a2'));
        const resolved = resolveBoardTurn(flipTile(flipTile(firstMatch, 'b1'), 'b2'));

        expect(resolved.status).toBe('levelComplete');
        expect(resolved.lives).toBe(5);
        expect(resolved.stats.totalScore).toBe(190);
        expect(resolved.lastLevelResult?.perfect).toBe(false);
        expect(resolved.lastLevelResult?.mistakes).toBe(1);
        expect(resolved.lastLevelResult?.clearLifeReason).toBe('clean');
        expect(resolved.lastLevelResult?.clearLifeGained).toBe(1);
    });

    it('grants combo shards on every second streak and guards on every fourth streak', () => {
        const tiles: Tile[] = [
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A'),
            createTile('b1', 'B', 'B'),
            createTile('b2', 'B', 'B')
        ];

        const atStreakTwo = {
            ...createRun(tiles),
            lives: 3,
            stats: {
                ...createRun(tiles).stats,
                tries: 1,
                currentStreak: 1,
                comboShards: 0
            }
        };
        const resolvedAtTwo = resolveBoardTurn(flipTile(flipTile(atStreakTwo, 'a1'), 'a2'));

        expect(resolvedAtTwo.status).toBe('playing');
        expect(resolvedAtTwo.lives).toBe(3);
        expect(resolvedAtTwo.stats.currentStreak).toBe(2);
        expect(resolvedAtTwo.stats.comboShards).toBe(1);
        expect(resolvedAtTwo.stats.guardTokens).toBe(0);

        const atStreakFour = {
            ...createRun(tiles),
            lives: 3,
            stats: {
                ...createRun(tiles).stats,
                tries: 1,
                currentStreak: 3,
                guardTokens: 0,
                comboShards: 1
            }
        };
        const resolvedAtFour = resolveBoardTurn(flipTile(flipTile(atStreakFour, 'a1'), 'a2'));

        expect(resolvedAtFour.status).toBe('playing');
        expect(resolvedAtFour.lives).toBe(3);
        expect(resolvedAtFour.stats.currentStreak).toBe(4);
        expect(resolvedAtFour.stats.guardTokens).toBe(1);
        expect(resolvedAtFour.stats.comboShards).toBe(2);
    });

    it('converts the third combo shard into a life and keeps the old 8-streak heal', () => {
        const tiles: Tile[] = [
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A'),
            createTile('b1', 'B', 'B'),
            createTile('b2', 'B', 'B')
        ];

        const atThirdShard = {
            ...createRun(tiles),
            lives: 3,
            stats: {
                ...createRun(tiles).stats,
                tries: 1,
                currentStreak: 5,
                comboShards: 2
            }
        };
        const resolvedAtThirdShard = resolveBoardTurn(flipTile(flipTile(atThirdShard, 'a1'), 'a2'));

        expect(resolvedAtThirdShard.status).toBe('playing');
        expect(resolvedAtThirdShard.lives).toBe(4);
        expect(resolvedAtThirdShard.stats.currentStreak).toBe(6);
        expect(resolvedAtThirdShard.stats.comboShards).toBe(0);

        const atStreakEight = {
            ...createRun(tiles),
            lives: 4,
            stats: {
                ...createRun(tiles).stats,
                tries: 1,
                currentStreak: 7,
                guardTokens: 1,
                comboShards: 2
            }
        };
        const resolvedAtEight = resolveBoardTurn(flipTile(flipTile(atStreakEight, 'a1'), 'a2'));

        expect(resolvedAtEight.status).toBe('playing');
        expect(resolvedAtEight.lives).toBe(5);
        expect(resolvedAtEight.stats.currentStreak).toBe(8);
        expect(resolvedAtEight.stats.guardTokens).toBe(2);
        expect(resolvedAtEight.stats.comboShards).toBe(0);
    });

    it('caps stored shards and other sustain rewards at their max values', () => {
        const tiles: Tile[] = [
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A'),
            createTile('b1', 'B', 'B'),
            createTile('b2', 'B', 'B')
        ];
        const shardCapped = {
            ...createRun(tiles),
            lives: 5,
            stats: {
                ...createRun(tiles).stats,
                tries: 1,
                currentStreak: 1,
                comboShards: 2
            }
        };
        const resolvedShardCap = resolveBoardTurn(flipTile(flipTile(shardCapped, 'a1'), 'a2'));

        expect(resolvedShardCap.status).toBe('playing');
        expect(resolvedShardCap.lives).toBe(5);
        expect(resolvedShardCap.stats.currentStreak).toBe(2);
        expect(resolvedShardCap.stats.comboShards).toBe(2);

        const started = {
            ...createRun(tiles),
            lives: 5,
            stats: {
                ...createRun(tiles).stats,
                tries: 1,
                currentStreak: 15,
                guardTokens: 2,
                comboShards: 2
            }
        };
        const resolved = resolveBoardTurn(flipTile(flipTile(started, 'a1'), 'a2'));

        expect(resolved.status).toBe('playing');
        expect(resolved.lives).toBe(5);
        expect(resolved.stats.currentStreak).toBe(16);
        expect(resolved.stats.guardTokens).toBe(2);
        expect(resolved.stats.comboShards).toBe(2);
    });

    it('advances to the next level in memorize phase, resets floor state, and preserves banked sustain', () => {
        const finishedLevel = {
            ...createNewRun(250, { gameMode: 'puzzle' }),
            status: 'levelComplete' as const,
            stats: {
                ...createNewRun(250, { gameMode: 'puzzle' }).stats,
                tries: 4,
                totalScore: 300,
                currentLevelScore: 145,
                currentStreak: 3,
                bestStreak: 3,
                perfectClears: 1,
                highestLevel: 1,
                guardTokens: 2,
                comboShards: 2
            },
            timerState: {
                memorizeRemainingMs: null,
                resolveRemainingMs: null,
                debugRevealRemainingMs: null,
                pausedFromStatus: null
            }
        };
        const nextRun = advanceToNextLevel(finishedLevel);

        expect(nextRun.status).toBe('memorize');
        expect(nextRun.board?.level).toBe(2);
        expect(nextRun.stats.tries).toBe(0);
        expect(nextRun.stats.currentLevelScore).toBe(0);
        expect(nextRun.stats.currentStreak).toBe(0);
        expect(nextRun.stats.guardTokens).toBe(2);
        expect(nextRun.stats.comboShards).toBe(2);
        expect(nextRun.stats.totalScore).toBe(300);
        expect(nextRun.timerState.memorizeRemainingMs).toBe(1300);
        expect(nextRun.shuffleCharges).toBe(1);
        expect(nextRun.pinnedTileIds).toEqual([]);
    });

    it('grants destroy charge on clean clear when advancing and respects cap', () => {
        const base = {
            ...createNewRun(0),
            status: 'levelComplete' as const,
            board: buildBoard(1),
            destroyPairCharges: 0,
            lastLevelResult: {
                level: 1,
                scoreGained: 100,
                rating: 'S' as const,
                livesRemaining: 4,
                perfect: false,
                mistakes: 1,
                clearLifeReason: 'clean' as const,
                clearLifeGained: 0
            }
        };
        expect(advanceToNextLevel(base).destroyPairCharges).toBe(1);

        const dirty = { ...base, lastLevelResult: { ...base.lastLevelResult!, mistakes: 2 } };
        expect(advanceToNextLevel(dirty).destroyPairCharges).toBe(0);

        const capped = {
            ...base,
            destroyPairCharges: MAX_DESTROY_PAIR_BANK,
            lastLevelResult: { ...base.lastLevelResult!, mistakes: 0 }
        };
        expect(advanceToNextLevel(capped).destroyPairCharges).toBe(MAX_DESTROY_PAIR_BANK);
    });

    it('can disable achievements when debug reveal is used', () => {
        const run = enableDebugPeek(finishMemorizePhase(createNewRun(0)), true);

        expect(run.debugPeekActive).toBe(true);
        expect(run.debugUsed).toBe(true);
        expect(run.achievementsEnabled).toBe(false);
        expect(run.timerState.debugRevealRemainingMs).toBeGreaterThan(0);
    });
});

describe('board powers', () => {
    it('counts fully hidden pairs', () => {
        const tiles: Tile[] = [
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A'),
            createTile('b1', 'B', 'B'),
            createTile('b2', 'B', 'B')
        ];
        expect(countFullyHiddenPairs(createBoard(tiles))).toBe(2);

        const oneFlipped = createBoard(
            tiles.map((t) => (t.id === 'a1' ? { ...t, state: 'flipped' as const } : t))
        );
        expect(countFullyHiddenPairs(oneFlipped)).toBe(1);
    });

    it('shuffles only hidden tiles, spends charge, clears pins, and flags powers used', () => {
        const tiles: Tile[] = [
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A'),
            createTile('b1', 'B', 'B'),
            createTile('b2', 'B', 'B'),
            createTile('c1', 'C', 'C'),
            createTile('c2', 'C', 'C')
        ];
        const matchedBoard: BoardState = {
            ...createBoard(tiles),
            matchedPairs: 1,
            tiles: tiles.map((t) => (t.pairKey === 'A' ? { ...t, state: 'matched' as const } : t))
        };
        const run = {
            ...createRun(tiles),
            board: matchedBoard,
            pinnedTileIds: ['b1']
        };
        const beforeHidden = run.board.tiles.filter((t) => t.state === 'hidden').map((t) => t.id);
        const shuffled = applyShuffle(run);
        expect(shuffled.shuffleCharges).toBe(0);
        expect(shuffled.powersUsedThisRun).toBe(true);
        expect(shuffled.pinnedTileIds).toEqual([]);
        expect(shuffled.stats.shufflesUsed).toBe(1);
        const afterHidden = shuffled.board!.tiles.filter((t) => t.state === 'hidden').map((t) => t.id);
        expect(new Set(afterHidden)).toEqual(new Set(beforeHidden));
        const matchedIds = shuffled.board!.tiles.filter((t) => t.state === 'matched').map((t) => t.id);
        expect(matchedIds.sort()).toEqual(['a1', 'a2'].sort());
    });

    it('does not shuffle with one fully hidden pair or zero charges', () => {
        const tiles: Tile[] = [
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A')
        ];
        const run = createRun(tiles);
        expect(applyShuffle(run)).toBe(run);
        expect(canShuffleBoard({ ...run, shuffleCharges: 0 })).toBe(false);
    });

    it('toggles pins up to cap', () => {
        const tiles: Tile[] = [
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A'),
            createTile('b1', 'B', 'B'),
            createTile('b2', 'B', 'B')
        ];
        let run = createRun(tiles);
        run = togglePinnedTile(run, 'a1');
        expect(run.pinnedTileIds).toEqual(['a1']);
        run = togglePinnedTile(run, 'b1');
        run = togglePinnedTile(run, 'a2');
        expect(run.pinnedTileIds).toHaveLength(3);
        const before = run.pinnedTileIds;
        run = togglePinnedTile(run, 'b2');
        expect(run.pinnedTileIds).toEqual(before);
        run = togglePinnedTile(run, 'a1');
        expect(run.pinnedTileIds).not.toContain('a1');
    });

    it('destroy pair does not add score or streak and can clear the floor', () => {
        const tiles: Tile[] = [
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A'),
            createTile('b1', 'B', 'B'),
            createTile('b2', 'B', 'B')
        ];
        const run = {
            ...createRun(tiles),
            destroyPairCharges: 1,
            stats: {
                ...createRun(tiles).stats,
                currentStreak: 4,
                totalScore: 100,
                currentLevelScore: 50
            }
        };
        const after = applyDestroyPair(run, 'a1');
        expect(after.stats.totalScore).toBe(100);
        expect(after.stats.currentLevelScore).toBe(50);
        expect(after.stats.currentStreak).toBe(4);
        expect(after.stats.matchesFound).toBe(1);
        expect(after.stats.pairsDestroyed).toBe(1);
        expect(after.destroyPairCharges).toBe(0);
        expect(after.powersUsedThisRun).toBe(true);
        expect(after.status).toBe('playing');

        const lastPairRun = {
            ...createRun(tiles),
            board: {
                ...createRun(tiles).board!,
                matchedPairs: 1,
                tiles: tiles.map((t) => (t.pairKey === 'A' ? { ...t, state: 'matched' as const } : t))
            },
            destroyPairCharges: 1
        };
        const cleared = applyDestroyPair(lastPairRun, 'b1');
        expect(cleared.status).toBe('levelComplete');
        expect(cleared.lastLevelResult?.level).toBe(1);
    });

    describe('findables_floor', () => {
        it('assigns findables only to real pairs with even tile count and at most two pairs', () => {
            const board = buildBoard(2, {
                activeMutators: ['findables_floor'],
                runSeed: 90210,
                runRulesVersion: GAME_RULES_VERSION
            });
            const tagged = board.tiles.filter((t) => t.findableKind != null);
            expect(tagged.length % 2).toBe(0);
            expect(tagged.length).toBeLessThanOrEqual(4);
            const keys = new Set(tagged.map((t) => t.pairKey));
            expect(keys.size * 2).toBe(tagged.length);
            expect(tagged.every((t) => t.pairKey !== '__decoy__' && t.pairKey !== '__wild__')).toBe(true);
        });

        it('produces identical findable placement for the same seed and rules', () => {
            const opts = {
                activeMutators: ['findables_floor'] as MutatorId[],
                runSeed: 4242,
                runRulesVersion: GAME_RULES_VERSION
            };
            const a = buildBoard(3, opts);
            const b = buildBoard(3, opts);
            expect(a.tiles.map((t) => [t.id, t.findableKind])).toEqual(b.tiles.map((t) => [t.id, t.findableKind]));
        });

        it('claims findable score and counter on match and clears carrier flags', () => {
            const tiles: Tile[] = [
                { ...createTile('a1', 'A', 'A'), findableKind: 'shard_spark' },
                { ...createTile('a2', 'A', 'A'), findableKind: 'shard_spark' },
                createTile('b1', 'B', 'B'),
                createTile('b2', 'B', 'B')
            ];
            const started = { ...createRun(tiles), findablesClaimedThisFloor: 0 };
            const resolved = resolveBoardTurn(flipTile(flipTile(started, 'a1'), 'a2'));
            const base = calculateMatchScore(1, 1, 1);
            expect(resolved.stats.totalScore).toBe(base + FINDABLE_MATCH_SCORE.shard_spark);
            expect(resolved.findablesClaimedThisFloor).toBe(1);
            expect(
                resolved.board?.tiles.filter((t) => t.pairKey === 'A').every((t) => t.findableKind === undefined)
            ).toBe(true);
        });

        it('forfeits findable on destroy without score or claim counter', () => {
            const tiles: Tile[] = [
                { ...createTile('a1', 'A', 'A'), findableKind: 'shard_spark' },
                { ...createTile('a2', 'A', 'A'), findableKind: 'shard_spark' },
                createTile('b1', 'B', 'B'),
                createTile('b2', 'B', 'B')
            ];
            const run = { ...createRun(tiles), destroyPairCharges: 1, findablesClaimedThisFloor: 0 };
            const after = applyDestroyPair(run, 'a1');
            expect(after.findablesClaimedThisFloor).toBe(0);
            expect(after.stats.totalScore).toBe(0);
            expect(after.board?.tiles.filter((t) => t.pairKey === 'A').every((t) => t.findableKind === undefined)).toBe(
                true
            );
        });

        it('preserves findableKind on tile ids through shuffle', () => {
            const tiles: Tile[] = [
                { ...createTile('a1', 'A', 'A'), findableKind: 'score_glint' },
                { ...createTile('a2', 'A', 'A'), findableKind: 'score_glint' },
                createTile('b1', 'B', 'B'),
                createTile('b2', 'B', 'B')
            ];
            const run = { ...createRun(tiles), shuffleCharges: 1, shuffleNonce: 0 };
            const carrierId = run.board!.tiles.find((t) => t.findableKind != null)!.id;
            const before = run.board!.tiles.find((t) => t.id === carrierId)!.findableKind;
            const shuffled = applyShuffle(run);
            expect(shuffled.board!.tiles.find((t) => t.id === carrierId)!.findableKind).toBe(before);
        });

        it('resets findablesClaimedThisFloor on advanceToNextLevel', () => {
            const tiles: Tile[] = [createTile('a1', 'A', 'A'), createTile('a2', 'A', 'A')];
            const finishedLevel = {
                ...createRun(tiles),
                findablesClaimedThisFloor: 2,
                status: 'levelComplete' as const,
                board: {
                    ...createRun(tiles).board!,
                    matchedPairs: 1,
                    flippedTileIds: [],
                    tiles: tiles.map((t) => ({ ...t, state: 'matched' as const }))
                }
            };
            const next = advanceToNextLevel(finishedLevel);
            expect(next.findablesClaimedThisFloor).toBe(0);
        });
    });

    describe('shifting_spotlight', () => {
        const twoPairTiles: Tile[] = [
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A'),
            createTile('b1', 'B', 'B'),
            createTile('b2', 'B', 'B')
        ];

        it('seeds ward and bounty keys on buildBoard when mutator is active', () => {
            const board = buildBoard(2, {
                activeMutators: ['shifting_spotlight'] as MutatorId[],
                runSeed: 31415,
                runRulesVersion: GAME_RULES_VERSION
            });
            expect(board.bountyPairKey != null || board.wardPairKey != null).toBe(true);
            if (board.wardPairKey && board.bountyPairKey) {
                expect(board.wardPairKey).not.toBe(board.bountyPairKey);
            }
        });

        it('adds bounty bonus when the matched pair is the current bounty', () => {
            const brd = {
                ...createBoard(twoPairTiles),
                wardPairKey: 'B' as const,
                bountyPairKey: 'A' as const
            };
            const started: RunState = {
                ...createRun(twoPairTiles),
                board: brd,
                activeMutators: ['shifting_spotlight'] as MutatorId[],
                shiftingSpotlightNonce: 0
            };
            const resolved = resolveBoardTurn(flipTile(flipTile(started, 'a1'), 'a2'));
            const base = calculateMatchScore(1, 1, 1);
            expect(resolved.stats.totalScore).toBe(base + SHIFTING_BOUNTY_MATCH_BONUS);
            expect(resolved.shiftingSpotlightNonce).toBe(1);
        });

        it('applies ward penalty when the matched pair is the current ward', () => {
            const brd = {
                ...createBoard(twoPairTiles),
                wardPairKey: 'A' as const,
                bountyPairKey: 'B' as const
            };
            const started: RunState = {
                ...createRun(twoPairTiles),
                board: brd,
                activeMutators: ['shifting_spotlight'] as MutatorId[],
                shiftingSpotlightNonce: 0
            };
            const resolved = resolveBoardTurn(flipTile(flipTile(started, 'a1'), 'a2'));
            expect(resolved.stats.totalScore).toBe(
                Math.max(0, calculateMatchScore(1, 1, 1) - SHIFTING_WARD_MATCH_PENALTY)
            );
        });

        it('rotates and bumps nonce on mismatch', () => {
            const brd = {
                ...createBoard(twoPairTiles),
                wardPairKey: 'A' as const,
                bountyPairKey: 'B' as const
            };
            const started: RunState = {
                ...createRun(twoPairTiles),
                board: brd,
                activeMutators: ['shifting_spotlight'] as MutatorId[],
                shiftingSpotlightNonce: 0
            };
            const out = resolveBoardTurn(flipTile(flipTile(started, 'a1'), 'b1'));
            expect(out.shiftingSpotlightNonce).toBe(1);
        });

        it('resets shiftingSpotlightNonce on advanceToNextLevel', () => {
            const tiles = [createTile('a1', 'A', 'A'), createTile('a2', 'A', 'A')];
            const finishedLevel: RunState = {
                ...createRun(tiles),
                shiftingSpotlightNonce: 12,
                status: 'levelComplete',
                board: {
                    ...createRun(tiles).board!,
                    matchedPairs: 1,
                    flippedTileIds: [],
                    tiles: tiles.map((t) => ({ ...t, state: 'matched' as const }))
                }
            };
            expect(advanceToNextLevel(finishedLevel).shiftingSpotlightNonce).toBe(0);
        });
    });
});

describe('gambit third flip', () => {
    const twoPairTiles: Tile[] = [
        createTile('a1', 'p1', 'A'),
        createTile('a2', 'p1', 'A'),
        createTile('b1', 'p2', 'B'),
        createTile('b2', 'p2', 'B')
    ];

    it('resolves a match when the third flip completes a pair after a mismatch', () => {
        let run = createRun(twoPairTiles);
        run = flipTile(run, 'a1');
        run = flipTile(run, 'b1');
        expect(run.board!.flippedTileIds).toHaveLength(2);
        run = flipTile(run, 'a2');
        expect(run.status).toBe('resolving');
        expect(run.board!.flippedTileIds).toHaveLength(3);
        const resolved = resolveBoardTurn(run);
        expect(resolved.gambitThirdFlipUsed).toBe(true);
        expect(resolved.gambitAvailableThisFloor).toBe(false);
        expect(resolved.board!.matchedPairs).toBe(1);
        expect(resolved.board!.tiles.find((t) => t.id === 'b1')?.state).toBe('hidden');
        expect(resolved.status).toBe('playing');
    });

    it('gambit miss forces game over when maxMismatches would be exceeded', () => {
        const threePairTiles: Tile[] = [
            createTile('a1', 'p1', 'A'),
            createTile('a2', 'p1', 'A'),
            createTile('b1', 'p2', 'B'),
            createTile('b2', 'p2', 'B'),
            createTile('c1', 'p3', 'C'),
            createTile('c2', 'p3', 'C')
        ];
        const base = createRun(threePairTiles);
        let run: RunState = {
            ...base,
            activeContract: { noShuffle: false, noDestroy: false, maxMismatches: 1 },
            stats: { ...base.stats, tries: 1 }
        };
        run = flipTile(run, 'a1');
        run = flipTile(run, 'b1');
        run = flipTile(run, 'c1');
        expect(run.board!.flippedTileIds).toHaveLength(3);
        const resolved = resolveBoardTurn(run);
        expect(resolved.gambitThirdFlipUsed).toBe(true);
        expect(resolved.status).toBe('gameOver');
        expect(resolved.stats.tries).toBe(2);
    });

    it('gambit miss forces game over when maxMismatches is 0 and floor tries are still zero', () => {
        const threePairTiles: Tile[] = [
            createTile('a1', 'p1', 'A'),
            createTile('a2', 'p1', 'A'),
            createTile('b1', 'p2', 'B'),
            createTile('b2', 'p2', 'B'),
            createTile('c1', 'p3', 'C'),
            createTile('c2', 'p3', 'C')
        ];
        const base = createRun(threePairTiles);
        let run: RunState = {
            ...base,
            activeContract: { noShuffle: false, noDestroy: false, maxMismatches: 0 },
            stats: { ...base.stats, tries: 0 }
        };
        run = flipTile(run, 'a1');
        run = flipTile(run, 'b1');
        run = flipTile(run, 'c1');
        const resolved = resolveBoardTurn(run);
        expect(resolved.gambitThirdFlipUsed).toBe(true);
        expect(resolved.status).toBe('gameOver');
        expect(resolved.stats.tries).toBe(1);
    });
});

describe('wild run with scholar-style contracts', () => {
    it('noDestroy blocks destroy on a real wild board', () => {
        const wild = finishMemorizePhase(createWildRun(0));
        expect(wild.board).not.toBeNull();
        const target = wild.board!.tiles.find(
            (t) => t.state === 'hidden' && t.pairKey !== WILD_PAIR_KEY && t.pairKey !== '__decoy__'
        );
        expect(target).toBeDefined();
        const run: RunState = {
            ...wild,
            status: 'playing',
            activeContract: { noShuffle: false, noDestroy: true, maxMismatches: null },
            destroyPairCharges: 1
        };
        expect(applyDestroyPair(run, target!.id)).toBe(run);
    });

    it('noShuffle blocks full-board shuffle on a real wild run', () => {
        let wild = finishMemorizePhase(createWildRun(0));
        wild = {
            ...wild,
            status: 'playing',
            shuffleCharges: 1,
            activeContract: { noShuffle: true, noDestroy: false, maxMismatches: null }
        };
        expect(canShuffleBoard(wild)).toBe(false);
        expect(applyShuffle(wild)).toBe(wild);
    });
});

describe('active contract limits', () => {
    const fourPairTiles: Tile[] = [
        createTile('a1', 'A', 'A'),
        createTile('a2', 'A', 'A'),
        createTile('b1', 'B', 'B'),
        createTile('b2', 'B', 'B')
    ];

    it('ends the run when mismatches exceed maxMismatches', () => {
        const run: RunState = {
            ...createRun(fourPairTiles),
            activeContract: { noShuffle: false, noDestroy: false, maxMismatches: 0 }
        };
        const mismatching = resolveBoardTurn(flipTile(flipTile(run, 'a1'), 'b1'));
        expect(mismatching.status).toBe('gameOver');
    });

    it('blocks shuffle when contract sets noShuffle', () => {
        const run: RunState = {
            ...createRun(fourPairTiles),
            shuffleCharges: 1,
            activeContract: { noShuffle: true, noDestroy: false, maxMismatches: null }
        };
        expect(canShuffleBoard(run)).toBe(false);
        expect(applyShuffle(run)).toBe(run);
    });

    it('blocks destroy when contract sets noDestroy', () => {
        const run: RunState = {
            ...createRun(fourPairTiles),
            destroyPairCharges: 1,
            activeContract: { noShuffle: false, noDestroy: true, maxMismatches: null }
        };
        expect(applyDestroyPair(run, 'a1')).toBe(run);
    });

    it('respects maxPinsTotalRun when adding new pins', () => {
        let run: RunState = {
            ...createRun(fourPairTiles),
            activeContract: { noShuffle: false, noDestroy: false, maxMismatches: null, maxPinsTotalRun: 1 }
        };
        run = togglePinnedTile(run, 'a1');
        expect(run.pinnedTileIds).toEqual(['a1']);
        expect(run.pinsPlacedCountThisRun).toBe(1);
        const capped = togglePinnedTile(run, 'b1');
        expect(capped.pinnedTileIds).toEqual(['a1']);
        expect(capped.pinsPlacedCountThisRun).toBe(1);
    });

    it('respects maxPinsTotalRun when adding new pins with presentation mutators active', () => {
        let run: RunState = {
            ...createRun(fourPairTiles),
            activeMutators: ['wide_recall'] as MutatorId[],
            activeContract: { noShuffle: false, noDestroy: false, maxMismatches: null, maxPinsTotalRun: 1 }
        };
        run = togglePinnedTile(run, 'a1');
        expect(run.pinnedTileIds).toEqual(['a1']);
        expect(run.pinsPlacedCountThisRun).toBe(1);
        const capped = togglePinnedTile(run, 'b1');
        expect(capped.pinnedTileIds).toEqual(['a1']);
        expect(capped.pinsPlacedCountThisRun).toBe(1);
    });

    it('ends the run on the second mismatch when maxMismatches is 1 while presentation mutators are active', () => {
        const sixTiles: Tile[] = [
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A'),
            createTile('b1', 'B', 'B'),
            createTile('b2', 'B', 'B'),
            createTile('c1', 'C', 'C'),
            createTile('c2', 'C', 'C')
        ];
        const run: RunState = {
            ...createRun(sixTiles),
            activeMutators: ['wide_recall', 'silhouette_twist'] as MutatorId[],
            activeContract: { noShuffle: false, noDestroy: false, maxMismatches: 1 }
        };
        const afterFirstMiss = resolveBoardTurn(flipTile(flipTile(run, 'a1'), 'b1'));
        expect(afterFirstMiss.status).toBe('playing');
        expect(afterFirstMiss.stats.tries).toBe(1);
        const afterSecondMiss = resolveBoardTurn(flipTile(flipTile(afterFirstMiss, 'a2'), 'c1'));
        expect(afterSecondMiss.status).toBe('gameOver');
    });

    it('still applies presentation match penalty when a contract is active', () => {
        const run: RunState = {
            ...createRun([
                createTile('a1', 'A', 'A'),
                createTile('a2', 'A', 'A'),
                createTile('b1', 'B', 'B'),
                createTile('b2', 'B', 'B')
            ]),
            activeMutators: ['distraction_channel'] as MutatorId[],
            activeContract: { noShuffle: true, noDestroy: true, maxMismatches: null }
        };
        const penalty = getPresentationMutatorMatchPenalty(run);
        expect(penalty).toBe(2);
        const resolved = resolveBoardTurn(flipTile(flipTile(run, 'a1'), 'a2'));
        const base = calculateMatchScore(1, 1, 1);
        expect(resolved.stats.totalScore).toBe(Math.max(0, base - penalty));
    });

    it('blocks shuffle under noShuffle with presentation mutators active', () => {
        const run: RunState = {
            ...createRun(fourPairTiles),
            shuffleCharges: 1,
            activeMutators: ['wide_recall', 'distraction_channel'] as MutatorId[],
            activeContract: { noShuffle: true, noDestroy: false, maxMismatches: null }
        };
        expect(canShuffleBoard(run)).toBe(false);
        expect(applyShuffle(run)).toBe(run);
    });

    it('blocks destroy under noDestroy with presentation mutators active', () => {
        const run: RunState = {
            ...createRun(fourPairTiles),
            destroyPairCharges: 1,
            activeMutators: ['wide_recall', 'distraction_channel'] as MutatorId[],
            activeContract: { noShuffle: false, noDestroy: true, maxMismatches: null }
        };
        expect(applyDestroyPair(run, 'a1')).toBe(run);
    });

    it('allows shuffle when contract only blocks destroy with presentation mutators active', () => {
        const run: RunState = {
            ...createRun(fourPairTiles),
            shuffleCharges: 1,
            activeMutators: ['silhouette_twist'] as MutatorId[],
            activeContract: { noShuffle: false, noDestroy: true, maxMismatches: null }
        };
        expect(canShuffleBoard(run)).toBe(true);
        const shuffled = applyShuffle(run);
        expect(shuffled).not.toBe(run);
        expect(shuffled.shuffleNonce).toBe(run.shuffleNonce + 1);
    });

    it('blocks region shuffle under noShuffle with presentation mutators active', () => {
        const run: RunState = {
            ...createRun(fourPairTiles),
            activeMutators: ['wide_recall'] as MutatorId[],
            activeContract: { noShuffle: true, noDestroy: false, maxMismatches: null }
        };
        expect(canRegionShuffle(run)).toBe(false);
        expect(applyRegionShuffle(run, 0)).toBe(run);
    });

    it('allows region shuffle when contract only blocks destroy with presentation mutators active', () => {
        const run: RunState = {
            ...createRun(fourPairTiles),
            activeMutators: ['distraction_channel'] as MutatorId[],
            activeContract: { noShuffle: false, noDestroy: true, maxMismatches: null }
        };
        expect(canRegionShuffle(run)).toBe(true);
        expect(canRegionShuffleRow(run, 0)).toBe(true);
        const shuffled = applyRegionShuffle(run, 0);
        expect(shuffled).not.toBe(run);
        expect(shuffled.shuffleNonce).toBe(run.shuffleNonce + 1);
    });

    it('noShuffle overrides extra_shuffle_charge with presentation mutators active', () => {
        const memorized = finishMemorizePhase(
            createNewRun(0, {
                gameMode: 'puzzle',
                initialRelicIds: ['extra_shuffle_charge'],
                activeMutators: ['silhouette_twist'] as MutatorId[]
            })
        );
        expect(memorized.shuffleCharges).toBe(2);
        const run: RunState = {
            ...memorized,
            board: createBoard(fourPairTiles),
            activeContract: { noShuffle: true, noDestroy: false, maxMismatches: null }
        };
        expect(canShuffleBoard(run)).toBe(false);
        expect(canRegionShuffle(run)).toBe(false);
        expect(applyShuffle(run)).toBe(run);
        expect(applyRegionShuffle(run, 0)).toBe(run);
    });

    it('noShuffle overrides first_shuffle_free_per_floor with presentation mutators active', () => {
        const memorized = finishMemorizePhase(
            createNewRun(0, {
                gameMode: 'puzzle',
                initialRelicIds: ['first_shuffle_free_per_floor'],
                activeMutators: ['wide_recall'] as MutatorId[]
            })
        );
        expect(memorized.freeShuffleThisFloor).toBe(true);
        const run: RunState = {
            ...memorized,
            board: createBoard(fourPairTiles),
            shuffleCharges: 0,
            activeContract: { noShuffle: true, noDestroy: false, maxMismatches: null }
        };
        expect(canShuffleBoard(run)).toBe(false);
        expect(canRegionShuffle(run)).toBe(false);
        expect(applyShuffle(run)).toBe(run);
        expect(applyRegionShuffle(run, 0)).toBe(run);
    });

    it('noShuffle overrides region_shuffle_free_first with presentation mutators active', () => {
        const memorized = finishMemorizePhase(
            createNewRun(0, {
                gameMode: 'puzzle',
                initialRelicIds: ['region_shuffle_free_first'],
                activeMutators: ['distraction_channel'] as MutatorId[]
            })
        );
        expect(memorized.regionShuffleFreeThisFloor).toBe(true);
        expect(memorized.relicIds).toContain('region_shuffle_free_first');
        const run: RunState = {
            ...memorized,
            board: createBoard(fourPairTiles),
            regionShuffleCharges: 0,
            activeContract: { noShuffle: true, noDestroy: false, maxMismatches: null }
        };
        expect(canShuffleBoard(run)).toBe(false);
        expect(canRegionShuffle(run)).toBe(false);
        expect(applyRegionShuffle(run, 0)).toBe(run);
    });

    it('noDestroy overrides destroy_bank_plus_one with presentation mutators active', () => {
        const memorized = finishMemorizePhase(
            createNewRun(0, {
                gameMode: 'puzzle',
                initialRelicIds: ['destroy_bank_plus_one'],
                activeMutators: ['wide_recall'] as MutatorId[]
            })
        );
        expect(memorized.destroyPairCharges).toBeGreaterThanOrEqual(1);
        const run: RunState = {
            ...memorized,
            board: createBoard(fourPairTiles),
            activeContract: { noShuffle: false, noDestroy: true, maxMismatches: null }
        };
        expect(applyDestroyPair(run, 'a1')).toBe(run);
    });

    it('noShuffle and noDestroy block shuffle region destroy with relic economy and presentation mutators active', () => {
        const memorized = finishMemorizePhase(
            createNewRun(0, {
                gameMode: 'puzzle',
                initialRelicIds: ['extra_shuffle_charge', 'destroy_bank_plus_one'],
                activeMutators: ['wide_recall', 'distraction_channel'] as MutatorId[]
            })
        );
        expect(memorized.shuffleCharges).toBeGreaterThanOrEqual(2);
        expect(memorized.destroyPairCharges).toBeGreaterThanOrEqual(1);
        const run: RunState = {
            ...memorized,
            board: createBoard(fourPairTiles),
            activeContract: { noShuffle: true, noDestroy: true, maxMismatches: null }
        };
        expect(canShuffleBoard(run)).toBe(false);
        expect(canRegionShuffle(run)).toBe(false);
        expect(applyShuffle(run)).toBe(run);
        expect(applyRegionShuffle(run, 0)).toBe(run);
        expect(applyDestroyPair(run, 'a1')).toBe(run);
    });

    it.each([
        [false, false],
        [false, true],
        [true, false],
        [true, true]
    ])('contract matrix noShuffle=%s noDestroy=%s gates shuffle and destroy', (noShuffle, noDestroy) => {
        const run: RunState = {
            ...createRun(fourPairTiles),
            shuffleCharges: 1,
            destroyPairCharges: 1,
            activeContract: { noShuffle, noDestroy, maxMismatches: null }
        };
        expect(canShuffleBoard(run)).toBe(!noShuffle);
        if (noDestroy) {
            expect(applyDestroyPair(run, 'a1')).toBe(run);
        } else {
            expect(applyDestroyPair(run, 'a1')).not.toBe(run);
        }
    });
});

describe('relic and mutator stacking', () => {
    it('extends memorize under short_memorize when memorize_under_short_memorize relic is owned', () => {
        const withRelic = createNewRun(0, {
            gameMode: 'puzzle',
            activeMutators: ['short_memorize'],
            initialRelicIds: ['memorize_under_short_memorize']
        });
        const withoutRelic = createNewRun(0, {
            gameMode: 'puzzle',
            activeMutators: ['short_memorize']
        });
        expect(getMemorizeDurationForRun(withRelic, 1)).toBe(getMemorizeDurationForRun(withoutRelic, 1) + 220);
        expect(getMemorizeDurationForRun(withoutRelic, 1)).toBe(getMemorizeDuration(1) - 350);
    });

    it('stacks memorize_bonus_ms with short_memorize', () => {
        const run = createNewRun(0, {
            gameMode: 'puzzle',
            activeMutators: ['short_memorize'],
            initialRelicIds: ['memorize_bonus_ms']
        });
        expect(getMemorizeDurationForRun(run, 1)).toBe(getMemorizeDuration(1) - 350 + 280);
    });
});

describe('gauntlet deadline', () => {
    it('reports expired when deadline is in the past', () => {
        const run: RunState = {
            ...createNewRun(0, { gameMode: 'puzzle' }),
            gameMode: 'gauntlet',
            gauntletDeadlineMs: Date.now() - 1
        };
        expect(isGauntletExpired(run)).toBe(true);
    });

    it('reports not expired when deadline is in the future', () => {
        const run: RunState = {
            ...createNewRun(0, { gameMode: 'puzzle' }),
            gameMode: 'gauntlet',
            gauntletDeadlineMs: Date.now() + 86_400_000
        };
        expect(isGauntletExpired(run)).toBe(false);
    });
});
