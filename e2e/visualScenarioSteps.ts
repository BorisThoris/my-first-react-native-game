import { expect, type Page } from '@playwright/test';
import {
    buildVisualSaveJson,
    completeLevel1Play,
    expectNoHorizontalOverflow,
    forceGameOverWithMismatches,
    gotoWithSave,
    openLevel1Play,
    openMainMenuFromSave,
    waitLevel1PlayReady
} from './visualScreenHelpers';

export type VisualScenarioCapture = (baseName: string) => Promise<void>;

export interface VisualScreenScenario {
    name: string;
    fileBase: string;
    timeoutMs?: number;
    run: (page: Page, capture: VisualScenarioCapture) => Promise<void>;
}

export const VISUAL_SCREEN_SCENARIOS: ReadonlyArray<VisualScreenScenario> = [
    {
        fileBase: '00-startup-intro',
        name: 'startup intro visible',
        run: async (page, capture) => {
            await gotoWithSave(page, buildVisualSaveJson(true));
            await expect(page.getByRole('dialog', { name: /startup relic intro/i })).toBeVisible({
                timeout: 15000
            });
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
            await expect(page.getByRole('button', { name: /^play$/i })).toBeVisible();
            await expect(page.getByRole('group', { name: /more run types/i })).toBeVisible();
            await capture('01-main-menu');
        }
    },
    {
        fileBase: '01a-choose-your-path',
        name: 'choose your path',
        run: async (page, capture) => {
            await openMainMenuFromSave(page, true);
            await page.getByRole('button', { name: /^play$/i }).click();
            await expect(page.getByRole('region', { name: /choose your path/i })).toBeVisible();
            await expectNoHorizontalOverflow(page);
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
        run: async (page, capture) => {
            await openLevel1Play(page);
            await page.getByRole('button', { name: /show utility menu/i }).click();
            await page.getByRole('group', { name: /in-game menu/i }).getByRole('button', { name: /active run loadout/i }).click();
            await expect(page.getByRole('region', { name: /inventory/i })).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await capture('01d-inventory-active');
        }
    },
    {
        fileBase: '01e-codex',
        name: 'codex during a run',
        run: async (page, capture) => {
            await openLevel1Play(page);
            await page.getByRole('button', { name: /show utility menu/i }).click();
            await page.getByRole('group', { name: /in-game menu/i }).getByRole('button', { name: /read-only rules/i }).click();
            await expect(page.getByRole('region', { name: /codex/i })).toBeVisible();
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
            await expect(page.getByRole('button', { name: /gameplay/i }).first()).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await capture('03-settings-page');
        }
    },
    {
        fileBase: '04-game-playing',
        name: 'game playing (level 1)',
        run: async (page, capture) => {
            await openLevel1Play(page);
            await expect(page.getByRole('toolbar', { name: /game controls/i })).toBeVisible();
            await expect(page.getByRole('group', { name: /run stats/i })).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await capture('04-game-playing');
        }
    },
    {
        fileBase: '05-pause-modal',
        name: 'pause modal',
        run: async (page, capture) => {
            await openLevel1Play(page);
            await page.getByRole('button', { name: /pause/i }).click();
            await expect(page.getByRole('dialog', { name: /run paused/i })).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await capture('05-pause-modal');
            await page
                .getByRole('dialog', { name: /run paused/i })
                .getByRole('button', { name: /^resume$/i })
                .click();
            await expect(page.getByRole('dialog', { name: /run paused/i })).toBeHidden();
        }
    },
    {
        fileBase: '06-run-settings-modal',
        name: 'run settings modal (in-game)',
        run: async (page, capture) => {
            await openLevel1Play(page);
            await page.getByRole('button', { name: /^settings$/i }).evaluate((element) => {
                (element as HTMLButtonElement).click();
            });
            const runSettings = page.getByRole('dialog', { name: /run settings/i });
            await expect(runSettings).toBeVisible();
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
        timeoutMs: 90_000,
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
        timeoutMs: 90_000,
        run: async (page, capture) => {
            await openLevel1Play(page);
            const pairs = await waitLevel1PlayReady(page);
            await forceGameOverWithMismatches(page, pairs);
            await expect(page.getByText(/Expedition Over/i)).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await capture('08-game-over');
        }
    }
];
