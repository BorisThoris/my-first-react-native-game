import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Room } from '../../../types/gameTypes';
import { Item } from '../../../types/itemTypes';
import { getRandomItems } from '../../../data/itemDatabase';
import useGameStore from '../../../stores/gameStore';
import { useRoomState } from '../../../hooks/useRoomState';
import TileGrid from '../../memory/TileGrid';
import RoomHeader from '../RoomHeader';
import HelperPanel from '../../ui/HelperPanel';

interface AngelRoomProps {
    room: Room;
    onComplete: () => void;
}

const AngelRoom: React.FC<AngelRoomProps> = ({ room, onComplete }) => {
    const [blessingReceived, setBlessingReceived] = useState(false);
    const [angelItems, setAngelItems] = useState<Item[]>([]);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const { addItem, gainLife, addPoints, playerStats } = useGameStore();
    const { loadRoom } = useRoomState(room);

    useEffect(() => {
        loadRoom();
    }, [loadRoom]);

    useEffect(() => {
        // Generate angel items when room is entered
        if (angelItems.length === 0) {
            const items = getRandomItems(room.floorNumber, 2, 'legendary');
            setAngelItems(items);
        }
    }, [room.floorNumber, angelItems.length]);

    const handleBlessingReceived = () => {
        setBlessingReceived(true);
        addPoints(400 * room.floorNumber);

        Alert.alert(
            '😇 Angel Blessing!',
            `The angels offer you their blessing... for free!\n\n+${400 * room.floorNumber} points!\n\nChoose your blessing:`,
            [{ text: 'Receive Blessing', onPress: () => {} }]
        );
    };

    const handleItemSelect = (item: Item) => {
        // Angel blessing: gain item and life for free
        addItem(item);
        gainLife();
        setSelectedItem(item);

        Alert.alert(
            '😇 Blessing Received!',
            `You received an angel's blessing!\n\n` +
                `You gained: ${item.name}\n` +
                `Bonus: +1 Life\n\n` +
                `"The angels smile upon you..."`,
            [{ text: 'Continue', onPress: onComplete }]
        );
    };

    if (blessingReceived && selectedItem) {
        return (
            <View style={styles.container}>
                <View style={styles.angelContainer}>
                    <Text style={styles.angelIcon}>😇</Text>
                    <Text style={styles.angelTitle}>Blessing Received!</Text>
                    <Text style={styles.angelText}>The angels have blessed you...</Text>
                    <Text style={styles.angelItem}>You gained: {selectedItem.name}</Text>
                    <Text style={styles.angelBonus}>Bonus: +1 Life</Text>
                    <TouchableOpacity style={styles.continueButton} onPress={onComplete}>
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (blessingReceived) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>😇 Angel Room</Text>
                    <Text style={styles.subtitle}>The angels offer you their blessing</Text>
                </View>

                <View style={styles.blessingsArea}>
                    {angelItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.blessingCard}
                            onPress={() => handleItemSelect(item)}
                        >
                            <Text style={styles.blessingIcon}>{item.icon}</Text>
                            <View style={styles.blessingInfo}>
                                <Text style={styles.blessingName}>{item.name}</Text>
                                <Text style={styles.blessingDescription}>{item.description}</Text>
                                <Text style={styles.blessingBonus}>Bonus: +1 Life</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <RoomHeader room={room} onBack={onComplete} />

            <View style={styles.header}>
                <Text style={styles.title}>😇 Angel Room</Text>
                <Text style={styles.subtitle}>A divine chamber filled with holy light...</Text>
                <Text style={styles.hint}>Complete the puzzle to receive the angel's blessing!</Text>
            </View>

            <View style={styles.gameArea}>
                <TileGrid room={room} onRoomComplete={handleBlessingReceived} />
            </View>

            <HelperPanel room={room} />

            <View style={styles.footer}>
                <Text style={styles.instruction}>Solve the memory puzzle to unlock the angel's blessing!</Text>
                <Text style={styles.blessing}>✨ Angel blessings are free and powerful!</Text>
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
    hint: {
        fontSize: 14,
        color: '#4CAF50',
        fontStyle: 'italic'
    },
    gameArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    footer: {
        padding: 15,
        backgroundColor: '#2a2a2a',
        borderRadius: 8,
        marginTop: 20
    },
    instruction: {
        color: '#ccc',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10
    },
    blessing: {
        color: '#4CAF50',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    blessingsArea: {
        flex: 1,
        marginBottom: 20
    },
    blessingCard: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4CAF50'
    },
    blessingIcon: {
        fontSize: 30,
        marginRight: 15
    },
    blessingInfo: {
        flex: 1
    },
    blessingName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5
    },
    blessingDescription: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 5
    },
    blessingBonus: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: 'bold'
    },
    angelContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        borderRadius: 15,
        padding: 30
    },
    angelIcon: {
        fontSize: 80,
        marginBottom: 20
    },
    angelTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 15
    },
    angelText: {
        fontSize: 16,
        color: '#ccc',
        textAlign: 'center',
        marginBottom: 15
    },
    angelItem: {
        fontSize: 18,
        color: '#fff',
        marginBottom: 10
    },
    angelBonus: {
        fontSize: 16,
        color: '#4CAF50',
        marginBottom: 30
    },
    continueButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 8
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    }
});

export default AngelRoom;
