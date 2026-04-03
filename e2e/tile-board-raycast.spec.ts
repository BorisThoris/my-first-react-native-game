import { expect, test, type Page } from '@playwright/test';
import { dismissStartupIntro } from './startupIntroHelpers';
import { completeLevel1Play, waitLevel1PlayReady } from './visualScreenHelpers';

/**
 * The semantic button layer is kept for accessibility and deterministic test targeting even when the visible board is
 * camera-driven inside the canvas.
 */
async function clickThroughProxyTile(page: Page, row: number, column: number, hiddenBefore: number): Promise<void> {
    const label = new RegExp(`hidden tile, row ${row}, column ${column}`, 'i');
    await page.getByRole('button', { name: label }).evaluate((element) => {
        (element as HTMLButtonElement).click();
    });

    await expect
        .poll(async () => page.getByRole('button', { name: /hidden tile/i }).count(), { timeout: 3000 })
        .toBeLessThan(hiddenBefore);
}

async function readBoardViewport(page: Page): Promise<{ panX: number; panY: number; zoom: number }> {
    return page.getByTestId('tile-board-frame').evaluate((element) => ({
        panX: Number.parseFloat(element.getAttribute('data-board-pan-x') ?? '0'),
        panY: Number.parseFloat(element.getAttribute('data-board-pan-y') ?? '0'),
        zoom: Number.parseFloat(element.getAttribute('data-board-zoom') ?? '0')
    }));
}

test.describe.configure({ mode: 'serial' });

test.describe('Tile board interaction', () => {
    test('tile selection flips a tile after memorize phase', async ({ page }) => {
        await page.goto('/');

        await dismissStartupIntro(page);

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

    test('desktop wheel zooms in and out, plain drag pans, and Fit board resets the viewport', async ({ page }) => {
        test.setTimeout(60_000);
        await page.goto('/');

        await dismissStartupIntro(page);

        await page.setViewportSize({ width: 1440, height: 900 });
        await page.getByRole('button', { name: /play arcade/i }).click();
        await expect(page.getByRole('heading', { name: /level 1/i })).toBeVisible();
        await expect(page.getByRole('group', { name: /run stats/i })).toBeVisible({ timeout: 8000 });

        const stageShell = page.getByTestId('tile-board-stage-shell');
        await expect(stageShell).toBeVisible();
        await expect(page.getByRole('button', { name: /^fit board$/i })).toBeVisible();

        const box = await stageShell.boundingBox();
        expect(box).toBeTruthy();
        const centerX = box!.x + box!.width / 2;
        const centerY = box!.y + box!.height / 2;

        const before = await readBoardViewport(page);
        expect(before.zoom).toBeCloseTo(1, 3);

        await page.mouse.move(centerX, centerY);
        await page.mouse.wheel(0, -720);

        await expect.poll(async () => (await readBoardViewport(page)).zoom, { timeout: 4000 }).toBeGreaterThan(1.1);

        await stageShell.dispatchEvent('pointerdown', {
            button: 0,
            clientX: centerX,
            clientY: centerY,
            pointerId: 41,
            pointerType: 'mouse'
        });
        await stageShell.dispatchEvent('pointermove', {
            buttons: 1,
            clientX: centerX + 120,
            clientY: centerY + 70,
            pointerId: 41,
            pointerType: 'mouse'
        });
        await stageShell.dispatchEvent('pointerup', {
            button: 0,
            clientX: centerX + 120,
            clientY: centerY + 70,
            pointerId: 41,
            pointerType: 'mouse'
        });

        await expect
            .poll(async () => {
                const viewport = await readBoardViewport(page);
                return Math.abs(viewport.panX) + Math.abs(viewport.panY);
            }, { timeout: 4000 })
            .toBeGreaterThan(0.1);

        await page.mouse.wheel(0, 2400);

        await expect.poll(async () => (await readBoardViewport(page)).zoom, { timeout: 4000 }).toBeLessThan(0.95);

        await page.getByRole('button', { name: /^fit board$/i }).click();

        await expect.poll(async () => readBoardViewport(page), { timeout: 4000 }).toMatchObject({
            panX: 0,
            panY: 0,
            zoom: 1
        });
    });

    test('continuing to the next level preserves the chosen zoom framing', async ({ page }) => {
        test.setTimeout(120_000);
        await page.goto('/');

        await dismissStartupIntro(page);

        await page.setViewportSize({ width: 1440, height: 900 });
        await page.getByRole('button', { name: /play arcade/i }).click();
        await expect(page.getByRole('heading', { name: /level 1/i })).toBeVisible();
        await expect(page.getByRole('group', { name: /run stats/i })).toBeVisible({ timeout: 8000 });

        const stageShell = page.getByTestId('tile-board-stage-shell');
        await expect(stageShell).toBeVisible();

        const box = await stageShell.boundingBox();
        expect(box).toBeTruthy();

        await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
        await page.mouse.wheel(0, 2400);

        await expect.poll(async () => (await readBoardViewport(page)).zoom, { timeout: 4000 }).toBeLessThan(0.95);
        const beforeContinue = await readBoardViewport(page);

        const pairs = await waitLevel1PlayReady(page);
        await completeLevel1Play(page, pairs);
        await page.getByRole('dialog', { name: /floor cleared/i }).getByRole('button', { name: /^continue$/i }).click();

        await expect(page.getByRole('heading', { name: /level 2/i })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('group', { name: /run stats/i })).toBeVisible();

        await expect.poll(async () => (await readBoardViewport(page)).zoom, { timeout: 4000 }).toBeCloseTo(beforeContinue.zoom, 2);
    });
});
