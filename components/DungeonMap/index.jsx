import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { RoomTypes } from '../../types/gameTypes';

const DungeonMap = ({ floor, availableRooms, onRoomSelect }) => {
  if (!floor) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading dungeon...</Text>
      </View>
    );
  }

  const getRoomIcon = (room) => {
    switch (room.type) {
      case RoomTypes.MEMORY_CHAMBER:
        return '🧠';
      case RoomTypes.BOSS:
        return '👹';
      case RoomTypes.TREASURE:
        return '💰';
      case RoomTypes.TRAP:
        return '⚠️';
      default:
        return '❓';
    }
  };

  const getRoomStatus = (room) => {
    if (room.completed && !room.returnable) return 'completed-locked'; // Boss rooms become locked after completion
    if (room.completed && room.returnable) return 'completed-returnable'; // Returnable rooms can be re-entered
    if (availableRooms.some((r) => r.id === room.id)) return 'available';
    return 'locked';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Floor {floor.floorNumber}</Text>

      <View style={styles.roomsGrid}>
        {floor.rooms.map((room, index) => {
          const status = getRoomStatus(room);
          const isAvailable = status === 'available' || status === 'completed-returnable';

          return (
            <TouchableOpacity
              key={room.id}
              style={[
                styles.roomButton,
                status === 'completed-locked' && styles.completedLockedRoom,
                status === 'completed-returnable' && styles.completedReturnableRoom,
                status === 'available' && styles.availableRoom,
                status === 'locked' && styles.lockedRoom,
              ]}
              onPress={() => isAvailable && onRoomSelect(room.id)}
              disabled={!isAvailable}
            >
              <Text style={styles.roomIcon}>{getRoomIcon(room)}</Text>
              <Text style={styles.roomType}>{room.type.replace('-', ' ').toUpperCase()}</Text>
              <Text style={styles.roomDifficulty}>Difficulty: {room.difficulty}</Text>
              {status === 'completed-locked' && <Text style={styles.completedText}>✓</Text>}
              {status === 'completed-returnable' && <Text style={styles.returnableText}>↻</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend:</Text>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>🧠</Text>
          <Text style={styles.legendText}>Memory Chamber (Returnable)</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>👹</Text>
          <Text style={styles.legendText}>Boss Room (One-time)</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>💰</Text>
          <Text style={styles.legendText}>Treasure Room (Returnable)</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>✓</Text>
          <Text style={styles.legendText}>Completed (Locked)</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>↻</Text>
          <Text style={styles.legendText}>Completed (Returnable)</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  roomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  roomButton: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#555',
  },
  completedLockedRoom: {
    backgroundColor: '#2a5a2a',
    borderColor: '#4CAF50',
    opacity: 0.7,
  },
  completedReturnableRoom: {
    backgroundColor: '#2a4a5a',
    borderColor: '#2196F3',
  },
  availableRoom: {
    backgroundColor: '#2a2a5a',
    borderColor: '#2196F3',
  },
  lockedRoom: {
    backgroundColor: '#5a2a2a',
    borderColor: '#f44336',
    opacity: 0.5,
  },
  roomIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  roomType: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 2,
  },
  roomDifficulty: {
    color: '#ccc',
    fontSize: 8,
    textAlign: 'center',
  },
  completedText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    position: 'absolute',
    top: 5,
    right: 5,
  },
  returnableText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
    position: 'absolute',
    top: 5,
    right: 5,
  },
  legend: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 8,
  },
  legendTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  legendText: {
    color: '#ccc',
    fontSize: 14,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default DungeonMap;
