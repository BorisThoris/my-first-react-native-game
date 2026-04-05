export const SAVE_SCHEMA_VERSION = 4;
/** Bump when generation rules change (tile order, mutators, pair layout). */
export const GAME_RULES_VERSION = 1;
export const INITIAL_LIVES = 4;
export const MAX_LIVES = 5;
export const MATCH_DELAY_MS = 850;
export const DEBUG_REVEAL_MS = 1500;
export const MEMORIZE_BASE_MS = 1300;
export const MEMORIZE_STEP_MS = 50;
export const MEMORIZE_MIN_MS = 600;
/** Memorize time drops by MEMORIZE_STEP_MS once per this many levels (so pairs and timer do not spike together every floor). */
export const MEMORIZE_DECAY_EVERY_N_LEVELS = 2;
/** After a life is lost to a mismatch, this many ms are banked for the next level's memorize phase (capped). */
export const MEMORIZE_BONUS_PER_LIFE_LOST_MS = 220;
export const MAX_PENDING_MEMORIZE_BONUS_MS = 500;
export const COMBO_GUARD_STREAK_STEP = 4;
export const CHAIN_HEAL_STREAK_STEP = 8;
export const MAX_GUARD_TOKENS = 2;
export const MAX_COMBO_SHARDS = 2;
export const INITIAL_SHUFFLE_CHARGES = 1;
export const MAX_DESTROY_PAIR_BANK = 2;
export const MAX_PINNED_TILES = 3;

export type DisplayMode = 'windowed' | 'fullscreen';
export type TileState = 'hidden' | 'flipped' | 'matched' | 'removed';
export type Rating = 'S++' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
export type ClearLifeReason = 'none' | 'clean' | 'perfect';
export type ViewState =
    | 'boot'
    | 'menu'
    | 'settings'
    | 'playing'
    | 'gameOver'
    | 'modeSelect'
    | 'collection'
    | 'inventory'
    | 'codex';

/** Where sub-screens (mode select, collection, inventory, codex) return on Back. */
export type SubscreenReturnView = Exclude<ViewState, 'boot' | 'settings'>;

export type GameMode = 'endless' | 'daily' | 'puzzle' | 'gauntlet' | 'meditation';

export type MutatorId =
    | 'glass_floor'
    | 'sticky_fingers'
    | 'score_parasite'
    | 'category_letters'
    | 'short_memorize'
    | 'wide_recall'
    | 'silhouette_twist'
    | 'n_back_anchor'
    | 'distraction_channel';

/** Hidden shuffle: full Fisher–Yates vs row-preserving permute. */
export type WeakerShuffleMode = 'full' | 'rows_only';

export type RelicId =
    | 'extra_shuffle_charge'
    | 'first_shuffle_free_per_floor'
    | 'memorize_bonus_ms'
    | 'destroy_bank_plus_one'
    | 'combo_shard_plus_step';

export interface ContractFlags {
    noShuffle: boolean;
    noDestroy: boolean;
    maxMismatches: number | null;
}
export type ResumableRunStatus = 'memorize' | 'playing' | 'resolving';
export type RunStatus = ResumableRunStatus | 'paused' | 'levelComplete' | 'gameOver';

export type AchievementId =
    | 'ACH_FIRST_CLEAR'
    | 'ACH_LEVEL_FIVE'
    | 'ACH_SCORE_THOUSAND'
    | 'ACH_PERFECT_CLEAR'
    | 'ACH_LAST_LIFE';

export interface DebugFlags {
    showDebugTools: boolean;
    allowBoardReveal: boolean;
    disableAchievementsOnDebug: boolean;
}

/** Experimental board framing (Wave G presentation). */
export type BoardPresentationMode = 'standard' | 'spaghetti' | 'breathing';

export interface Settings {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    displayMode: DisplayMode;
    uiScale: number;
    reduceMotion: boolean;
    debugFlags: DebugFlags;
    boardPresentation: BoardPresentationMode;
    /** Dim hidden tiles that are not orthogonally adjacent to the lone flipped tile (fallback board / a11y experiment). */
    tileFocusAssist: boolean;
    /** Multiplier for mismatch/match resolve delay (playing phase). */
    resolveDelayMultiplier: number;
    weakerShuffleMode: WeakerShuffleMode;
    /** After mismatch, keep tiles face-up slightly longer (Echo feedback). */
    echoFeedbackEnabled: boolean;
    /** Experimental: brief numeric pulse overlay (off by default; respect reduce motion). */
    distractionChannelEnabled: boolean;
    /** Reduce match score multiplier slightly each shuffle this run when enabled. */
    shuffleScoreTaxEnabled: boolean;
}

export interface Tile {
    id: string;
    pairKey: string;
    symbol: string;
    label: string;
    state: TileState;
    /** Visual variant index for atomic-pairs styling (optional). */
    atomicVariant?: number;
}

export interface BoardState {
    level: number;
    pairCount: number;
    columns: number;
    rows: number;
    tiles: Tile[];
    flippedTileIds: string[];
    matchedPairs: number;
}

export interface SessionStats {
    totalScore: number;
    currentLevelScore: number;
    bestScore: number;
    tries: number;
    rating: Rating;
    levelsCleared: number;
    matchesFound: number;
    mismatches: number;
    highestLevel: number;
    currentStreak: number;
    bestStreak: number;
    perfectClears: number;
    guardTokens: number;
    comboShards: number;
    shufflesUsed: number;
    pairsDestroyed: number;
}

export interface LevelResult {
    level: number;
    scoreGained: number;
    rating: Rating;
    livesRemaining: number;
    perfect: boolean;
    mistakes: number;
    clearLifeReason: ClearLifeReason;
    clearLifeGained: number;
}

export interface RunSummary {
    totalScore: number;
    bestScore: number;
    levelsCleared: number;
    highestLevel: number;
    achievementsEnabled: boolean;
    unlockedAchievements: AchievementId[];
    bestStreak: number;
    perfectClears: number;
    /** Present for seeded modes (daily, shared challenge). */
    runSeed?: number;
    runRulesVersion?: number;
    gameMode?: GameMode;
    dailyDateKeyUtc?: string;
    activeMutators?: MutatorId[];
    relicIds?: RelicId[];
}

export interface RunTimerState {
    memorizeRemainingMs: number | null;
    resolveRemainingMs: number | null;
    debugRevealRemainingMs: number | null;
    pausedFromStatus: ResumableRunStatus | null;
}

export interface RunState {
    status: RunStatus;
    lives: number;
    board: BoardState | null;
    stats: SessionStats;
    achievementsEnabled: boolean;
    debugUsed: boolean;
    debugPeekActive: boolean;
    /** Banked extra memorize time (ms) applied on the next level's memorize phase, then cleared. */
    pendingMemorizeBonusMs: number;
    shuffleCharges: number;
    destroyPairCharges: number;
    pinnedTileIds: string[];
    /** True after shuffle or destroy this run; gates ACH_PERFECT_CLEAR only. */
    powersUsedThisRun: boolean;
    timerState: RunTimerState;
    lastLevelResult: LevelResult | null;
    lastRunSummary: RunSummary | null;
    /** Master seed for this run; drives per-level tile order and shuffles. */
    runSeed: number;
    runRulesVersion: number;
    gameMode: GameMode;
    /** Increments each time the player shuffles (deterministic shuffle order). */
    shuffleNonce: number;
    activeMutators: MutatorId[];
    relicIds: RelicId[];
    /** How many relic milestones (floors 3/6/9) have been claimed. */
    relicTiersClaimed: number;
    /** Floors 3 / 6 / 9: offer pick before advancing. */
    relicOffer: null | { tier: number; options: RelicId[] };
    activeContract: ContractFlags | null;
    /** Practice runs disable achievements (optional ranked split). */
    practiceMode: boolean;
    dailyDateKeyUtc: string | null;
    puzzleId: string | null;
    /** Sticky fingers: flat index blocked for the next opening flip after a match. */
    stickyBlockIndex: number | null;
    /** Score parasite: floors advanced since last life loss from mutator. */
    parasiteFloors: number;
    /** Relic: free shuffle once per floor (consumed on use). */
    freeShuffleThisFloor: boolean;
    /** Gauntlet: ms remaining for whole run; null = off. */
    gauntletDeadlineMs: number | null;
    /** Cosmetic daily streak count (low pressure). */
    dailyStreakCount: number;
    /** Last run flip tile ids (local ghost / export). */
    flipHistory: string[];
    /** H1 Peek: charges and ephemeral reveals (do not count as committed flips). */
    peekCharges: number;
    peekRevealedTileIds: string[];
    /** H2 Undo: remaining undos this floor (cancel resolving before timer). */
    undoUsesThisFloor: number;
    /** H3 Gambit: one third-flip attempt per floor. */
    gambitAvailableThisFloor: boolean;
    gambitThirdFlipUsed: boolean;
    /** H4 Wild: one tile id with wild pairKey per run, or null. */
    wildTileId: string | null;
    wildMatchesRemaining: number;
    /** Stray remover power charges (remove one hidden tile from play). */
    strayRemoveCharges: number;
    strayRemoveArmed: boolean;
    /** Match score multiplier (shuffle tax stacks). */
    matchScoreMultiplier: number;
    /** N-back mutator: matches since last anchor highlight. */
    nBackMatchCounter: number;
    nBackAnchorPairKey: string | null;
    /** Pair keys matched this run (spaced encore bookkeeping). */
    matchedPairKeysThisRun: string[];
    /** Distraction UI tick (renderer). */
    distractionTick: number;
    weakerShuffleMode: WeakerShuffleMode;
    shuffleScoreTaxActive: boolean;
    /** Copied from settings at run start for resolve timing. */
    resolveDelayMultiplier: number;
    echoFeedbackEnabled: boolean;
    /** Started from Wild / Joker menu (restart routing). */
    wildMenuRun: boolean;
}

export type AchievementState = Record<AchievementId, boolean>;

export interface PlayerStatsPersisted {
    bestFloorNoPowers: number;
    dailiesCompleted: number;
    lastDailyDateKeyUtc: string | null;
    /** Cosmetic streak: consecutive UTC days with at least one daily completed. */
    dailyStreakCosmetic: number;
    relicPickCounts: Partial<Record<RelicId, number>>;
    /** Spaced encore: pairKeys seen on previous completed run (no PII). */
    encorePairKeysLastRun: string[];
}

export interface SaveData {
    schemaVersion: number;
    bestScore: number;
    achievements: AchievementState;
    settings: Settings;
    onboardingDismissed: boolean;
    lastRunSummary: RunSummary | null;
    /** v3+ meta */
    playerStats?: PlayerStatsPersisted;
    unlocks?: string[];
    powersFtueSeen?: boolean;
}

export interface DesktopApi {
    getSettings: () => Promise<Settings>;
    saveSettings: (settings: Settings) => Promise<Settings>;
    getSaveData: () => Promise<SaveData>;
    saveGame: (data: SaveData) => Promise<SaveData>;
    unlockAchievement: (id: AchievementId) => Promise<boolean>;
    isSteamConnected: () => Promise<boolean>;
    setDisplayMode: (mode: DisplayMode) => Promise<void>;
    quitApp: () => Promise<void>;
}
