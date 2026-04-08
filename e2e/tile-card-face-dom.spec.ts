import { expect, test } from '@playwright/test';
import {
    BOARD_HIDDEN_TILE_BUTTON_RE,
    defaultE2eGameSaveJson,
    navigateToLevel1PlayPhase,
    clickHiddenTileRowCol
} from './tileBoardGameFlow';

/**
 * QA-004 — DOM tile “fingerprint”: asserts `tile-card-face` uses bundled `back.svg` (hidden) and `front.svg` (face-up)
 * with 100%×100% cover, centered, no-repeat. If `.cardBack` / face URLs or stacking change intentionally, update
 * expectations and note the rationale here (see `TASKS_ASSETS_QA.md` QA-004).
 */
test.use({
    launchOptions: {
        args: ['--disable-webgl', '--disable-webgl2']
    }
});

test.describe('Tile card face (DOM fallback)', () => {
    test('hidden uses back art; revealed uses face art; layout stack unchanged', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 });
        /* default save: reduceMotion + intro dismissed (reduceMotionSaveJson leaves intro on and flakes dismissStartupIntro). */
        await navigateToLevel1PlayPhase(page, defaultE2eGameSaveJson);

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
        expect(hiddenStyle.backgroundImage, 'Hidden tile should use back.svg').toMatch(/back\.svg/i);
        expect(hiddenStyle.backgroundSize, 'Back SVG fills card frame').toMatch(/^100%\s+100%/);
        expect(hiddenStyle.backgroundRepeat).toMatch(/^no-repeat/);
        expect(hiddenStyle.backgroundPosition).toMatch(/50%/);

        const hiddenCount = await page.getByRole('button', { name: BOARD_HIDDEN_TILE_BUTTON_RE }).count();
        await clickHiddenTileRowCol(page, 1, 1, hiddenCount);

        const tileShown11 = page.getByRole('button', { name: /tile .*, row 1, column 1/i });
        const shownStyle = await readBg(tileShown11.getByTestId('tile-card-face'));

        expect(shownStyle.backgroundImage, 'Face-up tile should use front.svg').toMatch(/front\.svg/i);
        expect(shownStyle.backgroundImage).not.toBe(hiddenStyle.backgroundImage);
        expect(shownStyle.backgroundSize, 'Face SVG stretches to card frame').toMatch(/^100%\s+100%/);
        expect(shownStyle.backgroundPosition).toBe(hiddenStyle.backgroundPosition);
        expect(shownStyle.backgroundRepeat).toBe(hiddenStyle.backgroundRepeat);

        await expect(tileShown11).toHaveAttribute('aria-label', /row 1, column 1/i);
    });
});
