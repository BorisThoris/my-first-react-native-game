import { describe, expect, it } from 'vitest';
import { createDefaultSaveData } from './save-data';
import { getCollectionRewardGalleryRows } from './collection-reward-gallery';

describe('REG-093 collection reward gallery', () => {
    it('derives owned, in-progress, and missing gallery rows from local save data', () => {
        const save = createDefaultSaveData();
        save.achievements.ACH_FIRST_CLEAR = true;
        save.unlocks = ['cosmetic:crest_daily_bronze'];
        save.playerStats = {
            ...save.playerStats!,
            dailiesCompleted: 2,
            relicPickCounts: { extra_shuffle_charge: 3 }
        };

        const rows = getCollectionRewardGalleryRows(save);
        expect(rows.map((row) => row.id)).toEqual(['achievements', 'profile_goal', 'cosmetics', 'relics', 'history']);
        expect(rows.find((row) => row.id === 'achievements')?.owned).toBe(1);
        expect(rows.find((row) => row.id === 'cosmetics')?.owned).toBeGreaterThan(1);
        expect(rows.every((row) => row.localOnly)).toBe(true);
        expect(rows.every((row) => row.nextAction.length > 0)).toBe(true);
    });
});
