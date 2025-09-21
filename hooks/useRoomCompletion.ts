import { useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import useGameStore from '../stores/gameStore';
import useDungeonStore from '../stores/dungeonStore';
import { Room } from '../types/gameTypes';

export const useRoomCompletion = (room: Room) => {
    const { isRoomCompleted } = useGameStore();
    const { completeRoom, getCurrentFloor, advanceFloor } = useDungeonStore();

    const handleRoomCompletion = useCallback(() => {
        if (!room || room.completed) return;

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
        
        if (isBossRoom) {
            title = 'Boss Defeated!';
            message = 'Congratulations! You defeated the boss and unlocked the next floor!';
        } else if (isTreasureRoom) {
            title = 'Treasure Found!';
            message = 'You discovered valuable treasure!';
        } else if (isSecretRoom) {
            title = 'Secret Discovered!';
            message = 'You found a hidden secret!';
        } else if (isChallengeRoom) {
            title = 'Challenge Mastered!';
            message = 'You conquered the challenge room!';
        } else if (isLibraryRoom) {
            title = 'Knowledge Gained!';
            message = 'You learned something new in the library!';
        } else if (isDevilRoom) {
            title = 'Devil Deal Made!';
            message = 'You made a deal with the devil...';
        } else if (isAngelRoom) {
            title = 'Angel Blessing!';
            message = 'You received a blessing from the angels!';
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
