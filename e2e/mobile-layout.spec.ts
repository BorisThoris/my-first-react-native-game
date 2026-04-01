import { expect, test, type Locator } from '@playwright/test';
import { navigateToLevel1PlayPhase } from './tileBoardGameFlow';
import { openMainMenuFromSave } from './visualScreenHelpers';

test.describe.configure({ mode: 'serial' });
test.setTimeout(60_000);

async function readSettingsLayout(container: Locator): Promise<{
    sameColumn: boolean;
    stacked: boolean;
    footerWidth: number;
    buttonWidths: number[];
}> {
    const first = await container.getByRole('heading', { name: /^display$/i }).locator('..').boundingBox();
    const second = await container.getByRole('heading', { name: /^volume$/i }).locator('..').boundingBox();
    const footerActions = container.getByRole('button', { name: /^back$/i }).locator('..');
    const footer = await footerActions.boundingBox();
    const buttons = await footerActions.locator('button').evaluateAll((elements) =>
        elements.map((element) => (element as HTMLElement).getBoundingClientRect().width)
    );

    expect(first).toBeTruthy();
    expect(second).toBeTruthy();
    expect(footer).toBeTruthy();

    return {
        sameColumn: Math.abs(first!.x - second!.x) <= 1,
        stacked: second!.y >= first!.y + first!.height - 1,
        footerWidth: footer!.width,
        buttonWidths: buttons
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
        await expect(page.getByText(/memorize the board before the tiles flip/i)).toBeVisible();
        await expect(page.getByText(/match pairs cleanly to build streak and score/i)).toBeVisible();
        await expect(page.getByText(/every 4-match streak grants a guard; every 8 restores a life/i)).toBeVisible();
        await expect(page.getByText(/record & last run/i)).toBeVisible();
    });

    test('phone landscape keeps condensed onboarding copy readable', async ({ page }) => {
        await page.setViewportSize({ width: 844, height: 390 });
        await openMainMenuFromSave(page, false);
        await expect(page.getByText(/memorize the board before the tiles flip/i)).toBeVisible();
        await expect(page.getByText(/match pairs cleanly to build streak and score/i)).toBeVisible();
        await expect(page.getByText(/every 4-match streak grants a guard; every 8 restores a life/i)).toBeVisible();
    });

    test('game HUD stays horizontal on compact viewport', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await navigateToLevel1PlayPhase(page);
        const hud = page.locator('header').filter({ has: page.getByRole('group', { name: /run stats/i }) });
        await expect(hud).toBeVisible();
        const flexDirection = await hud.evaluate((el) => getComputedStyle(el).flexDirection);
        expect(flexDirection).toBe('row');
    });

    test('game control icons meet minimum touch target on compact viewport', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await navigateToLevel1PlayPhase(page);
        const controls = page.getByRole('group', { name: /game controls/i });
        await expect(controls).toBeVisible();
        for (const name of [/pause/i, /settings/i]) {
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
        await page.getByRole('button', { name: /^settings$/i }).click();
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
        await page.getByRole('button', { name: /^settings$/i }).click();
        const dialog = page.getByRole('dialog', { name: /run settings/i });
        await expect(dialog).toBeVisible();
        const back = dialog.getByRole('button', { name: /^back$/i });
        const save = dialog.getByRole('button', { name: /^save$/i });
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
        await page.getByRole('button', { name: /^settings$/i }).click();
        await expect(page.getByRole('heading', { name: /^settings$/i })).toBeVisible();

        const layout = await readSettingsLayout(
            page.locator('section').filter({ has: page.getByRole('heading', { name: /^settings$/i }) }).first()
        );

        expect(layout.sameColumn).toBe(true);
        expect(layout.stacked).toBe(true);
        expect(layout.buttonWidths).toHaveLength(2);
        expect(layout.buttonWidths[0]).toBeGreaterThanOrEqual(layout.footerWidth - 2);
        expect(layout.buttonWidths[1]).toBeGreaterThanOrEqual(layout.footerWidth - 2);
    });

    test('short-height landscape run settings modal collapses to one column with full-width actions', async ({ page }) => {
        await page.setViewportSize({ width: 844, height: 390 });
        await navigateToLevel1PlayPhase(page);
        await page.getByRole('button', { name: /^settings$/i }).click();
        const dialog = page.getByRole('dialog', { name: /run settings/i });
        await expect(dialog).toBeVisible();
        const layout = await readSettingsLayout(dialog);

        expect(layout.sameColumn).toBe(true);
        expect(layout.stacked).toBe(true);
        expect(layout.buttonWidths).toHaveLength(2);
        expect(layout.buttonWidths[0]).toBeGreaterThanOrEqual(layout.footerWidth - 2);
        expect(layout.buttonWidths[1]).toBeGreaterThanOrEqual(layout.footerWidth - 2);
    });

    test('narrow phone reduces tile stage inset vs standard mobile', async ({ page }) => {
        const readStageTopInset = async (): Promise<number | null> => {
            const webglStage = page.getByTestId('tile-board-stage');
            if (await webglStage.count()) {
                return webglStage.evaluate((el) => {
                    const stage = el.parentElement;
                    return stage ? parseFloat(getComputedStyle(stage).top) : null;
                });
            }
            return page.getByTestId('tile-board-fallback').evaluate((el) => {
                const stage = el.parentElement;
                return stage ? parseFloat(getComputedStyle(stage).top) : null;
            });
        };

        await page.setViewportSize({ width: 400, height: 844 });
        await navigateToLevel1PlayPhase(page);
        const inset400 = await readStageTopInset();
        expect(inset400).not.toBeNull();

        await page.setViewportSize({ width: 500, height: 844 });
        await navigateToLevel1PlayPhase(page);
        const inset500 = await readStageTopInset();
        expect(inset500).not.toBeNull();
        expect(inset400).toBeLessThan(inset500!);
    });
});
