import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
import {
    MAX_RELIC_PICKS_PER_RUN,
    RELIC_FIRST_MILESTONE_FLOOR,
    RELIC_MILESTONE_STEP,
    RELIC_POOL
} from './relics';

const __dirname = dirname(fileURLToPath(import.meta.url));

const readBalanceNotes = (): string =>
    readFileSync(join(__dirname, '../../docs/BALANCE_NOTES.md'), 'utf8');

describe('relic balance vs BALANCE_NOTES.md', () => {
    it('documents every relic id in RELIC_POOL', () => {
        const doc = readBalanceNotes();
        for (const id of RELIC_POOL) {
            expect(doc, id).toContain(id);
        }
    });

    it('documents milestone cadence constants from relics.ts', () => {
        const doc = readBalanceNotes();
        expect(doc).toContain(String(RELIC_FIRST_MILESTONE_FLOOR));
        expect(doc).toContain(String(RELIC_MILESTONE_STEP));
        expect(doc).toContain(String(MAX_RELIC_PICKS_PER_RUN));
    });

    it('documents memorize bonus ms aligned with game.ts', () => {
        const doc = readBalanceNotes();
        expect(doc).toContain('+280ms');
        expect(doc).toContain('+220ms');
    });
});
