import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import useGameStore from '../../stores/gameStore';
import { generateShop, purchaseItem, Shop as ShopData, ShopCategory } from '../../data/shopSystem';
import { getRarityColor, getRarityIcon } from '../../types/collectibleTypes';

interface ShopProps {
    onClose: () => void;
}

const ShopComponent: React.FC<ShopProps> = ({ onClose }) => {
    const { playerStats, updateStats } = useGameStore();
    const [shop, setShop] = useState<ShopData | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('consumables');

    useEffect(() => {
        // Generate shop for current floor
        const newShop = generateShop(playerStats.currentFloor, playerStats);
        setShop(newShop);
    }, [playerStats.currentFloor]);

    const handleBuyItem = (shopItem: any) => {
        const result = purchaseItem(shopItem, playerStats);
        if (result.success) {
            updateStats(result.newStats);
            Alert.alert('Purchase Successful!', result.message);
        } else {
            Alert.alert('Purchase Failed', result.message);
        }
    };

    if (!shop) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading shop...</Text>
            </View>
        );
    }

    const selectedCategoryData = shop.categories.find((cat) => cat.id === selectedCategory);
    const availableItems = selectedCategoryData?.items || [];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{shop.name}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
                <Text style={styles.statsText}>Points: {playerStats.points}</Text>
                <Text style={styles.statsText}>Floor: {playerStats.currentFloor}</Text>
            </View>

            <View style={styles.categoryContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {shop.categories.map((category) => (
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

            <ScrollView style={styles.itemsContainer}>
                {availableItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No items available in this category</Text>
                    </View>
                ) : (
                    availableItems.map((shopItem) => (
                        <View key={shopItem.id} style={styles.shopItem}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemIcon}>{getRarityIcon(shopItem.collectible.rarity)}</Text>
                                <View style={styles.itemDetails}>
                                    <Text
                                        style={[
                                            styles.itemName,
                                            { color: getRarityColor(shopItem.collectible.rarity) }
                                        ]}
                                    >
                                        {shopItem.collectible.name}
                                    </Text>
                                    <Text style={styles.itemType}>
                                        {shopItem.collectible.type} • {shopItem.collectible.rarity}
                                    </Text>
                                    <Text style={styles.itemDescription}>{shopItem.collectible.description}</Text>
                                    <Text style={styles.itemCost}>Cost: {shopItem.cost} points</Text>
                                    <Text style={styles.itemStock}>
                                        Stock: {shopItem.stock}/{shopItem.maxStock}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={[styles.buyButton, playerStats.points < shopItem.cost && styles.disabledButton]}
                                onPress={() => handleBuyItem(shopItem)}
                                disabled={playerStats.points < shopItem.cost || shopItem.stock <= 0}
                            >
                                <Text style={styles.buttonText}>{shopItem.stock <= 0 ? 'Out of Stock' : 'Buy'}</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
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
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 15,
        backgroundColor: '#2a2a2a',
        marginHorizontal: 20,
        marginVertical: 10,
        borderRadius: 10
    },
    statsText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
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
    emptyText: {
        fontSize: 16,
        color: '#ccc',
        textAlign: 'center'
    },
    loadingText: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        marginTop: 50
    },
    shopItem: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 15,
        marginVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50'
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
        textTransform: 'capitalize',
        marginBottom: 5
    },
    itemDescription: {
        fontSize: 14,
        color: '#ccc',
        lineHeight: 20,
        marginBottom: 5
    },
    itemCost: {
        fontSize: 14,
        color: '#FFD700',
        fontWeight: 'bold'
    },
    itemStock: {
        fontSize: 12,
        color: '#999',
        marginTop: 2
    },
    buyButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginLeft: 10
    },
    disabledButton: {
        backgroundColor: '#666'
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold'
    }
});

export default ShopComponent;
