import { describe, expect, it } from 'vitest';
import { getSettingsControlCenterRows } from './settings-control-center';

describe('REG-092 settings control center rows', () => {
    it('maps categories to real settings/save data fields and quality status', () => {
        const rows = getSettingsControlCenterRows();
        expect(rows.map((row) => row.id)).toEqual(['live_controls', 'reference_placeholders', 'profile_trust', 'mobile_reachability']);
        expect(rows.find((row) => row.id === 'live_controls')?.value).toMatch(/saved preferences/);
        expect(rows.find((row) => row.id === 'reference_placeholders')?.detail).toMatch(/disabled/);
        expect(rows.every((row) => row.localOnly)).toBe(true);
        expect(rows.every((row) => row.detail.length > 0)).toBe(true);
    });
});
