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
        expect(a).toContain('>01<');
        expect(a).toMatch(/<circle\b[^>]*\br="/);
    });

    it('varies SVG by atomicVariant shape and by variant styling', () => {
        const t0 = baseTile({ atomicVariant: 0 });
        const t1 = baseTile({ atomicVariant: 1 });
        expect(buildProgrammaticCardFaceSvg(t0, 'active')).not.toBe(buildProgrammaticCardFaceSvg(t1, 'active'));
        expect(buildProgrammaticCardFaceSvg(t0, 'active')).not.toBe(buildProgrammaticCardFaceSvg(t0, 'matched'));
    });

    it('golden fingerprints for rank / shape / variant matrix (update EXPECTED when art changes)', () => {
        const variants: ProgrammaticOverlayVariant[] = ['active', 'matched', 'mismatch'];
        const symbols = ['01', '12', '30'];
        const atomicVariants = [0, 1, 4];

        /** Full matrix — bump when `programmaticCardFace` layout or motif output changes. */
        const expected: Record<string, string> = {
            '01-active-0': 'dcc02be45760b3bc5944',
            '01-active-1': '813cb43bd12955b3cd0b',
            '01-active-4': '66e2421246b11f7cdbc6',
            '01-matched-0': 'f8259344db986e214820',
            '01-matched-1': 'e4471a4d4920b35a3772',
            '01-matched-4': '888fba3ee8cb43f189e6',
            '01-mismatch-0': '31c6d224b31fc7dfaf70',
            '01-mismatch-1': '51212bf255f4728bf4fc',
            '01-mismatch-4': '5b919319009a54887c53',
            '12-active-0': 'fdd38644931a67998365',
            '12-active-1': 'fd3a66a964f3c410b711',
            '12-active-4': '647b221f28ba69a5f290',
            '12-matched-0': 'f87db5ef775958814af5',
            '12-matched-1': '6303363629ceef7d731b',
            '12-matched-4': 'aec8e1ca0606e9c2ac88',
            '12-mismatch-0': '53a3b059059fc7a2767e',
            '12-mismatch-1': '94297d4f27ed90b0cf8f',
            '12-mismatch-4': 'd8f86b08ee7896180b08',
            '30-active-0': '41344348d9ba77ebff85',
            '30-active-1': 'b6138a593e4b3126d379',
            '30-active-4': 'a02d8db9a50a67309d6b',
            '30-matched-0': '265f6da18fb72ebba7bb',
            '30-matched-1': '1467ffb3a21300196fa8',
            '30-matched-4': 'd2884f3e185df87baed2',
            '30-mismatch-0': '082e6bef5db77456fe7e',
            '30-mismatch-1': '472a4e34bcba3a684d0e',
            '30-mismatch-4': '2de1727b0c42a9220839'
        };

        for (const symbol of symbols) {
            for (const variant of variants) {
                for (const atomicVariant of atomicVariants) {
                    const key = `${symbol}-${variant}-${atomicVariant}`;
                    const svg = buildProgrammaticCardFaceSvg(baseTile({ symbol, label: symbol, atomicVariant }), variant);
                    expect(svg).toContain(`viewBox="0 0 ${PROGRAMMATIC_CARD_VIEWBOX.w} ${PROGRAMMATIC_CARD_VIEWBOX.h}"`);
                    expect(svg).toContain(`>${symbol}<`);
                    expect(svgFingerprint(svg), key).toBe(expected[key]);
                }
            }
        }
    });
});
