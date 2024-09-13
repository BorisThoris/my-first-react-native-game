import React, { useMemo } from 'react';
import { Animated } from 'react-native';
import { useGameContext } from '../../../contexts/GameContext';
import styles from '../styles';

const GameTitle = () => {
    const { titleScale } = useGameContext();

    const transformStyle = useMemo(() => ({ transform: [{ scale: titleScale }] }), [titleScale]);
    const titleStyle = useMemo(() => [styles.title, transformStyle], [transformStyle]);

    return <Animated.Text style={titleStyle}>Memory Game</Animated.Text>;
};

export default GameTitle;
