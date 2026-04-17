import { Buffer } from 'node:buffer';
import { expect, test, type Page } from '@playwright/test';
import { countPngPixelDiffs } from './pngDiff';
import {
    clickHiddenTileRowCol,
    e2eSaveWithGraphicsQuality,
    navigateToLevel1PlayPhase,
    readFrameHiddenTileCount
} from './tileBoardGameFlow';

async function screenshotStageShellPng(page: Page, stageLocator: ReturnType<Page['getByTestId']>): Promise<Buffer> {
    const clip = await stageLocator.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
    });
    expect(clip.width, 'stage shell has layout width').toBeGreaterThan(2);
    expect(clip.height, 'stage shell has layout height').toBeGreaterThan(2);
    const vs = page.viewportSize()!;
    const x = Math.max(0, Math.floor(clip.x));
    const y = Math.max(0, Math.floor(clip.y));
    const width = Math.min(Math.ceil(clip.width), vs.width - x);
    const height = Math.min(Math.ceil(clip.height), vs.height - y);
    return await page.screenshot({
        type: 'png',
        clip: { x, y, width, height },
        animations: 'disabled',
        timeout: 35_000
    });
}

async function flipOneTileAndStableShot(page: Page): Promise<{ hidden: Buffer; flipped: Buffer; ratio: number }> {
    const stageLocator = page.getByTestId('tile-board-stage-shell');
    const canvasLocator = page.getByTestId('tile-board-stage').locator('canvas');
    await expect(canvasLocator).toBeVisible();
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

    await page.waitForTimeout(400);
    const shotHidden = await screenshotStageShellPng(page, stageLocator);
    const hiddenCount = await readFrameHiddenTileCount(page);
    await clickHiddenTileRowCol(page, 1, 1, hiddenCount);

    await expect.poll(async () => readFrameHiddenTileCount(page), { timeout: 4000 }).toBeLessThan(hiddenCount);
    await expect
        .poll(
            async () => {
                const a = await screenshotStageShellPng(page, stageLocator);
                await page.waitForTimeout(100);
                const b = await screenshotStageShellPng(page, stageLocator);
                return a.equals(b);
            },
            { timeout: 25_000 }
        )
        .toBe(true);

    const shotFlipped = await screenshotStageShellPng(page, stageLocator);
    const { diffPixels, width, height } = countPngPixelDiffs(shotHidden, shotFlipped);
    const ratio = diffPixels / (width * height);
    return { hidden: shotHidden, flipped: shotFlipped, ratio };
}

test.describe('Card face overlay tiers (WebGL)', () => {
    test('low graphics: flip produces bounded board diff', async ({ page }, testInfo) => {
        test.setTimeout(120_000);
        await page.setViewportSize({ width: 1280, height: 720 });
        await navigateToLevel1PlayPhase(page, e2eSaveWithGraphicsQuality('low'));
        const { hidden, flipped, ratio } = await flipOneTileAndStableShot(page);
        await testInfo.attach('overlay-low-hidden.png', { body: hidden, contentType: 'image/png' });
        await testInfo.attach('overlay-low-flipped.png', { body: flipped, contentType: 'image/png' });
        expect(ratio, 'low-tier overlay should still swap face art').toBeLessThan(0.18);
    });

    test('high graphics: flip produces bounded board diff', async ({ page }, testInfo) => {
        test.setTimeout(120_000);
        await page.setViewportSize({ width: 1280, height: 720 });
        await navigateToLevel1PlayPhase(page, e2eSaveWithGraphicsQuality('high'));
        const { hidden, flipped, ratio } = await flipOneTileAndStableShot(page);
        await testInfo.attach('overlay-high-hidden.png', { body: hidden, contentType: 'image/png' });
        await testInfo.attach('overlay-high-flipped.png', { body: flipped, contentType: 'image/png' });
        expect(ratio, 'high-tier overlay should still swap face art').toBeLessThan(0.18);
    });

    test('warmed board stops growing caches after the first reveal settles', async ({ page }, testInfo) => {
        test.setTimeout(120_000);
        await page.setViewportSize({ width: 1280, height: 720 });
        await navigateToLevel1PlayPhase(page, e2eSaveWithGraphicsQuality('high'));

        await expect
            .poll(
                async () =>
                    page.evaluate(async () => {
                        const texturesMod = await import('/src/renderer/components/tileTextures.ts');
                        return texturesMod.getOverlayPrewarmDebugState().pendingCount;
                    }),
                { timeout: 15_000 }
            )
            .toBe(0);

        const beforeFlip = await page.evaluate(async () => {
            const texturesMod = await import('/src/renderer/components/tileTextures.ts');
            return texturesMod.getIllustrationPipelineDebugState();
        });

        const hiddenCount = await readFrameHiddenTileCount(page);
        await clickHiddenTileRowCol(page, 1, 1, hiddenCount);
        await expect.poll(async () => readFrameHiddenTileCount(page), { timeout: 4000 }).toBeLessThan(hiddenCount);
        await page.waitForTimeout(500);

        const afterFlip = await page.evaluate(async () => {
            const texturesMod = await import('/src/renderer/components/tileTextures.ts');
            return texturesMod.getIllustrationPipelineDebugState();
        });

        await page.waitForTimeout(750);

        const afterSettle = await page.evaluate(async () => {
            const texturesMod = await import('/src/renderer/components/tileTextures.ts');
            return texturesMod.getIllustrationPipelineDebugState();
        });

        await testInfo.attach('overlay-cache-debug-before.json', {
            body: Buffer.from(JSON.stringify(beforeFlip, null, 2)),
            contentType: 'application/json'
        });
        await testInfo.attach('overlay-cache-debug-after-flip.json', {
            body: Buffer.from(JSON.stringify(afterFlip, null, 2)),
            contentType: 'application/json'
        });
        await testInfo.attach('overlay-cache-debug-after-settle.json', {
            body: Buffer.from(JSON.stringify(afterSettle, null, 2)),
            contentType: 'application/json'
        });

        expect(beforeFlip.illustrationBitmap.entryCount).toBeGreaterThan(0);
        expect(afterFlip.illustrationBitmap.entryCount).toBe(beforeFlip.illustrationBitmap.entryCount);
        expect(afterSettle.illustrationBitmap.createdCount).toBe(afterFlip.illustrationBitmap.createdCount);
        expect(afterSettle.overlayTexture.createdCount).toBe(afterFlip.overlayTexture.createdCount);
        expect(afterSettle.overlayTexture.overlayKeyCount).toBe(afterFlip.overlayTexture.overlayKeyCount);
    });
});
