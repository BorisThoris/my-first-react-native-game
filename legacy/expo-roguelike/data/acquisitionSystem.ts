// ============================================================================
// ACQUISITION SYSTEM - How players acquire collectibles
// ============================================================================

import {
  ALL_COLLECTIBLES,
  getCollectiblesByType,
  getCollectiblesByRarity,
  getCollectiblesByFloor,
  getRandomCollectible,
  getRandomCollectibles
} from './collectibleDatabase';
import { PlayerStats } from '../types/collectibleTypes';
import { 
  CollectibleType, 
  Rarity, 
  ItemCategory, 
  Item, 
  Ability, 
  Skill, 
  Tome, 
  Relic, 
  canAcquire 
} from '../types/collectibleTypes';

// ============================================================================
// ACQUISITION SOURCES
// ============================================================================

export enum AcquisitionSource {
  // Room Completion
  ROOM_COMPLETION = 'room_completion',
  BOSS_DEFEAT = 'boss_defeat',
  SPECIAL_ROOM = 'special_room',
  
  // Shops
  SHOP_PURCHASE = 'shop_purchase',
  VENDOR_TRADE = 'vendor_trade',
  
  // Discovery
  CHEST_FOUND = 'chest_found',
  SECRET_DISCOVERED = 'secret_discovered',
  HIDDEN_ROOM = 'hidden_room',
  
  // Events
  RANDOM_EVENT = 'random_event',
  STREAK_REWARD = 'streak_reward',
  ACHIEVEMENT = 'achievement',
  
  // Special
  QUEST_REWARD = 'quest_reward',
  BOSS_DROP = 'boss_drop',
  LEGENDARY_FIND = 'legendary_find'
}

export interface AcquisitionRule {
  source: AcquisitionSource;
  probability: number;
  minFloor: number;
  maxFloor?: number;
  requirements?: {
    level?: number;
    completedRooms?: number;
    specificItems?: string[];
    stats?: Partial<PlayerStats>;
  };
  rarityWeights?: Record<Rarity, number>;
  typeWeights?: Record<CollectibleType, number>;
  categoryWeights?: Record<ItemCategory, number>;
}

// ============================================================================
// ACQUISITION RULES
// ============================================================================

export const ACQUISITION_RULES: AcquisitionRule[] = [
  // Room Completion Rewards
  {
    source: AcquisitionSource.ROOM_COMPLETION,
    probability: 0.3, // 30% chance
    minFloor: 1,
    rarityWeights: {
      [Rarity.COMMON]: 0.6,
      [Rarity.UNCOMMON]: 0.3,
      [Rarity.RARE]: 0.1,
      [Rarity.EPIC]: 0,
      [Rarity.LEGENDARY]: 0,
      [Rarity.MYTHIC]: 0,
      [Rarity.CURSED]: 0
    },
    typeWeights: {
      [CollectibleType.ITEM]: 0.4,
      [CollectibleType.CONSUMABLE]: 0.3,
      [CollectibleType.EQUIPMENT]: 0.2,
      [CollectibleType.TRINKET]: 0.1,
      [CollectibleType.ABILITY]: 0,
      [CollectibleType.TALENT]: 0,
      [CollectibleType.SKILL]: 0,
      [CollectibleType.TOME]: 0,
      [CollectibleType.SCROLL]: 0,
      [CollectibleType.MANUAL]: 0,
      [CollectibleType.RELIC]: 0,
      [CollectibleType.ARTIFACT]: 0,
      [CollectibleType.CURSED_ITEM]: 0,
      [CollectibleType.CURRENCY]: 0,
      [CollectibleType.MATERIAL]: 0,
      [CollectibleType.INGREDIENT]: 0
    }
  },

  // Boss Defeat Rewards
  {
    source: AcquisitionSource.BOSS_DEFEAT,
    probability: 1.0, // Always get something
    minFloor: 1,
    rarityWeights: {
      [Rarity.COMMON]: 0.2,
      [Rarity.UNCOMMON]: 0.4,
      [Rarity.RARE]: 0.3,
      [Rarity.EPIC]: 0.1,
      [Rarity.LEGENDARY]: 0,
      [Rarity.MYTHIC]: 0,
      [Rarity.CURSED]: 0
    },
    typeWeights: {
      [CollectibleType.ITEM]: 0.3,
      [CollectibleType.CONSUMABLE]: 0.2,
      [CollectibleType.EQUIPMENT]: 0.3,
      [CollectibleType.TRINKET]: 0.1,
      [CollectibleType.ABILITY]: 0.1,
      [CollectibleType.TALENT]: 0,
      [CollectibleType.SKILL]: 0,
      [CollectibleType.TOME]: 0,
      [CollectibleType.SCROLL]: 0,
      [CollectibleType.MANUAL]: 0,
      [CollectibleType.RELIC]: 0,
      [CollectibleType.ARTIFACT]: 0,
      [CollectibleType.CURSED_ITEM]: 0,
      [CollectibleType.CURRENCY]: 0,
      [CollectibleType.MATERIAL]: 0,
      [CollectibleType.INGREDIENT]: 0
    }
  },

  // Special Room Rewards
  {
    source: AcquisitionSource.SPECIAL_ROOM,
    probability: 0.8, // 80% chance
    minFloor: 1,
    rarityWeights: {
      [Rarity.COMMON]: 0.3,
      [Rarity.UNCOMMON]: 0.4,
      [Rarity.RARE]: 0.2,
      [Rarity.EPIC]: 0.1,
      [Rarity.LEGENDARY]: 0,
      [Rarity.MYTHIC]: 0,
      [Rarity.CURSED]: 0
    },
    typeWeights: {
      [CollectibleType.ITEM]: 0.3,
      [CollectibleType.CONSUMABLE]: 0.2,
      [CollectibleType.EQUIPMENT]: 0.2,
      [CollectibleType.TRINKET]: 0.1,
      [CollectibleType.ABILITY]: 0.1,
      [CollectibleType.TALENT]: 0.1,
      [CollectibleType.SKILL]: 0,
      [CollectibleType.TOME]: 0,
      [CollectibleType.SCROLL]: 0,
      [CollectibleType.MANUAL]: 0,
      [CollectibleType.RELIC]: 0,
      [CollectibleType.ARTIFACT]: 0,
      [CollectibleType.CURSED_ITEM]: 0,
      [CollectibleType.CURRENCY]: 0,
      [CollectibleType.MATERIAL]: 0,
      [CollectibleType.INGREDIENT]: 0
    }
  },

  // Chest Found
  {
    source: AcquisitionSource.CHEST_FOUND,
    probability: 0.6, // 60% chance
    minFloor: 2,
    rarityWeights: {
      [Rarity.COMMON]: 0.4,
      [Rarity.UNCOMMON]: 0.3,
      [Rarity.RARE]: 0.2,
      [Rarity.EPIC]: 0.1,
      [Rarity.LEGENDARY]: 0,
      [Rarity.MYTHIC]: 0,
      [Rarity.CURSED]: 0
    },
    typeWeights: {
      [CollectibleType.ITEM]: 0.2,
      [CollectibleType.CONSUMABLE]: 0.3,
      [CollectibleType.EQUIPMENT]: 0.2,
      [CollectibleType.TRINKET]: 0.1,
      [CollectibleType.ABILITY]: 0.1,
      [CollectibleType.TALENT]: 0.1,
      [CollectibleType.SKILL]: 0,
      [CollectibleType.TOME]: 0,
      [CollectibleType.SCROLL]: 0,
      [CollectibleType.MANUAL]: 0,
      [CollectibleType.RELIC]: 0,
      [CollectibleType.ARTIFACT]: 0,
      [CollectibleType.CURSED_ITEM]: 0,
      [CollectibleType.CURRENCY]: 0,
      [CollectibleType.MATERIAL]: 0,
      [CollectibleType.INGREDIENT]: 0
    }
  },

  // Streak Rewards
  {
    source: AcquisitionSource.STREAK_REWARD,
    probability: 1.0, // Always get something at streak milestones
    minFloor: 1,
    requirements: {
      completedRooms: 5 // Minimum 5 rooms completed
    },
    rarityWeights: {
      [Rarity.COMMON]: 0.5,
      [Rarity.UNCOMMON]: 0.3,
      [Rarity.RARE]: 0.15,
      [Rarity.EPIC]: 0.05,
      [Rarity.LEGENDARY]: 0,
      [Rarity.MYTHIC]: 0,
      [Rarity.CURSED]: 0
    },
    typeWeights: {
      [CollectibleType.ITEM]: 0.4,
      [CollectibleType.CONSUMABLE]: 0.3,
      [CollectibleType.EQUIPMENT]: 0.2,
      [CollectibleType.TRINKET]: 0.1,
      [CollectibleType.ABILITY]: 0,
      [CollectibleType.TALENT]: 0,
      [CollectibleType.SKILL]: 0,
      [CollectibleType.TOME]: 0,
      [CollectibleType.SCROLL]: 0,
      [CollectibleType.MANUAL]: 0,
      [CollectibleType.RELIC]: 0,
      [CollectibleType.ARTIFACT]: 0,
      [CollectibleType.CURSED_ITEM]: 0,
      [CollectibleType.CURRENCY]: 0,
      [CollectibleType.MATERIAL]: 0,
      [CollectibleType.INGREDIENT]: 0
    }
  },

  // Legendary Find (very rare)
  {
    source: AcquisitionSource.LEGENDARY_FIND,
    probability: 0.01, // 1% chance
    minFloor: 5,
    rarityWeights: {
      [Rarity.COMMON]: 0,
      [Rarity.UNCOMMON]: 0,
      [Rarity.RARE]: 0,
      [Rarity.EPIC]: 0.3,
      [Rarity.LEGENDARY]: 0.5,
      [Rarity.MYTHIC]: 0.2,
      [Rarity.CURSED]: 0
    },
    typeWeights: {
      [CollectibleType.ITEM]: 0.2,
      [CollectibleType.CONSUMABLE]: 0.1,
      [CollectibleType.EQUIPMENT]: 0.3,
      [CollectibleType.TRINKET]: 0.1,
      [CollectibleType.ABILITY]: 0.1,
      [CollectibleType.TALENT]: 0.1,
      [CollectibleType.SKILL]: 0,
      [CollectibleType.TOME]: 0,
      [CollectibleType.SCROLL]: 0,
      [CollectibleType.MANUAL]: 0,
      [CollectibleType.RELIC]: 0.1,
      [CollectibleType.ARTIFACT]: 0.1,
      [CollectibleType.CURSED_ITEM]: 0,
      [CollectibleType.CURRENCY]: 0,
      [CollectibleType.MATERIAL]: 0,
      [CollectibleType.INGREDIENT]: 0
    }
  }
];

// ============================================================================
// ACQUISITION FUNCTIONS
// ============================================================================

export const getAcquisitionRule = (source: AcquisitionSource): AcquisitionRule | null => {
  return ACQUISITION_RULES.find(rule => rule.source === source) || null;
};

export const canAcquireFromSource = (source: AcquisitionSource, playerStats: PlayerStats): boolean => {
  const rule = getAcquisitionRule(source);
  if (!rule) return false;
  
  // Check floor requirement
  if (playerStats.currentFloor < rule.minFloor) return false;
  if (rule.maxFloor && playerStats.currentFloor > rule.maxFloor) return false;
  
  // Check additional requirements
  if (rule.requirements) {
    const req = rule.requirements;
    if (req.level && playerStats.level < req.level) return false;
    if (req.completedRooms && playerStats.roomsCompleted < req.completedRooms) return false;
    if (req.specificItems) {
      const hasAllItems = req.specificItems.every(itemId => 
        playerStats.items.some(item => item.id === itemId)
      );
      if (!hasAllItems) return false;
    }
    if (req.stats) {
      const stats = req.stats;
      if (stats.focus && playerStats.focus < stats.focus) return false;
      if (stats.recall && playerStats.recall < stats.recall) return false;
      if (stats.patternRecognition && playerStats.patternRecognition < stats.patternRecognition) return false;
      if (stats.concentration && playerStats.concentration < stats.concentration) return false;
    }
  }
  
  return true;
};

export const getAvailableCollectibles = (source: AcquisitionSource, playerStats: PlayerStats) => {
  const rule = getAcquisitionRule(source);
  if (!rule || !canAcquireFromSource(source, playerStats)) return [];
  
  let available = getCollectiblesByFloor(playerStats.currentFloor);
  
  // Filter by rarity weights
  if (rule.rarityWeights) {
    available = available.filter(collectible => {
      const weight = rule.rarityWeights![collectible.rarity];
      return weight && weight > 0;
    });
  }
  
  // Filter by type weights
  if (rule.typeWeights) {
    available = available.filter(collectible => {
      const weight = rule.typeWeights![collectible.type];
      return weight && weight > 0;
    });
  }
  
  // Filter by category weights
  if (rule.categoryWeights) {
    available = available.filter(collectible => {
      const weight = rule.categoryWeights![collectible.category];
      return weight && weight > 0;
    });
  }
  
  // Filter by acquisition requirements
  available = available.filter(collectible => canAcquire(collectible, playerStats));
  
  return available;
};

export const selectCollectible = (source: AcquisitionSource, playerStats: PlayerStats) => {
  const rule = getAcquisitionRule(source);
  if (!rule || !canAcquireFromSource(source, playerStats)) return null;
  
  // Check probability
  if (Math.random() > rule.probability) return null;
  
  const available = getAvailableCollectibles(source, playerStats);
  if (available.length === 0) return null;
  
  // Weighted selection based on rarity
  const weightedCollectibles: any[] = [];
  
  available.forEach(collectible => {
    const rarityWeight = rule.rarityWeights?.[collectible.rarity] || 1;
    const typeWeight = rule.typeWeights?.[collectible.type] || 1;
    const categoryWeight = rule.categoryWeights?.[collectible.category] || 1;
    const totalWeight = rarityWeight * typeWeight * categoryWeight;
    
    for (let i = 0; i < totalWeight; i++) {
      weightedCollectibles.push(collectible);
    }
  });
  
  if (weightedCollectibles.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * weightedCollectibles.length);
  return weightedCollectibles[randomIndex];
};

export const acquireCollectible = (collectible: any, playerStats: PlayerStats) => {
  const newStats = { ...playerStats };
  
  switch (collectible.type) {
    case CollectibleType.ITEM:
    case CollectibleType.CONSUMABLE:
    case CollectibleType.EQUIPMENT:
    case CollectibleType.TRINKET:
      // Add to items array
      if (collectible.stackable && collectible.maxStack) {
        const existingItem = newStats.items.find(item => item.id === collectible.id);
        if (existingItem && existingItem.stackable) {
          // Handle stacking logic here
          newStats.items = newStats.items.map(item => 
            item.id === collectible.id 
              ? { ...item, /* update stack count */ }
              : item
          );
        } else {
          newStats.items.push(collectible);
        }
      } else {
        newStats.items.push(collectible);
      }
      break;
      
    case CollectibleType.ABILITY:
    case CollectibleType.TALENT:
      newStats.abilities.push(collectible);
      break;
      
    case CollectibleType.SKILL:
      newStats.skills.push(collectible);
      break;
      
    case CollectibleType.TOME:
    case CollectibleType.SCROLL:
    case CollectibleType.MANUAL:
      newStats.tomes.push(collectible);
      break;
      
    case CollectibleType.RELIC:
    case CollectibleType.ARTIFACT:
    case CollectibleType.CURSED_ITEM:
      newStats.relics.push(collectible);
      break;
  }
  
  return newStats;
};

// ============================================================================
// SPECIAL ACQUISITION EVENTS
// ============================================================================

export const getStreakRewards = (streak: number, playerStats: PlayerStats) => {
  const rewards = [];
  
  // Every 5 streaks
  if (streak % 5 === 0) {
    const collectible = selectCollectible(AcquisitionSource.STREAK_REWARD, playerStats);
    if (collectible) {
      rewards.push({
        type: 'collectible',
        collectible,
        message: `Streak ${streak} reward!`
      });
    }
  }
  
  // Every 10 streaks - guaranteed rare item
  if (streak % 10 === 0) {
    const rareCollectible = getRandomCollectible(undefined, Rarity.RARE);
    if (rareCollectible) {
      rewards.push({
        type: 'collectible',
        collectible: rareCollectible,
        message: `Amazing ${streak} streak!`
      });
    }
  }
  
  // Every 25 streaks - guaranteed epic item
  if (streak % 25 === 0) {
    const epicCollectible = getRandomCollectible(undefined, Rarity.EPIC);
    if (epicCollectible) {
      rewards.push({
        type: 'collectible',
        collectible: epicCollectible,
        message: `Legendary ${streak} streak!`
      });
    }
  }
  
  return rewards;
};

export const getBossRewards = (bossLevel: number, playerStats: PlayerStats) => {
  const rewards = [];
  
  // Always get a reward from boss
  const collectible = selectCollectible(AcquisitionSource.BOSS_DEFEAT, playerStats);
  if (collectible) {
    rewards.push({
      type: 'collectible',
      collectible,
      message: 'Boss defeated!'
    });
  }
  
  // Higher level bosses give better rewards
  if (bossLevel >= 5) {
    const rareCollectible = getRandomCollectible(undefined, Rarity.RARE);
    if (rareCollectible) {
      rewards.push({
        type: 'collectible',
        collectible: rareCollectible,
        message: 'Boss bonus reward!'
      });
    }
  }
  
  if (bossLevel >= 10) {
    const epicCollectible = getRandomCollectible(undefined, Rarity.EPIC);
    if (epicCollectible) {
      rewards.push({
        type: 'collectible',
        collectible: epicCollectible,
        message: 'Epic boss reward!'
      });
    }
  }
  
  return rewards;
};

export const getRoomCompletionRewards = (roomType: string, difficulty: number, playerStats: PlayerStats) => {
  const rewards = [];
  
  // Base room completion reward
  const collectible = selectCollectible(AcquisitionSource.ROOM_COMPLETION, playerStats);
  if (collectible) {
    rewards.push({
      type: 'collectible',
      collectible,
      message: 'Room completed!'
    });
  }
  
  // Special room types give better rewards
  if (['treasure', 'secret', 'library'].includes(roomType)) {
    const specialCollectible = selectCollectible(AcquisitionSource.SPECIAL_ROOM, playerStats);
    if (specialCollectible) {
      rewards.push({
        type: 'collectible',
        collectible: specialCollectible,
        message: 'Special room reward!'
      });
    }
  }
  
  // High difficulty rooms have chance for better rewards
  if (difficulty >= 5) {
    const rareCollectible = getRandomCollectible(undefined, Rarity.RARE);
    if (rareCollectible && Math.random() < 0.3) {
      rewards.push({
        type: 'collectible',
        collectible: rareCollectible,
        message: 'High difficulty bonus!'
      });
    }
  }
  
  return rewards;
};
