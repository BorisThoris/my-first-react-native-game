import { describe, expect, it } from 'vitest';
import { BUILTIN_PUZZLES } from './builtin-puzzles';
import { isValidPuzzleImportTileSet } from './puzzle-import';

const minimalValidTiles = [
    { id: 'a1', pairKey: 'p1', symbol: 'A', label: 'a', state: 'hidden' as const },
    { id: 'a2', pairKey: 'p1', symbol: 'A', label: 'a', state: 'hidden' as const },
    { id: 'b1', pairKey: 'p2', symbol: 'B', label: 'b', state: 'hidden' as const },
    { id: 'b2', pairKey: 'p2', symbol: 'B', label: 'b', state: 'hidden' as const }
];

describe('isValidPuzzleImportTileSet', () => {
    it('accepts a minimal valid tile set', () => {
        expect(isValidPuzzleImportTileSet([...minimalValidTiles])).toBe(true);
    });

    it('rejects invalid pair counts', () => {
        const tiles = [
            { id: 'a1', pairKey: 'p1', symbol: 'A', label: 'a', state: 'hidden' as const },
            { id: 'a2', pairKey: 'p1', symbol: 'A', label: 'a', state: 'hidden' as const },
            { id: 'b1', pairKey: 'p2', symbol: 'B', label: 'b', state: 'hidden' as const },
            { id: 'b2', pairKey: 'p3', symbol: 'C', label: 'c', state: 'hidden' as const }
        ];
        expect(isValidPuzzleImportTileSet(tiles)).toBe(false);
    });

    it('rejects too few tiles', () => {
        const tiles = [
            { id: 'a1', pairKey: 'p1', symbol: 'A', label: 'a', state: 'hidden' as const },
            { id: 'a2', pairKey: 'p1', symbol: 'A', label: 'a', state: 'hidden' as const }
        ];
        expect(isValidPuzzleImportTileSet(tiles)).toBe(false);
    });

    it('rejects empty tile id after trim', () => {
        const tiles = [
            { id: '   ', pairKey: 'p1', symbol: 'A', label: 'a', state: 'hidden' as const },
            { id: 'a2', pairKey: 'p1', symbol: 'A', label: 'a', state: 'hidden' as const },
            { id: 'b1', pairKey: 'p2', symbol: 'B', label: 'b', state: 'hidden' as const },
            { id: 'b2', pairKey: 'p2', symbol: 'B', label: 'b', state: 'hidden' as const }
        ];
        expect(isValidPuzzleImportTileSet(tiles)).toBe(false);
    });

    it('rejects non-finite atomicVariant', () => {
        const tiles = [
            { id: 'a1', pairKey: 'p1', symbol: 'A', label: 'a', state: 'hidden' as const, atomicVariant: Number.NaN },
            { id: 'a2', pairKey: 'p1', symbol: 'A', label: 'a', state: 'hidden' as const },
            { id: 'b1', pairKey: 'p2', symbol: 'B', label: 'b', state: 'hidden' as const },
            { id: 'b2', pairKey: 'p2', symbol: 'B', label: 'b', state: 'hidden' as const }
        ];
        expect(isValidPuzzleImportTileSet(tiles)).toBe(false);
    });
});

describe('BUILTIN_PUZZLES', () => {
    it('satisfies puzzle tile validation rules', () => {
        for (const puzzle of Object.values(BUILTIN_PUZZLES)) {
            expect(isValidPuzzleImportTileSet(puzzle.tiles)).toBe(true);
        }
    });
});
