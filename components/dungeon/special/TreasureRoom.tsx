import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Room } from '../../../types/gameTypes';
import { Item } from '../../../types/itemTypes';
import { getRandomItems } from '../../../data/itemDatabase';
import useGameStore from '../../../stores/gameStore';
import MemoryGame from '../../memory/MemoryGame';

interface TreasureRoomProps {
    room: Room;
    onComplete: () => void;
}

const TreasureRoom: React.FC<TreasureRoomProps> = ({ room, onComplete }) => {
    const [treasureFound, setTreasureFound] = useState(false);
    const [treasureItem, setTreasureItem] = useState<Item | null>(null);
    const { addItem, addPoints } = useGameStore();

    useEffect(() => {
        // Generate treasure item when room is entered
        if (!treasureItem) {
            const items = getRandomItems(room.floorNumber, 1, 'uncommon');
            if (items.length > 0) {
                setTreasureItem(items[0]);
            }
        }
    }, [room.floorNumber, treasureItem]);

    const handleTreasureFound = () => {
        if (treasureItem) {
            addItem(treasureItem);
            addPoints(100 * room.floorNumber);
            setTreasureFound(true);

            Alert.alert(
                '💎 Treasure Found!',
                `You discovered: ${treasureItem.name}\n\n${treasureItem.description}\n\n+${100 * room.floorNumber} points!`,
                [{ text: 'Excellent!', onPress: onComplete }]
            );
        }
    };

    if (treasureFound) {
        return (
            <View style={styles.container}>
                <View style={styles.treasureContainer}>
                    <Text style={styles.treasureIcon}>💎</Text>
                    <Text style={styles.treasureTitle}>Treasure Found!</Text>
                    <Text style={styles.treasureItem}>{treasureItem?.name}</Text>
                    <Text style={styles.treasureDescription}>{treasureItem?.description}</Text>
                    <TouchableOpacity style={styles.continueButton} onPress={onComplete}>
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <MemoryGame
            room={room}
            onComplete={onComplete}
            title="💰 Treasure Room"
            subtitle="Find the matching pairs to discover treasure!"
            instruction="Complete the memory game to find the treasure!"
            showHelperPanel={true}
            showCheatButton={true}
            onRoomComplete={handleTreasureFound}
            customFooter={treasureItem && <Text style={styles.hint}>Hidden treasure: {treasureItem.name}</Text>}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        padding: 20
    },
    hint: {
        fontSize: 14,
        color: '#FFD700',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 10
    },
    treasureContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        borderRadius: 15,
        padding: 30
    },
    treasureIcon: {
        fontSize: 80,
        marginBottom: 20
    },
    treasureTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 15
    },
    treasureItem: {
        fontSize: 20,
        color: '#fff',
        marginBottom: 10
    },
    treasureDescription: {
        fontSize: 16,
        color: '#ccc',
        textAlign: 'center',
        marginBottom: 30
    },
    continueButton: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 8
    },
    continueButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold'
    }
});

export default TreasureRoom;
