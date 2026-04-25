import { describe, expect, it } from 'vitest';
import { createNewRun } from './game';
import {
    buildRunInventory,
    getRunConsumableRows,
    getRunInventoryLoadoutRows,
    RUN_LOADOUT_SLOT_LIMIT
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
            'stray_remove_charge'
        ]);
        expect(inventory.consumables.every((row) => row.quantity <= row.maxStack)).toBe(true);
        expect(getRunConsumableRows({ ...run, shuffleCharges: 99 }).find((row) => row.id === 'shuffle_charge')?.quantity).toBe(3);
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
