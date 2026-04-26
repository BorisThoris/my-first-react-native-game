import { describe, expect, it } from 'vitest';
import {
    REG103_MIN_POWER_TOUCH_PX,
    REG104_DATA_SHELL,
    REG106_HUD_IA,
    REG108_CARD_MATERIAL_LANES,
    reg104ShellAttributes
} from './regPhase4PlayContract';

describe('REG-103–108 gameplay shell contract', () => {
    it('REG-103: enforces 44px-class touch target floor for one-hand + pan/zoom affordance', () => {
        expect(REG103_MIN_POWER_TOUCH_PX).toBeGreaterThanOrEqual(44);
    });

    it('REG-104: shell hook names stay stable for composition tests', () => {
        expect(REG104_DATA_SHELL).toBe('data-reg-gameplay-shell');
        expect(reg104ShellAttributes('playing')['data-reg-gameplay-shell']).toBe('playing');
    });

    it('REG-106: primary HUD always lists score / floor / lives lane ids', () => {
        expect(REG106_HUD_IA.primary).toContain('score');
        expect(REG106_HUD_IA.primary).toContain('floor');
        expect(REG106_HUD_IA.primary).toContain('lives');
    });

    it('REG-108: material lanes include match and mismatch for feedback system parity', () => {
        expect(REG108_CARD_MATERIAL_LANES).toEqual(expect.arrayContaining(['match', 'mismatch', 'invalid']));
    });
});
