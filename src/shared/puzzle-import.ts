import type { PuzzleDifficulty, PuzzleGoal, PuzzlePackId, Tile } from './contracts';
import type { SaveData } from './contracts';
import { BUILTIN_PUZZLES } from './builtin-puzzles';

/** Keep in sync with `game.ts` glass decoy key. */
const DECOY_PAIR_KEY = '__decoy__';

/**
 * Runtime checks for hand-authored puzzle tile lists (builtins and tests):
 * count 4–64, required string fields (non-empty id/pairKey after trim), optional finite `atomicVariant`,
 * and exactly two tiles per non-decoy `pairKey`.
 */
export const isValidPuzzleImportTileSet = (tiles: Tile[]): boolean => {
    if (tiles.length < 4 || tiles.length > 64) {
        return false;
    }
    for (const tile of tiles) {
        const { id, pairKey, symbol, label } = tile;
        if (typeof id !== 'string' || typeof pairKey !== 'string' || typeof symbol !== 'string' || typeof label !== 'string') {
            return false;
        }
        if (!id.trim() || !pairKey.trim()) {
            return false;
        }
        if ('atomicVariant' in tile && tile.atomicVariant !== undefined) {
            if (typeof tile.atomicVariant !== 'number' || !Number.isFinite(tile.atomicVariant)) {
                return false;
            }
        }
    }
    const pairKeys = tiles.map((x) => x.pairKey).filter((k) => k !== DECOY_PAIR_KEY);
    const counts = new Map<string, number>();
    for (const k of pairKeys) {
        counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    for (const c of counts.values()) {
        if (c !== 2) {
            return false;
        }
    }
    return true;
};

export interface PuzzleImportPayload {
    title?: unknown;
    goal?: unknown;
    difficulty?: unknown;
    tags?: unknown;
    tiles?: unknown;
}

export interface PuzzleImportResult {
    ok: boolean;
    errors: string[];
}

export interface PuzzlePackSummary {
    id: PuzzlePackId;
    title: string;
    description: string;
    puzzleIds: string[];
}

const VALID_GOALS = new Set<PuzzleGoal>(['clear_all', 'perfect_clear', 'flip_par']);
const VALID_DIFFICULTIES = new Set<PuzzleDifficulty>(['starter', 'standard', 'advanced']);

export const validatePuzzleImportPayload = (payload: PuzzleImportPayload): PuzzleImportResult => {
    const errors: string[] = [];
    if (typeof payload.title !== 'string' || payload.title.trim().length < 3) {
        errors.push('title must be a string with at least 3 characters');
    }
    if (typeof payload.goal !== 'string' || !VALID_GOALS.has(payload.goal as PuzzleGoal)) {
        errors.push('goal must be one of clear_board, perfect_clear, limited_mistakes');
    }
    if (typeof payload.difficulty !== 'string' || !VALID_DIFFICULTIES.has(payload.difficulty as PuzzleDifficulty)) {
        errors.push('difficulty must be intro, standard, or advanced');
    }
    if (
        payload.tags !== undefined &&
        (!Array.isArray(payload.tags) || !payload.tags.every((tag) => typeof tag === 'string' && tag.trim().length > 0))
    ) {
        errors.push('tags must be non-empty strings when provided');
    }
    if (!Array.isArray(payload.tiles) || !isValidPuzzleImportTileSet(payload.tiles as Tile[])) {
        errors.push('tiles must contain 4-64 tiles with exactly two tiles per non-decoy pairKey');
    }
    return { ok: errors.length === 0, errors };
};

export const PUZZLE_PACKS: readonly PuzzlePackSummary[] = [
    {
        id: 'tutorial',
        title: 'Tutorial pack',
        description: 'Tiny and beginner boards for first clears.',
        puzzleIds: ['starter_pairs']
    },
    {
        id: 'beginner',
        title: 'Beginner pack',
        description: 'Readable handcrafted boards that introduce mirrored symbols.',
        puzzleIds: ['mirror_craft']
    },
    {
        id: 'challenge',
        title: 'Challenge pack',
        description: 'Advanced authored patterns for long-tail mastery.',
        puzzleIds: ['glyph_cross']
    }
];

export const getPuzzleLibraryRows = (save: SaveData) =>
    Object.values(BUILTIN_PUZZLES).map((puzzle) => {
        const completion = save.playerStats?.puzzleCompletions?.[puzzle.id];
        const completed = completion?.completed === true;
        const pack = PUZZLE_PACKS.find((candidate) => candidate.puzzleIds.includes(puzzle.id));
        return {
            id: puzzle.id,
            title: puzzle.title,
            difficulty: puzzle.difficulty,
            goal: puzzle.goal,
            goalText: puzzle.goalText,
            tags: puzzle.tags,
            pack: pack?.id ?? 'experimental',
            author: puzzle.author,
            version: puzzle.version,
            status: completed ? 'completed' : 'open',
            progress: completed ? { current: 1, target: 1 } : { current: 0, target: 1 }
        };
    });
