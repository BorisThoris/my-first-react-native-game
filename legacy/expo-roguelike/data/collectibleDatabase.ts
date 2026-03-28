// ============================================================================
// COLLECTIBLE DATABASE - All acquirable items, abilities, skills, tomes, and relics
// ============================================================================

import {
  CollectibleType,
  Rarity,
  ItemCategory,
  AbilityType,
  SkillType,
  KnowledgeType,
  EquipmentSlot,
  EffectType,
  createItem,
  createAbility,
  createSkill,
  createTome,
  createRelic,
  Item,
  Ability,
  Skill,
  Tome,
  Relic
} from '../types/collectibleTypes';

// ============================================================================
// CONSUMABLE ITEMS
// ============================================================================

export const CONSUMABLE_ITEMS: Item[] = [
  // Health Items
  createItem(
    'red-heart',
    'Red Heart',
    'Restores 1 life immediately',
    CollectibleType.CONSUMABLE,
    Rarity.COMMON,
    ItemCategory.HEALTH_ITEM,
    '❤️',
    25,
    [{ type: EffectType.LIVES, value: 1, description: '+1 Life' }],
    {
      consumable: { maxUses: 1, cooldown: 0 },
      stackable: true,
      maxStack: 99
    }
  ),

  createItem(
    'soul-heart',
    'Soul Heart',
    'Restores 1 life (temporary)',
    CollectibleType.CONSUMABLE,
    Rarity.UNCOMMON,
    ItemCategory.HEALTH_ITEM,
    '💙',
    50,
    [{ type: EffectType.LIVES, value: 1, description: '+1 Life (temporary)' }],
    {
      consumable: { maxUses: 1, cooldown: 0 },
      stackable: true,
      maxStack: 50
    }
  ),

  createItem(
    'eternal-heart',
    'Eternal Heart',
    'Restores 1 life permanently',
    CollectibleType.CONSUMABLE,
    Rarity.RARE,
    ItemCategory.HEALTH_ITEM,
    '💚',
    100,
    [{ type: EffectType.MAX_LIVES, value: 1, description: '+1 Max Life' }],
    {
      consumable: { maxUses: 1, cooldown: 0 },
      stackable: true,
      maxStack: 10
    }
  ),

  // Keys
  createItem(
    'key',
    'Key',
    'Opens locked rooms',
    CollectibleType.CONSUMABLE,
    Rarity.COMMON,
    ItemCategory.KEY_ITEM,
    '🗝️',
    15,
    [{ type: EffectType.KEYS, value: 1, description: '+1 Key' }],
    {
      consumable: { maxUses: 1, cooldown: 0 },
      stackable: true,
      maxStack: 99
    }
  ),

  createItem(
    'golden-key',
    'Golden Key',
    'Opens any locked room',
    CollectibleType.CONSUMABLE,
    Rarity.UNCOMMON,
    ItemCategory.KEY_ITEM,
    '🔑',
    75,
    [{ type: EffectType.KEYS, value: 1, description: '+1 Golden Key' }],
    {
      consumable: { maxUses: 1, cooldown: 0 },
      stackable: true,
      maxStack: 20
    }
  ),

  // Bombs
  createItem(
    'bomb',
    'Bomb',
    'Destroys walls and reveals secrets',
    CollectibleType.CONSUMABLE,
    Rarity.COMMON,
    ItemCategory.TOOL,
    '💣',
    20,
    [{ type: EffectType.BOMBS, value: 1, description: '+1 Bomb' }],
    {
      consumable: { maxUses: 1, cooldown: 0 },
      stackable: true,
      maxStack: 99
    }
  ),

  createItem(
    'mega-bomb',
    'Mega Bomb',
    'Destroys multiple walls',
    CollectibleType.CONSUMABLE,
    Rarity.RARE,
    ItemCategory.TOOL,
    '💥',
    100,
    [{ type: EffectType.BOMBS, value: 3, description: '+3 Bombs' }],
    {
      consumable: { maxUses: 1, cooldown: 0 },
      stackable: true,
      maxStack: 20
    }
  ),

  // Points
  createItem(
    'coin',
    'Coin',
    'Grants 50 points',
    CollectibleType.CONSUMABLE,
    Rarity.COMMON,
    ItemCategory.CURRENCY,
    '🪙',
    0,
    [{ type: EffectType.POINTS, value: 50, description: '+50 Points' }],
    {
      consumable: { maxUses: 1, cooldown: 0 },
      stackable: true,
      maxStack: 99
    }
  ),

  createItem(
    'gold-coin',
    'Gold Coin',
    'Grants 200 points',
    CollectibleType.CONSUMABLE,
    Rarity.UNCOMMON,
    ItemCategory.CURRENCY,
    '🪙',
    0,
    [{ type: EffectType.POINTS, value: 200, description: '+200 Points' }],
    {
      consumable: { maxUses: 1, cooldown: 0 },
      stackable: true,
      maxStack: 50
    }
  )
];

// ============================================================================
// PASSIVE ITEMS
// ============================================================================

export const PASSIVE_ITEMS: Item[] = [
  // Memory Enhancement
  createItem(
    'memory-boost',
    'Memory Boost',
    'Increases preview time by 0.5s',
    CollectibleType.ITEM,
    Rarity.COMMON,
    ItemCategory.MEMORY_BOOST,
    '🧠',
    100,
    [{ type: EffectType.PREVIEW_TIME, value: 0.5, description: '+0.5s preview time' }]
  ),

  createItem(
    'perfect-memory',
    'Perfect Memory',
    'Increases preview time by 1s',
    CollectibleType.ITEM,
    Rarity.UNCOMMON,
    ItemCategory.MEMORY_BOOST,
    '🧠💫',
    250,
    [{ type: EffectType.PREVIEW_TIME, value: 1.0, description: '+1s preview time' }]
  ),

  createItem(
    'eidetic-memory',
    'Eidetic Memory',
    'Increases preview time by 2s',
    CollectibleType.ITEM,
    Rarity.RARE,
    ItemCategory.MEMORY_BOOST,
    '🧠✨',
    500,
    [{ type: EffectType.PREVIEW_TIME, value: 2.0, description: '+2s preview time' }]
  ),

  // Focus Enhancement
  createItem(
    'focus-crystal',
    'Focus Crystal',
    'Increases focus by 1',
    CollectibleType.ITEM,
    Rarity.COMMON,
    ItemCategory.FOCUS_ENHANCEMENT,
    '💎',
    150,
    [{ type: EffectType.FOCUS, value: 1, description: '+1 Focus' }]
  ),

  createItem(
    'zen-mind',
    'Zen Mind',
    'Increases focus by 2',
    CollectibleType.ITEM,
    Rarity.UNCOMMON,
    ItemCategory.FOCUS_ENHANCEMENT,
    '🧘',
    300,
    [{ type: EffectType.FOCUS, value: 2, description: '+2 Focus' }]
  ),

  // Scoring
  createItem(
    'point-multiplier',
    'Point Multiplier',
    '2x points from matches',
    CollectibleType.ITEM,
    Rarity.UNCOMMON,
    ItemCategory.CURRENCY,
    '💰',
    200,
    [{ type: EffectType.MATCH_BONUS, value: 2, description: '2x points from matches' }]
  ),

  createItem(
    'streak-master',
    'Streak Master',
    'Streaks never reset',
    CollectibleType.ITEM,
    Rarity.RARE,
    ItemCategory.CURRENCY,
    '🔥',
    400,
    [{ type: EffectType.STREAK_BONUS, value: 1, description: 'Streaks never reset' }]
  ),

  // Lives
  createItem(
    'extra-life',
    'Extra Life',
    '+1 maximum life',
    CollectibleType.ITEM,
    Rarity.UNCOMMON,
    ItemCategory.HEALTH_ITEM,
    '💖',
    150,
    [{ type: EffectType.MAX_LIVES, value: 1, description: '+1 Max Life' }]
  ),

  createItem(
    'nine-lives',
    'Nine Lives',
    '+3 maximum lives',
    CollectibleType.ITEM,
    Rarity.RARE,
    ItemCategory.HEALTH_ITEM,
    '💖💖💖',
    500,
    [{ type: EffectType.MAX_LIVES, value: 3, description: '+3 Max Lives' }]
  )
];

// ============================================================================
// EQUIPMENT ITEMS
// ============================================================================

export const EQUIPMENT_ITEMS: Item[] = [
  // Head Equipment
  createItem(
    'memory-cap',
    'Memory Cap',
    'Increases pattern recognition',
    CollectibleType.EQUIPMENT,
    Rarity.COMMON,
    ItemCategory.PATTERN_RECOGNITION,
    '🧢',
    200,
    [{ type: EffectType.PATTERN_RECOGNITION, value: 1, description: '+1 Pattern Recognition' }],
    {
      equipment: { slot: EquipmentSlot.HEAD, durability: 100 }
    }
  ),

  createItem(
    'crown-of-wisdom',
    'Crown of Wisdom',
    'Increases all memory stats',
    CollectibleType.EQUIPMENT,
    Rarity.LEGENDARY,
    ItemCategory.MEMORY_BOOST,
    '👑',
    1000,
    [
      { type: EffectType.FOCUS, value: 2, description: '+2 Focus' },
      { type: EffectType.RECALL, value: 2, description: '+2 Recall' },
      { type: EffectType.PATTERN_RECOGNITION, value: 2, description: '+2 Pattern Recognition' }
    ],
    {
      equipment: { slot: EquipmentSlot.HEAD, durability: 200 },
      requirements: { level: 10, floor: 5 }
    }
  ),

  // Accessories
  createItem(
    'lucky-coin',
    'Lucky Coin',
    '10% chance for double points',
    CollectibleType.EQUIPMENT,
    Rarity.COMMON,
    ItemCategory.CURRENCY,
    '🍀',
    75,
    [{ type: EffectType.MATCH_BONUS, value: 0.1, description: '10% chance for double points' }],
    {
      equipment: { slot: EquipmentSlot.ACCESSORY, durability: 50 }
    }
  ),

  createItem(
    'memory-stone',
    'Memory Stone',
    'Reduces grid size by 1',
    CollectibleType.EQUIPMENT,
    Rarity.UNCOMMON,
    ItemCategory.MEMORY_BOOST,
    '🗿',
    200,
    [{ type: EffectType.GRID_SIZE, value: -1, description: '-1 Grid Size' }],
    {
      equipment: { slot: EquipmentSlot.ACCESSORY, durability: 100 }
    }
  )
];

// ============================================================================
// TRINKETS
// ============================================================================

export const TRINKET_ITEMS: Item[] = [
  createItem(
    'cursed-eye',
    'Cursed Eye',
    'All tiles visible but harder to match',
    CollectibleType.TRINKET,
    Rarity.CURSED,
    ItemCategory.CURSED_MEMORY,
    '👁️‍🗨️',
    300,
    [{ type: EffectType.CURSED_VISION, value: 1, description: 'All tiles visible but cursed' }]
  ),

  createItem(
    'time-sand',
    'Time Sand',
    'Slows down tile flip timer',
    CollectibleType.TRINKET,
    Rarity.RARE,
    ItemCategory.TIME_MANIPULATION,
    '⏳',
    400,
    [{ type: EffectType.PREVIEW_TIME, value: 1.5, description: '+1.5s preview time' }]
  ),

  createItem(
    'mystic-orb',
    'Mystic Orb',
    'Reveals one tile per room',
    CollectibleType.TRINKET,
    Rarity.UNCOMMON,
    ItemCategory.REVELATION,
    '🔮',
    250,
    [{ type: EffectType.REVEAL_ALL, value: 1, description: 'Reveals 1 tile per room' }]
  )
];

// ============================================================================
// ABILITIES
// ============================================================================

export const ABILITIES: Ability[] = [
  // Memory Abilities
  createAbility(
    'memory-flash',
    'Memory Flash',
    'Instantly reveals all tiles for 2 seconds',
    CollectibleType.ABILITY,
    Rarity.UNCOMMON,
    ItemCategory.MEMORY_BOOST,
    '⚡',
    300,
    AbilityType.ACTIVE,
    1,
    5,
    [{ type: EffectType.REVEAL_ALL, value: 2, description: 'Reveal all tiles for 2s' }],
    {
      cooldown: 30,
      charges: 3,
      maxCharges: 3,
      upgradeCost: 200
    }
  ),

  createAbility(
    'perfect-recall',
    'Perfect Recall',
    'Next 3 matches are automatic',
    CollectibleType.ABILITY,
    Rarity.RARE,
    ItemCategory.RECALL_IMPROVEMENT,
    '🎯',
    500,
    AbilityType.ACTIVE,
    1,
    3,
    [{ type: EffectType.AUTO_MATCH, value: 3, description: 'Next 3 matches auto' }],
    {
      cooldown: 60,
      charges: 1,
      maxCharges: 1,
      upgradeCost: 400
    }
  ),

  createAbility(
    'time-freeze',
    'Time Freeze',
    'Freezes tile flip timer for 5 seconds',
    CollectibleType.ABILITY,
    Rarity.RARE,
    ItemCategory.TIME_MANIPULATION,
    '⏰',
    400,
    AbilityType.ACTIVE,
    1,
    3,
    [{ type: EffectType.FREEZE_TIMER, value: 5, description: 'Freeze timer for 5s' }],
    {
      cooldown: 45,
      charges: 2,
      maxCharges: 2,
      upgradeCost: 300
    }
  ),

  // Passive Abilities
  createAbility(
    'eidetic-memory',
    'Eidetic Memory',
    'Permanent +1s preview time',
    CollectibleType.TALENT,
    Rarity.LEGENDARY,
    ItemCategory.MEMORY_BOOST,
    '🧠✨',
    800,
    AbilityType.PASSIVE,
    1,
    1,
    [{ type: EffectType.PREVIEW_TIME, value: 1, description: '+1s preview time' }],
    {
      requirements: { level: 5, floor: 3 }
    }
  ),

  createAbility(
    'cheat-sight',
    'Cheat Sight',
    'Free cheat previews',
    CollectibleType.TALENT,
    Rarity.UNCOMMON,
    ItemCategory.REVELATION,
    '👁️',
    300,
    AbilityType.PASSIVE,
    1,
    1,
    [{ type: EffectType.FREE_CHEAT, value: 1, description: 'Free cheat previews' }]
  )
];

// ============================================================================
// SKILLS
// ============================================================================

export const SKILLS: Skill[] = [
  createSkill(
    'memory-mastery',
    'Memory Mastery',
    'Improves all memory-related abilities',
    Rarity.COMMON,
    ItemCategory.MEMORY_BOOST,
    '🧠',
    100,
    SkillType.MEMORY,
    1,
    10,
    0,
    100,
    [
      { level: 1, effect: { type: EffectType.PREVIEW_TIME, value: 0.1, description: '+0.1s preview time' }, description: 'Basic memory improvement' },
      { level: 3, effect: { type: EffectType.FOCUS, value: 1, description: '+1 Focus' }, description: 'Enhanced focus' },
      { level: 5, effect: { type: EffectType.PREVIEW_TIME, value: 0.5, description: '+0.5s preview time' }, description: 'Advanced memory techniques' },
      { level: 7, effect: { type: EffectType.RECALL, value: 1, description: '+1 Recall' }, description: 'Perfect recall' },
      { level: 10, effect: { type: EffectType.PREVIEW_TIME, value: 1, description: '+1s preview time' }, description: 'Master of memory' }
    ]
  ),

  createSkill(
    'pattern-expert',
    'Pattern Expert',
    'Specializes in pattern recognition',
    Rarity.UNCOMMON,
    ItemCategory.PATTERN_RECOGNITION,
    '🔍',
    200,
    SkillType.PATTERN,
    1,
    8,
    0,
    150,
    [
      { level: 1, effect: { type: EffectType.PATTERN_RECOGNITION, value: 1, description: '+1 Pattern Recognition' }, description: 'Basic pattern recognition' },
      { level: 3, effect: { type: EffectType.PATTERN_RECOGNITION, value: 1, description: '+1 Pattern Recognition' }, description: 'Improved pattern analysis' },
      { level: 5, effect: { type: EffectType.PATTERN_RECOGNITION, value: 2, description: '+2 Pattern Recognition' }, description: 'Advanced pattern mastery' },
      { level: 8, effect: { type: EffectType.PATTERN_RECOGNITION, value: 3, description: '+3 Pattern Recognition' }, description: 'Pattern recognition master' }
    ]
  ),

  createSkill(
    'focus-discipline',
    'Focus Discipline',
    'Develops mental focus and concentration',
    Rarity.COMMON,
    ItemCategory.FOCUS_ENHANCEMENT,
    '🎯',
    150,
    SkillType.FOCUS,
    1,
    10,
    0,
    120,
    [
      { level: 1, effect: { type: EffectType.FOCUS, value: 1, description: '+1 Focus' }, description: 'Basic focus training' },
      { level: 3, effect: { type: EffectType.CONCENTRATION, value: 1, description: '+1 Concentration' }, description: 'Enhanced concentration' },
      { level: 5, effect: { type: EffectType.FOCUS, value: 2, description: '+2 Focus' }, description: 'Advanced focus techniques' },
      { level: 7, effect: { type: EffectType.CONCENTRATION, value: 2, description: '+2 Concentration' }, description: 'Master of focus' },
      { level: 10, effect: { type: EffectType.FOCUS, value: 3, description: '+3 Focus' }, description: 'Zen master' }
    ]
  )
];

// ============================================================================
// TOMES
// ============================================================================

export const TOMES: Tome[] = [
  createTome(
    'memory-techniques-vol1',
    'Memory Techniques Vol. 1',
    'Basic memory improvement methods',
    CollectibleType.TOME,
    Rarity.COMMON,
    ItemCategory.MEMORY_BOOST,
    '📚',
    100,
    KnowledgeType.MEMORY_TECHNIQUES,
    10,
    30,
    [
      { page: 1, effect: { type: EffectType.PREVIEW_TIME, value: 0.2, description: '+0.2s preview time' }, description: 'Basic memory palace technique', unlocked: false },
      { page: 3, effect: { type: EffectType.FOCUS, value: 1, description: '+1 Focus' }, description: 'Focus meditation methods', unlocked: false },
      { page: 5, effect: { type: EffectType.PREVIEW_TIME, value: 0.3, description: '+0.3s preview time' }, description: 'Advanced memory techniques', unlocked: false },
      { page: 7, effect: { type: EffectType.RECALL, value: 1, description: '+1 Recall' }, description: 'Perfect recall methods', unlocked: false },
      { page: 10, effect: { type: EffectType.PREVIEW_TIME, value: 0.5, description: '+0.5s preview time' }, description: 'Master memory techniques', unlocked: false }
    ]
  ),

  createTome(
    'dungeon-mastery',
    'Dungeon Mastery',
    'Complete guide to dungeon exploration',
    CollectibleType.MANUAL,
    Rarity.RARE,
    ItemCategory.DUNGEON_KNOWLEDGE,
    '📖',
    500,
    KnowledgeType.DUNGEON_KNOWLEDGE,
    20,
    60,
    [
      { page: 1, effect: { type: EffectType.ROOM_BONUS, value: 10, description: '+10 points per room' }, description: 'Basic dungeon navigation', unlocked: false },
      { page: 5, effect: { type: EffectType.BOSS_MULTIPLIER, value: 1.5, description: '1.5x boss points' }, description: 'Boss room strategies', unlocked: false },
      { page: 10, effect: { type: EffectType.ROOM_BONUS, value: 25, description: '+25 points per room' }, description: 'Advanced exploration techniques', unlocked: false },
      { page: 15, effect: { type: EffectType.BOSS_MULTIPLIER, value: 2, description: '2x boss points' }, description: 'Master dungeon explorer', unlocked: false },
      { page: 20, effect: { type: EffectType.ROOM_BONUS, value: 50, description: '+50 points per room' }, description: 'Legendary dungeon master', unlocked: false }
    ],
    {
      requirements: { level: 3, floor: 2 }
    }
  ),

  createTome(
    'focus-meditation',
    'Focus Meditation',
    'Ancient techniques for mental focus',
    CollectibleType.SCROLL,
    Rarity.UNCOMMON,
    ItemCategory.FOCUS_ENHANCEMENT,
    '📜',
    200,
    KnowledgeType.FOCUS_MEDITATION,
    5,
    20,
    [
      { page: 1, effect: { type: EffectType.FOCUS, value: 1, description: '+1 Focus' }, description: 'Basic meditation techniques', unlocked: false },
      { page: 2, effect: { type: EffectType.CONCENTRATION, value: 1, description: '+1 Concentration' }, description: 'Concentration methods', unlocked: false },
      { page: 3, effect: { type: EffectType.FOCUS, value: 1, description: '+1 Focus' }, description: 'Advanced meditation', unlocked: false },
      { page: 4, effect: { type: EffectType.CONCENTRATION, value: 1, description: '+1 Concentration' }, description: 'Master focus techniques', unlocked: false },
      { page: 5, effect: { type: EffectType.FOCUS, value: 2, description: '+2 Focus' }, description: 'Zen mastery', unlocked: false }
    ]
  )
];

// ============================================================================
// RELICS
// ============================================================================

export const RELICS: Relic[] = [
  createRelic(
    'crown-of-memory',
    'Crown of Memory',
    'Ancient crown that enhances all memory abilities',
    CollectibleType.RELIC,
    Rarity.MYTHIC,
    ItemCategory.MEMORY_BOOST,
    '👑',
    2000,
    10,
    [
      { type: EffectType.PREVIEW_TIME, value: 3, description: '+3s preview time' },
      { type: EffectType.FOCUS, value: 5, description: '+5 Focus' },
      { type: EffectType.RECALL, value: 5, description: '+5 Recall' },
      { type: EffectType.PATTERN_RECOGNITION, value: 5, description: '+5 Pattern Recognition' }
    ],
    {
      charges: 0,
      maxCharges: 0,
      specialProperties: {
        'memory_boost': true,
        'perfect_recall': true,
        'eidetic_memory': true
      }
    },
    {
      requirements: { level: 15, floor: 10, completedRooms: 100 }
    }
  ),

  createRelic(
    'cursed-mirror',
    'Cursed Mirror',
    'Shows all tiles but makes them harder to match',
    CollectibleType.CURSED_ITEM,
    Rarity.CURSED,
    ItemCategory.CURSED_MEMORY,
    '🪞',
    500,
    5,
    [
      { type: EffectType.CURSED_VISION, value: 1, description: 'All tiles visible but cursed' },
      { type: EffectType.PREVIEW_TIME, value: 2, description: '+2s preview time' }
    ],
    {
      charges: 0,
      maxCharges: 0,
      specialProperties: {
        'cursed_vision': true,
        'difficulty_increase': 2
      }
    }
  ),

  createRelic(
    'time-sandglass',
    'Time Sandglass',
    'Manipulates time in memory games',
    CollectibleType.ARTIFACT,
    Rarity.LEGENDARY,
    ItemCategory.TIME_MANIPULATION,
    '⏳',
    1500,
    8,
    [
      { type: EffectType.PREVIEW_TIME, value: 2, description: '+2s preview time' },
      { type: EffectType.FREEZE_TIMER, value: 3, description: 'Freeze timer for 3s' }
    ],
    {
      charges: 3,
      maxCharges: 3,
      rechargeRate: 1,
      specialProperties: {
        'time_manipulation': true,
        'freeze_ability': true
      }
    },
    {
      requirements: { level: 8, floor: 5 }
    }
  )
];

// ============================================================================
// COMBINED DATABASES
// ============================================================================

export const ALL_ITEMS: Item[] = [
  ...CONSUMABLE_ITEMS,
  ...PASSIVE_ITEMS,
  ...EQUIPMENT_ITEMS,
  ...TRINKET_ITEMS
];

export const ALL_ABILITIES: Ability[] = ABILITIES;

export const ALL_SKILLS: Skill[] = SKILLS;

export const ALL_TOMES: Tome[] = TOMES;

export const ALL_RELICS: Relic[] = RELICS;

export const ALL_COLLECTIBLES = [
  ...ALL_ITEMS,
  ...ALL_ABILITIES,
  ...ALL_SKILLS,
  ...ALL_TOMES,
  ...ALL_RELICS
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getCollectiblesByType = (type: CollectibleType) => {
  return ALL_COLLECTIBLES.filter(collectible => collectible.type === type);
};

export const getCollectiblesByRarity = (rarity: Rarity) => {
  return ALL_COLLECTIBLES.filter(collectible => collectible.rarity === rarity);
};

export const getCollectiblesByCategory = (category: ItemCategory) => {
  return ALL_COLLECTIBLES.filter(collectible => collectible.category === category);
};

export const getCollectiblesByFloor = (floor: number) => {
  return ALL_COLLECTIBLES.filter(collectible => 
    !collectible.requirements?.floor || collectible.requirements.floor <= floor
  );
};

export const getRandomCollectible = (type?: CollectibleType, rarity?: Rarity) => {
  let available = ALL_COLLECTIBLES;
  
  if (type) {
    available = available.filter(collectible => collectible.type === type);
  }
  
  if (rarity) {
    available = available.filter(collectible => collectible.rarity === rarity);
  }
  
  if (available.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
};

export const getRandomCollectibles = (count: number, type?: CollectibleType, rarity?: Rarity) => {
  const collectibles = [];
  const available = [...ALL_COLLECTIBLES];
  
  if (type) {
    available.filter(collectible => collectible.type === type);
  }
  
  if (rarity) {
    available.filter(collectible => collectible.rarity === rarity);
  }
  
  for (let i = 0; i < count && available.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * available.length);
    collectibles.push(available[randomIndex]);
    available.splice(randomIndex, 1); // Remove to avoid duplicates
  }
  
  return collectibles;
};

