import { expect, test } from '@playwright/test';
import {
    BOARD_HIDDEN_TILE_BUTTON_RE,
    navigateToLevel1PlayPhase,
    reduceMotionSaveJson,
    clickHiddenTileRowCol
} from './tileBoardGameFlow';

test.use({
    launchOptions: {
        args: ['--disable-webgl', '--disable-webgl2']
    }
});

test.describe('Tile card face (DOM fallback)', () => {
    test('hidden uses back art; revealed uses face art; layout stack unchanged', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 });
        await navigateToLevel1PlayPhase(page, reduceMotionSaveJson);

        await expect(page.getByTestId('tile-board-fallback')).toBeVisible({ timeout: 8000 });

        const tileHidden11 = page.getByRole('button', { name: /hidden tile, row 1, column 1/i });
        const cardFace = tileHidden11.getByTestId('tile-card-face');

        const readBg = async (locator: typeof cardFace) =>
            locator.evaluate((el) => {
                const s = window.getComputedStyle(el);
                return {
                    backgroundImage: s.backgroundImage,
                    backgroundSize: s.backgroundSize,
                    backgroundPosition: s.backgroundPosition,
                    backgroundRepeat: s.backgroundRepeat,
                    backgroundColor: s.backgroundColor
                };
            });

        const hiddenStyle = await readBg(cardFace);
        expect(hiddenStyle.backgroundImage, 'Hidden tile should use reference-back.png').toMatch(/reference-back\.png/i);
        expect(hiddenStyle.backgroundSize, 'Image layer uses cover (second value is gradient)').toMatch(/^cover/);
        expect(hiddenStyle.backgroundRepeat).toMatch(/^no-repeat/);
        expect(hiddenStyle.backgroundPosition).toMatch(/50%/);

        const hiddenCount = await page.getByRole('button', { name: BOARD_HIDDEN_TILE_BUTTON_RE }).count();
        await clickHiddenTileRowCol(page, 1, 1, hiddenCount);

        const tileShown11 = page.getByRole('button', { name: /tile .*, row 1, column 1/i });
        const shownStyle = await readBg(tileShown11.getByTestId('tile-card-face'));

        expect(shownStyle.backgroundImage, 'Face-up tile should use front-face.png').toMatch(/front-face\.png/i);
        expect(shownStyle.backgroundImage).not.toBe(hiddenStyle.backgroundImage);
        expect(shownStyle.backgroundSize).toBe(hiddenStyle.backgroundSize);
        expect(shownStyle.backgroundPosition).toBe(hiddenStyle.backgroundPosition);
        expect(shownStyle.backgroundRepeat).toBe(hiddenStyle.backgroundRepeat);

        await expect(tileShown11).toHaveAttribute('aria-label', /row 1, column 1/i);
    });
});
