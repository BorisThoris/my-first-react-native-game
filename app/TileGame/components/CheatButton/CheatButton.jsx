// CheatButton.js
import React, { useMemo } from 'react';
import { Animated, TouchableOpacity } from 'react-native';
import { useGameContext } from '../../../../contexts/GameContext';
import styles from './styles';

const CheatButton = () => {
    const { cheated, handleCheat } = useGameContext();

    const buttonText = useMemo(() => (cheated ? 'Turn off Cheat' : 'Cheat?'), [cheated]);

    const handlePress = useMemo(() => handleCheat, [handleCheat]);

    return (
        <TouchableOpacity onPress={handlePress} style={styles.cheatButton}>
            <Animated.Text style={styles.buttonText}>{buttonText}</Animated.Text>
        </TouchableOpacity>
    );
};

export default CheatButton;
