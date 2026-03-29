import {
    DEBUG_REVEAL_MS,
    INITIAL_LIVES,
    MATCH_DELAY_MS,
    MAX_LIVES,
    MEMORIZE_BASE_MS,
    MEMORIZE_MIN_MS,
    MEMORIZE_STEP_MS,
    type AchievementId,
    type BoardState,
    type LevelResult,
    type Rating,
    type ResumableRunStatus,
    type RunState,
    type SessionStats,
    type Tile
} from './contracts';

interface SymbolEntry {
    symbol: string;
    label: string;
}

const LETTER_SYMBOLS: SymbolEntry[] = [
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
].map((value) => ({ symbol: value, label: value }));

const NUMBER_SYMBOLS: SymbolEntry[] = Array.from({ length: 30 }, (_value, index) => {
    const next = String(index + 1).padStart(2, '0');
    return { symbol: next, label: next };
});

const CALLSIGN_SYMBOLS: SymbolEntry[] = [
    ['AL', 'Alder'],
    ['BR', 'Briar'],
    ['CR', 'Crown'],
    ['DK', 'Dusk'],
    ['EL', 'Ember'],
    ['FL', 'Flare'],
    ['GL', 'Gale'],
    ['HR', 'Harbor'],
    ['IV', 'Ivory'],
    ['JN', 'Juniper'],
    ['KT', 'Kestrel'],
    ['LN', 'Lantern'],
    ['MR', 'Meteor'],
    ['NV', 'Nova'],
    ['OR', 'Oracle'],
    ['PR', 'Prism'],
    ['QT', 'Quartz'],
    ['RV', 'Raven'],
    ['SL', 'Signal'],
    ['TR', 'Torrent'],
    ['UL', 'Umber'],
    ['VL', 'Velvet'],
    ['WR', 'Whisper'],
    ['XR', 'Xylo'],
    ['YS', 'Yonder'],
    ['ZT', 'Zephyr'],
    ['C1', 'Cipher'],
    ['D2', 'Drift'],
    ['E3', 'Echo'],
    ['F4', 'Fathom']
].map(([symbol, label]) => ({ symbol, label }));

const SYMBOL_SETS = [LETTER_SYMBOLS, NUMBER_SYMBOLS, CALLSIGN_SYMBOLS] as const;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const shuffle = <T>(items: T[]): T[] => {
    const next = [...items];

    for (let index = next.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    }

    return next;
};

const createTimerState = (overrides?: Partial<RunState['timerState']>): RunState['timerState'] => ({
    memorizeRemainingMs: null,
    resolveRemainingMs: null,
    debugRevealRemainingMs: null,
    pausedFromStatus: null,
    ...overrides
});

const getSymbolSetForLevel = (level: number): readonly SymbolEntry[] =>
    SYMBOL_SETS[Math.floor((level - 1) / 3) % SYMBOL_SETS.length];

export const getMemorizeDuration = (level: number): number =>
    Math.max(MEMORIZE_MIN_MS, MEMORIZE_BASE_MS - MEMORIZE_STEP_MS * Math.max(level - 1, 0));

export const calculateRating = (tries: number): Rating => {
    if (tries === 0) return 'S++';
    if (tries === 1) return 'S';
    if (tries === 2) return 'A';
    if (tries <= 4) return 'B';
    if (tries <= 6) return 'C';
    if (tries <= 8) return 'D';
    return 'F';
};

export const calculateMatchScore = (level: number, currentStreak: number): number =>
    20 + 5 * Math.max(level - 1, 0) + 10 * Math.max(currentStreak, 0);

export const calculateLevelClearBonus = (level: number): number => 50 * level;

export const calculatePerfectClearBonus = (): number => 25;

const createSessionStats = (bestScore: number): SessionStats => ({
    totalScore: 0,
    currentLevelScore: 0,
    bestScore,
    tries: 0,
    rating: calculateRating(0),
    levelsCleared: 0,
    matchesFound: 0,
    mismatches: 0,
    highestLevel: 1,
    currentStreak: 0,
    bestStreak: 0,
    perfectClears: 0
});

const createTiles = (level: number, pairCount: number): Tile[] => {
    const symbols = getSymbolSetForLevel(level).slice(0, pairCount);
    const pairs = symbols.flatMap((entry, index) => {
        const pairKey = `${level}-${index}`;
        return [
            { id: `${pairKey}-A`, pairKey, state: 'hidden' as const, symbol: entry.symbol, label: entry.label },
            { id: `${pairKey}-B`, pairKey, state: 'hidden' as const, symbol: entry.symbol, label: entry.label }
        ];
    });

    return shuffle(pairs);
};

export const buildBoard = (level: number): BoardState => {
    const pairCount = Math.min(level + 1, LETTER_SYMBOLS.length);
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
    status: 'memorize',
    lives: INITIAL_LIVES,
    board: buildBoard(1),
    stats: createSessionStats(bestScore),
    achievementsEnabled: true,
    debugUsed: false,
    debugPeekActive: false,
    timerState: createTimerState({ memorizeRemainingMs: getMemorizeDuration(1) }),
    lastLevelResult: null,
    lastRunSummary: null
});

export const finishMemorizePhase = (run: RunState): RunState =>
    run.status !== 'memorize'
        ? run
        : {
              ...run,
              status: 'playing',
              timerState: {
                  ...run.timerState,
                  memorizeRemainingMs: null,
                  pausedFromStatus: null
              }
          };

export const flipTile = (run: RunState, tileId: string): RunState => {
    if (run.status !== 'playing' || !run.board || run.board.flippedTileIds.length >= 2) {
        return run;
    }

    const tile = run.board.tiles.find((candidate) => candidate.id === tileId);

    if (!tile || tile.state !== 'hidden') {
        return run;
    }

    const flippedTileIds = [...run.board.flippedTileIds, tileId];
    const firstFlippedId = run.board.flippedTileIds[0] ?? null;
    const firstFlippedTile = firstFlippedId ? run.board.tiles.find((candidate) => candidate.id === firstFlippedId) ?? null : null;
    const resolvesMatchImmediately =
        flippedTileIds.length === 2 && firstFlippedTile !== null && firstFlippedTile.pairKey === tile.pairKey;

    return {
        ...run,
        status: flippedTileIds.length === 2 ? 'resolving' : 'playing',
        board: {
            ...run.board,
            tiles: run.board.tiles.map((candidate) =>
                candidate.id === tileId ? { ...candidate, state: 'flipped' } : candidate
            ),
            flippedTileIds
        },
        timerState: {
            ...run.timerState,
            resolveRemainingMs: flippedTileIds.length === 2 ? (resolvesMatchImmediately ? 0 : MATCH_DELAY_MS) : run.timerState.resolveRemainingMs,
            pausedFromStatus: null
        }
    };
};

const finalizeLevel = (run: RunState, board: BoardState): RunState => {
    const perfect = run.stats.tries === 0;
    const levelBonus = calculateLevelClearBonus(board.level);
    const perfectBonus = perfect ? calculatePerfectClearBonus() : 0;
    const scoreGained = run.stats.currentLevelScore + levelBonus + perfectBonus;
    const totalScore = run.stats.totalScore + levelBonus + perfectBonus;
    const bestScore = Math.max(run.stats.bestScore, totalScore);
    const rating = calculateRating(run.stats.tries);
    const lives = perfect ? Math.min(MAX_LIVES, run.lives + 1) : run.lives;
    const lastLevelResult: LevelResult = {
        level: board.level,
        scoreGained,
        rating,
        livesRemaining: lives,
        perfect,
        mistakes: run.stats.tries
    };

    return {
        ...run,
        status: 'levelComplete',
        lives,
        board,
        stats: {
            ...run.stats,
            totalScore,
            bestScore,
            currentLevelScore: scoreGained,
            rating,
            levelsCleared: run.stats.levelsCleared + 1,
            highestLevel: Math.max(run.stats.highestLevel, board.level),
            perfectClears: perfect ? run.stats.perfectClears + 1 : run.stats.perfectClears
        },
        timerState: {
            ...run.timerState,
            resolveRemainingMs: null,
            pausedFromStatus: null
        },
        lastLevelResult
    };
};

const clearResolveState = (run: RunState): RunState['timerState'] => ({
    ...run.timerState,
    resolveRemainingMs: null,
    pausedFromStatus: null
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
        const currentStreak = run.stats.currentStreak + 1;
        const matchScore = calculateMatchScore(board.level, currentStreak);
        const totalScore = run.stats.totalScore + matchScore;
        const currentLevelScore = run.stats.currentLevelScore + matchScore;
        const bestScore = Math.max(run.stats.bestScore, totalScore);

        const nextRun: RunState = {
            ...run,
            status: 'playing',
            board,
            stats: {
                ...run.stats,
                totalScore,
                currentLevelScore,
                bestScore,
                matchesFound: run.stats.matchesFound + 1,
                currentStreak,
                bestStreak: Math.max(run.stats.bestStreak, currentStreak),
                highestLevel: Math.max(run.stats.highestLevel, board.level)
            },
            timerState: clearResolveState(run)
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
    const status = lives <= 0 ? 'gameOver' : 'playing';

    return {
        ...run,
        status,
        lives: Math.max(lives, 0),
        board,
        stats: {
            ...run.stats,
            tries,
            mismatches: run.stats.mismatches + 1,
            currentStreak: 0,
            rating: calculateRating(tries),
            highestLevel: Math.max(run.stats.highestLevel, board.level)
        },
        timerState: clearResolveState(run)
    };
};

export const advanceToNextLevel = (run: RunState): RunState => {
    if (!run.board) {
        return run;
    }

    const nextBoard = buildBoard(run.board.level + 1);

    return {
        ...run,
        status: 'memorize',
        board: nextBoard,
        debugPeekActive: false,
        timerState: createTimerState({ memorizeRemainingMs: getMemorizeDuration(nextBoard.level) }),
        lastLevelResult: null,
        stats: {
            ...run.stats,
            tries: 0,
            currentLevelScore: 0,
            rating: calculateRating(0),
            highestLevel: Math.max(run.stats.highestLevel, nextBoard.level),
            currentStreak: 0
        }
    };
};

const isResumableStatus = (status: RunState['status']): status is ResumableRunStatus =>
    status === 'memorize' || status === 'playing' || status === 'resolving';

export const pauseRun = (run: RunState): RunState => {
    if (!isResumableStatus(run.status)) {
        return run;
    }

    return {
        ...run,
        status: 'paused',
        timerState: {
            ...run.timerState,
            pausedFromStatus: run.status
        }
    };
};

export const resumeRun = (run: RunState): RunState => {
    if (run.status !== 'paused' || !run.timerState.pausedFromStatus) {
        return run;
    }

    return {
        ...run,
        status: run.timerState.pausedFromStatus,
        timerState: {
            ...run.timerState,
            pausedFromStatus: null
        }
    };
};

export const enableDebugPeek = (run: RunState, disableAchievementsOnDebug: boolean): RunState => ({
    ...run,
    debugPeekActive: true,
    debugUsed: true,
    achievementsEnabled: disableAchievementsOnDebug ? false : run.achievementsEnabled,
    timerState: {
        ...run.timerState,
        debugRevealRemainingMs: DEBUG_REVEAL_MS
    }
});

export const disableDebugPeek = (run: RunState): RunState =>
    run.debugPeekActive
        ? {
              ...run,
              debugPeekActive: false,
              timerState: {
                  ...run.timerState,
                  debugRevealRemainingMs: null
              }
          }
        : run;

export const createRunSummary = (run: RunState, unlockedAchievements: AchievementId[]): RunState => ({
    ...run,
    lastRunSummary: {
        totalScore: run.stats.totalScore,
        bestScore: run.stats.bestScore,
        levelsCleared: run.stats.levelsCleared,
        highestLevel: run.stats.highestLevel,
        achievementsEnabled: run.achievementsEnabled,
        unlockedAchievements,
        bestStreak: run.stats.bestStreak,
        perfectClears: run.stats.perfectClears
    }
});
