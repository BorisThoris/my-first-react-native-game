import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const MainMenu = () => {
  const router = useRouter();

  const handleStartGame = () => {
    router.push('/DungeonExplorer');
  };

  const handleLegacyGame = () => {
    router.push('/legacy/MemoryGame');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Memory Dungeon</Text>
      <Text style={styles.subtitle}>A Roguelike Memory Game</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleStartGame}>
          <Text style={styles.buttonText}>Start New Run</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleLegacyGame}>
          <Text style={styles.secondaryButtonText}>Legacy Memory Game</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Navigate through procedurally generated dungeon floors</Text>
        <Text style={styles.infoText}>Solve memory puzzles to advance and collect rewards</Text>
        <Text style={styles.infoText}>Build your memory skills and conquer the dungeon!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 50,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 50,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#ccc',
    fontSize: 16,
  },
  infoContainer: {
    width: '100%',
    maxWidth: 300,
  },
  infoText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 20,
  },
});

export default MainMenu;
