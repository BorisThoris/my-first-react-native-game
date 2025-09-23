import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import StatDisplay from './StatDisplay';
import useGameStore from '../../stores/gameStore';

interface PlayerStatsProps {
    onInventoryPress?: () => void;
    onProgressionPress?: () => void;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ onInventoryPress, onProgressionPress }) => {
    const { playerStats, getHelperUses } = useGameStore();
    const helperUses = getHelperUses();
    const totalHelpers = Object.values(helperUses).reduce((sum, uses) => sum + uses, 0);

    return (
        <View style={styles.container}>
            <View style={styles.statsRow}>
                <StatDisplay label="Lives" value={playerStats.lives} />
                <StatDisplay label="Floor" value={playerStats.currentFloor} />
                <StatDisplay label="Score" value={playerStats.totalScore} />
                <StatDisplay label="Streak" value={playerStats.streak} />
                <StatDisplay label="Helpers" value={totalHelpers} />
            </View>
            <View style={styles.buttonRow}>
                {onInventoryPress && (
                    <TouchableOpacity style={styles.inventoryButton} onPress={onInventoryPress}>
                        <Text style={styles.inventoryIcon}>📦</Text>
                        <Text style={styles.inventoryText}>
                            Inventory (
                            {playerStats.items.length +
                                playerStats.abilities.length +
                                playerStats.skills.length +
                                playerStats.tomes.length +
                                playerStats.relics.length}
                            )
                        </Text>
                    </TouchableOpacity>
                )}
                {onProgressionPress && (
                    <TouchableOpacity style={styles.progressionButton} onPress={onProgressionPress}>
                        <Text style={styles.progressionIcon}>📊</Text>
                        <Text style={styles.progressionText}>Progress</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#2a2a2a',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10
    },
    inventoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#45a049'
    },
    inventoryIcon: {
        fontSize: 16,
        marginRight: 8
    },
    inventoryText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold'
    },
    progressionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2196F3',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#1976D2'
    },
    progressionIcon: {
        fontSize: 16,
        marginRight: 8
    },
    progressionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold'
    }
});

export default PlayerStats;
