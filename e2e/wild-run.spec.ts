import { expect, test } from '@playwright/test';
import { openMainMenuFromSave } from './visualScreenHelpers';

test.describe('Wild Run', () => {
    test.describe.configure({ retries: 1 });

    test('starts from main menu More run types', async ({ page }) => {
        await openMainMenuFromSave(page, true);
        const wild = page
            .getByRole('group', { name: /more run types/i })
            .getByRole('button', { name: /^Wild Run$/i });
        await wild.scrollIntoViewIfNeeded();
        await wild.click();
        await expect(page.getByTestId('game-hud')).toBeVisible({ timeout: 25_000 });
        await expect(page.getByRole('group', { name: /run stats/i })).toBeVisible({ timeout: 25_000 });
    });
});
