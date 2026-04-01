import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Page } from '@playwright/test';
import { STORAGE_KEY } from './tileBoardGameFlow';

const MATCH_SETTLE_MS = 950;
const MEMORIZE_LABEL_RE_SRC = '^Tile (.+), row (\\d+), column (\\d+)$';

export type VisualViewport = { id: string; width: number; height: number };

export const VISUAL_VIEWPORTS: VisualViewport[] = [
    { id: 'mobile', width: 390, height: 844 },
    { id: 'tablet', width: 820, height: 1180 },
    { id: 'desktop', width: 1440, height: 900 }
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
        lastRunSummary: null
    });

export function visualCaptureDir(viewportId: string): string {
    const dir = join(process.cwd(), 'test-results', 'visual-screens', viewportId);
    mkdirSync(dir, { recursive: true });
    return dir;
}

export async function captureVisualScreen(page: Page, viewportId: string, baseName: string): Promise<void> {
    const dir = visualCaptureDir(viewportId);
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

export async function dismissStartupIntro(page: Page): Promise<void> {
    const intro = page.getByRole('dialog', { name: /startup relic intro/i });
    await intro.waitFor({ state: 'attached', timeout: 15000 });
    await intro.evaluate((el) => {
        (el as HTMLElement).click();
    });
    await expect(page.getByRole('button', { name: /play arcade/i })).toBeVisible({ timeout: 15000 });
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
    await expect(page.getByRole('button', { name: /play arcade/i })).toBeVisible();
}

export async function openLevel1Play(page: Page): Promise<void> {
    await openMainMenuFromSave(page, true);
    await page.getByRole('button', { name: /play arcade/i }).click();
    await expect(page.getByRole('heading', { name: /level 1/i })).toBeVisible();
    await expect(page.getByRole('group', { name: /run stats/i })).toBeVisible({ timeout: 10000 });
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
    const buttons = page.getByRole('button', { name: /hidden tile, row \d+, column \d+/i });
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
        .poll(async () => page.getByRole('button', { name: /hidden tile/i }).count(), { timeout: 15000 })
        .toBe(expected);
}

async function clickHiddenTile(page: Page, row: number, col: number): Promise<void> {
    const label = new RegExp(`hidden tile, row ${row}, column ${col}`, 'i');
    await page.getByRole('button', { name: label }).click({ force: true });
}

/**
 * Level 1: wait for play phase (4 hidden tiles). Captures memorize map when possible; otherwise returns null
 * and callers should use `completeLevel1Play`.
 */
export async function waitLevel1PlayReady(page: Page): Promise<PairPositions | null> {
    const deadline = Date.now() + 28_000;
    while (Date.now() < deadline) {
        const snap = await readMemorizeSnapshot(page);
        const hidden = await page.getByRole('button', { name: /hidden tile/i }).count();
        if (hidden === 4) {
            return snap;
        }
        if (snap) {
            await page.waitForTimeout(40);
            continue;
        }
        await page.waitForTimeout(40);
    }
    await waitForPlayPhaseHiddenTiles(page, 4);
    return await readMemorizeSnapshot(page);
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

/** Burn lives with mismatches until game over (level 1). Refreshes tile positions each attempt. */
export async function forceGameOverWithMismatches(page: Page, pairs: PairPositions | null): Promise<void> {
    const pickMismatch = async (): Promise<{ a: { row: number; col: number }; b: { row: number; col: number } }> => {
        if (pairs && Object.keys(pairs).length >= 2) {
            const keys = Object.keys(pairs);
            return { a: pairs[keys[0]][0], b: pairs[keys[1]][0] };
        }
        const pos = await getHiddenTilePositions(page);
        if (pos.length < 2) {
            throw new Error('expected hidden tiles for mismatch loop');
        }
        return { a: pos[0], b: pos[1] };
    };

    await waitForPlayPhaseHiddenTiles(page, 4);

    for (let i = 0; i < 12; i += 1) {
        if (await page.getByText(/Expedition Over/i).isVisible().catch(() => false)) {
            return;
        }
        const hidden = await page.getByRole('button', { name: /hidden tile/i }).count();
        if (hidden < 2) {
            break;
        }
        const { a, b } = await pickMismatch();
        await clickHiddenTile(page, a.row, a.col);
        await clickHiddenTile(page, b.row, b.col);
        await page.waitForTimeout(MATCH_SETTLE_MS);
    }
    await expect(page.getByText(/Expedition Over/i)).toBeVisible({ timeout: 20000 });
}
