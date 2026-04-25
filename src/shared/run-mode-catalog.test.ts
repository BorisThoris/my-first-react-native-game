import { describe, expect, it } from 'vitest';
import { RUN_MODE_CATALOG } from './run-mode-catalog';
import { VISUAL_ENDLESS_MODE_LOCKED } from './mechanics-encyclopedia';

describe('REG-018 run mode shipping states', () => {
    it('keeps product Endless intentionally locked with explicit upcoming copy', () => {
        const classic = RUN_MODE_CATALOG.find((mode) => mode.id === 'classic');
        const endless = RUN_MODE_CATALOG.find((mode) => mode.id === 'endless');

        expect(classic).toMatchObject({
            title: 'Classic Run',
            availability: 'available',
            action: { type: 'startRun' }
        });
        expect(endless).toMatchObject({
            title: 'Endless Mode',
            availability: 'locked',
            action: { type: 'locked' }
        });
        expect(endless?.shortDescription).toContain('Locked intentionally');
        expect(VISUAL_ENDLESS_MODE_LOCKED.description).toContain('stays locked');
    });
});
