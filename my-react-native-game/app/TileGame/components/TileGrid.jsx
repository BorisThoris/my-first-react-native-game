import React from "react";
import { View } from "react-native";
import Tile from "./Tile"; // Assuming you have a Tile component already

import { useGameContext } from "../../../contexts/GameContext";
import styles from "../styles";

const TileGrid = () => {
  const { tiles } = useGameContext();

  return (
    <View style={styles.gridContainer}>
      <View style={styles.grid}>
        {tiles.map((tile, index) => (
          <Tile key={index} index={index} tile={tile} isFlipped={isFlipped} />
        ))}
      </View>
    </View>
  );
};

export default TileGrid;
