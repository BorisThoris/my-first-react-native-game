import { expect, test, type Locator, type Page } from '@playwright/test';
import { dispatchTouchSequence, forceCoarsePointerMedia, type TouchDispatchPoint } from './mobileTouchHelpers';
import { BOARD_HIDDEN_TILE_BUTTON_RE, navigateToLevel1PlayPhase } from './tileBoardGameFlow';
import {
    expectAppScrollportHasNoVerticalOverflow,
    expectLocatorFullyInWindowViewport,
    openMainMenuFromSave
} from './visualScreenHelpers';

/**
 * QA-002 — Geometry tolerances (compact touch / mobile camera layout):
 * - **2px** — full-bleed board height vs shell (`frame` height, top edge).
 * - **12px** — board width vs shell minus left toolbar (`expectedFrameWidth`); sub-pixel layout + scrollbar variance.
 * - **8px** — HUD must overlap the board vertical band (partial overlap assertions); allows anti-aliased bounds.
 * - **2px** — toolbar inner edge vs board x-origin when computing expected width.
 * Settings layout tests use **2px** slack on full-width footer buttons vs container.
 * **Pinch tests:** CDP synthetic touches can miss occasionally; specs retry the pinch once and poll up to **8s + 12s** for `zoom > 1.08`. Fit reset uses programmatic click plus **20s** `toPass` with near-zero pan and `zoom` close to **1**.
 */
test.describe.configure({ mode: 'serial' });
/* Level-1 memorize→play can be slow; pinch/pan set their own timeouts. */
test.setTimeout(120_000);

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

async function expectSettingsFooterButtonsInViewport(page: Page, container: Locator): Promise<void> {
    await expectLocatorFullyInWindowViewport(page, container.getByRole('button', { name: /^back$/i }));
    await expectLocatorFullyInWindowViewport(page, container.getByRole('button', { name: /^save$/i }));
}

async function readSettingsShellMetrics(
    page: Page,
    container: Locator
): Promise<{ panelTop: number; panelBottom: number; viewportHeight: number; zoom: number }> {
    const panel = container.getByTestId('settings-shell-panel');
    const zoomNode = container.getByTestId('settings-shell-fit-zoom');
    const panelBox = await panel.boundingBox();

    expect(panelBox).toBeTruthy();

    const zoom = await zoomNode.evaluate((element) => {
        const node = element as HTMLElement;
        const inlineZoom = node.style.zoom;
        const computedZoom = getComputedStyle(node).zoom;
        return Number.parseFloat(inlineZoom || computedZoom || '1') || 1;
    });

    return {
        panelTop: panelBox!.y,
        panelBottom: panelBox!.y + panelBox!.height,
        viewportHeight: await page.evaluate(() => window.innerHeight),
        zoom
    };
}

async function expectSettingsPanelInset(page: Page, container: Locator, minInset = 4): Promise<void> {
    const metrics = await readSettingsShellMetrics(page, container);
    expect(metrics.panelTop).toBeGreaterThanOrEqual(minInset);
    expect(metrics.panelBottom).toBeLessThanOrEqual(metrics.viewportHeight - minInset);
}

/** Short stacked settings must stay readable at shell zoom 1 (no tiny-fit regression on controls). */
async function expectSettingsCategoryStripReadable(container: Locator): Promise<void> {
    const gameplayTab = container.getByRole('button', { name: /^gameplay$/i }).first();
    const tabBox = await gameplayTab.boundingBox();
    expect(tabBox).toBeTruthy();
    expect(tabBox!.height, 'category tab height').toBeGreaterThanOrEqual(26);

    const layoutStandard = container.getByRole('button', { name: /^standard$/i }).first();
    await expect(layoutStandard).toBeVisible();
    const segBox = await layoutStandard.boundingBox();
    expect(segBox).toBeTruthy();
    expect(segBox!.height, 'segment control height').toBeGreaterThanOrEqual(22);
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
        const hud = page.getByTestId('game-hud');
        await expect(hud).toBeVisible();
        const layout = await hud.evaluate((el) => {
            const s = getComputedStyle(el);
            return { display: s.display, flexDirection: s.flexDirection };
        });
        expect(layout.display, 'HUD row uses flex layout').toMatch(/flex/);
        expect(layout.flexDirection).toBe('row');
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
        await page
            .getByRole('button', { name: /pause/i })
            .evaluate((el) => (el as HTMLButtonElement).click());
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
        const settingsSection = page
            .locator('section')
            .filter({ has: page.getByRole('heading', { name: /^settings$/i }) })
            .first();
        await expect(settingsSection).toHaveAttribute('data-settings-layout', 'short-stacked');
        const layout = await readSettingsLayout(settingsSection);
        const metrics = await readSettingsShellMetrics(page, settingsSection);

        expect(layout.contentBelowNav).toBe(true);
        expect(layout.buttonWidths).toHaveLength(2);
        expect(layout.buttonWidths[0]).toBeGreaterThanOrEqual(layout.footerWidth - 2);
        expect(layout.buttonWidths[1]).toBeGreaterThanOrEqual(layout.footerWidth - 2);
        expect(metrics.zoom).toBeCloseTo(1, 3);
        await expectSettingsPanelInset(page, settingsSection, 6);
        await expectSettingsCategoryStripReadable(settingsSection);
        await expectSettingsFooterButtonsInViewport(page, settingsSection);
        await expectAppScrollportHasNoVerticalOverflow(page);
    });

    test('short-height landscape run settings modal collapses to one column with full-width actions', async ({ page }) => {
        await page.setViewportSize({ width: 844, height: 390 });
        await navigateToLevel1PlayPhase(page);
        await page.getByRole('button', { name: /run settings \(toolbar\)/i }).evaluate((element) => {
            (element as HTMLButtonElement).click();
        });
        const dialog = page.getByRole('dialog', { name: /run settings/i });
        await expect(dialog).toBeVisible();
        await expect(dialog).toHaveAttribute('data-settings-layout', 'short-stacked');
        const layout = await readSettingsLayout(dialog);
        const metrics = await readSettingsShellMetrics(page, dialog);

        expect(layout.contentBelowNav).toBe(true);
        expect(layout.buttonWidths).toHaveLength(2);
        expect(layout.buttonWidths[0]).toBeGreaterThanOrEqual(layout.footerWidth - 2);
        expect(layout.buttonWidths[1]).toBeGreaterThanOrEqual(layout.footerWidth - 2);
        expect(metrics.zoom).toBeCloseTo(1, 3);
        await expectSettingsPanelInset(page, dialog, 6);
        await expectSettingsCategoryStripReadable(dialog);
        await expectSettingsFooterButtonsInViewport(page, dialog);
        await expectAppScrollportHasNoVerticalOverflow(page);
    });

    test('900x700 settings page keeps About reset action in the viewport without app scroll', async ({ page }) => {
        await page.setViewportSize({ width: 900, height: 700 });
        await openMainMenuFromSave(page, true);
        await page.getByRole('button', { name: /^settings$/i }).evaluate((element) => {
            (element as HTMLButtonElement).click();
        });
        const settingsSection = page
            .locator('section')
            .filter({ has: page.getByRole('heading', { name: /^settings$/i }) })
            .first();
        await expect(settingsSection).toBeVisible();
        await expect(settingsSection).toHaveAttribute('data-settings-layout', 'short-stacked');
        await settingsSection.getByRole('button', { name: /about/i }).first().click();
        await settingsSection.getByTestId('settings-subsection-nav').getByRole('button', { name: /^reset$/i }).click();
        const reset = settingsSection.getByRole('button', { name: /reset to defaults/i });
        await expect(reset).toBeVisible();
        await expectLocatorFullyInWindowViewport(page, reset);
        await expectSettingsFooterButtonsInViewport(page, settingsSection);
        await expectAppScrollportHasNoVerticalOverflow(page);
    });

    test('900x700 run settings modal keeps About reset action in the viewport without app scroll', async ({ page }) => {
        await page.setViewportSize({ width: 900, height: 700 });
        await navigateToLevel1PlayPhase(page);
        await page.getByRole('button', { name: /run settings \(toolbar\)/i }).evaluate((element) => {
            (element as HTMLButtonElement).click();
        });
        const dialog = page.getByRole('dialog', { name: /run settings/i });
        await expect(dialog).toBeVisible();
        await expect(dialog).toHaveAttribute('data-settings-layout', 'short-stacked');
        await dialog.getByRole('button', { name: /about/i }).first().click();
        await dialog.getByTestId('settings-subsection-nav').getByRole('button', { name: /^reset$/i }).click();
        const reset = dialog.getByRole('button', { name: /reset to defaults/i });
        await expect(reset).toBeVisible();
        await expectLocatorFullyInWindowViewport(page, reset);
        await expectSettingsFooterButtonsInViewport(page, dialog);
        await expectAppScrollportHasNoVerticalOverflow(page);
    });

    test('1280x720 settings page stays two-column and keeps actions in viewport', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 });
        await openMainMenuFromSave(page, true);
        await page.getByRole('button', { name: /^settings$/i }).evaluate((element) => {
            (element as HTMLButtonElement).click();
        });
        const settingsSection = page
            .locator('section')
            .filter({ has: page.getByRole('heading', { name: /^settings$/i }) })
            .first();
        await expect(settingsSection).toBeVisible();
        await expect(settingsSection).toHaveAttribute('data-settings-layout', 'wide-short');
        const layout = await readSettingsLayout(settingsSection);
        const metrics = await readSettingsShellMetrics(page, settingsSection);
        expect(layout.contentBelowNav).toBe(false);
        expect(metrics.zoom).toBeGreaterThanOrEqual(0.92);
        expect(metrics.zoom).toBeLessThanOrEqual(1.01);
        await expectSettingsPanelInset(page, settingsSection, 4);
        await expectSettingsFooterButtonsInViewport(page, settingsSection);
        await expectAppScrollportHasNoVerticalOverflow(page);
    });

    test('1280x720 run settings modal stays two-column and keeps actions in viewport', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 });
        await navigateToLevel1PlayPhase(page);
        await page.getByRole('button', { name: /run settings \(toolbar\)/i }).evaluate((element) => {
            (element as HTMLButtonElement).click();
        });
        const dialog = page.getByRole('dialog', { name: /run settings/i });
        await expect(dialog).toBeVisible();
        await expect(dialog).toHaveAttribute('data-settings-layout', 'wide-short');
        const layout = await readSettingsLayout(dialog);
        const metrics = await readSettingsShellMetrics(page, dialog);
        expect(layout.contentBelowNav).toBe(false);
        expect(metrics.zoom).toBeGreaterThanOrEqual(0.92);
        expect(metrics.zoom).toBeLessThanOrEqual(1.01);
        await expectSettingsPanelInset(page, dialog, 4);
        await expectSettingsFooterButtonsInViewport(page, dialog);
        await expectAppScrollportHasNoVerticalOverflow(page);
    });

    test('compact touch viewport uses a full-bleed board behind the HUD', async ({ page }) => {
        await forceCoarsePointerMedia(page);
        await page.setViewportSize({ width: 390, height: 844 });
        await navigateToLevel1PlayPhase(page);

        const shell = page.getByTestId('game-shell');
        /* QA-003: single root `data-testid="game-hud"` on GameScreen; if HUD splits, update navigation-flow + this spec together. */
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
        test.setTimeout(180_000);
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

        const pinchOnce = () =>
            dispatchTouchSequence(page, [
                { points: [startA, startB], type: 'touchStart', waitMs: 40 },
                { points: [endA, endB], type: 'touchMove', waitMs: 50 },
                { points: [], type: 'touchEnd', waitMs: 80 }
            ]);

        await pinchOnce();
        const zoomedIn = async (): Promise<boolean> => (await readBoardViewportState(frame)).zoom > 1.08;
        try {
            await expect.poll(zoomedIn, { timeout: 8000 }).toBe(true);
        } catch {
            await page.waitForTimeout(200);
            await pinchOnce();
            await expect.poll(zoomedIn, { timeout: 12_000 }).toBe(true);
        }

        // Zoom can leave the board animating; avoid Playwright "stable" actionability timeouts on the toolbar.
        await page.getByRole('button', { name: /^fit board$/i }).evaluate((el) => (el as HTMLButtonElement).click());

        await expect(async () => {
            const v = await readBoardViewportState(frame);
            expect(Math.abs(v.panX)).toBeLessThan(0.02);
            expect(Math.abs(v.panY)).toBeLessThan(0.02);
            expect(v.zoom).toBeCloseTo(1, 2);
        }).toPass({ timeout: 20_000 });
    });

    test('two-finger pan moves the viewport and one-finger tap still flips a tile', async ({ page }) => {
        test.setTimeout(180_000);
        await forceCoarsePointerMedia(page);
        await page.setViewportSize({ width: 390, height: 844 });
        await navigateToLevel1PlayPhase(page);

        const frame = page.getByTestId('tile-board-frame');
        const stage = page.getByTestId('tile-board-stage-shell');

        const pinchStartA = await pointInLocator(stage, 0.43, 0.45, 1);
        const pinchStartB = await pointInLocator(stage, 0.57, 0.55, 2);
        const pinchEndA = await pointInLocator(stage, 0.3, 0.34, 1);
        const pinchEndB = await pointInLocator(stage, 0.7, 0.66, 2);

        const pinchZoomIn = () =>
            dispatchTouchSequence(page, [
                { points: [pinchStartA, pinchStartB], type: 'touchStart', waitMs: 34 },
                { points: [pinchEndA, pinchEndB], type: 'touchMove', waitMs: 40 },
                { points: [], type: 'touchEnd', waitMs: 70 }
            ]);

        await pinchZoomIn();
        const zoomed = async (): Promise<boolean> => (await readBoardViewportState(frame)).zoom > 1.08;
        try {
            await expect.poll(zoomed, { timeout: 8000 }).toBe(true);
        } catch {
            await page.waitForTimeout(200);
            await pinchZoomIn();
            await expect.poll(zoomed, { timeout: 12_000 }).toBe(true);
        }

        const panStartA = await pointInLocator(stage, 0.34, 0.48, 1);
        const panStartB = await pointInLocator(stage, 0.58, 0.56, 2);
        const panEndA = await pointInLocator(stage, 0.48, 0.54, 1);
        const panEndB = await pointInLocator(stage, 0.72, 0.62, 2);

        const panOnce = () =>
            dispatchTouchSequence(page, [
                { points: [panStartA, panStartB], type: 'touchStart', waitMs: 34 },
                { points: [panEndA, panEndB], type: 'touchMove', waitMs: 40 },
                { points: [], type: 'touchEnd', waitMs: 80 }
            ]);

        await panOnce();
        const selectionReady = async (): Promise<boolean> => {
            const v = await readBoardViewportState(frame);
            return v.selectionSuppressed === false;
        };
        try {
            await expect.poll(selectionReady, { timeout: 8000 }).toBe(true);
        } catch {
            await page.waitForTimeout(200);
            await panOnce();
            await expect.poll(selectionReady, { timeout: 12_000 }).toBe(true);
        }

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
