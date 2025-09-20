import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useGameStore from '../../stores/gameStore';

const PlayerStats = () => {
  const { playerStats } = useGameStore();

  return (
    <View style={styles.container}>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Lives:</Text>
        <Text style={styles.statValue}>{playerStats.lives}</Text>
      </View>

      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Floor:</Text>
        <Text style={styles.statValue}>{playerStats.currentFloor}</Text>
      </View>

      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Score:</Text>
        <Text style={styles.statValue}>{playerStats.totalScore}</Text>
      </View>

      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Rooms:</Text>
        <Text style={styles.statValue}>{playerStats.roomsCompleted}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    color: '#fff',
    fontSize: 14,
    marginRight: 5,
  },
  statValue: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PlayerStats;
