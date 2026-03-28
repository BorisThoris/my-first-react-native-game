export const SAVE_SCHEMA_VERSION = 1;
export const MAX_LIVES = 5;
export const MATCH_DELAY_MS = 850;
export const DEBUG_REVEAL_MS = 1500;

export type DisplayMode = 'windowed' | 'fullscreen';
export type TileState = 'hidden' | 'flipped' | 'matched';
export type Rating = 'S++' | 'S+' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
export type ViewState = 'boot' | 'menu' | 'settings' | 'playing' | 'gameOver';
export type RunStatus = 'idle' | 'playing' | 'paused' | 'levelComplete' | 'gameOver';

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
}

export interface LevelResult {
    level: number;
    scoreGained: number;
    rating: Rating;
    livesRemaining: number;
    perfect: boolean;
}

export interface RunSummary {
    totalScore: number;
    bestScore: number;
    levelsCleared: number;
    highestLevel: number;
    achievementsEnabled: boolean;
    unlockedAchievements: AchievementId[];
}

export interface RunState {
    status: RunStatus;
    lives: number;
    board: BoardState | null;
    stats: SessionStats;
    achievementsEnabled: boolean;
    debugUsed: boolean;
    debugPeekActive: boolean;
    lastLevelResult: LevelResult | null;
    lastRunSummary: RunSummary | null;
}

export type AchievementState = Record<AchievementId, boolean>;

export interface SaveData {
    schemaVersion: number;
    bestScore: number;
    achievements: AchievementState;
    settings: Settings;
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
