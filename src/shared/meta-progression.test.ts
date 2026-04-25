import { describe, expect, it } from 'vitest';
import { createDefaultSaveData } from './save-data';
import {
    buildPermanentUpgradeRows,
    getCosmeticTrackRows,
    getMetaProgressionBoard,
    getMetaProgressionRows,
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

    it('REG-016 exposes level, next reward, long-term goal, and explicit mode rules', () => {
        const save = createDefaultSaveData();
        save.achievements.ACH_FIRST_CLEAR = true;
        save.playerStats = {
            ...save.playerStats!,
            dailiesCompleted: 4,
            bestFloorNoPowers: 2,
            relicPickCounts: {
                extra_shuffle_charge: 3
            }
        };

        const board = getMetaProgressionBoard(save);
        expect(board.level).toBeGreaterThan(1);
        expect(board.levelProgress.target).toBe(5);
        expect(board.nextReward?.id).toBe('upgrade_relic_shrine_extra_pick');
        expect(board.nextReward?.source).toBe('Daily archive completions');
        expect(board.nextReward?.modeRule).toBe('disabled_in_daily');
        expect(board.longTermGoal?.id).toBe('upgrade_scholar_prep_slot');
        expect(board.rows.every((row) => row.localOnly)).toBe(true);
    });

    it('REG-016 keeps cosmetic rewards visual-only and gameplay upgrades explicitly flagged', () => {
        const save = createDefaultSaveData();
        save.playerStats = {
            ...save.playerStats!,
            dailiesCompleted: 7,
            relicShrineExtraPickUnlocked: true
        };

        const rows = getMetaProgressionRows(save);
        const week = rows.find((row) => row.id === 'upgrade_relic_shrine_extra_pick');
        expect(week).toMatchObject({
            gameplayAffecting: true,
            modeRule: 'disabled_in_daily',
            status: 'owned'
        });
        expect(rows.filter((row) => row.track === 'cosmetic').every((row) => row.gameplayAffecting === false)).toBe(true);
    });
});
