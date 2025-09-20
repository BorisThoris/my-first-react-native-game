import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import useGameStore from '../../stores/gameStore';
import TileGrid from '../TileGrid';

const RoomView = ({ room, onBack }) => {
  const { setCurrentRoomTiles, checkMatch, resetFlippedTiles, isRoomCompleted, playerStats, flippedTiles } =
    useGameStore();

  // Initialize room tiles when component mounts
  useEffect(() => {
    if (room && room.tiles) {
      // Load room state if it exists
      const roomState = {
        flippedTiles: room.flippedTiles || [],
        matchedTiles: room.matchedTiles || [],
      };
      setCurrentRoomTiles(room.tiles, roomState);
    }
  }, [room]);

  // Check for matches when tiles are flipped
  useEffect(() => {
    if (flippedTiles.length === 2) {
      const timer = setTimeout(() => {
        checkMatch();
      }, 1000); // Wait 1 second before checking match
      return () => clearTimeout(timer);
    }
  }, [flippedTiles, checkMatch]);

  const handleBackPress = () => {
    if (isRoomCompleted()) {
      onBack();
    } else if (room.returnable) {
      // Returnable rooms can be left without penalty
      onBack();
    } else {
      // Non-returnable rooms (boss) - warn about progress loss
      Alert.alert('Leave Room', 'Are you sure you want to leave? Progress will be lost.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', onPress: onBack },
      ]);
    }
  };

  if (!room) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Room not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.roomInfo}>
          <Text style={styles.roomTitle}>
            {room.type.replace('-', ' ').toUpperCase()}
            {room.returnable && <Text style={styles.returnableIndicator}> ↻</Text>}
          </Text>
          <Text style={styles.roomDifficulty}>Difficulty: {room.difficulty}</Text>
          {room.returnable && <Text style={styles.returnableHint}>This room can be revisited</Text>}
        </View>
      </View>

      <View style={styles.gameArea}>
        <TileGrid room={room} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.instructionText}>Find matching pairs to clear the room!</Text>
        {playerStats.lives <= 0 && <Text style={styles.gameOverText}>Game Over - No lives remaining!</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  backButton: {
    backgroundColor: '#444',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginRight: 15,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  roomInfo: {
    flex: 1,
  },
  roomTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  roomDifficulty: {
    color: '#ccc',
    fontSize: 14,
  },
  returnableIndicator: {
    color: '#2196F3',
    fontSize: 16,
  },
  returnableHint: {
    color: '#2196F3',
    fontSize: 12,
    fontStyle: 'italic',
  },
  gameArea: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 15,
    backgroundColor: '#2a2a2a',
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  instructionText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
  gameOverText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  errorText: {
    color: '#f44336',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default RoomView;
