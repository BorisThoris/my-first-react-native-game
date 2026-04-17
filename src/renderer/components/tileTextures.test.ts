import { describe, expect, it } from 'vitest';
import { CARD_PLANE_HEIGHT, CARD_PLANE_WIDTH } from './tileShatter';
import { getStaticCardTexturePixelSize } from './tileTextures';

describe('tileTextures layout', () => {
    it('keeps static card canvas aspect aligned with card plane geometry', () => {
        const { width, height } = getStaticCardTexturePixelSize();
        const aspect = width / height;
        expect(aspect).toBeCloseTo(CARD_PLANE_WIDTH / CARD_PLANE_HEIGHT, 2);
        expect(width).toBeGreaterThan(2);
        expect(height).toBeGreaterThan(2);
    });
});
