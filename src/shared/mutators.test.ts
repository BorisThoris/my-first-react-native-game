import { describe, expect, it } from 'vitest';
import type { MutatorId, RunState } from './contracts';
import { DAILY_MUTATOR_TABLE, MUTATOR_CATALOG, hasMutator } from './mutators';

describe('mutators', () => {
    it('hasMutator reflects activeMutators', () => {
        const run = { activeMutators: ['wide_recall'] as MutatorId[] } as RunState;
        expect(hasMutator(run, 'wide_recall')).toBe(true);
        expect(hasMutator(run, 'glass_floor')).toBe(false);
    });

    it('daily table has no duplicates and matches catalog keys', () => {
        expect(new Set(DAILY_MUTATOR_TABLE).size).toBe(DAILY_MUTATOR_TABLE.length);
        for (const id of DAILY_MUTATOR_TABLE) {
            expect(MUTATOR_CATALOG[id]).toBeDefined();
        }
    });
});
