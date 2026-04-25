import { describe, expect, it } from 'vitest';
import { createDefaultSaveData } from './save-data';
import {
    COSMETIC_CATALOG,
    getCosmeticRows,
    unlockedCosmeticIds,
    type CosmeticId
} from './cosmetics';

describe('REG-025 cosmetics catalog', () => {
    it('keeps cosmetics as unlock-tag driven visual-only rows', () => {
        const save = createDefaultSaveData();
        save.unlocks = ['cosmetic:crest_daily_bronze', 'cosmetic:title_ascendant_v'];

        expect(Object.keys(COSMETIC_CATALOG)).toEqual([
            'crest_daily_bronze',
            'title_ascendant_v',
            'card_back_relic_gold'
        ] satisfies CosmeticId[]);
        expect(unlockedCosmeticIds(save)).toEqual(['crest_daily_bronze', 'title_ascendant_v']);

        const rows = getCosmeticRows(save);
        expect(rows.find((row) => row.id === 'crest_daily_bronze')?.status).toBe('owned');
        expect(rows.find((row) => row.id === 'title_ascendant_v')?.status).toBe('owned');
        expect(rows.find((row) => row.id === 'card_back_relic_gold')?.status).toBe('locked');
        expect(rows.every((row) => row.gameplayAffecting === false)).toBe(true);
    });
});
