import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Tile from '../Tile';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TileGrid = ({ room }) => {
  if (!room || !room.tiles) {
    return null;
  }

  const gridSize = room.gridSize;
  const tileSize = Math.min(
    (SCREEN_WIDTH - 60) / gridSize, // Account for padding
    80 // Max tile size
  );

  const renderTiles = () => {
    const tiles = [];

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const tileIndex = y * gridSize + x;
        const tile = room.tiles[tileIndex];

        if (tile) {
          tiles.push(<Tile key={tile.id} tile={tile} size={tileSize} x={x} y={y} />);
        }
      }
    }

    return tiles;
  };

  return <View style={[styles.grid, { width: tileSize * gridSize }]}>{renderTiles()}</View>;
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TileGrid;
