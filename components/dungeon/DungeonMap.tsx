import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import RoomButton from './RoomButton';
import InteractiveMap from './InteractiveMap';
import { Floor, Room } from '../../types/gameTypes';
import useDungeonStore from '../../stores/dungeonStore';

interface DungeonMapProps {
    floor: Floor | undefined;
    availableRooms: Room[];
    onRoomSelect: (roomId: string) => void;
    onShopOpen: () => void;
}

const DungeonMap: React.FC<DungeonMapProps> = ({ floor, availableRooms, onRoomSelect, onShopOpen }) => {
    const { getCurrentFloorInteractives, interactWithElement } = useDungeonStore();
    const interactives = getCurrentFloorInteractives();
    if (!floor) {
        return (
            <View style={styles.container}>
                <Text style={styles.loading}>Loading dungeon...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.title}>Floor {floor.floorNumber}</Text>
                    <TouchableOpacity style={styles.shopButton} onPress={onShopOpen}>
                        <Text style={styles.shopButtonText}>🛒 Shop</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.roomsGrid}>
                    {floor.rooms.map((room) => (
                        <RoomButton key={room.id} room={room} availableRooms={availableRooms} onPress={onRoomSelect} />
                    ))}
                </View>

                <View style={styles.legend}>
                    <Text style={styles.legendTitle}>Legend:</Text>
                    <Text style={styles.legendItem}>🧠 Memory Chamber (Returnable)</Text>
                    <Text style={styles.legendItem}>👹 Boss Room (One-time)</Text>
                    <Text style={styles.legendItem}>💰 Treasure Room (Returnable)</Text>
                    <Text style={styles.legendItem}>✓ Completed (Locked)</Text>
                    <Text style={styles.legendItem}>↻ Completed (Returnable)</Text>
                    <Text style={styles.legendItem}>💥 Bombable Wall (Use Bomb)</Text>
                    <Text style={styles.legendItem}>🔒 Locked Door (Use Key)</Text>
                    <Text style={styles.legendItem}>💎 Treasure Chest (Use Key)</Text>
                </View>
            </ScrollView>

            <InteractiveMap interactives={interactives} onInteract={(element) => interactWithElement(element.id)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1
    },
    shopButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        marginLeft: 10
    },
    shopButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14
    },
    roomsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        marginBottom: 20
    },
    legend: {
        backgroundColor: '#2a2a2a',
        padding: 15,
        borderRadius: 8
    },
    legendTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10
    },
    legendItem: {
        color: '#ccc',
        fontSize: 14,
        marginBottom: 5
    },
    loading: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 50
    }
});

export default DungeonMap;
