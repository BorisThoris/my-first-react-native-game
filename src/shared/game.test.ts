import { describe, expect, it } from 'vitest';
import type { BoardState, MutatorId, RunState, Tile } from './contracts';
import {
    ENDLESS_RISK_WAGER_BONUS_FAVOR,
    ENDLESS_RISK_WAGER_MIN_STREAK,
    FEATURED_OBJECTIVE_STREAK_BONUS_PER_STEP,
    FINDABLE_MATCH_COMBO_SHARDS,
    FINDABLE_MATCH_SCORE,
    FLIP_PAR_BONUS_SCORE,
    GAME_RULES_VERSION,
    MATCH_DELAY_MS,
    MAX_DESTROY_PAIR_BANK,
    SHIFTING_BOUNTY_MATCH_BONUS,
    SHIFTING_WARD_MATCH_PENALTY
} from './contracts';
import {
    acceptEndlessRiskWager,
    advanceToNextLevel,
    applyDestroyPair,
    applyFlashPair,
    applyRegionShuffle,
    applyShuffle,
    buildBoard,
    calculateMatchScore,
    collectDestroyEligibleTileIds,
    collectPeekEligibleTileIds,
    canOfferEndlessRiskWager,
    canRegionShuffle,
    canRegionShuffleRow,
    canShuffleBoard,
    computeRelicOfferPickBudget,
    completeRelicPickAndAdvance,
    countFullyHiddenPairs,
    createDailyRun,
    createNewRun,
    createWildRun,
    enableDebugPeek,
    finishMemorizePhase,
    countFindablePairs,
    flipTile,
    getMatchFloaterAnchorTileIds,
    getMemorizeDuration,
    getMemorizeDurationForRun,
    getMismatchFloaterAnchorTileIds,
    getPresentationMutatorMatchPenalty,
    getWildTileIdFromBoard,
    grantBonusRelicPickNextOffer,
    isBoardComplete,
    isGauntletExpired,
    openRelicOffer,
    resolveBoardTurn,
    tilesArePairMatch,
    togglePinnedTile,
    tileIsDestroyEligiblePreview,
    tileIsPeekEligiblePreview,
    tileIsStrayEligiblePreview,
    WILD_PAIR_KEY
} from './game';
import { DAILY_MUTATOR_TABLE } from './mutators';

const DECOY_PAIR_KEY = '__decoy__';

const createTile = (id: string, pairKey: string, symbol: string): Tile => ({
    id,
    pairKey,
    state: 'hidden',
    symbol,
    label: symbol
});

describe('tilesArePairMatch', () => {
    it('matches two normal tiles with the same pairKey', () => {
        expect(tilesArePairMatch(createTile('a', 'p1', 'x'), createTile('b', 'p1', 'y'))).toBe(true);
    });

    it('does not match different normal pairKeys', () => {
        expect(tilesArePairMatch(createTile('a', 'p1', 'x'), createTile('b', 'p2', 'y'))).toBe(false);
    });

    it('never matches when a decoy is involved', () => {
        expect(tilesArePairMatch(createTile('a', DECOY_PAIR_KEY, 'x'), createTile('b', 'p1', 'y'))).toBe(false);
        expect(tilesArePairMatch(createTile('a', 'p1', 'x'), createTile('b', DECOY_PAIR_KEY, 'y'))).toBe(false);
    });

    it('matches wild with any non-wild real pairKey', () => {
        expect(tilesArePairMatch(createTile('w', WILD_PAIR_KEY, 'x'), createTile('b', 'p9', 'y'))).toBe(true);
        expect(tilesArePairMatch(createTile('a', 'p9', 'x'), createTile('w', WILD_PAIR_KEY, 'y'))).toBe(true);
    });

    it('matches two wild tiles (same pairKey, not decoy)', () => {
        expect(tilesArePairMatch(createTile('w1', WILD_PAIR_KEY, 'x'), createTile('w2', WILD_PAIR_KEY, 'y'))).toBe(
            true
        );
    });
});

const createBoard = (tiles: Tile[]): BoardState => ({
    level: 1,
    pairCount: tiles.length / 2,
    columns: 2,
    rows: Math.ceil(tiles.length / 2),
    tiles,
    flippedTileIds: [],
    matchedPairs: 0,
    floorArchetypeId: null,
    featuredObjectiveId: null
});

const createRun = (tiles: Tile[]): RunState => ({
    ...finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false, gameMode: 'puzzle' })),
    board: createBoard(tiles),
    findablesTotalThisFloor: countFindablePairs(tiles)
});

describe('getMatchFloaterAnchorTileIds', () => {
    it('returns null when run has no board', () => {
        expect(getMatchFloaterAnchorTileIds(null)).toBeNull();
        expect(getMatchFloaterAnchorTileIds({ board: null } as RunState)).toBeNull();
    });

    it('returns two flipped ids for a standard two-flip', () => {
        const run = createRun([createTile('a', 'p1', '1'), createTile('b', 'p1', '2')]);
        run.board!.flippedTileIds = ['a', 'b'];
        expect(getMatchFloaterAnchorTileIds(run)).toEqual({ tileIdA: 'a', tileIdB: 'b' });
    });

    it('returns first matching pair for gambit when first two tiles match', () => {
        const tiles = [createTile('a', 'p1', '1'), createTile('b', 'p1', '2'), createTile('c', 'p2', '3')];
        const run = createRun(tiles);
        run.board!.flippedTileIds = ['a', 'b', 'c'];
        expect(getMatchFloaterAnchorTileIds(run)).toEqual({ tileIdA: 'a', tileIdB: 'b' });
    });

    it('returns second+third pair when first pair does not match (CARD-008 order)', () => {
        const tiles = [createTile('a', 'p2', '1'), createTile('b', 'p1', '2'), createTile('c', 'p1', '3')];
        const run = createRun(tiles);
        run.board!.flippedTileIds = ['a', 'b', 'c'];
        expect(getMatchFloaterAnchorTileIds(run)).toEqual({ tileIdA: 'b', tileIdB: 'c' });
    });

    it('returns null when gambit has no matching pair', () => {
        const tiles = [createTile('a', 'p1', '1'), createTile('b', 'p2', '2'), createTile('c', 'p3', '3')];
        const run = createRun(tiles);
        run.board!.flippedTileIds = ['a', 'b', 'c'];
        expect(getMatchFloaterAnchorTileIds(run)).toBeNull();
    });
});

describe('getMismatchFloaterAnchorTileIds', () => {
    it('returns flip order for two tiles', () => {
        const run = createRun([createTile('a', 'p1', '1'), createTile('b', 'p1', '2')]);
        run.board!.flippedTileIds = ['b', 'a'];
        expect(getMismatchFloaterAnchorTileIds(run)).toEqual({ tileIdA: 'b', tileIdB: 'a' });
    });

    it('returns three ids in flip order for gambit miss', () => {
        const tiles = [createTile('a', 'p1', '1'), createTile('b', 'p2', '2'), createTile('c', 'p3', '3')];
        const run = createRun(tiles);
        run.board!.flippedTileIds = ['a', 'b', 'c'];
        expect(getMismatchFloaterAnchorTileIds(run)).toEqual({
            tileIdA: 'a',
            tileIdB: 'b',
            tileIdC: 'c'
        });
    });
});

const pairTileIds = (board: BoardState): string[][] => {
    const groups = new Map<string, string[]>();
    for (const tile of board.tiles) {
        if (!groups.has(tile.pairKey)) {
            groups.set(tile.pairKey, []);
        }
        groups.get(tile.pairKey)!.push(tile.id);
    }
    return [...groups.values()];
};

const clearRealPairs = (run: RunState): RunState => {
    let current = run;
    for (const ids of pairTileIds(current.board!).filter((group) => group.length === 2)) {
        current = resolveBoardTurn(flipTile(flipTile(current, ids[0]!), ids[1]!));
    }
    return current;
};

const playPerfectFloors = (run: RunState, count: number): RunState => {
    let current = finishMemorizePhase(run);
    for (let floor = 0; floor < count; floor += 1) {
        current = clearRealPairs(current);
        if (floor < count - 1) {
            current = finishMemorizePhase(advanceToNextLevel(current));
        }
    }
    return current;
};

describe('createDailyRun', () => {
    it('uses daily mode, one table mutator, and a UTC date key', () => {
        const run = createDailyRun(0);
        expect(run.gameMode).toBe('daily');
        expect(run.activeMutators).toHaveLength(1);
        expect(DAILY_MUTATOR_TABLE).toContain(run.activeMutators[0]);
        expect(run.dailyDateKeyUtc).toMatch(/^\d{8}$/);
    });
});

describe('REG-088 first-run to first-win rules path', () => {
    it('clears the first two classic floors with local progress and achievements enabled', () => {
        const finished = playPerfectFloors(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 88_001 }), 2);

        expect(finished.status).toBe('levelComplete');
        expect(finished.gameMode).toBe('endless');
        expect(finished.practiceMode).toBe(false);
        expect(finished.achievementsEnabled).toBe(true);
        expect(finished.stats.levelsCleared).toBe(2);
        expect(finished.stats.highestLevel).toBe(2);
        expect(finished.lastLevelResult?.perfect).toBe(true);
        expect(finished.stats.totalScore).toBeGreaterThan(0);
    });
});

describe('endless chapters and featured objectives', () => {
    it('awards only the featured objective bonus on endless floors', () => {
        const started = finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false }));
        const [firstPair, secondPair] = pairTileIds(started.board!);

        const afterFirstMatch = resolveBoardTurn(flipTile(flipTile(started, firstPair![0]!), firstPair![1]!));
        const finished = resolveBoardTurn(flipTile(flipTile(afterFirstMatch, secondPair![0]!), secondPair![1]!));

        expect(finished.status).toBe('levelComplete');
        expect(finished.lastLevelResult?.featuredObjectiveId).toBe('flip_par');
        expect(finished.lastLevelResult?.featuredObjectiveCompleted).toBe(true);
        expect(finished.lastLevelResult?.objectiveBonusScore).toBe(FLIP_PAR_BONUS_SCORE);
        expect(finished.lastLevelResult?.bonusTags).toContain('flip_par');
        expect(finished.lastLevelResult?.bonusTags).not.toContain('scholar_style');
        expect(finished.lastLevelResult?.bonusTags).not.toContain('cursed_last');
    });

    it('banks an extra relic pick when favor reaches three', () => {
        const started = finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false }));
        const [firstPair, secondPair] = pairTileIds(started.board!);
        const primed = {
            ...started,
            relicFavorProgress: 2
        };

        const afterFirstMatch = resolveBoardTurn(flipTile(flipTile(primed, firstPair![0]!), firstPair![1]!));
        const finished = resolveBoardTurn(flipTile(flipTile(afterFirstMatch, secondPair![0]!), secondPair![1]!));

        expect(finished.status).toBe('levelComplete');
        expect(finished.lastLevelResult?.relicFavorGained).toBe(1);
        expect(finished.relicFavorProgress).toBe(0);
        expect(finished.bonusRelicPicksNextOffer).toBe(1);
        expect(finished.favorBonusRelicPicksNextOffer).toBe(1);
    });

    it('builds a featured-objective streak and awards a score kicker after the first clear', () => {
        const started = finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false }));

        const firstFinished = clearRealPairs(started);
        expect(firstFinished.lastLevelResult?.featuredObjectiveStreak).toBe(1);
        expect(firstFinished.lastLevelResult?.featuredObjectiveStreakBonus).toBeUndefined();

        const secondStarted = finishMemorizePhase(advanceToNextLevel(firstFinished));
        const secondFinished = clearRealPairs(secondStarted);

        expect(secondFinished.status).toBe('levelComplete');
        expect(secondFinished.featuredObjectiveStreak).toBe(2);
        expect(secondFinished.lastLevelResult?.featuredObjectiveStreak).toBe(2);
        expect(secondFinished.lastLevelResult?.featuredObjectiveStreakBonus).toBe(
            FEATURED_OBJECTIVE_STREAK_BONUS_PER_STEP
        );
        expect(secondFinished.lastLevelResult?.bonusTags).toContain('objective_streak');
    });

    it('decays the featured-objective streak when a non-wager objective is missed', () => {
        const started = finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false }));
        const primed: RunState = {
            ...started,
            featuredObjectiveStreak: 3,
            matchResolutionsThisFloor: 99
        };

        const finished = clearRealPairs(primed);

        expect(finished.status).toBe('levelComplete');
        expect(finished.lastLevelResult?.featuredObjectiveCompleted).toBe(false);
        expect(finished.featuredObjectiveStreak).toBe(2);
        expect(finished.lastLevelResult?.featuredObjectiveStreak).toBe(2);
        expect(finished.lastLevelResult?.featuredObjectiveStreakBonus).toBeUndefined();
    });

    it('offers and accepts an endless risk wager after a completed streak of two', () => {
        const base = createNewRun(0, { echoFeedbackEnabled: false });
        const cleared: RunState = {
            ...base,
            status: 'levelComplete',
            featuredObjectiveStreak: ENDLESS_RISK_WAGER_MIN_STREAK,
            lastLevelResult: {
                level: 1,
                scoreGained: 100,
                rating: 'S++',
                livesRemaining: base.lives,
                perfect: true,
                mistakes: 0,
                clearLifeReason: 'perfect',
                clearLifeGained: 1,
                featuredObjectiveId: 'flip_par',
                featuredObjectiveCompleted: true,
                featuredObjectiveStreak: ENDLESS_RISK_WAGER_MIN_STREAK,
                relicFavorGained: 1
            }
        };

        expect(canOfferEndlessRiskWager(cleared)).toBe(true);
        const accepted = acceptEndlessRiskWager(cleared);
        expect(accepted.endlessRiskWager).toEqual({
            acceptedOnLevel: 1,
            targetLevel: 2,
            streakAtRisk: ENDLESS_RISK_WAGER_MIN_STREAK,
            bonusFavorOnSuccess: ENDLESS_RISK_WAGER_BONUS_FAVOR
        });
        expect(canOfferEndlessRiskWager(accepted)).toBe(false);
    });

    it('does not offer risk wagers outside scheduled endless runs', () => {
        const daily = createDailyRun(0, { echoFeedbackEnabled: false });
        const clearedDaily: RunState = {
            ...daily,
            status: 'levelComplete',
            featuredObjectiveStreak: ENDLESS_RISK_WAGER_MIN_STREAK,
            lastLevelResult: {
                level: 1,
                scoreGained: 100,
                rating: 'S++',
                livesRemaining: daily.lives,
                perfect: true,
                mistakes: 0,
                clearLifeReason: 'perfect',
                clearLifeGained: 1,
                featuredObjectiveId: 'flip_par',
                featuredObjectiveCompleted: true,
                featuredObjectiveStreak: ENDLESS_RISK_WAGER_MIN_STREAK,
                relicFavorGained: 1
            }
        };

        expect(canOfferEndlessRiskWager(clearedDaily)).toBe(false);
        expect(acceptEndlessRiskWager(clearedDaily)).toBe(clearedDaily);
    });

    it('keeps an accepted risk wager through relic offer flow', () => {
        const base = createNewRun(0, { echoFeedbackEnabled: false });
        const clearedMilestone: RunState = {
            ...base,
            status: 'levelComplete',
            featuredObjectiveStreak: ENDLESS_RISK_WAGER_MIN_STREAK,
            lastLevelResult: {
                level: 3,
                scoreGained: 100,
                rating: 'S++',
                livesRemaining: base.lives,
                perfect: true,
                mistakes: 0,
                clearLifeReason: 'perfect',
                clearLifeGained: 1,
                featuredObjectiveId: 'scholar_style',
                featuredObjectiveCompleted: true,
                featuredObjectiveStreak: ENDLESS_RISK_WAGER_MIN_STREAK,
                relicFavorGained: 1
            }
        };

        const accepted = acceptEndlessRiskWager(clearedMilestone);
        const offerRun = openRelicOffer(accepted);

        expect(offerRun.relicOffer).not.toBeNull();
        expect(offerRun.endlessRiskWager?.targetLevel).toBe(4);
    });

    it('wins a risk wager by completing the next featured objective and converts bonus favor', () => {
        const base = createNewRun(0, { echoFeedbackEnabled: false });
        const cleared: RunState = {
            ...base,
            status: 'levelComplete',
            featuredObjectiveStreak: ENDLESS_RISK_WAGER_MIN_STREAK,
            lastLevelResult: {
                level: 1,
                scoreGained: 100,
                rating: 'S++',
                livesRemaining: base.lives,
                perfect: true,
                mistakes: 0,
                clearLifeReason: 'perfect',
                clearLifeGained: 1,
                featuredObjectiveId: 'flip_par',
                featuredObjectiveCompleted: true,
                featuredObjectiveStreak: ENDLESS_RISK_WAGER_MIN_STREAK,
                relicFavorGained: 1
            }
        };
        const wagered = acceptEndlessRiskWager(cleared);
        const next = finishMemorizePhase(advanceToNextLevel(wagered));

        const finished = clearRealPairs(next);

        expect(finished.status).toBe('levelComplete');
        expect(finished.endlessRiskWager).toBeNull();
        expect(finished.lastLevelResult?.endlessRiskWagerOutcome).toBe('won');
        expect(finished.lastLevelResult?.endlessRiskWagerFavorGained).toBe(ENDLESS_RISK_WAGER_BONUS_FAVOR);
        expect(finished.lastLevelResult?.relicFavorGained).toBe(1 + ENDLESS_RISK_WAGER_BONUS_FAVOR);
        expect(finished.bonusRelicPicksNextOffer).toBe(1);
        expect(finished.favorBonusRelicPicksNextOffer).toBe(1);
        expect(finished.relicFavorProgress).toBe(0);
    });

    it('wager_surety adds favor on won wagers and leaves x1 streak on wager failure', () => {
        const base = createNewRun(0, { echoFeedbackEnabled: false, initialRelicIds: ['wager_surety'] });
        const cleared: RunState = {
            ...base,
            status: 'levelComplete',
            featuredObjectiveStreak: ENDLESS_RISK_WAGER_MIN_STREAK,
            lastLevelResult: {
                level: 1,
                scoreGained: 100,
                rating: 'S++',
                livesRemaining: base.lives,
                perfect: true,
                mistakes: 0,
                clearLifeReason: 'perfect',
                clearLifeGained: 1,
                featuredObjectiveId: 'flip_par',
                featuredObjectiveCompleted: true,
                featuredObjectiveStreak: ENDLESS_RISK_WAGER_MIN_STREAK,
                relicFavorGained: 1
            }
        };
        const wagered = acceptEndlessRiskWager(cleared);
        const won = clearRealPairs(finishMemorizePhase(advanceToNextLevel(wagered)));
        const lostStart: RunState = {
            ...finishMemorizePhase(advanceToNextLevel(wagered)),
            matchResolutionsThisFloor: 99
        };
        const lost = clearRealPairs(lostStart);

        expect(won.lastLevelResult?.endlessRiskWagerOutcome).toBe('won');
        expect(won.lastLevelResult?.endlessRiskWagerFavorGained).toBe(ENDLESS_RISK_WAGER_BONUS_FAVOR + 1);
        expect(won.lastLevelResult?.relicFavorGained).toBe(1 + ENDLESS_RISK_WAGER_BONUS_FAVOR + 1);
        expect(lost.lastLevelResult?.endlessRiskWagerOutcome).toBe('lost');
        expect(lost.featuredObjectiveStreak).toBe(1);
        expect(lost.lastLevelResult?.endlessRiskWagerStreakLost).toBe(ENDLESS_RISK_WAGER_MIN_STREAK - 1);
    });

    it('loses a risk wager by missing the next featured objective and resets the streak', () => {
        const base = createNewRun(0, { echoFeedbackEnabled: false });
        const cleared: RunState = {
            ...base,
            status: 'levelComplete',
            featuredObjectiveStreak: ENDLESS_RISK_WAGER_MIN_STREAK,
            lastLevelResult: {
                level: 1,
                scoreGained: 100,
                rating: 'S++',
                livesRemaining: base.lives,
                perfect: true,
                mistakes: 0,
                clearLifeReason: 'perfect',
                clearLifeGained: 1,
                featuredObjectiveId: 'flip_par',
                featuredObjectiveCompleted: true,
                featuredObjectiveStreak: ENDLESS_RISK_WAGER_MIN_STREAK,
                relicFavorGained: 1
            }
        };
        const wagered = acceptEndlessRiskWager(cleared);
        const next: RunState = {
            ...finishMemorizePhase(advanceToNextLevel(wagered)),
            matchResolutionsThisFloor: 99
        };

        const finished = clearRealPairs(next);

        expect(finished.status).toBe('levelComplete');
        expect(finished.endlessRiskWager).toBeNull();
        expect(finished.featuredObjectiveStreak).toBe(0);
        expect(finished.lastLevelResult?.featuredObjectiveCompleted).toBe(false);
        expect(finished.lastLevelResult?.endlessRiskWagerOutcome).toBe('lost');
        expect(finished.lastLevelResult?.endlessRiskWagerStreakLost).toBe(ENDLESS_RISK_WAGER_MIN_STREAK);
        expect(finished.lastLevelResult?.endlessRiskWagerFavorGained).toBeUndefined();
        expect(finished.lastLevelResult?.relicFavorGained).toBe(0);
    });

    it('parasite_ledger reduces parasite progress only on featured-objective success', () => {
        const base = finishMemorizePhase(
            createNewRun(0, { echoFeedbackEnabled: false, initialRelicIds: ['parasite_ledger'] })
        );
        const board: BoardState = {
            level: 11,
            pairCount: 2,
            columns: 2,
            rows: 2,
            tiles: [
                createTile('a1', 'A', 'A'),
                createTile('a2', 'A', 'A'),
                createTile('b1', 'B', 'B'),
                createTile('b2', 'B', 'B')
            ],
            flippedTileIds: [],
            matchedPairs: 0,
            floorTag: 'normal',
            cursedPairKey: null,
            wardPairKey: null,
            bountyPairKey: null,
            floorArchetypeId: 'parasite_tithe',
            featuredObjectiveId: 'scholar_style'
        };
        const parasiteRun: RunState = {
            ...base,
            board,
            activeMutators: ['score_parasite'],
            parasiteFloors: 3
        };
        const success = clearRealPairs(parasiteRun);
        const missed = clearRealPairs({
            ...parasiteRun,
            shuffleUsedThisFloor: true
        });

        expect(success.lastLevelResult?.featuredObjectiveCompleted).toBe(true);
        expect(success.parasiteFloors).toBe(2);
        expect(missed.lastLevelResult?.featuredObjectiveCompleted).toBe(false);
        expect(missed.parasiteFloors).toBe(3);
    });

    it('grants +2 favor on boss floors when the featured objective succeeds', () => {
        const run = finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false }));
        const board: BoardState = {
            level: 7,
            pairCount: 2,
            columns: 2,
            rows: 3,
            tiles: [
                createTile('a1', 'A', 'A'),
                createTile('a2', 'A', 'A'),
                createTile('b1', 'B', 'B'),
                createTile('b2', 'B', 'B'),
                createTile('decoy', DECOY_PAIR_KEY, 'X')
            ],
            flippedTileIds: [],
            matchedPairs: 0,
            floorTag: 'boss',
            cursedPairKey: null,
            wardPairKey: null,
            bountyPairKey: null,
            floorArchetypeId: 'trap_hall',
            featuredObjectiveId: 'glass_witness'
        };
        const bossRun: RunState = {
            ...run,
            board,
            activeMutators: ['glass_floor', 'sticky_fingers'],
            glassDecoyActiveThisFloor: true
        };

        const afterFirstMatch = resolveBoardTurn(flipTile(flipTile(bossRun, 'a1'), 'a2'));
        const finished = resolveBoardTurn(flipTile(flipTile(afterFirstMatch, 'b1'), 'b2'));

        expect(finished.status).toBe('levelComplete');
        expect(finished.lastLevelResult?.featuredObjectiveId).toBe('glass_witness');
        expect(finished.lastLevelResult?.featuredObjectiveCompleted).toBe(true);
        expect(finished.lastLevelResult?.relicFavorGained).toBe(2);
        expect(finished.relicFavorProgress).toBe(2);
    });

    it('only generates cursedPairKey on cursed-last featured-objective floors', () => {
        const flipParBoard = buildBoard(1, {
            runSeed: 1234,
            runRulesVersion: GAME_RULES_VERSION,
            activeMutators: ['wide_recall'],
            floorTag: 'normal',
            floorArchetypeId: 'survey_hall',
            featuredObjectiveId: 'flip_par'
        });
        const cursedBoard = buildBoard(4, {
            runSeed: 1234,
            runRulesVersion: GAME_RULES_VERSION,
            activeMutators: ['silhouette_twist'],
            floorTag: 'normal',
            floorArchetypeId: 'shadow_read',
            featuredObjectiveId: 'cursed_last'
        });

        expect(flipParBoard.cursedPairKey).toBeNull();
        expect(cursedBoard.cursedPairKey).not.toBeNull();
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

    describe('board power preview helpers', () => {
        it('destroy preview collects fully hidden non-decoy pairs only', () => {
            const tiles: Tile[] = [
                createTile('a1', 'A', 'A'),
                createTile('a2', 'A', 'A'),
                createTile('d1', DECOY_PAIR_KEY, '?'),
                createTile('b1', 'B', 'B'),
                createTile('b2', 'B', 'B')
            ];
            const board = createRun(tiles).board!;
            expect(tileIsDestroyEligiblePreview(board, 'a1')).toBe(true);
            expect(tileIsDestroyEligiblePreview(board, 'd1')).toBe(false);
            const eligible = collectDestroyEligibleTileIds(board);
            expect(eligible).toEqual(new Set(['a1', 'a2', 'b1', 'b2']));
        });

        it('peek preview excludes tiles already peek-revealed', () => {
            const tiles: Tile[] = [
                createTile('a1', 'A', 'A'),
                createTile('a2', 'A', 'A')
            ];
            const board = createRun(tiles).board!;
            expect(tileIsPeekEligiblePreview(board, [], 'a1')).toBe(true);
            expect(tileIsPeekEligiblePreview(board, ['a1'], 'a1')).toBe(false);
            expect(collectPeekEligibleTileIds(board, ['a1'])).toEqual(new Set(['a2']));
        });

        it('stray preview matches hidden non-decoy tiles', () => {
            const tiles: Tile[] = [
                createTile('a1', 'A', 'A'),
                createTile('d1', DECOY_PAIR_KEY, '?')
            ];
            const board = createRun(tiles).board!;
            expect(tileIsStrayEligiblePreview(board, 'a1')).toBe(true);
            expect(tileIsStrayEligiblePreview(board, 'd1')).toBe(false);
        });
    });

    it('resets parasite floor counter on destroy when score_parasite is active', () => {
        const tiles: Tile[] = [
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A'),
            createTile('b1', 'B', 'B'),
            createTile('b2', 'B', 'B')
        ];
        const run = {
            ...createRun(tiles),
            activeMutators: ['score_parasite'] as MutatorId[],
            destroyPairCharges: 1,
            parasiteFloors: 3
        };
        const after = applyDestroyPair(run, 'a1');
        expect(after.parasiteFloors).toBe(0);
    });

    describe('glass_floor decoy and board completion', () => {
        it('isBoardComplete when all real tiles are matched and the decoy trap stays hidden', () => {
            const board = buildBoard(2, {
                activeMutators: ['glass_floor'],
                runSeed: 90210,
                runRulesVersion: GAME_RULES_VERSION
            });
            const decoy = board.tiles.find((t) => t.pairKey === '__decoy__');
            expect(decoy).toBeDefined();
            const cleared: BoardState = {
                ...board,
                tiles: board.tiles.map((t) =>
                    t.pairKey === '__decoy__' ? t : { ...t, state: 'matched' as const }
                )
            };
            expect(isBoardComplete(cleared)).toBe(true);
        });
    });

    describe('findables_floor', () => {
        it('spawns exactly one pickup pair on early procedural floors', () => {
            const board = buildBoard(2, {
                activeMutators: [],
                runSeed: 90210,
                runRulesVersion: GAME_RULES_VERSION
            });
            const tagged = board.tiles.filter((t) => t.findableKind != null);
            expect(tagged).toHaveLength(2);
            expect(new Set(tagged.map((t) => t.pairKey)).size).toBe(1);
        });

        it('spawns one or two pickup pairs on later procedural floors', () => {
            const board = buildBoard(5, {
                activeMutators: [],
                runSeed: 1337,
                runRulesVersion: GAME_RULES_VERSION
            });
            const tagged = board.tiles.filter((t) => t.findableKind != null);
            expect([2, 4]).toContain(tagged.length);
            expect(tagged.every((t) => t.pairKey !== '__decoy__' && t.pairKey !== '__wild__')).toBe(true);
        });

        it('dense-pickup mutator guarantees two pickup pairs on new rules', () => {
            const board = buildBoard(5, {
                activeMutators: ['findables_floor'],
                runSeed: 90210,
                runRulesVersion: GAME_RULES_VERSION
            });
            const tagged = board.tiles.filter((t) => t.findableKind != null);
            expect(tagged).toHaveLength(4);
            expect(new Set(tagged.map((t) => t.pairKey)).size).toBe(2);
        });

        it('keeps legacy mutator-gated pickup generation for older rules', () => {
            /** Rules before v8 use legacy findable assignment (`legacyFindables` in `assignFindableKindsToTiles`). */
            const legacyRulesVersion = 7;
            let seededBoardWithMutator: BoardState | null = null;
            let seededBoardWithoutMutator: BoardState | null = null;
            for (let seed = 1; seed < 512; seed += 1) {
                const withMutator = buildBoard(3, {
                    activeMutators: ['findables_floor'],
                    runSeed: seed,
                    runRulesVersion: legacyRulesVersion
                });
                if (withMutator.tiles.some((tile) => tile.findableKind != null)) {
                    seededBoardWithMutator = withMutator;
                    seededBoardWithoutMutator = buildBoard(3, {
                        activeMutators: [],
                        runSeed: seed,
                        runRulesVersion: legacyRulesVersion
                    });
                    break;
                }
            }

            expect(seededBoardWithMutator).not.toBeNull();
            expect(seededBoardWithMutator!.tiles.some((tile) => tile.findableKind != null)).toBe(true);
            expect(seededBoardWithoutMutator!.tiles.some((tile) => tile.findableKind != null)).toBe(false);
        });

        it('tags only whole real pairs and never the decoy or wild singleton', () => {
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

        it('claims shard spark, converts through the shard-to-life path, and clears carrier flags', () => {
            const tiles: Tile[] = [
                { ...createTile('a1', 'A', 'A'), findableKind: 'shard_spark' },
                { ...createTile('a2', 'A', 'A'), findableKind: 'shard_spark' },
                createTile('b1', 'B', 'B'),
                createTile('b2', 'B', 'B')
            ];
            const started = {
                ...createRun(tiles),
                lives: 3,
                findablesClaimedThisFloor: 0,
                findablesTotalThisFloor: 1,
                stats: {
                    ...createRun(tiles).stats,
                    comboShards: 2
                }
            };
            const resolved = resolveBoardTurn(flipTile(flipTile(started, 'a1'), 'a2'));
            const base = calculateMatchScore(1, 1, 1);
            expect(FINDABLE_MATCH_COMBO_SHARDS.shard_spark).toBe(1);
            expect(resolved.stats.totalScore).toBe(base + FINDABLE_MATCH_SCORE.shard_spark);
            expect(resolved.lives).toBe(4);
            expect(resolved.stats.comboShards).toBe(0);
            expect(resolved.findablesClaimedThisFloor).toBe(1);
            expect(
                resolved.board?.tiles.filter((t) => t.pairKey === 'A').every((t) => t.findableKind === undefined)
            ).toBe(true);
        });

        it('claims score glint for flat score immediately', () => {
            const tiles: Tile[] = [
                { ...createTile('a1', 'A', 'A'), findableKind: 'score_glint' },
                { ...createTile('a2', 'A', 'A'), findableKind: 'score_glint' },
                createTile('b1', 'B', 'B'),
                createTile('b2', 'B', 'B')
            ];
            const started = { ...createRun(tiles), findablesClaimedThisFloor: 0, findablesTotalThisFloor: 1 };
            const resolved = resolveBoardTurn(flipTile(flipTile(started, 'a1'), 'a2'));
            const base = calculateMatchScore(1, 1, 1);
            expect(resolved.stats.totalScore).toBe(base + FINDABLE_MATCH_SCORE.score_glint);
            expect(resolved.findablesClaimedThisFloor).toBe(1);
        });

        it('forfeits findable on destroy without score or claim counter', () => {
            const tiles: Tile[] = [
                { ...createTile('a1', 'A', 'A'), findableKind: 'shard_spark' },
                { ...createTile('a2', 'A', 'A'), findableKind: 'shard_spark' },
                createTile('b1', 'B', 'B'),
                createTile('b2', 'B', 'B')
            ];
            const run = {
                ...createRun(tiles),
                destroyPairCharges: 1,
                findablesClaimedThisFloor: 0,
                findablesTotalThisFloor: 1
            };
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
                findablesTotalThisFloor: 2,
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
            expect(next.findablesTotalThisFloor).toBeGreaterThan(0);
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

describe('applyFlashPair', () => {
    it('is a no-op outside practice and wild menu runs even if charges are present', () => {
        let run = finishMemorizePhase(createNewRun(0, { gameMode: 'endless' }));
        run = { ...run, status: 'playing', flashPairCharges: 1 };
        expect(applyFlashPair(run)).toBe(run);
    });
});

describe('wildTileId bookkeeping', () => {
    it('sets wildTileId to the wild tile id in createWildRun', () => {
        const run = createWildRun(0);
        expect(run.board).not.toBeNull();
        const board = run.board!;
        const wild = board.tiles.find((t) => t.pairKey === WILD_PAIR_KEY);
        expect(wild).toBeDefined();
        expect(run.wildTileId).toBe(wild!.id);
        expect(getWildTileIdFromBoard(board)).toBe(wild!.id);
    });

    it('leaves wildTileId null when no wild tile is on the board', () => {
        const run = createNewRun(0, { gameMode: 'endless' });
        expect(run.board).not.toBeNull();
        expect(run.wildTileId).toBeNull();
        expect(getWildTileIdFromBoard(run.board!)).toBeNull();
    });

    it('keeps wildTileId aligned with the board after advanceToNextLevel', () => {
        const start = finishMemorizePhase(createWildRun(0));
        expect(start.wildTileId).not.toBeNull();
        const b = start.board!;
        const cleared = {
            ...start,
            status: 'levelComplete' as const,
            lastLevelResult: {
                level: b.level,
                scoreGained: 100,
                rating: 'S' as const,
                livesRemaining: start.lives,
                perfect: true,
                mistakes: 0,
                clearLifeReason: 'perfect' as const,
                clearLifeGained: 0
            },
            board: {
                ...b,
                matchedPairs: b.pairCount,
                flippedTileIds: [],
                tiles: b.tiles.map((t) => ({ ...t, state: 'matched' as const }))
            }
        };
        const next = advanceToNextLevel(cleared);
        expect(next.board).not.toBeNull();
        expect(next.wildTileId).toBe(getWildTileIdFromBoard(next.board!));
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

describe('computeRelicOfferPickBudget', () => {
    it('is 1 for vanilla endless', () => {
        const run = createNewRun(0, { gameMode: 'endless' });
        expect(computeRelicOfferPickBudget(run)).toBe(1);
    });

    it('stacks daily mode and generous_shrine mutator', () => {
        const run = createNewRun(0, { gameMode: 'daily', activeMutators: ['generous_shrine'] });
        expect(computeRelicOfferPickBudget(run)).toBe(3);
    });

    it('stacks meta relic draft flag and scholar contract', () => {
        const run = createNewRun(0, {
            metaRelicDraftExtraPerMilestone: 1,
            activeContract: {
                noShuffle: true,
                noDestroy: true,
                maxMismatches: null,
                bonusRelicDraftPick: true
            }
        });
        expect(computeRelicOfferPickBudget(run)).toBe(3);
    });
});

describe('relic draft multi-pick', () => {
    it('consumes bonus and completes one milestone tier after two picks', () => {
        let run = createNewRun(999, { gameMode: 'endless' });
        run = {
            ...run,
            status: 'levelComplete',
            relicTiersClaimed: 0,
            relicOffer: null,
            lastLevelResult: {
                level: 3,
                scoreGained: 1,
                rating: 'S',
                livesRemaining: 3,
                perfect: false,
                mistakes: 0,
                clearLifeReason: 'none',
                clearLifeGained: 0
            }
        };
        run = grantBonusRelicPickNextOffer(run, 1);
        run = openRelicOffer(run);
        expect(run.relicOffer?.picksRemaining).toBe(2);
        expect(run.bonusRelicPicksNextOffer).toBe(0);

        const first = run.relicOffer!.options[0]!;
        run = completeRelicPickAndAdvance(run, first);
        expect(run.relicOffer).not.toBeNull();
        expect(run.relicOffer!.picksRemaining).toBe(1);

        const second = run.relicOffer!.options[0]!;
        run = completeRelicPickAndAdvance(run, second);
        expect(run.relicOffer).toBeNull();
        expect(run.relicTiersClaimed).toBe(1);
        expect(run.relicIds).toEqual(expect.arrayContaining([first, second]));
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
