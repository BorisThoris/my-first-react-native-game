// Game type definitions for the roguelike memory game

export const RoomTypes = {
  MEMORY_CHAMBER: 'memory-chamber',
  BOSS: 'boss',
  TREASURE: 'treasure',
  TRAP: 'trap',
  SHOP: 'shop',
  SECRET: 'secret',
  CURSE: 'curse',
  CHALLENGE: 'challenge',
  LIBRARY: 'library',
  CURSED_ROOM: 'cursed-room',
  DEVIL_ROOM: 'devil-room',
  ANGEL_ROOM: 'angel-room'
} as const;

export const GameStates = {
  EXPLORING: 'exploring',
  IN_ROOM: 'in-room',
  VICTORY: 'victory',
  DEFEAT: 'defeat'
} as const;

export const TileStates = {
  HIDDEN: 'hidden',
  FLIPPED: 'flipped',
  MATCHED: 'matched',
  MISMATCHED: 'mismatched',
  PREVIEW: 'preview'
} as const;

// Type definitions
export type RoomType = typeof RoomTypes[keyof typeof RoomTypes];
export type GameState = typeof GameStates[keyof typeof GameStates];
export type TileState = typeof TileStates[keyof typeof TileStates];

export interface PlayerStats {
  // Core Stats
  lives: number;
  maxLives: number;
  level: number;
  experience: number;
  
  // Memory Stats
  focus: number;
  recall: number;
  patternRecognition: number;
  concentration: number;
  intuition: number;
  perception: number;
  
  // Resources
  points: number;
  keys: number;
  bombs: number;
  currency: number;
  
  // Progression
  currentFloor: number;
  roomsCompleted: number;
  streak: number;
  maxStreak: number;
  
  // Collections
  items: Item[];
  abilities: any[]; // Using any[] for now to avoid circular imports
  skills: any[]; // Using any[] for now to avoid circular imports
  tomes: any[]; // Using any[] for now to avoid circular imports
  relics: any[]; // Using any[] for now to avoid circular imports
  
  // Legacy
  shopItems: ShopItem[];
  consumables: { [key: string]: number };
}

export interface Item {
  id: string;
  name: string;
  description: string;
  effects: Partial<PlayerStats>; // Changed from effect to effects to match collectible types
  type: 'passive' | 'consumable' | 'equipment';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'life' | 'boss-skip' | 'key' | 'bomb' | 'streak-boost' | 'point-multiplier';
  effect: Partial<PlayerStats>;
  maxUses?: number;
  currentUses?: number;
}

export interface Tile {
  id: string;
  shape: string;
  x: number;
  y: number;
  state: TileState;
  pairId: string | null;
}

export interface Room {
  id: string;
  type: RoomType;
  difficulty: number;
  floorNumber: number;
  completed: boolean;
  returnable: boolean;
  matrix: (Tile | null)[][];
  connections: string[];
  rewards: any[];
  tiles: Tile[];
  gridSize: number;
  flippedTiles: string[];
  matchedTiles: string[];
  roomState: 'incomplete' | 'completed';
  memoryGameType?: string; // Memory game type for this room
  isLocked?: boolean;
  requiresKey?: boolean;
  specialProperties?: { [key: string]: any };
}

export interface Floor {
  floorNumber: number;
  rooms: Room[];
  completed: boolean;
  bossDefeated: boolean;
}

// Factory functions
export const createPlayerStats = (): any => ({
  // Core Stats
  lives: 3,
  maxLives: 3,
  level: 1,
  experience: 0,
  
  // Memory Stats
  focus: 0,
  recall: 0,
  patternRecognition: 0,
  concentration: 0,
  intuition: 0,
  perception: 0,
  
  // Resources
  points: 0,
  keys: 0,
  bombs: 0,
  currency: 0,
  
  // Progression
  currentFloor: 1,
  roomsCompleted: 0,
  streak: 0,
  maxStreak: 0,
  
  // Collections - Start empty, items earned through gameplay
  items: [],
  abilities: [],
  skills: [],
  tomes: [],
  relics: [],
  
  // Legacy
  shopItems: [],
  consumables: {}
});

export const createItem = (id: string, name: string, description: string, effect: Partial<PlayerStats>, type: Item['type']): Item => ({
  id,
  name,
  description,
  effect,
  type,
  rarity: 'common'
});

export const createShopItem = (id: string, name: string, description: string, cost: number, type: ShopItem['type'], effect: Partial<PlayerStats>, maxUses?: number): ShopItem => ({
  id,
  name,
  description,
  cost,
  type,
  effect,
  maxUses,
  currentUses: maxUses || 0
});

export const createTile = (id: string, shape: string, x: number, y: number, pairId: string | null = null): Tile => ({
  id,
  shape,
  x,
  y,
  state: TileStates.HIDDEN,
  pairId
});

export const createRoom = (id: string, type: RoomType, difficulty: number, floorNumber: number): Room => ({
  id,
  type,
  difficulty,
  floorNumber,
  completed: false,
  returnable: type !== RoomTypes.BOSS,
  matrix: [],
  connections: [],
  rewards: [],
  tiles: [],
  gridSize: 0,
  flippedTiles: [],
  matchedTiles: [],
  roomState: 'incomplete'
});

export const createFloor = (floorNumber: number, rooms: Room[]): Floor => ({
  floorNumber,
  rooms,
  completed: false,
  bossDefeated: false
});


