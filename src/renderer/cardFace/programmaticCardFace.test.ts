import { describe, expect, it } from 'vitest';
import type { Tile } from '../../shared/contracts';
import {
    buildProgrammaticCardFaceSvg,
    tileUsesProgrammaticFaceMotif
} from './programmaticCardFace';

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
});
