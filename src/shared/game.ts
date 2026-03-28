import {
    MAX_LIVES,
    type AchievementId,
    type BoardState,
    type LevelResult,
    type Rating,
    type RunState,
    type SessionStats,
    type Tile
} from './contracts';

const BASE_SYMBOLS = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    '1',
    '2',
    '3',
    '4'
] as const;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const shuffle = <T>(items: T[]): T[] => {
    const next = [...items];

    for (let index = next.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    }

    return next;
};

export const calculateScore = (tries: number): number => Math.max(100 - tries * 10, 0);

export const calculateRating = (tries: number): Rating => {
    if (tries <= 1) return 'S++';
    if (tries === 2) return 'S+';
    if (tries === 3) return 'S';
    if (tries <= 5) return 'A';
    if (tries <= 7) return 'B';
    if (tries <= 10) return 'C';
    if (tries <= 15) return 'D';
    return 'F';
};

const createSessionStats = (bestScore: number): SessionStats => ({
    totalScore: 0,
    currentLevelScore: calculateScore(0),
    bestScore,
    tries: 0,
    rating: calculateRating(0),
    levelsCleared: 0,
    matchesFound: 0,
    mismatches: 0,
    highestLevel: 1
});

const createTiles = (level: number, pairCount: number): Tile[] => {
    const symbols = BASE_SYMBOLS.slice(0, pairCount);
    const pairs = symbols.flatMap((symbol, index) => {
        const pairKey = `${level}-${index}`;
        return [
            { id: `${pairKey}-A`, pairKey, state: 'hidden' as const, symbol },
            { id: `${pairKey}-B`, pairKey, state: 'hidden' as const, symbol }
        ];
    });

    return shuffle(pairs);
};

export const buildBoard = (level: number): BoardState => {
    const pairCount = Math.min(level + 1, BASE_SYMBOLS.length);
    const tiles = createTiles(level, pairCount);
    const tileCount = tiles.length;
    const columns = clamp(Math.ceil(Math.sqrt(tileCount)), 2, 8);
    const rows = Math.ceil(tileCount / columns);

    return {
        level,
        pairCount,
        columns,
        rows,
        tiles,
        flippedTileIds: [],
        matchedPairs: 0
    };
};

export const createNewRun = (bestScore: number): RunState => ({
    status: 'playing',
    lives: MAX_LIVES,
    board: buildBoard(1),
    stats: createSessionStats(bestScore),
    achievementsEnabled: true,
    debugUsed: false,
    debugPeekActive: false,
    lastLevelResult: null,
    lastRunSummary: null
});

export const flipTile = (run: RunState, tileId: string): RunState => {
    if (run.status !== 'playing' || !run.board || run.board.flippedTileIds.length >= 2) {
        return run;
    }

    const tile = run.board.tiles.find((candidate) => candidate.id === tileId);

    if (!tile || tile.state !== 'hidden') {
        return run;
    }

    return {
        ...run,
        board: {
            ...run.board,
            tiles: run.board.tiles.map((candidate) =>
                candidate.id === tileId ? { ...candidate, state: 'flipped' } : candidate
            ),
            flippedTileIds: [...run.board.flippedTileIds, tileId]
        }
    };
};

const finalizeLevel = (run: RunState, board: BoardState): RunState => {
    const scoreGained = calculateScore(run.stats.tries);
    const totalScore = run.stats.totalScore + scoreGained;
    const bestScore = Math.max(run.stats.bestScore, totalScore);
    const rating = calculateRating(run.stats.tries);
    const lastLevelResult: LevelResult = {
        level: board.level,
        scoreGained,
        rating,
        livesRemaining: run.lives,
        perfect: run.stats.tries <= 1
    };

    return {
        ...run,
        status: 'levelComplete',
        board,
        stats: {
            ...run.stats,
            totalScore,
            bestScore,
            currentLevelScore: scoreGained,
            rating,
            levelsCleared: run.stats.levelsCleared + 1,
            highestLevel: Math.max(run.stats.highestLevel, board.level)
        },
        lastLevelResult
    };
};

const finalizeLoss = (run: RunState, board: BoardState, lives: number, tries: number): RunState => ({
    ...run,
    status: 'gameOver',
    lives,
    board,
    stats: {
        ...run.stats,
        tries,
        currentLevelScore: calculateScore(tries),
        rating: calculateRating(tries),
        mismatches: run.stats.mismatches + 1
    }
});

export const resolveBoardTurn = (run: RunState): RunState => {
    if (!run.board || run.board.flippedTileIds.length !== 2) {
        return run;
    }

    const [firstId, secondId] = run.board.flippedTileIds;
    const firstTile = run.board.tiles.find((tile) => tile.id === firstId);
    const secondTile = run.board.tiles.find((tile) => tile.id === secondId);

    if (!firstTile || !secondTile) {
        return run;
    }

    const isMatch = firstTile.pairKey === secondTile.pairKey;

    if (isMatch) {
        const board: BoardState = {
            ...run.board,
            flippedTileIds: [],
            matchedPairs: run.board.matchedPairs + 1,
            tiles: run.board.tiles.map((tile) =>
                tile.id === firstId || tile.id === secondId ? { ...tile, state: 'matched' } : tile
            )
        };

        const nextRun: RunState = {
            ...run,
            lives: Math.min(MAX_LIVES, run.lives + 1),
            board,
            stats: {
                ...run.stats,
                matchesFound: run.stats.matchesFound + 1,
                highestLevel: Math.max(run.stats.highestLevel, board.level)
            }
        };

        return board.matchedPairs === board.pairCount ? finalizeLevel(nextRun, board) : nextRun;
    }

    const tries = run.stats.tries + 1;
    const lives = run.lives - 1;
    const board: BoardState = {
        ...run.board,
        flippedTileIds: [],
        tiles: run.board.tiles.map((tile) =>
            tile.id === firstId || tile.id === secondId ? { ...tile, state: 'hidden' } : tile
        )
    };

    if (lives <= 0) {
        return finalizeLoss(run, board, 0, tries);
    }

    return {
        ...run,
        lives,
        board,
        stats: {
            ...run.stats,
            tries,
            mismatches: run.stats.mismatches + 1,
            currentLevelScore: calculateScore(tries),
            rating: calculateRating(tries)
        }
    };
};

export const advanceToNextLevel = (run: RunState): RunState => {
    if (!run.board) {
        return run;
    }

    const nextBoard = buildBoard(run.board.level + 1);

    return {
        ...run,
        status: 'playing',
        board: nextBoard,
        debugPeekActive: false,
        lastLevelResult: null,
        stats: {
            ...run.stats,
            tries: 0,
            currentLevelScore: calculateScore(0),
            rating: calculateRating(0),
            highestLevel: Math.max(run.stats.highestLevel, nextBoard.level)
        }
    };
};

export const pauseRun = (run: RunState): RunState => (run.status === 'playing' ? { ...run, status: 'paused' } : run);

export const resumeRun = (run: RunState): RunState => (run.status === 'paused' ? { ...run, status: 'playing' } : run);

export const enableDebugPeek = (run: RunState, disableAchievementsOnDebug: boolean): RunState => ({
    ...run,
    debugPeekActive: true,
    debugUsed: true,
    achievementsEnabled: disableAchievementsOnDebug ? false : run.achievementsEnabled
});

export const disableDebugPeek = (run: RunState): RunState =>
    run.debugPeekActive ? { ...run, debugPeekActive: false } : run;

export const createRunSummary = (run: RunState, unlockedAchievements: AchievementId[]): RunState => ({
    ...run,
    lastRunSummary: {
        totalScore: run.stats.totalScore,
        bestScore: run.stats.bestScore,
        levelsCleared: run.stats.levelsCleared,
        highestLevel: run.stats.highestLevel,
        achievementsEnabled: run.achievementsEnabled,
        unlockedAchievements
    }
});
