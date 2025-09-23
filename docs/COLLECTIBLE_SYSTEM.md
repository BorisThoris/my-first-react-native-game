# Collectible System Documentation

## Overview

The collectible system provides comprehensive data structures for all acquirable items, abilities, skills, tomes, relics, and other collectibles in the game. This system is designed to be easily expandable and maintainable.

## File Structure

```
types/
├── collectibleTypes.ts          # Core type definitions and interfaces
data/
├── collectibleDatabase.ts       # All collectible definitions
├── acquisitionSystem.ts         # How players acquire collectibles
├── shopSystem.ts               # Shop management and purchasing
└── progressionSystem.ts        # Player advancement and milestones
```

## Core Types

### CollectibleType Enum
Defines all possible types of collectibles:
- `ITEM` - Regular items
- `CONSUMABLE` - One-time use items
- `EQUIPMENT` - Weapons, armor, accessories
- `TRINKET` - Special utility items
- `ABILITY` - Active abilities
- `TALENT` - Passive abilities
- `SKILL` - Learnable skills
- `TOME` - Knowledge books
- `SCROLL` - Knowledge scrolls
- `MANUAL` - Instruction manuals
- `RELIC` - Ancient artifacts
- `ARTIFACT` - Powerful artifacts
- `CURSED_ITEM` - Cursed items
- `CURRENCY` - Money and resources
- `MATERIAL` - Crafting materials
- `INGREDIENT` - Alchemy ingredients

### Rarity System
- `COMMON` - Basic items (60% drop rate)
- `UNCOMMON` - Uncommon items (30% drop rate)
- `RARE` - Rare items (10% drop rate)
- `EPIC` - Epic items (5% drop rate)
- `LEGENDARY` - Legendary items (1% drop rate)
- `MYTHIC` - Mythic items (0.1% drop rate)
- `CURSED` - Cursed items (special)

### Item Categories
- `MEMORY_BOOST` - Memory enhancement items
- `FOCUS_ENHANCEMENT` - Focus improvement items
- `RECALL_IMPROVEMENT` - Recall enhancement items
- `PATTERN_RECOGNITION` - Pattern recognition items
- `HEALTH_ITEM` - Health and life items
- `DEFENSIVE_ITEM` - Defensive equipment
- `OFFENSIVE_ITEM` - Offensive equipment
- `KEY_ITEM` - Keys and access items
- `TOOL` - Utility tools
- `CONTAINER` - Storage containers
- `TELEPORTATION` - Teleportation items
- `TIME_MANIPULATION` - Time-related items
- `REVELATION` - Revelation and sight items
- `CURSED_MEMORY` - Cursed memory items
- `CURSED_HEALTH` - Cursed health items
- `CURSED_ABILITY` - Cursed ability items

## Collectible Database

### Items
The `collectibleDatabase.ts` file contains all collectible definitions organized by type:

#### Consumable Items
- **Red Heart** - Restores 1 life (Common)
- **Soul Heart** - Restores 1 life temporarily (Uncommon)
- **Eternal Heart** - Restores 1 life permanently (Rare)
- **Key** - Opens locked rooms (Common)
- **Golden Key** - Opens any locked room (Uncommon)
- **Bomb** - Destroys walls (Common)
- **Mega Bomb** - Destroys multiple walls (Rare)
- **Coin** - Grants 50 points (Common)
- **Gold Coin** - Grants 200 points (Uncommon)

#### Passive Items
- **Memory Boost** - +0.5s preview time (Common)
- **Perfect Memory** - +1s preview time (Uncommon)
- **Eidetic Memory** - +2s preview time (Rare)
- **Focus Crystal** - +1 Focus (Common)
- **Zen Mind** - +2 Focus (Uncommon)
- **Point Multiplier** - 2x points from matches (Uncommon)
- **Streak Master** - Streaks never reset (Rare)
- **Extra Life** - +1 maximum life (Uncommon)
- **Nine Lives** - +3 maximum lives (Rare)

#### Equipment Items
- **Memory Cap** - +1 Pattern Recognition (Common)
- **Crown of Wisdom** - +2 to all memory stats (Legendary)
- **Lucky Coin** - 10% chance for double points (Common)
- **Memory Stone** - -1 Grid Size (Uncommon)

#### Trinkets
- **Cursed Eye** - All tiles visible but harder to match (Cursed)
- **Time Sand** - +1.5s preview time (Rare)
- **Mystic Orb** - Reveals one tile per room (Uncommon)

### Abilities
- **Memory Flash** - Reveals all tiles for 2 seconds (Uncommon)
- **Perfect Recall** - Next 3 matches are automatic (Rare)
- **Time Freeze** - Freezes timer for 5 seconds (Rare)
- **Eidetic Memory** - Permanent +1s preview time (Legendary)
- **Cheat Sight** - Free cheat previews (Uncommon)

### Skills
- **Memory Mastery** - Improves all memory abilities (Common)
- **Pattern Expert** - Specializes in pattern recognition (Uncommon)
- **Focus Discipline** - Develops mental focus (Common)

### Tomes
- **Memory Techniques Vol. 1** - Basic memory improvement (Common)
- **Dungeon Mastery** - Complete dungeon guide (Rare)
- **Focus Meditation** - Ancient focus techniques (Uncommon)

### Relics
- **Crown of Memory** - Enhances all memory abilities (Mythic)
- **Cursed Mirror** - Shows all tiles but makes them harder (Cursed)
- **Time Sandglass** - Manipulates time (Legendary)

## Acquisition System

### Acquisition Sources
- `ROOM_COMPLETION` - Rewards for completing rooms
- `BOSS_DEFEAT` - Rewards for defeating bosses
- `SPECIAL_ROOM` - Rewards from special rooms
- `SHOP_PURCHASE` - Items bought from shops
- `VENDOR_TRADE` - Items traded with vendors
- `CHEST_FOUND` - Items found in chests
- `SECRET_DISCOVERED` - Items from secrets
- `HIDDEN_ROOM` - Items from hidden rooms
- `RANDOM_EVENT` - Items from random events
- `STREAK_REWARD` - Items from streak milestones
- `ACHIEVEMENT` - Items from achievements
- `QUEST_REWARD` - Items from quests
- `BOSS_DROP` - Items dropped by bosses
- `LEGENDARY_FIND` - Very rare finds

### Acquisition Rules
Each source has specific rules for:
- Probability of acquisition
- Minimum floor requirement
- Rarity weights
- Type weights
- Category weights
- Player requirements

### Usage Example
```typescript
import { selectCollectible, AcquisitionSource } from './data/acquisitionSystem';

// Get a random collectible from room completion
const collectible = selectCollectible(AcquisitionSource.ROOM_COMPLETION, playerStats);

// Check if player can acquire from a source
const canAcquire = canAcquireFromSource(AcquisitionSource.BOSS_DEFEAT, playerStats);
```

## Shop System

### Shop Categories
- **Consumables** - One-time use items
- **Equipment** - Weapons, armor, accessories
- **Abilities** - Active and passive abilities
- **Skills** - Learnable skills
- **Tomes** - Knowledge books
- **Relics** - Ancient artifacts
- **Cursed Items** - Dangerous but powerful items

### Shop Features
- Dynamic pricing based on floor and rarity
- Stock management with restocking
- Category unlocking based on progression
- Discount system for different rarities
- Requirements checking for purchases

### Usage Example
```typescript
import { generateShop, purchaseItem } from './data/shopSystem';

// Generate a shop for floor 5
const shop = generateShop(5, playerStats);

// Purchase an item
const result = purchaseItem(shopItem, playerStats);
if (result.success) {
  // Update player stats
  playerStats = result.newStats;
}
```

## Progression System

### Milestone Types
- `LEVEL` - Level-based milestones
- `FLOOR` - Floor-based milestones
- `COLLECTION` - Collection-based milestones
- `MASTERY` - Mastery-based milestones
- `EXPLORATION` - Exploration-based milestones
- `ACHIEVEMENT` - Achievement-based milestones
- `SECRET` - Secret-based milestones

### Milestone Examples
- **Rising Star** - Reach level 5
- **Dungeon Explorer** - Reach floor 5
- **Item Collector** - Collect 10 items
- **Memory Master** - Reach level 20
- **Hot Streak** - Achieve a 10-streak
- **Legendary Finder** - Find a legendary item

### Usage Example
```typescript
import { getAvailableMilestones, completeMilestone } from './data/progressionSystem';

// Get available milestones
const milestones = getAvailableMilestones(playerStats);

// Complete a milestone
const result = completeMilestone(milestone, playerStats);
if (result.success) {
  // Apply rewards
  playerStats = result.newStats;
}
```

## Effect System

### Effect Types
- `LIVES` - Life points
- `MAX_LIVES` - Maximum life points
- `FOCUS` - Focus stat
- `RECALL` - Recall stat
- `PATTERN_RECOGNITION` - Pattern recognition stat
- `CONCENTRATION` - Concentration stat
- `INTUITION` - Intuition stat
- `PERCEPTION` - Perception stat
- `POINTS` - Points
- `KEYS` - Keys
- `BOMBS` - Bombs
- `CURRENCY` - Currency
- `PREVIEW_TIME` - Preview time
- `GRID_SIZE` - Grid size
- `MATCH_BONUS` - Match bonus
- `STREAK_BONUS` - Streak bonus
- `BOSS_MULTIPLIER` - Boss multiplier
- `ROOM_BONUS` - Room bonus
- `FREE_CHEAT` - Free cheat
- `AUTO_MATCH` - Auto match
- `REVEAL_ALL` - Reveal all
- `FREEZE_TIMER` - Freeze timer
- `PERFECT_MEMORY` - Perfect memory
- `CURSED_VISION` - Cursed vision
- `CURSED_MEMORY` - Cursed memory
- `CURSED_HEALTH` - Cursed health
- `TELEPORT` - Teleport
- `REVEAL_MAP` - Reveal map
- `SHOP_DISCOUNT` - Shop discount
- `DOUBLE_REWARDS` - Double rewards

## Adding New Collectibles

### 1. Define the Collectible
```typescript
import { createItem, CollectibleType, Rarity, ItemCategory } from './types/collectibleTypes';

const newItem = createItem(
  'item-id',
  'Item Name',
  'Item description',
  CollectibleType.ITEM,
  Rarity.COMMON,
  ItemCategory.MEMORY_BOOST,
  '🎯',
  100,
  [{ type: EffectType.FOCUS, value: 1, description: '+1 Focus' }]
);
```

### 2. Add to Database
```typescript
// In collectibleDatabase.ts
export const NEW_ITEMS: Item[] = [
  newItem,
  // ... more items
];

export const ALL_ITEMS: Item[] = [
  ...CONSUMABLE_ITEMS,
  ...PASSIVE_ITEMS,
  ...EQUIPMENT_ITEMS,
  ...TRINKET_ITEMS,
  ...NEW_ITEMS // Add here
];
```

### 3. Update Acquisition Rules
```typescript
// In acquisitionSystem.ts
const newRule: AcquisitionRule = {
  source: AcquisitionSource.ROOM_COMPLETION,
  probability: 0.2,
  minFloor: 1,
  rarityWeights: {
    [Rarity.COMMON]: 0.8,
    [Rarity.UNCOMMON]: 0.2,
    // ... other rarities
  }
};
```

## Best Practices

### 1. Naming Conventions
- Use kebab-case for IDs: `memory-boost`
- Use descriptive names: `Perfect Memory` not `PM`
- Use consistent icons: 🧠 for memory, ⚔️ for combat

### 2. Balancing
- Common items should be useful but not overpowered
- Rare items should be significantly better
- Legendary items should be game-changing
- Cursed items should have significant drawbacks

### 3. Progression
- Early items should be simple and effective
- Later items should be complex and powerful
- Each rarity should feel meaningfully different
- Progression should be smooth and rewarding

### 4. Requirements
- Don't make requirements too restrictive
- Provide clear feedback on why requirements aren't met
- Consider multiple paths to the same goal
- Balance difficulty with accessibility

## Testing

### Unit Tests
```typescript
import { createItem, canAcquire } from './types/collectibleTypes';

describe('Collectible System', () => {
  test('should create item correctly', () => {
    const item = createItem('test-item', 'Test Item', 'Test description', ...);
    expect(item.id).toBe('test-item');
    expect(item.name).toBe('Test Item');
  });
  
  test('should check acquisition requirements', () => {
    const canAcquireItem = canAcquire(item, playerStats);
    expect(canAcquireItem).toBe(true);
  });
});
```

### Integration Tests
```typescript
import { generateShop, purchaseItem } from './data/shopSystem';

describe('Shop System', () => {
  test('should generate shop with correct items', () => {
    const shop = generateShop(5, playerStats);
    expect(shop.categories.length).toBeGreaterThan(0);
  });
  
  test('should handle purchase correctly', () => {
    const result = purchaseItem(shopItem, playerStats);
    expect(result.success).toBe(true);
  });
});
```

## Performance Considerations

### 1. Lazy Loading
- Load collectibles only when needed
- Use pagination for large lists
- Cache frequently accessed data

### 2. Memory Management
- Use weak references where appropriate
- Clean up unused collectibles
- Implement proper garbage collection

### 3. Database Optimization
- Index frequently queried fields
- Use efficient data structures
- Minimize redundant data

## Future Enhancements

### 1. Crafting System
- Combine items to create new ones
- Recipe system with requirements
- Material gathering mechanics

### 2. Enchanting System
- Improve existing items
- Add special properties
- Risk/reward mechanics

### 3. Trading System
- Player-to-player trading
- NPC vendors with unique items
- Market economy simulation

### 4. Seasonal Events
- Limited-time collectibles
- Event-specific acquisition rules
- Special progression milestones

This system provides a solid foundation for a comprehensive collectible and progression system that can be easily expanded and maintained.

