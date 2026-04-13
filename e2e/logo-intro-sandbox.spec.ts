import { expect, test } from '@playwright/test';
import { writeFileSync } from 'node:fs';

test.describe('Logo intro sandbox', () => {
    test('startup intro overlay fills the viewport', async ({ page }, testInfo) => {
        await page.goto('/logo-sandbox.html');

        const intro = page.getByRole('dialog', { name: /startup relic intro/i });
        await expect(intro).toBeVisible({ timeout: 30_000 });

        const shot = await page.screenshot({ fullPage: true });
        writeFileSync(testInfo.outputPath('logo-intro-sandbox.png'), shot);

        const dims = await page.evaluate(() => {
            const el = document.querySelector('[aria-label="Startup relic intro"]');
            if (!el || !(el instanceof HTMLElement)) {
                return null;
            }
            const r = el.getBoundingClientRect();
            const vw = document.documentElement.clientWidth;
            const vh = window.innerHeight;
            return {
                dw: Math.abs(r.width - vw),
                dh: Math.abs(r.height - vh),
                dx: Math.abs(r.x),
                dy: Math.abs(r.y)
            };
        });

        expect(dims).not.toBeNull();
        const eps = 3;
        const { dw, dh, dx, dy } = dims!;
        expect(dx, 'intro should span from left edge').toBeLessThanOrEqual(eps);
        expect(dy, 'intro should span from top edge').toBeLessThanOrEqual(eps);
        expect(dw, 'intro width should match layout viewport').toBeLessThanOrEqual(eps);
        expect(dh, 'intro height should match viewport').toBeLessThanOrEqual(eps);
    });
});
