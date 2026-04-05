import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

const outDir = join(process.cwd(), 'tmp', 'ui-capture');

test.describe('UI capture (local artifacts)', () => {
    test('menu and game full-page snapshots', async ({ page }) => {
        mkdirSync(outDir, { recursive: true });

        const capture = async (name: string, w: number, h: number): Promise<void> => {
            await page.setViewportSize({ width: w, height: h });
            await page.goto('/');
            await page.getByRole('dialog', { name: /startup relic intro/i }).click();
            await expect(page.getByRole('button', { name: /^play$/i })).toBeVisible();
            const dismiss = page.getByRole('button', { name: /^dismiss$/i });
            if (await dismiss.isVisible().catch(() => false)) {
                await dismiss.click();
            }
            await page.waitForTimeout(400);
            await page.screenshot({ path: join(outDir, `${name}-menu.png`), fullPage: true });

            await page.getByRole('button', { name: /^play$/i }).click();
            await expect(page.getByRole('region', { name: /choose your path/i })).toBeVisible();
            await page.getByRole('button', { name: /classic run/i }).click();
            await expect(page.getByRole('heading', { name: /level 1/i })).toBeVisible();
            await expect(page.getByRole('group', { name: /run stats/i })).toBeVisible({ timeout: 10000 });
            await page.waitForTimeout(600);
            await page.screenshot({ path: join(outDir, `${name}-game.png`), fullPage: true });
        };

        await capture('desktop-1440', 1440, 900);
        await capture('tablet-820', 820, 1180);
    });
});
