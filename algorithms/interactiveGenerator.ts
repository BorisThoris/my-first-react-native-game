import { 
    InteractiveElement, 
    InteractiveType, 
    InteractiveState, 
    createInteractiveElement,
    INTERACTIVE_DESCRIPTIONS,
    INTERACTIVE_ICONS
} from '../types/interactiveTypes';
import { getRandomItems } from '../data/itemDatabase';

export class InteractiveGenerator {
    static generateFloorInteractives(floorNumber: number, roomCount: number): InteractiveElement[] {
        const interactives: InteractiveElement[] = [];
        
        // Generate walls between rooms
        for (let i = 0; i < roomCount - 1; i++) {
            if (Math.random() < 0.3) { // 30% chance for bombable wall
                interactives.push(this.createBombableWall(i, floorNumber));
            }
        }
        
        // Generate secret passages
        const secretCount = Math.floor(roomCount * 0.2); // 20% of rooms have secrets
        for (let i = 0; i < secretCount; i++) {
            interactives.push(this.createSecretPassage(i, floorNumber));
        }
        
        // Generate treasure chests
        const chestCount = Math.floor(roomCount * 0.4); // 40% of rooms have chests
        for (let i = 0; i < chestCount; i++) {
            interactives.push(this.createTreasureChest(i, floorNumber));
        }
        
        // Generate locked doors
        const lockedDoorCount = Math.floor(roomCount * 0.3); // 30% of rooms have locked doors
        for (let i = 0; i < lockedDoorCount; i++) {
            interactives.push(this.createLockedDoor(i, floorNumber));
        }
        
        return interactives;
    }
    
    static createBombableWall(roomIndex: number, floorNumber: number): InteractiveElement {
        const rewards = this.generateWallRewards(floorNumber);
        
        return createInteractiveElement(
            `bombable-wall-${roomIndex}-${floorNumber}`,
            InteractiveType.BOMBABLE_WALL,
            { x: roomIndex * 100 + 50, y: 200 },
            { bombs: 1 },
            rewards,
            'A cracked wall that might hide something...',
            '💥'
        );
    }
    
    static createSecretPassage(roomIndex: number, floorNumber: number): InteractiveElement {
        const rewards = this.generateSecretRewards(floorNumber);
        
        return createInteractiveElement(
            `secret-passage-${roomIndex}-${floorNumber}`,
            InteractiveType.SECRET_PASSAGE,
            { x: roomIndex * 100 + 25, y: 150 },
            { bombs: 1 },
            rewards,
            'A hidden passage that might lead to treasure...',
            '🕳️'
        );
    }
    
    static createTreasureChest(roomIndex: number, floorNumber: number): InteractiveElement {
        const rewards = this.generateChestRewards(floorNumber);
        
        return createInteractiveElement(
            `treasure-chest-${roomIndex}-${floorNumber}`,
            InteractiveType.TREASURE_CHEST,
            { x: roomIndex * 100 + 75, y: 250 },
            { keys: 1 },
            rewards,
            'An ornate chest that might contain valuable items...',
            '💎'
        );
    }
    
    static createLockedDoor(roomIndex: number, floorNumber: number): InteractiveElement {
        return createInteractiveElement(
            `locked-door-${roomIndex}-${floorNumber}`,
            InteractiveType.LOCKED_DOOR,
            { x: roomIndex * 100 + 50, y: 100 },
            { keys: 1 },
            { points: 50 * floorNumber },
            'A locked door that requires a key to open...',
            '🔒'
        );
    }
    
    static generateWallRewards(floorNumber: number): InteractiveElement['rewards'] {
        const rewards: InteractiveElement['rewards'] = {
            points: 25 * floorNumber
        };
        
        // 30% chance for item
        if (Math.random() < 0.3) {
            const items = getRandomItems(floorNumber, 1, 'common');
            if (items.length > 0) {
                rewards.items = [items[0].id];
            }
        }
        
        // 20% chance for keys
        if (Math.random() < 0.2) {
            rewards.keys = 1;
        }
        
        return rewards;
    }
    
    static generateSecretRewards(floorNumber: number): InteractiveElement['rewards'] {
        const rewards: InteractiveElement['rewards'] = {
            points: 100 * floorNumber
        };
        
        // 60% chance for item
        if (Math.random() < 0.6) {
            const rarity = floorNumber >= 3 ? 'uncommon' : 'common';
            const items = getRandomItems(floorNumber, 1, rarity as any);
            if (items.length > 0) {
                rewards.items = [items[0].id];
            }
        }
        
        // 40% chance for keys
        if (Math.random() < 0.4) {
            rewards.keys = 2;
        }
        
        // 30% chance for bombs
        if (Math.random() < 0.3) {
            rewards.bombs = 1;
        }
        
        return rewards;
    }
    
    static generateChestRewards(floorNumber: number): InteractiveElement['rewards'] {
        const rewards: InteractiveElement['rewards'] = {
            points: 75 * floorNumber
        };
        
        // 80% chance for item
        if (Math.random() < 0.8) {
            const rarity = floorNumber >= 5 ? 'rare' : floorNumber >= 3 ? 'uncommon' : 'common';
            const items = getRandomItems(floorNumber, 1, rarity as any);
            if (items.length > 0) {
                rewards.items = [items[0].id];
            }
        }
        
        // 50% chance for keys
        if (Math.random() < 0.5) {
            rewards.keys = 1;
        }
        
        // 30% chance for bombs
        if (Math.random() < 0.3) {
            rewards.bombs = 1;
        }
        
        return rewards;
    }
    
    static canInteract(element: InteractiveElement, playerStats: any): boolean {
        const { keys, bombs, items } = playerStats;
        const { requirements } = element;
        
        if (requirements.keys && keys < requirements.keys) return false;
        if (requirements.bombs && bombs < requirements.bombs) return false;
        if (requirements.items) {
            for (const requiredItem of requirements.items) {
                if (!items.some((item: any) => item.id === requiredItem)) return false;
            }
        }
        
        return true;
    }
    
    static interact(element: InteractiveElement, playerStats: any): InteractiveElement['rewards'] | null {
        if (!this.canInteract(element, playerStats)) return null;
        
        // Update element state
        element.state = element.type === InteractiveType.TREASURE_CHEST ? 
            InteractiveState.OPENED : InteractiveState.DESTROYED;
        
        return element.rewards || null;
    }
}


