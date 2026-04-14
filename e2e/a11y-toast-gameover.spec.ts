import { expect, test } from '@playwright/test';
import { buildVisualSaveJson, gotoWithSaveAndQuery } from './visualScreenHelpers';

test.describe('E2E-004 / E2E-005 — achievement toast + game over landmarks', () => {
    test.describe.configure({ retries: 1 });

    test('E2E-004: dev sandbox seeds achievement unlock; toast is status + polite live region (or surface test id)', async ({
        page
    }) => {
        const params = new URLSearchParams({
            devSandbox: '1',
            screen: 'playing',
            fixture: 'dailyParasite',
            skipIntro: '1',
            unlockAchievements: 'ACH_FIRST_CLEAR'
        });
        await gotoWithSaveAndQuery(page, buildVisualSaveJson(true), params.toString());

        const tipsRegion = page.getByRole('region', { name: /memory dungeon tips/i });
        await expect(tipsRegion).toBeVisible({ timeout: 25_000 });

        const achievementToast = tipsRegion.locator('[data-crn-surface="achievement"]');
        await expect(achievementToast).toBeVisible({ timeout: 15_000 });
        await expect(achievementToast).toHaveAttribute('aria-live', 'polite');
        await expect(achievementToast).toHaveAttribute('role', 'status');
        await expect(achievementToast).toContainText(/first lantern/i);
    });

    test('E2E-005: game over exposes document main, primary title heading, and complementary rail', async ({ page }) => {
        const params = new URLSearchParams({
            devSandbox: '1',
            screen: 'gameOver',
            fixture: 'gameOver',
            skipIntro: '1'
        });
        await gotoWithSaveAndQuery(page, buildVisualSaveJson(true), params.toString());

        await expect(page.getByRole('main')).toBeVisible({ timeout: 25_000 });
        await expect(page.getByRole('heading', { level: 1, name: /expedition over/i })).toBeVisible();
        await expect(page.getByRole('complementary')).toBeVisible();
        await expect(page.getByText(/run complete/i)).toBeVisible();
    });
});
