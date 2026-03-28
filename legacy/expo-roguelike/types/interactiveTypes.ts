export enum InteractiveType {
    WALL = 'wall',
    DOOR = 'door',
    CHEST = 'chest',
    SECRET_WALL = 'secret-wall',
    LOCKED_DOOR = 'locked-door',
    BOMBABLE_WALL = 'bombable-wall',
    TREASURE_CHEST = 'treasure-chest',
    SECRET_PASSAGE = 'secret-passage'
}

export enum InteractiveState {
    HIDDEN = 'hidden',
    VISIBLE = 'visible',
    DESTROYED = 'destroyed',
    OPENED = 'opened',
    LOCKED = 'locked',
    UNLOCKED = 'unlocked'
}

export interface InteractiveElement {
    id: string;
    type: InteractiveType;
    state: InteractiveState;
    position: { x: number; y: number };
    requirements: {
        keys?: number;
        bombs?: number;
        items?: string[];
    };
    rewards?: {
        items?: string[];
        points?: number;
        keys?: number;
        bombs?: number;
    };
    description: string;
    icon: string;
}

export const createInteractiveElement = (
    id: string,
    type: InteractiveType,
    position: { x: number; y: number },
    requirements: InteractiveElement['requirements'] = {},
    rewards: InteractiveElement['rewards'] = {},
    description: string = '',
    icon: string = '🔲'
): InteractiveElement => ({
    id,
    type,
    state: InteractiveState.HIDDEN,
    position,
    requirements,
    rewards,
    description,
    icon
});

export const INTERACTIVE_DESCRIPTIONS = {
    [InteractiveType.WALL]: 'A solid wall blocks your path',
    [InteractiveType.DOOR]: 'A wooden door',
    [InteractiveType.CHEST]: 'A treasure chest',
    [InteractiveType.SECRET_WALL]: 'A suspicious wall',
    [InteractiveType.LOCKED_DOOR]: 'A locked door',
    [InteractiveType.BOMBABLE_WALL]: 'A cracked wall that might be destructible',
    [InteractiveType.TREASURE_CHEST]: 'An ornate treasure chest',
    [InteractiveType.SECRET_PASSAGE]: 'A hidden passage'
};

export const INTERACTIVE_ICONS = {
    [InteractiveType.WALL]: '🧱',
    [InteractiveType.DOOR]: '🚪',
    [InteractiveType.CHEST]: '📦',
    [InteractiveType.SECRET_WALL]: '🧱',
    [InteractiveType.LOCKED_DOOR]: '🔒',
    [InteractiveType.BOMBABLE_WALL]: '💥',
    [InteractiveType.TREASURE_CHEST]: '💎',
    [InteractiveType.SECRET_PASSAGE]: '🕳️'
};





