import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import useDungeonStore from '../../stores/dungeonStore';
import useGameStore from '../../stores/gameStore';
import DungeonMap from '../../components/dungeon/DungeonMap';
import RoomView from '../../components/dungeon/RoomView';
import SpecialRoomRouter from '../../components/dungeon/special/SpecialRoomRouter';
import PlayerStats from '../../components/ui/PlayerStats';
import DebugPanel from '../../components/debug/DebugPanel';
import StreakCelebration from '../../components/ui/StreakCelebration';
import InventoryScreen from '../../components/inventory/InventoryScreen';
import ProgressionScreen from '../../components/progression/ProgressionScreen';
import { initializeShopItems } from '../../data/shopItems';
import { useItemEffects } from '../../hooks/useItemEffects';

const GameController: React.FC = () => {
    const [showInventory, setShowInventory] = useState(false);
    const [showProgression, setShowProgression] = useState(false);

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

    const { playerStats, isGameOver, isRoomCompleted, resetGame, updateStats } = useGameStore();

    // Apply item effects to gameplay
    useItemEffects();

    useEffect(() => {
        generateNewRun();
        // Initialize shop items based on current floor
        const shopItems = initializeShopItems(currentFloor);
        updateStats({ shopItems });
    }, []);

    // Remove the global room completion logic - let each room handle its own completion

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

    const handleInventoryOpen = (): void => {
        setShowInventory(true);
    };

    const handleInventoryClose = (): void => {
        setShowInventory(false);
    };

    const handleProgressionOpen = (): void => {
        setShowProgression(true);
    };

    const handleProgressionClose = (): void => {
        setShowProgression(false);
    };

    if (gameState === 'in-room' && currentRoom) {
        // Check if it's a special room that needs special handling
        const isSpecialRoom = [
            'treasure',
            'shop',
            'secret',
            'library',
            'challenge',
            'devil-room',
            'angel-room'
        ].includes(currentRoom.type);

        return (
            <View style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
                <View style={{ flex: 1, padding: 20 }}>
                    <PlayerStats onInventoryPress={handleInventoryOpen} onProgressionPress={handleProgressionOpen} />
                    {isSpecialRoom ? (
                        <SpecialRoomRouter room={currentRoom} onComplete={() => completeRoom(currentRoom.id)} />
                    ) : (
                        <RoomView room={currentRoom} onBack={() => completeRoom(currentRoom.id)} />
                    )}
                </View>
                <DebugPanel />
                <StreakCelebration />
                <InventoryScreen isVisible={showInventory} onClose={handleInventoryClose} />
                <ProgressionScreen isVisible={showProgression} onClose={handleProgressionClose} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
            <View style={{ flex: 1, padding: 20 }}>
                <PlayerStats onInventoryPress={handleInventoryOpen} onProgressionPress={handleProgressionOpen} />
                <DungeonMap
                    floor={getCurrentFloor()}
                    availableRooms={getAvailableRooms()}
                    onRoomSelect={handleRoomSelect}
                />
            </View>
            <DebugPanel />
            <StreakCelebration />
            <InventoryScreen isVisible={showInventory} onClose={handleInventoryClose} />
            <ProgressionScreen isVisible={showProgression} onClose={handleProgressionClose} />
        </View>
    );
};

export default GameController;
