import { expect, test } from '@playwright/test';

/** Smoke load for DEV procedural illustration gallery sandbox. */
test('procedural gallery sandbox loads', async ({ page }) => {
    await page.goto('/?devSandbox=1&fx=proceduralGallery');
    await expect(page.locator('[data-e2e-procedural-gallery]')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('heading', { name: /procedural illustration gallery/i })).toBeVisible();
});
