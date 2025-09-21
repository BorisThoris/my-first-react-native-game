import { create } from 'zustand';
import { createPlayerStats, createItem, createShopItem, PlayerStats, Tile, GameState as GameStateType, Room, ShopItem } from '../types/gameTypes';
import { Item, ItemType, ConsumableType } from '../types/itemTypes';
import useDungeonStore from './dungeonStore';

interface GameState {
  playerStats: PlayerStats;
  gameState: GameStateType;
  currentRoomTiles: Tile[];
  flippedTiles: string[];
  matchedTiles: string[];
  previewTiles: string[];
  isPreviewing: boolean;
  // Helper modifiers
  availableHelpers: {
    extraLife: boolean;
    tileFlip: boolean;
    hint: boolean;
    timeExtension: boolean;
  };
  helperUses: {
    extraLife: number;
    tileFlip: number;
    hint: number;
    timeExtension: number;
  };
}

interface GameActions {
  updateStats: (statUpdates: Partial<PlayerStats>) => void;
  loseLife: () => void;
  gainLife: () => void;
  addItem: (item: any) => void;
  useItem: (itemId: string) => void;
  setCurrentRoomTiles: (tiles: Tile[], roomState?: { flippedTiles: string[]; matchedTiles: string[] } | null) => void;
  flipTile: (tileId: string) => void;
  checkMatch: () => void;
  resetFlippedTiles: () => void;
  saveRoomState: (roomId: string, flippedTiles: string[], matchedTiles: string[]) => { flippedTiles: string[]; matchedTiles: string[] };
  loadRoomState: (room: Room) => { flippedTiles: string[]; matchedTiles: string[] };
  resetGame: () => void;
  getPlayerStats: () => PlayerStats;
  getCurrentRoomTiles: () => Tile[];
  getFlippedTiles: () => string[];
  getMatchedTiles: () => string[];
  isGameOver: () => boolean;
  isRoomCompleted: () => boolean;
  // Streak and points
  addPoints: (points: number) => void;
  updateStreak: (increment: boolean) => void;
  resetStreak: () => void;
  // Shop
  buyShopItem: (itemId: string) => boolean;
  useShopItem: (itemId: string) => boolean;
  getAvailableShopItems: () => ShopItem[];
  // Preview
  startPreview: () => void;
  endPreview: () => void;
  cheatPreview: () => boolean;
  // Inventory
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  useConsumable: (itemId: string) => void;
  addKeys: (amount: number) => void;
  addBombs: (amount: number) => void;
  useKey: () => boolean;
  useBomb: () => boolean;
  // Helper modifiers
  updateAvailableHelpers: () => void;
  useHelper: (helperType: 'extraLife' | 'tileFlip' | 'hint' | 'timeExtension') => boolean;
  getAvailableHelpers: () => { extraLife: boolean; tileFlip: boolean; hint: boolean; timeExtension: boolean };
  getHelperUses: () => { extraLife: number; tileFlip: number; hint: number; timeExtension: number };
  // Special abilities
  flipRandomTiles: (count: number) => void;
  showHint: () => string[];
  extendTime: (seconds: number) => void;
}

type GameStore = GameState & GameActions;

const useGameStore = create<GameStore>((set, get) => ({
  // State
  playerStats: createPlayerStats(),
  gameState: 'exploring' as GameStateType,
  currentRoomTiles: [],
  flippedTiles: [],
  matchedTiles: [],
  previewTiles: [],
  isPreviewing: false,
  // Helper modifiers
  availableHelpers: {
    extraLife: false,
    tileFlip: false,
    hint: false,
    timeExtension: false,
  },
  helperUses: {
    extraLife: 0,
    tileFlip: 0,
    hint: 0,
    timeExtension: 0,
  },
  
  // Actions
  updateStats: (statUpdates: Partial<PlayerStats>) => {
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
  
  addItem: (item: any) => {
    set(state => ({
      playerStats: {
        ...state.playerStats,
        items: [...state.playerStats.items, item]
      }
    }));
  },
  
  useItem: (itemId: string) => {
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
  
  setCurrentRoomTiles: (tiles: Tile[], roomState: { flippedTiles: string[]; matchedTiles: string[] } | null = null) => {
    set({
      currentRoomTiles: tiles,
      flippedTiles: roomState?.flippedTiles || [],
      matchedTiles: roomState?.matchedTiles || [],
      previewTiles: tiles.map(tile => tile.id), // All tiles start in preview
      isPreviewing: true
    });
    
    // End preview after 1 second
    setTimeout(() => {
      get().endPreview();
    }, 1000);
  },
  
  flipTile: (tileId: string) => {
    const { flippedTiles, matchedTiles, currentRoomTiles } = get();
    
    // Don't flip if already flipped or matched
    if (flippedTiles.includes(tileId) || matchedTiles.includes(tileId)) {
      return;
    }
    
    // Don't flip more than 2 tiles at once
    if (flippedTiles.length >= 2) {
      return;
    }
    
    const newFlippedTiles = [...flippedTiles, tileId];
    
    set({
      flippedTiles: newFlippedTiles
    });
    
    // Auto-check for match when 2 tiles are flipped
    if (newFlippedTiles.length === 2) {
      setTimeout(() => {
        get().checkMatch();
      }, 1000); // 1 second delay to show the tiles
    }
  },
  
  checkMatch: () => {
    const { flippedTiles, currentRoomTiles, matchedTiles } = get();
    
    if (flippedTiles.length !== 2) return;
    
    const [firstId, secondId] = flippedTiles;
    const firstTile = currentRoomTiles.find(t => t.id === firstId);
    const secondTile = currentRoomTiles.find(t => t.id === secondId);
    
    const isMatch = firstTile && secondTile && firstTile.shape === secondTile.shape;
    
    if (isMatch) {
      // Match found - add to matched tiles and clear flipped
      set({
        matchedTiles: [...matchedTiles, firstId, secondId],
        flippedTiles: []
      });
      
      // Update streak and add points
      get().updateStreak(true);
      const streakBonus = Math.floor(get().playerStats.streak / 3) * 10; // Bonus points every 3 matches
      get().addPoints(50 + streakBonus); // Base 50 points + streak bonus
      
      // Check if room is completed
      const newMatchedTiles = [...matchedTiles, firstId, secondId];
      const allMatched = currentRoomTiles.every(tile => 
        newMatchedTiles.includes(tile.id)
      );
      
      if (allMatched) {
        // Room completed - bonus points
        get().addPoints(200);
        
        // Check if this is a boss room for extra rewards
        const currentRoom = useDungeonStore.getState().currentRoom;
        const isBossRoom = currentRoom?.type === 'boss';
        
        if (isBossRoom) {
          // Boss completion bonus
          get().addPoints(500);
          get().gainLife(); // Restore one life for beating boss
        }
        
        set(state => ({
          playerStats: {
            ...state.playerStats,
            roomsCompleted: state.playerStats.roomsCompleted + 1
          }
        }));
      }
    } else {
      // Mismatch - lose life, reset streak, and flip tiles back after delay
      get().resetStreak();
      set(state => ({
        playerStats: {
          ...state.playerStats,
          lives: Math.max(0, state.playerStats.lives - 1)
        }
      }));
      
      // Flip tiles back after a short delay
      setTimeout(() => {
        set({
          flippedTiles: []
        });
      }, 1500); // 1.5 second delay to show the mismatch
    }
  },
  
  resetFlippedTiles: () => {
    set({
      flippedTiles: []
    });
  },
  
  saveRoomState: (roomId: string, flippedTiles: string[], matchedTiles: string[]) => {
    // This will be called by the dungeon store to save room state
    return { flippedTiles, matchedTiles };
  },
  
  loadRoomState: (room: Room) => {
    // Load the saved state from the room
    return {
      flippedTiles: room.flippedTiles || [],
      matchedTiles: room.matchedTiles || []
    };
  },
  
  resetGame: () => {
    set({
      playerStats: createPlayerStats(),
      gameState: 'exploring' as GameStateType,
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
    return currentRoomTiles.length > 0 && currentRoomTiles.every(tile => matchedTiles.includes(tile.id));
  },
  
  // Streak and points
  addPoints: (points: number) => {
    set(state => ({
      playerStats: {
        ...state.playerStats,
        points: state.playerStats.points + points
      }
    }));
  },
  
  updateStreak: (increment: boolean) => {
    const currentStreak = get().playerStats.streak;
    const newStreak = increment ? currentStreak + 1 : 0;
    
    set(state => ({
      playerStats: {
        ...state.playerStats,
        streak: newStreak,
        maxStreak: increment ? Math.max(state.playerStats.maxStreak, newStreak) : state.playerStats.maxStreak
      }
    }));

    // Give helper uses based on streak milestones
    if (increment) {
      const { helperUses } = get();
      const newHelperUses = { ...helperUses };
      
      // Give helper uses at streak milestones
      if (newStreak === 3) {
        // Auto-give extra life immediately
        get().gainLife();
        newHelperUses.tileFlip += 2;
      } else if (newStreak === 5) {
        newHelperUses.hint += 3;
        newHelperUses.tileFlip += 1;
      } else if (newStreak === 7) {
        // Auto-give extra life immediately
        get().gainLife();
        newHelperUses.timeExtension += 1;
      } else if (newStreak === 10) {
        // Big milestone - auto-give extra lives and all helpers
        get().gainLife();
        get().gainLife(); // Give 2 extra lives
        newHelperUses.tileFlip += 3;
        newHelperUses.hint += 5;
        newHelperUses.timeExtension += 2;
      }
      
      set({ helperUses: newHelperUses });
      get().updateAvailableHelpers();
    } else {
      // Reset helper availability when streak is broken
      get().updateAvailableHelpers();
    }
  },
  
  resetStreak: () => {
    set(state => ({
      playerStats: {
        ...state.playerStats,
        streak: 0
      }
    }));
  },
  
  // Shop
  buyShopItem: (itemId: string) => {
    const { playerStats } = get();
    const shopItem = playerStats.shopItems.find(item => item.id === itemId);
    
    if (!shopItem || playerStats.points < shopItem.cost) {
      return false;
    }
    
    set(state => ({
      playerStats: {
        ...state.playerStats,
        points: state.playerStats.points - shopItem.cost,
        shopItems: state.playerStats.shopItems.map(item => 
          item.id === itemId 
            ? { ...item, currentUses: (item.currentUses || 0) + 1 }
            : item
        )
      }
    }));
    
    return true;
  },
  
  useShopItem: (itemId: string) => {
    const { playerStats } = get();
    const shopItem = playerStats.shopItems.find(item => item.id === itemId);
    
    if (!shopItem || (shopItem.currentUses || 0) <= 0) {
      return false;
    }
    
    // Apply the item effect
    set(state => ({
      playerStats: {
        ...state.playerStats,
        ...shopItem.effect,
        shopItems: state.playerStats.shopItems.map(item => 
          item.id === itemId 
            ? { ...item, currentUses: (item.currentUses || 0) - 1 }
            : item
        )
      }
    }));
    
    return true;
  },
  
  getAvailableShopItems: () => {
    const { playerStats } = get();
    return playerStats.shopItems.filter(item => (item.currentUses || 0) > 0);
  },
  
  // Preview
  startPreview: () => {
    const { currentRoomTiles } = get();
    set({
      previewTiles: currentRoomTiles.map(tile => tile.id),
      isPreviewing: true
    });
  },
  
  endPreview: () => {
    set({
      previewTiles: [],
      isPreviewing: false
    });
  },
  
  cheatPreview: () => {
    const { playerStats, currentRoomTiles } = get();
    const cheatCost = 50; // Cost to cheat preview
    
    if (playerStats.points < cheatCost) {
      return false;
    }
    
    // Deduct points and start preview
    set(state => ({
      playerStats: {
        ...state.playerStats,
        points: state.playerStats.points - cheatCost
      },
      previewTiles: currentRoomTiles.map(tile => tile.id),
      isPreviewing: true
    }));
    
    // End preview after 1 second
    setTimeout(() => {
      get().endPreview();
    }, 1000);
    
    return true;
  },
  
  // Inventory management
  addItem: (item: Item) => {
    set(state => ({
      playerStats: {
        ...state.playerStats,
        items: [...state.playerStats.items, item]
      }
    }));
  },
  
  removeItem: (itemId: string) => {
    set(state => ({
      playerStats: {
        ...state.playerStats,
        items: state.playerStats.items.filter(item => item.id !== itemId)
      }
    }));
  },
  
  useConsumable: (itemId: string) => {
    const state = get();
    const item = state.playerStats.items.find(i => i.id === itemId);
    
    if (!item || item.type !== ItemType.CONSUMABLE) return;
    
    // Apply consumable effects
    item.effects.forEach(effect => {
      switch (effect.type) {
        case ConsumableType.HEALTH:
          set(s => ({
            playerStats: {
              ...s.playerStats,
              lives: Math.min(s.playerStats.lives + effect.value, s.playerStats.maxLives)
            }
          }));
          break;
        case ConsumableType.KEYS:
          get().addKeys(effect.value);
          break;
        case ConsumableType.BOMBS:
          get().addBombs(effect.value);
          break;
        case ConsumableType.POINTS:
          get().addPoints(effect.value);
          break;
      }
    });
    
    // Remove consumable
    get().removeItem(itemId);
  },
  
  addKeys: (amount: number) => {
    set(state => ({
      playerStats: {
        ...state.playerStats,
        keys: state.playerStats.keys + amount
      }
    }));
  },
  
  addBombs: (amount: number) => {
    set(state => ({
      playerStats: {
        ...state.playerStats,
        bombs: state.playerStats.bombs + amount
      }
    }));
  },
  
  useKey: () => {
    const state = get();
    if (state.playerStats.keys > 0) {
      set(s => ({
        playerStats: {
          ...s.playerStats,
          keys: s.playerStats.keys - 1
        }
      }));
      return true;
    }
    return false;
  },
  
  useBomb: () => {
    const state = get();
    if (state.playerStats.bombs > 0) {
      set(s => ({
        playerStats: {
          ...s.playerStats,
          bombs: s.playerStats.bombs - 1
        }
      }));
      return true;
    }
    return false;
  },

  // Helper modifiers
  updateAvailableHelpers: () => {
    const { playerStats } = get();
    const streak = playerStats.streak;
    const roomsCompleted = playerStats.roomsCompleted;
    
    set({
      availableHelpers: {
        extraLife: streak >= 3 || roomsCompleted >= 5,
        tileFlip: streak >= 2 || roomsCompleted >= 3,
        hint: streak >= 1 || roomsCompleted >= 2,
        timeExtension: streak >= 4 || roomsCompleted >= 7,
      }
    });
  },

  useHelper: (helperType: 'extraLife' | 'tileFlip' | 'hint' | 'timeExtension') => {
    const { availableHelpers, helperUses, playerStats } = get();
    
    if (!availableHelpers[helperType] || helperUses[helperType] <= 0) {
      return false;
    }

    // Update helper uses
    set(state => ({
      helperUses: {
        ...state.helperUses,
        [helperType]: state.helperUses[helperType] - 1
      }
    }));

    // Apply helper effect
    switch (helperType) {
      case 'extraLife':
        get().gainLife();
        break;
      case 'tileFlip':
        get().flipRandomTiles(2);
        break;
      case 'hint':
        // Hint is handled by showHint function
        break;
      case 'timeExtension':
        get().extendTime(30);
        break;
    }

    return true;
  },

  getAvailableHelpers: () => {
    return get().availableHelpers;
  },

  getHelperUses: () => {
    return get().helperUses;
  },

  // Special abilities
  flipRandomTiles: (count: number) => {
    const { currentRoomTiles, matchedTiles, flippedTiles } = get();
    const availableTiles = currentRoomTiles.filter(
      tile => !matchedTiles.includes(tile.id) && !flippedTiles.includes(tile.id)
    );
    
    const tilesToFlip = availableTiles
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(count, availableTiles.length))
      .map(tile => tile.id);
    
    // Only flip if we have available tiles and won't exceed the 2-tile limit
    if (tilesToFlip.length > 0 && flippedTiles.length + tilesToFlip.length <= 2) {
      set({
        flippedTiles: [...flippedTiles, ...tilesToFlip]
      });
      
      // If we flipped exactly 2 tiles, trigger match check after a delay
      if (flippedTiles.length + tilesToFlip.length === 2) {
        setTimeout(() => {
          get().checkMatch();
        }, 1000);
      }
    }
  },

  showHint: () => {
    const { currentRoomTiles, matchedTiles, flippedTiles } = get();
    const availableTiles = currentRoomTiles.filter(
      tile => !matchedTiles.includes(tile.id) && !flippedTiles.includes(tile.id)
    );
    
    // Find a pair of matching tiles
    const shapes = new Map<string, string[]>();
    availableTiles.forEach(tile => {
      if (!shapes.has(tile.shape)) {
        shapes.set(tile.shape, []);
      }
      shapes.get(tile.shape)!.push(tile.id);
    });
    
    // Find first pair
    for (const [shape, tileIds] of shapes) {
      if (tileIds.length >= 2) {
        return tileIds.slice(0, 2);
      }
    }
    
    return [];
  },

  extendTime: (seconds: number) => {
    // This will be handled by the room components that have timers
    // For now, we'll just add points as a bonus
    get().addPoints(seconds * 10);
  }
}));

export { useGameStore };
export default useGameStore;
