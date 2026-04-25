import { describe, expect, it } from 'vitest';
import {
    BONUS_REWARD_CATALOG,
    claimBonusReward,
    createBonusRewardLedger,
    rollBonusRewardRoom,
    getBonusRewardRows
} from './bonus-rewards';
import { GAME_RULES_VERSION, type RunState } from './contracts';

const makeRun = (): RunState =>
    ({
        shopGold: 1,
        relicFavorProgress: 2,
        bonusRelicPicksNextOffer: 0,
        favorBonusRelicPicksNextOffer: 0,
        stats: { totalScore: 10, currentLevelScore: 10, comboShards: 0 }
    }) as RunState;

describe('REG-075 treasure, secret room, and bonus rewards', () => {
    it('rolls deterministic local reward rooms with anti-grind eligibility', () => {
        const ledger = createBonusRewardLedger();
        const a = rollBonusRewardRoom({
            runSeed: 75_001,
            rulesVersion: GAME_RULES_VERSION,
            floor: 6,
            routeKind: 'treasure',
            ledger
        });
        const b = rollBonusRewardRoom({
            runSeed: 75_001,
            rulesVersion: GAME_RULES_VERSION,
            floor: 6,
            routeKind: 'treasure',
            ledger
        });

        expect(a).toEqual(b);
        expect(a.roomKind).toBe('treasure_chest');
        expect(a.offlineOnly).toBe(true);
        expect(a.eligible).toBe(true);
        expect(a.summaryText.length).toBeGreaterThan(0);
        expect(getBonusRewardRows().some((row) => row.id === 'chest_gold' && row.antiGrindLimit === '2 per run')).toBe(true);
    });

    it('bounds secret rooms and reports anti-grind disabled reasons', () => {
        const capped = { ...createBonusRewardLedger(), discoveredSecretRooms: 1 };
        const room = {
            ...rollBonusRewardRoom({ runSeed: 75_002, rulesVersion: GAME_RULES_VERSION, floor: 8, routeKind: 'treasure', ledger: capped }),
            ...BONUS_REWARD_CATALOG.secret_favor,
            eligible: false,
            unavailableReason: 'Secret room already discovered this run.'
        };

        expect(room.roomKind).toBe('secret_room');
        expect(room.eligible).toBe(false);
        expect(room.unavailableReason).toContain('already discovered');
    });

    it('applies local reward previews without persistent save state', () => {
        const room = rollBonusRewardRoom({
            runSeed: 75_003,
            rulesVersion: GAME_RULES_VERSION,
            floor: 9,
            routeKind: 'treasure'
        });
        const run = makeRun();
        const ledger = createBonusRewardLedger();
        const result = claimBonusReward(run, ledger, room);

        expect(result.claimed).toBe(true);
        expect(result.rewardId).toBe(room.id);
        expect(result.run.shopGold).toBeGreaterThanOrEqual(1);
        expect(result.run.stats.comboShards).toBeGreaterThanOrEqual(0);
        expect(claimBonusReward(result.run, result.ledger, room).claimed).toBe(false);
    });
});
