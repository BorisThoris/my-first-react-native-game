import { test } from '@playwright/test';
import {
    expectNoHorizontalOverflow,
    getEndproductParityCaptureDir,
    openDevSandboxPlaying,
    writeHudLayoutDiagnostics
} from './visualScreenHelpers';

/**
 * HUD layout diagnostics: full-page + HUD crops, `hud-metrics.json`, raw `hud-fragment.html` (outerHTML).
 * Writes to `test-results/endproduct-parity/` or `VISUAL_CAPTURE_ROOT` (same as parity captures).
 */
test.describe('HUD layout inspect (dev sandbox)', () => {
    test('1440x900 dailyParasite metrics + screenshots + HTML', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        const dir = getEndproductParityCaptureDir();
        await openDevSandboxPlaying(page, { fixture: 'dailyParasite' });
        await expectNoHorizontalOverflow(page);
        await writeHudLayoutDiagnostics(page, dir);
    });
});
