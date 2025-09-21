import { Room, RoomTypes, createRoom } from '../types/gameTypes';
import { Item, getRandomItems, getShopItems } from '../data/itemDatabase';
import { RoomGenerator } from './roomGenerator';

export interface SpecialRoomConfig {
    type: string;
    probability: number;
    minFloor: number;
    maxFloor?: number;
    requirements?: {
        keysRequired?: number;
        bombsRequired?: number;
        completedRooms?: number;
    };
}

export const SPECIAL_ROOM_CONFIGS: SpecialRoomConfig[] = [
    // Shop rooms - always available, common
    {
        type: RoomTypes.SHOP,
        probability: 0.3,
        minFloor: 1,
        requirements: { completedRooms: 1 }
    },
    
    // Treasure rooms - common, require keys
    {
        type: RoomTypes.TREASURE,
        probability: 0.4,
        minFloor: 1,
        requirements: { keysRequired: 1 }
    },
    
    // Secret rooms - uncommon, require bombs
    {
        type: RoomTypes.SECRET,
        probability: 0.2,
        minFloor: 2,
        requirements: { bombsRequired: 1 }
    },
    
    // Challenge rooms - rare, high reward
    {
        type: RoomTypes.CHALLENGE,
        probability: 0.15,
        minFloor: 3,
        requirements: { completedRooms: 5 }
    },
    
    // Library rooms - uncommon, item focused
    {
        type: RoomTypes.LIBRARY,
        probability: 0.25,
        minFloor: 2
    },
    
    // Cursed rooms - rare, high risk/reward
    {
        type: RoomTypes.CURSED_ROOM,
        probability: 0.1,
        minFloor: 4
    },
    
    // Devil rooms - very rare, powerful items
    {
        type: RoomTypes.DEVIL_ROOM,
        probability: 0.05,
        minFloor: 5,
        requirements: { completedRooms: 10 }
    },
    
    // Angel rooms - very rare, beneficial items
    {
        type: RoomTypes.ANGEL_ROOM,
        probability: 0.05,
        minFloor: 5,
        requirements: { completedRooms: 10 }
    }
];

export class SpecialRoomGenerator {
    static generateSpecialRoom(
        floorNumber: number, 
        playerStats: any, 
        seed: string | null = null
    ): Room | null {
        const availableConfigs = SPECIAL_ROOM_CONFIGS.filter(config => 
            floorNumber >= config.minFloor && 
            (!config.maxFloor || floorNumber <= config.maxFloor) &&
            this.checkRequirements(config, playerStats)
        );
        
        if (availableConfigs.length === 0) return null;
        
        // Calculate weighted probabilities
        const totalWeight = availableConfigs.reduce((sum, config) => sum + config.probability, 0);
        const random = seed ? this.seededRandom(seed) : Math.random();
        let cumulativeProbability = 0;
        
        for (const config of availableConfigs) {
            cumulativeProbability += config.probability / totalWeight;
            if (random <= cumulativeProbability) {
                return this.createSpecialRoom(config.type, floorNumber, playerStats);
            }
        }
        
        return null;
    }
    
    static createSpecialRoom(roomType: string, floorNumber: number, playerStats: any): Room {
        const room = createRoom(
            `room-${floorNumber}-${roomType}-${Math.random().toString(36).substr(2, 9)}`,
            roomType as any,
            this.calculateDifficulty(roomType, floorNumber),
            floorNumber
        );
        
        // Add special properties based on room type
        room.specialProperties = this.getSpecialProperties(roomType, floorNumber);
        
        // Generate tiles for memory-based rooms
        if (this.isMemoryRoom(roomType)) {
            const gridSize = this.calculateGridSize(roomType, floorNumber);
            room.gridSize = gridSize;
            room.tiles = RoomGenerator.generateTiles(roomType as any, room.difficulty, gridSize, null);
            room.matrix = this.createMatrix(room.tiles, gridSize);
        }
        
        // Add rewards based on room type
        room.rewards = this.generateRewards(roomType, floorNumber, playerStats);
        
        return room;
    }
    
    static checkRequirements(config: SpecialRoomConfig, playerStats: any): boolean {
        if (!config.requirements) return true;
        
        const { keysRequired, bombsRequired, completedRooms } = config.requirements;
        
        if (keysRequired && playerStats.keys < keysRequired) return false;
        if (bombsRequired && playerStats.bombs < bombsRequired) return false;
        if (completedRooms && playerStats.roomsCompleted < completedRooms) return false;
        
        return true;
    }
    
    static calculateDifficulty(roomType: string, floorNumber: number): number {
        const baseDifficulty = floorNumber;
        
        switch (roomType) {
            case RoomTypes.CHALLENGE:
                return baseDifficulty + 2;
            case RoomTypes.CURSED_ROOM:
                return baseDifficulty + 1;
            case RoomTypes.DEVIL_ROOM:
            case RoomTypes.ANGEL_ROOM:
                return baseDifficulty + 3;
            default:
                return baseDifficulty;
        }
    }
    
    static calculateGridSize(roomType: string, floorNumber: number): number {
        const baseSize = Math.min(3 + Math.floor(floorNumber / 2), 6);
        
        switch (roomType) {
            case RoomTypes.CHALLENGE:
                return baseSize + 1;
            case RoomTypes.CURSED_ROOM:
                return baseSize + 2;
            case RoomTypes.SECRET:
                return Math.max(baseSize - 1, 2);
            default:
                return baseSize;
        }
    }
    
    static isMemoryRoom(roomType: string): boolean {
        return [
            RoomTypes.MEMORY_CHAMBER,
            RoomTypes.CHALLENGE,
            RoomTypes.CURSED_ROOM,
            RoomTypes.SECRET
        ].includes(roomType as any);
    }
    
    static getSpecialProperties(roomType: string, floorNumber: number): { [key: string]: any } {
        switch (roomType) {
            case RoomTypes.SHOP:
                return {
                    shopItems: 3 + Math.floor(floorNumber / 2),
                    discount: Math.min(0.1 * floorNumber, 0.5)
                };
            case RoomTypes.TREASURE:
                return {
                    guaranteedItem: true,
                    itemRarity: floorNumber >= 5 ? 'rare' : 'uncommon'
                };
            case RoomTypes.SECRET:
                return {
                    hidden: true,
                    bonusRewards: true
                };
            case RoomTypes.CHALLENGE:
                return {
                    timeLimit: 60 + (floorNumber * 10),
                    perfectReward: true
                };
            case RoomTypes.CURSED_ROOM:
                return {
                    cursed: true,
                    highReward: true,
                    risk: 'lose_life_on_mismatch'
                };
            case RoomTypes.DEVIL_ROOM:
                return {
                    devilDeal: true,
                    powerfulItems: true,
                    cost: 'lives'
                };
            case RoomTypes.ANGEL_ROOM:
                return {
                    angelBlessing: true,
                    beneficialItems: true,
                    free: true
                };
            default:
                return {};
        }
    }
    
    static generateRewards(roomType: string, floorNumber: number, playerStats: any): any[] {
        const rewards: any[] = [];
        
        switch (roomType) {
            case RoomTypes.SHOP:
                // Shop items are handled separately
                break;
            case RoomTypes.TREASURE:
                rewards.push({
                    type: 'item',
                    item: getRandomItems(floorNumber, 1, 'uncommon')[0]
                });
                rewards.push({
                    type: 'points',
                    value: 100 * floorNumber
                });
                break;
            case RoomTypes.SECRET:
                rewards.push({
                    type: 'item',
                    item: getRandomItems(floorNumber, 1, 'rare')[0]
                });
                rewards.push({
                    type: 'keys',
                    value: 2
                });
                rewards.push({
                    type: 'bombs',
                    value: 1
                });
                break;
            case RoomTypes.CHALLENGE:
                rewards.push({
                    type: 'item',
                    item: getRandomItems(floorNumber, 1, 'rare')[0]
                });
                rewards.push({
                    type: 'points',
                    value: 200 * floorNumber
                });
                break;
            case RoomTypes.CURSED_ROOM:
                rewards.push({
                    type: 'item',
                    item: getRandomItems(floorNumber, 1, 'epic')[0]
                });
                rewards.push({
                    type: 'points',
                    value: 300 * floorNumber
                });
                break;
            case RoomTypes.DEVIL_ROOM:
                rewards.push({
                    type: 'item',
                    item: getRandomItems(floorNumber, 2, 'epic')[0]
                });
                break;
            case RoomTypes.ANGEL_ROOM:
                rewards.push({
                    type: 'item',
                    item: getRandomItems(floorNumber, 1, 'legendary')[0]
                });
                rewards.push({
                    type: 'lives',
                    value: 1
                });
                break;
        }
        
        return rewards;
    }
    
    static createMatrix(tiles: any[], gridSize: number): (any | null)[][] {
        const matrix: (any | null)[][] = [];
        for (let y = 0; y < gridSize; y++) {
            matrix[y] = [];
            for (let x = 0; x < gridSize; x++) {
                const tileIndex = y * gridSize + x;
                matrix[y][x] = tiles[tileIndex] || null;
            }
        }
        return matrix;
    }
    
    static seededRandom(seed: string): number {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash) / 2147483647;
    }
}

