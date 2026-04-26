import { describe, expect, it } from 'vitest';
import {
    getLocalizationCopySurfaceRows,
    LOCALIZATION_FOUNDATION_DECISION,
    localizationReadyForNewCopy
} from './localization-readiness';

describe('REG-055 localization extraction foundation', () => {
    it('keeps English-only v1 while documenting future stack and copy homes', () => {
        expect(LOCALIZATION_FOUNDATION_DECISION.shippingLocale).toBe('en');
        expect(LOCALIZATION_FOUNDATION_DECISION.uiPromise).toBe('english_only_v1');
        expect(LOCALIZATION_FOUNDATION_DECISION.futureStack).toBe('react-i18next');
        expect(LOCALIZATION_FOUNDATION_DECISION.nonEnglishUiPromised).toBe(false);
    });

    it('routes new player-facing copy into stable shared or renderer copy modules', () => {
        const rows = getLocalizationCopySurfaceRows();
        expect(rows.find((row) => row.surface === 'mechanics')?.owner).toContain('src/shared');
        expect(rows.find((row) => row.surface === 'game_over')?.owner).toContain('src/renderer/copy');
        expect(rows.every((row) => row.stableIds)).toBe(true);
        expect(localizationReadyForNewCopy('src/renderer/components/GameScreen.tsx', 'inline paragraph')).toBe(false);
        expect(localizationReadyForNewCopy('src/renderer/copy/gameOverScreen.ts', 'copy key')).toBe(true);
    });
});
