import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import RoomButton from './RoomButton';
import { Floor, Room } from '../../types/gameTypes';

interface DungeonMapProps {
    floor: Floor | undefined;
    availableRooms: Room[];
    onRoomSelect: (roomId: string) => void;
}

const DungeonMap: React.FC<DungeonMapProps> = ({ floor, availableRooms, onRoomSelect }) => {
    if (!floor) {
        return (
            <View style={styles.container}>
                <Text style={styles.loading}>Loading dungeon...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Floor {floor.floorNumber}</Text>

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
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20
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

