// ============================================================================
// COLLECTIBLE TYPES - Comprehensive data structures for all acquirable items
// ============================================================================

export enum CollectibleType {
  // Items
  ITEM = 'item',
  CONSUMABLE = 'consumable',
  EQUIPMENT = 'equipment',
  TRINKET = 'trinket',
  
  // Abilities & Skills
  ABILITY = 'ability',
  TALENT = 'talent',
  SKILL = 'skill',
  
  // Knowledge
  TOME = 'tome',
  SCROLL = 'scroll',
  MANUAL = 'manual',
  
  // Special
  RELIC = 'relic',
  ARTIFACT = 'artifact',
  CURSED_ITEM = 'cursed_item',
  
  // Resources
  CURRENCY = 'currency',
  MATERIAL = 'material',
  INGREDIENT = 'ingredient'
}

export enum Rarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic',
  CURSED = 'cursed'
}

export enum ItemCategory {
  // Memory Enhancement
  MEMORY_BOOST = 'memory_boost',
  FOCUS_ENHANCEMENT = 'focus_enhancement',
  RECALL_IMPROVEMENT = 'recall_improvement',
  PATTERN_RECOGNITION = 'pattern_recognition',
  
  // Combat & Survival
  HEALTH_ITEM = 'health_item',
  DEFENSIVE_ITEM = 'defensive_item',
  OFFENSIVE_ITEM = 'offensive_item',
  
  // Utility
  KEY_ITEM = 'key_item',
  TOOL = 'tool',
  CONTAINER = 'container',
  
  // Special Abilities
  TELEPORTATION = 'teleportation',
  TIME_MANIPULATION = 'time_manipulation',
  REVELATION = 'revelation',
  
  // Cursed Items
  CURSED_MEMORY = 'cursed_memory',
  CURSED_HEALTH = 'cursed_health',
  CURSED_ABILITY = 'cursed_ability'
}

export enum AbilityType {
  PASSIVE = 'passive',
  ACTIVE = 'active',
  TRIGGERED = 'triggered',
  AURA = 'aura'
}

export enum SkillType {
  MEMORY = 'memory',
  FOCUS = 'focus',
  RECALL = 'recall',
  PATTERN = 'pattern',
  CONCENTRATION = 'concentration',
  INTUITION = 'intuition',
  PERCEPTION = 'perception'
}

// ============================================================================
// BASE INTERFACES
// ============================================================================

export interface BaseCollectible {
  id: string;
  name: string;
  description: string;
  type: CollectibleType;
  rarity: Rarity;
  category: ItemCategory;
  icon: string;
  value: number; // Base value for trading/selling
  stackable: boolean;
  maxStack?: number;
  requirements?: CollectibleRequirements;
  effects: CollectibleEffect[];
  flavorText?: string;
  lore?: string;
}

export interface CollectibleRequirements {
  level?: number;
  floor?: number;
  previousItems?: string[];
  completedRooms?: number;
  specificRooms?: string[];
  stats?: Partial<PlayerStats>;
  keys?: number;
  bombs?: number;
}

export interface CollectibleEffect {
  type: EffectType;
  value: number;
  duration?: number; // For temporary effects
  condition?: string; // When effect triggers
  description: string;
  stackable?: boolean; // Can multiple instances stack
}

export enum EffectType {
  // Stats
  LIVES = 'lives',
  MAX_LIVES = 'max_lives',
  FOCUS = 'focus',
  RECALL = 'recall',
  PATTERN_RECOGNITION = 'pattern_recognition',
  CONCENTRATION = 'concentration',
  INTUITION = 'intuition',
  PERCEPTION = 'perception',
  
  // Resources
  POINTS = 'points',
  KEYS = 'keys',
  BOMBS = 'bombs',
  CURRENCY = 'currency',
  
  // Game Mechanics
  PREVIEW_TIME = 'preview_time',
  GRID_SIZE = 'grid_size',
  MATCH_BONUS = 'match_bonus',
  STREAK_BONUS = 'streak_bonus',
  BOSS_MULTIPLIER = 'boss_multiplier',
  ROOM_BONUS = 'room_bonus',
  
  // Special Abilities
  FREE_CHEAT = 'free_cheat',
  AUTO_MATCH = 'auto_match',
  REVEAL_ALL = 'reveal_all',
  FREEZE_TIMER = 'freeze_timer',
  PERFECT_MEMORY = 'perfect_memory',
  
  // Cursed Effects
  CURSED_VISION = 'cursed_vision',
  CURSED_MEMORY = 'cursed_memory',
  CURSED_HEALTH = 'cursed_health',
  
  // Utility
  TELEPORT = 'teleport',
  REVEAL_MAP = 'reveal_map',
  SHOP_DISCOUNT = 'shop_discount',
  DOUBLE_REWARDS = 'double_rewards'
}

// ============================================================================
// SPECIFIC COLLECTIBLE TYPES
// ============================================================================

export interface Item extends BaseCollectible {
  type: CollectibleType.ITEM | CollectibleType.CONSUMABLE | CollectibleType.EQUIPMENT | CollectibleType.TRINKET;
  consumable?: {
    maxUses: number;
    currentUses: number;
    cooldown?: number; // Seconds between uses
  };
  equipment?: {
    slot: EquipmentSlot;
    durability?: number;
    maxDurability?: number;
  };
}

export interface Ability extends BaseCollectible {
  type: CollectibleType.ABILITY | CollectibleType.TALENT;
  abilityType: AbilityType;
  cooldown?: number;
  manaCost?: number;
  charges?: number;
  maxCharges?: number;
  level: number;
  maxLevel: number;
  upgradeCost?: number;
  prerequisites?: string[];
}

export interface Skill extends BaseCollectible {
  type: CollectibleType.SKILL;
  skillType: SkillType;
  level: number;
  maxLevel: number;
  experience: number;
  experienceToNext: number;
  benefits: SkillBenefit[];
}

export interface Tome extends BaseCollectible {
  type: CollectibleType.TOME | CollectibleType.SCROLL | CollectibleType.MANUAL;
  knowledgeType: KnowledgeType;
  pages: number;
  currentPage: number;
  readTime: number; // Time to read in seconds
  benefits: KnowledgeBenefit[];
}

export interface Relic extends BaseCollectible {
  type: CollectibleType.RELIC | CollectibleType.ARTIFACT | CollectibleType.CURSED_ITEM;
  power: number;
  charges?: number;
  maxCharges?: number;
  rechargeRate?: number; // Charges per room completed
  specialProperties: Record<string, any>;
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export enum EquipmentSlot {
  HEAD = 'head',
  CHEST = 'chest',
  HANDS = 'hands',
  FEET = 'feet',
  ACCESSORY = 'accessory',
  WEAPON = 'weapon',
  SHIELD = 'shield'
}

export enum KnowledgeType {
  MEMORY_TECHNIQUES = 'memory_techniques',
  FOCUS_MEDITATION = 'focus_meditation',
  PATTERN_ANALYSIS = 'pattern_analysis',
  CONCENTRATION_METHODS = 'concentration_methods',
  GAME_STRATEGY = 'game_strategy',
  DUNGEON_KNOWLEDGE = 'dungeon_knowledge'
}

export interface SkillBenefit {
  level: number;
  effect: CollectibleEffect;
  description: string;
}

export interface KnowledgeBenefit {
  page: number;
  effect: CollectibleEffect;
  description: string;
  unlocked: boolean;
}

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
  abilities: Ability[];
  skills: Skill[];
  tomes: Tome[];
  relics: Relic[];
  
  // Shop
  shopItems: any[];
  consumables: Record<string, number>;
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export const createItem = (
  id: string,
  name: string,
  description: string,
  type: CollectibleType.ITEM | CollectibleType.CONSUMABLE | CollectibleType.EQUIPMENT | CollectibleType.TRINKET,
  rarity: Rarity,
  category: ItemCategory,
  icon: string,
  value: number,
  effects: CollectibleEffect[],
  options?: {
    stackable?: boolean;
    maxStack?: number;
    consumable?: { maxUses: number; cooldown?: number };
    equipment?: { slot: EquipmentSlot; durability?: number };
    requirements?: CollectibleRequirements;
    flavorText?: string;
    lore?: string;
  }
): Item => ({
  id,
  name,
  description,
  type,
  rarity,
  category,
  icon,
  value,
  stackable: options?.stackable ?? true,
  maxStack: options?.maxStack,
  effects,
  requirements: options?.requirements,
  flavorText: options?.flavorText,
  lore: options?.lore,
  consumable: options?.consumable,
  equipment: options?.equipment
});

export const createAbility = (
  id: string,
  name: string,
  description: string,
  type: CollectibleType.ABILITY | CollectibleType.TALENT,
  rarity: Rarity,
  category: ItemCategory,
  icon: string,
  value: number,
  abilityType: AbilityType,
  level: number,
  maxLevel: number,
  effects: CollectibleEffect[],
  options?: {
    cooldown?: number;
    manaCost?: number;
    charges?: number;
    maxCharges?: number;
    upgradeCost?: number;
    prerequisites?: string[];
    requirements?: CollectibleRequirements;
    flavorText?: string;
    lore?: string;
  }
): Ability => ({
  id,
  name,
  description,
  type,
  rarity,
  category,
  icon,
  value,
  stackable: false,
  effects,
  requirements: options?.requirements,
  flavorText: options?.flavorText,
  lore: options?.lore,
  abilityType,
  cooldown: options?.cooldown,
  manaCost: options?.manaCost,
  charges: options?.charges,
  maxCharges: options?.maxCharges,
  level,
  maxLevel,
  upgradeCost: options?.upgradeCost,
  prerequisites: options?.prerequisites
});

export const createSkill = (
  id: string,
  name: string,
  description: string,
  rarity: Rarity,
  category: ItemCategory,
  icon: string,
  value: number,
  skillType: SkillType,
  level: number,
  maxLevel: number,
  experience: number,
  experienceToNext: number,
  benefits: SkillBenefit[],
  options?: {
    requirements?: CollectibleRequirements;
    flavorText?: string;
    lore?: string;
  }
): Skill => ({
  id,
  name,
  description,
  type: CollectibleType.SKILL,
  rarity,
  category,
  icon,
  value,
  stackable: false,
  effects: [],
  requirements: options?.requirements,
  flavorText: options?.flavorText,
  lore: options?.lore,
  skillType,
  level,
  maxLevel,
  experience,
  experienceToNext,
  benefits
});

export const createTome = (
  id: string,
  name: string,
  description: string,
  type: CollectibleType.TOME | CollectibleType.SCROLL | CollectibleType.MANUAL,
  rarity: Rarity,
  category: ItemCategory,
  icon: string,
  value: number,
  knowledgeType: KnowledgeType,
  pages: number,
  readTime: number,
  benefits: KnowledgeBenefit[],
  options?: {
    requirements?: CollectibleRequirements;
    flavorText?: string;
    lore?: string;
  }
): Tome => ({
  id,
  name,
  description,
  type,
  rarity,
  category,
  icon,
  value,
  stackable: false,
  effects: [],
  requirements: options?.requirements,
  flavorText: options?.flavorText,
  lore: options?.lore,
  knowledgeType,
  pages,
  currentPage: 0,
  readTime,
  benefits
});

export const createRelic = (
  id: string,
  name: string,
  description: string,
  type: CollectibleType.RELIC | CollectibleType.ARTIFACT | CollectibleType.CURSED_ITEM,
  rarity: Rarity,
  category: ItemCategory,
  icon: string,
  value: number,
  power: number,
  effects: CollectibleEffect[],
  specialProperties: Record<string, any>,
  options?: {
    charges?: number;
    maxCharges?: number;
    rechargeRate?: number;
    requirements?: CollectibleRequirements;
    flavorText?: string;
    lore?: string;
  }
): Relic => ({
  id,
  name,
  description,
  type,
  rarity,
  category,
  icon,
  value,
  stackable: false,
  effects,
  requirements: options?.requirements,
  flavorText: options?.flavorText,
  lore: options?.lore,
  power,
  charges: options?.charges,
  maxCharges: options?.maxCharges,
  rechargeRate: options?.rechargeRate,
  specialProperties
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getRarityColor = (rarity: Rarity): string => {
  switch (rarity) {
    case Rarity.COMMON: return '#9CA3AF';
    case Rarity.UNCOMMON: return '#10B981';
    case Rarity.RARE: return '#3B82F6';
    case Rarity.EPIC: return '#8B5CF6';
    case Rarity.LEGENDARY: return '#F59E0B';
    case Rarity.MYTHIC: return '#FF6B6B';
    case Rarity.CURSED: return '#DC2626';
    default: return '#9CA3AF';
  }
};

export const getRarityIcon = (rarity: Rarity): string => {
  switch (rarity) {
    case Rarity.COMMON: return '⚪';
    case Rarity.UNCOMMON: return '🟢';
    case Rarity.RARE: return '🔵';
    case Rarity.EPIC: return '🟣';
    case Rarity.LEGENDARY: return '🟡';
    case Rarity.MYTHIC: return '🔴';
    case Rarity.CURSED: return '⚫';
    default: return '⚪';
  }
};

export const getCategoryIcon = (category: ItemCategory): string => {
  switch (category) {
    case ItemCategory.MEMORY_BOOST: return '🧠';
    case ItemCategory.FOCUS_ENHANCEMENT: return '🎯';
    case ItemCategory.RECALL_IMPROVEMENT: return '💭';
    case ItemCategory.PATTERN_RECOGNITION: return '🔍';
    case ItemCategory.HEALTH_ITEM: return '❤️';
    case ItemCategory.DEFENSIVE_ITEM: return '🛡️';
    case ItemCategory.OFFENSIVE_ITEM: return '⚔️';
    case ItemCategory.KEY_ITEM: return '🗝️';
    case ItemCategory.TOOL: return '🔧';
    case ItemCategory.CONTAINER: return '🎒';
    case ItemCategory.TELEPORTATION: return '🌀';
    case ItemCategory.TIME_MANIPULATION: return '⏰';
    case ItemCategory.REVELATION: return '👁️';
    case ItemCategory.CURSED_MEMORY: return '🧠💀';
    case ItemCategory.CURSED_HEALTH: return '❤️💀';
    case ItemCategory.CURSED_ABILITY: return '⚡💀';
    default: return '📦';
  }
};

export const canAcquire = (collectible: BaseCollectible, playerStats: PlayerStats): boolean => {
  if (!collectible.requirements) return true;
  
  const req = collectible.requirements;
  
  if (req.level && playerStats.level < req.level) return false;
  if (req.floor && playerStats.currentFloor < req.floor) return false;
  if (req.completedRooms && playerStats.roomsCompleted < req.completedRooms) return false;
  if (req.keys && playerStats.keys < req.keys) return false;
  if (req.bombs && playerStats.bombs < req.bombs) return false;
  
  if (req.previousItems) {
    const hasAllItems = req.previousItems.every(itemId => 
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
  
  return true;
};

