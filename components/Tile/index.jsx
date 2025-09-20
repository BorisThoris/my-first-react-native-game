import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import useGameStore from '../../stores/gameStore';
import { TileStates } from '../../types/gameTypes';

const Tile = ({ tile, size, x, y }) => {
  const { flipTile, flippedTiles, matchedTiles, playerStats } = useGameStore();

  const isFlipped = flippedTiles.includes(tile.id);
  const isMatched = matchedTiles.includes(tile.id);
  const isDisabled = playerStats.lives <= 0;

  const getTileState = () => {
    if (isMatched) return TileStates.MATCHED;
    if (isFlipped) return TileStates.FLIPPED;
    return TileStates.HIDDEN;
  };

  const handlePress = () => {
    if (isDisabled || isMatched || isFlipped) return;
    flipTile(tile.id);
  };

  const tileState = getTileState();

  return (
    <TouchableOpacity
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          margin: 2,
        },
        tileState === TileStates.HIDDEN && styles.hiddenTile,
        tileState === TileStates.FLIPPED && styles.flippedTile,
        tileState === TileStates.MATCHED && styles.matchedTile,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
    >
      {(tileState === TileStates.FLIPPED || tileState === TileStates.MATCHED) && (
        <Text style={styles.tileText}>{tile.shape}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    backgroundColor: '#444',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#666',
  },
  hiddenTile: {
    backgroundColor: '#333',
    borderColor: '#555',
  },
  flippedTile: {
    backgroundColor: '#2a5a2a',
    borderColor: '#4CAF50',
  },
  matchedTile: {
    backgroundColor: '#1a5a1a',
    borderColor: '#2E7D32',
    opacity: 0.7,
  },
  tileText: {
    fontSize: 24,
    color: '#fff',
  },
});

export default Tile;
