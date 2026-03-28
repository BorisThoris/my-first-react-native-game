import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import useGameStore from '../../stores/gameStore';
import { getAvailableMilestones, completeMilestone, getProgressionStats } from '../../data/progressionSystem';
import { getRarityColor, getRarityIcon } from '../../types/collectibleTypes';

interface ProgressionScreenProps {
    isVisible: boolean;
    onClose: () => void;
}

const ProgressionScreen: React.FC<ProgressionScreenProps> = ({ isVisible, onClose }) => {
    const { playerStats, updateStats } = useGameStore();
    const [selectedType, setSelectedType] = useState<string>('all');

    // Safety check for playerStats
    if (!playerStats) {
        return null;
    }

    const milestones = getAvailableMilestones(playerStats);
    const stats = getProgressionStats(playerStats);

    const types = [
        { id: 'all', name: 'All', icon: '📊' },
        { id: 'level', name: 'Level', icon: '⭐' },
        { id: 'floor', name: 'Floor', icon: '🏰' },
        { id: 'collection', name: 'Collection', icon: '📦' },
        { id: 'mastery', name: 'Mastery', icon: '🎓' },
        { id: 'exploration', name: 'Exploration', icon: '🗺️' },
        { id: 'achievement', name: 'Achievement', icon: '🏆' },
        { id: 'secret', name: 'Secret', icon: '🔍' }
    ];

    const getMilestonesByType = (type: string) => {
        if (type === 'all') {
            return milestones;
        }
        return milestones.filter((milestone) => milestone.type === type);
    };

    const handleCompleteMilestone = (milestone: any) => {
        const result = completeMilestone(milestone, playerStats);
        if (result.success) {
            updateStats(result.newStats);
            // Show success message
            // You could add a success animation here
        }
    };

    const filteredMilestones = getMilestonesByType(selectedType);

    return (
        <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>📊 Progression</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsContainer}>
                    <Text style={styles.statsTitle}>Progress Overview</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.completed}</Text>
                            <Text style={styles.statLabel}>Completed</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.available}</Text>
                            <Text style={styles.statLabel}>Available</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{Math.round(stats.completionRate)}%</Text>
                            <Text style={styles.statLabel}>Complete</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.total}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.categoryContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {types.map((type) => (
                            <TouchableOpacity
                                key={type.id}
                                style={[styles.categoryButton, selectedType === type.id && styles.categoryButtonActive]}
                                onPress={() => setSelectedType(type.id)}
                            >
                                <Text style={styles.categoryIcon}>{type.icon}</Text>
                                <Text
                                    style={[styles.categoryText, selectedType === type.id && styles.categoryTextActive]}
                                >
                                    {type.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <ScrollView style={styles.milestonesContainer} showsVerticalScrollIndicator={false}>
                    {filteredMilestones.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>📭</Text>
                            <Text style={styles.emptyText}>
                                {selectedType === 'all'
                                    ? 'No milestones available!'
                                    : `No ${selectedType} milestones found.`}
                            </Text>
                        </View>
                    ) : (
                        filteredMilestones.map((milestone, index) => (
                            <View key={`${milestone.id}-${index}`} style={styles.milestoneCard}>
                                <View style={styles.milestoneHeader}>
                                    <View style={styles.milestoneInfo}>
                                        <Text style={styles.milestoneIcon}>{milestone.icon}</Text>
                                        <View style={styles.milestoneDetails}>
                                            <Text style={styles.milestoneName}>{milestone.name}</Text>
                                            <Text style={styles.milestoneDescription}>{milestone.description}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.completeButton}
                                        onPress={() => handleCompleteMilestone(milestone)}
                                    >
                                        <Text style={styles.completeButtonText}>Complete</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.rewardsContainer}>
                                    <Text style={styles.rewardsTitle}>Rewards:</Text>
                                    {milestone.rewards.map((reward, rewardIndex) => (
                                        <Text key={rewardIndex} style={styles.rewardText}>
                                            • {reward.description}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        paddingTop: 50
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff'
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center'
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    statsContainer: {
        padding: 20,
        backgroundColor: '#2a2a2a',
        marginHorizontal: 20,
        marginVertical: 10,
        borderRadius: 10
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
        textAlign: 'center'
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around'
    },
    statItem: {
        alignItems: 'center',
        marginVertical: 5,
        minWidth: 80
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700'
    },
    statLabel: {
        fontSize: 12,
        color: '#ccc',
        textAlign: 'center'
    },
    categoryContainer: {
        paddingVertical: 10
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: '#333'
    },
    categoryButtonActive: {
        backgroundColor: '#4CAF50'
    },
    categoryIcon: {
        fontSize: 16,
        marginRight: 5
    },
    categoryText: {
        color: '#ccc',
        fontSize: 14,
        fontWeight: '500'
    },
    categoryTextActive: {
        color: '#fff'
    },
    milestonesContainer: {
        flex: 1,
        paddingHorizontal: 20
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 15
    },
    emptyText: {
        fontSize: 16,
        color: '#ccc',
        textAlign: 'center'
    },
    milestoneCard: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 15,
        marginVertical: 5,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50'
    },
    milestoneHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    milestoneInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    milestoneIcon: {
        fontSize: 20,
        marginRight: 10
    },
    milestoneDetails: {
        flex: 1
    },
    milestoneName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2
    },
    milestoneDescription: {
        fontSize: 14,
        color: '#ccc'
    },
    completeButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 6
    },
    completeButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold'
    },
    rewardsContainer: {
        backgroundColor: '#1a1a1a',
        padding: 10,
        borderRadius: 5
    },
    rewardsTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 5
    },
    rewardText: {
        fontSize: 13,
        color: '#4CAF50',
        marginBottom: 2
    }
});

export default ProgressionScreen;

