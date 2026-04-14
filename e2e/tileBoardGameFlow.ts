import { expect, type Page } from '@playwright/test';
import { dismissStartupIntro } from './startupIntroHelpers';

export const STORAGE_KEY = 'memory-dungeon-save-data';

/** @deprecated Prefer `data-hidden-tile-count` on `tile-board-frame`; kept for grep / gradual migration. */
export const BOARD_HIDDEN_TILE_BUTTON_RE = /hidden tile, row \d+, column \d+/i;

export async function readFrameHiddenTileCount(page: Page): Promise<number> {
    const raw = await page.getByTestId('tile-board-frame').getAttribute('data-hidden-tile-count');
    return Number.parseInt(raw ?? '0', 10);
}

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
        .poll(async () => readFrameHiddenTileCount(page), {
            timeout: 50_000,
            intervals: [80, 120, 200, 400]
        })
        .toBeGreaterThan(0);
    await expect(page.getByTestId('tile-board-application')).toBeVisible({ timeout: 25_000 });
}

/**
 * Click a board cell on the WebGL canvas using stage-shell layout (row/column are 1-based).
 */
export async function clickHiddenTileRowCol(page: Page, row: number, column: number, hiddenBefore?: number): Promise<void> {
    const frame = page.getByTestId('tile-board-frame');
    const cols = Number(await frame.getAttribute('data-board-columns'));
    const rows = Number(await frame.getAttribute('data-board-rows'));
    const stage = page.getByTestId('tile-board-stage-shell');
    await expect(stage).toBeVisible();
    const box = await stage.boundingBox();
    expect(box).toBeTruthy();
    const cellW = box!.width / cols;
    const cellH = box!.height / rows;
    const cx = box!.x + (column - 0.5) * cellW;
    const cy = box!.y + (row - 0.5) * cellH;
    await page.mouse.click(cx, cy);
    if (hiddenBefore != null) {
        await expect
            .poll(async () => readFrameHiddenTileCount(page), { timeout: 12_000 })
            .not.toBe(hiddenBefore);
    }
}
