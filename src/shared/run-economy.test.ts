import { describe, expect, it } from 'vitest';
import { createNewRun, finishMemorizePhase } from './game-core';
import {
    RUN_ECONOMY_DEFINITIONS,
    getRunEconomyRows,
    getRunEconomySnapshot,
    runEconomyDefinitionById
} from './run-economy';

describe('REG-024 run economy taxonomy', () => {
    it('keeps runtime rewards separated by persistence and purpose', () => {
        expect(RUN_ECONOMY_DEFINITIONS.map((entry) => entry.id)).toEqual([
            'shop_gold',
            'score',
            'combo_shards',
            'guard_tokens',
            'relic_favor',
            'findable_pickups',
            'assist_charges'
        ]);
        expect(runEconomyDefinitionById.shop_gold.persistence).toBe('temporary_run');
        expect(runEconomyDefinitionById.score.persistence).toBe('run_summary');
        expect(runEconomyDefinitionById.combo_shards.persistence).toBe('temporary_run');
        expect(runEconomyDefinitionById.relic_favor.sink).toContain('extra relic pick');
    });

    it('projects a run into compact machine-readable economy rows', () => {
        const run = {
            ...finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false })),
            relicFavorProgress: 2,
            findablesClaimedThisFloor: 1,
            findablesTotalThisFloor: 2,
            stats: {
                ...finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false })).stats,
                totalScore: 120,
                comboShards: 1,
                guardTokens: 1
            }
        };
        const snapshot = getRunEconomySnapshot(run);

        expect(snapshot.score.value).toBe('120');
        expect(snapshot.temporaryRunCurrencies.map((entry) => entry.id)).toEqual([
            'shop_gold',
            'combo_shards',
            'guard_tokens',
            'relic_favor',
            'findable_pickups',
            'assist_charges'
        ]);
        expect(getRunEconomyRows(run).map((row) => `${row.key}:${row.value}`)).toEqual([
            'shop_gold:0',
            'score:120',
            'combo_shards:1/2',
            'guard_tokens:1/2',
            'relic_favor:2/3',
            'findable_pickups:1/2',
            'assist_charges:Shuffle 1 · Row 1 · Destroy 0 · Peek 1 · Stray 0'
        ]);
    });
});
