import { expect, test, type Page } from '@playwright/test';

/**
 * R3F raycasts from event.offsetX/Y on the canvas. Proxy hit buttons sit in a grid above the WebGL canvas but use
 * `pointer-events: none` in WebGL mode, so real mouse clicks at their centers hit the canvas underneath with correct offsets.
 */
async function clickThroughProxyTile(
    page: Page,
    row: number,
    column: number,
    hiddenBefore: number
): Promise<void> {
    const label = new RegExp(`hidden tile, row ${row}, column ${column}`, 'i');
    // Proxy buttons use pointer-events: none so picks hit the canvas; Playwright's default click would see the canvas as "intercepting".
    await page.getByRole('button', { name: label }).click({ force: true });

    await expect
        .poll(async () => page.getByRole('button', { name: /hidden tile/i }).count(), { timeout: 3000 })
        .toBeLessThan(hiddenBefore);
}

test.describe('Tile board WebGL picking', () => {
    test('canvas click flips a tile after memorize phase', async ({ page }) => {
        await page.goto('/');

        await page.getByRole('dialog', { name: /startup relic intro/i }).click();
        await expect(page.getByRole('button', { name: /play arcade/i })).toBeVisible();

        await page.getByRole('button', { name: /play arcade/i }).click();
        await expect(page.getByRole('heading', { name: /level 1/i })).toBeVisible();

        await expect(page.getByRole('group', { name: /run stats/i })).toBeVisible({ timeout: 8000 });

        const canvas = page.getByTestId('tile-board-stage').locator('canvas');
        await expect(canvas).toBeVisible();

        // Run stats show during memorize; wait until play phase hides tiles again.
        await expect
            .poll(async () => page.getByRole('button', { name: /hidden tile/i }).count(), { timeout: 12000 })
            .toBeGreaterThan(0);

        const hiddenBefore = await page.getByRole('button', { name: /hidden tile/i }).count();

        await clickThroughProxyTile(page, 1, 1, hiddenBefore);
    });
});
