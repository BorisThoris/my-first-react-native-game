import { describe, expect, it } from 'vitest';
import type { BoardState, FloorArchetypeId, MutatorId, RouteNodeType, RunState, Tile } from './contracts';
import {
    ENDLESS_RISK_WAGER_BONUS_FAVOR,
    ENDLESS_RISK_WAGER_MIN_STREAK,
    FEATURED_OBJECTIVE_STREAK_BONUS_PER_STEP,
    FINDABLE_MATCH_COMBO_SHARDS,
    FINDABLE_MATCH_SCORE,
    FLIP_PAR_BONUS_SCORE,
    FLOOR_CLEAR_GOLD_BASE,
    GAUNTLET_FLOOR_CLEAR_TIME_BONUS_MS,
    GAME_RULES_VERSION,
    MATCH_DELAY_MS,
    MAX_DESTROY_PAIR_BANK,
    MAX_LIVES,
    MEMORIZE_BONUS_PER_LIFE_LOST_MS,
    SHIFTING_BOUNTY_MATCH_BONUS,
    SHIFTING_WARD_MATCH_PENALTY
} from './contracts';
import {
    buildBoard,
    countFullyHiddenPairs,
    getWildTileIdFromBoard,
    isBoardComplete
} from './board-generation';
import {
    createDailyRun,
    createGauntletRun,
    createNewRun,
    createWildRun,
    enableDebugPeek,
    finishMemorizePhase,
    getMemorizeDuration,
    getMemorizeDurationForRun,
    isGauntletExpired,
    advanceToNextLevel
} from './game-core';
import {
    applyDestroyPair,
    applyFlashPair,
    applyPeek,
    applyRegionShuffle,
    applyShuffle,
    applyStrayRemove,
    canRegionShuffle,
    canRegionShuffleRow,
    canShuffleBoard,
    collectDestroyEligibleTileIds,
    collectPeekEligibleTileIds,
    tileIsDestroyEligiblePreview,
    tileIsPeekEligiblePreview,
    tileIsStrayEligiblePreview,
    togglePinnedTile
} from './board-powers';
import {
    calculateMatchScore,
    flipTile,
    getMatchFloaterAnchorTileIds,
    getMismatchFloaterAnchorTileIds,
    getPresentationMutatorMatchPenalty,
    resolveBoardTurn,
    tilesArePairMatch
} from './turn-resolution';
import {
    activateDungeonExit,
    createDungeonFloorBlueprint,
    EXIT_PAIR_KEY,
    getDungeonBoardStatus,
    getDungeonCardCopy,
    getDungeonExitStatus,
    getDungeonObjectiveStatus,
    revealDungeonExit,
    revealDungeonRoom,
    revealDungeonShop,
    ROOM_PAIR_KEY,
    SHOP_PAIR_KEY
} from './dungeon-rules';
import {
    applyRouteChoiceOutcome,
    claimRouteSideRoomPrimary,
    openRouteSideRoom,
    skipRouteSideRoom
} from './route-rules';
import {
    canRerollShopOffers,
    createRunShopOffers,
    getShopWalletPacing,
    purchaseShopOffer,
    rerollShopOffers
} from './shop-rules';
import {
    acceptEndlessRiskWager,
    canOfferEndlessRiskWager,
    completeRelicPickAndAdvance,
    computeRelicOfferPickBudget,
    grantBonusRelicPickNextOffer,
    openRelicOffer
} from './objective-rules';
import { DECOY_PAIR_KEY, WILD_PAIR_KEY } from './tile-identity';
import { DAILY_MUTATOR_TABLE } from './mutators';
import { makeBoard as createBoard, makeRun as createRun, makeTile as createTile } from './test/game-fixtures';

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
    return leaveThroughExit(current);
};

const leaveThroughExit = (run: RunState): RunState => {
    const exitTile = run.board?.tiles.find((tile) => tile.pairKey === EXIT_PAIR_KEY);
    if (!exitTile || run.status !== 'playing') {
        return run;
    }
    let current = revealDungeonExit(run, exitTile.id);
    const exitStatus = getDungeonExitStatus(current);
    if (exitStatus.canActivateWithKey) {
        current = activateDungeonExit(current, 'key');
    } else if (exitStatus.canActivateWithMasterKey) {
        current = activateDungeonExit(current, 'master_key');
    } else {
        current = activateDungeonExit(current, 'none');
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

const routeBoard = (
    routeType: RouteNodeType,
    level: number,
    floorTag: BoardState['floorTag'] = 'normal',
    overrides: { activeMutators?: MutatorId[]; floorArchetypeId?: FloorArchetypeId } = {}
): BoardState =>
    buildBoard(level, {
        runSeed: 23_000 + level,
        runRulesVersion: GAME_RULES_VERSION,
        activeMutators: overrides.activeMutators ?? [],
        floorTag,
        ...(overrides.floorArchetypeId ? { floorArchetypeId: overrides.floorArchetypeId } : {}),
        routeCardPlan: {
            choiceId: `test:${level}:${routeType}`,
            routeType,
            sourceLevel: level - 1,
            targetLevel: level
        }
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

describe('REG-017 route choices', () => {
    it('adds deterministic local route options to eligible endless floor clears', () => {
        const finished = playPerfectFloors(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 17_001 }), 1);

        expect(finished.lastLevelResult?.routeChoices).toMatchObject([
            {
                id: `${GAME_RULES_VERSION}:17001:2:safe`,
                routeType: 'safe',
                label: 'Safe passage',
                detail: 'Standard next floor. Keep the run curve predictable.'
            },
            {
                id: `${GAME_RULES_VERSION}:17001:2:greed`,
                routeType: 'greed',
                label: 'Greedy route',
                detail: 'Higher pressure route hook for future shop, elite, or bonus rewards.'
            },
            {
                id: `${GAME_RULES_VERSION}:17001:2:mystery`,
                routeType: 'mystery',
                label: 'Mystery route',
                detail: 'Random event and secret-room hook with replayable local RNG.'
            }
        ]);
        expect(playPerfectFloors(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 17_001 }), 1).lastLevelResult?.routeChoices).toEqual(
            finished.lastLevelResult?.routeChoices
        );
    });

    it('applies safe route recovery, then guard when already full', () => {
        const cleared = playPerfectFloors(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 17_002 }), 1);
        const safeId = cleared.lastLevelResult!.routeChoices!.find((choice) => choice.routeType === 'safe')!.id;

        const healed = applyRouteChoiceOutcome({ ...cleared, lives: 3 }, safeId);
        expect(healed.applied).toBe(true);
        expect(healed.run.lives).toBe(4);
        expect(healed.run.lastLevelResult?.livesRemaining).toBe(4);

        const guarded = applyRouteChoiceOutcome({ ...cleared, lives: MAX_LIVES }, safeId);
        expect(guarded.applied).toBe(true);
        expect(guarded.run.stats.guardTokens).toBe(cleared.stats.guardTokens + 1);
    });

    it('applies greedy route payout and refuses greed at one life', () => {
        const cleared = playPerfectFloors(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 17_003 }), 1);
        const greedId = cleared.lastLevelResult!.routeChoices!.find((choice) => choice.routeType === 'greed')!.id;
        const beforeScore = cleared.stats.totalScore;
        const beforeGold = cleared.shopGold;

        const greedy = applyRouteChoiceOutcome(cleared, greedId);
        expect(greedy.applied).toBe(true);
        expect(greedy.run.shopGold).toBe(beforeGold + 3);
        expect(greedy.run.stats.totalScore).toBe(beforeScore + 35);
        expect(greedy.run.lastLevelResult?.scoreGained).toBe(cleared.lastLevelResult!.scoreGained + 35);
        expect(greedy.run.lives).toBe(cleared.lives - 1);

        const refused = applyRouteChoiceOutcome({ ...cleared, lives: 1 }, greedId);
        expect(refused.applied).toBe(false);
        expect(refused.reason).toBe('unavailable');
        expect(refused.run.lives).toBe(1);
    });

    it('opens route side rooms and clears them through claim or skip', () => {
        const cleared = playPerfectFloors(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 17_303 }), 1);
        const safeId = cleared.lastLevelResult!.routeChoices!.find((choice) => choice.routeType === 'safe')!.id;
        const greedId = cleared.lastLevelResult!.routeChoices!.find((choice) => choice.routeType === 'greed')!.id;
        const mysteryId = cleared.lastLevelResult!.routeChoices!.find((choice) => choice.routeType === 'mystery')!.id;

        const safeRoom = openRouteSideRoom(applyRouteChoiceOutcome({ ...cleared, lives: 3 }, safeId).run);
        const safeClaimed = claimRouteSideRoomPrimary(safeRoom);
        const greedRoom = openRouteSideRoom(applyRouteChoiceOutcome(cleared, greedId).run);
        const greedSkipped = skipRouteSideRoom(greedRoom);
        const mysteryRoom = openRouteSideRoom(applyRouteChoiceOutcome(cleared, mysteryId).run);

        expect(safeRoom.sideRoom).toMatchObject({ kind: 'rest_shrine', routeType: 'safe' });
        expect(safeClaimed.sideRoom).toBeNull();
        expect(safeClaimed.lives).toBe(5);
        expect(greedRoom.sideRoom).toMatchObject({ kind: 'bonus_reward', routeType: 'greed' });
        expect(greedSkipped.sideRoom).toBeNull();
        expect(greedSkipped.shopGold).toBe(greedRoom.shopGold);
        expect(mysteryRoom.sideRoom?.routeType).toBe('mystery');
        expect(mysteryRoom.sideRoom?.kind).toMatch(/run_event|bonus_reward/);
    });

    it('stamps the chosen route onto the next board and consumes the pending route plan', () => {
        const cleared = playPerfectFloors(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 17_013 }), 1);
        const greedId = cleared.lastLevelResult!.routeChoices!.find((choice) => choice.routeType === 'greed')!.id;
        const greedy = applyRouteChoiceOutcome(cleared, greedId);

        expect(greedy.run.pendingRouteCardPlan).toMatchObject({
            choiceId: greedId,
            routeType: 'greed',
            sourceLevel: 1,
            targetLevel: 2
        });

        const next = advanceToNextLevel(greedy.run);
        expect(next.pendingRouteCardPlan).toBeNull();
        expect(next.board!.routeWorldProfile).toMatchObject({ routeType: 'greed', rewardBudget: 3 });
        const routeTiles = next.board!.tiles.filter((tile) => tile.routeCardKind === 'greed_cache');
        expect(routeTiles).toHaveLength(6);
        expect(new Set(routeTiles.map((tile) => tile.pairKey))).toHaveLength(3);
        expect(next.board!.tiles.filter((tile) => tile.routeSpecialKind === 'greed_toll')).toHaveLength(2);
        expect(next.board!.tiles.filter((tile) => tile.routeSpecialKind === 'elite_cache')).toHaveLength(2);
        expect(routeTiles[0]!.pairKey).not.toBe(DECOY_PAIR_KEY);
        expect(routeTiles[0]!.pairKey).not.toBe(WILD_PAIR_KEY);
    });

    it('gives Safe and Mystery distinct route-world profiles on next board', () => {
        const cleared = playPerfectFloors(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 17_113 }), 1);
        const safeId = cleared.lastLevelResult!.routeChoices!.find((choice) => choice.routeType === 'safe')!.id;
        const mysteryId = cleared.lastLevelResult!.routeChoices!.find((choice) => choice.routeType === 'mystery')!.id;

        const safeNext = advanceToNextLevel(applyRouteChoiceOutcome(cleared, safeId).run);
        const mysteryNext = advanceToNextLevel(applyRouteChoiceOutcome(cleared, mysteryId).run);

        expect(safeNext.board!.routeWorldProfile).toMatchObject({ routeType: 'safe', hazardBudget: 0 });
        expect(safeNext.board!.tiles.filter((tile) => tile.routeSpecialKind === 'safe_ward')).toHaveLength(2);
        expect(safeNext.board!.tiles.filter((tile) => tile.routeSpecialKind === 'lantern_ward')).toHaveLength(2);
        expect(mysteryNext.board!.routeWorldProfile).toMatchObject({ routeType: 'mystery' });
        expect(mysteryNext.board!.tiles.filter((tile) => tile.routeSpecialKind === 'mystery_veil')).toHaveLength(2);
    });

    it('adds non-hard route card families into the board rendering metadata', () => {
        const greedBoard = routeBoard('greed', 3);
        const mysteryBoard = routeBoard('mystery', 3);

        expect(greedBoard.routeWorldProfile).toMatchObject({
            routeType: 'greed',
            routeSpecialKinds: ['greed_cache', 'greed_toll', 'fragile_cache']
        });
        expect(greedBoard.tiles.filter((tile) => tile.routeSpecialKind === 'fragile_cache')).toHaveLength(2);
        expect(greedBoard.tiles.filter((tile) => tile.routeSpecialKind === 'fragile_cache')[0]!.routeCardKind).toBe(
            'greed_cache'
        );
        expect(mysteryBoard.routeWorldProfile).toMatchObject({
            routeType: 'mystery',
            routeSpecialKinds: ['mystery_veil', 'secret_door']
        });
        expect(mysteryBoard.tiles.filter((tile) => tile.routeSpecialKind === 'secret_door')).toHaveLength(2);
        expect(mysteryBoard.tiles.filter((tile) => tile.routeSpecialKind === 'secret_door')[0]!.routeCardKind).toBe(
            'mystery_veil'
        );
    });

    it('adds keystone pairs as boss-floor route anchors', () => {
        const safeBoss = routeBoard('safe', 7, 'boss');
        const greedBoss = routeBoard('greed', 7, 'boss');
        const mysteryBoss = routeBoard('mystery', 7, 'boss');

        expect(safeBoss.tiles.filter((tile) => tile.routeSpecialKind === 'keystone_pair')).toHaveLength(2);
        expect(safeBoss.tiles.find((tile) => tile.routeSpecialKind === 'keystone_pair')!.routeCardKind).toBe(
            'safe_ward'
        );
        expect(greedBoss.tiles.find((tile) => tile.routeSpecialKind === 'keystone_pair')!.routeCardKind).toBe(
            'greed_cache'
        );
        expect(mysteryBoss.tiles.find((tile) => tile.routeSpecialKind === 'keystone_pair')!.routeCardKind).toBe(
            'mystery_veil'
        );
        expect(safeBoss.tiles.some((tile) => tile.routeSpecialKind === 'final_ward')).toBe(false);
        expect(greedBoss.tiles.some((tile) => tile.routeSpecialKind === 'elite_cache')).toBe(false);
        expect(mysteryBoss.tiles.some((tile) => tile.routeSpecialKind === 'omen_seal')).toBe(false);
    });

    it('adds elite route anchors to hard non-boss floors', () => {
        const safeHard = routeBoard('safe', 4, 'normal', { floorArchetypeId: 'trap_hall' });
        const greedHard = routeBoard('greed', 4, 'normal', { floorArchetypeId: 'rush_recall' });
        const mysteryHard = routeBoard('mystery', 4, 'normal', { activeMutators: ['glass_floor'] });

        expect(safeHard.routeWorldProfile).toMatchObject({
            routeType: 'safe',
            routeSpecialKinds: ['safe_ward', 'lantern_ward', 'final_ward']
        });
        expect(greedHard.routeWorldProfile).toMatchObject({
            routeType: 'greed',
            routeSpecialKinds: ['greed_cache', 'greed_toll', 'elite_cache']
        });
        expect(mysteryHard.routeWorldProfile).toMatchObject({
            routeType: 'mystery',
            routeSpecialKinds: ['mystery_veil', 'omen_seal']
        });
        expect(safeHard.tiles.filter((tile) => tile.routeSpecialKind === 'final_ward')).toHaveLength(2);
        expect(safeHard.tiles.find((tile) => tile.routeSpecialKind === 'final_ward')!.routeCardKind).toBe(
            'safe_ward'
        );
        expect(greedHard.tiles.filter((tile) => tile.routeSpecialKind === 'elite_cache')).toHaveLength(2);
        expect(greedHard.tiles.find((tile) => tile.routeSpecialKind === 'elite_cache')!.routeCardKind).toBe(
            'greed_cache'
        );
        expect(mysteryHard.tiles.filter((tile) => tile.routeSpecialKind === 'omen_seal')).toHaveLength(2);
        expect(mysteryHard.tiles.find((tile) => tile.routeSpecialKind === 'omen_seal')!.routeCardKind).toBe(
            'mystery_veil'
        );
        expect(mysteryHard.tiles.find((tile) => tile.routeSpecialKind === 'omen_seal')!.routeSpecialRevealed).toBe(
            undefined
        );
    });

    it('pays route card rewards once when the stamped pair is matched', () => {
        const cleared = playPerfectFloors(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 17_014 }), 1);
        const greedId = cleared.lastLevelResult!.routeChoices!.find((choice) => choice.routeType === 'greed')!.id;
        const greedy = applyRouteChoiceOutcome(cleared, greedId);
        const next = finishMemorizePhase(advanceToNextLevel(greedy.run));
        const routeTiles = next.board!.tiles.filter((tile) => tile.routeSpecialKind === 'greed_cache');
        const beforeGold = next.shopGold;
        const beforeScore = next.stats.totalScore;

        const resolved = resolveBoardTurn(flipTile(flipTile(next, routeTiles[0]!.id), routeTiles[1]!.id));

        expect(resolved.shopGold).toBe(beforeGold + 2);
        expect(resolved.stats.totalScore).toBeGreaterThanOrEqual(
            beforeScore + calculateMatchScore(next.board!.level, 1) + 25
        );
        expect(resolved.board!.tiles.filter((tile) => tile.pairKey === routeTiles[0]!.pairKey)).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ routeCardKind: undefined, routeSpecialKind: undefined, state: 'matched' })
            ])
        );
    });

    it('peek reveals mystery veil families without claiming them', () => {
        const cleared = playPerfectFloors(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 17_114 }), 1);
        const mysteryId = cleared.lastLevelResult!.routeChoices!.find((choice) => choice.routeType === 'mystery')!.id;
        const next = finishMemorizePhase(advanceToNextLevel(applyRouteChoiceOutcome(cleared, mysteryId).run));
        const veil = next.board!.tiles.find((tile) => tile.routeSpecialKind === 'mystery_veil')!;

        const peeked = applyPeek(next, veil.id);

        expect(peeked.peekCharges).toBe(next.peekCharges - 1);
        expect(peeked.shopGold).toBe(next.shopGold);
        expect(peeked.board!.tiles.filter((tile) => tile.pairKey === veil.pairKey)).toEqual(
            expect.arrayContaining([expect.objectContaining({ routeSpecialRevealed: true })])
        );
    });

    it('secret doors reveal on peek and pay relic Favor when matched', () => {
        const board = routeBoard('mystery', 3);
        const base = finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 17_214 }));
        const run: RunState = { ...base, board, status: 'playing', relicFavorProgress: 0, peekCharges: 1 };
        const secret = run.board!.tiles.find((tile) => tile.routeSpecialKind === 'secret_door')!;

        const peeked = applyPeek(run, secret.id);
        const pair = peeked.board!.tiles.filter((tile) => tile.pairKey === secret.pairKey);
        const resolved = resolveBoardTurn(flipTile(flipTile(peeked, pair[0]!.id), pair[1]!.id));

        expect(peeked.board!.tiles.filter((tile) => tile.pairKey === secret.pairKey)).toEqual(
            expect.arrayContaining([expect.objectContaining({ routeSpecialRevealed: true })])
        );
        expect(resolved.relicFavorProgress).toBe(1);
    });

    it('elite route anchors pay their route-specific rewards', () => {
        const base = finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 17_217 }));
        const greedBoard = routeBoard('greed', 4, 'normal', { floorArchetypeId: 'rush_recall' });
        const safeBoard = routeBoard('safe', 4, 'normal', { floorArchetypeId: 'trap_hall' });
        const mysteryBoard = routeBoard('mystery', 4, 'normal', { activeMutators: ['short_memorize'] });

        const eliteRun: RunState = { ...base, board: greedBoard, status: 'playing' };
        const elite = eliteRun.board!.tiles.filter((tile) => tile.routeSpecialKind === 'elite_cache');
        const eliteResolved = resolveBoardTurn(flipTile(flipTile(eliteRun, elite[0]!.id), elite[1]!.id));

        const finalWardRun: RunState = {
            ...base,
            board: safeBoard,
            status: 'playing',
            stats: { ...base.stats, guardTokens: 0, comboShards: 0 }
        };
        const finalWard = finalWardRun.board!.tiles.filter((tile) => tile.routeSpecialKind === 'final_ward');
        const finalWardResolved = resolveBoardTurn(
            flipTile(flipTile(finalWardRun, finalWard[0]!.id), finalWard[1]!.id)
        );

        const omenRun: RunState = {
            ...base,
            board: mysteryBoard,
            status: 'playing',
            stats: { ...base.stats, comboShards: 0 },
            relicFavorProgress: 0,
            peekCharges: 1
        };
        const omen = omenRun.board!.tiles.filter((tile) => tile.routeSpecialKind === 'omen_seal');
        const peeked = applyPeek(omenRun, omen[0]!.id);
        const omenResolved = resolveBoardTurn(flipTile(flipTile(peeked, omen[0]!.id), omen[1]!.id));

        expect(eliteResolved.shopGold).toBe(eliteRun.shopGold + 4);
        expect(eliteResolved.stats.totalScore).toBeGreaterThanOrEqual(eliteRun.stats.totalScore + 55);
        expect(finalWardResolved.stats.guardTokens).toBe(1);
        expect(finalWardResolved.stats.comboShards).toBe(1);
        expect(peeked.board!.tiles.filter((tile) => tile.pairKey === omen[0]!.pairKey)).toEqual(
            expect.arrayContaining([expect.objectContaining({ routeSpecialRevealed: true })])
        );
        expect(omenResolved.relicFavorProgress).toBe(1);
        expect(omenResolved.stats.comboShards).toBe(1);
    });

    it('fragile cache and lantern ward pay distinct rewards when matched', () => {
        const greedBoard = routeBoard('greed', 3);
        const safeBoard = routeBoard('safe', 3);
        const base = finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 17_215 }));
        const fragileRun: RunState = { ...base, board: greedBoard, status: 'playing' };
        const fragile = fragileRun.board!.tiles.filter((tile) => tile.routeSpecialKind === 'fragile_cache');
        const fragileResolved = resolveBoardTurn(flipTile(flipTile(fragileRun, fragile[0]!.id), fragile[1]!.id));
        const lanternRun: RunState = {
            ...base,
            board: safeBoard,
            status: 'playing',
            stats: { ...base.stats, guardTokens: 0 }
        };
        const lantern = lanternRun.board!.tiles.filter((tile) => tile.routeSpecialKind === 'lantern_ward');
        const lanternResolved = resolveBoardTurn(flipTile(flipTile(lanternRun, lantern[0]!.id), lantern[1]!.id));

        expect(fragileResolved.shopGold).toBe(fragileRun.shopGold + 1);
        expect(fragileResolved.stats.totalScore).toBeGreaterThanOrEqual(fragileRun.stats.totalScore + 20);
        expect(lanternResolved.stats.guardTokens).toBe(1);
        expect(lanternResolved.stats.totalScore).toBeGreaterThanOrEqual(lanternRun.stats.totalScore + 10);
    });

    it('stray remove refuses keystone route anchors', () => {
        const board = routeBoard('greed', 7, 'boss');
        const base = finishMemorizePhase(
            createNewRun(0, { echoFeedbackEnabled: false, runSeed: 17_216, initialStrayRemoveCharges: 1 })
        );
        const run: RunState = { ...base, board, status: 'playing', strayRemoveArmed: true };
        const keystone = run.board!.tiles.find((tile) => tile.routeSpecialKind === 'keystone_pair')!;

        expect(tileIsStrayEligiblePreview(board, keystone.id)).toBe(false);
        expect(applyStrayRemove(run, keystone.id)).toBe(run);
    });

    it('stray remove refuses protected hard-route elite anchors', () => {
        const base = finishMemorizePhase(
            createNewRun(0, { echoFeedbackEnabled: false, runSeed: 17_218, initialStrayRemoveCharges: 1 })
        );
        const finalWardBoard = routeBoard('safe', 4, 'normal', { floorArchetypeId: 'trap_hall' });
        const omenBoard = routeBoard('mystery', 4, 'normal', { activeMutators: ['glass_floor'] });
        const finalWard = finalWardBoard.tiles.find((tile) => tile.routeSpecialKind === 'final_ward')!;
        const omen = omenBoard.tiles.find((tile) => tile.routeSpecialKind === 'omen_seal')!;
        const finalWardRun: RunState = { ...base, board: finalWardBoard, status: 'playing', strayRemoveArmed: true };
        const omenRun: RunState = { ...base, board: omenBoard, status: 'playing', strayRemoveArmed: true };

        expect(tileIsStrayEligiblePreview(finalWardBoard, finalWard.id)).toBe(false);
        expect(applyStrayRemove(finalWardRun, finalWard.id)).toBe(finalWardRun);
        expect(tileIsStrayEligiblePreview(omenBoard, omen.id)).toBe(false);
        expect(applyStrayRemove(omenRun, omen.id)).toBe(omenRun);
    });

    it('covers route synergy matrix fixtures without soft-locking board completion', () => {
        const base = {
            ...finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 17_219 })),
            destroyPairCharges: 1
        };
        const greedTreasure = routeBoard('greed', 5, 'breather', {
            activeMutators: ['findables_floor'],
            floorArchetypeId: 'treasure_gallery'
        });
        const greedTrap = routeBoard('greed', 7, 'normal', {
            activeMutators: ['glass_floor', 'sticky_fingers'],
            floorArchetypeId: 'trap_hall'
        });
        const safeRush = routeBoard('safe', 9, 'normal', {
            activeMutators: ['short_memorize', 'wide_recall'],
            floorArchetypeId: 'rush_recall'
        });
        const mysterySurvey = routeBoard('mystery', 1, 'normal', {
            activeMutators: ['wide_recall'],
            floorArchetypeId: 'survey_hall'
        });

        expect(greedTreasure.routeWorldProfile).toMatchObject({
            routeType: 'greed',
            routeSpecialKinds: ['greed_cache', 'greed_toll', 'fragile_cache']
        });
        const treasureFindablePairKeys = new Set(
            greedTreasure.tiles.filter((tile) => tile.findableKind).map((tile) => tile.pairKey)
        );
        expect(treasureFindablePairKeys.size).toBeGreaterThanOrEqual(1);
        expect(
            [...treasureFindablePairKeys].every(
                (pairKey) => greedTreasure.tiles.filter((tile) => tile.pairKey === pairKey).length === 2
            )
        ).toBe(true);
        const treasureToll = greedTreasure.tiles.find((tile) => tile.routeSpecialKind === 'greed_toll')!;
        const treasureRun: RunState = {
            ...base,
            board: greedTreasure,
            status: 'playing',
            destroyPairCharges: 1,
            shopGold: 0
        };
        const treasureDestroyed = applyDestroyPair(treasureRun, treasureToll.id);
        expect(treasureDestroyed.shopGold).toBe(0);
        expect(
            treasureDestroyed.board!.tiles.filter((tile) => tile.pairKey === treasureToll.pairKey)
        ).toEqual(expect.arrayContaining([expect.objectContaining({ routeSpecialKind: undefined })]));

        expect(greedTrap.routeWorldProfile).toMatchObject({
            routeType: 'greed',
            routeSpecialKinds: ['greed_cache', 'greed_toll', 'elite_cache']
        });
        expect(greedTrap.tiles.filter((tile) => tile.pairKey === DECOY_PAIR_KEY)).toHaveLength(1);
        expect(greedTrap.tiles.filter((tile) => tile.routeSpecialKind === 'elite_cache')).toHaveLength(2);

        expect(safeRush.routeWorldProfile).toMatchObject({
            routeType: 'safe',
            routeSpecialKinds: ['safe_ward', 'lantern_ward', 'final_ward']
        });
        expect(safeRush.tiles.filter((tile) => tile.routeSpecialKind === 'final_ward')).toHaveLength(2);

        expect(mysterySurvey.routeWorldProfile).toMatchObject({
            routeType: 'mystery',
            routeSpecialKinds: ['mystery_veil', 'secret_door']
        });
        const secret = mysterySurvey.tiles.find((tile) => tile.routeSpecialKind === 'secret_door')!;
        const mysteryRun: RunState = { ...base, board: mysterySurvey, status: 'playing', peekCharges: 1 };
        const mysteryPeeked = applyPeek(mysteryRun, secret.id);
        expect(mysteryPeeked.board!.tiles.filter((tile) => tile.pairKey === secret.pairKey)).toEqual(
            expect.arrayContaining([expect.objectContaining({ routeSpecialRevealed: true })])
        );
        expect(mysteryPeeked.relicFavorProgress).toBe(mysteryRun.relicFavorProgress);

        for (const board of [greedTreasure, greedTrap, safeRush, mysterySurvey]) {
            const cleared = clearRealPairs({ ...base, board, status: 'playing' });
            expect(cleared.status).toBe('levelComplete');
            expect(isBoardComplete(cleared.board!)).toBe(true);
        }
    });

    it('applies deterministic mystery route rewards and can convert Favor into a relic pick', () => {
        const cleared = playPerfectFloors(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 17_004 }), 1);
        const mysteryId = cleared.lastLevelResult!.routeChoices!.find((choice) => choice.routeType === 'mystery')!.id;
        const first = applyRouteChoiceOutcome(cleared, mysteryId);
        const second = applyRouteChoiceOutcome(cleared, mysteryId);

        expect(first.applied).toBe(true);
        expect(second.run).toEqual(first.run);

        let favorCase: RunState | null = null;
        for (let seed = 17_100; seed < 17_180; seed += 1) {
            const candidate = playPerfectFloors(createNewRun(0, { echoFeedbackEnabled: false, runSeed: seed }), 1);
            const choice = candidate.lastLevelResult!.routeChoices!.find((route) => route.routeType === 'mystery')!;
            const result = applyRouteChoiceOutcome({ ...candidate, relicFavorProgress: 2 }, choice.id);
            if (result.summaryText?.includes('relic Favor')) {
                favorCase = result.run;
                break;
            }
        }

        expect(favorCase).not.toBeNull();
        expect(favorCase!.relicFavorProgress).toBe(0);
        expect(favorCase!.bonusRelicPicksNextOffer).toBeGreaterThan(0);
        expect(favorCase!.favorBonusRelicPicksNextOffer).toBeGreaterThan(0);
    });

    it('does not apply route choices outside level complete state or with missing ids', () => {
        const cleared = playPerfectFloors(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 17_005 }), 1);
        const safeId = cleared.lastLevelResult!.routeChoices!.find((choice) => choice.routeType === 'safe')!.id;

        expect(applyRouteChoiceOutcome({ ...cleared, status: 'playing' }, safeId).reason).toBe('invalid_status');
        expect(applyRouteChoiceOutcome(cleared, 'missing').reason).toBe('missing_choice');
    });
});

describe('dungeon cards', () => {
    it('creates deterministic dungeon blueprints with valid exits and floor identity', () => {
        const blueprint = createDungeonFloorBlueprint({
            runSeed: 42_010,
            rulesVersion: GAME_RULES_VERSION,
            level: 7,
            floorTag: 'boss',
            floorArchetypeId: 'trap_hall',
            gameMode: 'endless'
        });
        const repeat = createDungeonFloorBlueprint({
            runSeed: 42_010,
            rulesVersion: GAME_RULES_VERSION,
            level: 7,
            floorTag: 'boss',
            floorArchetypeId: 'trap_hall',
            gameMode: 'endless'
        });

        expect(repeat).toEqual(blueprint);
        expect(blueprint.exitSpecs.length).toBeGreaterThanOrEqual(1);
        expect(blueprint.exitSpecs.some((exit) => exit.lockKind === 'none' || exit.lockKind === 'lever')).toBe(true);
        expect(blueprint.bossId).toBe('trap_warden');
        expect(blueprint.objectiveId).toBe('defeat_boss');
        expect(blueprint.threatBudget).toBeGreaterThan(blueprint.rewardBudget);
        expect(blueprint.pairedCardSpecs).toEqual(
            expect.arrayContaining([expect.objectContaining({ bossId: 'trap_warden', label: 'Trap Warden', hp: 3 })])
        );
    });

    it('stamps board dungeon metadata from the floor blueprint', () => {
        const trapBoard = buildBoard(7, {
            runSeed: 42_011,
            runRulesVersion: GAME_RULES_VERSION,
            floorTag: 'boss',
            floorArchetypeId: 'trap_hall',
            gameMode: 'endless'
        });
        const treasureBoard = buildBoard(10, {
            runSeed: 42_011,
            runRulesVersion: GAME_RULES_VERSION,
            floorTag: 'breather',
            floorArchetypeId: 'treasure_gallery',
            gameMode: 'endless'
        });

        expect(trapBoard.dungeonBossId).toBe('trap_warden');
        expect(trapBoard.dungeonObjectiveId).toBe('defeat_boss');
        expect(trapBoard.tiles.filter((tile) => tile.dungeonBossId === 'trap_warden')).toHaveLength(2);
        expect(trapBoard.tiles.find((tile) => tile.dungeonBossId === 'trap_warden')).toMatchObject({
            label: 'Trap Warden',
            dungeonCardHp: 3
        });
        expect(trapBoard.tiles.some((tile) => tile.dungeonCardEffectId === 'rune_seal')).toBe(true);
        expect(treasureBoard.dungeonObjectiveId).toBe('loot_cache');
        expect(treasureBoard.tiles.some((tile) => tile.dungeonCardEffectId === 'treasure_cache')).toBe(true);
    });

    it('summarizes dungeon board state and centralizes dungeon card copy', () => {
        const run = finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 42_012, gameMode: 'endless' }));
        const exitTile = run.board!.tiles.find((tile) => tile.pairKey === EXIT_PAIR_KEY)!;
        const trapTile = run.board!.tiles.find((tile) => tile.dungeonCardKind === 'trap') ?? {
            ...createTile('manual-trap', 'T', '!'),
            label: 'Alarm Trap',
            dungeonCardKind: 'trap' as const,
            dungeonCardState: 'revealed' as const,
            dungeonCardEffectId: 'trap_alarm' as const
        };
        const status = getDungeonBoardStatus(revealDungeonExit(run, exitTile.id));

        expect(status.exitCount).toBeGreaterThanOrEqual(1);
        expect(status.revealedExitCount).toBe(1);
        expect(status.objectiveId).toBe(run.board!.dungeonObjectiveId);
        expect(status.objectiveLabel).toBeTruthy();
        expect(status.objectiveRequired).toBeGreaterThanOrEqual(1);
        expect(getDungeonCardCopy(trapTile)).toMatch(/trap/i);
    });

    it('tracks dungeon objective progress and awards objective rewards on exit activation', () => {
        const bossBoard = buildBoard(7, {
            runSeed: 42_013,
            runRulesVersion: GAME_RULES_VERSION,
            floorTag: 'boss',
            floorArchetypeId: 'trap_hall',
            gameMode: 'endless'
        });
        const baseRun = finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 42_013, gameMode: 'endless' }));
        const bossRun: RunState = { ...baseRun, board: bossBoard, status: 'playing' };
        const bossStatus = getDungeonObjectiveStatus(bossRun);
        expect(bossStatus.objectiveId).toBe('defeat_boss');
        expect(bossStatus.required).toBe(3);
        expect(bossStatus.completed).toBe(false);

        const exitTile: Tile = {
            ...createTile('exit', EXIT_PAIR_KEY, '^'),
            label: 'Primary Safe Exit',
            dungeonCardKind: 'exit',
            dungeonCardState: 'hidden',
            dungeonCardEffectId: 'exit_safe',
            dungeonRouteType: 'safe',
            dungeonExitLockKind: 'none',
            dungeonExitActivated: false
        };
        const rewardRun: RunState = {
            ...createRun([
                {
                    ...createTile('c1', 'C', '$'),
                    label: 'Treasure Cache',
                    dungeonCardKind: 'treasure',
                    dungeonCardState: 'resolved',
                    dungeonCardEffectId: 'treasure_cache'
                },
                {
                    ...createTile('c2', 'C', '$'),
                    label: 'Treasure Cache',
                    dungeonCardKind: 'treasure',
                    dungeonCardState: 'resolved',
                    dungeonCardEffectId: 'treasure_cache'
                },
                exitTile
            ]),
            board: {
                ...createBoard([
                    {
                        ...createTile('c1', 'C', '$'),
                        label: 'Treasure Cache',
                        dungeonCardKind: 'treasure',
                        dungeonCardState: 'resolved',
                        dungeonCardEffectId: 'treasure_cache',
                        state: 'matched'
                    },
                    {
                        ...createTile('c2', 'C', '$'),
                        label: 'Treasure Cache',
                        dungeonCardKind: 'treasure',
                        dungeonCardState: 'resolved',
                        dungeonCardEffectId: 'treasure_cache',
                        state: 'matched'
                    },
                    exitTile
                ]),
                dungeonExitTileId: 'exit',
                dungeonObjectiveId: 'loot_cache',
                dungeonExitLockKind: 'none'
            },
            dungeonTreasuresOpened: 1
        };
        const opened = activateDungeonExit(revealDungeonExit(rewardRun, 'exit'));
        expect(opened.lastLevelResult?.scoreGained).toBeGreaterThan(50);
        expect(opened.stats.totalScore).toBeGreaterThanOrEqual(35);
        expect(opened.relicFavorProgress).toBe(1);
    });

    it('adds at least one exit and can add alternate exits during generation', () => {
        const board = buildBoard(5, {
            runSeed: 123,
            runRulesVersion: GAME_RULES_VERSION,
            floorTag: 'boss',
            floorArchetypeId: 'trap_hall',
            gameMode: 'endless'
        });

        const exits = board.tiles.filter((tile) => tile.pairKey === EXIT_PAIR_KEY);
        expect(exits.length).toBeGreaterThanOrEqual(1);
        expect(exits.length).toBeGreaterThan(1);
        expect(exits[0]!.dungeonCardKind).toBe('exit');
        expect(board.dungeonExitTileId).toBe(exits[0]!.id);
        expect(board.tiles.some((tile) => tile.dungeonCardKind === 'enemy')).toBe(true);
        expect(board.tiles.some((tile) => tile.dungeonCardKind === 'trap')).toBe(true);
    });

    it('uses the revealed exit when multiple exits are present', () => {
        const run = finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 81_004 }));
        const exits = run.board!.tiles.filter((tile) => tile.pairKey === EXIT_PAIR_KEY);
        const board = {
            ...run.board!,
            tiles: [
                ...run.board!.tiles,
                {
                    ...exits[0]!,
                    id: 'manual-safe-exit',
                    label: 'Manual Safe Exit',
                    dungeonRouteType: 'safe' as const,
                    dungeonExitLockKind: 'none' as const
                }
            ]
        };
        const revealed = revealDungeonExit({ ...run, board }, 'manual-safe-exit');
        const status = getDungeonExitStatus(revealed);

        expect(status.exitTile?.id).toBe('manual-safe-exit');
        expect(status.canActivateWithoutSpend).toBe(true);
    });

    it('spawns shop cards on some floors and opens them without granting floor-clear gold', () => {
        const floorOne = buildBoard(1, {
            runSeed: 123,
            runRulesVersion: GAME_RULES_VERSION,
            gameMode: 'endless'
        });
        const treasureFloor = buildBoard(3, {
            runSeed: 123,
            runRulesVersion: GAME_RULES_VERSION,
            floorArchetypeId: 'treasure_gallery',
            gameMode: 'endless'
        });

        expect(floorOne.tiles.some((tile) => tile.pairKey === SHOP_PAIR_KEY)).toBe(false);
        expect(treasureFloor.tiles.filter((tile) => tile.pairKey === SHOP_PAIR_KEY)).toHaveLength(1);

        const run = finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 81_005 }));
        const board = {
            ...run.board!,
            dungeonShopTileId: 'manual-shop',
            tiles: [
                ...run.board!.tiles,
                {
                    ...createTile('manual-shop', SHOP_PAIR_KEY, 'S'),
                    label: 'Vendor Alcove',
                    dungeonCardKind: 'shop' as const,
                    dungeonCardState: 'hidden' as const,
                    dungeonCardEffectId: 'shop_vendor' as const
                }
            ]
        };
        const opened = revealDungeonShop({ ...run, board, shopGold: 3 }, 'manual-shop');

        expect(opened.status).toBe('playing');
        expect(opened.shopGold).toBe(3);
        expect(opened.shopOffers.length).toBeGreaterThan(0);
        expect(opened.dungeonShopVisitedThisFloor).toBe(true);
        expect(opened.board!.dungeonShopVisited).toBe(true);
        const rerolled = rerollShopOffers({ ...opened, shopGold: 10 });
        const reopened = revealDungeonShop(rerolled, 'manual-shop');
        expect(reopened.shopRerolls).toBe(1);
        expect(reopened.shopOffers.map((offer) => offer.id)).toEqual(rerolled.shopOffers.map((offer) => offer.id));
    });

    it('spawns room cards on some dungeon floors', () => {
        const boards = Array.from({ length: 20 }, (_, index) =>
            buildBoard(2, {
                runSeed: 90_000 + index,
                runRulesVersion: GAME_RULES_VERSION,
                floorTag: 'breather',
                gameMode: 'endless'
            })
        );

        expect(boards.some((board) => board.tiles.some((tile) => tile.pairKey === ROOM_PAIR_KEY))).toBe(true);
        for (const board of boards) {
            expect(board.tiles.filter((tile) => tile.pairKey === ROOM_PAIR_KEY).length).toBeLessThanOrEqual(1);
        }
    });

    it('resolves one-shot room cards and lets the forge be reused when paid', () => {
        const campfire = {
            ...createTile('campfire', ROOM_PAIR_KEY, 'C'),
            label: 'Campfire',
            dungeonCardKind: 'room' as const,
            dungeonCardState: 'hidden' as const,
            dungeonCardEffectId: 'room_campfire' as const
        };
        const fountain = {
            ...createTile('fountain', ROOM_PAIR_KEY, 'F'),
            label: 'Fountain',
            dungeonCardKind: 'room' as const,
            dungeonCardState: 'hidden' as const,
            dungeonCardEffectId: 'room_fountain' as const
        };
        const forge = {
            ...createTile('forge', ROOM_PAIR_KEY, 'G'),
            label: 'Forge',
            dungeonCardKind: 'room' as const,
            dungeonCardState: 'hidden' as const,
            dungeonCardEffectId: 'room_forge' as const
        };

        const campfireRun = revealDungeonRoom({ ...createRun([campfire]), lives: MAX_LIVES - 1 }, 'campfire');
        expect(campfireRun.lives).toBe(MAX_LIVES);
        expect(campfireRun.board!.tiles.find((tile) => tile.id === 'campfire')!.dungeonRoomUsed).toBe(true);

        const fountainRun = revealDungeonRoom({ ...createRun([fountain]), stats: { ...createRun([fountain]).stats, guardTokens: 0 } }, 'fountain');
        expect(fountainRun.stats.guardTokens).toBe(1);

        const paidForge = revealDungeonRoom(
            { ...createRun([forge]), shopGold: 4, destroyPairCharges: MAX_DESTROY_PAIR_BANK - 2 },
            'forge'
        );
        const repaidForge = revealDungeonRoom(paidForge, 'forge');
        expect(repaidForge.shopGold).toBe(0);
        expect(repaidForge.destroyPairCharges).toBe(MAX_DESTROY_PAIR_BANK);
        expect(repaidForge.board!.tiles.find((tile) => tile.id === 'forge')!.dungeonCardState).toBe('revealed');
    });

    it('uses map rooms to reveal hidden utility cards on the floor', () => {
        const tiles: Tile[] = [
            {
                ...createTile('map', ROOM_PAIR_KEY, 'M'),
                label: 'Map Room',
                dungeonCardKind: 'room',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'room_map'
            },
            {
                ...createTile('exit', EXIT_PAIR_KEY, 'X'),
                label: 'Exit',
                dungeonCardKind: 'exit',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'exit_safe',
                dungeonExitLockKind: 'none'
            },
            {
                ...createTile('shop', SHOP_PAIR_KEY, 'S'),
                label: 'Vendor Alcove',
                dungeonCardKind: 'shop',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'shop_vendor'
            },
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A')
        ];
        const mapped = revealDungeonRoom(createRun(tiles), 'map');

        expect(mapped.board!.tiles.find((tile) => tile.id === 'exit')!.dungeonCardState).toBe('revealed');
        expect(mapped.board!.tiles.find((tile) => tile.id === 'shop')!.dungeonCardState).toBe('revealed');
        expect(mapped.board!.tiles.find((tile) => tile.id === 'map')!.dungeonCardState).toBe('resolved');
    });

    it('keeps key-locked exits optional so generated floors always have a non-key way out', () => {
        for (let level = 1; level <= 12; level += 1) {
            const board = buildBoard(level, {
                runSeed: 88_100,
                runRulesVersion: GAME_RULES_VERSION,
                floorTag: level % 5 === 0 ? 'boss' : 'normal',
                floorArchetypeId: level % 4 === 0 ? 'treasure_gallery' : level % 3 === 0 ? 'script_room' : null,
                gameMode: 'endless'
            });
            const exits = board.tiles.filter((tile) => tile.pairKey === EXIT_PAIR_KEY);
            expect(exits.length).toBeGreaterThanOrEqual(1);
            expect(exits.some((tile) => tile.dungeonExitLockKind === 'none' || tile.dungeonExitLockKind === 'lever')).toBe(true);
            for (const exit of exits.filter((tile) => tile.dungeonExitLockKind === 'lever')) {
                const leverPairs = new Set(
                    board.tiles.filter((tile) => tile.dungeonCardKind === 'lever').map((tile) => tile.pairKey)
                );
                expect(leverPairs.size).toBeGreaterThanOrEqual(exit.dungeonExitRequiredLeverCount ?? 0);
            }
        }
    });

    it('lets players ignore a key-locked bonus exit and leave through the primary exit', () => {
        const run = finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 81_006 }));
        const primaryExit = run.board!.tiles.find((tile) => tile.pairKey === EXIT_PAIR_KEY)!;
        const board = {
            ...run.board!,
            tiles: [
                ...run.board!.tiles.map((tile) =>
                    tile.id === primaryExit.id ? { ...tile, dungeonExitLockKind: 'none' as const } : tile
                ),
                {
                    ...primaryExit,
                    id: 'bonus-key-exit',
                    label: 'Bonus Key Exit',
                    dungeonExitLockKind: 'iron' as const,
                    dungeonRouteType: 'greed' as const
                }
            ]
        };
        const bonusRevealed = revealDungeonExit({ ...run, board, dungeonKeys: {}, dungeonMasterKeys: 0 }, 'bonus-key-exit');
        expect(getDungeonExitStatus(bonusRevealed).canActivate).toBe(false);

        const primaryRevealed = revealDungeonExit(bonusRevealed, primaryExit.id);
        const cleared = activateDungeonExit(primaryRevealed, 'none');

        expect(cleared.status).toBe('levelComplete');
    });

    it('reveals an exit without resolving a pair or costing life', () => {
        const run = finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 81_001 }));
        const exitTile = run.board!.tiles.find((tile) => tile.pairKey === EXIT_PAIR_KEY)!;
        const revealed = revealDungeonExit(run, exitTile.id);

        expect(revealed.lives).toBe(run.lives);
        expect(revealed.status).toBe('playing');
        expect(revealed.board!.flippedTileIds).toEqual([]);
        expect(getDungeonExitStatus(revealed).revealed).toBe(true);
    });

    it('requires lever pairs before a lever-sealed exit can be activated', () => {
        const run = finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 81_002 }));
        const board = {
            ...run.board!,
            dungeonExitLockKind: 'lever' as const,
            dungeonExitRequiredLeverCount: 1,
            dungeonLeverCount: 0,
            tiles: run.board!.tiles.map((tile) =>
                tile.pairKey === EXIT_PAIR_KEY
                    ? { ...tile, dungeonExitLockKind: 'lever' as const, dungeonExitRequiredLeverCount: 1 }
                    : tile
            )
        };
        const exitTile = board.tiles.find((tile) => tile.pairKey === EXIT_PAIR_KEY)!;
        const revealed = revealDungeonExit({ ...run, board }, exitTile.id);

        expect(getDungeonExitStatus(revealed).canActivate).toBe(false);

        const leverReady = {
            ...revealed,
            board: { ...revealed.board!, dungeonLeverCount: 1 }
        };
        const cleared = activateDungeonExit(leverReady, 'none');

        expect(cleared.status).toBe('levelComplete');
        expect(cleared.board!.dungeonExitActivated).toBe(true);
    });

    it('spends run-local keys or master keys on locked exits', () => {
        const run = finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 81_003 }));
        const board = {
            ...run.board!,
            dungeonExitLockKind: 'iron' as const,
            tiles: run.board!.tiles.map((tile) =>
                tile.pairKey === EXIT_PAIR_KEY ? { ...tile, dungeonExitLockKind: 'iron' as const } : tile
            )
        };
        const exitTile = board.tiles.find((tile) => tile.pairKey === EXIT_PAIR_KEY)!;
        const revealed = revealDungeonExit({ ...run, board, dungeonKeys: { iron: 1 } }, exitTile.id);
        const cleared = activateDungeonExit(revealed, 'key');

        expect(cleared.status).toBe('levelComplete');
        expect(cleared.dungeonKeys.iron).toBe(0);

        const masterRun = revealDungeonExit(
            { ...run, board, dungeonKeys: {}, dungeonMasterKeys: 1 },
            exitTile.id
        );
        const masterCleared = activateDungeonExit(masterRun, 'master_key');

        expect(masterCleared.status).toBe('levelComplete');
        expect(masterCleared.dungeonMasterKeys).toBe(0);
    });

    it('selects the next route by matching a gateway pair on the board', () => {
        const tiles: Tile[] = [
            {
                ...createTile('g1', 'G', 'G'),
                label: 'Greed Gateway',
                dungeonCardKind: 'gateway',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'gateway_greed',
                dungeonRouteType: 'greed'
            },
            {
                ...createTile('g2', 'G', 'G'),
                label: 'Greed Gateway',
                dungeonCardKind: 'gateway',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'gateway_greed',
                dungeonRouteType: 'greed'
            }
        ];
        const resolved = resolveBoardTurn(flipTile(flipTile(createRun(tiles), 'g1'), 'g2'));

        expect(resolved.pendingRouteCardPlan?.routeType).toBe('greed');
        expect(resolved.dungeonGatewaysUsed).toBe(1);
    });

    it('arms traps when revealed without immediately triggering them', () => {
        const tiles: Tile[] = [
            {
                ...createTile('t1', 'T', '!'),
                label: 'Spike Trap',
                dungeonCardKind: 'trap',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'trap_spikes'
            },
            {
                ...createTile('t2', 'T', '!'),
                label: 'Spike Trap',
                dungeonCardKind: 'trap',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'trap_spikes'
            },
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A')
        ];
        const run = createRun(tiles);
        const afterReveal = flipTile(run, 't1');

        expect(afterReveal.dungeonTrapsTriggered).toBe(0);
        expect(afterReveal.lives).toBe(run.lives);
        expect(
            afterReveal.board!.tiles
                .filter((tile) => tile.pairKey === 'T')
                .every((tile) => tile.dungeonCardState === 'revealed')
        ).toBe(true);
    });

    it('disarms trap pairs for a small reward when matched', () => {
        const tiles: Tile[] = [
            {
                ...createTile('t1', 'T', '!'),
                label: 'Spike Trap',
                dungeonCardKind: 'trap',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'trap_spikes'
            },
            {
                ...createTile('t2', 'T', '!'),
                label: 'Spike Trap',
                dungeonCardKind: 'trap',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'trap_spikes'
            },
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A')
        ];
        const run = createRun(tiles);
        const resolved = resolveBoardTurn(flipTile(flipTile(run, 't1'), 't2'));

        expect(resolved.dungeonTrapsTriggered).toBe(0);
        expect(resolved.lives).toBeGreaterThanOrEqual(run.lives);
        expect(resolved.shopGold).toBe(run.shopGold + 1);
        expect(resolved.stats.totalScore).toBeGreaterThan(run.stats.totalScore);
        expect(
            resolved.board!.tiles.filter((tile) => tile.pairKey === 'T').every((tile) => tile.state === 'matched')
        ).toBe(true);
    });

    it('springs armed traps on mismatches', () => {
        const tiles: Tile[] = [
            {
                ...createTile('t1', 'T', '!'),
                label: 'Spike Trap',
                dungeonCardKind: 'trap',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'trap_spikes'
            },
            {
                ...createTile('t2', 'T', '!'),
                label: 'Spike Trap',
                dungeonCardKind: 'trap',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'trap_spikes'
            },
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A')
        ];
        const run = createRun(tiles);
        const afterTrapReveal = flipTile(run, 't1');
        const resolvedMiss = resolveBoardTurn(flipTile(afterTrapReveal, 'a1'));

        expect(resolvedMiss.dungeonTrapsTriggered).toBe(1);
        expect(resolvedMiss.lives).toBeLessThan(run.lives);
        expect(
            resolvedMiss.board!.tiles
                .filter((tile) => tile.pairKey === 'T')
                .every((tile) => tile.dungeonCardState === 'resolved')
        ).toBe(true);
    });

    it('handles mimic and alarm traps with distinct mismatch outcomes', () => {
        const mimicTiles: Tile[] = [
            {
                ...createTile('m1', 'M', '!'),
                label: 'Mimic Trap',
                dungeonCardKind: 'trap',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'trap_mimic'
            },
            {
                ...createTile('m2', 'M', '!'),
                label: 'Mimic Trap',
                dungeonCardKind: 'trap',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'trap_mimic'
            },
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A')
        ];
        const baseMimicRun = createRun(mimicTiles);
        const mimicRun = { ...baseMimicRun, shopGold: 2, stats: { ...baseMimicRun.stats, tries: 1 } };
        const mimicMiss = resolveBoardTurn(flipTile(flipTile(mimicRun, 'm1'), 'a1'));

        expect(mimicMiss.dungeonTrapsTriggered).toBe(1);
        expect(mimicMiss.lives).toBeLessThan(mimicRun.lives);
        expect(mimicMiss.shopGold).toBe(1);

        const alarmTiles: Tile[] = [
            {
                ...createTile('x1', 'X', '!'),
                label: 'Alarm Trap',
                dungeonCardKind: 'trap',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'trap_alarm'
            },
            {
                ...createTile('x2', 'X', '!'),
                label: 'Alarm Trap',
                dungeonCardKind: 'trap',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'trap_alarm'
            },
            {
                ...createTile('e1', 'E', 'E'),
                label: 'Sentry',
                dungeonCardKind: 'enemy',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'enemy_sentry',
                dungeonCardHp: 1,
                dungeonCardMaxHp: 1
            },
            {
                ...createTile('e2', 'E', 'E'),
                label: 'Sentry',
                dungeonCardKind: 'enemy',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'enemy_sentry',
                dungeonCardHp: 1,
                dungeonCardMaxHp: 1
            },
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A')
        ];
        const baseAlarmRun = createRun(alarmTiles);
        const alarmRun = { ...baseAlarmRun, stats: { ...baseAlarmRun.stats, tries: 1 } };
        const alarmMiss = resolveBoardTurn(flipTile(flipTile(alarmRun, 'x1'), 'a1'));

        expect(alarmMiss.dungeonTrapsTriggered).toBe(1);
        expect(alarmMiss.lives).toBe(alarmRun.lives - 1);
        expect(
            alarmMiss.board!.tiles
                .filter((tile) => tile.pairKey === 'E')
                .every((tile) => tile.dungeonCardState === 'revealed')
        ).toBe(true);
    });

    it('rewards treasure caches, rune seals, and depth gateways', () => {
        const tiles: Tile[] = [
            {
                ...createTile('c1', 'C', '$'),
                label: 'Treasure Cache',
                dungeonCardKind: 'treasure',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'treasure_cache'
            },
            {
                ...createTile('c2', 'C', '$'),
                label: 'Treasure Cache',
                dungeonCardKind: 'treasure',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'treasure_cache'
            },
            {
                ...createTile('t1', 'T', '!'),
                label: 'Spike Trap',
                dungeonCardKind: 'trap',
                dungeonCardState: 'revealed',
                dungeonCardEffectId: 'trap_spikes'
            },
            {
                ...createTile('t2', 'T', '!'),
                label: 'Spike Trap',
                dungeonCardKind: 'trap',
                dungeonCardState: 'revealed',
                dungeonCardEffectId: 'trap_spikes'
            },
            {
                ...createTile('r1', 'R', 'R'),
                label: 'Rune Seal',
                dungeonCardKind: 'lever',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'rune_seal'
            },
            {
                ...createTile('r2', 'R', 'R'),
                label: 'Rune Seal',
                dungeonCardKind: 'lever',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'rune_seal'
            },
            {
                ...createTile('g1', 'G', '>'),
                label: 'Depth Gateway',
                dungeonCardKind: 'gateway',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'gateway_depth',
                dungeonRouteType: 'greed'
            },
            {
                ...createTile('g2', 'G', '>'),
                label: 'Depth Gateway',
                dungeonCardKind: 'gateway',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'gateway_depth',
                dungeonRouteType: 'greed'
            }
        ];

        const baseRun = createRun(tiles);
        const treasureRun = resolveBoardTurn(flipTile(flipTile(baseRun, 'c1'), 'c2'));
        expect(treasureRun.shopGold).toBeGreaterThan(baseRun.shopGold + 1);
        expect(treasureRun.dungeonTreasuresOpened).toBe(1);

        const runeRun = resolveBoardTurn(flipTile(flipTile(createRun(tiles), 'r1'), 'r2'));
        expect(
            runeRun.board!.tiles
                .filter((tile) => tile.pairKey === 'T')
                .every((tile) => tile.dungeonCardState === 'resolved')
        ).toBe(true);

        const gatewayRun = resolveBoardTurn(flipTile(flipTile(createRun(tiles), 'g1'), 'g2'));
        expect(gatewayRun.pendingRouteCardPlan?.routeType).toBe('greed');
        expect(gatewayRun.dungeonGatewaysUsed).toBe(1);
    });

    it('runs new singleton room cards and lets locked caches be reopened after finding keys', () => {
        const roomTile = (id: string, effectId: NonNullable<Tile['dungeonCardEffectId']>, label: string): Tile => ({
            ...createTile(id, ROOM_PAIR_KEY, label.charAt(0)),
            label,
            dungeonCardKind: 'room',
            dungeonCardState: 'hidden',
            dungeonCardEffectId: effectId,
            dungeonRoomUsed: false
        });
        const shrineRun = revealDungeonRoom({ ...createRun([roomTile('shrine', 'room_shrine', 'Shrine')]), shopGold: 1 }, 'shrine');
        expect(shrineRun.shopGold).toBe(0);
        expect(shrineRun.stats.guardTokens).toBe(1);

        const armoryRun = revealDungeonRoom(
            { ...createRun([roomTile('armory', 'room_armory', 'Armory')]), destroyPairCharges: 0 },
            'armory'
        );
        expect(armoryRun.destroyPairCharges).toBe(1);

        const scryTiles: Tile[] = [
            roomTile('lens', 'room_scrying_lens', 'Scrying Lens'),
            {
                ...createTile('e1', 'E', 'E'),
                label: 'Sentry',
                dungeonCardKind: 'enemy',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'enemy_sentry'
            },
            {
                ...createTile('e2', 'E', 'E'),
                label: 'Sentry',
                dungeonCardKind: 'enemy',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'enemy_sentry'
            }
        ];
        const scried = revealDungeonRoom(createRun(scryTiles), 'lens');
        expect(
            scried.board!.tiles
                .filter((tile) => tile.pairKey === 'E')
                .every((tile) => tile.dungeonCardState === 'revealed')
        ).toBe(true);

        const lockedCache = roomTile('cache', 'room_locked_cache', 'Locked Cache');
        const unpaid = revealDungeonRoom(createRun([lockedCache]), 'cache');
        expect(unpaid.board!.tiles.find((tile) => tile.id === 'cache')!.dungeonCardState).toBe('revealed');
        expect(unpaid.board!.tiles.find((tile) => tile.id === 'cache')!.dungeonRoomUsed).toBe(false);

        const paid = revealDungeonRoom({ ...unpaid, dungeonKeys: { iron: 1 } }, 'cache');
        expect(paid.dungeonKeys.iron).toBe(0);
        expect(paid.shopGold).toBe(4);
        expect(paid.board!.tiles.find((tile) => tile.id === 'cache')!.dungeonRoomUsed).toBe(true);
    });

    it('lets awake enemies attack on mismatches', () => {
        const tiles: Tile[] = [
            {
                ...createTile('e1', 'E', 'E'),
                label: 'Sentry',
                dungeonCardKind: 'enemy',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'enemy_sentry',
                dungeonCardHp: 1,
                dungeonCardMaxHp: 1
            },
            {
                ...createTile('e2', 'E', 'E'),
                label: 'Sentry',
                dungeonCardKind: 'enemy',
                dungeonCardState: 'hidden',
                dungeonCardEffectId: 'enemy_sentry',
                dungeonCardHp: 1,
                dungeonCardMaxHp: 1
            },
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A')
        ];
        const run = createRun(tiles);
        const afterEnemyReveal = flipTile(run, 'e1');
        const resolvedMiss = resolveBoardTurn(flipTile(afterEnemyReveal, 'a1'));

        expect(resolvedMiss.board!.tiles.find((tile) => tile.id === 'e1')!.dungeonCardState).toBe('revealed');
        expect(resolvedMiss.lives).toBe(run.lives - 1);
    });
});

describe('REG-015 run shop wallet', () => {
    it('earns temporary shop gold on floor clear and can buy one-shot services', () => {
        const cleared = playPerfectFloors(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 15_001 }), 1);
        const shopRun = { ...cleared, shopOffers: createRunShopOffers(cleared) };

        expect(cleared.shopGold).toBeGreaterThanOrEqual(FLOOR_CLEAR_GOLD_BASE);
        expect(cleared.shopOffers).toEqual([]);
        expect(shopRun.shopOffers.map((offer) => offer.itemId).sort()).toEqual([
            'destroy_charge',
            'heal_life',
            'iron_key',
            'peek_charge'
        ]);

        const peekOffer = shopRun.shopOffers.find((offer) => offer.itemId === 'peek_charge')!;
        const boughtPeek = purchaseShopOffer(shopRun, peekOffer.id);
        expect(boughtPeek.peekCharges).toBe(shopRun.peekCharges + 1);
        expect(boughtPeek.shopGold).toBe(shopRun.shopGold - peekOffer.cost);
        expect(boughtPeek.shopOffers.find((offer) => offer.id === peekOffer.id)?.purchased).toBe(true);

        const rebuy = purchaseShopOffer(boughtPeek, peekOffer.id);
        expect(rebuy).toBe(boughtPeek);

        const rerolled = rerollShopOffers({ ...shopRun, shopGold: 6 });
        expect(rerolled.shopRerolls).toBe(1);
        expect(rerolled.shopGold).toBeLessThan(6);
        expect(rerolled.shopOffers.map((offer) => offer.id)).not.toEqual(shopRun.shopOffers.map((offer) => offer.id));
        expect(rerollShopOffers(rerolled)).toBe(rerolled);

        const broke = purchaseShopOffer({ ...shopRun, shopGold: 0 }, shopRun.shopOffers[1]!.id);
        expect(broke.shopGold).toBe(0);
        expect(broke.shopOffers[1]!.purchased).toBe(false);
    });

    it('REG-070 rerolls shop stock once with deterministic pricing', () => {
        const cleared = playPerfectFloors(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 70_001 }), 1);
        const shopRun = { ...cleared, shopOffers: createRunShopOffers(cleared) };
        const idsBefore = shopRun.shopOffers.map((offer) => offer.id);
        const rerolled = rerollShopOffers(shopRun);

        expect(rerolled.shopRerolls).toBe(1);
        expect(rerolled.shopGold).toBe(shopRun.shopGold - 1);
        expect(rerolled.shopOffers.map((offer) => offer.id)).not.toEqual(idsBefore);
        expect(rerollShopOffers(rerolled)).toBe(rerolled);
        expect(canRerollShopOffers({ ...shopRun, shopGold: 0 })).toBe(false);
    });

    it('REG-071 exposes item catalog compatibility and stack caps', () => {
        const fullLifeBase = playPerfectFloors(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 71_001 }), 1);
        const fullLife = {
            ...fullLifeBase,
            lives: MAX_LIVES,
            shopOffers: createRunShopOffers({ ...fullLifeBase, lives: MAX_LIVES })
        };
        const heal = fullLife.shopOffers.find((offer) => offer.itemId === 'heal_life')!;
        expect(heal.compatible).toBe(false);
        expect(heal.unavailableReason).toBe('Life already full.');

        const damaged = { ...fullLife, lives: 3 };
        const healAvailable = createRunShopOffers(damaged).find((offer) => offer.itemId === 'heal_life')!;
        expect(healAvailable.compatible).toBe(true);
        expect(purchaseShopOffer({ ...damaged, shopOffers: [healAvailable], shopGold: 99 }, healAvailable.id).lives).toBe(4);

        const cappedDestroy = { ...fullLife, destroyPairCharges: MAX_DESTROY_PAIR_BANK };
        const destroyOffer = createRunShopOffers(cappedDestroy).find((offer) => offer.itemId === 'destroy_charge')!;
        expect(destroyOffer.compatible).toBe(false);
        expect(destroyOffer.unavailableReason).toContain('bank full');
    });

    it('sells run-local dungeon keys', () => {
        const cleared = playPerfectFloors(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 71_101 }), 1);
        const shopRun = { ...cleared, shopOffers: createRunShopOffers(cleared) };
        const keyOffer = shopRun.shopOffers.find((offer) => offer.itemId === 'iron_key')!;
        const boughtKey = purchaseShopOffer({ ...shopRun, shopGold: 99 }, keyOffer.id);

        expect(boughtKey.dungeonKeys.iron).toBe(1);
        expect(boughtKey.shopOffers.find((offer) => offer.id === keyOffer.id)?.purchased).toBe(true);
    });

    it('REG-072 exposes wallet pacing and sink totals for QA', () => {
        const cleared = playPerfectFloors(createNewRun(0, { echoFeedbackEnabled: false, runSeed: 72_001 }), 2);
        const pacing = getShopWalletPacing(cleared);

        expect(pacing.earnedThisFloor).toBe(FLOOR_CLEAR_GOLD_BASE + 1);
        expect(pacing.totalWallet).toBe(cleared.shopGold);
        expect(pacing.sinkCostTotal).toBe(cleared.shopOffers.reduce((sum, offer) => sum + offer.cost, 0));
        expect(pacing.conversionAtRunEnd).toBe('unspent_shop_gold_expires');
    });
});

describe('endless chapters and featured objectives', () => {
    it('awards only the featured objective bonus on endless floors', () => {
        const started = finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false }));
        const [firstPair, secondPair] = pairTileIds(started.board!);

        const afterFirstMatch = resolveBoardTurn(flipTile(flipTile(started, firstPair![0]!), firstPair![1]!));
        const finished = leaveThroughExit(
            resolveBoardTurn(flipTile(flipTile(afterFirstMatch, secondPair![0]!), secondPair![1]!))
        );

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
        const finished = leaveThroughExit(
            resolveBoardTurn(flipTile(flipTile(afterFirstMatch, secondPair![0]!), secondPair![1]!))
        );

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
        expect(finished.featuredObjectiveStreak).toBe(1);
        expect(finished.lastLevelResult?.featuredObjectiveStreak).toBe(1);
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
        expect(penalty).toBe(14);
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

    it('spends guard or life on the first mismatch after floor 1 instead of granting broad grace', () => {
        const tiles: Tile[] = [
            createTile('a1', 'A', 'A'),
            createTile('a2', 'A', 'A'),
            createTile('b1', 'B', 'B'),
            createTile('b2', 'B', 'B')
        ];
        const floorTwoBoard = { ...createBoard(tiles), level: 2 };
        const guarded = {
            ...createRun(tiles),
            board: floorTwoBoard,
            stats: { ...createRun(tiles).stats, guardTokens: 1 }
        };
        const guardedResolved = resolveBoardTurn(flipTile(flipTile(guarded, 'a1'), 'b1'));
        expect(guardedResolved.lives).toBe(4);
        expect(guardedResolved.stats.guardTokens).toBe(0);

        const lastLife = {
            ...createRun(tiles),
            board: floorTwoBoard,
            lives: 1
        };
        const lastLifeResolved = resolveBoardTurn(flipTile(flipTile(lastLife, 'a1'), 'b1'));
        expect(lastLifeResolved.status).toBe('gameOver');
        expect(lastLifeResolved.lives).toBe(0);
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
        expect(afterLifeLoss.pendingMemorizeBonusMs).toBe(MEMORIZE_BONUS_PER_LIFE_LOST_MS);

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
        expect(resolved.stats.totalScore).toBe(155);
        expect(resolved.stats.currentLevelScore).toBe(155);
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
        expect(secondMatch.stats.totalScore).toBe(240);
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
        expect(resolved.stats.totalScore).toBe(215);
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

    it('grants destroy charge on perfect clear when advancing and respects cap', () => {
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
                perfect: true,
                mistakes: 0,
                clearLifeReason: 'perfect' as const,
                clearLifeGained: 0
            }
        };
        expect(advanceToNextLevel(base).destroyPairCharges).toBe(1);

        const clean = {
            ...base,
            lastLevelResult: { ...base.lastLevelResult!, perfect: false, mistakes: 1, clearLifeReason: 'clean' as const }
        };
        expect(advanceToNextLevel(clean).destroyPairCharges).toBe(0);

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
        expect(penalty).toBe(4);
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

    it('extends the deadline on each gauntlet floor clear', () => {
        const started = finishMemorizePhase(createGauntletRun(0, 60_000));
        const deadline = 1_900_000;
        const finished = clearRealPairs({ ...started, gauntletDeadlineMs: deadline });

        expect(finished.status).toBe('levelComplete');
        expect(finished.gauntletDeadlineMs).toBe(deadline + GAUNTLET_FLOOR_CLEAR_TIME_BONUS_MS);
    });
});
