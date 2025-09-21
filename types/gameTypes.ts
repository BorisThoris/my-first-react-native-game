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
  lives: number;
  maxLives: number;
  focus: number;
  recall: number;
  patternRecognition: number;
  concentration: number;
  items: Item[];
  currentFloor: number;
  roomsCompleted: number;
  points: number;
  streak: number;
  maxStreak: number;
  shopItems: ShopItem[];
  keys: number;
  bombs: number;
  consumables: { [key: string]: number };
}

export interface Item {
  id: string;
  name: string;
  description: string;
  effect: Partial<PlayerStats>;
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
export const createPlayerStats = (): PlayerStats => ({
  lives: 3,
  maxLives: 3,
  focus: 0,
  recall: 0,
  patternRecognition: 0,
  concentration: 0,
  items: [
    // Sample items for testing inventory
    {
      id: 'memory-boost',
      name: 'Memory Boost',
      description: 'Increases preview time by 0.5s',
      effect: { focus: 1 },
      type: 'passive',
      rarity: 'common'
    },
    {
      id: 'lucky-coin',
      name: 'Lucky Coin',
      description: '10% chance for double points',
      effect: { points: 10 },
      type: 'passive',
      rarity: 'common'
    },
    {
      id: 'red-heart',
      name: 'Red Heart',
      description: 'Restores 1 life',
      effect: { lives: 1 },
      type: 'consumable',
      rarity: 'common'
    }
  ],
  currentFloor: 1,
  roomsCompleted: 0,
  points: 0,
  streak: 0,
  maxStreak: 0,
  shopItems: [],
  keys: 0,
  bombs: 0,
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


