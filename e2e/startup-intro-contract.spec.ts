import { expect, test } from '@playwright/test';
import { STORAGE_KEY } from './tileBoardGameFlow';
import { buildVisualSaveJson, gotoWithSaveExpectStartupIntroVisible, mainMenuPlayButton } from './visualScreenHelpers';

const captureStartupEvidence = process.env.REG034_CAPTURE === '1';

test.describe('REG-034 startup intro contract', () => {
    test.describe.configure({ retries: 1 });

    test('keyboard skip returns focus and unblocks menu pointer interaction', async ({ page }) => {
        test.setTimeout(60_000);
        await gotoWithSaveExpectStartupIntroVisible(page, buildVisualSaveJson(true));

        const intro = page.getByRole('dialog', { name: /startup relic intro/i });
        await expect(intro).toHaveAttribute('data-skip-state', 'idle');
        const pointerStateBeforeSkip = await page.getByTestId('main-menu-focus-root').getAttribute('data-e2e-menu-pointer');
        expect(['blocked', 'interactive']).toContain(pointerStateBeforeSkip);
        if (captureStartupEvidence) {
            await page.screenshot({ path: '/opt/cursor/artifacts/reg-034-desktop-intro.png', fullPage: true });
        }

        await page.keyboard.press('Enter');

        await expect
            .poll(
                async () => {
                    const introVisible = await intro.isVisible().catch(() => false);
                    const skipState = introVisible ? await intro.getAttribute('data-skip-state').catch(() => null) : 'dismissed';
                    return skipState;
                },
                { timeout: 30_000, intervals: [50, 100, 250] }
            )
            .toMatch(/requested|dismissed/);
        await expect(intro).toBeHidden({ timeout: 30_000 });
        await expect(page.getByTestId('main-menu-focus-root')).toBeFocused({ timeout: 10_000 });
        await expect(page.getByTestId('main-menu-focus-root')).toHaveAttribute('data-e2e-menu-pointer', 'interactive');

        await mainMenuPlayButton(page).click();
        await expect(page.getByRole('region', { name: /choose your path/i })).toBeVisible();
    });

    test('reduced-motion boot still exposes fallback/loading state and accepts Escape skip', async ({ page }) => {
        test.setTimeout(60_000);
        const saveJson = buildVisualSaveJson(true, true);
        await page.addInitScript(
            ([key, json]) => {
                localStorage.setItem(key, json);
            },
            [STORAGE_KEY, saveJson]
        );

        await page.goto('/', { waitUntil: 'domcontentloaded' });

        const intro = page.getByRole('dialog', { name: /startup relic intro/i });
        await expect(intro).toBeVisible({ timeout: 30_000 });
        await expect(intro).toHaveAttribute('data-render-mode', /three|fallback/);
        await expect(intro).toHaveAttribute('data-assets', /loading|ready|fallback/);
        if (captureStartupEvidence) {
            await page.setViewportSize({ width: 390, height: 844 });
            await page.screenshot({ path: '/opt/cursor/artifacts/reg-034-phone-reduced-motion-intro.png', fullPage: true });
        }

        await page.keyboard.press('Escape');
        await expect
            .poll(
                async () => {
                    const introVisible = await intro.isVisible().catch(() => false);
                    const skipState = introVisible ? await intro.getAttribute('data-skip-state').catch(() => null) : 'dismissed';
                    return skipState;
                },
                { timeout: 30_000, intervals: [50, 100, 250] }
            )
            .toMatch(/requested|dismissed/);
        await expect(intro).toBeHidden({ timeout: 30_000 });
        await expect(mainMenuPlayButton(page)).toBeVisible();
    });
});
