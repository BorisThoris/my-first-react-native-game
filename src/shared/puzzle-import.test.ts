import { describe, expect, it } from 'vitest';
import { BUILTIN_PUZZLES } from './builtin-puzzles';
import { createDefaultSaveData } from './save-data';
import { getPuzzleLibraryRows, isValidPuzzleImportTileSet, validatePuzzleImportPayload } from './puzzle-import';

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

    it('validates import payload metadata with useful errors', () => {
        expect(
            validatePuzzleImportPayload({
                title: 'Tiny',
                goal: 'clear_all',
                difficulty: 'starter',
                tiles: minimalValidTiles
            }).ok
        ).toBe(true);
        expect(validatePuzzleImportPayload({ title: '', goal: 'clear_all', difficulty: 'starter', tiles: minimalValidTiles })).toEqual({
            ok: false,
            errors: ['title must be a string with at least 3 characters']
        });
        expect(validatePuzzleImportPayload({ title: 'Broken', goal: 'clear_all', difficulty: 'starter', tiles: [] })).toEqual({
            ok: false,
            errors: ['tiles must contain 4-64 tiles with exactly two tiles per non-decoy pairKey']
        });
    });
});

describe('BUILTIN_PUZZLES', () => {
    it('satisfies puzzle tile validation rules', () => {
        for (const puzzle of Object.values(BUILTIN_PUZZLES)) {
            expect(isValidPuzzleImportTileSet(puzzle.tiles)).toBe(true);
        }
    });

    it('projects visible puzzle library progress rows', () => {
        const save = createDefaultSaveData();
        save.playerStats = {
            ...save.playerStats!,
            puzzleCompletions: {
                starter_pairs: { completed: true, bestMistakes: 0, bestScore: 120 }
            }
        };
        const rows = getPuzzleLibraryRows(save);
        expect(rows.map((row) => row.id)).toEqual(['starter_pairs', 'mirror_craft', 'glyph_cross']);
        expect(rows.find((row) => row.id === 'starter_pairs')?.status).toBe('completed');
        expect(rows.find((row) => row.id === 'mirror_craft')?.difficulty).toBe('standard');
        expect(rows.find((row) => row.id === 'glyph_cross')?.pack).toBe('challenge');
        expect(rows.find((row) => row.id === 'glyph_cross')?.author).toBe('Memory Dungeon');
    });
});
