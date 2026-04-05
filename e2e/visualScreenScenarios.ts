import { expect, test as base } from '@playwright/test';
import { VISUAL_SCREEN_SCENARIOS } from './visualScenarioSteps';
import type { VisualViewport } from './visualScreenHelpers';
import { captureVisualScreen } from './visualScreenHelpers';

export function registerVisualScreenScenarios(
    testApi: typeof base,
    viewports: readonly VisualViewport[]
): void {
    for (const vp of viewports) {
        testApi.describe(`Visual screens @ ${vp.id} (${vp.width}x${vp.height})`, () => {
            testApi.beforeEach(async ({ page }) => {
                await page.setViewportSize({ width: vp.width, height: vp.height });
            });

            for (const scenario of VISUAL_SCREEN_SCENARIOS) {
                testApi(scenario.name, async ({ page }) => {
                    testApi.setTimeout(scenario.timeoutMs ?? 60_000);
                    const capture = (baseName: string) =>
                        captureVisualScreen(page, vp.deviceId, vp.orientation, baseName);
                    await scenario.run(page, capture);
                });
            }
        });
    }
}
