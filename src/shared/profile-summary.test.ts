import { describe, expect, it } from 'vitest';
import { createDefaultSaveData } from './save-data';
import { getProfileSummaryRows, getSaveTrustRows } from './profile-summary';

describe('REG-032 profile summary and save trust shell', () => {
    it('derives profile summary rows from real local save state', () => {
        const save = createDefaultSaveData();
        save.bestScore = 2400;
        save.playerStats = {
            ...save.playerStats!,
            dailiesCompleted: 3,
            bestFloorNoPowers: 5
        };
        save.unlocks = ['cosmetic:crest_daily_bronze'];

        const rows = getProfileSummaryRows(save);
        expect(rows.map((row) => row.id)).toContain('profile_level');
        expect(rows.find((row) => row.id === 'best_score')?.value).toBe('2,400');
        expect(rows.find((row) => row.id === 'cosmetics')?.value).toBe('1');
        expect(rows.every((row) => row.source.length > 0)).toBe(true);
    });

    it('explains save scope, cloud deferral, export/import, backup, and reset behavior', () => {
        const rows = getSaveTrustRows(createDefaultSaveData());
        expect(rows.map((row) => row.id)).toEqual(['slot_scope', 'cloud_sync', 'export_import', 'backup', 'reset']);
        expect(rows.find((row) => row.id === 'cloud_sync')?.status).toBe('deferred');
        expect(rows.find((row) => row.id === 'reset')?.description).toMatch(/confirmation/i);
    });
});
