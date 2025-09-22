// ============================================================================
// SHOP SYSTEM - Comprehensive shop management using collectible data structures
// ============================================================================

import {
  ALL_ITEMS,
  ALL_ABILITIES,
  ALL_SKILLS,
  ALL_TOMES,
  ALL_RELICS,
  getCollectiblesByType,
  getCollectiblesByRarity,
  getCollectiblesByFloor,
  getRandomCollectible
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
// SHOP TYPES
// ============================================================================

export interface ShopItem {
  id: string;
  collectible: Item | Ability | Skill | Tome | Relic;
  cost: number;
  stock: number;
  maxStock: number;
  restockTime?: number; // Hours until restock
  discount?: number; // Percentage discount (0-100)
  requirements?: {
    level?: number;
    floor?: number;
    completedRooms?: number;
    specificItems?: string[];
    stats?: Partial<PlayerStats>;
  };
}

export interface ShopCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  items: ShopItem[];
  unlocked: boolean;
  requirements?: {
    level?: number;
    floor?: number;
    completedRooms?: number;
  };
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  icon: string;
  categories: ShopCategory[];
  currency: string;
  restockInterval: number; // Hours
  lastRestock: number; // Timestamp
  discounts: {
    global: number; // Global discount percentage
    rarity: Record<Rarity, number>; // Rarity-specific discounts
    category: Record<ItemCategory, number>; // Category-specific discounts
  };
}

// ============================================================================
// SHOP CONFIGURATIONS
// ============================================================================

export const SHOP_CATEGORIES: Omit<ShopCategory, 'items'>[] = [
  {
    id: 'consumables',
    name: 'Consumables',
    icon: '🧪',
    description: 'One-time use items and potions',
    unlocked: true
  },
  {
    id: 'equipment',
    name: 'Equipment',
    icon: '⚔️',
    description: 'Weapons, armor, and accessories',
    unlocked: true
  },
  {
    id: 'abilities',
    name: 'Abilities',
    icon: '✨',
    description: 'Active and passive abilities',
    unlocked: true,
    requirements: { level: 3, floor: 2 }
  },
  {
    id: 'skills',
    name: 'Skills',
    icon: '📚',
    description: 'Learnable skills and techniques',
    unlocked: true,
    requirements: { level: 5, floor: 3 }
  },
  {
    id: 'tomes',
    name: 'Tomes',
    icon: '📖',
    description: 'Knowledge books and scrolls',
    unlocked: true,
    requirements: { level: 2, floor: 1 }
  },
  {
    id: 'relics',
    name: 'Relics',
    icon: '🏺',
    description: 'Ancient artifacts and relics',
    unlocked: false,
    requirements: { level: 10, floor: 5, completedRooms: 50 }
  },
  {
    id: 'cursed',
    name: 'Cursed Items',
    icon: '💀',
    description: 'Powerful but dangerous items',
    unlocked: false,
    requirements: { level: 8, floor: 4, completedRooms: 30 }
  }
];

// ============================================================================
// SHOP GENERATION
// ============================================================================

export const generateShop = (floor: number, playerStats: PlayerStats): Shop => {
  const categories = SHOP_CATEGORIES.map(categoryConfig => {
    const unlocked = !categoryConfig.requirements || 
      (categoryConfig.requirements.level ? playerStats.level >= categoryConfig.requirements.level : true) &&
      (categoryConfig.requirements.floor ? playerStats.currentFloor >= categoryConfig.requirements.floor : true) &&
      (categoryConfig.requirements.completedRooms ? playerStats.roomsCompleted >= categoryConfig.requirements.completedRooms : true);
    
    const items = generateShopItems(categoryConfig.id, floor, playerStats, unlocked);
    
    return {
      ...categoryConfig,
      items,
      unlocked
    };
  });
  
  return {
    id: `shop-floor-${floor}`,
    name: `Floor ${floor} Shop`,
    description: `A mysterious shop on floor ${floor}`,
    icon: '🏪',
    categories,
    currency: 'Points',
    restockInterval: 24, // 24 hours
    lastRestock: Date.now(),
    discounts: {
      global: 0,
      rarity: {
        [Rarity.COMMON]: 0,
        [Rarity.UNCOMMON]: 5,
        [Rarity.RARE]: 10,
        [Rarity.EPIC]: 15,
        [Rarity.LEGENDARY]: 20,
        [Rarity.MYTHIC]: 25,
        [Rarity.CURSED]: 0
      },
      category: {
        [ItemCategory.MEMORY_BOOST]: 5,
        [ItemCategory.FOCUS_ENHANCEMENT]: 5,
        [ItemCategory.RECALL_IMPROVEMENT]: 5,
        [ItemCategory.PATTERN_RECOGNITION]: 5,
        [ItemCategory.HEALTH_ITEM]: 0,
        [ItemCategory.DEFENSIVE_ITEM]: 0,
        [ItemCategory.OFFENSIVE_ITEM]: 0,
        [ItemCategory.KEY_ITEM]: 0,
        [ItemCategory.TOOL]: 0,
        [ItemCategory.CONTAINER]: 0,
        [ItemCategory.TELEPORTATION]: 10,
        [ItemCategory.TIME_MANIPULATION]: 10,
        [ItemCategory.REVELATION]: 10,
        [ItemCategory.CURSED_MEMORY]: 0,
        [ItemCategory.CURSED_HEALTH]: 0,
        [ItemCategory.CURSED_ABILITY]: 0
      }
    }
  };
};

export const generateShopItems = (
  categoryId: string, 
  floor: number, 
  playerStats: PlayerStats, 
  unlocked: boolean
): ShopItem[] => {
  if (!unlocked) return [];
  
  let collectibles: any[] = [];
  let itemCount = 0;
  
  switch (categoryId) {
    case 'consumables':
      collectibles = getCollectiblesByType(CollectibleType.CONSUMABLE);
      itemCount = Math.min(8, Math.max(3, Math.floor(floor / 2) + 2));
      break;
      
    case 'equipment':
      collectibles = getCollectiblesByType(CollectibleType.EQUIPMENT);
      itemCount = Math.min(6, Math.max(2, Math.floor(floor / 3) + 1));
      break;
      
    case 'abilities':
      collectibles = ALL_ABILITIES;
      itemCount = Math.min(4, Math.max(1, Math.floor(floor / 4) + 1));
      break;
      
    case 'skills':
      collectibles = ALL_SKILLS;
      itemCount = Math.min(3, Math.max(1, Math.floor(floor / 5) + 1));
      break;
      
    case 'tomes':
      collectibles = ALL_TOMES;
      itemCount = Math.min(5, Math.max(2, Math.floor(floor / 3) + 1));
      break;
      
    case 'relics':
      collectibles = ALL_RELICS.filter(relic => relic.rarity !== Rarity.CURSED);
      itemCount = Math.min(3, Math.max(1, Math.floor(floor / 8) + 1));
      break;
      
    case 'cursed':
      collectibles = ALL_RELICS.filter(relic => relic.rarity === Rarity.CURSED);
      itemCount = Math.min(2, Math.max(1, Math.floor(floor / 6) + 1));
      break;
      
    default:
      return [];
  }
  
  // Filter by floor and requirements
  collectibles = collectibles.filter(collectible => 
    canAcquire(collectible, playerStats) &&
    (!collectible.requirements?.floor || collectible.requirements.floor <= floor)
  );
  
  // Select random items
  const selectedCollectibles = [];
  const available = [...collectibles];
  
  for (let i = 0; i < itemCount && available.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * available.length);
    selectedCollectibles.push(available[randomIndex]);
    available.splice(randomIndex, 1);
  }
  
  // Convert to shop items
  return selectedCollectibles.map(collectible => ({
    id: `shop-${collectible.id}-${Date.now()}`,
    collectible,
    cost: calculateItemCost(collectible, floor, playerStats),
    stock: Math.max(1, Math.floor(Math.random() * 3) + 1),
    maxStock: Math.max(1, Math.floor(Math.random() * 5) + 1),
    restockTime: Math.floor(Math.random() * 24) + 1, // 1-24 hours
    requirements: collectible.requirements
  }));
};

export const calculateItemCost = (collectible: any, floor: number, playerStats: PlayerStats): number => {
  let baseCost = collectible.value || 100;
  
  // Floor multiplier
  const floorMultiplier = 1 + (floor - 1) * 0.2;
  baseCost *= floorMultiplier;
  
  // Rarity multiplier
  const rarityMultipliers = {
    [Rarity.COMMON]: 1.0,
    [Rarity.UNCOMMON]: 1.5,
    [Rarity.RARE]: 2.5,
    [Rarity.EPIC]: 4.0,
    [Rarity.LEGENDARY]: 6.0,
    [Rarity.MYTHIC]: 10.0,
    [Rarity.CURSED]: 0.5
  };
  
  baseCost *= rarityMultipliers[collectible.rarity as keyof typeof rarityMultipliers] || 1.0;
  
  // Type multiplier
  const typeMultipliers = {
    [CollectibleType.ITEM]: 1.0,
    [CollectibleType.CONSUMABLE]: 0.8,
    [CollectibleType.EQUIPMENT]: 1.5,
    [CollectibleType.TRINKET]: 1.2,
    [CollectibleType.ABILITY]: 2.0,
    [CollectibleType.TALENT]: 2.5,
    [CollectibleType.SKILL]: 3.0,
    [CollectibleType.TOME]: 1.8,
    [CollectibleType.SCROLL]: 1.5,
    [CollectibleType.MANUAL]: 2.0,
    [CollectibleType.RELIC]: 5.0,
    [CollectibleType.ARTIFACT]: 8.0,
    [CollectibleType.CURSED_ITEM]: 0.3
  };
  
  baseCost *= typeMultipliers[collectible.type as keyof typeof typeMultipliers] || 1.0;
  
  // Round to nearest 10
  return Math.round(baseCost / 10) * 10;
};

// ============================================================================
// SHOP OPERATIONS
// ============================================================================

export const canPurchase = (shopItem: ShopItem, playerStats: PlayerStats): boolean => {
  // Check if player has enough points
  if (playerStats.points < shopItem.cost) return false;
  
  // Check if item is in stock
  if (shopItem.stock <= 0) return false;
  
  // Check requirements
  if (shopItem.requirements) {
    const req = shopItem.requirements;
    if (req.level && playerStats.level < req.level) return false;
    if (req.floor && playerStats.currentFloor < req.floor) return false;
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

export const purchaseItem = (shopItem: ShopItem, playerStats: PlayerStats) => {
  if (!canPurchase(shopItem, playerStats)) {
    return { success: false, message: 'Cannot purchase this item' };
  }
  
  const newStats = { ...playerStats };
  
  // Deduct cost
  newStats.points -= shopItem.cost;
  
  // Add item to inventory
  switch (shopItem.collectible.type) {
    case CollectibleType.ITEM:
    case CollectibleType.CONSUMABLE:
    case CollectibleType.EQUIPMENT:
    case CollectibleType.TRINKET:
      newStats.items.push(shopItem.collectible as Item);
      break;
      
    case CollectibleType.ABILITY:
    case CollectibleType.TALENT:
      newStats.abilities.push(shopItem.collectible as Ability);
      break;
      
    case CollectibleType.SKILL:
      newStats.skills.push(shopItem.collectible as Skill);
      break;
      
    case CollectibleType.TOME:
    case CollectibleType.SCROLL:
    case CollectibleType.MANUAL:
      newStats.tomes.push(shopItem.collectible as Tome);
      break;
      
    case CollectibleType.RELIC:
    case CollectibleType.ARTIFACT:
    case CollectibleType.CURSED_ITEM:
      newStats.relics.push(shopItem.collectible as Relic);
      break;
  }
  
  // Reduce stock
  shopItem.stock -= 1;
  
  return { 
    success: true, 
    message: `Purchased ${shopItem.collectible.name}!`,
    newStats 
  };
};

export const restockShop = (shop: Shop, playerStats: PlayerStats): Shop => {
  const now = Date.now();
  const timeSinceLastRestock = (now - shop.lastRestock) / (1000 * 60 * 60); // Hours
  
  if (timeSinceLastRestock < shop.restockInterval) {
    return shop; // Not time to restock yet
  }
  
  const newShop = { ...shop };
  newShop.lastRestock = now;
  
  // Restock each category
  newShop.categories = newShop.categories.map(category => {
    const newItems = category.items.map(item => {
      if (item.stock < item.maxStock) {
        const restockAmount = Math.min(
          item.maxStock - item.stock,
          Math.floor(Math.random() * 3) + 1
        );
        return {
          ...item,
          stock: item.stock + restockAmount
        };
      }
      return item;
    });
    
    return {
      ...category,
      items: newItems
    };
  });
  
  return newShop;
};

// ============================================================================
// SHOP UTILITIES
// ============================================================================

export const getShopItemById = (shop: Shop, itemId: string): ShopItem | null => {
  for (const category of shop.categories) {
    const item = category.items.find(item => item.id === itemId);
    if (item) return item;
  }
  return null;
};

export const getShopItemsByCategory = (shop: Shop, categoryId: string): ShopItem[] => {
  const category = shop.categories.find(cat => cat.id === categoryId);
  return category ? category.items : [];
};

export const getShopItemsByRarity = (shop: Shop, rarity: Rarity): ShopItem[] => {
  const items: ShopItem[] = [];
  for (const category of shop.categories) {
    items.push(...category.items.filter(item => item.collectible.rarity === rarity));
  }
  return items;
};

export const getShopItemsByType = (shop: Shop, type: CollectibleType): ShopItem[] => {
  const items: ShopItem[] = [];
  for (const category of shop.categories) {
    items.push(...category.items.filter(item => item.collectible.type === type));
  }
  return items;
};

export const searchShopItems = (shop: Shop, query: string): ShopItem[] => {
  const items: ShopItem[] = [];
  const lowerQuery = query.toLowerCase();
  
  for (const category of shop.categories) {
    items.push(...category.items.filter(item => 
      item.collectible.name.toLowerCase().includes(lowerQuery) ||
      item.collectible.description.toLowerCase().includes(lowerQuery)
    ));
  }
  
  return items;
};

export const getShopStats = (shop: Shop) => {
  let totalItems = 0;
  let totalValue = 0;
  let categoriesUnlocked = 0;
  
  for (const category of shop.categories) {
    if (category.unlocked) {
      categoriesUnlocked++;
      totalItems += category.items.length;
      totalValue += category.items.reduce((sum, item) => sum + item.cost, 0);
    }
  }
  
  return {
    totalItems,
    totalValue,
    categoriesUnlocked,
    totalCategories: shop.categories.length
  };
};
