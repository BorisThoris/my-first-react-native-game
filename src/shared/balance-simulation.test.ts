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
        expect(result.aggregate.shopSinkBudget).toBeGreaterThan(0);
    });

    it('guards the shipped balance baseline against large drift', () => {
        const result = runBalanceSimulation({ seed: 42_001, floors: 12, rulesVersion: GAME_RULES_VERSION });
        const drift = assertBalanceSimulationWithinBaseline(result, BALANCE_SIMULATION_BASELINE);

        expect(drift.ok).toBe(true);
        expect(drift.issues).toEqual([]);
    });
});
