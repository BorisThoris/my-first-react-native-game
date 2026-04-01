import { expect, test } from '@playwright/test';
import { countPngPixelDiffs } from './pngDiff';
import {
    navigateToLevel1PlayPhase,
    reduceMotionSaveJson,
    STORAGE_KEY,
    clickHiddenTileRowCol
} from './tileBoardGameFlow';

test.describe('Tile card face (WebGL)', () => {
    test('canvas differs only slightly after one flip (shared static card bitmap + text overlay)', async ({ page }, testInfo) => {
        await page.addInitScript(() => {
            localStorage.setItem(STORAGE_KEY, reduceMotionSaveJson);
        });

        await page.setViewportSize({ width: 1280, height: 720 });
        await navigateToLevel1PlayPhase(page);

        const canvasLocator = page.getByTestId('tile-board-stage').locator('canvas');
        await expect(canvasLocator).toBeVisible();

        const shotHidden = await canvasLocator.screenshot({ type: 'png' });
        const hiddenCount = await page.getByRole('button', { name: /hidden tile/i }).count();
        await clickHiddenTileRowCol(page, 1, 1, hiddenCount);

        await expect(page.getByRole('button', { name: /tile .*, row 1, column 1/i })).toBeVisible({ timeout: 3000 });
        await page.waitForTimeout(2200);

        const shotFlipped = await page.getByTestId('tile-board-stage').locator('canvas').screenshot({ type: 'png' });

        const { diffPixels, width, height } = countPngPixelDiffs(shotHidden, shotFlipped);
        const total = width * height;
        const ratio = diffPixels / total;

        await testInfo.attach('board-hidden.png', { body: shotHidden, contentType: 'image/png' });
        await testInfo.attach('board-one-flipped.png', { body: shotFlipped, contentType: 'image/png' });

        /** Card textures use anisotropic filtering; edge deltas widen PNG diffs vs the old ~8% typical. */
        const maxDiffRatio = 0.12;
        expect(
            ratio,
            `Expected most pixels unchanged (same card art); diff ratio ${(ratio * 100).toFixed(2)}% with ${diffPixels} px`
        ).toBeLessThan(maxDiffRatio);
    });
});
