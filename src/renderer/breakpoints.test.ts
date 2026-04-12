import { describe, expect, it } from 'vitest';
import { isShortLandscapeViewport, VIEWPORT_SHORT_LANDSCAPE_MAX_HEIGHT } from './breakpoints';

describe('isShortLandscapeViewport', () => {
    it('is true for 1280×720 HD landscape', () => {
        expect(isShortLandscapeViewport(1280, 720)).toBe(true);
    });

    it('is false when height exceeds cap', () => {
        expect(isShortLandscapeViewport(1920, 1080)).toBe(false);
    });

    it('is false in portrait', () => {
        expect(isShortLandscapeViewport(720, 1280)).toBe(false);
    });

    it('uses VIEWPORT_SHORT_LANDSCAPE_MAX_HEIGHT as upper bound', () => {
        expect(VIEWPORT_SHORT_LANDSCAPE_MAX_HEIGHT).toBe(860);
        expect(isShortLandscapeViewport(2000, 860)).toBe(true);
        expect(isShortLandscapeViewport(2000, 861)).toBe(false);
    });
});
