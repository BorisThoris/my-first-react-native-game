import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import {
    expectNoHorizontalOverflow,
    getEndproductParityCaptureDir,
    openDevSandboxPlaying
} from './visualScreenHelpers';

/**
 * Element-scoped PNGs for side-by-side comparison with `docs/ENDPRODUCTIMAGE.png`.
 * Run: `yarn capture:endproduct-parity` (writes under `docs/visual-capture/endproduct-parity/`) or default
 * `test-results/endproduct-parity/` without env.
 */
test.describe('Endproduct parity captures (dev sandbox)', () => {
    test.describe.configure({ mode: 'serial' });

    test('1440x900 HUD + tile board (dailyParasite)', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        const dir = getEndproductParityCaptureDir();
        await openDevSandboxPlaying(page, { fixture: 'dailyParasite' });
        await expectNoHorizontalOverflow(page);

        const hud = page.getByTestId('game-hud');
        const frame = page.getByTestId('tile-board-frame');
        await expect(hud).toBeVisible();
        await expect(frame).toBeVisible();

        await hud.screenshot({ path: join(dir, 'hud-1440x900.png'), animations: 'disabled' });
        await frame.screenshot({ path: join(dir, 'tile-board-1440x900.png'), animations: 'disabled' });
    });

    test('1280x720 HUD + tile board (dailyParasite)', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 });
        const dir = getEndproductParityCaptureDir();
        await openDevSandboxPlaying(page, { fixture: 'dailyParasite' });
        await expectNoHorizontalOverflow(page);

        const hud = page.getByTestId('game-hud');
        const frame = page.getByTestId('tile-board-frame');
        await expect(hud).toBeVisible();
        await expect(frame).toBeVisible();
        await hud.screenshot({ path: join(dir, 'hud-1280x720.png'), animations: 'disabled' });
        await frame.screenshot({ path: join(dir, 'tile-board-1280x720.png'), animations: 'disabled' });
    });

    test('1440x900 HUD + tile board (arcade fixture)', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        const dir = getEndproductParityCaptureDir();
        await openDevSandboxPlaying(page, { fixture: 'arcade' });
        await expectNoHorizontalOverflow(page);

        const hud = page.getByTestId('game-hud');
        const frame = page.getByTestId('tile-board-frame');
        await expect(hud).toBeVisible();
        await expect(frame).toBeVisible();
        await hud.screenshot({ path: join(dir, 'hud-1440x900-arcade.png'), animations: 'disabled' });
        await frame.screenshot({ path: join(dir, 'tile-board-1440x900-arcade.png'), animations: 'disabled' });
    });
});
