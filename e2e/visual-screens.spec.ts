import { expect, test } from '@playwright/test';
import {
    VISUAL_VIEWPORTS,
    buildVisualSaveJson,
    captureVisualScreen,
    completeLevel1Play,
    dismissStartupIntro,
    expectNoHorizontalOverflow,
    forceGameOverWithMismatches,
    gotoWithSave,
    openLevel1Play,
    openMainMenuFromSave,
    waitLevel1PlayReady
} from './visualScreenHelpers';

test.describe.configure({ mode: 'parallel' });

for (const vp of VISUAL_VIEWPORTS) {
    test.describe(`Visual screens @ ${vp.id} (${vp.width}x${vp.height})`, () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize({ width: vp.width, height: vp.height });
        });

        test('main menu', async ({ page }) => {
            await openMainMenuFromSave(page, true);
            await expectNoHorizontalOverflow(page);
            await expect(page.getByRole('button', { name: /play arcade/i })).toBeVisible();
            await captureVisualScreen(page, vp.id, '01-main-menu');
        });

        test('main menu with How To Play', async ({ page }) => {
            await openMainMenuFromSave(page, false);
            await expect(page.getByText(/How To Play/i).first()).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await captureVisualScreen(page, vp.id, '02-main-menu-howto');
        });

        test('settings page', async ({ page }) => {
            await openMainMenuFromSave(page, true);
            await page.getByRole('button', { name: /^settings$/i }).click();
            await expect(page.getByRole('heading', { name: /desktop settings/i })).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await captureVisualScreen(page, vp.id, '03-settings-page');
        });

        test('game playing (level 1)', async ({ page }) => {
            await openLevel1Play(page);
            await expect(page.getByRole('group', { name: /game controls/i })).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await captureVisualScreen(page, vp.id, '04-game-playing');
        });

        test('pause modal', async ({ page }) => {
            await openLevel1Play(page);
            await page.getByRole('button', { name: /pause/i }).click();
            await expect(page.getByRole('dialog', { name: /run paused/i })).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await captureVisualScreen(page, vp.id, '05-pause-modal');
            await page
                .getByRole('dialog', { name: /run paused/i })
                .getByRole('button', { name: /^resume$/i })
                .click();
            await expect(page.getByRole('dialog', { name: /run paused/i })).toBeHidden();
        });

        test('run settings modal (in-game)', async ({ page }) => {
            await openLevel1Play(page);
            await page.getByRole('button', { name: /^settings$/i }).click();
            await expect(page.getByRole('dialog', { name: /run settings/i })).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await captureVisualScreen(page, vp.id, '06-run-settings-modal');
            await page.getByRole('button', { name: /^back$/i }).click();
            await expect(page.getByRole('dialog', { name: /run settings/i })).toBeHidden();
        });

        test('floor cleared modal', async ({ page }) => {
            test.setTimeout(90_000);
            await openLevel1Play(page);
            const pairs = await waitLevel1PlayReady(page);
            await completeLevel1Play(page, pairs);
            await expect(page.getByRole('dialog', { name: /floor cleared/i })).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await captureVisualScreen(page, vp.id, '07-floor-cleared-modal');
        });

        test('game over screen', async ({ page }) => {
            test.setTimeout(90_000);
            await openLevel1Play(page);
            const pairs = await waitLevel1PlayReady(page);
            await forceGameOverWithMismatches(page, pairs);
            await expect(page.getByText(/Expedition Over/i)).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await captureVisualScreen(page, vp.id, '08-game-over');
        });

        test('startup intro visible', async ({ page }) => {
            await gotoWithSave(page, buildVisualSaveJson(true));
            await expect(page.getByRole('dialog', { name: /startup relic intro/i })).toBeVisible({ timeout: 15000 });
            await page.waitForTimeout(400);
            await expectNoHorizontalOverflow(page);
            await captureVisualScreen(page, vp.id, '00-startup-intro');
        });
    });
}
