import React from 'react';
import { View, StyleSheet } from 'react-native';
import StatDisplay from './StatDisplay';
import useGameStore from '../../stores/gameStore';

const PlayerStats: React.FC = () => {
    const { playerStats } = useGameStore();

    return (
        <View style={styles.container}>
            <StatDisplay label="Lives" value={playerStats.lives} />
            <StatDisplay label="Floor" value={playerStats.currentFloor} />
            <StatDisplay label="Score" value={playerStats.totalScore} />
            <StatDisplay label="Rooms" value={playerStats.roomsCompleted} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#2a2a2a',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20
    }
});

export default PlayerStats;

