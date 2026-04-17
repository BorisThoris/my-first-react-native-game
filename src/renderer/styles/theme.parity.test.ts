import { describe, expect, it } from 'vitest';
import { RENDERER_THEME } from './theme';

/** Maps `colors.voidSoft` → `--theme-void-soft` (canonical `--theme-*` names in `cssVars`). */
const colorKeyToCssVarName = (key: string): string =>
    `--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;

describe('RENDERER_THEME color / CSS parity', () => {
    it('each `colors` entry matches the corresponding `--theme-*` cssVars value', () => {
        const { colors, cssVars } = RENDERER_THEME;
        for (const key of Object.keys(colors) as (keyof typeof colors)[]) {
            const varName = colorKeyToCssVarName(key as string) as keyof typeof cssVars;
            expect(cssVars[varName], `missing ${String(varName)} for colors.${String(key)}`).toBe(colors[key]);
        }
    });
});
