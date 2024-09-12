import { Animated } from "react-native";
import styles from "../styles";
import { useGameContext } from "../../../contexts/GameContext";

const GameTitle = () => {
  const { titleScale } = useGameContext();

  return (
    <Animated.Text
      style={[styles.title, { transform: [{ scale: titleScale }] }]}
    >
      Memory Game
    </Animated.Text>
  );
};

export default GameTitle;
