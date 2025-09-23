import { useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import useGameStore from '../stores/gameStore';
import useDungeonStore from '../stores/dungeonStore';
import { Room } from '../types/gameTypes';
import { selectCollectible, AcquisitionSource, getRoomCompletionRewards } from '../data/acquisitionSystem';

export const useRoomCompletion = (room: Room) => {
    const { isRoomCompleted, playerStats, updateStats } = useGameStore();
    const { completeRoom, getCurrentFloor, advanceFloor } = useDungeonStore();

    const handleRoomCompletion = useCallback(() => {
        if (!room || room.completed) return;

        // Get rewards from acquisition system
        const rewards = getRoomCompletionRewards(room.type, room.difficulty, playerStats);
        
        // Apply rewards to player stats
        if (rewards.length > 0) {
            const newStats = { ...playerStats };
            rewards.forEach(reward => {
                if (reward.type === 'collectible' && reward.collectible) {
                    // Add collectible to appropriate array
                    switch (reward.collectible.type) {
                        case 'item':
                        case 'consumable':
                        case 'equipment':
                        case 'trinket':
                            newStats.items.push(reward.collectible);
                            break;
                        case 'ability':
                        case 'talent':
                            newStats.abilities.push(reward.collectible);
                            break;
                        case 'skill':
                            newStats.skills.push(reward.collectible);
                            break;
                        case 'tome':
                        case 'scroll':
                        case 'manual':
                            newStats.tomes.push(reward.collectible);
                            break;
                        case 'relic':
                        case 'artifact':
                        case 'cursed_item':
                            newStats.relics.push(reward.collectible);
                            break;
                    }
                }
            });
            updateStats(newStats);
        }

        // Mark room as completed
        completeRoom(room.id);
        
        // Show completion message based on room type
        const isBossRoom = room.type === 'boss';
        const isTreasureRoom = room.type === 'treasure';
        const isSecretRoom = room.type === 'secret';
        const isChallengeRoom = room.type === 'challenge';
        const isLibraryRoom = room.type === 'library';
        const isDevilRoom = room.type === 'devil-room';
        const isAngelRoom = room.type === 'angel-room';
        
        let title = 'Room Complete!';
        let message = `You completed the ${room.type.replace('-', ' ')} room!`;
        
        // Add reward information to message
        if (rewards.length > 0) {
            const rewardNames = rewards
                .filter(reward => reward.type === 'collectible' && reward.collectible)
                .map(reward => reward.collectible.name);
            
            if (rewardNames.length > 0) {
                message += `\n\nRewards: ${rewardNames.join(', ')}`;
            }
        }
        
        if (isBossRoom) {
            title = 'Boss Defeated!';
            message = 'Congratulations! You defeated the boss and unlocked the next floor!' + (rewards.length > 0 ? `\n\nRewards: ${rewards.filter(r => r.type === 'collectible').map(r => r.collectible.name).join(', ')}` : '');
        } else if (isTreasureRoom) {
            title = 'Treasure Found!';
            message = 'You discovered valuable treasure!' + (rewards.length > 0 ? `\n\nRewards: ${rewards.filter(r => r.type === 'collectible').map(r => r.collectible.name).join(', ')}` : '');
        } else if (isSecretRoom) {
            title = 'Secret Discovered!';
            message = 'You found a hidden secret!' + (rewards.length > 0 ? `\n\nRewards: ${rewards.filter(r => r.type === 'collectible').map(r => r.collectible.name).join(', ')}` : '');
        } else if (isChallengeRoom) {
            title = 'Challenge Mastered!';
            message = 'You conquered the challenge room!' + (rewards.length > 0 ? `\n\nRewards: ${rewards.filter(r => r.type === 'collectible').map(r => r.collectible.name).join(', ')}` : '');
        } else if (isLibraryRoom) {
            title = 'Knowledge Gained!';
            message = 'You learned something new in the library!' + (rewards.length > 0 ? `\n\nRewards: ${rewards.filter(r => r.type === 'collectible').map(r => r.collectible.name).join(', ')}` : '');
        } else if (isDevilRoom) {
            title = 'Devil Deal Made!';
            message = 'You made a deal with the devil...' + (rewards.length > 0 ? `\n\nRewards: ${rewards.filter(r => r.type === 'collectible').map(r => r.collectible.name).join(', ')}` : '');
        } else if (isAngelRoom) {
            title = 'Angel Blessing!';
            message = 'You received a blessing from the angels!' + (rewards.length > 0 ? `\n\nRewards: ${rewards.filter(r => r.type === 'collectible').map(r => r.collectible.name).join(', ')}` : '');
        }
        
        Alert.alert(title, message, [
            { 
                text: 'Continue', 
                onPress: () => {
                    // Check if floor is completed after any room completion
                    const floor = getCurrentFloor();
                    if (floor && floor.rooms.every((r) => r.completed)) {
                        Alert.alert('Floor Complete!', 'All rooms cleared! Advance to next floor?', [
                            { text: 'Continue', onPress: advanceFloor }
                        ]);
                    }
                }
            }
        ]);
    }, [room, completeRoom, getCurrentFloor, advanceFloor]);

    // Check for room completion
    useEffect(() => {
        if (room && room.tiles && room.tiles.length > 0 && isRoomCompleted() && !room.completed) {
            handleRoomCompletion();
        }
    }, [room, isRoomCompleted, handleRoomCompletion]);

    return {
        handleRoomCompletion
    };
};
