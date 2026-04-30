import { describe, expect, it } from 'vitest';
import type { RouteNodeType, RunState } from './contracts';
import { createDailyRun, createNewRun } from './game-core';
import { pickFloorScheduleEntry } from './floor-mutator-schedule';
import {
    applyRelicOfferService,
    createRelicOfferServices,
    MAX_RELIC_PICKS_PER_RUN,
    getContextualRelicDraftWeight,
    getRelicDraftContext,
    getRelicBuildArchetypeSummaries,
    getRelicDraftRow,
    getRelicDraftOptionReasons,
    isRelicDraftEligible,
    effectiveRelicDraftWeight,
    relicMilestoneIndexForFloor,
    needsRelicPick,
    rollRelicOptions,
    RELIC_POOL
} from './relics';

const levelCompleteRun = (level: number, tiersClaimed: number, overrides: Partial<RunState> = {}): RunState => {
    const base = createNewRun(0);
    return {
        ...base,
        gameMode: 'endless',
        status: 'levelComplete',
        relicTiersClaimed: tiersClaimed,
        relicOffer: null,
        lastLevelResult: {
            level,
            scoreGained: 10,
            rating: 'S',
            livesRemaining: 3,
            perfect: false,
            mistakes: 0,
            clearLifeReason: 'none',
            clearLifeGained: 0
        },
        ...overrides
    } as RunState;
};

const withPendingRoute = (run: RunState, routeType: RouteNodeType): RunState => ({
    ...run,
    pendingRouteCardPlan: {
        choiceId: `test:${run.runRulesVersion}:${run.runSeed}:${run.lastLevelResult?.level ?? 0}:${routeType}`,
        routeType,
        sourceLevel: run.lastLevelResult?.level ?? 0,
        targetLevel: (run.lastLevelResult?.level ?? 0) + 1
    }
});

const withActiveRouteProfile = (run: RunState, routeType: RouteNodeType): RunState => ({
    ...run,
    board: run.board
        ? {
              ...run.board,
              routeWorldProfile: {
                  routeType,
                  intensity: routeType,
                  choiceId: `active:${routeType}`,
                  sourceLevel: Math.max(0, run.board.level - 1),
                  targetLevel: run.board.level,
                  hazardBudget: routeType === 'greed' ? 2 : 0,
                  rewardBudget: routeType === 'safe' ? 1 : 2,
                  safetyBudget: routeType === 'safe' ? 1 : 0,
                  informationBudget: routeType === 'mystery' ? 2 : 0,
                  routeSpecialKinds: [],
                  summary: `Active ${routeType} profile`
              }
          }
        : run.board
});

describe('relicMilestoneIndexForFloor', () => {
    it('maps milestone floors to tier indices', () => {
        expect(relicMilestoneIndexForFloor(3)).toBe(0);
        expect(relicMilestoneIndexForFloor(6)).toBe(1);
        expect(relicMilestoneIndexForFloor(9)).toBe(2);
        expect(relicMilestoneIndexForFloor(12)).toBe(3);
        expect(relicMilestoneIndexForFloor(15)).toBe(4);
    });

    it('returns null for non-milestone floors', () => {
        expect(relicMilestoneIndexForFloor(2)).toBe(null);
        expect(relicMilestoneIndexForFloor(4)).toBe(null);
        expect(relicMilestoneIndexForFloor(7)).toBe(null);
    });
});

describe('needsRelicPick', () => {
    it('is true on milestone floor when tier not yet claimed', () => {
        expect(needsRelicPick(levelCompleteRun(3, 0))).toBe(true);
    });

    it('is false for puzzle mode', () => {
        expect(needsRelicPick(levelCompleteRun(3, 0, { gameMode: 'puzzle' }))).toBe(false);
    });

    it('is false after max picks', () => {
        expect(needsRelicPick(levelCompleteRun(15, MAX_RELIC_PICKS_PER_RUN))).toBe(false);
    });

    it('is true for floor 12 after three prior picks', () => {
        expect(needsRelicPick(levelCompleteRun(12, 3))).toBe(true);
    });
});

describe('effectiveRelicDraftWeight', () => {
    it('raises rare/common effective ratio as tierIndex increases (tier scaling)', () => {
        const commonId = 'extra_shuffle_charge';
        const rareId = 'parasite_ward_once';
        const r0 = effectiveRelicDraftWeight(rareId, 0) / effectiveRelicDraftWeight(commonId, 0);
        const r5 = effectiveRelicDraftWeight(rareId, 5) / effectiveRelicDraftWeight(commonId, 5);
        expect(r5).toBeGreaterThan(r0);
    });

    it('keeps common weight flat across tiers', () => {
        const w0 = effectiveRelicDraftWeight('memorize_bonus_ms', 0);
        const w10 = effectiveRelicDraftWeight('memorize_bonus_ms', 10);
        expect(w10).toBe(w0);
    });
});

describe('rollRelicOptions', () => {
    it('REG-019 groups relics into at least three multi-relic build archetypes', () => {
        const summaries = getRelicBuildArchetypeSummaries();
        const multiRelicArchetypes = summaries.filter((summary) => summary.relicIds.length >= 2);

        expect(multiRelicArchetypes.length).toBeGreaterThanOrEqual(3);
        expect(summaries.find((summary) => summary.id === 'combo_sustain')?.relicIds).toEqual(
            expect.arrayContaining(['combo_shard_plus_step', 'guard_token_plus_one'])
        );
        expect(summaries.find((summary) => summary.id === 'safe_reveal')?.relicIds).toEqual(
            expect.arrayContaining(['peek_charge_plus_one', 'stray_charge_plus_one'])
        );
        expect(summaries.find((summary) => summary.id === 'risk_favor')?.relicIds).toEqual(
            expect.arrayContaining(['shrine_echo', 'wager_surety'])
        );
    });

    it('is deterministic for the same seed, tier, floor, and pickRound', () => {
        const run = createNewRun(0);
        const a = rollRelicOptions(run, 2, 9, 0);
        const b = rollRelicOptions(run, 2, 9, 0);
        expect(a).toEqual(b);
    });

    it('uses pickRound in the RNG (rerolls are not identical to round 0)', () => {
        const run = createNewRun(42);
        const r0 = rollRelicOptions(run, 0, 3, 0);
        const r1 = rollRelicOptions(run, 0, 3, 1);
        expect(r0.length).toBe(3);
        expect(r1.length).toBe(3);
        expect(r0).not.toEqual(r1);
    });

    it('returns at most three options from the pool', () => {
        const run = createNewRun(0);
        const opts = rollRelicOptions(run, 0, 3);
        expect(opts.length).toBeLessThanOrEqual(3);
        for (const id of opts) {
            expect(RELIC_POOL).toContain(id);
        }
    });

    it('when three or fewer relics remain, returns all remaining without duplicates', () => {
        const run = createNewRun(42);
        const taken = RELIC_POOL.slice(0, RELIC_POOL.length - 3);
        const runNarrow: RunState = { ...run, relicIds: taken };
        const opts = rollRelicOptions(runNarrow, 4, 21);
        expect(opts.length).toBe(3);
        expect(new Set(opts).size).toBe(3);
        for (const id of opts) {
            expect(taken).not.toContain(id);
        }
    });

    it('hard-filters relics that conflict with noShuffle and noDestroy contracts', () => {
        const run = levelCompleteRun(3, 0, {
            activeContract: { noShuffle: true, noDestroy: true, maxMismatches: null }
        });

        expect(isRelicDraftEligible('extra_shuffle_charge', run)).toBe(false);
        expect(isRelicDraftEligible('first_shuffle_free_per_floor', run)).toBe(false);
        expect(isRelicDraftEligible('region_shuffle_free_first', run)).toBe(false);
        expect(isRelicDraftEligible('destroy_bank_plus_one', run)).toBe(false);
        expect(rollRelicOptions(run, 0, 3, 0)).not.toContain('extra_shuffle_charge');
        expect(rollRelicOptions(run, 0, 3, 0)).not.toContain('destroy_bank_plus_one');
    });

    it('guarantees a deterministic contextual spotlight for scheduled Endless drafts', () => {
        const run = levelCompleteRun(2, 0, {
            activeMutators: ['short_memorize'],
            board: {
                ...createNewRun(7).board!,
                level: 2,
                floorArchetypeId: 'speed_trial',
                featuredObjectiveId: 'flip_par'
            }
        });

        const a = rollRelicOptions(run, 0, 2, 0);
        const b = rollRelicOptions(run, 0, 2, 0);
        const reasons = getRelicDraftOptionReasons(run, 2, a);

        expect(a).toEqual(b);
        expect(a).toHaveLength(3);
        expect(Object.values(reasons ?? {})).toContain('Answers short memorize');
    });

    it('keeps non-Endless drafts on base odds except hard filters', () => {
        const daily = {
            ...createDailyRun(0),
            status: 'levelComplete' as const,
            lastLevelResult: {
                level: 3,
                scoreGained: 10,
                rating: 'S' as const,
                livesRemaining: 3,
                perfect: false,
                mistakes: 0,
                clearLifeReason: 'none' as const,
                clearLifeGained: 0
            }
        };

        expect(getRelicDraftOptionReasons(daily, 3, rollRelicOptions(daily, 0, 3))).toBeUndefined();
        expect(isRelicDraftEligible('chapter_compass', daily)).toBe(false);
        expect(isRelicDraftEligible('wager_surety', daily)).toBe(false);
        expect(isRelicDraftEligible('parasite_ledger', daily)).toBe(false);
    });

    it('chapter_compass strengthens contextual spotlight weights without adding draft slots', () => {
        const run = levelCompleteRun(2, 0, {
            activeMutators: ['short_memorize'],
            board: {
                ...createNewRun(11).board!,
                level: 2,
                floorArchetypeId: 'speed_trial',
                featuredObjectiveId: 'flip_par'
            }
        });
        const baseWeight = getContextualRelicDraftWeight(
            'memorize_under_short_memorize',
            getRelicDraftContext(run, 2),
            0
        );
        const compassRun: RunState = { ...run, relicIds: ['chapter_compass'] };
        const compassWeight = getContextualRelicDraftWeight(
            'memorize_under_short_memorize',
            getRelicDraftContext(compassRun, 2),
            0
        );
        const options = rollRelicOptions(compassRun, 0, 2, 0);

        expect(compassWeight).toBeGreaterThan(baseWeight);
        expect(options).toHaveLength(3);
        expect(options).not.toContain('chapter_compass');
    });

    it('derives route draft context from pending route before active board profile', () => {
        const base = withActiveRouteProfile(levelCompleteRun(3, 0), 'mystery');
        const pendingGreed = withPendingRoute(base, 'greed');
        const context = getRelicDraftContext(pendingGreed, 3);

        expect(context.pendingRouteType).toBe('greed');
        expect(context.activeRouteType).toBe('mystery');
        expect(context.routeType).toBe('greed');
        expect(context.routePressure).toBe('greed');
        expect(context.routeReasonSource).toBe('pending_route');
    });

    it('derives route draft context from active board profile when no pending route exists', () => {
        const run = withActiveRouteProfile(levelCompleteRun(3, 0), 'mystery');
        const context = getRelicDraftContext(run, 3);

        expect(context.pendingRouteType).toBeNull();
        expect(context.activeRouteType).toBe('mystery');
        expect(context.routeType).toBe('mystery');
        expect(context.routeReasonSource).toBe('active_board');
    });

    it('nudges weights and reasons for Greed, Mystery, and Safe route context', () => {
        const base = levelCompleteRun(3, 0);
        const neutral = getRelicDraftContext(base, 3);
        const greed = getRelicDraftContext(withPendingRoute(base, 'greed'), 3);
        const mystery = getRelicDraftContext(withPendingRoute(base, 'mystery'), 3);
        const safe = getRelicDraftContext(withPendingRoute(base, 'safe'), 3);

        expect(getRelicDraftOptionReasons(withPendingRoute(base, 'greed'), 3, ['guard_token_plus_one'])).toEqual({
            guard_token_plus_one: 'Answers Greed pressure'
        });
        expect(getRelicDraftOptionReasons(withPendingRoute(base, 'mystery'), 3, ['peek_charge_plus_one'])).toEqual({
            peek_charge_plus_one: 'Reads Mystery routes'
        });
        expect(getRelicDraftOptionReasons(withPendingRoute(base, 'safe'), 3, ['memorize_bonus_ms'])).toEqual({
            memorize_bonus_ms: 'Supports Safe routing'
        });
        expect(getContextualRelicDraftWeight('guard_token_plus_one', greed, 0)).toBeGreaterThan(
            getContextualRelicDraftWeight('guard_token_plus_one', neutral, 0)
        );
        expect(getContextualRelicDraftWeight('pin_cap_plus_one', mystery, 0)).toBeGreaterThan(
            getContextualRelicDraftWeight('pin_cap_plus_one', neutral, 0)
        );
        expect(getContextualRelicDraftWeight('memorize_bonus_ms', safe, 0)).toBeGreaterThan(
            getContextualRelicDraftWeight('memorize_bonus_ms', neutral, 0)
        );
    });

    it('keeps route-only relic context as weights, not a guaranteed spotlight slot', () => {
        let foundDraftWithoutRouteReason = false;
        for (let seed = 9_000; seed < 9_120; seed += 1) {
            const run = withPendingRoute(levelCompleteRun(3, 0, { runSeed: seed }), 'greed');
            const options = rollRelicOptions(run, 0, 3, 0);
            const reasons = getRelicDraftOptionReasons(run, 3, options);
            if (!Object.values(reasons ?? {}).includes('Answers Greed pressure')) {
                foundDraftWithoutRouteReason = true;
                break;
            }
        }

        expect(foundDraftWithoutRouteReason).toBe(true);
    });

    it('keeps route-boosted relics subject to contract filters', () => {
        const run = withPendingRoute(
            levelCompleteRun(3, 0, {
                activeContract: { noShuffle: true, noDestroy: false, maxMismatches: null }
            }),
            'safe'
        );
        const options = rollRelicOptions(run, 0, 3, 0);

        expect(isRelicDraftEligible('region_shuffle_free_first', run)).toBe(false);
        expect(options).not.toContain('region_shuffle_free_first');
    });

    it('keeps Endless contextual drafts varied and valid across floors 1-24', () => {
        const base = createNewRun(42001);

        for (let floor = 1; floor <= 24; floor += 1) {
            const entry = pickFloorScheduleEntry(base.runSeed, base.runRulesVersion, floor, 'endless');
            const run = levelCompleteRun(floor, 0, {
                runSeed: base.runSeed,
                runRulesVersion: base.runRulesVersion,
                activeMutators: entry.mutators,
                board: {
                    ...base.board!,
                    level: floor,
                    floorArchetypeId: entry.floorArchetypeId,
                    featuredObjectiveId: entry.featuredObjectiveId,
                    floorTag: entry.floorTag
                }
            });
            const tier = Math.max(0, relicMilestoneIndexForFloor(floor) ?? 0);
            const options = rollRelicOptions(run, tier, floor, 0);
            const reasons = getRelicDraftOptionReasons(run, floor, options);

            expect(new Set(options).size).toBe(options.length);
            expect(options.length).toBeLessThanOrEqual(3);
            expect(options.length).toBe(3);
            if (reasons) {
                expect(options.some((id) => reasons[id] != null)).toBe(true);
            }
        }
    });
});

describe('REG-078 relic offer services', () => {
    const openOfferRun = (): RunState => {
        const run = levelCompleteRun(3, 0, { shopGold: 5, runSeed: 78_001 });
        const offer = {
            tier: 1,
            options: rollRelicOptions(run, 0, 3, 0),
            picksRemaining: 1,
            pickRound: 0
        };
        return { ...run, relicOffer: offer };
    };

    it('exposes reroll, ban, and upgrade services with costs and availability', () => {
        const run = openOfferRun();
        const rows = createRelicOfferServices(run);

        expect(rows.map((row) => row.serviceId)).toEqual(['reroll_offer', 'ban_option', 'upgrade_offer']);
        expect(rows.every((row) => row.available && row.cost > 0)).toBe(true);
        expect(createRelicOfferServices({ ...run, shopGold: 0 }).every((row) => !row.available)).toBe(true);
    });

    it('rerolls and bans deterministically while charging shop gold once per round', () => {
        const run = openOfferRun();
        const rerolled = applyRelicOfferService(run, 'reroll_offer');
        expect(rerolled.applied).toBe(true);
        expect(rerolled.run.shopGold).toBe(run.shopGold - 2);
        expect(rerolled.run.relicOffer?.options).not.toEqual(run.relicOffer?.options);
        expect(applyRelicOfferService(rerolled.run, 'reroll_offer').applied).toBe(false);

        const banned = applyRelicOfferService(openOfferRun(), 'ban_option', run.relicOffer!.options[1]);
        expect(banned.applied).toBe(true);
        expect(banned.run.relicOffer?.bannedRelicIds).toContain(run.relicOffer!.options[1]);
        expect(banned.run.relicOffer?.options).not.toContain(run.relicOffer!.options[1]);
    });

    it('upgrade service biases visible options toward uncommon or rare relics', () => {
        const run = openOfferRun();
        const upgraded = applyRelicOfferService(run, 'upgrade_offer');

        expect(upgraded.applied).toBe(true);
        expect(upgraded.run.shopGold).toBe(run.shopGold - 3);
        expect(upgraded.run.relicOffer?.upgradedOffer).toBe(true);
        const rarities = upgraded.run.relicOffer!.options.map((id) => getRelicDraftRow(id).rarity);
        expect(rarities.some((rarity) => rarity !== 'common')).toBe(true);
    });
});
