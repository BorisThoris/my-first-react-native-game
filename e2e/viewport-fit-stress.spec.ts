import { expect, test } from '@playwright/test';
import { forceCoarsePointerMedia } from './mobileTouchHelpers';
import {
    expectAppScrollportHasNoVerticalOverflow,
    expectLocatorFullyInWindowViewport,
    expectNoHorizontalOverflow,
    mainMenuPlayButton,
    openMainMenuFromSave
} from './visualScreenHelpers';

test.describe.configure({ mode: 'serial' });

const stressSizes: ReadonlyArray<{ height: number; name: string; width: number }> = [
    { height: 700, name: '900x700 short non-touch width', width: 900 },
    { height: 600, name: '800x600 short window', width: 800 }
];

for (const slot of stressSizes) {
    test.describe(slot.name, () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize({ height: slot.height, width: slot.width });
        });

        test('main menu: no scrollport overflow, low CTA fully in viewport', async ({ page }) => {
            await openMainMenuFromSave(page, true);
            await expectNoHorizontalOverflow(page);
            await expectAppScrollportHasNoVerticalOverflow(page);
            const low = page.getByTestId('main-menu-low-cta');
            await expect(low).toBeVisible({ timeout: 20_000 });
            await expectLocatorFullyInWindowViewport(page, low);
        });

        test('choose your path: low CTA fully in viewport', async ({ page }) => {
            await openMainMenuFromSave(page, true);
            await mainMenuPlayButton(page).click();
            await expect(page.getByRole('region', { name: /choose your path/i })).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await expectAppScrollportHasNoVerticalOverflow(page);
            const low = page.getByTestId('choose-path-low-cta');
            await expect(low).toBeVisible();
            await expectLocatorFullyInWindowViewport(page, low);
        });
    });
}

test.describe('iphone-se portrait with How To Play (onboarding)', () => {
    test.beforeEach(async ({ page }) => {
        await forceCoarsePointerMedia(page);
        await page.setViewportSize({ height: 667, width: 375 });
    });

    test('main menu low CTA fully in viewport', async ({ page }) => {
        await openMainMenuFromSave(page, false);
        await expect(page.getByText(/How To Play/i).first()).toBeVisible();
        await expectAppScrollportHasNoVerticalOverflow(page);
        const low = page.getByTestId('main-menu-low-cta');
        await expect(low).toBeVisible({ timeout: 20_000 });
        await expectLocatorFullyInWindowViewport(page, low);
    });
});
