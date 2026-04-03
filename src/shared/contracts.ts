export const SAVE_SCHEMA_VERSION = 2;
export const INITIAL_LIVES = 4;
export const MAX_LIVES = 5;
export const MATCH_DELAY_MS = 850;
export const DEBUG_REVEAL_MS = 1500;
export const MEMORIZE_BASE_MS = 1300;
export const MEMORIZE_STEP_MS = 50;
export const MEMORIZE_MIN_MS = 600;
export const COMBO_GUARD_STREAK_STEP = 4;
export const CHAIN_HEAL_STREAK_STEP = 8;
export const MAX_GUARD_TOKENS = 2;
export const MAX_COMBO_SHARDS = 2;

export type DisplayMode = 'windowed' | 'fullscreen';
export type TileState = 'hidden' | 'flipped' | 'matched';
export type Rating = 'S++' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
export type ClearLifeReason = 'none' | 'clean' | 'perfect';
export type ViewState = 'boot' | 'menu' | 'settings' | 'playing' | 'gameOver';
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

export interface Settings {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    displayMode: DisplayMode;
    uiScale: number;
    reduceMotion: boolean;
    debugFlags: DebugFlags;
}

export interface Tile {
    id: string;
    pairKey: string;
    symbol: string;
    label: string;
    state: TileState;
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
    timerState: RunTimerState;
    lastLevelResult: LevelResult | null;
    lastRunSummary: RunSummary | null;
}

export type AchievementState = Record<AchievementId, boolean>;

export interface SaveData {
    schemaVersion: number;
    bestScore: number;
    achievements: AchievementState;
    settings: Settings;
    onboardingDismissed: boolean;
    lastRunSummary: RunSummary | null;
}

export interface DesktopApi {
    getSettings: () => Promise<Settings>;
    saveSettings: (settings: Settings) => Promise<Settings>;
    getSaveData: () => Promise<SaveData>;
    saveGame: (data: SaveData) => Promise<SaveData>;
    unlockAchievement: (id: AchievementId) => Promise<boolean>;
    isSteamConnected: () => Promise<boolean>;
    setDisplayMode: (mode: DisplayMode) => Promise<void>;
}
