import { describe, expect, it } from 'vitest';
import { createNewRun } from './game-core';
import { createRunShopOffers, purchaseShopOffer } from './shop-rules';
import {
    buildRunInventory,
    gainRunInventoryItem,
    getRunConsumableRows,
    getRunInventoryLoadoutRows,
    RUN_LOADOUT_SLOT_LIMIT,
    useRunInventoryItem
} from './run-inventory';

describe('REG-079 run inventory, consumables, and loadout model', () => {
    it('derives run-scoped consumables from current charges and stack limits', () => {
        const run = createNewRun(0);
        const inventory = buildRunInventory(run);

        expect(inventory.offlineOnly).toBe(true);
        expect(inventory.consumables.map((row) => row.id)).toEqual([
            'shuffle_charge',
            'region_shuffle_charge',
            'destroy_charge',
            'peek_charge',
            'stray_remove_charge',
            'iron_key',
            'master_key'
        ]);
        expect(inventory.consumables.every((row) => row.quantity <= row.maxStack)).toBe(true);
        expect(getRunConsumableRows({ ...run, shuffleCharges: 99 }).find((row) => row.id === 'shuffle_charge')?.quantity).toBe(3);
    });

    it('connects shop and treasure key rewards to the same run-only inventory rows', () => {
        const shopRun = createNewRun(0, { runSeed: 52_001 });
        const withShop = { ...shopRun, shopGold: 5, shopOffers: createRunShopOffers(shopRun) };
        const keyOffer = withShop.shopOffers.find((offer) => offer.itemId === 'iron_key')!;
        const purchased = purchaseShopOffer(withShop, keyOffer.id);
        const treasureRewarded = gainRunInventoryItem(purchased, 'master_key');
        const inventory = buildRunInventory(treasureRewarded);

        expect(inventory.consumables.find((row) => row.id === 'iron_key')?.quantity).toBe(1);
        expect(inventory.consumables.find((row) => row.id === 'master_key')?.quantity).toBe(1);
        expect(inventory.consumables.find((row) => row.id === 'iron_key')?.source).toContain('treasure rooms');
    });

    it('uses deterministic run consumables without touching meta inventory', () => {
        const run = gainRunInventoryItem(
            gainRunInventoryItem(
                { ...createNewRun(0), shuffleCharges: 0, dungeonKeys: { treasure: 1 }, dungeonMasterKeys: 1 },
                'peek_charge'
            ),
            'iron_key'
        );
        const peeked = useRunInventoryItem(run, 'peek_charge');
        const keyed = useRunInventoryItem(peeked.run, 'iron_key');
        const mastered = useRunInventoryItem(keyed.run, 'master_key');

        expect(peeked.applied).toBe(true);
        expect(peeked.run.peekCharges).toBe(run.peekCharges - 1);
        expect(keyed.applied).toBe(true);
        expect(keyed.run.dungeonKeys.iron).toBe(0);
        expect(keyed.run.dungeonKeys.treasure).toBe(1);
        expect(mastered.applied).toBe(true);
        expect(mastered.run.dungeonMasterKeys).toBe(0);
        expect(useRunInventoryItem({ ...run, activeContract: { noShuffle: true, noDestroy: false, maxMismatches: null } }, 'shuffle_charge')).toMatchObject({
            applied: false,
            reason: 'unavailable'
        });
    });

    it('separates mutable mid-run consumables from fixed loadout slots', () => {
        const run = createNewRun(0, {
            initialRelicIds: ['chapter_compass', 'wager_surety'],
            activeMutators: ['short_memorize', 'wide_recall']
        });
        const loadout = getRunInventoryLoadoutRows(run);

        expect(loadout).toHaveLength(RUN_LOADOUT_SLOT_LIMIT);
        expect(loadout.filter((slot) => slot.mutableDuringRun)).toHaveLength(0);
        expect(loadout.map((slot) => slot.source)).toEqual(['relic', 'relic', 'mutator', 'mutator']);
        expect(loadout[0]?.changeWindow).toContain('Relic draft');
    });
});
