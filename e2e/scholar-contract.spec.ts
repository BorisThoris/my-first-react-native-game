import { expect, test } from '@playwright/test';
import { openMainMenuFromSave } from './visualScreenHelpers';

test.describe('Scholar contract run', () => {
    test.describe.configure({ retries: 1 });

    test('starts from main menu More run types', async ({ page }) => {
        await openMainMenuFromSave(page, true);
        const scholar = page
            .getByRole('group', { name: /more run types/i })
            .getByRole('button', { name: /^Scholar$/i });
        await scholar.scrollIntoViewIfNeeded();
        await scholar.click();
        await expect(page.getByTestId('game-hud')).toBeVisible({ timeout: 25_000 });
        await expect(page.getByRole('group', { name: /run stats/i })).toBeVisible({ timeout: 25_000 });
    });
});
