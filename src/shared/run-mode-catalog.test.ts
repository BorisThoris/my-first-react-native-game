import { describe, expect, it } from 'vitest';
import { RUN_MODE_CATALOG, getRunModeChallengeGateRows } from './run-mode-catalog';
import { VISUAL_ENDLESS_MODE_LOCKED } from './mechanics-encyclopedia';
import { createDefaultSaveData } from './save-data';

describe('REG-018 run mode shipping states', () => {
    it('keeps product Endless intentionally locked with explicit upcoming copy', () => {
        const classic = RUN_MODE_CATALOG.find((mode) => mode.id === 'classic');
        const endless = RUN_MODE_CATALOG.find((mode) => mode.id === 'endless');

        expect(classic).toMatchObject({
            title: 'Classic Run',
            availability: 'available',
            action: { type: 'startRun' }
        });
        expect(endless).toMatchObject({
            title: 'Endless Mode',
            availability: 'locked',
            action: { type: 'locked' }
        });
        expect(endless?.shortDescription).toContain('Locked intentionally');
        expect(VISUAL_ENDLESS_MODE_LOCKED.description).toContain('stays locked');
    });
});

describe('REG-050 mode identity promises', () => {
    it('differentiates wild, gauntlet, and meditation promises', () => {
        const modes = Object.fromEntries(RUN_MODE_CATALOG.map((mode) => [mode.id, mode]));

        expect(modes.wild?.promise).toContain('volatile');
        expect(modes.gauntlet?.promise).toContain('countdown');
        expect(modes.meditation?.promise).toContain('comfort');
        expect(modes.wild?.eligibilityNote).toMatch(/perfect-memory/i);
        expect(modes.gauntlet?.eligibilityNote).toMatch(/Gauntlet proof/i);
        expect(modes.meditation?.eligibilityNote).toMatch(/practice\/comfort/i);
    });
});

describe('REG-050 mode identity copy', () => {
    it('distinguishes Wild, Gauntlet, and Meditation by player promise', () => {
        const byId = Object.fromEntries(RUN_MODE_CATALOG.map((mode) => [mode.id, mode]));
        expect(byId.wild?.identityTag).toBe('Chaos lab');
        expect(byId.gauntlet?.identityTag).toBe('Clock pressure');
        expect(byId.meditation?.identityTag).toBe('Calm practice');
        expect(byId.wild?.outcomeSummary).toContain('Wild');
        expect(byId.gauntlet?.outcomeSummary).toContain('timed');
        expect(byId.meditation?.outcomeSummary).toContain('comfort');
    });
});

describe('REG-081 challenge mode gates', () => {
    it('exposes offline challenge progression gates from the mode catalog', () => {
        const save = createDefaultSaveData();
        const rows = getRunModeChallengeGateRows(save);

        expect(rows.map((row) => row.modeId)).toEqual(['daily', 'gauntlet', 'puzzle_glyph_cross', 'scholar', 'pin_vow']);
        expect(rows.every((row) => row.offlineOnly)).toBe(true);
        expect(rows.find((row) => row.modeId === 'gauntlet')?.status).toBe('locked');
        expect(rows.find((row) => row.modeId === 'puzzle_glyph_cross')?.status).toBe('in_progress');
    });
});
