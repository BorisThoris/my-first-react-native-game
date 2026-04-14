import { describe, expect, it } from 'vitest';
import { buildRendererThemeStyle } from './theme';

describe('buildRendererThemeStyle', () => {
    it('deepens modal scrim tokens when reduce motion is enabled (OVR-015)', () => {
        const motionOn = buildRendererThemeStyle(1, 'roomy', false);
        const motionOff = buildRendererThemeStyle(1, 'roomy', true);

        expect(motionOn['--theme-modal-scrim-bg' as keyof typeof motionOn]).toBe('var(--theme-scrim-dialog)');
        expect(motionOff['--theme-modal-scrim-bg' as keyof typeof motionOff]).toBe('var(--theme-scrim-heavy)');
        expect(motionOff['--theme-modal-scrim-backdrop-filter' as keyof typeof motionOff]).toBe('none');
    });
});
