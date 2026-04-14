import { describe, expect, it } from 'vitest';
import { GAME_RULES_VERSION } from './contracts';
import { ENCYCLOPEDIA_VERSION } from './mechanics-encyclopedia';
import { buildMechanicsCatalogAppendixMarkdown } from './mechanics-catalog-appendix-builder';

describe('mechanics-catalog-appendix-builder', () => {
    it('includes current rule versions and catalog sizes', () => {
        const md = buildMechanicsCatalogAppendixMarkdown('2000-01-01T00:00:00.000Z');
        expect(md).toContain(`| \`GAME_RULES_VERSION\` | ${GAME_RULES_VERSION} |`);
        expect(md).toContain(`| \`ENCYCLOPEDIA_VERSION\` | ${ENCYCLOPEDIA_VERSION} |`);
        expect(md).toContain('Relic entries');
        expect(md).toContain('Mutator entries');
        expect(md).toContain('Achievement entries');
        expect(md).toContain('2000-01-01T00:00:00.000Z');
    });
});
