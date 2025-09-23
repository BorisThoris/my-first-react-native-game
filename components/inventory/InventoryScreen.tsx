import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import useGameStore from '../../stores/gameStore';
import { Item } from '../../types/itemTypes';
import { CollectibleType, Rarity, getRarityColor, getRarityIcon } from '../../types/collectibleTypes';

interface InventoryScreenProps {
    isVisible: boolean;
    onClose: () => void;
}

const InventoryScreen: React.FC<InventoryScreenProps> = ({ isVisible, onClose }) => {
    const { playerStats } = useGameStore();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Safety check for playerStats
    if (!playerStats) {
        return null;
    }

    const categories = [
        { id: 'all', name: 'All Items', icon: '📦' },
        { id: 'items', name: 'Items', icon: '📦' },
        { id: 'abilities', name: 'Abilities', icon: '✨' },
        { id: 'skills', name: 'Skills', icon: '📚' },
        { id: 'tomes', name: 'Tomes', icon: '📖' },
        { id: 'relics', name: 'Relics', icon: '🏺' }
    ];

    const getItemsByCategory = (category: string): any[] => {
        if (category === 'all') {
            return [
                ...playerStats.items,
                ...playerStats.abilities,
                ...playerStats.skills,
                ...playerStats.tomes,
                ...playerStats.relics
            ];
        }

        switch (category) {
            case 'items':
                return playerStats.items;
            case 'abilities':
                return playerStats.abilities;
            case 'skills':
                return playerStats.skills;
            case 'tomes':
                return playerStats.tomes;
            case 'relics':
                return playerStats.relics;
            default:
                return playerStats.items.filter((item) => item.type === category);
        }
    };

    const getRarityColor = (rarity: string): string => {
        switch (rarity) {
            case 'common':
                return '#9CA3AF';
            case 'uncommon':
                return '#10B981';
            case 'rare':
                return '#3B82F6';
            case 'epic':
                return '#8B5CF6';
            case 'legendary':
                return '#F59E0B';
            default:
                return '#9CA3AF';
        }
    };

    const getRarityIcon = (rarity: string): string => {
        switch (rarity) {
            case 'common':
                return '⚪';
            case 'uncommon':
                return '🟢';
            case 'rare':
                return '🔵';
            case 'epic':
                return '🟣';
            case 'legendary':
                return '🟡';
            default:
                return '⚪';
        }
    };

    const formatEffect = (effect: Partial<any>): string => {
        const effects: string[] = [];

        if (effect.lives) effects.push(`+${effect.lives} Lives`);
        if (effect.maxLives) effects.push(`+${effect.maxLives} Max Lives`);
        if (effect.focus) effects.push(`+${effect.focus} Focus`);
        if (effect.recall) effects.push(`+${effect.recall} Recall`);
        if (effect.patternRecognition) effects.push(`+${effect.patternRecognition} Pattern Recognition`);
        if (effect.concentration) effects.push(`+${effect.concentration} Concentration`);
        if (effect.points) effects.push(`+${effect.points} Points`);
        if (effect.streak) effects.push(`+${effect.streak} Streak`);
        if (effect.keys) effects.push(`+${effect.keys} Keys`);
        if (effect.bombs) effects.push(`+${effect.bombs} Bombs`);

        return effects.length > 0 ? effects.join(', ') : 'No effects';
    };

    const filteredItems = getItemsByCategory(selectedCategory);

    return (
        <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>📦 Inventory</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsContainer}>
                    <Text style={styles.statsTitle}>Collection Stats</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {playerStats.items.length +
                                    playerStats.abilities.length +
                                    playerStats.skills.length +
                                    playerStats.tomes.length +
                                    playerStats.relics.length}
                            </Text>
                            <Text style={styles.statLabel}>Total Items</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{playerStats.abilities.length}</Text>
                            <Text style={styles.statLabel}>Abilities</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{playerStats.skills.length}</Text>
                            <Text style={styles.statLabel}>Skills</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{playerStats.tomes.length}</Text>
                            <Text style={styles.statLabel}>Tomes</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{playerStats.relics.length}</Text>
                            <Text style={styles.statLabel}>Relics</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.categoryContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    styles.categoryButton,
                                    selectedCategory === category.id && styles.categoryButtonActive
                                ]}
                                onPress={() => setSelectedCategory(category.id)}
                            >
                                <Text style={styles.categoryIcon}>{category.icon}</Text>
                                <Text
                                    style={[
                                        styles.categoryText,
                                        selectedCategory === category.id && styles.categoryTextActive
                                    ]}
                                >
                                    {category.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <ScrollView style={styles.itemsContainer} showsVerticalScrollIndicator={false}>
                    {filteredItems.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>📭</Text>
                            <Text style={styles.emptyText}>
                                {selectedCategory === 'all'
                                    ? 'No items collected yet!'
                                    : `No ${selectedCategory} items found.`}
                            </Text>
                        </View>
                    ) : (
                        filteredItems.map((item, index) => (
                            <View key={`${item.id}-${index}`} style={styles.itemCard}>
                                <View style={styles.itemHeader}>
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemIcon}>{getRarityIcon(item.rarity)}</Text>
                                        <View style={styles.itemDetails}>
                                            <Text style={[styles.itemName, { color: getRarityColor(item.rarity) }]}>
                                                {item.name}
                                            </Text>
                                            <Text style={styles.itemType}>
                                                {item.type
                                                    ? item.type.charAt(0).toUpperCase() + item.type.slice(1)
                                                    : 'Unknown'}{' '}
                                                • {item.rarity}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <Text style={styles.itemDescription}>{item.description}</Text>

                                <View style={styles.effectsContainer}>
                                    <Text style={styles.effectsTitle}>Effects:</Text>
                                    <Text style={styles.effectsText}>{formatEffect(item.effects || {})}</Text>
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
    itemsContainer: {
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
    itemCard: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 15,
        marginVertical: 5,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50'
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    itemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    itemIcon: {
        fontSize: 20,
        marginRight: 10
    },
    itemDetails: {
        flex: 1
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2
    },
    itemType: {
        fontSize: 12,
        color: '#999',
        textTransform: 'capitalize'
    },
    itemDescription: {
        fontSize: 14,
        color: '#ccc',
        lineHeight: 20,
        marginBottom: 10
    },
    effectsContainer: {
        backgroundColor: '#1a1a1a',
        padding: 10,
        borderRadius: 5
    },
    effectsTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 5
    },
    effectsText: {
        fontSize: 13,
        color: '#4CAF50'
    }
});

export default InventoryScreen;
