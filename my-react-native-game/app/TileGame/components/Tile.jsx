// Tile.js
import React from "react";
import { TouchableOpacity, Text, Animated } from "react-native";
import styles from "../styles";
import { useGameContext } from "../../../contexts/GameContext";

const Tile = ({ index, tile }) => {
  const { cheated, TILE_SIZE, tileScale, handleFlip, matchedTiles } =
    useGameContext();

  const isFlipped =
    flippedTiles.includes(index) || matchedTiles.includes(index);

  return (
    <Animated.View style={{ transform: [{ scale: tileScale[index] || 1 }] }}>
      <TouchableOpacity
        style={[
          styles.tile,
          isFlipped ? styles.flippedTile : styles.hiddenTile,
          { width: TILE_SIZE, height: TILE_SIZE },
        ]}
        onPress={() => handleFlip(index)}
        disabled={isFlipped || cheated}
      >
        {isFlipped && <Text style={styles.tileText}>{tile.shape}</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Tile;
