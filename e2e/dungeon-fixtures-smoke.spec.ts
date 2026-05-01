import { test, expect } from '@playwright/test';
import {
    DUNGEON_E2E_FIXTURE_RECIPES,
    dungeonE2EFixtureUrlQuery
} from '../src/shared/dungeon-e2e-fixtures';
import { buildVisualSaveJson, gotoWithSaveAndQuery, visualCaptureDir } from './visualScreenHelpers';
import { join } from 'node:path';

test.describe('DNG-072 dungeon fixture smoke', () => {
    for (const recipe of DUNGEON_E2E_FIXTURE_RECIPES) {
        test(`${recipe.label} opens stable dev sandbox fixture`, async ({ page }) => {
            await gotoWithSaveAndQuery(page, buildVisualSaveJson(true), dungeonE2EFixtureUrlQuery(recipe));

            for (const selector of recipe.selectors) {
                await expect(page.locator(selector).first()).toBeVisible({ timeout: 25_000 });
            }
        });
    }

    test('captures representative desktop and mobile dungeon screenshots', async ({ page }) => {
        const desktop = DUNGEON_E2E_FIXTURE_RECIPES.find((recipe) => recipe.id === 'dungeon_enemy_floor')!;
        await page.setViewportSize({ width: 1440, height: 900 });
        await gotoWithSaveAndQuery(page, buildVisualSaveJson(true), dungeonE2EFixtureUrlQuery(desktop));
        await expect(page.getByTestId('tile-board-frame')).toBeVisible({ timeout: 25_000 });
        await page.screenshot({
            animations: 'disabled',
            fullPage: true,
            path: join(visualCaptureDir('desktop', 'landscape'), desktop.desktopCapture)
        });

        const mobile = DUNGEON_E2E_FIXTURE_RECIPES.find((recipe) => recipe.id === 'dungeon_boss_floor')!;
        await page.setViewportSize({ width: 390, height: 844 });
        await gotoWithSaveAndQuery(page, buildVisualSaveJson(true), dungeonE2EFixtureUrlQuery(mobile));
        await expect(page.getByTestId('tile-board-frame')).toBeVisible({ timeout: 25_000 });
        await page.screenshot({
            animations: 'disabled',
            fullPage: true,
            path: join(visualCaptureDir('mobile', 'portrait'), mobile.mobileCapture)
        });
    });
});
