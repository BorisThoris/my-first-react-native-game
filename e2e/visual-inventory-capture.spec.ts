import { test } from '@playwright/test';
import { VISUAL_SCREEN_SCENARIOS } from './visualScenarioSteps';
import { forceCoarsePointerMedia } from './mobileTouchHelpers';
import { INVENTORY_DEVICE_SLOTS } from './visualInventoryDevices';
import { captureVisualScreen } from './visualScreenHelpers';

test.describe.configure({ mode: 'serial' });

/** Full named-device UI audit: every visual screen scenario across touch and desktop slots. */
for (const slot of INVENTORY_DEVICE_SLOTS) {
    test.describe(`Visual inventory @ ${slot.deviceId} / ${slot.orientation} (${slot.width}x${slot.height})`, () => {
        test.beforeEach(async ({ page }) => {
            if (slot.useCoarsePointer) {
                await forceCoarsePointerMedia(page);
            }
            await page.setViewportSize({ width: slot.width, height: slot.height });
        });

        for (const scenario of VISUAL_SCREEN_SCENARIOS) {
            test(scenario.name, async ({ page }) => {
                if (scenario.timeoutMs !== undefined) {
                    test.setTimeout(scenario.timeoutMs);
                }
                const capture = (baseName: string) =>
                    captureVisualScreen(page, slot.deviceId, slot.orientation, baseName);
                await scenario.run(page, capture);
            });
        }
    });
}
