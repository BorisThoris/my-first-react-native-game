import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { test } from '@playwright/test';
import { VISUAL_SCREEN_SCENARIOS } from './visualScenarioSteps';

/**
 * Full-page PNGs for design review across viewports. Output:
 *   docs/ui-design-reference/<width>x<height>/<scenario-fileBase>.png
 *
 * Run: `yarn capture:ui-design-reference` (8 viewports × all visual scenarios; serial, ~22+ min).
 */
const OUT_ROOT = join(process.cwd(), 'docs', 'ui-design-reference');

const VIEWPORTS = [
    { label: '390x844', width: 390, height: 844 },
    /* Narrow tall phone — crosses MainMenu `(max-width: 430px)` breakpoint. */
    { label: '430x740', width: 430, height: 740 },
    /* Mobile landscape — matches visual inventory “mobile landscape” slot. */
    { label: '844x390', width: 844, height: 390 },
    { label: '820x1180', width: 820, height: 1180 },
    /* Tight square — crosses GameScreen / layout compact breakpoints (~760). */
    { label: '760x760', width: 760, height: 760 },
    /* Steam / Electron minimum window — desktop-short compaction + fit zoom. */
    { label: '1280x720', width: 1280, height: 720 },
    { label: '1280x800', width: 1280, height: 800 },
    { label: '1440x900', width: 1440, height: 900 }
] as const;

test.describe.configure({ mode: 'serial', timeout: 180_000 });

test.describe('UI design reference (multi-viewport)', () => {
    for (const vp of VIEWPORTS) {
        for (const scenario of VISUAL_SCREEN_SCENARIOS) {
            test(`${vp.label} — ${scenario.name}`, async ({ page }) => {
                if (scenario.timeoutMs !== undefined) {
                    test.setTimeout(scenario.timeoutMs + 60_000);
                }
                await page.setViewportSize({ width: vp.width, height: vp.height });
                const dir = join(OUT_ROOT, vp.label);
                mkdirSync(dir, { recursive: true });
                const capture = async (baseName: string): Promise<void> => {
                    await page.screenshot({ path: join(dir, `${baseName}.png`), fullPage: true });
                };
                await scenario.run(page, capture);
            });
        }
    }
});
