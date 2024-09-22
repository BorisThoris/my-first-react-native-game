import React from 'react';
import { Text, View } from 'react-native';
import { useGameContext } from '../../../../contexts/GameContext';
import styles from './styles';

const Player = () => {
    const { userName } = useGameContext();

    return (
        <View style={styles.userContainer}>
            <Text style={styles.userNameText}>Player: {userName}</Text>
        </View>
    );
};

export default Player;
