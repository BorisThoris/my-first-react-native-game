import { describe, expect, it } from 'vitest';
import { parsePuzzleImportJson } from './puzzle-import';

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
});
