import { describe, expect, it } from 'vitest';
import { BUILTIN_PUZZLES } from './builtin-puzzles';
import { isValidPuzzleImportTileSet, parsePuzzleImportJson } from './puzzle-import';

describe('parsePuzzleImportJson', () => {
    it('accepts a minimal valid puzzle', () => {
        const raw = JSON.stringify({
            title: 'Test',
            tiles: [
                { id: 'a1', pairKey: 'p1', symbol: 'A', label: 'a' },
                { id: 'a2', pairKey: 'p1', symbol: 'A', label: 'a' },
                { id: 'b1', pairKey: 'p2', symbol: 'B', label: 'b' },
                { id: 'b2', pairKey: 'p2', symbol: 'B', label: 'b' }
            ]
        });
        const parsed = parsePuzzleImportJson(raw);
        expect(parsed).not.toBeNull();
        expect(parsed?.title).toBe('Test');
        expect(parsed?.tiles).toHaveLength(4);
    });

    it('rejects invalid pair counts', () => {
        const raw = JSON.stringify({
            tiles: [
                { id: 'a1', pairKey: 'p1', symbol: 'A', label: 'a' },
                { id: 'a2', pairKey: 'p1', symbol: 'A', label: 'a' },
                { id: 'b1', pairKey: 'p2', symbol: 'B', label: 'b' },
                { id: 'b2', pairKey: 'p3', symbol: 'C', label: 'c' }
            ]
        });
        expect(parsePuzzleImportJson(raw)).toBeNull();
    });

    it('rejects too few tiles', () => {
        const raw = JSON.stringify({
            tiles: [
                { id: 'a1', pairKey: 'p1', symbol: 'A', label: 'a' },
                { id: 'a2', pairKey: 'p1', symbol: 'A', label: 'a' }
            ]
        });
        expect(parsePuzzleImportJson(raw)).toBeNull();
    });

    it('rejects tiles array entries that are not objects', () => {
        const raw = JSON.stringify({ tiles: [null, { id: 'a1', pairKey: 'p1', symbol: 'A', label: 'a' }] });
        expect(parsePuzzleImportJson(raw)).toBeNull();
    });

    it('rejects empty tile id after trim (mentions id field)', () => {
        const raw = JSON.stringify({
            tiles: [
                { id: '   ', pairKey: 'p1', symbol: 'A', label: 'a' },
                { id: 'a2', pairKey: 'p1', symbol: 'A', label: 'a' },
                { id: 'b1', pairKey: 'p2', symbol: 'B', label: 'b' },
                { id: 'b2', pairKey: 'p2', symbol: 'B', label: 'b' }
            ]
        });
        expect(parsePuzzleImportJson(raw)).toBeNull();
    });
});

describe('isValidPuzzleImportTileSet', () => {
    it('matches parsePuzzleImportJson acceptance for a valid payload', () => {
        const raw = JSON.stringify({
            tiles: [
                { id: 'a1', pairKey: 'p1', symbol: 'A', label: 'a' },
                { id: 'a2', pairKey: 'p1', symbol: 'A', label: 'a' },
                { id: 'b1', pairKey: 'p2', symbol: 'B', label: 'b' },
                { id: 'b2', pairKey: 'p2', symbol: 'B', label: 'b' }
            ]
        });
        const parsed = parsePuzzleImportJson(raw);
        expect(parsed).not.toBeNull();
        expect(isValidPuzzleImportTileSet(parsed!.tiles)).toBe(true);
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
    it('satisfies puzzle-import tile rules', () => {
        for (const puzzle of Object.values(BUILTIN_PUZZLES)) {
            expect(isValidPuzzleImportTileSet(puzzle.tiles)).toBe(true);
        }
    });
});
