// CheatButton.js
import React from "react";
import { TouchableOpacity, Animated } from "react-native";
import styles from "../styles";
import { useGameContext } from "../../../contexts/GameContext";

const CheatButton = () => {
  const {
    cheated,
    cheatButtonScale,
    handleCheat,
  } = useGameContext();

  return (
    <TouchableOpacity onPress={handleCheat} style={styles.cheatButton}>
      <Animated.Text
        style={[
          styles.buttonText,
          { transform: [{ scale: cheatButtonScale }] },
        ]}
      >
        {cheated ? "Turn off Cheat" : "Cheat?"}
      </Animated.Text>
    </TouchableOpacity>
  );
};

export default CheatButton;
