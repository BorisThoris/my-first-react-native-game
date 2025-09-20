import { create } from 'zustand';
import { createPlayerStats, createItem } from '../types/gameTypes';

const useGameStore = create((set, get) => ({
  // State
  playerStats: createPlayerStats(),
  gameState: 'exploring', // 'exploring', 'in-room', 'victory', 'defeat'
  currentRoomTiles: [],
  flippedTiles: [],
  matchedTiles: [],
  
  // Actions
  updateStats: (statUpdates) => {
    set(state => ({
      playerStats: {
        ...state.playerStats,
        ...statUpdates
      }
    }));
  },
  
  loseLife: () => {
    set(state => ({
      playerStats: {
        ...state.playerStats,
        lives: Math.max(0, state.playerStats.lives - 1)
      }
    }));
  },
  
  gainLife: () => {
    set(state => ({
      playerStats: {
        ...state.playerStats,
        lives: Math.min(state.playerStats.maxLives, state.playerStats.lives + 1)
      }
    }));
  },
  
  addItem: (item) => {
    set(state => ({
      playerStats: {
        ...state.playerStats,
        items: [...state.playerStats.items, item]
      }
    }));
  },
  
  useItem: (itemId) => {
    const { playerStats } = get();
    const item = playerStats.items.find(i => i.id === itemId);
    
    if (item && item.type === 'consumable') {
      // Apply item effect
      set(state => ({
        playerStats: {
          ...state.playerStats,
          ...item.effect,
          items: state.playerStats.items.filter(i => i.id !== itemId)
        }
      }));
    }
  },
  
  setCurrentRoomTiles: (tiles, roomState = null) => {
    set({
      currentRoomTiles: tiles,
      flippedTiles: roomState?.flippedTiles || [],
      matchedTiles: roomState?.matchedTiles || []
    });
  },
  
  flipTile: (tileId) => {
    const { flippedTiles, matchedTiles, currentRoomTiles } = get();
    
    // Don't flip if already flipped or matched
    if (flippedTiles.includes(tileId) || matchedTiles.includes(tileId)) {
      return;
    }
    
    // Don't flip more than 2 tiles at once
    if (flippedTiles.length >= 2) {
      return;
    }
    
    set({
      flippedTiles: [...flippedTiles, tileId]
    });
  },
  
  checkMatch: () => {
    const { flippedTiles, currentRoomTiles, matchedTiles } = get();
    
    if (flippedTiles.length !== 2) return;
    
    const [firstId, secondId] = flippedTiles;
    const firstTile = currentRoomTiles.find(t => t.id === firstId);
    const secondTile = currentRoomTiles.find(t => t.id === secondId);
    
    const isMatch = firstTile && secondTile && firstTile.shape === secondTile.shape;
    
    if (isMatch) {
      // Match found
      set({
        matchedTiles: [...matchedTiles, firstId, secondId],
        flippedTiles: []
      });
      
      // Check if room is completed
      const allMatched = currentRoomTiles.every(tile => 
        matchedTiles.includes(tile.id) || tile.id === firstId || tile.id === secondId
      );
      
      if (allMatched) {
        // Room completed
        set(state => ({
          playerStats: {
            ...state.playerStats,
            roomsCompleted: state.playerStats.roomsCompleted + 1,
            totalScore: state.playerStats.totalScore + 100
          }
        }));
      }
    } else {
      // Mismatch - lose life and reset
      set(state => ({
        playerStats: {
          ...state.playerStats,
          lives: Math.max(0, state.playerStats.lives - 1)
        },
        flippedTiles: []
      }));
    }
  },
  
  resetFlippedTiles: () => {
    set({
      flippedTiles: []
    });
  },
  
  saveRoomState: (roomId, flippedTiles, matchedTiles) => {
    // This will be called by the dungeon store to save room state
    return { flippedTiles, matchedTiles };
  },
  
  loadRoomState: (room) => {
    // Load the saved state from the room
    return {
      flippedTiles: room.flippedTiles || [],
      matchedTiles: room.matchedTiles || []
    };
  },
  
  resetGame: () => {
    set({
      playerStats: createPlayerStats(),
      gameState: 'exploring',
      currentRoomTiles: [],
      flippedTiles: [],
      matchedTiles: []
    });
  },
  
  // Getters
  getPlayerStats: () => get().playerStats,
  getCurrentRoomTiles: () => get().currentRoomTiles,
  getFlippedTiles: () => get().flippedTiles,
  getMatchedTiles: () => get().matchedTiles,
  isGameOver: () => get().playerStats.lives <= 0,
  isRoomCompleted: () => {
    const { currentRoomTiles, matchedTiles } = get();
    return currentRoomTiles.every(tile => matchedTiles.includes(tile.id));
  }
}));

export default useGameStore;
