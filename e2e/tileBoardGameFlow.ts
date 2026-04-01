import { expect, type Page } from '@playwright/test';
import { dismissStartupIntro } from './startupIntroHelpers';

export const STORAGE_KEY = 'memory-dungeon-save-data';

export const reduceMotionSaveJson = JSON.stringify({
    schemaVersion: 2,
    bestScore: 0,
    achievements: {
        ACH_FIRST_CLEAR: false,
        ACH_LEVEL_FIVE: false,
        ACH_SCORE_THOUSAND: false,
        ACH_PERFECT_CLEAR: false,
        ACH_LAST_LIFE: false
    },
    settings: {
        masterVolume: 0.8,
        musicVolume: 0.55,
        sfxVolume: 0.8,
        displayMode: 'windowed',
        uiScale: 1,
        reduceMotion: true,
        debugFlags: {
            showDebugTools: false,
            allowBoardReveal: false,
            disableAchievementsOnDebug: true
        }
    },
    onboardingDismissed: false,
    lastRunSummary: null
});

export async function navigateToLevel1PlayPhase(page: Page): Promise<void> {
    await page.goto('/');
    await dismissStartupIntro(page);
    await page.getByRole('button', { name: /play arcade/i }).click();
    await expect(page.getByRole('heading', { name: /level 1/i })).toBeVisible();
    await expect(page.getByRole('group', { name: /run stats/i })).toBeVisible({ timeout: 10000 });
    await expect
        .poll(async () => page.getByRole('button', { name: /hidden tile/i }).count(), { timeout: 12000 })
        .toBeGreaterThan(0);
}

export async function clickHiddenTileRowCol(page: Page, row: number, column: number, hiddenBefore: number): Promise<void> {
    const label = new RegExp(`hidden tile, row ${row}, column ${column}`, 'i');
    await page.getByRole('button', { name: label }).click({ force: true });
    await expect
        .poll(async () => page.getByRole('button', { name: /hidden tile/i }).count(), { timeout: 3000 })
        .toBeLessThan(hiddenBefore);
}
