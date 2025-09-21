import { RoomTypes, createTile, TileStates, Room, RoomType, Tile } from '../types/gameTypes';

interface Reward {
  type: 'item' | 'stat';
  item?: string;
  stat?: string;
  value?: number;
  probability: number;
}

export class RoomGenerator {
  static generateRoom(type: RoomType, difficulty: number, floorNumber: number, seed: string | null = null): Room {
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
  
  static getRoomSize(type: RoomType, difficulty: number): number {
    const baseSizes: Record<RoomType, number> = {
      [RoomTypes.MEMORY_CHAMBER]: 2 + Math.floor(difficulty / 1.5), // More responsive to difficulty
      [RoomTypes.BOSS]: 4 + Math.floor(difficulty / 1.2),
      [RoomTypes.TREASURE]: 2 + Math.floor(difficulty / 4),
      [RoomTypes.TRAP]: 2 + Math.floor(difficulty / 2.5),
      [RoomTypes.SHOP]: 2,
      [RoomTypes.SECRET]: 2 + Math.floor(difficulty / 3),
      [RoomTypes.CURSE]: 2 + Math.floor(difficulty / 1.8),
      [RoomTypes.CHALLENGE]: 3 + Math.floor(difficulty / 1.5),
      [RoomTypes.LIBRARY]: 2 + Math.floor(difficulty / 2.5),
      [RoomTypes.CURSED_ROOM]: 3 + Math.floor(difficulty / 1.5),
      [RoomTypes.DEVIL_ROOM]: 4 + Math.floor(difficulty / 1.2),
      [RoomTypes.ANGEL_ROOM]: 3 + Math.floor(difficulty / 1.5)
    };
    
    const size = baseSizes[type] || 2;
    return Math.min(Math.max(size, 2), 8); // Min 2x2, max 8x8 for mobile
  }
  
  static generateTiles(type: RoomType, difficulty: number, gridSize: number, seed: string | null): Tile[] {
    const totalTiles = gridSize * gridSize;
    const pairs = Math.floor(totalTiles / 2);
    
    // Generate tile pairs
    const tilePairs: Tile[] = [];
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
  
  static generateTileShape(type: RoomType, difficulty: number, index: number): string {
    const baseShapes: Record<RoomType, string[]> = {
      [RoomTypes.MEMORY_CHAMBER]: ['🔴', '🔷', '🔺', '⭐', '⚪', '⬛', '🔶', '⬜'],
      [RoomTypes.BOSS]: ['💎', '🍀', '🔥', '🌊', '⚡', '❄️', '🌟', '💫'],
      [RoomTypes.TREASURE]: ['💰', '💎', '🏆', '👑'],
      [RoomTypes.TRAP]: ['💀', '☠️', '⚠️', '🚫'],
      [RoomTypes.SHOP]: ['🛒', '💰', '💳', '🏪'],
      [RoomTypes.SECRET]: ['🔍', '🗝️', '🔐', '🕵️'],
      [RoomTypes.CURSE]: ['💀', '☠️', '👻', '🦇'],
      [RoomTypes.CHALLENGE]: ['⚔️', '🛡️', '🏹', '🗡️'],
      [RoomTypes.LIBRARY]: ['📚', '📖', '📝', '✍️'],
      [RoomTypes.CURSED_ROOM]: ['👹', '😈', '🔥', '💀'],
      [RoomTypes.DEVIL_ROOM]: ['😈', '👹', '🔥', '⚡'],
      [RoomTypes.ANGEL_ROOM]: ['😇', '👼', '✨', '🌟']
    };
    
    // Add more complex shapes for higher difficulty
    const complexShapes = ['🔸', '🔹', '🔻', '🔺', '🔶', '🔷', '🔴', '🔵', '🟡', '🟢', '🟠', '🟣', '⚫', '⚪', '🟤', '🟨', '🟧', '🟩', '🟦', '🟪', '🟫'];
    
    let typeShapes = baseShapes[type] || baseShapes[RoomTypes.MEMORY_CHAMBER];
    
    // For memory chambers, add more complex shapes as difficulty increases
    if (type === RoomTypes.MEMORY_CHAMBER && difficulty > 2) {
      typeShapes = [...typeShapes, ...complexShapes.slice(0, Math.min(difficulty * 2, 10))];
    }
    
    return typeShapes[index % typeShapes.length];
  }
  
  static createRoomMatrix(tiles: Tile[], gridSize: number): (Tile | null)[][] {
    const matrix: (Tile | null)[][] = Array(gridSize).fill(null).map(() => 
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
  
  static shuffleTiles(tiles: Tile[], seed: string | null): Tile[] {
    // Simple shuffle algorithm
    const shuffled = [...tiles];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  static generateConnections(type: RoomType, floorNumber: number): string[] {
    // For demo, rooms are linear
    if (type === RoomTypes.BOSS) {
      return []; // Boss rooms have no connections
    }
    
    return [`room-${floorNumber}-${type}-next`];
  }
  
  static generateRewards(type: RoomType, difficulty: number): Reward[] {
    const rewards: Reward[] = [];
    
    switch (type) {
      case RoomTypes.TREASURE:
        rewards.push({
          type: 'item',
          item: 'focus-crystal',
          probability: 0.8
        });
        break;
        
      case RoomTypes.BOSS:
        rewards.push({
          type: 'stat',
          stat: 'focus',
          value: 5,
          probability: 1.0
        });
        break;
        
      case RoomTypes.SHOP:
        // Shop rewards are handled separately
        break;
        
      case RoomTypes.SECRET:
        rewards.push({
          type: 'item',
          item: 'memory-boost',
          probability: 0.6
        });
        break;
        
      case RoomTypes.CHALLENGE:
        rewards.push({
          type: 'item',
          item: 'perfect-memory',
          probability: 0.7
        });
        break;
        
      case RoomTypes.LIBRARY:
        rewards.push({
          type: 'item',
          item: 'eidetic-memory',
          probability: 0.5
        });
        break;
        
      case RoomTypes.CURSED_ROOM:
        rewards.push({
          type: 'item',
          item: 'cursed-eye',
          probability: 0.8
        });
        break;
        
      case RoomTypes.DEVIL_ROOM:
        rewards.push({
          type: 'item',
          item: 'boss-slayer',
          probability: 0.9
        });
        break;
        
      case RoomTypes.ANGEL_ROOM:
        rewards.push({
          type: 'item',
          item: 'room-master',
          probability: 0.8
        });
        break;
    }
    
    return rewards;
  }
}

export default RoomGenerator;
