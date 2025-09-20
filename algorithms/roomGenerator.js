import { RoomTypes, createTile, TileStates } from '../types/gameTypes';

export class RoomGenerator {
  static generateRoom(type, difficulty, floorNumber, seed = null) {
    const roomId = `room-${floorNumber}-${type}-${Math.random().toString(36).substr(2, 9)}`;
    const gridSize = this.getRoomSize(type, difficulty);
    const tiles = this.generateTiles(type, difficulty, gridSize, seed);
    
    return {
      id: roomId,
      type,
      difficulty,
      floorNumber,
      completed: false,
      returnable: type !== RoomTypes.BOSS, // Boss rooms are not returnable
      matrix: this.createRoomMatrix(tiles, gridSize),
      connections: this.generateConnections(type, floorNumber),
      rewards: this.generateRewards(type, difficulty),
      tiles,
      gridSize,
      // State persistence
      flippedTiles: [],
      matchedTiles: [],
      roomState: 'incomplete'
    };
  }
  
  static getRoomSize(type, difficulty) {
    const baseSizes = {
      [RoomTypes.MEMORY_CHAMBER]: 2 + Math.floor(difficulty / 2),
      [RoomTypes.BOSS]: 4 + Math.floor(difficulty / 2),
      [RoomTypes.TREASURE]: 2,
      [RoomTypes.TRAP]: 2 + Math.floor(difficulty / 3)
    };
    
    const size = baseSizes[type] || 2;
    return Math.min(size, 8); // Cap at 8x8 for mobile
  }
  
  static generateTiles(type, difficulty, gridSize, seed) {
    const totalTiles = gridSize * gridSize;
    const pairs = Math.floor(totalTiles / 2);
    
    // Generate tile pairs
    const tilePairs = [];
    for (let i = 0; i < pairs; i++) {
      const shape = this.generateTileShape(type, difficulty, i);
      const pairId = `pair-${i}`;
      
      // Create two tiles for each pair
      tilePairs.push(
        createTile(`tile-${i}-1`, shape, 0, 0, pairId),
        createTile(`tile-${i}-2`, shape, 0, 0, pairId)
      );
    }
    
    // Shuffle tiles
    return this.shuffleTiles(tilePairs, seed);
  }
  
  static generateTileShape(type, difficulty, index) {
    const shapes = {
      [RoomTypes.MEMORY_CHAMBER]: ['🔴', '🔷', '🔺', '⭐', '⚪', '⬛', '🔶', '⬜'],
      [RoomTypes.BOSS]: ['💎', '🍀', '🔥', '🌊', '⚡', '❄️', '🌟', '💫'],
      [RoomTypes.TREASURE]: ['💰', '💎', '🏆', '👑'],
      [RoomTypes.TRAP]: ['💀', '☠️', '⚠️', '🚫']
    };
    
    const typeShapes = shapes[type] || shapes[RoomTypes.MEMORY_CHAMBER];
    return typeShapes[index % typeShapes.length];
  }
  
  static createRoomMatrix(tiles, gridSize) {
    const matrix = Array(gridSize).fill(null).map(() => 
      Array(gridSize).fill(null)
    );
    
    // Place tiles in matrix
    tiles.forEach((tile, index) => {
      const x = index % gridSize;
      const y = Math.floor(index / gridSize);
      matrix[y][x] = tile;
      tile.x = x;
      tile.y = y;
    });
    
    return matrix;
  }
  
  static shuffleTiles(tiles, seed) {
    // Simple shuffle algorithm
    const shuffled = [...tiles];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  static generateConnections(type, floorNumber) {
    // For demo, rooms are linear
    if (type === RoomTypes.BOSS) {
      return []; // Boss rooms have no connections
    }
    
    return [`room-${floorNumber}-${type}-next`];
  }
  
  static generateRewards(type, difficulty) {
    const rewards = [];
    
    if (type === RoomTypes.TREASURE) {
      rewards.push({
        type: 'item',
        item: 'focus-crystal',
        probability: 0.8
      });
    }
    
    if (type === RoomTypes.BOSS) {
      rewards.push({
        type: 'stat',
        stat: 'focus',
        value: 5,
        probability: 1.0
      });
    }
    
    return rewards;
  }
}

export default RoomGenerator;
