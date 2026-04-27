import { expect, test } from '@playwright/test';
import { openMainMenuFromSave } from './visualScreenHelpers';

test.describe('Wild Run', () => {
    test.describe.configure({ retries: 1 });

    test('starts from Choose Your Path', async ({ page }) => {
        await openMainMenuFromSave(page, true);
        await page.getByRole('button', { name: /^play$/i }).click();
        await expect(page.getByRole('region', { name: /choose your path/i })).toBeVisible();
        await page.getByRole('button', { name: /browse modes/i }).click();
        const wild = page
            .getByRole('region', { name: /choose your path/i })
            .getByRole('button', { name: /wild run/i });
        await wild.scrollIntoViewIfNeeded();
        await wild.click();
        const detail = page.getByTestId('library-mode-detail-modal');
        await expect(detail).toBeVisible();
        await detail.getByRole('button', { name: /^play$/i }).click();
        await expect(page.getByTestId('game-hud')).toBeVisible({ timeout: 25_000 });
        await expect(page.getByRole('group', { name: /run stats/i })).toBeVisible({ timeout: 25_000 });
    });
});
