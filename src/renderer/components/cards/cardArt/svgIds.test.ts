import { describe, expect, it } from 'vitest';
import { buildCardArtFilterDomIds, CARD_ART_FILTER_ID_ROLES } from './svgIds';

describe('cardArt svgIds', () => {
    it('buildCardArtFilterDomIds uses stable glow/bloom suffix convention', () => {
        const a = buildCardArtFilterDomIds('cardArtreact1');
        expect(a.glowId.endsWith(`-${CARD_ART_FILTER_ID_ROLES[0]}`)).toBe(true);
        expect(a.bloomId.endsWith(`-${CARD_ART_FILTER_ID_ROLES[1]}`)).toBe(true);
        expect(a.glowId).toBe('cardArtreact1-glow');
        expect(a.bloomId).toBe('cardArtreact1-bloom');
    });

    it('distinct instance prefixes yield disjoint id sets (no url(#) collisions across trees)', () => {
        const x = buildCardArtFilterDomIds('a');
        const y = buildCardArtFilterDomIds('b');
        const set = new Set([x.glowId, x.bloomId, y.glowId, y.bloomId]);
        expect(set.size).toBe(4);
    });
});
