import { expect, type Locator, type Page } from '@playwright/test';
import {
    buildVisualSaveJson,
    completeLevel1Play,
    expectAppScrollportHasNoVerticalOverflow,
    expectLocatorFullyInWindowViewport,
    expectMinimumTargetSize,
    expectNoHorizontalOverflow,
    forceGameOverWithMismatches,
    gotoWithSaveExpectStartupIntroVisible,
    mainMenuPlayButton,
    openDevSandboxGameOver,
    openLevel1Play,
    openMainMenuFromSave,
    visualE2eUsesSandboxGameOver,
    waitLevel1PlayReady
} from './visualScreenHelpers';

/**
 * QA-006 — Visual baseline scenarios for `yarn test:e2e:visual` (see `fileBase` / capture names).
 * Extend `VISUAL_SCREEN_SCENARIOS` when new HUD regions or chrome need diff coverage; keep `04-game-playing` asserting HUD visibility.
 */
export type VisualScenarioCapture = (baseName: string) => Promise<void>;

export interface VisualScreenScenario {
    name: string;
    fileBase: string;
    timeoutMs?: number;
    run: (page: Page, capture: VisualScenarioCapture) => Promise<void>;
}

async function expectCoarsePointerTarget(page: Page, locator: Locator): Promise<void> {
    const usesCoarsePointer = await page.evaluate(() => globalThis.matchMedia('(pointer: coarse)').matches);
    if (usesCoarsePointer) {
        await expectMinimumTargetSize(locator);
    }
}

async function expectChoosePathLibraryDensity(page: Page): Promise<void> {
    const expectedCardsOnFirstPage = await page.evaluate(() => {
        const width = window.innerWidth;
        if (width < 640) {
            return 2;
        }
        if (width < 1100) {
            return 4;
        }
        return 5;
    });
    const firstPageCards = await page.locator('[data-library-page-index="0"] [data-library-card-cell]').count();
    expect(firstPageCards).toBe(expectedCardsOnFirstPage);
}

export const VISUAL_SCREEN_SCENARIOS: ReadonlyArray<VisualScreenScenario> = [
    {
        fileBase: '00-startup-intro',
        name: 'startup intro visible',
        run: async (page, capture) => {
            await gotoWithSaveExpectStartupIntroVisible(page, buildVisualSaveJson(true));
            await page.waitForTimeout(400);
            await expectNoHorizontalOverflow(page);
            await capture('00-startup-intro');
        }
    },
    {
        fileBase: '01-main-menu',
        name: 'main menu',
        run: async (page, capture) => {
            await openMainMenuFromSave(page, true);
            await expectNoHorizontalOverflow(page);
            await expectAppScrollportHasNoVerticalOverflow(page);
            const play = mainMenuPlayButton(page);
            await expect(play).toBeVisible();
            await expect(async () => {
                await expect(play).toBeInViewport();
            }).toPass({ timeout: 12_000 });
            await expectLocatorFullyInWindowViewport(page, page.getByTestId('main-menu-primary-meta-frame'));
            await expectCoarsePointerTarget(page, play);
            await capture('01-main-menu');
        }
    },
    {
        fileBase: '01a-choose-your-path',
        name: 'choose your path',
        run: async (page, capture) => {
            await openMainMenuFromSave(page, true);
            await mainMenuPlayButton(page).click();
            await expect(page.getByRole('region', { name: /choose your path/i })).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await expectAppScrollportHasNoVerticalOverflow(page);
            const sceneLayer = page.getByTestId('choose-path-scene-layer');
            await expect(sceneLayer).toBeVisible();
            const sceneBackground = await sceneLayer.evaluate((element) => getComputedStyle(element).backgroundImage);
            expect(sceneBackground).toContain('url(');
            const inlineBack = page.getByTestId('choose-path-inline-back');
            await expect(inlineBack).toBeVisible();
            await expect(inlineBack).toBeInViewport();
            const classicRun = page.getByRole('button', { name: /classic run/i });
            await expect(classicRun).toBeInViewport();
            await page.getByTestId('choose-path-more-modes').scrollIntoViewIfNeeded();
            const libraryScroller = page.getByLabel(/more modes library, swipe or drag sideways to browse pages/i);
            await expectLocatorFullyInWindowViewport(
                page,
                libraryScroller
            );
            const libraryScrollMetrics = await libraryScroller.evaluate((element) => {
                const style = getComputedStyle(element);
                return {
                    clientWidth: element.clientWidth,
                    overflowX: style.overflowX,
                    scrollWidth: element.scrollWidth,
                    scrollbarWidth: style.getPropertyValue('scrollbar-width').trim()
                };
            });
            expect(libraryScrollMetrics.overflowX).toBe('auto');
            expect(libraryScrollMetrics.scrollWidth).toBeGreaterThan(libraryScrollMetrics.clientWidth);
            if (libraryScrollMetrics.scrollbarWidth) {
                expect(libraryScrollMetrics.scrollbarWidth).toBe('thin');
            }
            await expectChoosePathLibraryDensity(page);
            await page.getByTestId('choose-path-low-cta').scrollIntoViewIfNeeded();
            await expectLocatorFullyInWindowViewport(page, page.getByTestId('choose-path-low-cta'));
            await expectCoarsePointerTarget(page, classicRun);
            await capture('01a-choose-your-path');
        }
    },
    {
        fileBase: '01b-collection',
        name: 'collection screen',
        run: async (page, capture) => {
            await openMainMenuFromSave(page, true);
            await page.getByRole('button', { name: /^collection$/i }).click();
            await expect(page.getByRole('region', { name: /collection/i })).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await capture('01b-collection');
        }
    },
    {
        fileBase: '01c-inventory-empty',
        name: 'inventory with no active run',
        run: async (page, capture) => {
            await openMainMenuFromSave(page, true);
            await page.getByRole('button', { name: /^inventory$/i }).click();
            await expect(page.getByText(/No active expedition/i)).toBeVisible();
            await expect(page.getByRole('region', { name: /inventory/i })).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await capture('01c-inventory-empty');
        }
    },
    {
        fileBase: '01d-inventory-active',
        name: 'inventory during a run',
        timeoutMs: 90_000,
        run: async (page, capture) => {
            await openLevel1Play(page);
            await page.getByTestId('game-toolbar-inventory').click({ timeout: 20_000 });
            await expect(page.getByRole('region', { name: /inventory/i })).toBeVisible({ timeout: 20_000 });
            await expectNoHorizontalOverflow(page);
            await capture('01d-inventory-active');
        }
    },
    {
        fileBase: '01e-codex',
        name: 'codex during a run',
        timeoutMs: 90_000,
        run: async (page, capture) => {
            await openLevel1Play(page);
            await page.getByTestId('game-toolbar-codex').click({ timeout: 20_000 });
            await expect(page.getByRole('region', { name: /codex/i })).toBeVisible({ timeout: 20_000 });
            await expectNoHorizontalOverflow(page);
            await capture('01e-codex');
        }
    },
    {
        fileBase: '02-main-menu-howto',
        name: 'main menu with How To Play',
        run: async (page, capture) => {
            await openMainMenuFromSave(page, false);
            await expect(page.getByText(/How To Play/i).first()).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await expectAppScrollportHasNoVerticalOverflow(page);
            await expectLocatorFullyInWindowViewport(page, mainMenuPlayButton(page));
            await capture('02-main-menu-howto');
        }
    },
    {
        fileBase: '03-settings-page',
        name: 'settings page',
        run: async (page, capture) => {
            await openMainMenuFromSave(page, true);
            await page.getByRole('button', { name: /^settings$/i }).evaluate((element) => {
                (element as HTMLButtonElement).click();
            });
            await expect(page.getByRole('heading', { name: /^settings$/i })).toBeVisible();
            const gameplayCategory = page.getByRole('button', { name: /gameplay/i }).first();
            await expect(gameplayCategory).toBeVisible();
            await expectCoarsePointerTarget(page, gameplayCategory);
            await expectNoHorizontalOverflow(page);
            await capture('03-settings-page');
        }
    },
    {
        fileBase: '04-game-playing',
        name: 'game playing (level 1)',
        run: async (page, capture) => {
            await openLevel1Play(page);
            await waitLevel1PlayReady(page);
            await expect(page.getByTestId('game-hud')).toBeVisible();
            await expect(page.getByRole('toolbar', { name: /game controls/i })).toBeVisible();
            await expect(page.getByRole('group', { name: /run stats/i })).toBeVisible();
            await expect(page.getByTestId('tile-board-frame')).toBeVisible();
            await expect(page.getByTestId('tile-board-application')).toBeInViewport();
            await expectNoHorizontalOverflow(page);
            await capture('04-game-playing');
        }
    },
    {
        fileBase: '05-pause-modal',
        name: 'pause modal',
        timeoutMs: 120_000,
        run: async (page, capture) => {
            await openLevel1Play(page);
            await page.keyboard.press('p');
            await expect(page.getByRole('dialog', { name: /run paused/i })).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await capture('05-pause-modal');
            await page
                .getByRole('dialog', { name: /run paused/i })
                .getByRole('button', { name: /^resume$/i })
                .evaluate((element) => {
                    (element as HTMLButtonElement).click();
                });
            await expect(page.getByRole('dialog', { name: /run paused/i })).toBeHidden();
        }
    },
    {
        fileBase: '06-run-settings-modal',
        name: 'run settings modal (in-game)',
        run: async (page, capture) => {
            await openLevel1Play(page);
            const settingsBtn = page.getByTestId('game-toolbar-settings');
            await expect(settingsBtn).toBeVisible({ timeout: 20_000 });
            await settingsBtn.click({ force: true });
            const runSettings = page.getByRole('dialog', { name: /run settings/i });
            await expect(runSettings).toBeVisible({ timeout: 15_000 });
            await expectNoHorizontalOverflow(page);
            await capture('06-run-settings-modal');
            await runSettings.getByRole('button', { name: /^back$/i }).evaluate((element) => {
                (element as HTMLButtonElement).click();
            });
            await expect(runSettings).toBeHidden();
        }
    },
    {
        fileBase: '07-floor-cleared-modal',
        name: 'floor cleared modal',
        /** Must exceed `completeLevel1ByTryingHiddenPairs` worst case (120s) plus menu/load/setup. */
        timeoutMs: 200_000,
        run: async (page, capture) => {
            await openLevel1Play(page);
            const pairs = await waitLevel1PlayReady(page);
            await completeLevel1Play(page, pairs);
            await expect(page.getByRole('dialog', { name: /floor cleared/i })).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await capture('07-floor-cleared-modal');
        }
    },
    {
        fileBase: '08-game-over',
        name: 'game over screen',
        timeoutMs: 120_000,
        run: async (page, capture) => {
            if (visualE2eUsesSandboxGameOver()) {
                await openDevSandboxGameOver(page);
            } else {
                await openLevel1Play(page);
                const pairs = await waitLevel1PlayReady(page);
                await forceGameOverWithMismatches(page, pairs);
            }
            await expect(page.getByText(/Expedition Over/i)).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await capture('08-game-over');
        }
    }
];
