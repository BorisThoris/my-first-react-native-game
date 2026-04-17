import { describe, expect, it } from 'vitest';
import { RUN_MODE_CATALOG } from '../../../shared/run-mode-catalog';
import { MODE_CARD_ART, type ModePosterKey } from './modeArt';

describe('modeArt vs run-mode-catalog', () => {
    it('every catalog posterKey resolves to bundled art (no missing keys)', () => {
        const keys = Object.keys(MODE_CARD_ART) as ModePosterKey[];
        for (const mode of RUN_MODE_CATALOG) {
            expect(keys, `mode "${mode.id}" posterKey "${mode.posterKey}"`).toContain(mode.posterKey);
        }
    });
});
