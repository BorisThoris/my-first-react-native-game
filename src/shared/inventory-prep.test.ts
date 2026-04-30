import { describe, expect, it } from 'vitest';
import { createNewRun } from './game-core';
import { getInventoryPrepRows } from './inventory-prep';

describe('REG-094 inventory prep rows', () => {
    it('summarizes capacity, mutability, and next prep action from run state', () => {
        const rows = getInventoryPrepRows(createNewRun(0));

        expect(rows.map((row) => row.id)).toEqual(['run_prep', 'loadout_capacity', 'mutable_windows']);
        expect(rows.find((row) => row.id === 'loadout_capacity')?.localOnly).toBe(true);
        expect(rows.find((row) => row.id === 'loadout_capacity')?.detail).toMatch(/locked/i);
        expect(rows.find((row) => row.id === 'mutable_windows')?.detail).toMatch(/shops|drafts|mid-run/i);
    });
});
