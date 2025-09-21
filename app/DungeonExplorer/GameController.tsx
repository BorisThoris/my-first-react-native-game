import React, { useEffect } from 'react';
import { View, Alert } from 'react-native';
import useDungeonStore from '../../stores/dungeonStore';
import useGameStore from '../../stores/gameStore';
import DungeonMap from '../../components/dungeon/DungeonMap';
import RoomView from '../../components/dungeon/RoomView';
import PlayerStats from '../../components/ui/PlayerStats';

const GameController: React.FC = () => {
    const {
        currentFloor,
        currentRoom,
        gameState,
        generateNewRun,
        enterRoom,
        completeRoom,
        advanceFloor,
        getCurrentFloor,
        getAvailableRooms,
        saveRoomState
    } = useDungeonStore();

    const { playerStats, isGameOver, isRoomCompleted, resetGame } = useGameStore();

    useEffect(() => {
        generateNewRun();
    }, []);

    useEffect(() => {
        if (currentRoom && isRoomCompleted()) {
            const { flippedTiles, matchedTiles } = useGameStore.getState();
            saveRoomState(currentRoom.id, flippedTiles, matchedTiles);
            completeRoom(currentRoom.id);

            const floor = getCurrentFloor();
            if (floor && floor.rooms.every((room) => room.completed)) {
                Alert.alert('Floor Complete!', 'All rooms cleared! Advance to next floor?', [
                    { text: 'Continue', onPress: advanceFloor }
                ]);
            }
        }
    }, [isRoomCompleted, currentRoom]);

    useEffect(() => {
        if (isGameOver()) {
            Alert.alert('Game Over', 'You have run out of lives!', [
                {
                    text: 'New Run',
                    onPress: () => {
                        resetGame();
                        generateNewRun();
                    }
                }
            ]);
        }
    }, [isGameOver]);

    useEffect(() => {
        if (gameState === 'victory') {
            Alert.alert('Victory!', 'You have conquered the Memory Dungeon!', [
                {
                    text: 'New Run',
                    onPress: () => {
                        resetGame();
                        generateNewRun();
                    }
                }
            ]);
        }
    }, [gameState]);

    const handleRoomSelect = (roomId: string): void => {
        if (playerStats.lives <= 0) return;
        enterRoom(roomId);
    };

    if (gameState === 'in-room' && currentRoom) {
        return (
            <View style={{ flex: 1, backgroundColor: '#1a1a1a', padding: 20 }}>
                <PlayerStats />
                <RoomView room={currentRoom} onBack={() => completeRoom(currentRoom.id)} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#1a1a1a', padding: 20 }}>
            <PlayerStats />
            <DungeonMap
                floor={getCurrentFloor()}
                availableRooms={getAvailableRooms()}
                onRoomSelect={handleRoomSelect}
            />
        </View>
    );
};

export default GameController;

