import { describe, expect, it } from 'vitest';
import {
    assetDropInReadinessSummary,
    ASSET_DROP_IN_CATEGORIES,
    getAssetDropInCategories
} from './assetDropInReadiness';

describe('REG-059 asset drop-in readiness', () => {
    it('covers every major asset category with path, format, manifest, rights, fallback, and verification', () => {
        const rows = getAssetDropInCategories();
        expect(rows.map((row) => row.id)).toEqual([
            'ui_scenes',
            'mode_posters',
            'logo_emblems',
            'card_textures',
            'audio_sfx',
            'store_media'
        ]);
        expect(rows.every((row) => row.authoritativePath.length > 0)).toBe(true);
        expect(rows.every((row) => row.acceptedFormats.length > 0)).toBe(true);
        expect(rows.every((row) => row.manifestOrBarrel.length > 0)).toBe(true);
        expect(rows.every((row) => row.fallbackBehavior.length > 0)).toBe(true);
        expect(rows.every((row) => row.verification.length > 0)).toBe(true);
    });

    it('summarizes placeholder and licensed-asset risks before release swaps', () => {
        const summary = assetDropInReadinessSummary();
        expect(summary.categories).toBe(ASSET_DROP_IN_CATEGORIES.length);
        expect(summary.placeholderCount).toBeGreaterThanOrEqual(1);
        expect(summary.licensedRequiredCount).toBeGreaterThanOrEqual(1);
        expect(summary.verificationCommands).toContain('yarn audit:renderer-assets');
    });
});
