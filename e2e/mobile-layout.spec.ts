import { expect, test, type Locator } from '@playwright/test';
import { dispatchTouchSequence, forceCoarsePointerMedia, type TouchDispatchPoint } from './mobileTouchHelpers';
import { BOARD_HIDDEN_TILE_BUTTON_RE, navigateToLevel1PlayPhase } from './tileBoardGameFlow';
import { openMainMenuFromSave } from './visualScreenHelpers';

test.describe.configure({ mode: 'serial' });
test.setTimeout(60_000);

async function readSettingsLayout(container: Locator): Promise<{
    contentBelowNav: boolean;
    footerWidth: number;
    buttonWidths: number[];
}> {
    const navButton = await container.getByRole('button', { name: /gameplay/i }).first().boundingBox();
    const contentHeading = await container
        .locator('header')
        .getByRole('heading', { name: /^gameplay$/i })
        .first()
        .boundingBox();
    const footerActions = container.getByRole('button', { name: /^back$/i }).locator('..');
    const footer = await footerActions.boundingBox();
    const buttons = await footerActions.locator('button').evaluateAll((elements) =>
        elements.map((element) => (element as HTMLElement).getBoundingClientRect().width)
    );

    expect(navButton).toBeTruthy();
    expect(contentHeading).toBeTruthy();
    expect(footer).toBeTruthy();

    return {
        contentBelowNav: contentHeading!.y >= navButton!.y + navButton!.height - 1,
        footerWidth: footer!.width,
        buttonWidths: buttons
    };
}

async function readBoardViewportState(frame: Locator): Promise<{
    mobileCameraMode: boolean;
    panX: number;
    panY: number;
    selectionSuppressed: boolean;
    zoom: number;
}> {
    return frame.evaluate((element) => ({
        mobileCameraMode: element.getAttribute('data-mobile-camera-mode') === 'true',
        panX: Number.parseFloat(element.getAttribute('data-board-pan-x') ?? '0'),
        panY: Number.parseFloat(element.getAttribute('data-board-pan-y') ?? '0'),
        selectionSuppressed: element.getAttribute('data-selection-suppressed') === 'true',
        zoom: Number.parseFloat(element.getAttribute('data-board-zoom') ?? '0')
    }));
}

async function pointInLocator(locator: Locator, xFactor: number, yFactor: number, id: number): Promise<TouchDispatchPoint> {
    const box = await locator.boundingBox();

    expect(box).toBeTruthy();

    return {
        id,
        x: box!.x + box!.width * xFactor,
        y: box!.y + box!.height * yFactor
    };
}

test.describe('Mobile layout (renderer)', () => {
    test('viewport meta enables edge-to-edge safe area', async ({ page }) => {
        await page.goto('/');
        const content = await page.locator('meta[name="viewport"]').getAttribute('content');
        expect(content).toMatch(/viewport-fit=cover/);
    });

    test('phone portrait sets mobile viewport and compact density', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');
        const root = page.locator('#root').locator('> div').first();
        await expect(root).toHaveAttribute('data-viewport', 'mobile');
        await expect(root).toHaveAttribute('data-density', 'compact');
    });

    test('wide desktop sets desktop viewport and roomy density', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('/');
        const root = page.locator('#root').locator('> div').first();
        await expect(root).toHaveAttribute('data-viewport', 'desktop');
        await expect(root).toHaveAttribute('data-density', 'roomy');
    });

    test('tablet width sets tablet label when both axes exceed compact height', async ({ page }) => {
        await page.setViewportSize({ width: 900, height: 900 });
        await page.goto('/');
        const root = page.locator('#root').locator('> div').first();
        await expect(root).toHaveAttribute('data-viewport', 'tablet');
        await expect(root).toHaveAttribute('data-density', 'roomy');
    });

    test('phone portrait keeps condensed onboarding copy visible', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await openMainMenuFromSave(page, false);
        await expect(page.getByText(/short memorize window before the tiles hide again/i)).toBeVisible();
        await expect(page.getByText(/every clean pair grows score and streak/i)).toBeVisible();
        await expect(page.getByText(/every 2-pair chain earns a shard\. three shards restore one life/i)).toBeVisible();
        await expect(page.getByText(/recent descent/i)).toBeVisible();
    });

    test('phone landscape keeps condensed onboarding copy readable', async ({ page }) => {
        await page.setViewportSize({ width: 844, height: 390 });
        await openMainMenuFromSave(page, false);
        await expect(page.getByText(/short memorize window before the tiles hide again/i)).toBeVisible();
        await expect(page.getByText(/every clean pair grows score and streak/i)).toBeVisible();
        await expect(page.getByText(/every 2-pair chain earns a shard\. three shards restore one life/i)).toBeVisible();
    });

    test('game HUD stays horizontal on compact viewport', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await navigateToLevel1PlayPhase(page);
        const hud = page.locator('header').filter({ has: page.getByRole('group', { name: /run stats/i }) });
        await expect(hud).toBeVisible();
        const flexDirection = await hud.evaluate((el) => getComputedStyle(el).flexDirection);
        expect(flexDirection).toBe('row');
    });

    test('game control icons meet minimum touch target on compact touch viewport', async ({ page }) => {
        await forceCoarsePointerMedia(page);
        await page.setViewportSize({ width: 390, height: 844 });
        await navigateToLevel1PlayPhase(page);
        const controls = page.getByRole('toolbar', { name: /game controls/i });
        await expect(controls).toBeVisible();
        for (const name of [/fit board/i, /pause/i, /settings/i]) {
            const btn = controls.getByRole('button', { name });
            const box = await btn.boundingBox();
            expect(box, `bounding box for ${name}`).toBeTruthy();
            expect(box!.width).toBeGreaterThanOrEqual(43);
            expect(box!.height).toBeGreaterThanOrEqual(43);
        }
    });

    test('pause modal backdrop keeps minimum padding (safe-area aware layout)', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await navigateToLevel1PlayPhase(page);
        await page.getByRole('button', { name: /pause/i }).click();
        await expect(page.getByRole('dialog', { name: /run paused/i })).toBeVisible();
        const backdrop = page.getByRole('dialog', { name: /run paused/i }).locator('..');
        const padding = await backdrop.evaluate((el) => {
            const s = getComputedStyle(el);
            return {
                top: parseFloat(s.paddingTop),
                right: parseFloat(s.paddingRight),
                bottom: parseFloat(s.paddingBottom),
                left: parseFloat(s.paddingLeft)
            };
        });
        expect(padding.top).toBeGreaterThanOrEqual(14);
        expect(padding.right).toBeGreaterThanOrEqual(14);
        expect(padding.bottom).toBeGreaterThanOrEqual(14);
        expect(padding.left).toBeGreaterThanOrEqual(14);
    });

    test('settings page footer actions span the panel width on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await openMainMenuFromSave(page, true);
        await page.getByRole('button', { name: /^settings$/i }).evaluate((element) => {
            (element as HTMLButtonElement).click();
        });
        await expect(page.getByRole('heading', { name: /^settings$/i })).toBeVisible();
        const back = page.getByRole('button', { name: /^back$/i });
        const save = page.getByRole('button', { name: /^save$/i });
        const footer = back.locator('..');
        const sizes = await footer.evaluate((el) => {
            const buttons = Array.from(el.querySelectorAll('button'));
            return {
                container: el.getBoundingClientRect().width,
                buttons: buttons.map((button) => button.getBoundingClientRect().width)
            };
        });
        expect(sizes.buttons).toHaveLength(2);
        expect(sizes.buttons[0]).toBeGreaterThanOrEqual(sizes.container - 2);
        expect(sizes.buttons[1]).toBeGreaterThanOrEqual(sizes.container - 2);
        await expect(back).toBeVisible();
        await expect(save).toBeVisible();
    });

    test('run settings modal footer actions span the dialog width on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await navigateToLevel1PlayPhase(page);
        await page.getByRole('button', { name: /run settings \(toolbar\)/i }).evaluate((element) => {
            (element as HTMLButtonElement).click();
        });
        const dialog = page.getByRole('dialog', { name: /run settings/i });
        await expect(dialog).toBeVisible();
        const back = dialog.getByRole('button', { name: /^back$/i });
        const save = dialog.getByRole('button', { name: /^save$/i });
        await expect(save).toBeVisible();
        const footer = back.locator('..');
        const sizes = await footer.evaluate((el) => {
            const buttons = Array.from(el.querySelectorAll('button'));
            return {
                container: el.getBoundingClientRect().width,
                buttons: buttons.map((button) => button.getBoundingClientRect().width)
            };
        });
        expect(sizes.buttons).toHaveLength(2);
        expect(sizes.buttons[0]).toBeGreaterThanOrEqual(sizes.container - 2);
        expect(sizes.buttons[1]).toBeGreaterThanOrEqual(sizes.container - 2);
    });

    test('short-height landscape settings page collapses to one column with full-width actions', async ({ page }) => {
        await page.setViewportSize({ width: 844, height: 390 });
        await openMainMenuFromSave(page, true);
        await page.getByRole('button', { name: /^settings$/i }).evaluate((element) => {
            (element as HTMLButtonElement).click();
        });
        await expect(page.getByRole('heading', { name: /^settings$/i })).toBeVisible();

        const layout = await readSettingsLayout(
            page.locator('section').filter({ has: page.getByRole('heading', { name: /^settings$/i }) }).first()
        );

        expect(layout.contentBelowNav).toBe(true);
        expect(layout.buttonWidths).toHaveLength(2);
        expect(layout.buttonWidths[0]).toBeGreaterThanOrEqual(layout.footerWidth - 2);
        expect(layout.buttonWidths[1]).toBeGreaterThanOrEqual(layout.footerWidth - 2);
    });

    test('short-height landscape run settings modal collapses to one column with full-width actions', async ({ page }) => {
        await page.setViewportSize({ width: 844, height: 390 });
        await navigateToLevel1PlayPhase(page);
        await page.getByRole('button', { name: /run settings \(toolbar\)/i }).evaluate((element) => {
            (element as HTMLButtonElement).click();
        });
        const dialog = page.getByRole('dialog', { name: /run settings/i });
        await expect(dialog).toBeVisible();
        const layout = await readSettingsLayout(dialog);

        expect(layout.contentBelowNav).toBe(true);
        expect(layout.buttonWidths).toHaveLength(2);
        expect(layout.buttonWidths[0]).toBeGreaterThanOrEqual(layout.footerWidth - 2);
        expect(layout.buttonWidths[1]).toBeGreaterThanOrEqual(layout.footerWidth - 2);
    });

    test('compact touch viewport uses a full-bleed board behind the HUD', async ({ page }) => {
        await forceCoarsePointerMedia(page);
        await page.setViewportSize({ width: 390, height: 844 });
        await navigateToLevel1PlayPhase(page);

        const shell = page.getByTestId('game-shell');
        const hud = page.getByTestId('game-hud');
        const frame = page.getByTestId('tile-board-frame');
        const leftToolbar = page.locator('aside[aria-label="Game actions"]');

        await expect(page.getByRole('button', { name: /^fit board$/i })).toBeVisible();
        await expect(frame).toHaveAttribute('data-mobile-camera-mode', 'true');

        const shellBox = await shell.boundingBox();
        const hudBox = await hud.boundingBox();
        const frameBox = await frame.boundingBox();
        const toolbarBox = await leftToolbar.boundingBox();

        expect(shellBox).toBeTruthy();
        expect(hudBox).toBeTruthy();
        expect(frameBox).toBeTruthy();
        expect(toolbarBox).toBeTruthy();

        expect(Math.abs(frameBox!.height - shellBox!.height)).toBeLessThanOrEqual(2);
        expect(frameBox!.y).toBeLessThanOrEqual(shellBox!.y + 1);
        expect(frameBox!.x).toBeGreaterThanOrEqual(toolbarBox!.x + toolbarBox!.width - 2);
        const expectedFrameWidth = shellBox!.width - toolbarBox!.width;
        expect(Math.abs(frameBox!.width - expectedFrameWidth)).toBeLessThanOrEqual(12);
        expect(hudBox!.y).toBeLessThan(frameBox!.y + frameBox!.height - 8);
        expect(hudBox!.y + hudBox!.height).toBeGreaterThan(frameBox!.y + 8);
    });

    test('two-finger pinch zooms in, and Fit board resets the viewport', async ({ page }) => {
        await forceCoarsePointerMedia(page);
        await page.setViewportSize({ width: 390, height: 844 });
        await navigateToLevel1PlayPhase(page);

        const frame = page.getByTestId('tile-board-frame');
        const stage = page.getByTestId('tile-board-stage-shell');
        const startA = await pointInLocator(stage, 0.42, 0.46, 1);
        const startB = await pointInLocator(stage, 0.58, 0.54, 2);
        const endA = await pointInLocator(stage, 0.24, 0.3, 1);
        const endB = await pointInLocator(stage, 0.76, 0.7, 2);

        const before = await readBoardViewportState(frame);
        expect(before.zoom).toBeCloseTo(1, 3);

        await dispatchTouchSequence(page, [
            { points: [startA, startB], type: 'touchStart', waitMs: 40 },
            { points: [endA, endB], type: 'touchMove', waitMs: 50 },
            { points: [], type: 'touchEnd', waitMs: 80 }
        ]);

        await expect
            .poll(async () => (await readBoardViewportState(frame)).zoom, { timeout: 4000 })
            .toBeGreaterThan(1.1);

        await page.getByRole('button', { name: /^fit board$/i }).click();

        await expect
            .poll(async () => readBoardViewportState(frame), { timeout: 4000 })
            .toMatchObject({ panX: 0, panY: 0, zoom: 1 });
    });

    test('two-finger pan moves the viewport and one-finger tap still flips a tile', async ({ page }) => {
        await forceCoarsePointerMedia(page);
        await page.setViewportSize({ width: 390, height: 844 });
        await navigateToLevel1PlayPhase(page);

        const frame = page.getByTestId('tile-board-frame');
        const stage = page.getByTestId('tile-board-stage-shell');

        const pinchStartA = await pointInLocator(stage, 0.43, 0.45, 1);
        const pinchStartB = await pointInLocator(stage, 0.57, 0.55, 2);
        const pinchEndA = await pointInLocator(stage, 0.3, 0.34, 1);
        const pinchEndB = await pointInLocator(stage, 0.7, 0.66, 2);

        await dispatchTouchSequence(page, [
            { points: [pinchStartA, pinchStartB], type: 'touchStart', waitMs: 34 },
            { points: [pinchEndA, pinchEndB], type: 'touchMove', waitMs: 40 },
            { points: [], type: 'touchEnd', waitMs: 70 }
        ]);

        await expect
            .poll(async () => (await readBoardViewportState(frame)).zoom, { timeout: 4000 })
            .toBeGreaterThan(1.08);

        const panStartA = await pointInLocator(stage, 0.34, 0.48, 1);
        const panStartB = await pointInLocator(stage, 0.58, 0.56, 2);
        const panEndA = await pointInLocator(stage, 0.48, 0.54, 1);
        const panEndB = await pointInLocator(stage, 0.72, 0.62, 2);

        await dispatchTouchSequence(page, [
            { points: [panStartA, panStartB], type: 'touchStart', waitMs: 34 },
            { points: [panEndA, panEndB], type: 'touchMove', waitMs: 40 },
            { points: [], type: 'touchEnd', waitMs: 80 }
        ]);

        await expect
            .poll(async () => readBoardViewportState(frame), { timeout: 4000 })
            .toEqual(
                expect.objectContaining({
                    selectionSuppressed: false
                })
            );

        const afterPan = await readBoardViewportState(frame);
        expect(Math.abs(afterPan.panX) + Math.abs(afterPan.panY)).toBeGreaterThan(0.1);

        const hiddenBefore = await page.getByRole('button', { name: BOARD_HIDDEN_TILE_BUTTON_RE }).count();
        await page.waitForTimeout(180);
        await page.getByRole('button', { name: /hidden tile, row 1, column 1/i }).evaluate((element) => {
            (element as HTMLButtonElement).click();
        });

        await expect
            .poll(async () => page.getByRole('button', { name: BOARD_HIDDEN_TILE_BUTTON_RE }).count(), { timeout: 6000 })
            .toBeLessThan(hiddenBefore);
    });
});
