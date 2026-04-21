import { expect, test } from '@playwright/test';
import { flipTileAtGridCellKeyboard } from './tileBoardGameFlow';
import { buildVisualSaveJson, gotoWithSaveAndQuery } from './visualScreenHelpers';

/**
 * DEV sandbox fixture `gambitTripleMissSetup`: fixed 2×3 board, two mismatched flips queued,
 * long resolve stall so Playwright can issue the gambit third flip at (row 1, col 3) before the 2-flip timer fires.
 */
test.describe('Gambit triple-miss board floater', () => {
    test('shows mismatch floater after gambit triple-no-match resolve', async ({ page }) => {
        test.setTimeout(120_000);
        const params = new URLSearchParams({
            devSandbox: '1',
            fixture: 'gambitTripleMissSetup',
            screen: 'playing',
            skipIntro: '1'
        });
        await gotoWithSaveAndQuery(page, buildVisualSaveJson(true, true), params.toString());

        await expect(page.getByTestId('tile-board-frame')).toBeVisible({ timeout: 25_000 });
        await expect(page.getByTestId('tile-board-frame')).toHaveAttribute('data-board-run-status', 'resolving', {
            timeout: 25_000
        });

        await flipTileAtGridCellKeyboard(page, 1, 3);

        await expect(page.getByTestId('mismatch-score-floater')).toBeVisible({ timeout: 20_000 });
        await expect(page.getByTestId('mismatch-score-floater')).toContainText(/miss/i);
    });
});
