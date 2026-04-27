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

        test('main menu: no scrollport overflow, primary CTA frame fully in viewport', async ({ page }) => {
            await openMainMenuFromSave(page, true);
            await expectNoHorizontalOverflow(page);
            await expectAppScrollportHasNoVerticalOverflow(page);
            const primary = page.getByTestId('main-menu-primary-meta-frame');
            await expect(primary).toBeVisible({ timeout: 20_000 });
            await expectLocatorFullyInWindowViewport(page, primary);
        });

        test('choose your path: locked Endless CTA fully in viewport', async ({ page }) => {
            await openMainMenuFromSave(page, true);
            await mainMenuPlayButton(page).click();
            await expect(page.getByRole('region', { name: /choose your path/i })).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await expectAppScrollportHasNoVerticalOverflow(page);
            const lockedEndless = page.getByTestId('choose-path-low-cta');
            await expect(lockedEndless).toBeVisible();
            await page.getByTestId('choose-path-more-modes').scrollIntoViewIfNeeded();
            await lockedEndless.scrollIntoViewIfNeeded();
            await expectLocatorFullyInWindowViewport(page, lockedEndless);
        });

        test('profile: heading fully in viewport', async ({ page }) => {
            await openMainMenuFromSave(page, true);
            await page.getByRole('button', { name: /^profile$/i }).click();
            await expect(page.getByRole('region', { name: /profile/i })).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await expectAppScrollportHasNoVerticalOverflow(page);
            const heading = page.getByRole('heading', { name: /^profile$/i });
            await expect(heading).toBeVisible();
            await expectLocatorFullyInWindowViewport(page, heading);
        });
    });
}

test.describe('iphone-se portrait with How To Play (onboarding)', () => {
    test.beforeEach(async ({ page }) => {
        await forceCoarsePointerMedia(page);
        await page.setViewportSize({ height: 667, width: 375 });
    });

    test('main menu Play control fully in viewport', async ({ page }) => {
        await openMainMenuFromSave(page, false);
        await expect(page.getByText(/How To Play/i).first()).toBeVisible();
        await expectAppScrollportHasNoVerticalOverflow(page);
        const play = mainMenuPlayButton(page);
        await expect(play).toBeVisible({ timeout: 20_000 });
        await expectLocatorFullyInWindowViewport(page, play);
    });
});
