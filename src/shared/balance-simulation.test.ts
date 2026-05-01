import { describe, expect, it } from 'vitest';
import {
    BALANCE_SIMULATION_BASELINE,
    assertBalanceSimulationWithinBaseline,
    runBalanceSimulation
} from './balance-simulation';
import { GAME_RULES_VERSION } from './contracts';

describe('REG-086 balance simulation economy and drop-rate tuning', () => {
    it('runs deterministic offline economy and drop-rate simulations', () => {
        const result = runBalanceSimulation({ seed: 42_001, floors: 12, rulesVersion: GAME_RULES_VERSION });

        expect(result.offlineOnly).toBe(true);
        expect(result.samples).toHaveLength(12);
        expect(result.aggregate.totalShopGoldEarned).toBeGreaterThan(0);
        expect(result.aggregate.findablePickupPairs).toBeGreaterThanOrEqual(12);
        expect(result.aggregate.bossFloors).toBe(2);
        expect(result.aggregate.breatherFloors).toBe(3);
        expect(result.aggregate.eliteFloors).toBeGreaterThan(0);
        expect(result.aggregate.enemyThreatPairs).toBeGreaterThan(0);
        expect(result.aggregate.movingEnemyHazards).toBeGreaterThan(0);
        expect(result.aggregate.bossMovingEnemyHazards).toBe(2);
        expect(result.aggregate.contactRisk).toBe(result.aggregate.movingEnemyHazards);
        expect(result.aggregate.shopSinkBudget).toBeGreaterThan(0);
        expect(result.aggregate.relicFavorPotential).toBeGreaterThan(0);
        expect(result.aggregate.comboShardPotential).toBeGreaterThan(0);
        expect(result.aggregate.guardRewardPotential).toBeGreaterThan(0);
        expect(result.aggregate.relicOfferAvailable).toBe(4);
        expect(result.aggregate.consumableRewardPotential).toBeGreaterThan(0);
        expect(result.aggregate.treasureRewardPairs).toBeGreaterThan(0);
        expect(result.rows.map((row) => row.key)).toEqual(
            expect.arrayContaining([
                'avg_moving_enemy_hazards_per_floor',
                'avg_contact_risk_per_floor',
                'elite_route_node_share',
                'avg_relic_favor_potential_per_floor',
                'avg_combo_shard_potential_per_floor',
                'avg_guard_reward_potential_per_floor',
                'relic_offer_cadence',
                'avg_consumable_reward_potential_per_floor',
                'avg_treasure_reward_pairs_per_floor',
                'reward_band_spread'
            ])
        );
        const newRewardRows = new Set([
            'avg_relic_favor_potential_per_floor',
            'avg_combo_shard_potential_per_floor',
            'avg_guard_reward_potential_per_floor',
            'relic_offer_cadence',
            'avg_consumable_reward_potential_per_floor',
            'avg_treasure_reward_pairs_per_floor',
            'reward_band_spread'
        ]);
        expect(result.rows.filter((row) => newRewardRows.has(row.key) && row.status !== 'within_range')).toEqual([]);
        expect(result.samples.some((sample) => sample.dungeonNodeKind === 'elite' && sample.enemyThreatPairs >= 2)).toBe(
            true
        );
        expect(new Set(result.samples.map((sample) => sample.floorBand))).toEqual(new Set(['early', 'mid', 'late']));
    });

    it('guards the shipped balance baseline against large drift', () => {
        const result = runBalanceSimulation({ seed: 42_001, floors: 12, rulesVersion: GAME_RULES_VERSION });
        const drift = assertBalanceSimulationWithinBaseline(result, BALANCE_SIMULATION_BASELINE);

        expect(drift.ok).toBe(true);
        expect(drift.issues).toEqual([]);
    });
});
