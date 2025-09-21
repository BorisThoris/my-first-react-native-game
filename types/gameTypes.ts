// Game type definitions for the roguelike memory game

export const RoomTypes = {
  MEMORY_CHAMBER: 'memory-chamber',
  BOSS: 'boss',
  TREASURE: 'treasure',
  TRAP: 'trap'
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
  MISMATCHED: 'mismatched'
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
  totalScore: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  effect: Partial<PlayerStats>;
  type: 'passive' | 'consumable' | 'equipment';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
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
  items: [],
  currentFloor: 1,
  roomsCompleted: 0,
  totalScore: 0
});

export const createItem = (id: string, name: string, description: string, effect: Partial<PlayerStats>, type: Item['type']): Item => ({
  id,
  name,
  description,
  effect,
  type,
  rarity: 'common'
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


