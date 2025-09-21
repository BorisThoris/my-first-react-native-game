import { 
    Item, 
    ItemType, 
    ItemRarity, 
    ConsumableType, 
    createItem, 
    createConsumable 
} from '../types/itemTypes';

// CONSUMABLES
export const CONSUMABLES: Item[] = [
    // Health Items
    createConsumable('red-heart', 'Red Heart', 'Restores 1 life', ConsumableType.HEALTH, 1, 25, '❤️'),
    createConsumable('soul-heart', 'Soul Heart', 'Restores 1 life (temporary)', ConsumableType.HEALTH, 1, 50, '💙', ItemRarity.UNCOMMON),
    createConsumable('eternal-heart', 'Eternal Heart', 'Restores 1 life permanently', ConsumableType.HEALTH, 1, 100, '💚', ItemRarity.RARE),
    
    // Keys
    createConsumable('key', 'Key', 'Opens locked rooms', ConsumableType.KEYS, 1, 15, '🗝️'),
    createConsumable('golden-key', 'Golden Key', 'Opens any locked room', ConsumableType.KEYS, 1, 75, '🔑', ItemRarity.UNCOMMON),
    
    // Bombs
    createConsumable('bomb', 'Bomb', 'Destroys walls and reveals secrets', ConsumableType.BOMBS, 1, 20, '💣'),
    createConsumable('mega-bomb', 'Mega Bomb', 'Destroys multiple walls', ConsumableType.BOMBS, 3, 100, '💥', ItemRarity.RARE),
    
    // Points
    createConsumable('coin', 'Coin', 'Grants 50 points', ConsumableType.POINTS, 50, 0, '🪙'),
    createConsumable('gold-coin', 'Gold Coin', 'Grants 200 points', ConsumableType.POINTS, 200, 0, '🪙', ItemRarity.UNCOMMON),
];

// PASSIVE ITEMS
export const PASSIVE_ITEMS: Item[] = [
    // Memory Enhancement
    createItem('memory-boost', 'Memory Boost', 'Increases preview time by 0.5s', ItemType.PASSIVE, ItemRarity.COMMON, 100, 
        [{ type: 'preview_time', value: 0.5, description: '+0.5s preview time' }], '🧠'),
    
    createItem('perfect-memory', 'Perfect Memory', 'Increases preview time by 1s', ItemType.PASSIVE, ItemRarity.UNCOMMON, 250, 
        [{ type: 'preview_time', value: 1.0, description: '+1s preview time' }], '🧠💫'),
    
    createItem('eidetic-memory', 'Eidetic Memory', 'Increases preview time by 2s', ItemType.PASSIVE, ItemRarity.RARE, 500, 
        [{ type: 'preview_time', value: 2.0, description: '+2s preview time' }], '🧠✨'),
    
    // Scoring
    createItem('point-multiplier', 'Point Multiplier', '2x points from matches', ItemType.PASSIVE, ItemRarity.UNCOMMON, 200, 
        [{ type: 'point_multiplier', value: 2, description: '2x points' }], '💰'),
    
    createItem('streak-master', 'Streak Master', 'Streaks never reset', ItemType.PASSIVE, ItemRarity.RARE, 400, 
        [{ type: 'streak_persistent', value: 1, description: 'Streaks never reset' }], '🔥'),
    
    // Lives
    createItem('extra-life', 'Extra Life', '+1 maximum life', ItemType.PASSIVE, ItemRarity.UNCOMMON, 150, 
        [{ type: 'max_lives', value: 1, description: '+1 max life' }], '💖'),
    
    createItem('nine-lives', 'Nine Lives', '+3 maximum lives', ItemType.PASSIVE, ItemRarity.RARE, 500, 
        [{ type: 'max_lives', value: 3, description: '+3 max lives' }], '💖💖💖'),
    
    // Special Abilities
    createItem('cheat-sight', 'Cheat Sight', 'Free cheat previews', ItemType.PASSIVE, ItemRarity.UNCOMMON, 300, 
        [{ type: 'free_cheat', value: 1, description: 'Free cheat previews' }], '👁️'),
    
    createItem('boss-slayer', 'Boss Slayer', 'Boss rooms give 3x points', ItemType.PASSIVE, ItemRarity.RARE, 400, 
        [{ type: 'boss_multiplier', value: 3, description: '3x boss points' }], '⚔️'),
    
    createItem('room-master', 'Room Master', 'All rooms give bonus points', ItemType.PASSIVE, ItemRarity.EPIC, 600, 
        [{ type: 'room_bonus', value: 50, description: '+50 points per room' }], '🏆'),
];

// ACTIVE ITEMS
export const ACTIVE_ITEMS: Item[] = [
    createItem('memory-potion', 'Memory Potion', 'Reveals all tiles for 3 seconds', ItemType.ACTIVE, ItemRarity.UNCOMMON, 200, 
        [{ type: 'reveal_all', value: 3, description: 'Reveal all tiles for 3s' }], '🧪', { maxUses: 3, currentUses: 3 }),
    
    createItem('time-freeze', 'Time Freeze', 'Freezes tile flip timer for 5 seconds', ItemType.ACTIVE, ItemRarity.RARE, 300, 
        [{ type: 'freeze_timer', value: 5, description: 'Freeze timer for 5s' }], '⏰', { maxUses: 2, currentUses: 2 }),
    
    createItem('perfect-match', 'Perfect Match', 'Next 3 matches are automatic', ItemType.ACTIVE, ItemRarity.RARE, 400, 
        [{ type: 'auto_match', value: 3, description: 'Next 3 matches auto' }], '🎯', { maxUses: 1, currentUses: 1 }),
];

// TRINKETS
export const TRINKETS: Item[] = [
    createItem('lucky-coin', 'Lucky Coin', '10% chance for double points', ItemType.TRINKET, ItemRarity.COMMON, 75, 
        [{ type: 'lucky_points', value: 0.1, description: '10% double points' }], '🍀'),
    
    createItem('memory-stone', 'Memory Stone', 'Reduces grid size by 1', ItemType.TRINKET, ItemRarity.UNCOMMON, 200, 
        [{ type: 'grid_reduction', value: 1, description: '-1 grid size' }], '🗿'),
    
    createItem('cursed-eye', 'Cursed Eye', 'All tiles visible but harder to match', ItemType.TRINKET, ItemRarity.RARE, 300, 
        [{ type: 'cursed_vision', value: 1, description: 'All tiles visible but cursed' }], '👁️‍🗨️'),
];

// ALL ITEMS
export const ALL_ITEMS: Item[] = [
    ...CONSUMABLES,
    ...PASSIVE_ITEMS,
    ...ACTIVE_ITEMS,
    ...TRINKETS
];

// ITEM GENERATION FUNCTIONS
export const getItemsByFloor = (floor: number): Item[] => {
    return ALL_ITEMS.filter(item => !item.floorRequirement || item.floorRequirement <= floor);
};

export const getItemsByRarity = (rarity: ItemRarity): Item[] => {
    return ALL_ITEMS.filter(item => item.rarity === rarity);
};

export const getShopItems = (floor: number, roomType?: string): Item[] => {
    const availableItems = getItemsByFloor(floor);
    
    // Filter by room type requirements
    const filteredItems = availableItems.filter(item => 
        !item.roomTypeRequirement || 
        !roomType || 
        item.roomTypeRequirement.includes(roomType)
    );
    
    // Return items suitable for shop (not consumables that are free)
    return filteredItems.filter(item => 
        item.type !== ItemType.CONSUMABLE || 
        item.cost > 0
    );
};

export const getRandomItem = (floor: number, rarity?: ItemRarity): Item | null => {
    let availableItems = getItemsByFloor(floor);
    
    if (rarity) {
        availableItems = availableItems.filter(item => item.rarity === rarity);
    }
    
    if (availableItems.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    return availableItems[randomIndex];
};

export const getRandomItems = (floor: number, count: number, rarity?: ItemRarity): Item[] => {
    const items: Item[] = [];
    const availableItems = rarity ? getItemsByRarity(rarity) : getItemsByFloor(floor);
    
    for (let i = 0; i < count && availableItems.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableItems.length);
        items.push(availableItems[randomIndex]);
        availableItems.splice(randomIndex, 1); // Remove to avoid duplicates
    }
    
    return items;
};

