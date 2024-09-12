import React from "react";
import { Animated } from "react-native";
import styles from "../styles";
import { useGameContext } from "../../../contexts/GameContext";

const ShakeContainer = ({ children }) => {
  const { shakeAnim } = useGameContext();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              translateX: shakeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 10], 
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default ShakeContainer;
