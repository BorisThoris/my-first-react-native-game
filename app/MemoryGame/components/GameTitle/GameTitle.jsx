import React, { useCallback, useMemo, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import styles from './styles';

const ANIMATION_DURATION = 1000;

const GameTitle = () => {
  const titleScale = useRef(new Animated.Value(1)).current;

  const transformStyle = useMemo(() => ({ transform: [{ scale: titleScale }] }), [titleScale]);
  const titleStyle = useMemo(() => [styles.title, transformStyle], [transformStyle]);

  return <Animated.Text style={titleStyle}>Memory Game</Animated.Text>;
};

export default GameTitle;
