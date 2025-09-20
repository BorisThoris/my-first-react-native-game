import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import useDungeonStore from '../../stores/dungeonStore';
import useGameStore from '../../stores/gameStore';
import DungeonMap from '../../components/DungeonMap';
import RoomView from '../../components/RoomView';
import PlayerStats from '../../components/PlayerStats';

const DungeonExplorer = () => {
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
    saveRoomState,
  } = useDungeonStore();

  const { playerStats, isGameOver, isRoomCompleted, resetGame } = useGameStore();

  // Initialize game on mount
  useEffect(() => {
    generateNewRun();
  }, []);

  // Handle room completion
  useEffect(() => {
    if (currentRoom && isRoomCompleted()) {
      // Save final room state before completing
      const { flippedTiles, matchedTiles } = useGameStore.getState();
      saveRoomState(currentRoom.id, flippedTiles, matchedTiles);

      completeRoom(currentRoom.id);

      // Check if floor is completed
      const floor = getCurrentFloor();
      if (floor && floor.rooms.every((room) => room.completed)) {
        Alert.alert('Floor Complete!', 'All rooms cleared! Advance to next floor?', [
          { text: 'Continue', onPress: advanceFloor },
        ]);
      }
    }
  }, [isRoomCompleted, currentRoom]);

  // Handle game over
  useEffect(() => {
    if (isGameOver()) {
      Alert.alert('Game Over', 'You have run out of lives!', [
        {
          text: 'New Run',
          onPress: () => {
            resetGame();
            generateNewRun();
          },
        },
      ]);
    }
  }, [isGameOver]);

  // Handle victory
  useEffect(() => {
    if (gameState === 'victory') {
      Alert.alert('Victory!', 'You have conquered the Memory Dungeon!', [
        {
          text: 'New Run',
          onPress: () => {
            resetGame();
            generateNewRun();
          },
        },
      ]);
    }
  }, [gameState]);

  const handleRoomSelect = (roomId) => {
    if (playerStats.lives <= 0) return;
    enterRoom(roomId);
  };

  const handleBackToMap = () => {
    // Save current room state before leaving
    if (currentRoom) {
      const { flippedTiles, matchedTiles } = useGameStore.getState();
      saveRoomState(currentRoom.id, flippedTiles, matchedTiles);
    }

    // Return to dungeon map
    useDungeonStore.getState().completeRoom(currentRoom?.id);
  };

  if (gameState === 'in-room' && currentRoom) {
    return (
      <View style={styles.container}>
        <PlayerStats />
        <RoomView room={currentRoom} onBack={handleBackToMap} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PlayerStats />
      <DungeonMap floor={getCurrentFloor()} availableRooms={getAvailableRooms()} onRoomSelect={handleRoomSelect} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
});

export default DungeonExplorer;
