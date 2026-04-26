import { describe, expect, it } from 'vitest';
import {
    getReferenceOnlySettingsRows,
    referenceControlsWithPersistedSettings,
    SETTINGS_REFERENCE_CONTROL_ROWS
} from './settings-control-model';

describe('REG-036 reference settings controls model', () => {
    it('keeps reference-only controls honest and non-persisted', () => {
        const rows = getReferenceOnlySettingsRows().filter((row) => row.status === 'future_placeholder');
        expect(rows.map((row) => row.id)).toEqual(['difficulty', 'timer_mode', 'max_lives', 'card_theme']);
        expect(rows.every((row) => row.status === 'future_placeholder')).toBe(true);
        expect(rows.every((row) => row.persistedSettingKey === null)).toBe(true);
        expect(rows.every((row) => row.migrationRequiredWhenEnabled || row.rulesVersionRequiredWhenEnabled)).toBe(true);
    });

    it('documents rule and migration implications before enabling any row', () => {
        const difficulty = SETTINGS_REFERENCE_CONTROL_ROWS.find((row) => row.id === 'difficulty');
        const cardTheme = SETTINGS_REFERENCE_CONTROL_ROWS.find((row) => row.id === 'card_theme');
        expect(difficulty?.ruleImpact).toMatch(/GAME_RULES_VERSION/);
        expect(difficulty?.achievementImplication).toMatch(/daily/i);
        expect(cardTheme?.saveMigrationImplication).toMatch(/SaveData/);
        expect(referenceControlsWithPersistedSettings()).toEqual([]);
    });
});
