import { expect, test, type Page } from '@playwright/test';
import { mainMenuPlayButton, openMainMenuFromSave } from './visualScreenHelpers';

async function expectChoosePathReviewLayout(
    page: Page
): Promise<void> {
    const inlineBack = page.getByTestId('choose-path-inline-back');
    const title = page.getByRole('heading', { name: /choose your path/i });
    const launcher = page.getByTestId('choose-path-launcher');

    await expect(inlineBack).toBeVisible();
    await expect(title).toBeVisible();
    await expect(launcher).toBeVisible();
    await expect(launcher.getByRole('button', { name: /start run/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /browse modes/i })).toBeVisible();
    await expect(page.getByTestId('choose-path-more-modes')).toHaveCount(0);

    const [inlineBackBox, titleBox] = await Promise.all([inlineBack.boundingBox(), title.boundingBox()]);
    expect(inlineBackBox).not.toBeNull();
    expect(titleBox).not.toBeNull();
    expect(inlineBackBox!.x).toBeLessThanOrEqual(titleBox!.x + 20);
    expect(inlineBackBox!.y + inlineBackBox!.height).toBeLessThanOrEqual(titleBox!.y + 12);
}

/** One-off full-page capture for design review (clean launcher state). */
test('review screenshot: choose your path @1366x768', async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ height: 768, width: 1366 });
    await openMainMenuFromSave(page, true);
    await mainMenuPlayButton(page).evaluate((el) => (el as HTMLButtonElement).click());
    await page.getByRole('region', { name: /choose your path/i }).waitFor({ state: 'visible' });
    await expectChoosePathReviewLayout(page);
    await page.screenshot({
        fullPage: true,
        path: 'test-results/cyp-choose-path-review.png'
    });
});

test('review screenshot: choose your path @390x844', async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ height: 844, width: 390 });
    await openMainMenuFromSave(page, true);
    await mainMenuPlayButton(page).evaluate((el) => (el as HTMLButtonElement).click());
    await page.getByRole('region', { name: /choose your path/i }).waitFor({ state: 'visible' });
    await expectChoosePathReviewLayout(page);
    await page.screenshot({
        fullPage: true,
        path: 'test-results/cyp-choose-path-review-mobile.png'
    });
});
