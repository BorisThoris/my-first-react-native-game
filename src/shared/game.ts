import {
    BOSS_FLOOR_SCORE_MULTIPLIER,
    CHAIN_HEAL_STREAK_STEP,
    COMBO_GUARD_STREAK_STEP,
    CURSED_LAST_BONUS_SCORE,
    DEBUG_REVEAL_MS,
    FINDABLE_MATCH_COMBO_SHARDS,
    FINDABLE_MATCH_SCORE,
    FLIP_PAR_BONUS_SCORE,
    GAME_RULES_VERSION,
    SHIFTING_BOUNTY_MATCH_BONUS,
    SHIFTING_WARD_MATCH_PENALTY,
    GLASS_WITNESS_BONUS_SCORE,
    INITIAL_LIVES,
    INITIAL_REGION_SHUFFLE_CHARGES,
    INITIAL_SHUFFLE_CHARGES,
    MATCH_DELAY_MS,
    MAX_COMBO_SHARDS,
    MAX_DESTROY_PAIR_BANK,
    MAX_GUARD_TOKENS,
    MAX_LIVES,
    MAX_PENDING_MEMORIZE_BONUS_MS,
    MAX_PINNED_TILES,
    MEMORIZE_BASE_MS,
    MEMORIZE_BONUS_PER_LIFE_LOST_MS,
    MEMORIZE_DECAY_EVERY_N_LEVELS,
    MEMORIZE_MIN_MS,
    MEMORIZE_STEP_MS,
    SCHOLAR_STYLE_FLOOR_BONUS_SCORE,
    type AchievementId,
    type BoardState,
    type FindableKind,
    type ClearLifeReason,
    type FloorTag,
    type GameMode,
    type LevelResult,
    type MutatorId,
    type Rating,
    type RelicId,
    type ResumableRunStatus,
    type RunState,
    type RunStatus,
    type SessionStats,
    type Tile,
    type WeakerShuffleMode
} from './contracts';
import {
    FLOOR_SCHEDULE_RULES_VERSION,
    pickFloorScheduleEntry,
    usesEndlessFloorSchedule
} from './floor-mutator-schedule';
import { DAILY_MUTATOR_TABLE, hasMutator } from './mutators';
import { needsRelicPick, RELIC_MILESTONE_FLOORS, rollRelicOptions } from './relics';
import type { RunExportPayload } from './run-export';
import {
    createMulberry32,
    deriveDailyMutatorIndex,
    deriveDailyRunSeed,
    deriveLevelTileRngSeed,
    deriveShuffleRngSeed,
    formatDailyDateKeyUtc,
    hashStringToSeed,
    shuffleWithRng
} from './rng';
import {
    LETTER_SYMBOLS,
    NUMBER_SYMBOLS,
    getSymbolSetForLevel as getSymbolSetForLevelFromCatalog
} from './tile-symbol-catalog';

type SymbolEntry = { symbol: string; label: string };
const COMBO_SHARD_STREAK_STEP = 2;
const COMBO_SHARDS_PER_LIFE = 3;
const DECOY_PAIR_KEY = '__decoy__';
export const WILD_PAIR_KEY = '__wild__';
const PICKUP_BASELINE_RULES_VERSION = 8;

export const boardHasGlassDecoy = (board: BoardState): boolean =>
    board.tiles.some((t) => t.pairKey === DECOY_PAIR_KEY);

const pickCursedPairKey = (
    tiles: Tile[],
    runSeed: number,
    rulesVersion: number,
    level: number
): string | null => {
    const realKeys = [
        ...new Set(
            tiles
                .map((t) => t.pairKey)
                .filter((k) => k !== DECOY_PAIR_KEY && k !== WILD_PAIR_KEY)
        )
    ];
    if (realKeys.length < 2) {
        return null;
    }
    const rng = createMulberry32(hashStringToSeed(`cursed:${rulesVersion}:${runSeed}:${level}`));
    return realKeys[Math.floor(rng() * realKeys.length)]!;
};

const flipParLimit = (pairCount: number): number => Math.ceil(pairCount * 1.25) + 2;
const ECHO_EXTRA_RESOLVE_MS = 380;
const SHUFFLE_SCORE_TAX_FACTOR = 0.94;
const ENCORE_BONUS_SCORE = 18;
const GAMBIT_FAIL_EXTRA_TRIES = 1;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/** Flat penalty per successful match for mutators that are also expressed in the renderer (rules integrity). */
const PRESENTATION_MUTATOR_PENALTY_WIDE_RECALL = 3;
const PRESENTATION_MUTATOR_PENALTY_SILHOUETTE = 3;
const PRESENTATION_MUTATOR_PENALTY_DISTRACTION = 2;

export const getPresentationMutatorMatchPenalty = (run: RunState): number => {
    let penalty = 0;
    if (hasMutator(run, 'wide_recall')) {
        penalty += PRESENTATION_MUTATOR_PENALTY_WIDE_RECALL;
    }
    if (hasMutator(run, 'silhouette_twist')) {
        penalty += PRESENTATION_MUTATOR_PENALTY_SILHOUETTE;
    }
    if (hasMutator(run, 'distraction_channel')) {
        penalty += PRESENTATION_MUTATOR_PENALTY_DISTRACTION;
    }
    return penalty;
};

const createTimerState = (overrides?: Partial<RunState['timerState']>): RunState['timerState'] => ({
    memorizeRemainingMs: null,
    resolveRemainingMs: null,
    debugRevealRemainingMs: null,
    pausedFromStatus: null,
    ...overrides
});

const getSymbolSetForLevel = (level: number): readonly SymbolEntry[] => getSymbolSetForLevelFromCatalog(level);

export const getMemorizeDuration = (level: number): number => {
    const decaySteps = Math.floor(Math.max(level - 1, 0) / MEMORIZE_DECAY_EVERY_N_LEVELS);
    return Math.max(MEMORIZE_MIN_MS, MEMORIZE_BASE_MS - MEMORIZE_STEP_MS * decaySteps);
};

export const getMemorizeDurationForRun = (run: RunState, level: number): number => {
    let ms = getMemorizeDuration(level);
    if (hasMutator(run, 'short_memorize')) {
        ms = Math.max(MEMORIZE_MIN_MS, ms - 350);
    }
    if (run.relicIds.includes('memorize_bonus_ms')) {
        ms += 280;
    }
    if (run.relicIds.includes('memorize_under_short_memorize') && hasMutator(run, 'short_memorize')) {
        ms += 220;
    }
    if (run.gameMode === 'meditation') {
        ms = Math.floor(ms * 1.55);
    }
    return ms;
};

export const calculateRating = (tries: number): Rating => {
    if (tries === 0) return 'S++';
    if (tries === 1) return 'S';
    if (tries === 2) return 'A';
    if (tries <= 4) return 'B';
    if (tries <= 6) return 'C';
    if (tries <= 8) return 'D';
    return 'F';
};

export const calculateMatchScore = (
    level: number,
    currentStreak: number,
    multiplier: number = 1
): number =>
    Math.floor((20 + 5 * Math.max(level - 1, 0) + 10 * Math.max(currentStreak, 0)) * multiplier);

const isWildPairKey = (pairKey: string): boolean => pairKey === WILD_PAIR_KEY;

/** Exported for UI resolving highlights (gambit 3-flip) — keep in sync with `resolveGambitThree`. */
export const tilesArePairMatch = (a: Tile, b: Tile): boolean => {
    if (a.pairKey === b.pairKey && a.pairKey !== DECOY_PAIR_KEY) {
        return true;
    }
    if (a.pairKey === DECOY_PAIR_KEY || b.pairKey === DECOY_PAIR_KEY) {
        return false;
    }
    if (isWildPairKey(a.pairKey) && !isWildPairKey(b.pairKey)) {
        return true;
    }
    if (isWildPairKey(b.pairKey) && !isWildPairKey(a.pairKey)) {
        return true;
    }
    return false;
};

const atomicVariantForPairKey = (pairKey: string): number => {
    let h = 0;
    for (let i = 0; i < pairKey.length; i++) {
        h = (h * 31 + pairKey.charCodeAt(i)) | 0;
    }
    return Math.abs(h) % 8;
};

/** Effective delay after two tiles are flipped (0 if immediate match). */
export const computeFlipResolveDelayMs = (
    run: RunState,
    flippedTileIds: string[],
    opts: { resolveDelayMultiplier: number; echoFeedbackEnabled: boolean }
): number => {
    if (flippedTileIds.length !== 2 || !run.board) {
        return 0;
    }
    const [firstId, secondId] = flippedTileIds;
    const firstTile = run.board.tiles.find((t) => t.id === firstId);
    const secondTile = run.board.tiles.find((t) => t.id === secondId);
    if (!firstTile || !secondTile) {
        return 0;
    }
    if (tilesArePairMatch(firstTile, secondTile)) {
        return 0;
    }
    let ms = MATCH_DELAY_MS * opts.resolveDelayMultiplier;
    if (opts.echoFeedbackEnabled) {
        ms += ECHO_EXTRA_RESOLVE_MS;
    }
    return ms;
};

export const calculateLevelClearBonus = (level: number): number => 50 * level;

export const calculatePerfectClearBonus = (): number => 25;

const getClearLifeReason = (tries: number): ClearLifeReason => {
    if (tries === 0) return 'perfect';
    if (tries === 1) return 'clean';
    return 'none';
};

const applyComboShardGain = (
    comboShards: number,
    lives: number,
    shardGain: number,
    allowLifeGain: boolean = true
): { comboShards: number; lifeGain: number } => {
    if (shardGain <= 0) {
        return { comboShards, lifeGain: 0 };
    }

    const nextComboShards = comboShards + shardGain;

    if (allowLifeGain && lives < MAX_LIVES && nextComboShards >= COMBO_SHARDS_PER_LIFE) {
        return {
            comboShards: nextComboShards - COMBO_SHARDS_PER_LIFE,
            lifeGain: 1
        };
    }

    return {
        comboShards: Math.min(MAX_COMBO_SHARDS, nextComboShards),
        lifeGain: 0
    };
};

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
    perfectClears: 0,
    guardTokens: 0,
    comboShards: 0,
    shufflesUsed: 0,
    pairsDestroyed: 0
});

export interface BuildBoardOptions {
    runSeed?: number;
    runRulesVersion?: number;
    activeMutators?: MutatorId[];
    /** Puzzle mode: skip RNG; copy these tiles as-is. */
    fixedTiles?: Tile[] | null;
    /** H4: include one wild tile that pairs with any real symbol. */
    includeWildTile?: boolean;
    floorTag?: FloorTag;
}

const createTiles = (
    level: number,
    pairCount: number,
    runSeed: number,
    rulesVersion: number,
    mutators: MutatorId[],
    includeWildTile?: boolean
): Tile[] => {
    const rng = createMulberry32(deriveLevelTileRngSeed(runSeed, level, rulesVersion));
    const symbolSource = mutators.includes('category_letters') ? LETTER_SYMBOLS : getSymbolSetForLevel(level);
    const symbols = symbolSource.slice(0, pairCount);
    const pairs: Tile[] = symbols.flatMap((entry, index) => {
        const pairKey = `${level}-${index}`;
        const atomicVariant = atomicVariantForPairKey(pairKey);
        return [
            {
                id: `${pairKey}-A`,
                pairKey,
                state: 'hidden' as const,
                symbol: entry.symbol,
                label: entry.label,
                atomicVariant
            },
            {
                id: `${pairKey}-B`,
                pairKey,
                state: 'hidden' as const,
                symbol: entry.symbol,
                label: entry.label,
                atomicVariant
            }
        ];
    });

    if (mutators.includes('glass_floor')) {
        pairs.push({
            id: `${level}-decoy`,
            pairKey: DECOY_PAIR_KEY,
            state: 'hidden' as const,
            symbol: 'X',
            label: 'Decoy',
            atomicVariant: 0
        });
    }

    if (includeWildTile) {
        pairs.push({
            id: `${level}-wild`,
            pairKey: WILD_PAIR_KEY,
            state: 'hidden' as const,
            symbol: '★',
            label: 'Wild',
            atomicVariant: 0
        });
    }

    return shuffleWithRng(() => rng(), pairs);
};

const countFindablePairs = (tiles: readonly Tile[]): number =>
    new Set(tiles.filter((tile) => tile.findableKind != null).map((tile) => tile.pairKey)).size;

const assignFindableKindsToTiles = (
    tiles: Tile[],
    mutators: MutatorId[],
    runSeed: number,
    rulesVersion: number,
    level: number
): Tile[] => {
    const eligibleKeys = [
        ...new Set(
            tiles
                .map((t) => t.pairKey)
                .filter((k) => k !== DECOY_PAIR_KEY && k !== WILD_PAIR_KEY)
        )
    ];
    if (eligibleKeys.length === 0) {
        return tiles;
    }
    const legacyFindables = rulesVersion < PICKUP_BASELINE_RULES_VERSION;
    if (legacyFindables && !mutators.includes('findables_floor')) {
        return tiles;
    }
    const rng = createMulberry32(hashStringToSeed(`findables:${rulesVersion}:${runSeed}:${level}`));
    let pairCountTarget = 0;
    if (legacyFindables) {
        const roll = rng();
        pairCountTarget = roll < 0.2 ? 0 : roll < 0.7 ? 1 : 2;
    } else if (mutators.includes('findables_floor')) {
        pairCountTarget = 2;
    } else if (level <= 3) {
        pairCountTarget = 1;
    } else {
        pairCountTarget = rng() < 0.5 ? 1 : 2;
    }
    const n = Math.min(pairCountTarget, eligibleKeys.length);
    if (n === 0) {
        return tiles;
    }
    const keys = [...eligibleKeys];
    for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const tmp = keys[i]!;
        keys[i] = keys[j]!;
        keys[j] = tmp;
    }
    const picked = keys.slice(0, n);
    const kindByKey = new Map<string, FindableKind>();
    for (const key of picked) {
        kindByKey.set(key, rng() < 0.5 ? 'shard_spark' : 'score_glint');
    }
    return tiles.map((t) => {
        const kind = kindByKey.get(t.pairKey);
        return kind ? { ...t, findableKind: kind } : t;
    });
};

/** Remaining real pairs that can still be matched (not both matched; no removed tile in pair). */
const eligibleSpotlightPairKeys = (board: BoardState): string[] => {
    const groups = new Map<string, Tile[]>();
    for (const t of board.tiles) {
        if (t.pairKey === DECOY_PAIR_KEY || t.pairKey === WILD_PAIR_KEY) {
            continue;
        }
        const list = groups.get(t.pairKey) ?? [];
        list.push(t);
        groups.set(t.pairKey, list);
    }
    const keys: string[] = [];
    for (const [key, tiles] of groups) {
        if (tiles.some((x) => x.state === 'removed')) {
            continue;
        }
        if (tiles.every((x) => x.state === 'matched')) {
            continue;
        }
        keys.push(key);
    }
    return keys;
};

const pickShiftingSpotlightKeys = (
    board: BoardState,
    runSeed: number,
    rulesVersion: number,
    level: number,
    step: 'init' | number
): { wardPairKey: string | null; bountyPairKey: string | null } => {
    const keys = eligibleSpotlightPairKeys(board);
    if (keys.length === 0) {
        return { wardPairKey: null, bountyPairKey: null };
    }
    const stepTag = step === 'init' ? 'init' : String(step);
    const rng = createMulberry32(
        hashStringToSeed(`shiftSpotlight:${rulesVersion}:${runSeed}:${level}:${stepTag}`)
    );
    const shuffled = [...keys];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const tmp = shuffled[i]!;
        shuffled[i] = shuffled[j]!;
        shuffled[j] = tmp;
    }
    if (shuffled.length === 1) {
        return { wardPairKey: null, bountyPairKey: shuffled[0]! };
    }
    return { wardPairKey: shuffled[0]!, bountyPairKey: shuffled[1]! };
};

const shiftingSpotlightMatchDelta = (board: BoardState | undefined, matchedPairKey: string): number => {
    if (!board) {
        return 0;
    }
    let d = 0;
    if (board.bountyPairKey === matchedPairKey) {
        d += SHIFTING_BOUNTY_MATCH_BONUS;
    }
    if (board.wardPairKey === matchedPairKey) {
        d -= SHIFTING_WARD_MATCH_PENALTY;
    }
    return d;
};

const withRotatedShiftingSpotlight = (
    run: RunState,
    board: BoardState
): { board: BoardState; shiftingSpotlightNonce: number } => {
    const nonceBase = run.shiftingSpotlightNonce ?? 0;
    if (!hasMutator(run, 'shifting_spotlight')) {
        return { board, shiftingSpotlightNonce: nonceBase };
    }
    if (isBoardComplete(board)) {
        return { board, shiftingSpotlightNonce: nonceBase };
    }
    const nextNonce = nonceBase + 1;
    const { wardPairKey, bountyPairKey } = pickShiftingSpotlightKeys(
        board,
        run.runSeed,
        run.runRulesVersion,
        board.level,
        nextNonce
    );
    return {
        board: { ...board, wardPairKey, bountyPairKey },
        shiftingSpotlightNonce: nextNonce
    };
};

export const buildBoard = (level: number, options: BuildBoardOptions = {}): BoardState => {
    const runSeed = options.runSeed ?? 0;
    const rulesVersion = options.runRulesVersion ?? GAME_RULES_VERSION;
    const mutators = options.activeMutators ?? [];

    if (options.fixedTiles && options.fixedTiles.length > 0) {
        const tiles = options.fixedTiles.map((t) => ({ ...t }));
        const tileCount = tiles.length;
        const columns = clamp(Math.ceil(Math.sqrt(tileCount)), 2, 8);
        const rows = Math.ceil(tileCount / columns);
        const realPairKeys = new Set(tiles.map((t) => t.pairKey).filter((k) => k !== DECOY_PAIR_KEY));

        return {
            level,
            pairCount: realPairKeys.size,
            columns,
            rows,
            tiles,
            flippedTileIds: [],
            matchedPairs: 0,
            floorTag: options.floorTag ?? 'normal',
            cursedPairKey: null,
            wardPairKey: null,
            bountyPairKey: null
        };
    }

    const pairCount = Math.min(level + 1, NUMBER_SYMBOLS.length);
    const tiles = assignFindableKindsToTiles(
        createTiles(level, pairCount, runSeed, rulesVersion, mutators, options.includeWildTile),
        mutators,
        runSeed,
        rulesVersion,
        level
    );
    const tileCount = tiles.length;
    const columns = clamp(Math.ceil(Math.sqrt(tileCount)), 2, 8);
    const rows = Math.ceil(tileCount / columns);
    const cursedPairKey = pickCursedPairKey(tiles, runSeed, rulesVersion, level);
    const baseBoard: BoardState = {
        level,
        pairCount,
        columns,
        rows,
        tiles,
        flippedTileIds: [],
        matchedPairs: 0,
        floorTag: options.floorTag ?? 'normal',
        cursedPairKey
    };
    if (!mutators.includes('shifting_spotlight')) {
        return { ...baseBoard, wardPairKey: null, bountyPairKey: null };
    }
    const { wardPairKey, bountyPairKey } = pickShiftingSpotlightKeys(
        baseBoard,
        runSeed,
        rulesVersion,
        level,
        'init'
    );
    return { ...baseBoard, wardPairKey, bountyPairKey };
};

/**
 * Floor is complete when every tile is matched or removed.
 * **Glass decoy** (`DECOY_PAIR_KEY`): singleton decoy trap — it never pairs; intent is to clear all **real** tiles
 * and leave the decoy face-down for the glass-witness bonus. Completion when every **non-decoy** tile is
 * matched or removed and the decoy (if present) is still **hidden** (unflipped).
 */
export const isBoardComplete = (board: BoardState): boolean =>
    board.tiles.every((t) => {
        if (t.state === 'matched' || t.state === 'removed') {
            return true;
        }
        if (t.pairKey === DECOY_PAIR_KEY && t.state === 'hidden') {
            return board.tiles
                .filter((x) => x.pairKey !== DECOY_PAIR_KEY)
                .every((x) => x.state === 'matched' || x.state === 'removed');
        }
        return false;
    });

/** Pairs where both tiles are still hidden (eligible for shuffle / destroy targeting). */
export const countFullyHiddenPairs = (board: BoardState): number => {
    const hiddenCountByKey = new Map<string, number>();

    for (const tile of board.tiles) {
        if (tile.state === 'hidden') {
            hiddenCountByKey.set(tile.pairKey, (hiddenCountByKey.get(tile.pairKey) ?? 0) + 1);
        }
    }
    // removed tiles do not contribute

    let fullPairs = 0;
    for (const count of hiddenCountByKey.values()) {
        if (count >= 2) {
            fullPairs += 1;
        }
    }

    return fullPairs;
};

export const canShuffleBoard = (run: RunState): boolean =>
    run.status === 'playing' &&
    Boolean(run.board) &&
    run.board!.flippedTileIds.length === 0 &&
    !run.activeContract?.noShuffle &&
    (run.shuffleCharges > 0 ||
        (run.freeShuffleThisFloor && run.relicIds.includes('first_shuffle_free_per_floor'))) &&
    countFullyHiddenPairs(run.board!) >= 2;

export const canDestroyPair = (run: RunState, tileId: string): boolean => {
    if (run.status !== 'playing' || !run.board || run.board.flippedTileIds.length !== 0 || run.destroyPairCharges <= 0) {
        return false;
    }

    const tile = run.board.tiles.find((t) => t.id === tileId);
    if (!tile || tile.state !== 'hidden' || tile.pairKey === DECOY_PAIR_KEY) {
        return false;
    }

    const pairTiles = run.board.tiles.filter((t) => t.pairKey === tile.pairKey);
    return pairTiles.length === 2 && pairTiles.every((t) => t.state === 'hidden');
};

export const applyShuffle = (run: RunState): RunState => {
    if (!canShuffleBoard(run) || !run.board) {
        return run;
    }

    const hiddenIndices: number[] = [];
    run.board.tiles.forEach((tile, index) => {
        if (tile.state === 'hidden') {
            hiddenIndices.push(index);
        }
    });

    const shuffleRng = createMulberry32(
        deriveShuffleRngSeed(run.runSeed, run.board.level, run.shuffleNonce, run.runRulesVersion)
    );
    const cols = run.board.columns;
    const nextTiles = [...run.board.tiles];

    if (run.weakerShuffleMode === 'rows_only') {
        const rowToIndices = new Map<number, number[]>();
        for (const index of hiddenIndices) {
            const row = Math.floor(index / cols);
            const list = rowToIndices.get(row) ?? [];
            list.push(index);
            rowToIndices.set(row, list);
        }
        for (const indices of rowToIndices.values()) {
            const chunk = indices.map((i) => nextTiles[i]!);
            const shuffledChunk = shuffleWithRng(() => shuffleRng(), chunk);
            indices.forEach((cellIdx, slot) => {
                nextTiles[cellIdx] = shuffledChunk[slot]!;
            });
        }
    } else {
        const hiddenTiles = hiddenIndices.map((index) => run.board!.tiles[index]);
        const shuffled = shuffleWithRng(() => shuffleRng(), hiddenTiles);
        hiddenIndices.forEach((index, slot) => {
            nextTiles[index] = shuffled[slot]!;
        });
    }

    let nextCharges = run.shuffleCharges;
    let nextFree = run.freeShuffleThisFloor;
    if (nextFree && run.relicIds.includes('first_shuffle_free_per_floor')) {
        nextFree = false;
    } else if (nextCharges > 0) {
        nextCharges -= 1;
    }

    let matchScoreMultiplier = run.matchScoreMultiplier;
    if (run.shuffleScoreTaxActive) {
        matchScoreMultiplier *= SHUFFLE_SCORE_TAX_FACTOR;
    }

    return {
        ...run,
        powersUsedThisRun: true,
        shuffleUsedThisFloor: true,
        shuffleCharges: nextCharges,
        shuffleNonce: run.shuffleNonce + 1,
        freeShuffleThisFloor: nextFree,
        matchScoreMultiplier,
        pinnedTileIds: [],
        board: {
            ...run.board,
            tiles: nextTiles
        },
        stats: {
            ...run.stats,
            shufflesUsed: run.stats.shufflesUsed + 1
        }
    };
};

export const canRegionShuffle = (run: RunState): boolean =>
    run.status === 'playing' &&
    Boolean(run.board) &&
    run.board!.flippedTileIds.length === 0 &&
    !run.activeContract?.noShuffle &&
    (run.regionShuffleCharges > 0 ||
        (run.regionShuffleFreeThisFloor && run.relicIds.includes('region_shuffle_free_first'))) &&
    countFullyHiddenPairs(run.board!) >= 1;

/** Row shuffle needs at least two hidden tiles in that row. */
export const canRegionShuffleRow = (run: RunState, rowIndex: number): boolean => {
    if (!canRegionShuffle(run) || !run.board) {
        return false;
    }
    const cols = run.board.columns;
    let hidden = 0;
    run.board.tiles.forEach((tile, index) => {
        if (tile.state === 'hidden' && Math.floor(index / cols) === rowIndex) {
            hidden += 1;
        }
    });
    return hidden >= 2;
};

export const armRegionShuffleRow = (run: RunState, row: number | null): RunState =>
    run.status === 'playing' && run.board ? { ...run, regionShuffleRowArmed: row } : run;

export const applyRegionShuffle = (run: RunState, rowIndex: number): RunState => {
    if (!canRegionShuffle(run) || !run.board) {
        return run;
    }
    const cols = run.board.columns;
    const hiddenInRow: number[] = [];
    run.board.tiles.forEach((tile, index) => {
        if (tile.state === 'hidden' && Math.floor(index / cols) === rowIndex) {
            hiddenInRow.push(index);
        }
    });
    if (hiddenInRow.length < 2) {
        return run;
    }

    let nextFree = run.regionShuffleFreeThisFloor;
    let nextCharges = run.regionShuffleCharges;
    if (nextFree && run.relicIds.includes('region_shuffle_free_first')) {
        nextFree = false;
    } else if (nextCharges > 0) {
        nextCharges -= 1;
    } else {
        return run;
    }

    const shuffleRng = createMulberry32(
        deriveShuffleRngSeed(run.runSeed, run.board.level, run.shuffleNonce, run.runRulesVersion)
    );
    const nextTiles = [...run.board.tiles];
    const chunk = hiddenInRow.map((i) => nextTiles[i]!);
    const shuffledChunk = shuffleWithRng(() => shuffleRng(), chunk);
    hiddenInRow.forEach((cellIdx, slot) => {
        nextTiles[cellIdx] = shuffledChunk[slot]!;
    });

    return {
        ...run,
        powersUsedThisRun: true,
        shuffleUsedThisFloor: true,
        shuffleNonce: run.shuffleNonce + 1,
        regionShuffleCharges: nextCharges,
        regionShuffleFreeThisFloor: nextFree,
        regionShuffleRowArmed: null,
        pinnedTileIds: [],
        board: {
            ...run.board,
            tiles: nextTiles
        },
        stats: {
            ...run.stats,
            shufflesUsed: run.stats.shufflesUsed + 1
        }
    };
};

export const applyFlashPair = (run: RunState): RunState => {
    if (run.status !== 'playing' || !run.board || run.flashPairCharges < 1) {
        return run;
    }
    if (!run.practiceMode && !run.wildMenuRun) {
        return run;
    }
    if (run.board.flippedTileIds.length > 0) {
        return run;
    }
    const hiddenByKey = new Map<string, string[]>();
    for (const t of run.board.tiles) {
        if (t.state !== 'hidden' || t.pairKey === DECOY_PAIR_KEY) {
            continue;
        }
        const list = hiddenByKey.get(t.pairKey) ?? [];
        list.push(t.id);
        hiddenByKey.set(t.pairKey, list);
    }
    const complete = [...hiddenByKey.values()].filter((ids) => ids.length >= 2);
    if (complete.length === 0) {
        return run;
    }
    const rng = createMulberry32(
        hashStringToSeed(`flashPair:${run.runRulesVersion}:${run.runSeed}:${run.board.level}:${run.shuffleNonce}`)
    );
    const picked = complete[Math.floor(rng() * complete.length)]!;
    const pairIds = picked.slice(0, 2);
    return {
        ...run,
        flashPairCharges: run.flashPairCharges - 1,
        powersUsedThisRun: true,
        shuffleNonce: run.shuffleNonce + 1,
        flashPairRevealedTileIds: pairIds
    };
};

export const togglePinnedTile = (run: RunState, tileId: string): RunState => {
    if (run.status !== 'playing' || !run.board) {
        return run;
    }

    const tile = run.board.tiles.find((t) => t.id === tileId);
    if (!tile || tile.state !== 'hidden') {
        return run;
    }

    const isPinned = run.pinnedTileIds.includes(tileId);
    let pinnedTileIds: string[];

    if (isPinned) {
        pinnedTileIds = run.pinnedTileIds.filter((id) => id !== tileId);
    } else if (run.pinnedTileIds.length < MAX_PINNED_TILES) {
        const cap = run.activeContract?.maxPinsTotalRun;
        if (cap != null && run.pinsPlacedCountThisRun >= cap) {
            return run;
        }
        pinnedTileIds = [...run.pinnedTileIds, tileId];
        return {
            ...run,
            pinnedTileIds,
            pinsPlacedCountThisRun: run.pinsPlacedCountThisRun + 1
        };
    } else {
        return run;
    }

    return {
        ...run,
        pinnedTileIds
    };
};

export interface CreateRunOptions {
    runSeed?: number;
    gameMode?: GameMode;
    activeMutators?: MutatorId[];
    practiceMode?: boolean;
    activeContract?: RunState['activeContract'];
    dailyDateKeyUtc?: string | null;
    puzzleId?: string | null;
    gauntletDurationMs?: number | null;
    fixedBoard?: BoardState | null;
    initialRelicIds?: RelicId[];
    /** Import / debug: use historical rules version for same tile order. */
    runRulesVersionOverride?: number;
    /** H4: add wild tile to generated boards. */
    enableWildJoker?: boolean;
    weakerShuffleMode?: WeakerShuffleMode;
    shuffleScoreTaxActive?: boolean;
    /** Hook powers: defaults on if undefined. */
    enablePeek?: boolean;
    initialStrayRemoveCharges?: number;
    resolveDelayMultiplier?: number;
    echoFeedbackEnabled?: boolean;
    wildMenuRun?: boolean;
}

const randomRunSeed = (): number => Math.floor(Math.random() * 0x7fffffff);

const applyRelicImmediate = (run: RunState, relicId: RelicId): RunState => {
    switch (relicId) {
        case 'extra_shuffle_charge':
            return { ...run, shuffleCharges: run.shuffleCharges + 1 };
        case 'destroy_bank_plus_one':
            return {
                ...run,
                destroyPairCharges: Math.min(MAX_DESTROY_PAIR_BANK, run.destroyPairCharges + 1)
            };
        case 'first_shuffle_free_per_floor':
            return { ...run, freeShuffleThisFloor: true };
        case 'combo_shard_plus_step':
            return {
                ...run,
                stats: { ...run.stats, comboShards: Math.min(MAX_COMBO_SHARDS, run.stats.comboShards + 1) }
            };
        case 'memorize_under_short_memorize':
            return run;
        case 'parasite_ward_once':
            return { ...run, parasiteWardRemaining: run.parasiteWardRemaining + 1 };
        case 'region_shuffle_free_first':
            return run;
        default:
            return run;
    }
};

export const createNewRun = (bestScore: number, options: CreateRunOptions = {}): RunState => {
    const runSeed = options.runSeed ?? randomRunSeed();
    const gameMode = options.gameMode ?? 'endless';
    const rulesVersion = options.runRulesVersionOverride ?? GAME_RULES_VERSION;
    let activeMutators = options.activeMutators ?? [];
    let initialFloorTag: FloorTag = 'normal';
    if (
        gameMode === 'endless' &&
        usesEndlessFloorSchedule(gameMode, rulesVersion) &&
        !options.wildMenuRun &&
        activeMutators.length === 0
    ) {
        const entry = pickFloorScheduleEntry(runSeed, rulesVersion, 1, gameMode);
        activeMutators = entry.mutators;
        initialFloorTag = entry.floorTag;
    }
    const weakerShuffleMode: WeakerShuffleMode = options.weakerShuffleMode ?? 'full';
    const shuffleScoreTaxActive = options.shuffleScoreTaxActive ?? false;
    const enableWildJoker = options.enableWildJoker ?? false;
    const peekCharges = options.enablePeek === false ? 0 : 1;
    const board =
        options.fixedBoard ??
        buildBoard(1, {
            runSeed,
            runRulesVersion: rulesVersion,
            activeMutators,
            includeWildTile: enableWildJoker,
            floorTag: initialFloorTag
        });

    const run: RunState = {
        status: 'memorize',
        lives: INITIAL_LIVES,
        board,
        stats: createSessionStats(bestScore),
        achievementsEnabled: !options.practiceMode,
        debugUsed: false,
        debugPeekActive: false,
        pendingMemorizeBonusMs: 0,
        shuffleCharges: INITIAL_SHUFFLE_CHARGES,
        destroyPairCharges: 0,
        pinnedTileIds: [],
        powersUsedThisRun: false,
        timerState: createTimerState({ memorizeRemainingMs: null }),
        lastLevelResult: null,
        lastRunSummary: null,
        runSeed,
        runRulesVersion: rulesVersion,
        gameMode,
        shuffleNonce: 0,
        activeMutators,
        relicIds: [...(options.initialRelicIds ?? [])],
        relicTiersClaimed: 0,
        relicOffer: null,
        activeContract: options.activeContract ?? null,
        practiceMode: options.practiceMode ?? false,
        dailyDateKeyUtc: options.dailyDateKeyUtc ?? null,
        puzzleId: options.puzzleId ?? null,
        stickyBlockIndex: null,
        parasiteFloors: 0,
        freeShuffleThisFloor: false,
        gauntletDeadlineMs:
            options.gauntletDurationMs != null ? Date.now() + options.gauntletDurationMs : null,
        gauntletSessionDurationMs: options.gauntletDurationMs ?? null,
        dailyStreakCount: 0,
        flipHistory: [],
        peekCharges,
        peekRevealedTileIds: [],
        undoUsesThisFloor: 1,
        gambitAvailableThisFloor: true,
        gambitThirdFlipUsed: false,
        wildTileId: null,
        wildMatchesRemaining: enableWildJoker ? 1 : 0,
        strayRemoveCharges: options.initialStrayRemoveCharges ?? 0,
        strayRemoveArmed: false,
        matchScoreMultiplier: 1,
        nBackMatchCounter: 0,
        nBackAnchorPairKey: null,
        matchedPairKeysThisRun: [],
        weakerShuffleMode,
        shuffleScoreTaxActive,
        resolveDelayMultiplier: options.resolveDelayMultiplier ?? 1,
        echoFeedbackEnabled: options.echoFeedbackEnabled ?? true,
        wildMenuRun: options.wildMenuRun ?? false,
        shuffleUsedThisFloor: false,
        destroyUsedThisFloor: false,
        decoyFlippedThisFloor: false,
        glassDecoyActiveThisFloor: boardHasGlassDecoy(board),
        cursedMatchedEarlyThisFloor: false,
        matchResolutionsThisFloor: 0,
        parasiteWardRemaining: 0,
        flashPairCharges:
            options.practiceMode || options.wildMenuRun ? 1 : 0,
        flashPairRevealedTileIds: [],
        regionShuffleCharges: INITIAL_REGION_SHUFFLE_CHARGES,
        regionShuffleRowArmed: null,
        regionShuffleFreeThisFloor: false,
        pinsPlacedCountThisRun: 0,
        findablesClaimedThisFloor: 0,
        findablesTotalThisFloor: countFindablePairs(board.tiles),
        shiftingSpotlightNonce: 0
    };

    let runWithRelics = run;
    for (const relicId of runWithRelics.relicIds) {
        runWithRelics = applyRelicImmediate(runWithRelics, relicId);
    }

    const memorizeMs = getMemorizeDurationForRun(runWithRelics, 1) + runWithRelics.pendingMemorizeBonusMs;

    return {
        ...runWithRelics,
        freeShuffleThisFloor: runWithRelics.relicIds.includes('first_shuffle_free_per_floor'),
        regionShuffleFreeThisFloor: runWithRelics.relicIds.includes('region_shuffle_free_first'),
        timerState: createTimerState({ memorizeRemainingMs: memorizeMs })
    };
};

export const createMeditationRun = (bestScore: number, focusMutators?: MutatorId[]): RunState =>
    createNewRun(bestScore, {
        gameMode: 'meditation',
        activeMutators: focusMutators && focusMutators.length > 0 ? focusMutators : undefined
    });

export const createWildRun = (bestScore: number): RunState =>
    createNewRun(bestScore, {
        enableWildJoker: true,
        initialStrayRemoveCharges: 1,
        wildMenuRun: true,
        activeMutators: ['sticky_fingers', 'short_memorize', 'findables_floor']
    });

export const createDailyRun = (bestScore: number): RunState => {
    const runSeed = deriveDailyRunSeed(GAME_RULES_VERSION);
    const mutIndex = deriveDailyMutatorIndex(runSeed, DAILY_MUTATOR_TABLE.length);
    const activeMutators = [DAILY_MUTATOR_TABLE[mutIndex]!];

    return createNewRun(bestScore, {
        runSeed,
        gameMode: 'daily',
        activeMutators,
        dailyDateKeyUtc: formatDailyDateKeyUtc()
    });
};

export const createGauntletRun = (bestScore: number, gauntletDurationMs: number = 10 * 60 * 1000): RunState =>
    createNewRun(bestScore, {
        gameMode: 'gauntlet',
        gauntletDurationMs
    });

export const createRunFromExportPayload = (bestScore: number, payload: RunExportPayload): RunState => {
    let activeMutators = payload.mutators;
    if (payload.mode === 'endless' && payload.rules >= FLOOR_SCHEDULE_RULES_VERSION) {
        activeMutators = pickFloorScheduleEntry(payload.seed, payload.rules, 1, 'endless').mutators;
    }
    return createNewRun(bestScore, {
        runSeed: payload.seed,
        gameMode: payload.mode,
        activeMutators,
        initialRelicIds: payload.relics ?? [],
        runRulesVersionOverride: payload.rules
    });
};

export const createPuzzleRun = (bestScore: number, puzzleId: string, tiles: Tile[], level = 1): RunState => {
    const columns = clamp(Math.ceil(Math.sqrt(tiles.length)), 2, 8);
    const rows = Math.ceil(tiles.length / columns);
    const pairCount = new Set(tiles.map((t) => t.pairKey).filter((k) => k !== DECOY_PAIR_KEY)).size;

    return createNewRun(bestScore, {
        gameMode: 'puzzle',
        puzzleId,
        fixedBoard: {
            level,
            pairCount,
            columns,
            rows,
            tiles: tiles.map((t) => ({ ...t })),
            flippedTileIds: [],
            matchedPairs: 0
        }
    });
};

export const isGauntletExpired = (run: RunState): boolean =>
    run.gauntletDeadlineMs !== null && Date.now() > run.gauntletDeadlineMs;

export const openRelicOffer = (run: RunState): RunState => {
    if (!needsRelicPick(run) || run.relicOffer) {
        return run;
    }
    const cleared = run.lastLevelResult!.level;
    const tierIndex = RELIC_MILESTONE_FLOORS.indexOf(cleared as (typeof RELIC_MILESTONE_FLOORS)[number]);
    const options = rollRelicOptions(run, tierIndex);

    return {
        ...run,
        relicOffer: { tier: tierIndex + 1, options }
    };
};

export const completeRelicPickAndAdvance = (run: RunState, relicId: RelicId): RunState => {
    if (!run.relicOffer?.options.includes(relicId)) {
        return run;
    }

    let next: RunState = {
        ...run,
        relicIds: [...run.relicIds, relicId],
        relicTiersClaimed: run.relicTiersClaimed + 1,
        relicOffer: null
    };
    next = applyRelicImmediate(next, relicId);
    return advanceToNextLevel(next);
};

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
    if (!run.board) {
        return run;
    }

    const gambitThirdWhileResolving =
        run.status === 'resolving' &&
        run.gambitAvailableThisFloor &&
        !run.gambitThirdFlipUsed &&
        run.board.flippedTileIds.length === 2;

    if (run.status !== 'playing' && !gambitThirdWhileResolving) {
        return run;
    }

    const runAfterFlashClear =
        run.flashPairRevealedTileIds.length > 0 ? { ...run, flashPairRevealedTileIds: [] } : run;
    const board = runAfterFlashClear.board;
    if (!board) {
        return runAfterFlashClear;
    }

    const allowThird =
        runAfterFlashClear.gambitAvailableThisFloor &&
        !runAfterFlashClear.gambitThirdFlipUsed &&
        board.flippedTileIds.length === 2;
    const maxFlips = allowThird ? 3 : 2;
    if (board.flippedTileIds.length >= maxFlips) {
        return runAfterFlashClear;
    }

    const tile = board.tiles.find((candidate) => candidate.id === tileId);

    if (!tile || tile.state !== 'hidden') {
        return runAfterFlashClear;
    }

    const tileIndex = board.tiles.findIndex((candidate) => candidate.id === tileId);
    if (
        board.flippedTileIds.length === 0 &&
        runAfterFlashClear.stickyBlockIndex !== null &&
        tileIndex === runAfterFlashClear.stickyBlockIndex
    ) {
        return runAfterFlashClear;
    }

    const peekRevealedTileIds =
        runAfterFlashClear.peekRevealedTileIds.length > 0 ? ([] as string[]) : runAfterFlashClear.peekRevealedTileIds;

    const flippedTileIds = [...board.flippedTileIds, tileId];
    const firstFlippedId = board.flippedTileIds[0] ?? null;
    const firstFlippedTile = firstFlippedId
        ? board.tiles.find((candidate) => candidate.id === firstFlippedId) ?? null
        : null;
    const resolvesMatchImmediately =
        flippedTileIds.length === 2 &&
        firstFlippedTile !== null &&
        tilesArePairMatch(firstFlippedTile, tile);

    let resolveRemainingMs = run.timerState.resolveRemainingMs;
    if (flippedTileIds.length === 2) {
        resolveRemainingMs = resolvesMatchImmediately
            ? 0
            : computeFlipResolveDelayMs(runAfterFlashClear, flippedTileIds, {
                  resolveDelayMultiplier: runAfterFlashClear.resolveDelayMultiplier,
                  echoFeedbackEnabled: runAfterFlashClear.echoFeedbackEnabled
              });
    } else if (flippedTileIds.length === 3) {
        resolveRemainingMs = MATCH_DELAY_MS * runAfterFlashClear.resolveDelayMultiplier;
    }

    return {
        ...runAfterFlashClear,
        peekRevealedTileIds,
        status: flippedTileIds.length >= 2 ? 'resolving' : 'playing',
        board: {
            ...board,
            tiles: board.tiles.map((candidate) =>
                candidate.id === tileId ? { ...candidate, state: 'flipped' } : candidate
            ),
            flippedTileIds
        },
        flipHistory: [...runAfterFlashClear.flipHistory, tileId],
        timerState: {
            ...runAfterFlashClear.timerState,
            resolveRemainingMs,
            pausedFromStatus: null
        }
    };
};

const finalizeLevel = (run: RunState, board: BoardState): RunState => {
    const perfect = run.stats.tries === 0;
    const clearLifeReason = getClearLifeReason(run.stats.tries);
    const clearLifeGained = clearLifeReason !== 'none' && run.lives < MAX_LIVES ? 1 : 0;
    const levelBonus = calculateLevelClearBonus(board.level);
    const perfectBonus = perfect ? calculatePerfectClearBonus() : 0;
    const bonusTags: string[] = [];
    let objectiveBonus = 0;
    if (!run.shuffleUsedThisFloor && !run.destroyUsedThisFloor) {
        objectiveBonus += SCHOLAR_STYLE_FLOOR_BONUS_SCORE;
        bonusTags.push('scholar_style');
    }
    if (run.glassDecoyActiveThisFloor && !run.decoyFlippedThisFloor) {
        objectiveBonus += GLASS_WITNESS_BONUS_SCORE;
        bonusTags.push('glass_witness');
    }
    if (board.cursedPairKey && !run.cursedMatchedEarlyThisFloor) {
        objectiveBonus += CURSED_LAST_BONUS_SCORE;
        bonusTags.push('cursed_last');
    }
    if (board.pairCount >= 2 && run.matchResolutionsThisFloor <= flipParLimit(board.pairCount)) {
        objectiveBonus += FLIP_PAR_BONUS_SCORE;
        bonusTags.push('flip_par');
    }
    const preBossSubtotal = run.stats.currentLevelScore + levelBonus + perfectBonus + objectiveBonus;
    const scoreGained =
        board.floorTag === 'boss'
            ? Math.floor(preBossSubtotal * BOSS_FLOOR_SCORE_MULTIPLIER)
            : preBossSubtotal;
    if (board.floorTag === 'boss') {
        bonusTags.push('boss_floor');
    }
    const totalScore = run.stats.totalScore + scoreGained - run.stats.currentLevelScore;
    const bestScore = Math.max(run.stats.bestScore, totalScore);
    const rating = calculateRating(run.stats.tries);
    const lives = Math.min(MAX_LIVES, run.lives + clearLifeGained);
    const lastLevelResult: LevelResult = {
        level: board.level,
        scoreGained,
        rating,
        livesRemaining: lives,
        perfect,
        mistakes: run.stats.tries,
        clearLifeReason,
        clearLifeGained,
        bonusTags: bonusTags.length > 0 ? bonusTags : undefined,
        objectiveBonusScore: objectiveBonus > 0 ? objectiveBonus : undefined
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

export const applyDestroyPair = (run: RunState, tileId: string): RunState => {
    if (run.activeContract?.noDestroy || !canDestroyPair(run, tileId) || !run.board) {
        return run;
    }

    const tile = run.board.tiles.find((t) => t.id === tileId)!;
    const pairTileIds = run.board.tiles.filter((t) => t.pairKey === tile.pairKey).map((t) => t.id);

    const board: BoardState = {
        ...run.board,
        matchedPairs: run.board.matchedPairs + 1,
        tiles: run.board.tiles.map((t) =>
            pairTileIds.includes(t.id) ? { ...t, state: 'matched' as const, findableKind: undefined } : t
        )
    };

    const pinnedTileIds = run.pinnedTileIds.filter((id) => !pairTileIds.includes(id));

    const spunDestroy = withRotatedShiftingSpotlight(run, board);

    const nextRun: RunState = {
        ...run,
        powersUsedThisRun: true,
        destroyUsedThisFloor: true,
        destroyPairCharges: run.destroyPairCharges - 1,
        pinnedTileIds,
        board: spunDestroy.board,
        shiftingSpotlightNonce: spunDestroy.shiftingSpotlightNonce,
        parasiteFloors: hasMutator(run, 'score_parasite') ? 0 : run.parasiteFloors,
        stats: {
            ...run.stats,
            matchesFound: run.stats.matchesFound + 1,
            pairsDestroyed: run.stats.pairsDestroyed + 1
        }
    };

    return isBoardComplete(spunDestroy.board) ? finalizeLevel(nextRun, spunDestroy.board) : nextRun;
};

export const applyPeek = (run: RunState, tileId: string): RunState => {
    if (run.status !== 'playing' || !run.board || run.peekCharges < 1) {
        return run;
    }
    if (run.board.flippedTileIds.length > 0) {
        return run;
    }
    const tile = run.board.tiles.find((t) => t.id === tileId);
    if (!tile || tile.state !== 'hidden') {
        return run;
    }
    if (run.peekRevealedTileIds.includes(tileId)) {
        return run;
    }
    return {
        ...run,
        peekCharges: run.peekCharges - 1,
        powersUsedThisRun: true,
        peekRevealedTileIds: [...run.peekRevealedTileIds, tileId]
    };
};

export const cancelResolvingWithUndo = (run: RunState): RunState => {
    if (run.status !== 'resolving' || !run.board || run.undoUsesThisFloor < 1) {
        return run;
    }
    const ids = [...run.board.flippedTileIds];
    const board: BoardState = {
        ...run.board,
        flippedTileIds: [],
        tiles: run.board.tiles.map((t) =>
            ids.includes(t.id) ? { ...t, state: 'hidden' as const } : t
        )
    };
    return {
        ...run,
        status: 'playing',
        board,
        undoUsesThisFloor: run.undoUsesThisFloor - 1,
        powersUsedThisRun: true,
        timerState: clearResolveState(run)
    };
};

export const toggleStrayRemoveArmed = (run: RunState): RunState =>
    run.strayRemoveCharges > 0 && run.status === 'playing'
        ? { ...run, strayRemoveArmed: !run.strayRemoveArmed }
        : run;

export const applyStrayRemove = (run: RunState, tileId: string): RunState => {
    if (!run.strayRemoveArmed || run.status !== 'playing' || !run.board || run.strayRemoveCharges < 1) {
        return run;
    }
    if (run.board.flippedTileIds.length > 0) {
        return run;
    }
    const tile = run.board.tiles.find((t) => t.id === tileId);
    if (!tile || tile.state !== 'hidden' || tile.pairKey === DECOY_PAIR_KEY) {
        return run;
    }
    const board: BoardState = {
        ...run.board,
        tiles: run.board.tiles.map((t) => (t.id === tileId ? { ...t, state: 'removed' as const } : t))
    };
    return {
        ...run,
        powersUsedThisRun: true,
        strayRemoveCharges: run.strayRemoveCharges - 1,
        strayRemoveArmed: false,
        board
    };
};

const clearResolveState = (run: RunState): RunState['timerState'] => ({
    ...run.timerState,
    resolveRemainingMs: null,
    pausedFromStatus: null
});

const resolveGambitThree = (run: RunState, encorePairKeys: string[]): RunState => {
    if (!run.board || run.board.flippedTileIds.length !== 3) {
        return run;
    }
    const [aId, bId, cId] = run.board.flippedTileIds;
    const ta = run.board.tiles.find((t) => t.id === aId)!;
    const tb = run.board.tiles.find((t) => t.id === bId)!;
    const tc = run.board.tiles.find((t) => t.id === cId)!;
    let matchA = aId;
    let matchB = bId;
    let thirdId = cId;
    let found = false;
    if (tilesArePairMatch(ta, tb)) {
        thirdId = cId;
        found = true;
    } else if (tilesArePairMatch(ta, tc)) {
        matchB = cId;
        thirdId = bId;
        found = true;
    } else if (tilesArePairMatch(tb, tc)) {
        matchA = bId;
        matchB = cId;
        thirdId = aId;
        found = true;
    }

    if (found) {
        const tileMatchA = run.board.tiles.find((t) => t.id === matchA)!;
        const tileMatchB = run.board.tiles.find((t) => t.id === matchB)!;
        const claimedFindableKind = tileMatchA.findableKind ?? tileMatchB.findableKind ?? null;
        const findableScoreBonus =
            claimedFindableKind != null ? FINDABLE_MATCH_SCORE[claimedFindableKind] : 0;
        const findableComboShardGain =
            claimedFindableKind != null ? FINDABLE_MATCH_COMBO_SHARDS[claimedFindableKind] : 0;
        const findablesClaimedDelta = claimedFindableKind != null ? 1 : 0;

        const board: BoardState = {
            ...run.board,
            flippedTileIds: [],
            matchedPairs: run.board.matchedPairs + 1,
            tiles: run.board.tiles.map((tile) => {
                if (tile.id === matchA || tile.id === matchB) {
                    return { ...tile, state: 'matched' as const, findableKind: undefined };
                }
                if (tile.id === thirdId) {
                    return { ...tile, state: 'hidden' as const };
                }
                return tile;
            })
        };
        const currentStreak = run.stats.currentStreak + 1;
        const meditation = run.gameMode === 'meditation';
        const guardTokenGain =
            meditation || currentStreak % COMBO_GUARD_STREAK_STEP !== 0 ? 0 : 1;
        const guardTokens = Math.min(MAX_GUARD_TOKENS, run.stats.guardTokens + guardTokenGain);
        const comboShardReward = meditation
            ? applyComboShardGain(run.stats.comboShards, run.lives, findableComboShardGain, false)
            : applyComboShardGain(
                  run.stats.comboShards,
                  run.lives,
                  (currentStreak % COMBO_SHARD_STREAK_STEP === 0 ? 1 : 0) + findableComboShardGain
              );
        const chainHealLifeGain =
            meditation || currentStreak % CHAIN_HEAL_STREAK_STEP !== 0 ? 0 : 1;
        const lives = Math.min(MAX_LIVES, run.lives + chainHealLifeGain + comboShardReward.lifeGain);
        const tMatch = run.board.tiles.find((t) => t.id === matchA)!;
        const encoreKey =
            isWildPairKey(tMatch.pairKey) && matchB
                ? run.board.tiles.find((t) => t.id === matchB)!.pairKey
                : tMatch.pairKey;
        const cursedKeyG = run.board.cursedPairKey;
        const cursedEarlyG =
            Boolean(cursedKeyG && encoreKey === cursedKeyG && run.board.matchedPairs < run.board.pairCount - 1);
        const encoreBonus = encorePairKeys.includes(encoreKey) ? ENCORE_BONUS_SCORE : 0;
        const spotlightDelta = shiftingSpotlightMatchDelta(run.board, encoreKey);
        const presentationPenalty = getPresentationMutatorMatchPenalty(run);
        const matchScore = Math.max(
            0,
            calculateMatchScore(board.level, currentStreak, run.matchScoreMultiplier) +
                encoreBonus +
                findableScoreBonus +
                spotlightDelta -
                presentationPenalty
        );
        const totalScore = run.stats.totalScore + matchScore;
        const currentLevelScore = run.stats.currentLevelScore + matchScore;
        const bestScore = Math.max(run.stats.bestScore, totalScore);
        const nBackMatchCounter = run.nBackMatchCounter + 1;
        const nBackAnchorPairKey =
            hasMutator(run, 'n_back_anchor') && nBackMatchCounter % 2 === 0 ? encoreKey : run.nBackAnchorPairKey;
        const wildMatchesRemaining =
            isWildPairKey(ta.pairKey) || isWildPairKey(tb.pairKey) || isWildPairKey(tc.pairKey)
                ? 0
                : run.wildMatchesRemaining;

        const spunG = withRotatedShiftingSpotlight(run, board);

        const nextRun: RunState = {
            ...run,
            gambitThirdFlipUsed: true,
            gambitAvailableThisFloor: false,
            powersUsedThisRun: true,
            status: 'playing',
            lives,
            board: spunG.board,
            shiftingSpotlightNonce: spunG.shiftingSpotlightNonce,
            wildMatchesRemaining,
            nBackMatchCounter,
            nBackAnchorPairKey,
            matchedPairKeysThisRun: [...run.matchedPairKeysThisRun, encoreKey],
            pinnedTileIds: run.pinnedTileIds.filter((id) => id !== matchA && id !== matchB),
            stickyBlockIndex: hasMutator(run, 'sticky_fingers')
                ? run.board.tiles.findIndex((t) => t.id === matchA)
                : null,
            cursedMatchedEarlyThisFloor: run.cursedMatchedEarlyThisFloor || cursedEarlyG,
            matchResolutionsThisFloor: run.matchResolutionsThisFloor + 1,
            findablesClaimedThisFloor: run.findablesClaimedThisFloor + findablesClaimedDelta,
            stats: {
                ...run.stats,
                totalScore,
                currentLevelScore,
                bestScore,
                matchesFound: run.stats.matchesFound + 1,
                currentStreak,
                bestStreak: Math.max(run.stats.bestStreak, currentStreak),
                highestLevel: Math.max(run.stats.highestLevel, board.level),
                guardTokens,
                comboShards: comboShardReward.comboShards
            },
            timerState: clearResolveState(run)
        };
        return isBoardComplete(spunG.board) ? finalizeLevel(nextRun, spunG.board) : nextRun;
    }

    const tries = run.stats.tries + GAMBIT_FAIL_EXTRA_TRIES;
    const hasGraceMismatch = run.stats.tries === 0;
    const consumesGuardToken = !hasGraceMismatch && run.stats.guardTokens > 0;
    const lostLife = !hasGraceMismatch && !consumesGuardToken;
    let lives = lostLife ? run.lives - 1 : run.lives;
    const board: BoardState = {
        ...run.board,
        flippedTileIds: [],
        tiles: run.board.tiles.map((tile) =>
            tile.id === aId || tile.id === bId || tile.id === cId ? { ...tile, state: 'hidden' } : tile
        )
    };
    const contractFail =
        run.activeContract?.maxMismatches != null && tries > run.activeContract.maxMismatches;
    const status: RunStatus = lives <= 0 || contractFail ? 'gameOver' : 'playing';
    if (contractFail) {
        lives = 0;
    }
    const guardTokens = consumesGuardToken ? run.stats.guardTokens - 1 : run.stats.guardTokens;
    const gambitDecoy =
        ta.pairKey === DECOY_PAIR_KEY || tb.pairKey === DECOY_PAIR_KEY || tc.pairKey === DECOY_PAIR_KEY;

    const spunGambitMiss = withRotatedShiftingSpotlight(run, board);

    return {
        ...run,
        gambitThirdFlipUsed: true,
        gambitAvailableThisFloor: false,
        powersUsedThisRun: true,
        status,
        lives: Math.max(lives, 0),
        board: spunGambitMiss.board,
        shiftingSpotlightNonce: spunGambitMiss.shiftingSpotlightNonce,
        stickyBlockIndex: null,
        decoyFlippedThisFloor: run.decoyFlippedThisFloor || gambitDecoy,
        stats: {
            ...run.stats,
            tries,
            mismatches: run.stats.mismatches + 1,
            currentStreak: Math.floor(run.stats.currentStreak / 2),
            rating: calculateRating(tries),
            highestLevel: Math.max(run.stats.highestLevel, board.level),
            guardTokens
        },
        timerState: clearResolveState(run)
    };
};

const resolveTwoFlippedTiles = (run: RunState, encorePairKeys: string[]): RunState => {
    if (!run.board || run.board.flippedTileIds.length !== 2) {
        return run;
    }

    const [firstId, secondId] = run.board.flippedTileIds;
    const firstTile = run.board.tiles.find((tile) => tile.id === firstId);
    const secondTile = run.board.tiles.find((tile) => tile.id === secondId);

    if (!firstTile || !secondTile) {
        return run;
    }

    const isMatch = tilesArePairMatch(firstTile, secondTile);

    if (isMatch) {
        const claimedFindableKind = firstTile.findableKind ?? secondTile.findableKind ?? null;
        const findableScoreBonus =
            claimedFindableKind != null ? FINDABLE_MATCH_SCORE[claimedFindableKind] : 0;
        const findableComboShardGain =
            claimedFindableKind != null ? FINDABLE_MATCH_COMBO_SHARDS[claimedFindableKind] : 0;
        const findablesClaimedDelta = claimedFindableKind != null ? 1 : 0;

        const board: BoardState = {
            ...run.board,
            flippedTileIds: [],
            matchedPairs: run.board.matchedPairs + 1,
            tiles: run.board.tiles.map((tile) =>
                tile.id === firstId || tile.id === secondId
                    ? { ...tile, state: 'matched', findableKind: undefined }
                    : tile
            )
        };
        const currentStreak = run.stats.currentStreak + 1;
        const meditation = run.gameMode === 'meditation';
        const guardTokenGain =
            meditation || currentStreak % COMBO_GUARD_STREAK_STEP !== 0 ? 0 : 1;
        const guardTokens = Math.min(MAX_GUARD_TOKENS, run.stats.guardTokens + guardTokenGain);
        const comboShardReward = meditation
            ? applyComboShardGain(run.stats.comboShards, run.lives, findableComboShardGain, false)
            : applyComboShardGain(
                  run.stats.comboShards,
                  run.lives,
                  (currentStreak % COMBO_SHARD_STREAK_STEP === 0 ? 1 : 0) + findableComboShardGain
              );
        const chainHealLifeGain =
            meditation || currentStreak % CHAIN_HEAL_STREAK_STEP !== 0 ? 0 : 1;
        const lives = Math.min(MAX_LIVES, run.lives + chainHealLifeGain + comboShardReward.lifeGain);
        const encoreKey = isWildPairKey(firstTile.pairKey)
            ? secondTile.pairKey
            : isWildPairKey(secondTile.pairKey)
              ? firstTile.pairKey
              : firstTile.pairKey;
        const cursedKey = run.board.cursedPairKey;
        const cursedEarly =
            Boolean(cursedKey && encoreKey === cursedKey && run.board.matchedPairs < run.board.pairCount - 1);
        const encoreBonus = encorePairKeys.includes(encoreKey) ? ENCORE_BONUS_SCORE : 0;
        const spotlightDelta = shiftingSpotlightMatchDelta(run.board, encoreKey);
        const presentationPenalty = getPresentationMutatorMatchPenalty(run);
        const matchScore = Math.max(
            0,
            calculateMatchScore(board.level, currentStreak, run.matchScoreMultiplier) +
                encoreBonus +
                findableScoreBonus +
                spotlightDelta -
                presentationPenalty
        );
        const totalScore = run.stats.totalScore + matchScore;
        const currentLevelScore = run.stats.currentLevelScore + matchScore;
        const bestScore = Math.max(run.stats.bestScore, totalScore);

        const matchedPinsFiltered = run.pinnedTileIds.filter((id) => id !== firstId && id !== secondId);

        const firstFlippedIdx = run.board.tiles.findIndex((t) => t.id === firstId);
        const nBackMatchCounter = run.nBackMatchCounter + 1;
        const nBackAnchorPairKey =
            hasMutator(run, 'n_back_anchor') && nBackMatchCounter % 2 === 0 ? encoreKey : run.nBackAnchorPairKey;
        const usedWild = isWildPairKey(firstTile.pairKey) || isWildPairKey(secondTile.pairKey);
        const wildMatchesRemaining = usedWild ? 0 : run.wildMatchesRemaining;

        const spun = withRotatedShiftingSpotlight(run, board);

        const nextRun: RunState = {
            ...run,
            status: 'playing',
            lives,
            board: spun.board,
            shiftingSpotlightNonce: spun.shiftingSpotlightNonce,
            powersUsedThisRun: usedWild ? true : run.powersUsedThisRun,
            wildMatchesRemaining,
            nBackMatchCounter,
            nBackAnchorPairKey,
            matchedPairKeysThisRun: [...run.matchedPairKeysThisRun, encoreKey],
            pinnedTileIds: matchedPinsFiltered,
            stickyBlockIndex: hasMutator(run, 'sticky_fingers') ? firstFlippedIdx : null,
            cursedMatchedEarlyThisFloor: run.cursedMatchedEarlyThisFloor || cursedEarly,
            matchResolutionsThisFloor: run.matchResolutionsThisFloor + 1,
            findablesClaimedThisFloor: run.findablesClaimedThisFloor + findablesClaimedDelta,
            stats: {
                ...run.stats,
                totalScore,
                currentLevelScore,
                bestScore,
                matchesFound: run.stats.matchesFound + 1,
                currentStreak,
                bestStreak: Math.max(run.stats.bestStreak, currentStreak),
                highestLevel: Math.max(run.stats.highestLevel, board.level),
                guardTokens,
                comboShards: comboShardReward.comboShards
            },
            timerState: clearResolveState(run)
        };

        return isBoardComplete(spun.board) ? finalizeLevel(nextRun, spun.board) : nextRun;
    }

    const tries = run.stats.tries + 1;
    const hasGraceMismatch = run.stats.tries === 0;
    const consumesGuardToken = !hasGraceMismatch && run.stats.guardTokens > 0;
    const lostLife = !hasGraceMismatch && !consumesGuardToken;
    let lives = lostLife ? run.lives - 1 : run.lives;
    const board: BoardState = {
        ...run.board,
        flippedTileIds: [],
        tiles: run.board.tiles.map((tile) =>
            tile.id === firstId || tile.id === secondId ? { ...tile, state: 'hidden' } : tile
        )
    };
    const contractFail =
        run.activeContract?.maxMismatches != null && tries > run.activeContract.maxMismatches;
    const status: RunStatus = lives <= 0 || contractFail ? 'gameOver' : 'playing';
    if (contractFail) {
        lives = 0;
    }
    const guardTokens = consumesGuardToken ? run.stats.guardTokens - 1 : run.stats.guardTokens;

    const pendingMemorizeBonusMs = lostLife
        ? Math.min(
              MAX_PENDING_MEMORIZE_BONUS_MS,
              run.pendingMemorizeBonusMs + MEMORIZE_BONUS_PER_LIFE_LOST_MS
          )
        : run.pendingMemorizeBonusMs;

    const decoyTouch =
        firstTile.pairKey === DECOY_PAIR_KEY || secondTile.pairKey === DECOY_PAIR_KEY;

    const spunMiss = withRotatedShiftingSpotlight(run, board);

    return {
        ...run,
        status,
        lives: Math.max(lives, 0),
        board: spunMiss.board,
        shiftingSpotlightNonce: spunMiss.shiftingSpotlightNonce,
        pendingMemorizeBonusMs,
        stickyBlockIndex: null,
        decoyFlippedThisFloor: run.decoyFlippedThisFloor || decoyTouch,
        stats: {
            ...run.stats,
            tries,
            mismatches: run.stats.mismatches + 1,
            currentStreak: Math.floor(run.stats.currentStreak / 2),
            rating: calculateRating(tries),
            highestLevel: Math.max(run.stats.highestLevel, board.level),
            guardTokens
        },
        timerState: clearResolveState(run)
    };
};

export const resolveBoardTurn = (run: RunState, encorePairKeys: string[] = []): RunState => {
    if (!run.board) {
        return run;
    }
    if (run.board.flippedTileIds.length === 3) {
        return resolveGambitThree(run, encorePairKeys);
    }
    if (run.board.flippedTileIds.length !== 2) {
        return run;
    }
    return resolveTwoFlippedTiles(run, encorePairKeys);
};

export const advanceToNextLevel = (run: RunState): RunState => {
    if (!run.board) {
        return run;
    }

    const cleanClearDestroyBonus =
        run.lastLevelResult !== null && run.lastLevelResult.mistakes <= 1 ? 1 : 0;
    const nextDestroyPairCharges = Math.min(
        MAX_DESTROY_PAIR_BANK,
        run.destroyPairCharges + cleanClearDestroyBonus
    );

    const nextLevelNum = run.board.level + 1;
    let nextActiveMutators = [...run.activeMutators];
    let nextFloorTag: FloorTag = 'normal';
    if (usesEndlessFloorSchedule(run.gameMode, run.runRulesVersion) && !run.wildMenuRun) {
        const entry = pickFloorScheduleEntry(run.runSeed, run.runRulesVersion, nextLevelNum, run.gameMode);
        nextActiveMutators = entry.mutators;
        nextFloorTag = entry.floorTag;
    }

    let parasiteFloors = run.parasiteFloors + 1;
    let lives = run.lives;
    let nextParasiteWard = run.parasiteWardRemaining;
    if (hasMutator(run, 'score_parasite') && parasiteFloors >= 4) {
        parasiteFloors = 0;
        if (nextParasiteWard > 0) {
            nextParasiteWard -= 1;
        } else {
            lives = Math.max(0, lives - 1);
        }
    }

    const nextBoard = buildBoard(nextLevelNum, {
        runSeed: run.runSeed,
        runRulesVersion: run.runRulesVersion,
        activeMutators: nextActiveMutators,
        includeWildTile: run.wildMatchesRemaining > 0,
        floorTag: nextFloorTag
    });
    const runForNextMemorize: RunState = { ...run, activeMutators: nextActiveMutators };
    const baseMemorizeMs = getMemorizeDurationForRun(runForNextMemorize, nextBoard.level);
    const memorizeWithBonus = baseMemorizeMs + run.pendingMemorizeBonusMs;

    const status = lives <= 0 ? 'gameOver' : 'memorize';

    return {
        ...run,
        status,
        lives,
        activeMutators: nextActiveMutators,
        board: nextBoard,
        debugPeekActive: false,
        pendingMemorizeBonusMs: 0,
        pinnedTileIds: [],
        destroyPairCharges: nextDestroyPairCharges,
        parasiteFloors,
        parasiteWardRemaining: nextParasiteWard,
        stickyBlockIndex: null,
        freeShuffleThisFloor: run.relicIds.includes('first_shuffle_free_per_floor'),
        regionShuffleFreeThisFloor: run.relicIds.includes('region_shuffle_free_first'),
        undoUsesThisFloor: 1,
        gambitAvailableThisFloor: true,
        gambitThirdFlipUsed: false,
        peekRevealedTileIds: [],
        shuffleUsedThisFloor: false,
        destroyUsedThisFloor: false,
        decoyFlippedThisFloor: false,
        glassDecoyActiveThisFloor: boardHasGlassDecoy(nextBoard),
        cursedMatchedEarlyThisFloor: false,
        matchResolutionsThisFloor: 0,
        findablesClaimedThisFloor: 0,
        findablesTotalThisFloor: countFindablePairs(nextBoard.tiles),
        shiftingSpotlightNonce: 0,
        flashPairRevealedTileIds: [],
        regionShuffleRowArmed: null,
        regionShuffleCharges: INITIAL_REGION_SHUFFLE_CHARGES,
        timerState: createTimerState({ memorizeRemainingMs: status === 'memorize' ? memorizeWithBonus : null }),
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
        perfectClears: run.stats.perfectClears,
        runSeed: run.runSeed,
        runRulesVersion: run.runRulesVersion,
        gameMode: run.gameMode,
        dailyDateKeyUtc: run.dailyDateKeyUtc ?? undefined,
        activeMutators: [...run.activeMutators],
        relicIds: [...run.relicIds]
    }
});
