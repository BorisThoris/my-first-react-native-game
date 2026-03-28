export enum ItemType {
    CONSUMABLE = 'consumable',
    PASSIVE = 'passive',
    ACTIVE = 'active',
    TRINKET = 'trinket'
}

export enum ItemRarity {
    COMMON = 'common',
    UNCOMMON = 'uncommon',
    RARE = 'rare',
    EPIC = 'epic',
    LEGENDARY = 'legendary'
}

export enum ConsumableType {
    HEALTH = 'health',
    KEYS = 'keys',
    BOMBS = 'bombs',
    POINTS = 'points',
    LIVES = 'lives'
}

export interface ItemEffect {
    type: string;
    value: number;
    duration?: number; // For temporary effects
    description: string;
}

export interface Item {
    id: string;
    name: string;
    description: string;
    type: ItemType;
    rarity: ItemRarity;
    cost: number;
    effects: ItemEffect[];
    consumableType?: ConsumableType;
    maxUses?: number;
    currentUses?: number;
    floorRequirement?: number; // Minimum floor to appear
    roomTypeRequirement?: string[]; // Required room types to appear
    icon: string;
}

export interface PlayerInventory {
    items: Item[];
    keys: number;
    bombs: number;
    consumables: { [key: string]: number }; // itemId -> quantity
}

export const createItem = (
    id: string,
    name: string,
    description: string,
    type: ItemType,
    rarity: ItemRarity,
    cost: number,
    effects: ItemEffect[],
    icon: string,
    options: Partial<Item> = {}
): Item => ({
    id,
    name,
    description,
    type,
    rarity,
    cost,
    effects,
    icon,
    maxUses: 1,
    currentUses: 1,
    ...options
});

export const createConsumable = (
    id: string,
    name: string,
    description: string,
    consumableType: ConsumableType,
    value: number,
    cost: number,
    icon: string,
    rarity: ItemRarity = ItemRarity.COMMON
): Item => createItem(
    id,
    name,
    description,
    ItemType.CONSUMABLE,
    rarity,
    cost,
    [{ type: consumableType, value, description: `+${value} ${consumableType}` }],
    icon,
    { consumableType }
);

