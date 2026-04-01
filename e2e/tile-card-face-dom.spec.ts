import { expect, test } from '@playwright/test';
import {
    navigateToLevel1PlayPhase,
    reduceMotionSaveJson,
    STORAGE_KEY,
    clickHiddenTileRowCol
} from './tileBoardGameFlow';

test.use({
    launchOptions: {
        args: ['--disable-webgl', '--disable-webgl2']
    }
});

test.describe('Tile card face (DOM fallback)', () => {
    test('hidden and revealed use the same .cardBack background; only symbol text is added', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem(STORAGE_KEY, reduceMotionSaveJson);
        });

        await page.setViewportSize({ width: 1280, height: 720 });
        await navigateToLevel1PlayPhase(page);

        await expect(page.getByTestId('tile-board-fallback')).toBeVisible({ timeout: 8000 });

        const tileHidden11 = page.getByRole('button', { name: /hidden tile, row 1, column 1/i });
        const cardFace = tileHidden11.getByTestId('tile-card-face');

        const fingerprint = async (locator: typeof cardFace): Promise<string> =>
            locator.evaluate((el) => {
                const s = window.getComputedStyle(el);
                return [
                    s.backgroundImage,
                    s.backgroundSize,
                    s.backgroundPosition,
                    s.backgroundRepeat,
                    s.backgroundColor
                ].join('|');
            });

        const before = await fingerprint(cardFace);
        const hiddenCount = await page.getByRole('button', { name: /hidden tile/i }).count();
        await clickHiddenTileRowCol(page, 1, 1, hiddenCount);

        const tileShown11 = page.getByRole('button', { name: /tile .*, row 1, column 1/i });
        const after = await fingerprint(tileShown11.getByTestId('tile-card-face'));

        expect(after, 'Face-up card face should reuse the same CSS background stack as when hidden').toBe(before);
        await expect(tileShown11).toHaveAttribute('aria-label', /row 1, column 1/i);
    });
});
