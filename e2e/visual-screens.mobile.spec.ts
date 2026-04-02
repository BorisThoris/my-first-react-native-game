import { test } from '@playwright/test';
import { forceCoarsePointerMedia } from './mobileTouchHelpers';
import { MOBILE_VISUAL_VIEWPORTS } from './visualScreenHelpers';
import { registerVisualScreenScenarios } from './visualScreenScenarios';

test.describe.configure({ mode: 'serial' });
test.beforeEach(async ({ page }) => {
    await forceCoarsePointerMedia(page);
});

registerVisualScreenScenarios(test, MOBILE_VISUAL_VIEWPORTS);
