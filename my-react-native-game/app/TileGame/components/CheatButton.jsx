// CheatButton.js
import React, { useMemo } from 'react';
import { Animated, TouchableOpacity } from 'react-native';
import { useGameContext } from '../../../contexts/GameContext';
import styles from '../styles';

const CheatButton = () => {
    const { cheatButtonScale, cheated, handleCheat } = useGameContext();

    const animatedStyle = useMemo(() => ({ transform: [{ scale: cheatButtonScale }] }), [cheatButtonScale]);
    const buttonText = useMemo(() => (cheated ? 'Turn off Cheat' : 'Cheat?'), [cheated]);
    const combinedStyle = useMemo(() => [styles.buttonText, animatedStyle], [animatedStyle]);
    const handlePress = useMemo(() => handleCheat, [handleCheat]);

    return (
        <TouchableOpacity onPress={handlePress} style={styles.cheatButton}>
            <Animated.Text style={combinedStyle}>{buttonText}</Animated.Text>
        </TouchableOpacity>
    );
};

export default CheatButton;
