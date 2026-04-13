import { writeFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';
import { dismissStartupIntro } from './startupIntroHelpers';
import { STORAGE_KEY } from './tileBoardGameFlow';
import { buildVisualSaveJson, mainMenuPlayButton } from './visualScreenHelpers';

/** Mean normalized luminance (0–1) over opaque-ish pixels; catches an all-black render. */
function meanLuminance(png: PNG): number {
    let sum = 0;
    let n = 0;
    for (let i = 0; i < png.data.length; i += 4) {
        const a = png.data[i + 3];
        if (a < 24) {
            continue;
        }
        const r = png.data[i];
        const g = png.data[i + 1];
        const b = png.data[i + 2];
        sum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
        n += 1;
    }
    return n > 0 ? sum / n / 255 : 0;
}

test.describe('Menu boot visual', () => {
    test.describe.configure({ retries: 1 });

    test('startup intro then main menu are visible in screenshots (not pitch black)', async ({ page }, testInfo) => {
        test.setTimeout(90_000);
        // Full-motion intro stays on screen long enough to screenshot; reduced-motion auto-dismiss races `page.goto`.
        const saveJson = buildVisualSaveJson(true, false);
        await page.addInitScript(
            ([key, json]) => {
                localStorage.setItem(key, json);
            },
            [STORAGE_KEY, saveJson]
        );

        const intro = page.getByRole('dialog', { name: /startup relic intro/i });
        await Promise.all([
            intro.waitFor({ state: 'visible', timeout: 30_000 }),
            page.goto('/', { waitUntil: 'domcontentloaded' })
        ]);

        const introShot = await page.screenshot({ fullPage: true });
        const introPng = PNG.sync.read(introShot);
        const introLum = meanLuminance(introPng);
        expect(introLum, 'intro full-page screenshot should not be pitch black').toBeGreaterThan(0.035);

        writeFileSync(testInfo.outputPath('01-intro-visible.png'), introShot);

        await dismissStartupIntro(page);

        const play = mainMenuPlayButton(page);
        await expect(play).toBeVisible({ timeout: 30_000 });

        const menuShot = await page.screenshot({ fullPage: true });
        const menuPng = PNG.sync.read(menuShot);
        const menuLum = meanLuminance(menuPng);
        expect(menuLum, 'main menu screenshot should show lit UI').toBeGreaterThan(0.06);

        writeFileSync(testInfo.outputPath('02-main-menu-play-visible.png'), menuShot);

        await expect(play).toBeInViewport();
    });
});
