// Game type definitions for the roguelike memory game

export const RoomTypes = {
  MEMORY_CHAMBER: 'memory-chamber',
  BOSS: 'boss',
  TREASURE: 'treasure',
  TRAP: 'trap'
};

export const GameStates = {
  EXPLORING: 'exploring',
  IN_ROOM: 'in-room',
  VICTORY: 'victory',
  DEFEAT: 'defeat'
};

export const TileStates = {
  HIDDEN: 'hidden',
  FLIPPED: 'flipped',
  MATCHED: 'matched',
  MISMATCHED: 'mismatched'
};

// Room data structure
export const createRoom = (id, type, difficulty, floorNumber) => ({
  id,
  type,
  difficulty,
  floorNumber,
  completed: false,
  returnable: type !== RoomTypes.BOSS, // Boss rooms are not returnable
  matrix: null, // Will be populated by room generator
  connections: [], // Connected room IDs
  rewards: [], // Items/upgrades available
  tiles: [], // Generated tile data
  gridSize: 0, // Will be calculated based on type and difficulty
  // State persistence
  flippedTiles: [], // Tiles that are currently flipped
  matchedTiles: [], // Tiles that have been matched
  roomState: 'incomplete' // 'incomplete', 'completed'
});

// Floor data structure
export const createFloor = (floorNumber, rooms) => ({
  floorNumber,
  rooms,
  completed: false,
  bossDefeated: false
});

// Player stats
export const createPlayerStats = () => ({
  lives: 3,
  maxLives: 3,
  focus: 0,      // Affects tile flip speed
  recall: 0,     // Affects reset time
  patternRecognition: 0, // Reveals partial patterns
  concentration: 0, // Reduces penalty for mismatches
  items: [],
  currentFloor: 1,
  roomsCompleted: 0,
  totalScore: 0
});

// Item data structure
export const createItem = (id, name, description, effect, type) => ({
  id,
  name,
  description,
  effect, // Object with stat modifications
  type, // 'passive', 'consumable', 'equipment'
  rarity: 'common' // 'common', 'uncommon', 'rare', 'epic', 'legendary'
});

// Tile data structure
export const createTile = (id, shape, x, y, pairId = null) => ({
  id,
  shape,
  x,
  y,
  state: TileStates.HIDDEN,
  pairId // ID of the matching tile
});
