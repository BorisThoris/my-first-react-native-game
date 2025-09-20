// Tile.js
import React, { useMemo } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useGameContext } from '../../../../contexts/GameContext';
import tileStyles from './styles';

const Tile = ({ index, tile }) => {
  const { cheated, flippedTiles, handleFlip, matchedTiles, TILE_SIZE } = useGameContext();

  const isFlipped = flippedTiles.includes(index) || matchedTiles.includes(index);

  const tileStyle = useMemo(
    () => [
      tileStyles.tile,
      isFlipped ? tileStyles.flippedTile : tileStyles.hiddenTile,
      {
        alignItems: 'center',
        height: TILE_SIZE || 50,
        justifyContent: 'center',
        width: TILE_SIZE || 50,
      },
    ],
    [isFlipped, TILE_SIZE]
  );

  const handlePress = useMemo(() => () => handleFlip(index), [handleFlip, index]);

  return (
    <TouchableOpacity style={tileStyle} onPress={handlePress} disabled={isFlipped || cheated}>
      {isFlipped && <Text style={tileStyles.tileText}>{tile.shape}</Text>}
    </TouchableOpacity>
  );
};

export default Tile;
