import { expect, test, type Page } from '@playwright/test';
import { dismissStartupIntro } from './startupIntroHelpers';
import { defaultE2eGameSaveJson, STORAGE_KEY } from './tileBoardGameFlow';
import { openMainMenuFromSave, openLevel1Play, waitLevel1PlayReady } from './visualScreenHelpers';

/** HUD-018 / QA-003: `GameplayHudBar` exposes `game-hud` plus `hud-wing-left|center|right`. If the HUD splits, migrate these assertions + `mobile-layout.spec.ts` together. */
async function expectGameplayHudWithWings(page: Page): Promise<void> {
    await expect(page.getByTestId('game-hud')).toBeVisible();
    await expect(page.getByTestId('hud-wing-left')).toBeVisible();
    await expect(page.getByTestId('hud-wing-center')).toBeVisible();
    await expect(page.getByTestId('hud-wing-right')).toBeVisible();
}
test.describe('Navigation shells', () => {
    test.describe.configure({ retries: 1 });
    test('Play opens Choose Your Path then Classic Run starts level 1', async ({ page }) => {
        await openMainMenuFromSave(page, true);
        await page.getByRole('button', { name: /^play$/i }).click();
        await expect(page.getByRole('region', { name: /choose your path/i })).toBeVisible();
        await page.getByRole('button', { name: /classic run/i }).click();
        await expect(page.getByRole('heading', { name: /level 1/i })).toBeVisible();
    });

    test('Endless Mode card stays disabled on Choose Your Path', async ({ page }) => {
        await openMainMenuFromSave(page, true);
        await page.getByRole('button', { name: /^play$/i }).click();
        await expect(page.getByRole('button', { name: /endless mode/i })).toBeDisabled();
    });

    test('Collection from main menu returns to menu on Back', async ({ page }) => {
        await openMainMenuFromSave(page, true);
        await page.getByRole('button', { name: /^collection$/i }).click();
        await expect(page.getByRole('region', { name: /collection/i })).toBeVisible();
        await expect(page.getByTestId('collection-meta-frame-achievements')).toBeVisible();
        await page.getByRole('button', { name: /^back$/i }).click();
        await expect(page.getByRole('button', { name: /^play$/i })).toBeVisible();
    });

    test('Codex from main menu returns to menu on Back', async ({ page }) => {
        await openMainMenuFromSave(page, true);
        await page.getByRole('button', { name: /^codex$/i }).click();
        await expect(page.getByRole('region', { name: /^codex$/i })).toBeVisible();
        await page.getByRole('button', { name: /^back$/i }).click();
        await expect(page.getByRole('button', { name: /^play$/i })).toBeVisible();
    });

    test('In-run toolbar opens Inventory and Codex then returns to playing', async ({ page }) => {
        test.setTimeout(120_000);
        await openLevel1Play(page);
        await waitLevel1PlayReady(page);
        await page.getByTestId('game-toolbar-inventory').evaluate((el) => (el as HTMLButtonElement).click());
        await expect(page.getByRole('region', { name: /inventory/i })).toBeVisible();
        await page
            .getByRole('region', { name: /inventory/i })
            .getByRole('button', { name: /^back$/i })
            .evaluate((el) => (el as HTMLButtonElement).click());
        await expectGameplayHudWithWings(page);

        await page.getByTestId('game-toolbar-codex').evaluate((el) => (el as HTMLButtonElement).click());
        await expect(page.getByRole('region', { name: /codex/i })).toBeVisible();
        await page
            .getByRole('region', { name: /codex/i })
            .getByRole('button', { name: /^back$/i })
            .evaluate((el) => (el as HTMLButtonElement).click());
        await expectGameplayHudWithWings(page);
    });

    test('in-run inventory from toolbar keeps data-view=playing until Back (SIDE-013 shell parity)', async ({ page }) => {
        test.setTimeout(120_000);
        await openLevel1Play(page);
        await waitLevel1PlayReady(page);
        const root = page.locator('[data-view]').first();
        await expect(root).toHaveAttribute('data-view', 'playing');
        await page.getByTestId('game-toolbar-inventory').evaluate((el) => (el as HTMLButtonElement).click());
        await expect(page.getByRole('region', { name: /inventory/i })).toBeVisible();
        await expect(root).toHaveAttribute('data-view', 'playing');
        await page
            .getByRole('region', { name: /inventory/i })
            .getByRole('button', { name: /^back$/i })
            .evaluate((el) => (el as HTMLButtonElement).click());
        await expect(root).toHaveAttribute('data-view', 'playing');
        await expectGameplayHudWithWings(page);
    });

    test('Daily Challenge from Choose Your Path starts a run', async ({ page }) => {
        await page.addInitScript(
            ([key, json]) => {
                localStorage.setItem(key, json);
            },
            [STORAGE_KEY, defaultE2eGameSaveJson]
        );
        await page.goto('/');
        await dismissStartupIntro(page);
        await page.getByRole('button', { name: /^play$/i }).click();
        await page.getByRole('button', { name: /daily challenge/i }).click();
        await expect(page.getByRole('heading', { name: /level 1/i })).toBeVisible();
    });

    test('Import JSON modal shows inline error for invalid payload and starts run for valid export', async ({ page }) => {
        await openMainMenuFromSave(page, true);
        await page.getByRole('button', { name: /^play$/i }).click();
        await expect(page.getByRole('region', { name: /choose your path/i })).toBeVisible();
        await page.getByTestId('main-menu-low-cta').scrollIntoViewIfNeeded();
        await page.getByTestId('main-menu-low-cta').click();
        const libraryDetail = page.getByTestId('library-mode-detail-modal');
        await expect(libraryDetail).toBeVisible();
        await libraryDetail.getByRole('button', { name: /import run/i }).click();
        const modal = page.getByTestId('run-import-modal');
        await expect(modal).toBeVisible();
        await expect(page.getByRole('button', { name: /^import$/i })).toBeDisabled();

        await page.getByTestId('run-import-json').fill('{not valid json');
        await page.getByRole('button', { name: /^import$/i }).click();
        await expect(page.getByTestId('run-import-error')).toContainText(/could not import/i);

        const validPayload =
            '{"v":1,"seed":999001,"rules":7,"mode":"endless","mutators":[]}';
        await page.getByTestId('run-import-json').fill(validPayload);
        await page.getByRole('button', { name: /^import$/i }).click();
        await expect(modal).toBeHidden({ timeout: 20_000 });
        await expect(page.getByRole('heading', { name: /level 1/i })).toBeAttached({ timeout: 20_000 });
    });
});
