import { describe, expect, it } from 'vitest';
import { getHubShellFitPadding } from './hubShellFit';

describe('getHubShellFitPadding', () => {
    it('uses short-desktop inset for wide short viewports', () => {
        expect(getHubShellFitPadding(1280, 720, 'menu')).toBe(8);
        expect(getHubShellFitPadding(1280, 720, 'choosePath')).toBe(8);
    });

    it('uses surface-specific defaults otherwise', () => {
        expect(getHubShellFitPadding(1200, 900, 'menu')).toBe(12);
        expect(getHubShellFitPadding(1200, 900, 'choosePath')).toBe(14);
    });
});
