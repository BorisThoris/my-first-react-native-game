import { expect, test } from '@playwright/test';
import { navigateToLevel1PlayPhase } from './tileBoardGameFlow';

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
        await page.goto('/');
        await navigateToLevel1PlayPhase(page);
        const inset500 = await readStageTopInset();
        expect(inset500).not.toBeNull();
        expect(inset400).toBeLessThan(inset500!);
    });
});
