import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { buildMatchedFlameCaptureSaveJson, gotoWithSaveAndQuery, waitLevel1PlayReady } from './visualScreenHelpers';
import { flipTileAtGridCellKeyboard, readFrameHiddenTileCount, waitForBoardPlayPhase } from './tileBoardGameFlow';

/**
 * PNGs for reviewing the matched-card ember rim (isolated shader + in-game board after one match).
 *
 * Run: `yarn capture:matched-flame`
 * Output: `test-results/matched-flame-capture/` (or `<VISUAL_CAPTURE_ROOT>/matched-flame-capture/`).
 */
const getMatchedFlameCaptureDir = (): string => {
    const trimmed = process.env.VISUAL_CAPTURE_ROOT?.trim();
    const base = trimmed ? join(process.cwd(), trimmed) : join(process.cwd(), 'test-results');
    const dir = join(base, 'matched-flame-capture');
    mkdirSync(dir, { recursive: true });
    return dir;
};

/** Clip to tile stage shell (stable box vs full page zoom). */
async function screenshotStageShell(page: Page, outName: string): Promise<void> {
    const stageLocator = page.getByTestId('tile-board-stage-shell');
    const clip = await stageLocator.evaluate((el) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
    });
    expect(clip.width, 'stage shell width').toBeGreaterThan(2);
    expect(clip.height, 'stage shell height').toBeGreaterThan(2);
    const vs = page.viewportSize()!;
    const x = Math.max(0, Math.floor(clip.x));
    const y = Math.max(0, Math.floor(clip.y));
    const width = Math.min(Math.ceil(clip.width), vs.width - x);
    const height = Math.min(Math.ceil(clip.height), vs.height - y);
    const dir = getMatchedFlameCaptureDir();
    await page.screenshot({
        path: join(dir, outName),
        clip: { x, y, width, height },
        animations: 'disabled'
    });
}

async function setRangeControl(page: Page, label: string, value: number): Promise<void> {
    await page.getByLabel(label).evaluate(
        (node, nextValue) => {
            const input = node as HTMLInputElement;
            input.value = String(nextValue);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        },
        value
    );
}

/**
 * WebGL boards have no memorize `button` nodes — `waitLevel1PlayReady` pair map is often null.
 * Try unordered pairs of `data-hidden-slots` cells until a match (hidden count → 2).
 */
async function flipFirstMatchingPairWebGl(page: Page): Promise<void> {
    const readHiddenSlots = async (): Promise<{ row: number; col: number }[]> => {
        const raw = await page.getByTestId('tile-board-frame').getAttribute('data-hidden-slots');
        if (!raw) {
            return [];
        }
        return raw
            .split(';')
            .filter(Boolean)
            .map((part) => {
                const [r, c] = part.split(',').map((x) => Number.parseInt(x, 10));
                return { row: r, col: c };
            });
    };

    let positions = await readHiddenSlots();
    expect(positions.length, 'four hidden tiles for level 1').toBe(4);

    const indexPairs: [number, number][] = [];
    for (let i = 0; i < 4; i += 1) {
        for (let j = i + 1; j < 4; j += 1) {
            indexPairs.push([i, j]);
        }
    }

    for (const [i, j] of indexPairs) {
        const a = positions[i];
        const b = positions[j];
        await flipTileAtGridCellKeyboard(page, a.row, a.col);
        await flipTileAtGridCellKeyboard(page, b.row, b.col);

        const deadline = Date.now() + 22_000;
        let matched = false;
        while (Date.now() < deadline) {
            const hidden = await readFrameHiddenTileCount(page);
            if (hidden === 2) {
                matched = true;
                break;
            }
            if (hidden === 4) {
                break;
            }
            await page.waitForTimeout(80);
        }
        if (matched) {
            return;
        }
        positions = await readHiddenSlots();
        expect(positions.length, 'back to four hidden after mismatch').toBe(4);
    }
    throw new Error('failed to find a matching pair (level 1)');
}

test.describe('Matched flame capture (dev)', () => {
    test.describe.configure({ mode: 'serial', retries: 1 });

    test('isolated shader sandbox (full page)', async ({ page }) => {
        await page.setViewportSize({ width: 960, height: 720 });
        await page.goto('/?devSandbox=1&fx=matchedRimFire');
        await expect(page.getByTestId('matched-rim-fire-sandbox')).toBeVisible();
        await expect(page.locator('canvas')).toBeVisible();

        const dir = getMatchedFlameCaptureDir();
        await page.waitForTimeout(400);
        await page.screenshot({
            path: join(dir, '01-isolated-burst-high-960x720.png'),
            fullPage: true,
            animations: 'disabled'
        });

        await setRangeControl(page, 'Burst', 0);
        await page.getByLabel('Reduce motion').check();
        await page.waitForTimeout(250);
        await page.screenshot({
            path: join(dir, '02-isolated-settled-reduced-960x720.png'),
            fullPage: true,
            animations: 'disabled'
        });
    });

    test('in-game: level 1 after first match (tile stage)', async ({ page }) => {
        test.setTimeout(120_000);

        await page.setViewportSize({ width: 1280, height: 720 });
        const params = new URLSearchParams({
            devSandbox: '1',
            fixture: 'arcade',
            screen: 'playing',
            skipIntro: '1'
        });
        await gotoWithSaveAndQuery(page, buildMatchedFlameCaptureSaveJson(), params.toString());

        await expect(page.getByTestId('game-hud')).toBeVisible({ timeout: 25_000 });
        await expect(page.getByTestId('tile-board-frame')).toBeVisible({ timeout: 25_000 });
        await expect(page.getByTestId('tile-board-stage').locator('canvas')).toBeVisible({ timeout: 25_000 });

        const canvasLocator = page.getByTestId('tile-board-stage').locator('canvas');
        await expect
            .poll(
                async () =>
                    canvasLocator.evaluate((c) => {
                        const el = c as HTMLCanvasElement;
                        return el.width > 2 && el.height > 2;
                    }),
                { timeout: 25_000 }
            )
            .toBeTruthy();

        await waitLevel1PlayReady(page);
        await waitForBoardPlayPhase(page);
        await expect.poll(async () => readFrameHiddenTileCount(page), { timeout: 15_000 }).toBe(4);

        await flipFirstMatchingPairWebGl(page);
        await expect.poll(async () => readFrameHiddenTileCount(page), { timeout: 15_000 }).toBe(2);
        /** Match resolve + ember rim burst visibility (TileBoardScene advances shader each frame). */
        await page.waitForTimeout(650);
        await screenshotStageShell(page, '03-ingame-match-burst-stage-1280x720.png');

        await page.waitForTimeout(1150);
        /** Drop keyboard focus so the gold focus ring does not dominate the capture vs additive rim fire. */
        await page.getByTestId('tile-board-application').evaluate((el) => {
            (el as HTMLElement).blur();
        });

        await screenshotStageShell(page, '04-ingame-settled-stage-1280x720.png');

        await page.screenshot({
            path: join(getMatchedFlameCaptureDir(), '05-ingame-settled-fullpage-1280x720.png'),
            fullPage: true,
            animations: 'disabled'
        });
    });
});
