import { describe, expect, it } from 'vitest';
import { createDefaultSaveData } from './save-data';
import {
    buildPermanentUpgradeRows,
    getCosmeticTrackRows,
    metaProgressionSummary
} from './meta-progression';

describe('REG-080 permanent upgrade tree and cosmetic track', () => {
    it('keeps permanent upgrades local, earned, and non-pay-to-skip', () => {
        const save = createDefaultSaveData();
        save.playerStats = {
            ...save.playerStats!,
            dailiesCompleted: 7,
            bestFloorNoPowers: 5
        };
        const upgrades = buildPermanentUpgradeRows(save);

        expect(upgrades.map((row) => row.id)).toEqual([
            'relic_shrine_extra_pick',
            'ascendant_title_track',
            'daily_cosmetic_track'
        ]);
        expect(upgrades.find((row) => row.id === 'relic_shrine_extra_pick')?.status).toBe('unlocked');
        expect(upgrades.every((row) => row.offlineOnly)).toBe(true);
        expect(upgrades.every((row) => row.payToSkip === false)).toBe(true);
    });

    it('projects cosmetic track rows from local unlock tags and progress gates', () => {
        const save = createDefaultSaveData();
        save.unlocks = ['cosmetic:crest_daily_bronze'];
        save.playerStats = {
            ...save.playerStats!,
            dailiesCompleted: 3,
            bestFloorNoPowers: 4
        };

        const rows = getCosmeticTrackRows(save);
        expect(rows.find((row) => row.cosmeticId === 'crest_daily_bronze')?.status).toBe('owned');
        expect(rows.find((row) => row.cosmeticId === 'title_ascendant_v')?.status).toBe('in_progress');
        expect(rows.every((row) => row.gameplayAffecting === false)).toBe(true);
        expect(metaProgressionSummary(save)).toMatchObject({
            upgradesUnlocked: 1,
            cosmeticTrackOwned: 4
        });
    });
});
