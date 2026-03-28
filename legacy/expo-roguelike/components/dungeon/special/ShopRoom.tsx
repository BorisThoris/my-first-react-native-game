import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Room } from '../../../types/gameTypes';
import { Item } from '../../../types/itemTypes';
import { getShopItems } from '../../../data/itemDatabase';
import useGameStore from '../../../stores/gameStore';
import RoomHeader from '../RoomHeader';

interface ShopRoomProps {
    room: Room;
    onComplete: () => void;
}

const ShopRoom: React.FC<ShopRoomProps> = ({ room, onComplete }) => {
    const [shopItems, setShopItems] = useState<Item[]>([]);
    const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
    const { playerStats, buyShopItem, addPoints } = useGameStore();

    useEffect(() => {
        // Generate shop items when room is entered
        const items = getShopItems(room.floorNumber, room.type);
        setShopItems(items.slice(0, 3)); // Show 3 items max
    }, [room.floorNumber, room.type]);

    const handlePurchase = (item: Item) => {
        if (playerStats.points >= item.cost) {
            const success = buyShopItem(item.id);
            if (success) {
                setPurchasedItems([...purchasedItems, item.id]);
                Alert.alert('Purchase Successful!', `You bought ${item.name}!`);
            }
        } else {
            Alert.alert('Not Enough Points', `You need ${item.cost} points to buy ${item.name}`);
        }
    };

    const handleLeave = () => {
        if (purchasedItems.length > 0) {
            Alert.alert(
                'Leave Shop?',
                `You've purchased ${purchasedItems.length} item(s). Are you sure you want to leave?`,
                [
                    { text: 'Stay', style: 'cancel' },
                    { text: 'Leave', onPress: onComplete }
                ]
            );
        } else {
            onComplete();
        }
    };

    return (
        <View style={styles.container}>
            <RoomHeader room={room} onBack={onComplete} />

            <View style={styles.header}>
                <Text style={styles.title}>🛒 Shop</Text>
                <Text style={styles.subtitle}>Welcome to the dungeon shop!</Text>
                <Text style={styles.points}>Points: {playerStats.points}</Text>
            </View>

            <ScrollView style={styles.shopArea}>
                {shopItems.map((item) => (
                    <View key={item.id} style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                            <Text style={styles.itemIcon}>{item.icon}</Text>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemDescription}>{item.description}</Text>
                            </View>
                        </View>

                        <View style={styles.itemFooter}>
                            <Text style={styles.itemCost}>{item.cost} pts</Text>
                            <TouchableOpacity
                                style={[
                                    styles.buyButton,
                                    (playerStats.points < item.cost || purchasedItems.includes(item.id)) &&
                                        styles.buyButtonDisabled
                                ]}
                                onPress={() => handlePurchase(item)}
                                disabled={playerStats.points < item.cost || purchasedItems.includes(item.id)}
                            >
                                <Text style={styles.buyButtonText}>
                                    {purchasedItems.includes(item.id) ? 'Purchased' : 'Buy'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.leaveButton} onPress={handleLeave}>
                    <Text style={styles.leaveButtonText}>Leave Shop</Text>
                </TouchableOpacity>
            </View>
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
        alignItems: 'center',
        marginBottom: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 10
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10
    },
    points: {
        fontSize: 18,
        color: '#FFD700',
        fontWeight: 'bold'
    },
    shopArea: {
        flex: 1,
        marginBottom: 20
    },
    itemCard: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#444'
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    itemIcon: {
        fontSize: 30,
        marginRight: 15
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
        color: '#ccc'
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    itemCost: {
        fontSize: 16,
        color: '#FFD700',
        fontWeight: 'bold'
    },
    buyButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 6
    },
    buyButtonDisabled: {
        backgroundColor: '#666'
    },
    buyButtonText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    footer: {
        alignItems: 'center'
    },
    leaveButton: {
        backgroundColor: '#666',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8
    },
    leaveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default ShopRoom;
