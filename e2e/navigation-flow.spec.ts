import { expect, test } from '@playwright/test';
import { dismissStartupIntro } from './startupIntroHelpers';
import { defaultE2eGameSaveJson, STORAGE_KEY } from './tileBoardGameFlow';
import { openMainMenuFromSave, openLevel1Play } from './visualScreenHelpers';

test.describe('Navigation shells', () => {
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
        await page.getByRole('button', { name: /^back$/i }).click();
        await expect(page.getByRole('button', { name: /^play$/i })).toBeVisible();
    });

    test('Utility flyout opens Inventory and Codex then returns to playing', async ({ page }) => {
        await openLevel1Play(page);
        await page.getByRole('button', { name: /show utility menu/i }).click();
        await page
            .getByRole('group', { name: /in-game menu/i })
            .getByRole('button', { name: /active run loadout/i })
            .click();
        await expect(page.getByRole('region', { name: /inventory/i })).toBeVisible();
        await page.getByRole('region', { name: /inventory/i }).getByRole('button', { name: /^back$/i }).click();
        await expect(page.getByTestId('game-hud')).toBeVisible();

        await page.getByRole('button', { name: /show utility menu/i }).click();
        await page
            .getByRole('group', { name: /in-game menu/i })
            .getByRole('button', { name: /read-only rules/i })
            .click();
        await expect(page.getByRole('region', { name: /codex/i })).toBeVisible();
        await page.getByRole('region', { name: /codex/i }).getByRole('button', { name: /^back$/i }).click();
        await expect(page.getByTestId('game-hud')).toBeVisible();
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
});
