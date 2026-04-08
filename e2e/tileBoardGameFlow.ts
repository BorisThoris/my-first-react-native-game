import { expect, type Page } from '@playwright/test';
import { dismissStartupIntro } from './startupIntroHelpers';

export const STORAGE_KEY = 'memory-dungeon-save-data';

/** Board hit targets only — avoids matching toolbar labels like "Shuffle hidden tiles". */
export const BOARD_HIDDEN_TILE_BUTTON_RE = /hidden tile, row \d+, column \d+/i;

/** Menu + level 1 play without onboarding or powers FTUE chrome (used by gesture/layout harnesses). */
export const defaultE2eGameSaveJson = JSON.stringify({
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
    onboardingDismissed: true,
    lastRunSummary: null,
    powersFtueSeen: true
});

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
    lastRunSummary: null,
    powersFtueSeen: true
});

export async function navigateToLevel1PlayPhase(page: Page, saveJson: string = defaultE2eGameSaveJson): Promise<void> {
    await page.addInitScript(
        ([key, json]) => {
            localStorage.setItem(key, json);
        },
        [STORAGE_KEY, saveJson]
    );
    await page.goto('/');
    await dismissStartupIntro(page);
    await page.getByRole('button', { name: /^play$/i }).click();
    await expect(page.getByRole('region', { name: /choose your path/i })).toBeVisible();
    await page.getByRole('button', { name: /classic run/i }).click();
    // Level title can be sr-only on compact viewports; attached is enough to proceed.
    await expect(page.getByRole('heading', { name: /level 1/i })).toBeAttached({ timeout: 15_000 });
    await expect(page.getByRole('group', { name: /run stats/i })).toBeVisible({ timeout: 15_000 });
    await expect
        .poll(async () => page.getByRole('button', { name: BOARD_HIDDEN_TILE_BUTTON_RE }).count(), {
            timeout: 50_000,
            intervals: [80, 120, 200, 400]
        })
        .toBeGreaterThan(0);
    const firstHidden = page.getByRole('button', { name: /hidden tile, row 1, column 1/i });
    await expect(firstHidden).toBeEnabled({ timeout: 25_000 });
}

export async function clickHiddenTileRowCol(page: Page, row: number, column: number, hiddenBefore: number): Promise<void> {
    const label = new RegExp(`hidden tile, row ${row}, column ${column}`, 'i');
    const hit = page.getByRole('button', { name: label });
    await hit.evaluate((el) => (el as HTMLButtonElement).click());
    await expect
        .poll(async () => page.getByRole('button', { name: BOARD_HIDDEN_TILE_BUTTON_RE }).count(), { timeout: 12000 })
        .toBeLessThan(hiddenBefore);
}
