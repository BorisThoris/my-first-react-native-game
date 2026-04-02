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
            await expect(page.getByRole('button', { name: /play arcade/i })).toBeVisible();
            await capture('01-main-menu');
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
            await page.getByRole('button', { name: /^settings$/i }).click();
            await expect(page.getByRole('heading', { name: /^settings$/i })).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await capture('03-settings-page');
        }
    },
    {
        fileBase: '04-game-playing',
        name: 'game playing (level 1)',
        run: async (page, capture) => {
            await openLevel1Play(page);
            await expect(page.getByRole('group', { name: /game controls/i })).toBeVisible();
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
            await page.getByRole('button', { name: /^settings$/i }).click();
            await expect(page.getByRole('dialog', { name: /run settings/i })).toBeVisible();
            await expectNoHorizontalOverflow(page);
            await capture('06-run-settings-modal');
            await page.getByRole('button', { name: /^back$/i }).click();
            await expect(page.getByRole('dialog', { name: /run settings/i })).toBeHidden();
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
