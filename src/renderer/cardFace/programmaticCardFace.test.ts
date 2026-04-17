import { createHash } from 'crypto';
import { describe, expect, it } from 'vitest';
import type { Tile } from '../../shared/contracts';
import {
    buildProgrammaticCardFaceSvg,
    PROGRAMMATIC_CARD_VIEWBOX,
    tileUsesProgrammaticFaceMotif,
    type ProgrammaticOverlayVariant
} from './programmaticCardFace';

/**
 * Short stable fingerprint for SVG output.
 * When updating goldens after intentional art changes: run `yarn tsx scripts/print-programmatic-svg-fingerprints.ts`
 * and replace the `expected` map below.
 */
const svgFingerprint = (svg: string): string => createHash('sha256').update(svg).digest('hex').slice(0, 20);

const baseTile = (overrides: Partial<Tile>): Tile => ({
    id: 't1',
    pairKey: '1-0',
    state: 'hidden',
    symbol: '01',
    label: '01',
    atomicVariant: 0,
    ...overrides
});

describe('programmaticCardFace', () => {
    it('flags digit-only symbols for programmatic motif', () => {
        expect(tileUsesProgrammaticFaceMotif(baseTile({ symbol: '01', label: '01' }))).toBe(true);
        expect(tileUsesProgrammaticFaceMotif(baseTile({ symbol: '30', label: '30' }))).toBe(true);
        expect(tileUsesProgrammaticFaceMotif(baseTile({ symbol: 'A', label: 'A' }))).toBe(false);
        expect(tileUsesProgrammaticFaceMotif(baseTile({ symbol: '؟', label: '?' }))).toBe(false);
        expect(tileUsesProgrammaticFaceMotif(baseTile({ symbol: '★', label: 'Wild' }))).toBe(false);
    });

    it('buildProgrammaticCardFaceSvg is deterministic for the same tile and variant', () => {
        const tile = baseTile({});
        const a = buildProgrammaticCardFaceSvg(tile, 'active');
        const b = buildProgrammaticCardFaceSvg(tile, 'active');
        expect(a).toBe(b);
        expect(a).toContain('viewBox="0 0 400 560"');
        expect(a).not.toMatch(/<text\b/);
        expect(a).toMatch(/<circle\b[^>]*\br="/);
    });

    it('varies SVG by atomicVariant shape and by variant styling', () => {
        const t0 = baseTile({ atomicVariant: 0 });
        const t1 = baseTile({ atomicVariant: 1 });
        expect(buildProgrammaticCardFaceSvg(t0, 'active')).not.toBe(buildProgrammaticCardFaceSvg(t1, 'active'));
        expect(buildProgrammaticCardFaceSvg(t0, 'active')).not.toBe(buildProgrammaticCardFaceSvg(t0, 'matched'));
    });

    it('varies SVG grain when pairKey changes (noise seed)', () => {
        const a = buildProgrammaticCardFaceSvg(baseTile({ pairKey: '3-1' }), 'active');
        const b = buildProgrammaticCardFaceSvg(baseTile({ pairKey: '9-4' }), 'active');
        expect(a).not.toBe(b);
    });

    it('golden fingerprints for shape / variant matrix (rank text removed — symbol does not affect SVG)', () => {
        const variants: ProgrammaticOverlayVariant[] = ['active', 'matched', 'mismatch'];
        const symbols = ['01', '12', '30'];
        const atomicVariants = [0, 1, 4];

        /** Full matrix — bump when `programmaticCardFace` layout or motif output changes. */
        const expected: Record<string, string> = {
            '01-active-0': '91391dbbf711b2592eeb',
            '01-active-1': 'ce2e2d42a52485c864c5',
            '01-active-4': '7d3a645de845fc37c00b',
            '01-matched-0': '7552fe888829f7863210',
            '01-matched-1': '6b881512d836ed1b84be',
            '01-matched-4': 'ce0cc0145b34c6750ba5',
            '01-mismatch-0': 'b8c5ee12e7c4525f0764',
            '01-mismatch-1': '38397324166ee54ad212',
            '01-mismatch-4': 'e218590121a424b24a68',
            '12-active-0': '91391dbbf711b2592eeb',
            '12-active-1': 'ce2e2d42a52485c864c5',
            '12-active-4': '7d3a645de845fc37c00b',
            '12-matched-0': '7552fe888829f7863210',
            '12-matched-1': '6b881512d836ed1b84be',
            '12-matched-4': 'ce0cc0145b34c6750ba5',
            '12-mismatch-0': 'b8c5ee12e7c4525f0764',
            '12-mismatch-1': '38397324166ee54ad212',
            '12-mismatch-4': 'e218590121a424b24a68',
            '30-active-0': '91391dbbf711b2592eeb',
            '30-active-1': 'ce2e2d42a52485c864c5',
            '30-active-4': '7d3a645de845fc37c00b',
            '30-matched-0': '7552fe888829f7863210',
            '30-matched-1': '6b881512d836ed1b84be',
            '30-matched-4': 'ce0cc0145b34c6750ba5',
            '30-mismatch-0': 'b8c5ee12e7c4525f0764',
            '30-mismatch-1': '38397324166ee54ad212',
            '30-mismatch-4': 'e218590121a424b24a68'
        };

        for (const symbol of symbols) {
            for (const variant of variants) {
                for (const atomicVariant of atomicVariants) {
                    const key = `${symbol}-${variant}-${atomicVariant}`;
                    const svg = buildProgrammaticCardFaceSvg(baseTile({ symbol, label: symbol, atomicVariant }), variant);
                    expect(svg).toContain(`viewBox="0 0 ${PROGRAMMATIC_CARD_VIEWBOX.w} ${PROGRAMMATIC_CARD_VIEWBOX.h}"`);
                    expect(svgFingerprint(svg), key).toBe(expected[key]);
                }
            }
        }
    });
});
