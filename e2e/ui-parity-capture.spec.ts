import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Page, test } from '@playwright/test';

type CaptureSurface = {
    name: string;
    query: string;
    waitFor: string | RegExp;
    act?: (page: Page) => Promise<void>;
};

const OUT_DIR = join(process.cwd(), 'test-results', 'ui-parity-capture');

const META_SURFACES: CaptureSurface[] = [
    { name: 'main-menu', query: 'screen=menu', waitFor: /Memory Dungeon/i },
    { name: 'choose-path', query: 'screen=modeSelect', waitFor: '[data-testid="choose-path-launcher"]' },
    { name: 'collection', query: 'screen=collection', waitFor: /Collection/i },
    { name: 'profile', query: 'screen=profile', waitFor: '[data-testid="profile-screen-body"]' },
    { name: 'inventory-empty', query: 'screen=inventory', waitFor: /No active expedition/i },
    { name: 'codex-menu', query: 'screen=codex', waitFor: /Codex/i },
    { name: 'settings', query: 'screen=settings', waitFor: '[data-testid="settings-control-center-strip"]' },
    {
        name: 'settings-unsaved-confirm',
        query: 'screen=settings',
        waitFor: '[data-testid="settings-control-center-strip"]',
        act: async (page) => {
            await page.getByRole('button', { name: /accessibility/i }).first().click();
            await page.getByRole('checkbox', { name: /reduce motion/i }).click();
            await page.getByRole('button', { name: /^back$/i }).click();
            await expect(page.getByRole('dialog', { name: /unsaved settings/i })).toBeVisible();
        }
    },
    { name: 'game-over', query: 'screen=gameOver&fixture=gameOver', waitFor: /Expedition Over/i }
];

const GAMEPLAY_SURFACES: CaptureSurface[] = [
    { name: 'gameplay', query: 'screen=playing&fixture=dailyParasite', waitFor: '[data-testid="game-hud"]' },
    {
        name: 'pause-modal',
        query: 'screen=playing&fixture=dailyParasite',
        waitFor: '[data-testid="game-hud"]',
        act: async (page) => {
            await page.keyboard.press('p');
            await expect(page.getByRole('dialog', { name: /run paused/i })).toBeVisible();
        }
    },
    {
        name: 'abandon-confirm',
        query: 'screen=playing&fixture=dailyParasite',
        waitFor: '[data-testid="game-hud"]',
        act: async (page) => {
            await page.keyboard.press('p');
            const pause = page.getByRole('dialog', { name: /run paused/i });
            await expect(pause).toBeVisible();
            await pause.getByRole('button', { name: /^retreat$/i }).click();
            await expect(page.getByRole('dialog', { name: /abandon run/i })).toBeVisible();
        }
    },
    {
        name: 'run-settings-modal',
        query: 'screen=playing&fixture=dailyParasite',
        waitFor: '[data-testid="game-toolbar-settings"]',
        act: async (page) => {
            await page.getByTestId('game-toolbar-settings').click({ force: true });
            await expect(page.getByRole('dialog', { name: /run settings/i })).toBeVisible();
        }
    },
    {
        name: 'in-run-inventory',
        query: 'screen=playing&fixture=dailyParasite',
        waitFor: '[data-testid="game-toolbar-inventory"]',
        act: async (page) => {
            await page.getByTestId('game-toolbar-inventory').click({ force: true });
            await expect(page.getByRole('region', { name: /inventory/i })).toBeVisible();
        }
    },
    {
        name: 'in-run-codex',
        query: 'screen=playing&fixture=dailyParasite',
        waitFor: '[data-testid="game-toolbar-codex"]',
        act: async (page) => {
            await page.getByTestId('game-toolbar-codex').click({ force: true });
            await expect(page.getByRole('region', { name: /codex/i })).toBeVisible();
        }
    },
    { name: 'floor-cleared', query: 'screen=playing&fixture=floorCleared', waitFor: /Floor cleared/i },
    { name: 'route-choice', query: 'screen=playing&fixture=routeChoice', waitFor: '[data-testid="route-choice-panel"]' },
    { name: 'relic-offer', query: 'screen=playing&fixture=relicOffer', waitFor: '[data-testid="game-relic-offer-overlay"]' },
    { name: 'shop', query: 'screen=shop&fixture=shop', waitFor: '[data-testid="shop-screen"]' },
    { name: 'side-room', query: 'screen=sideRoom&fixture=sideRoom', waitFor: /Greed Treasure chest/i }
];

const VIEWPORTS = [
    { id: 'desktop-1440x900', width: 1440, height: 900 },
    { id: 'mobile-390x844', width: 390, height: 844 }
] as const;

async function waitForSurface(page: Page, waitFor: string | RegExp): Promise<void> {
    if (typeof waitFor === 'string') {
        await page.locator(waitFor).first().waitFor({ state: 'visible', timeout: 30_000 });
        return;
    }
    await expect(page.getByText(waitFor).first()).toBeVisible({ timeout: 30_000 });
}

async function expectOverlayActionParity(page: Page, surfaceName: string): Promise<void> {
    const expectedDockSurfaces = new Set([
        'floor-cleared',
        'route-choice',
        'shop',
        'side-room',
        'settings',
        'run-settings-modal'
    ]);
    const expectedRailSurfaces = new Set(['pause-modal', 'abandon-confirm', 'settings-unsaved-confirm']);

    if (expectedDockSurfaces.has(surfaceName)) {
        const dock = page.locator('[data-action-placement="dock"], [data-testid="settings-action-dock"]').first();
        await expect(dock).toBeVisible();
        const dockBox = await dock.boundingBox();
        expect(dockBox?.width ?? 0).toBeGreaterThan(240);
    }

    if (expectedRailSurfaces.has(surfaceName)) {
        const rail = page.locator('[data-action-placement="rail"]').first();
        await expect(rail).toBeVisible();
    }
}

async function expectNoDocumentHorizontalOverflow(page: Page): Promise<void> {
    const overflow = await page.evaluate(() => {
        const root = document.documentElement;
        return Math.ceil(root.scrollWidth - root.clientWidth);
    });
    expect(overflow).toBeLessThanOrEqual(2);
}

async function expectRefinedSurfaceLayout(page: Page, surfaceName: string): Promise<void> {
    if (surfaceName === 'route-choice') {
        await expect(page.getByTestId('route-choice-panel')).toBeInViewport({ ratio: 0.85 });
    }

    if (surfaceName === 'relic-offer') {
        await expect(page.getByTestId('relic-offer-services')).toBeVisible();
    }

    if (surfaceName === 'shop') {
        await expect(page.getByTestId('shop-action-dock')).toBeVisible();
    }

    if (surfaceName === 'settings') {
        await expect(page.getByTestId('settings-action-dock')).toBeVisible();
    }
}

test.describe('UI parity capture', () => {
    test.describe.configure({ mode: 'serial' });

    for (const viewport of VIEWPORTS) {
        test(`${viewport.id}: all core screens and overlays`, async ({ page }) => {
            test.setTimeout(300_000);
            mkdirSync(join(OUT_DIR, viewport.id), { recursive: true });
            await page.setViewportSize({ width: viewport.width, height: viewport.height });

            for (const surface of [...META_SURFACES, ...GAMEPLAY_SURFACES]) {
                await page.goto(`/?devSandbox=1&skipIntro=1&${surface.query}`, {
                    waitUntil: 'load',
                    timeout: 90_000
                });
                await waitForSurface(page, surface.waitFor);
                await surface.act?.(page);
                await expectOverlayActionParity(page, surface.name);
                await expectRefinedSurfaceLayout(page, surface.name);
                await expectNoDocumentHorizontalOverflow(page);
                await page.waitForTimeout(400);
                await page.screenshot({
                    path: join(OUT_DIR, viewport.id, `${surface.name}.png`),
                    fullPage: true
                });
            }
        });
    }
});
