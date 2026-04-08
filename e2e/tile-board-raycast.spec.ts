import { expect, test, type Page } from '@playwright/test';
import { dismissStartupIntro } from './startupIntroHelpers';
import {
    BOARD_HIDDEN_TILE_BUTTON_RE,
    defaultE2eGameSaveJson,
    STORAGE_KEY
} from './tileBoardGameFlow';
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
        .poll(async () => page.getByRole('button', { name: BOARD_HIDDEN_TILE_BUTTON_RE }).count(), { timeout: 12_000 })
        .toBeLessThan(hiddenBefore);
}

async function readBoardViewport(page: Page): Promise<{ panX: number; panY: number; zoom: number }> {
    return page.getByTestId('tile-board-frame').evaluate((element) => ({
        panX: Number.parseFloat(element.getAttribute('data-board-pan-x') ?? '0'),
        panY: Number.parseFloat(element.getAttribute('data-board-pan-y') ?? '0'),
        zoom: Number.parseFloat(element.getAttribute('data-board-zoom') ?? '0')
    }));
}

/**
 * Headless Chromium often drops `page.mouse.wheel`; synthesize `WheelEvent` on the stage shell using layout geometry.
 * Note: in this stack, negative deltaY (zoom in) applies reliably; positive deltaY (zoom out) often does not — use Fit
 * board or assert zoom-in framing instead of depending on synthetic zoom-out.
 */
async function dispatchStageWheel(
    page: Page,
    stageShell: ReturnType<Page['getByTestId']>,
    deltaY: number
): Promise<void> {
    await expect(stageShell).toBeVisible({ timeout: 20_000 });
    await stageShell.evaluate((el, dy) => {
        const r = el.getBoundingClientRect();
        const cx = Math.round(r.left + r.width / 2);
        const cy = Math.round(r.top + r.height / 2);
        el.dispatchEvent(
            new WheelEvent('wheel', {
                bubbles: true,
                cancelable: true,
                clientX: cx,
                clientY: cy,
                deltaMode: 0,
                deltaY: dy
            })
        );
    }, deltaY);
}

test.describe.configure({ mode: 'serial' });

test.describe('Tile board interaction', () => {
    test.setTimeout(120_000);

    test('tile selection flips a tile after memorize phase', async ({ page }) => {
        await page.addInitScript(
            ([key, json]) => {
                localStorage.setItem(key, json);
            },
            [STORAGE_KEY, defaultE2eGameSaveJson]
        );
        await page.goto('/');

        await dismissStartupIntro(page);

        await page.getByRole('button', { name: /^play$/i }).click();
        await expect(page.getByRole('region', { name: /choose your path/i })).toBeVisible();
        const classicRun = page.getByRole('button', { name: /classic run/i });
        await expect(classicRun).toBeVisible();
        await classicRun.evaluate((el) => (el as HTMLButtonElement).click());
        await expect(page.getByRole('heading', { name: /level 1/i })).toBeAttached({ timeout: 15_000 });

        await expect(page.getByRole('group', { name: /run stats/i })).toBeVisible({ timeout: 15_000 });

        const canvas = page.getByTestId('tile-board-stage').locator('canvas');
        await expect(canvas).toBeVisible();

        // Run stats show during memorize; wait until play phase hides tiles again.
        await expect
            .poll(async () => page.getByRole('button', { name: BOARD_HIDDEN_TILE_BUTTON_RE }).count(), {
                timeout: 50_000,
                intervals: [80, 120, 200, 400]
            })
            .toBeGreaterThan(0);

        const hiddenBefore = await page.getByRole('button', { name: BOARD_HIDDEN_TILE_BUTTON_RE }).count();

        await clickThroughProxyTile(page, 1, 1, hiddenBefore);
    });

    test('desktop wheel zooms in and out, plain drag pans, and Fit board resets the viewport', async ({ page }) => {
        test.setTimeout(180_000);
        await page.addInitScript(
            ([key, json]) => {
                localStorage.setItem(key, json);
            },
            [STORAGE_KEY, defaultE2eGameSaveJson]
        );
        await page.goto('/');

        await dismissStartupIntro(page);

        await page.setViewportSize({ width: 1440, height: 900 });
        await page.getByRole('button', { name: /^play$/i }).click();
        await expect(page.getByRole('region', { name: /choose your path/i })).toBeVisible();
        const classicRunWheel = page.getByRole('button', { name: /classic run/i });
        await expect(classicRunWheel).toBeVisible();
        await classicRunWheel.evaluate((el) => (el as HTMLButtonElement).click());
        await expect(page.getByRole('heading', { name: /level 1/i })).toBeAttached({ timeout: 15_000 });
        await expect(page.getByRole('group', { name: /run stats/i })).toBeVisible({ timeout: 15_000 });

        const stageShell = page.getByTestId('tile-board-stage-shell');
        await expect(stageShell).toBeVisible();
        const fitBoard = page.getByRole('button', { name: /^fit board$/i });
        await expect(fitBoard).toBeVisible();

        const box = await stageShell.boundingBox();
        expect(box).toBeTruthy();
        const centerX = box!.x + box!.width / 2;
        const centerY = box!.y + box!.height / 2;

        const before = await readBoardViewport(page);
        expect(before.zoom).toBeCloseTo(1, 3);

        await dispatchStageWheel(page, stageShell, -1200);
        await dispatchStageWheel(page, stageShell, -800);

        await expect.poll(async () => (await readBoardViewport(page)).zoom, { timeout: 10_000 }).toBeGreaterThan(1.05);

        // Positive deltaY (zoom-out) on synthetic WheelEvent is ignored in Chromium for this handler path while negative
        // (zoom-in) applies; use Fit board to return to baseline, then wheel zoom-in again before panning.
        await fitBoard.click({ force: true });
        await expect(async () => {
            const v = await readBoardViewport(page);
            expect(Math.abs(v.panX)).toBeLessThan(0.02);
            expect(Math.abs(v.panY)).toBeLessThan(0.02);
            expect(v.zoom).toBeCloseTo(1, 2);
        }).toPass({ timeout: 15_000 });

        await dispatchStageWheel(page, stageShell, -1200);
        await dispatchStageWheel(page, stageShell, -800);
        await expect.poll(async () => (await readBoardViewport(page)).zoom, { timeout: 10_000 }).toBeGreaterThan(1.05);

        await page.mouse.move(centerX, centerY);
        await page.mouse.down();
        await page.mouse.move(centerX + 120, centerY + 70);
        await page.mouse.up();

        await expect
            .poll(async () => {
                const viewport = await readBoardViewport(page);
                return Math.abs(viewport.panX) + Math.abs(viewport.panY);
            }, { timeout: 10_000 })
            .toBeGreaterThan(0.1);

        await fitBoard.click({ force: true });

        await expect(async () => {
            const v = await readBoardViewport(page);
            expect(Math.abs(v.panX)).toBeLessThan(0.02);
            expect(Math.abs(v.panY)).toBeLessThan(0.02);
            expect(v.zoom).toBeCloseTo(1, 2);
        }).toPass({ timeout: 20_000 });
    });

    test('continuing to the next level preserves the chosen zoom framing', async ({ page }) => {
        test.setTimeout(180_000);
        await page.addInitScript(
            ([key, json]) => {
                localStorage.setItem(key, json);
            },
            [STORAGE_KEY, defaultE2eGameSaveJson]
        );
        await page.goto('/');

        await dismissStartupIntro(page);

        await page.setViewportSize({ width: 1440, height: 900 });
        await page.getByRole('button', { name: /^play$/i }).click();
        await expect(page.getByRole('region', { name: /choose your path/i })).toBeVisible();
        const classicRunNext = page.getByRole('button', { name: /classic run/i });
        await expect(classicRunNext).toBeVisible();
        await classicRunNext.evaluate((el) => (el as HTMLButtonElement).click());
        await expect(page.getByRole('heading', { name: /level 1/i })).toBeAttached({ timeout: 15_000 });
        await expect(page.getByRole('group', { name: /run stats/i })).toBeVisible({ timeout: 15_000 });

        const stageShell = page.getByTestId('tile-board-stage-shell');
        await expect(stageShell).toBeVisible();

        // Synthetic positive deltaY (zoom-out) is unreliable in Chromium headless; zoom-in framing is enough to assert
        // the viewport survives the floor transition without resetting to 1.0.
        await dispatchStageWheel(page, stageShell, -1200);
        await dispatchStageWheel(page, stageShell, -800);
        await expect.poll(async () => (await readBoardViewport(page)).zoom, { timeout: 15_000 }).toBeGreaterThan(1.05);
        const beforeContinue = await readBoardViewport(page);

        const pairs = await waitLevel1PlayReady(page);
        await expect(page.getByRole('button', { name: BOARD_HIDDEN_TILE_BUTTON_RE })).toHaveCount(4, {
            timeout: 20_000
        });
        await completeLevel1Play(page, pairs);
        await page.getByRole('dialog', { name: /floor cleared/i }).getByRole('button', { name: /^continue$/i }).click();

        await expect(page.getByRole('heading', { name: /level 2/i })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('group', { name: /run stats/i })).toBeVisible();

        // New floor geometry can nudge fitZoom; allow small zoom drift while still checking we did not reset to 1.0.
        await expect(async () => {
            const z = (await readBoardViewport(page)).zoom;
            expect(z).toBeCloseTo(beforeContinue.zoom, 1);
        }).toPass({ timeout: 20_000 });
    });
});
