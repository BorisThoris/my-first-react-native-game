import { expect, type Page } from '@playwright/test';
import { dismissStartupIntro } from './startupIntroHelpers';

export const STORAGE_KEY = 'memory-dungeon-save-data';

/** @deprecated Prefer `data-hidden-tile-count` on `tile-board-frame`; kept for grep / gradual migration. */
export const BOARD_HIDDEN_TILE_BUTTON_RE = /hidden tile, row \d+, column \d+/i;

export async function readFrameHiddenTileCount(page: Page): Promise<number> {
    const raw = await page.getByTestId('tile-board-frame').getAttribute('data-hidden-tile-count');
    return Number.parseInt(raw ?? '0', 10);
}

/** Memorize can still report hidden tiles; picks only work in `playing`. */
export async function waitForBoardPlayPhase(page: Page): Promise<void> {
    await expect(page.getByTestId('tile-board-frame')).toHaveAttribute('data-board-run-status', 'playing', {
        timeout: 60_000
    });
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
    await waitForBoardPlayPhase(page);
}

/**
 * Flip the tile at (row, column) using the same path as keyboard users: `role="application"` focus +
 * Arrow keys + Enter. More reliable in Playwright than synthesizing canvas pointer picks (stage vs GL rect).
 * Row/column are 1-based; after `focus()` the board seeds keyboard focus to the first pickable tile (reading order).
 */
export async function flipTileAtGridCellKeyboard(page: Page, row: number, column: number): Promise<void> {
    await page.getByTestId('tile-board-application').focus();
    const tr = row - 1;
    const tc = column - 1;
    for (let i = 0; i < tc; i += 1) {
        await page.keyboard.press('ArrowRight');
    }
    for (let i = 0; i < tr; i += 1) {
        await page.keyboard.press('ArrowDown');
    }
    await page.keyboard.press('Enter');
}

/**
 * Select a hidden tile at (row, column) and wait for the board to register a flip.
 */
export async function clickHiddenTileRowCol(page: Page, row: number, column: number, hiddenBefore?: number): Promise<void> {
    await flipTileAtGridCellKeyboard(page, row, column);
    if (hiddenBefore != null) {
        await expect
            .poll(async () => readFrameHiddenTileCount(page), { timeout: 12_000 })
            .not.toBe(hiddenBefore);
    }
}

/** @deprecated Alias for `flipTileAtGridCellKeyboard` — kept for specs that still say “click canvas”. */
export async function clickCanvasTile(page: Page, row: number, column: number): Promise<void> {
    await flipTileAtGridCellKeyboard(page, row, column);
}
