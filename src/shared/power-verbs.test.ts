import { describe, expect, it } from 'vitest';
import { createNewRun, finishMemorizePhase } from './game-core';
import { getPowerVerbRows, POWER_VERB_GROUPS } from './power-verbs';

describe('REG-045 power verb teaching', () => {
    it('groups every shipped toolbar power by cognitive job with cost and consequence copy', () => {
        const run = finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false, gameMode: 'puzzle' }));
        const rows = getPowerVerbRows(run);

        expect(Object.keys(POWER_VERB_GROUPS)).toEqual(['recall', 'search', 'damage_control', 'risk']);
        expect(rows.map((row) => row.id)).toEqual([
            'pin',
            'peek',
            'flash_pair',
            'shuffle',
            'region_shuffle',
            'destroy_pair',
            'stray_remove',
            'undo_resolve',
            'gambit'
        ]);
        expect(rows.every((row) => row.cost.length > 0 && row.perfectMemoryImpact.length > 0)).toBe(true);
        expect(rows.find((row) => row.id === 'shuffle')?.disabledReason).toBeNull();
        expect(getPowerVerbRows({ ...run, shuffleCharges: 0 }).find((row) => row.id === 'shuffle')?.disabledReason).toBe(
            'No shuffle charges.'
        );
        expect(getPowerVerbRows({ ...run, status: 'memorize' }).find((row) => row.id === 'peek')?.disabledReason).toBe(
            'Only while playing.'
        );
    });
});
