import { test } from '@playwright/test';
import { MOBILE_VISUAL_VIEWPORTS } from './visualScreenHelpers';
import { registerVisualScreenScenarios } from './visualScreenScenarios';

test.describe.configure({ mode: 'serial' });

registerVisualScreenScenarios(test, MOBILE_VISUAL_VIEWPORTS);
