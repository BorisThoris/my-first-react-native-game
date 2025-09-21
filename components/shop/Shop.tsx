import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import useGameStore from '../../stores/gameStore';
import { ShopItem } from '../../types/gameTypes';

interface ShopProps {
    onClose: () => void;
}

const Shop: React.FC<ShopProps> = ({ onClose }) => {
    const { playerStats, buyShopItem, useShopItem, getAvailableShopItems } = useGameStore();
    const availableItems = getAvailableShopItems();

    const handleBuyItem = (itemId: string) => {
        const success = buyShopItem(itemId);
        if (success) {
            // Could add a success animation or sound here
            console.log('Item purchased successfully!');
        } else {
            console.log('Not enough points or item not available');
        }
    };

    const handleUseItem = (itemId: string) => {
        const success = useShopItem(itemId);
        if (success) {
            console.log('Item used successfully!');
        } else {
            console.log('Item not available or no uses left');
        }
    };

    const renderShopItem = (item: ShopItem) => (
        <View key={item.id} style={styles.shopItem}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
                <Text style={styles.itemCost}>Cost: {item.cost} points</Text>
                <Text style={styles.itemUses}>Uses: {item.currentUses || 0}</Text>
            </View>
            <View style={styles.itemActions}>
                <TouchableOpacity
                    style={[styles.buyButton, playerStats.points < item.cost && styles.disabledButton]}
                    onPress={() => handleBuyItem(item.id)}
                    disabled={playerStats.points < item.cost}
                >
                    <Text style={styles.buttonText}>Buy</Text>
                </TouchableOpacity>
                {(item.currentUses || 0) > 0 && (
                    <TouchableOpacity style={styles.useButton} onPress={() => handleUseItem(item.id)}>
                        <Text style={styles.buttonText}>Use</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Memory Shop</Text>
                <Text style={styles.points}>Points: {playerStats.points}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.itemsList}>
                {availableItems.length > 0 ? (
                    availableItems.map(renderShopItem)
                ) : (
                    <Text style={styles.emptyText}>No items available</Text>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        padding: 20
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff'
    },
    points: {
        fontSize: 18,
        color: '#4CAF50',
        fontWeight: 'bold'
    },
    closeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#666',
        justifyContent: 'center',
        alignItems: 'center'
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    itemsList: {
        flex: 1
    },
    shopItem: {
        flexDirection: 'row',
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#444'
    },
    itemInfo: {
        flex: 1
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5
    },
    itemDescription: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 5
    },
    itemCost: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: 'bold'
    },
    itemUses: {
        fontSize: 12,
        color: '#888',
        marginTop: 2
    },
    itemActions: {
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 8
    },
    buyButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
        minWidth: 60,
        alignItems: 'center'
    },
    useButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
        minWidth: 60,
        alignItems: 'center'
    },
    disabledButton: {
        backgroundColor: '#666'
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12
    },
    emptyText: {
        color: '#888',
        textAlign: 'center',
        fontSize: 16,
        marginTop: 50
    }
});

export default Shop;

