import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import StatDisplay from './StatDisplay';
import useGameStore from '../../stores/gameStore';

const PlayerStats: React.FC = () => {
    const { playerStats, getHelperUses } = useGameStore();
    const helperUses = getHelperUses();
    const totalHelpers = Object.values(helperUses).reduce((sum, uses) => sum + uses, 0);

    return (
        <View style={styles.container}>
            <StatDisplay label="Lives" value={playerStats.lives} />
            <StatDisplay label="Floor" value={playerStats.currentFloor} />
            <StatDisplay label="Score" value={playerStats.totalScore} />
            <StatDisplay label="Streak" value={playerStats.streak} />
            <StatDisplay label="Helpers" value={totalHelpers} />
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
