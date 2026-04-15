import { expect, test, type Page } from '@playwright/test';
import { mainMenuPlayButton, openMainMenuFromSave } from './visualScreenHelpers';

async function expectChoosePathReviewLayout(
    page: Page,
    expectedScrollerHeight: { min: string; max: string }
): Promise<void> {
    const inlineBack = page.getByTestId('choose-path-inline-back');
    const title = page.getByRole('heading', { name: /choose your path/i });
    const scroller = page.getByLabel(/more modes library, swipe or drag sideways to browse pages/i);

    await expect(inlineBack).toBeVisible();
    await expect(title).toBeVisible();
    await expect(scroller).toBeVisible();

    const [inlineBackBox, titleBox] = await Promise.all([inlineBack.boundingBox(), title.boundingBox()]);
    expect(inlineBackBox).not.toBeNull();
    expect(titleBox).not.toBeNull();
    expect(inlineBackBox!.x).toBeLessThanOrEqual(titleBox!.x + 20);
    expect(inlineBackBox!.y + inlineBackBox!.height).toBeLessThanOrEqual(titleBox!.y + 12);

    const scrollMetrics = await scroller.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
            clientWidth: element.clientWidth,
            maxHeight: style.maxHeight,
            minHeight: style.minHeight,
            overflowX: style.overflowX,
            scrollWidth: element.scrollWidth,
            scrollbarWidth: style.getPropertyValue('scrollbar-width').trim()
        };
    });
    expect(scrollMetrics.minHeight).toBe(expectedScrollerHeight.min);
    expect(scrollMetrics.maxHeight).toBe(expectedScrollerHeight.max);
    expect(scrollMetrics.overflowX).toBe('auto');
    expect(scrollMetrics.scrollWidth).toBeGreaterThan(scrollMetrics.clientWidth);
    if (scrollMetrics.scrollbarWidth) {
        expect(scrollMetrics.scrollbarWidth).toBe('thin');
    }
}

/** One-off full-page capture for design review (Choose Your Path + More modes). */
test('review screenshot: choose your path @1366x768', async ({ page }) => {
    await page.setViewportSize({ height: 768, width: 1366 });
    await openMainMenuFromSave(page, true);
    await mainMenuPlayButton(page).click();
    await page.getByRole('region', { name: /choose your path/i }).waitFor({ state: 'visible' });
    await expectChoosePathReviewLayout(page, { max: '210px', min: '166px' });
    await page.getByTestId('choose-path-more-modes').scrollIntoViewIfNeeded();
    await page.screenshot({
        fullPage: true,
        path: 'test-results/cyp-choose-path-review.png'
    });
});

test('review screenshot: choose your path @390x844', async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await openMainMenuFromSave(page, true);
    await mainMenuPlayButton(page).click();
    await page.getByRole('region', { name: /choose your path/i }).waitFor({ state: 'visible' });
    await expectChoosePathReviewLayout(page, { max: '228px', min: '184px' });
    await page.getByTestId('choose-path-more-modes').scrollIntoViewIfNeeded();
    await page.screenshot({
        fullPage: true,
        path: 'test-results/cyp-choose-path-review-mobile.png'
    });
});
