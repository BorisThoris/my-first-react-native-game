import type { SaveData } from './contracts';

export type CosmeticSlot = 'title' | 'crest' | 'card_back';
export type CosmeticStatus = 'owned' | 'locked';
export type CosmeticId = 'crest_daily_bronze' | 'title_ascendant_v' | 'card_back_relic_gold';

export interface CosmeticDefinition {
    id: CosmeticId;
    slot: CosmeticSlot;
    title?: string;
    label: string;
    description: string;
    unlockHint?: string;
    unlockSource: string;
    fallback: string;
    gameplayAffecting: false;
    defaultOwned?: boolean;
}

export interface CosmeticStateRow extends CosmeticDefinition {
    status: CosmeticStatus;
    equipped: boolean;
}

export const COSMETIC_UNLOCK_PREFIX = 'cosmetic:' as const;

export const COSMETIC_CATALOG: Record<CosmeticId, CosmeticDefinition> = {
    crest_daily_bronze: {
        id: 'crest_daily_bronze',
        slot: 'crest',
        label: 'Daily Bronze Crest',
        description: 'Cosmetic crest slot for daily participation.',
        unlockSource: 'Future honor bridge: Daily Initiate',
        fallback: 'Menu seal',
        gameplayAffecting: false
    },
    title_ascendant_v: {
        id: 'title_ascendant_v',
        slot: 'title',
        label: 'Ascendant V',
        description: 'Cosmetic title slot for no-powers mastery.',
        unlockSource: 'Future honor bridge: Ascendant V',
        fallback: 'Seeker title',
        gameplayAffecting: false
    },
    card_back_relic_gold: {
        id: 'card_back_relic_gold',
        slot: 'card_back',
        label: 'Relic Gold Card Back',
        description: 'Future card-back cosmetic; display only until REG-066 wires theme rendering.',
        unlockSource: 'Future cosmetic/theme economy',
        fallback: 'Classic Card Back',
        gameplayAffecting: false
    }
};

const DEFAULT_COSMETIC_ROWS: CosmeticDefinition[] = [
    {
        id: 'crest_daily_bronze',
        slot: 'crest',
        label: 'Lantern Crest',
        description: 'Default archive crest.',
        unlockSource: 'Default',
        fallback: 'Menu seal',
        gameplayAffecting: false,
        defaultOwned: true
    },
    {
        id: 'title_ascendant_v',
        slot: 'title',
        label: 'Seeker',
        description: 'Default local title for every profile.',
        unlockSource: 'Default',
        fallback: 'Plain title text',
        gameplayAffecting: false,
        defaultOwned: true
    }
];

const catalogRows = (): CosmeticDefinition[] => Object.values(COSMETIC_CATALOG);

const ownedCosmeticTags = (save: SaveData): Set<string> => new Set(save.unlocks ?? []);

export const cosmeticUnlockTag = (id: string): string => `${COSMETIC_UNLOCK_PREFIX}${id}`;

export const unlockedCosmeticIds = (save: SaveData): CosmeticId[] =>
    catalogRows()
        .map((row) => row.id)
        .filter((id) => ownedCosmeticTags(save).has(cosmeticUnlockTag(id)));

export const cosmeticIsOwned = (save: SaveData, id: string): boolean => {
    const def = catalogRows().find((entry) => entry.id === id);
    if (!def) {
        return false;
    }
    return def.defaultOwned === true || ownedCosmeticTags(save).has(cosmeticUnlockTag(id));
};

export const deriveCosmeticStates = (save: SaveData): CosmeticStateRow[] => {
    const firstOwnedBySlot = new Map<CosmeticSlot, string>();
    for (const def of [...DEFAULT_COSMETIC_ROWS, ...catalogRows()]) {
        if (cosmeticIsOwned(save, def.id) && !firstOwnedBySlot.has(def.slot)) {
            firstOwnedBySlot.set(def.slot, def.id);
        }
    }

    return [...DEFAULT_COSMETIC_ROWS, ...catalogRows()].map((def) => {
        const owned = cosmeticIsOwned(save, def.id);
        return {
            ...def,
            status: owned ? 'owned' : 'locked',
            equipped: owned && firstOwnedBySlot.get(def.slot) === def.id
        };
    });
};

export const getCosmeticRows = deriveCosmeticStates;

export const getCosmeticCollectionRows = deriveCosmeticStates;

export const getOwnedCosmeticIds = (save: SaveData): CosmeticId[] =>
    deriveCosmeticStates(save)
        .filter((row) => row.status === 'owned')
        .map((row) => row.id);

export const getEquippedCosmeticId = (save: SaveData, slot: CosmeticSlot): CosmeticId | null =>
    deriveCosmeticStates(save).find((row) => row.slot === slot && row.equipped)?.id ?? null;
