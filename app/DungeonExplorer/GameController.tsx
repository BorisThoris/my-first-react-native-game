import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import useDungeonStore from '../../stores/dungeonStore';
import useGameStore from '../../stores/gameStore';
import DungeonMap from '../../components/dungeon/DungeonMap';
import RoomView from '../../components/dungeon/RoomView';
import SpecialRoomRouter from '../../components/dungeon/special/SpecialRoomRouter';
import PlayerStats from '../../components/ui/PlayerStats';
import Shop from '../../components/shop/Shop';
import DebugPanel from '../../components/debug/DebugPanel';
import StreakCelebration from '../../components/ui/StreakCelebration';
import InventoryScreen from '../../components/inventory/InventoryScreen';
import { initializeShopItems } from '../../data/shopItems';

const GameController: React.FC = () => {
    const [showShop, setShowShop] = useState(false);
    const [showInventory, setShowInventory] = useState(false);

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

    const handleShopOpen = (): void => {
        setShowShop(true);
    };

    const handleShopClose = (): void => {
        setShowShop(false);
    };

    const handleInventoryOpen = (): void => {
        setShowInventory(true);
    };

    const handleInventoryClose = (): void => {
        setShowInventory(false);
    };

    if (showShop) {
        return (
            <View style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
                <View style={{ flex: 1 }}>
                    <Shop onClose={handleShopClose} />
                </View>
                <DebugPanel />
                <StreakCelebration />
                <InventoryScreen isVisible={showInventory} onClose={handleInventoryClose} />
            </View>
        );
    }

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
                    <PlayerStats onInventoryPress={handleInventoryOpen} />
                    {isSpecialRoom ? (
                        <SpecialRoomRouter room={currentRoom} onComplete={() => completeRoom(currentRoom.id)} />
                    ) : (
                        <RoomView room={currentRoom} onBack={() => completeRoom(currentRoom.id)} />
                    )}
                </View>
                <DebugPanel />
                <StreakCelebration />
                <InventoryScreen isVisible={showInventory} onClose={handleInventoryClose} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
            <View style={{ flex: 1, padding: 20 }}>
                <PlayerStats onInventoryPress={handleInventoryOpen} />
                <DungeonMap
                    floor={getCurrentFloor()}
                    availableRooms={getAvailableRooms()}
                    onRoomSelect={handleRoomSelect}
                    onShopOpen={handleShopOpen}
                />
            </View>
            <DebugPanel />
            <StreakCelebration />
            <InventoryScreen isVisible={showInventory} onClose={handleInventoryClose} />
        </View>
    );
};

export default GameController;
