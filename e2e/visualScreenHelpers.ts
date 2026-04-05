import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { expect, type Page } from '@playwright/test';
import { BOARD_HIDDEN_TILE_BUTTON_RE, STORAGE_KEY } from './tileBoardGameFlow';
import { dismissStartupIntro } from './startupIntroHelpers';

const MATCH_SETTLE_MS = 950;
const MEMORIZE_LABEL_RE_SRC = '^Tile (.+), row (\\d+), column (\\d+)$';

export type VisualOrientation = 'portrait' | 'landscape';

/** `id` is used in test titles; captures go to `{root}/{deviceId}/{orientation}/`. */
export type VisualViewport = {
    deviceId: string;
    height: number;
    id: string;
    orientation: VisualOrientation;
    width: number;
};

export function getVisualCaptureRoot(): string {
    const override = process.env.VISUAL_CAPTURE_ROOT?.trim();
    if (override) {
        return resolve(process.cwd(), override);
    }
    return join(process.cwd(), 'test-results', 'visual-screens');
}

export const MOBILE_VISUAL_VIEWPORTS: ReadonlyArray<VisualViewport> = [
    { deviceId: 'mobile', height: 844, id: 'mobile-portrait', orientation: 'portrait', width: 390 },
    { deviceId: 'mobile', height: 390, id: 'mobile-landscape', orientation: 'landscape', width: 844 }
];

export const STANDARD_VISUAL_VIEWPORTS: ReadonlyArray<VisualViewport> = [
    { deviceId: 'tablet', height: 1180, id: 'tablet-portrait', orientation: 'portrait', width: 820 },
    { deviceId: 'desktop', height: 900, id: 'desktop-landscape', orientation: 'landscape', width: 1440 }
];

export const buildVisualSaveJson = (onboardingDismissed: boolean): string =>
    JSON.stringify({
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
        onboardingDismissed,
        lastRunSummary: null,
        powersFtueSeen: true
    });

export function visualCaptureDir(deviceId: string, orientation: VisualOrientation): string {
    const dir = join(getVisualCaptureRoot(), deviceId, orientation);
    mkdirSync(dir, { recursive: true });
    return dir;
}

export async function captureVisualScreen(
    page: Page,
    deviceId: string,
    orientation: VisualOrientation,
    baseName: string
): Promise<void> {
    const dir = visualCaptureDir(deviceId, orientation);
    await page.screenshot({ path: join(dir, `${baseName}.png`), fullPage: true });
}

/** No unintended horizontal page scroll on the root (common mobile breakage). */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
    }));
    expect(
        scrollWidth,
        `document scrollWidth ${scrollWidth} should not exceed clientWidth ${clientWidth} by more than 1px`
    ).toBeLessThanOrEqual(clientWidth + 1);
}

export async function gotoWithSave(page: Page, saveJson: string): Promise<void> {
    await page.addInitScript(
        ([key, json]) => {
            localStorage.setItem(key, json);
        },
        [STORAGE_KEY, saveJson]
    );
    await page.goto('/');
}

export async function openMainMenuFromSave(page: Page, onboardingDismissed: boolean): Promise<void> {
    await gotoWithSave(page, buildVisualSaveJson(onboardingDismissed));
    await dismissStartupIntro(page);
    await expect(page.getByRole('button', { name: /^play$/i })).toBeVisible();
}

export async function startClassicRunFromModeSelect(page: Page): Promise<void> {
    await page.getByRole('button', { name: /classic run/i }).click();
    await expect(page.getByRole('heading', { name: /level 1/i })).toBeVisible();
    await expect(page.getByRole('group', { name: /run stats/i })).toBeVisible({ timeout: 10000 });
}

export async function openLevel1Play(page: Page): Promise<void> {
    await openMainMenuFromSave(page, true);
    await page.getByRole('button', { name: /^play$/i }).click();
    await expect(page.getByRole('region', { name: /choose your path/i })).toBeVisible();
    await startClassicRunFromModeSelect(page);
}

type PairPositions = Record<string, { row: number; col: number }[]>;

async function readMemorizeSnapshot(page: Page): Promise<PairPositions | null> {
    return page.evaluate((reSrc) => {
        const re = new RegExp(reSrc, 'i');
        const record: Record<string, { row: number; col: number }[]> = {};
        for (const el of document.querySelectorAll('button')) {
            const al = el.getAttribute('aria-label');
            if (!al) {
                continue;
            }
            const m = al.match(re);
            if (!m) {
                continue;
            }
            const key = m[1].trim();
            const row = Number(m[2]);
            const col = Number(m[3]);
            if (!record[key]) {
                record[key] = [];
            }
            record[key].push({ row, col });
        }
        const keys = Object.keys(record);
        if (keys.length >= 2 && keys.every((k) => record[k].length === 2)) {
            return record;
        }
        return null;
    }, MEMORIZE_LABEL_RE_SRC);
}

async function getHiddenTilePositions(page: Page): Promise<{ row: number; col: number }[]> {
    const buttons = page.getByRole('button', { name: BOARD_HIDDEN_TILE_BUTTON_RE });
    const n = await buttons.count();
    const out: { row: number; col: number }[] = [];
    for (let i = 0; i < n; i += 1) {
        const label = await buttons.nth(i).getAttribute('aria-label');
        const m = label?.match(/row (\d+), column (\d+)/i);
        if (!m) {
            continue;
        }
        out.push({ row: Number(m[1]), col: Number(m[2]) });
    }
    return out.sort((a, b) => a.row - b.row || a.col - b.col);
}

function pairKey(a: { row: number; col: number }, b: { row: number; col: number }): string {
    const s = [
        `${a.row},${a.col}`,
        `${b.row},${b.col}`
    ].sort();
    return `${s[0]}|${s[1]}`;
}

async function completeLevel1ByTryingHiddenPairs(page: Page): Promise<void> {
    const tried = new Set<string>();
    const deadline = Date.now() + 120_000;
    while (Date.now() < deadline) {
        if (await page.getByRole('dialog', { name: /floor cleared/i }).isVisible().catch(() => false)) {
            return;
        }
        const positions = await getHiddenTilePositions(page);
        if (positions.length < 2) {
            await page.waitForTimeout(120);
            continue;
        }
        let clicked = false;
        for (let i = 0; i < positions.length && !clicked; i += 1) {
            for (let j = i + 1; j < positions.length; j += 1) {
                const pk = pairKey(positions[i], positions[j]);
                if (tried.has(pk)) {
                    continue;
                }
                tried.add(pk);
                await clickHiddenTile(page, positions[i].row, positions[i].col);
                await clickHiddenTile(page, positions[j].row, positions[j].col);
                await page.waitForTimeout(MATCH_SETTLE_MS);
                clicked = true;
                break;
            }
        }
        if (!clicked) {
            await page.waitForTimeout(120);
        }
    }
    await expect(page.getByRole('dialog', { name: /floor cleared/i })).toBeVisible({ timeout: 5000 });
}

async function waitForPlayPhaseHiddenTiles(page: Page, expected: number): Promise<void> {
    await expect
        .poll(async () => page.getByRole('button', { name: BOARD_HIDDEN_TILE_BUTTON_RE }).count(), { timeout: 15000 })
        .toBe(expected);
}

async function clickHiddenTile(page: Page, row: number, col: number): Promise<void> {
    const label = new RegExp(`hidden tile, row ${row}, column ${col}`, 'i');
    await page.getByRole('button', { name: label }).evaluate((element) => {
        (element as HTMLButtonElement).click();
    });
}

/**
 * Level 1: wait for play phase (4 hidden tiles). Captures memorize map when possible; otherwise returns null
 * and callers should use `completeLevel1Play`.
 */
export async function waitLevel1PlayReady(page: Page): Promise<PairPositions | null> {
    let lastMemorizeSnap: PairPositions | null = null;
    const deadline = Date.now() + 28_000;
    while (Date.now() < deadline) {
        const snap = await readMemorizeSnapshot(page);
        if (snap && Object.keys(snap).length >= 2) {
            lastMemorizeSnap = snap;
        }
        const hidden = await page.getByRole('button', { name: BOARD_HIDDEN_TILE_BUTTON_RE }).count();
        if (hidden === 4) {
            return lastMemorizeSnap;
        }
        await page.waitForTimeout(40);
    }
    await waitForPlayPhaseHiddenTiles(page, 4);
    return lastMemorizeSnap;
}

export async function completeLevel1AllMatches(page: Page, pairs: PairPositions): Promise<void> {
    for (const label of Object.keys(pairs)) {
        const [a, b] = pairs[label];
        await clickHiddenTile(page, a.row, a.col);
        await clickHiddenTile(page, b.row, b.col);
        await page.waitForTimeout(MATCH_SETTLE_MS);
    }
    await expect(page.getByRole('dialog', { name: /floor cleared/i })).toBeVisible({ timeout: 15000 });
}

/** Finish level 1 using memorize pairs when present, otherwise search pairs (missed short memorize window). */
export async function completeLevel1Play(page: Page, pairs: PairPositions | null): Promise<void> {
    if (pairs && Object.keys(pairs).length >= 2) {
        await completeLevel1AllMatches(page, pairs);
        return;
    }
    await completeLevel1ByTryingHiddenPairs(page);
}

async function restartLevel1FromMainMenu(page: Page): Promise<void> {
    await expect(page.getByRole('button', { name: /^play$/i })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /^play$/i }).click();
    await expect(page.getByRole('region', { name: /choose your path/i })).toBeVisible();
    await startClassicRunFromModeSelect(page);
    await waitForPlayPhaseHiddenTiles(page, 4);
}

async function restartLevel1AfterAccidentalMatch(page: Page): Promise<void> {
    const floorCleared = page.getByRole('dialog', { name: /floor cleared/i });

    if (!(await floorCleared.isVisible().catch(() => false))) {
        const remaining = await getHiddenTilePositions(page);
        if (remaining.length !== 2) {
            throw new Error('expected the accidental match fallback to leave one hidden pair');
        }
        await clickHiddenTile(page, remaining[0].row, remaining[0].col);
        await page.waitForTimeout(MATCH_SETTLE_MS);
        await clickHiddenTile(page, remaining[1].row, remaining[1].col);
        await expect(floorCleared).toBeVisible({ timeout: 30000 });
    }

    await floorCleared.getByRole('button', { name: /main menu/i }).click();
    await restartLevel1FromMainMenu(page);
}

async function discoverMismatchPair(
    page: Page,
    pairs: PairPositions | null
): Promise<{ a: { row: number; col: number }; b: { row: number; col: number } }> {
    if (pairs && Object.keys(pairs).length >= 2) {
        const keys = Object.keys(pairs);
        return { a: pairs[keys[0]][0], b: pairs[keys[1]][0] };
    }

    for (let attempt = 0; attempt < 4; attempt += 1) {
        await waitForPlayPhaseHiddenTiles(page, 4);
        const positions = await getHiddenTilePositions(page);
        if (positions.length !== 4) {
            throw new Error('expected four hidden tiles when probing for a mismatch pair');
        }

        const guess = { a: positions[0], b: positions[1] };
        await clickHiddenTile(page, guess.a.row, guess.a.col);
        await clickHiddenTile(page, guess.b.row, guess.b.col);

        let hiddenAfter = await page.getByRole('button', { name: BOARD_HIDDEN_TILE_BUTTON_RE }).count();
        const settleDeadline = Date.now() + 8000;
        while (hiddenAfter !== 2 && hiddenAfter !== 4 && Date.now() < settleDeadline) {
            await page.waitForTimeout(120);
            hiddenAfter = await page.getByRole('button', { name: BOARD_HIDDEN_TILE_BUTTON_RE }).count();
        }

        if (hiddenAfter === 4) {
            return guess;
        }

        if (hiddenAfter !== 2) {
            throw new Error(`expected 2 or 4 hidden tiles after probe flip; got ${hiddenAfter}`);
        }

        await page.waitForTimeout(MATCH_SETTLE_MS);
        await restartLevel1AfterAccidentalMatch(page);
    }

    throw new Error('failed to discover a deterministic mismatch pair for the level 1 game-over flow');
}

/** Burn lives with mismatches until game over (level 1). Refreshes tile positions each attempt. */
export async function forceGameOverWithMismatches(page: Page, pairs: PairPositions | null): Promise<void> {
    const mismatch = await discoverMismatchPair(page, pairs);

    const expedition = () => page.getByText(/Expedition Over/i).isVisible().catch(() => false);

    await expect
        .poll(
            async () => {
                if (await expedition()) {
                    return 'over';
                }
                const hidden = await page.getByRole('button', { name: BOARD_HIDDEN_TILE_BUTTON_RE }).count();
                return hidden === 4 ? 'play' : `bad:${hidden}`;
            },
            { timeout: 20_000 }
        )
        .toMatch(/^(over|play)$/);

    if (await expedition()) {
        return;
    }

    for (let i = 0; i < 12; i += 1) {
        if (await expedition()) {
            return;
        }
        await expect
            .poll(
                async () => {
                    if (await expedition()) {
                        return 'over';
                    }
                    const hidden = await page.getByRole('button', { name: BOARD_HIDDEN_TILE_BUTTON_RE }).count();
                    return hidden === 4 ? 'play' : `bad:${hidden}`;
                },
                { timeout: 15_000 }
            )
            .toMatch(/^(over|play)$/);
        if (await expedition()) {
            return;
        }
        await clickHiddenTile(page, mismatch.a.row, mismatch.a.col);
        await clickHiddenTile(page, mismatch.b.row, mismatch.b.col);
        await page.waitForTimeout(MATCH_SETTLE_MS);
    }
    await expect(page.getByText(/Expedition Over/i)).toBeVisible({ timeout: 20000 });
}
