import { describe, expect, it } from 'vitest';
import { createDefaultSaveData } from './save-data';
import {
    CARD_THEME_CATALOG,
    COSMETIC_CATALOG,
    getCosmeticTrackRows,
    getCardThemeRows,
    getCosmeticRows,
    resolveEquippedCardTheme,
    unlockedCosmeticIds,
    type CosmeticId
} from './cosmetics';

describe('REG-025 cosmetics catalog', () => {
    it('keeps cosmetics as unlock-tag driven visual-only rows', () => {
        const save = createDefaultSaveData();
        save.unlocks = ['cosmetic:crest_daily_bronze', 'cosmetic:title_ascendant_v'];

        expect(Object.keys(COSMETIC_CATALOG)).toEqual(expect.arrayContaining([
            'crest_daily_bronze',
            'title_ascendant_v',
            'card_back_relic_gold'
        ] satisfies CosmeticId[]));
        expect(unlockedCosmeticIds(save)).toEqual(['crest_daily_bronze', 'title_ascendant_v']);

        const rows = getCosmeticRows(save);
        expect(rows.find((row) => row.id === 'crest_daily_bronze')?.status).toBe('owned');
        expect(rows.find((row) => row.id === 'title_ascendant_v')?.status).toBe('owned');
        expect(rows.find((row) => row.id === 'card_back_relic_gold')?.status).toBe('locked');
        expect(rows.every((row) => row.gameplayAffecting === false)).toBe(true);
    });

    it('REG-066 exposes card-back theme ownership, equipped fallback, and asset fallback contract', () => {
        const save = createDefaultSaveData();
        save.unlocks = ['cosmetic:card_back_relic_gold'];

        expect(Object.keys(CARD_THEME_CATALOG)).toEqual(['card_back_classic', 'card_back_relic_gold']);
        expect(resolveEquippedCardTheme(save).id).toBe('classic_card_back');
        expect(resolveEquippedCardTheme(save).asset.back).toBe('/src/renderer/assets/textures/cards/back.svg');

        const rows = getCardThemeRows(save);
        expect(rows.find((row) => row.id === 'classic_card_back')?.equipped).toBe(true);
        expect(rows.find((row) => row.id === 'relic_gold_card_back')?.status).toBe('owned');
        expect(rows.find((row) => row.id === 'relic_gold_card_back')?.asset.back).toBe('/src/renderer/assets/textures/cards/back.svg');
    });

    it('REG-080 maps cosmetics onto a local visual-only progression track', () => {
        const save = createDefaultSaveData();
        save.unlocks = ['cosmetic:crest_daily_bronze'];

        const rows = getCosmeticTrackRows(save);
        expect(rows.map((row) => row.trackId)).toEqual(['starter', 'daily', 'mastery', 'relic']);
        expect(rows.find((row) => row.trackId === 'daily')?.owned).toBe(1);
        expect(rows.every((row) => row.gameplayAffecting === false)).toBe(true);
    });
});
