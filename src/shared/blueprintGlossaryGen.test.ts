import { describe, expect, it } from 'vitest';
import devTerms from '../blueprint/definitions/devTerms.blueprint.json';
import { BLUEPRINT_GLOSSARY } from './generated/blueprintGlossaryGen';

describe('blueprintGlossaryGen', () => {
    it('syncs devTerms.blueprint.json entries to generated const', () => {
        for (const [k, v] of Object.entries((devTerms as { entries: Record<string, { en: string }> }).entries)) {
            expect(BLUEPRINT_GLOSSARY[k]).toEqual(v);
        }
        expect(Object.keys(BLUEPRINT_GLOSSARY).length).toBe(
            Object.keys((devTerms as { entries: Record<string, { en: string }> }).entries).length
        );
    });
});
