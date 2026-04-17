import { expect, type Page } from '@playwright/test';
import { SAVE_SCHEMA_VERSION, type GraphicsQualityPreset } from '../src/shared/contracts';
import { readDevPairPositionsFromFrame, readMemorizeSnapshot, type MemorizePairPositions } from './memorizeSnapshot';
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
    schemaVersion: SAVE_SCHEMA_VERSION,
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
    schemaVersion: SAVE_SCHEMA_VERSION,
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

/** Clone default E2E save with a specific board renderer tier (card overlay draw path). */
export const e2eSaveWithGraphicsQuality = (graphicsQuality: GraphicsQualityPreset): string => {
    const parsed: unknown = JSON.parse(defaultE2eGameSaveJson);
    if (typeof parsed !== 'object' || parsed === null || !('settings' in parsed)) {
        return defaultE2eGameSaveJson;
    }
    const next = { ...parsed, settings: { ...(parsed as { settings: object }).settings, graphicsQuality } };
    return JSON.stringify(next);
};

export async function navigateToLevel1PlayPhase(
    page: Page,
    saveJson: string = defaultE2eGameSaveJson
): Promise<MemorizePairPositions | null> {
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

    /** Capture memorize-phase pair map before `waitForBoardPlayPhase` — afterward aria labels are hidden-tile text. */
    let memorizePairs: MemorizePairPositions | null = null;
    const captureDeadline = Date.now() + 45_000;
    while (Date.now() < captureDeadline) {
        const status = await page.getByTestId('tile-board-frame').getAttribute('data-board-run-status');
        const snap = await readMemorizeSnapshot(page);
        if (snap) {
            memorizePairs = snap;
            break;
        }
        if (status === 'playing') {
            break;
        }
        await page.waitForTimeout(20);
    }

    await waitForBoardPlayPhase(page);
    if (!memorizePairs) {
        memorizePairs = await readDevPairPositionsFromFrame(page);
    }
    return memorizePairs;
}

/**
 * Flip the tile at (row, column) (1-based, matching memorize / `Hidden tile, row R, column C`).
 * Under WebGL, arrow-key roving skips removed tiles, so “N× ArrowRight” is not the same as column N after a match.
 * Playwright runs against Vite dev — we call `window.__e2ePickTileAtGrid1` (see `TileBoard.tsx`) for stable grid picks.
 */
export async function flipTileAtGridCellKeyboard(page: Page, row: number, column: number): Promise<void> {
    await page.evaluate(
        ([r, c]) => {
            const w = window as Window & { __e2ePickTileAtGrid1?: (row: number, col: number) => void };
            const pick = w.__e2ePickTileAtGrid1;
            if (!pick) {
                throw new Error(
                    'window.__e2ePickTileAtGrid1 missing — e2e expects Vite dev (import.meta.env.DEV) so TileBoard registers the hook.'
                );
            }
            pick(r, c);
        },
        [row, column] as const
    );
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
