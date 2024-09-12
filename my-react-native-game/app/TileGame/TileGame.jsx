import React from "react";
import { View, Text } from "react-native";
import { useGameContext } from "../../contexts/GameContext";
import Lives from "./components/Lives";
import CheatButton from "./components/CheatButton";
import GameModal from "./components/GameModal";
import styles from "./styles";
import ShakeContainer from "./components/ShakeContainer";
import TileGrid from "./components/TileGrid";
import GameTitle from "./components/GameTitle";
import CheaterText from "./components/CheaterText";

export const TileGame = () => {
  const { tiles, flippedTiles, matchedTiles, lives, cheated } =
    useGameContext();

  return (
    <ShakeContainer>
      <Lives lives={lives} />

      <GameTitle />

      <Text style={styles.livesText}>Lives: {lives}</Text>

      <TileGrid
        tiles={tiles}
        flippedTiles={flippedTiles}
        matchedTiles={matchedTiles}
      />

      <CheaterText />

      <View style={styles.buttonContainer}>
        <CheatButton />
      </View>

      <GameModal />

    </ShakeContainer>
  );
};

export default TileGame;
