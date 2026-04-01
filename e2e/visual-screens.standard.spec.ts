import { test } from '@playwright/test';
import { STANDARD_VISUAL_VIEWPORTS } from './visualScreenHelpers';
import { registerVisualScreenScenarios } from './visualScreenScenarios';

test.describe.configure({ mode: 'serial' });

registerVisualScreenScenarios(test, STANDARD_VISUAL_VIEWPORTS);
