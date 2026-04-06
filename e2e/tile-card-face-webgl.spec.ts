import { expect, test } from '@playwright/test';
import { countPngPixelDiffs } from './pngDiff';
import {
    BOARD_HIDDEN_TILE_BUTTON_RE,
    navigateToLevel1PlayPhase,
    reduceMotionSaveJson,
    clickHiddenTileRowCol
} from './tileBoardGameFlow';

test.describe('Tile card face (WebGL)', () => {
    test('canvas differs only slightly after one flip (split back/face bitmaps + text overlay)', async ({ page }, testInfo) => {
        await page.setViewportSize({ width: 1280, height: 720 });
        await navigateToLevel1PlayPhase(page, reduceMotionSaveJson);

        const stageLocator = page.getByTestId('tile-board-stage-shell');
        const canvasLocator = page.getByTestId('tile-board-stage').locator('canvas');
        await expect(canvasLocator).toBeVisible();
        await expect(stageLocator).toHaveAttribute('data-dom-tile-picks', 'true');

        const shotHidden = await stageLocator.screenshot({ type: 'png' });
        const hiddenCount = await page.getByRole('button', { name: BOARD_HIDDEN_TILE_BUTTON_RE }).count();
        await clickHiddenTileRowCol(page, 1, 1, hiddenCount);

        await expect(page.getByRole('button', { name: /tile .*, row 1, column 1/i })).toBeVisible({ timeout: 3000 });
        await page.waitForTimeout(2200);

        const shotFlipped = await stageLocator.screenshot({ type: 'png' });

        const { diffPixels, width, height } = countPngPixelDiffs(shotHidden, shotFlipped);
        const total = width * height;
        const ratio = diffPixels / total;

        await testInfo.attach('board-hidden.png', { body: shotHidden, contentType: 'image/png' });
        await testInfo.attach('board-one-flipped.png', { body: shotFlipped, contentType: 'image/png' });

        /** One tile flip changes back vs face art plus overlay; anisotropic filtering widens edge deltas. */
        const maxDiffRatio = 0.16;
        expect(
            ratio,
            `Expected bounded board diff after one flip; diff ratio ${(ratio * 100).toFixed(2)}% with ${diffPixels} px`
        ).toBeLessThan(maxDiffRatio);
    });
});
