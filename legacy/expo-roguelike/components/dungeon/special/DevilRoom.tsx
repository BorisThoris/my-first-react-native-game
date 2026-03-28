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

interface DevilRoomProps {
    room: Room;
    onComplete: () => void;
}

const DevilRoom: React.FC<DevilRoomProps> = ({ room, onComplete }) => {
    const [dealMade, setDealMade] = useState(false);
    const [devilItems, setDevilItems] = useState<Item[]>([]);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const { addItem, loseLife, addPoints, playerStats } = useGameStore();
    const { loadRoom } = useRoomState(room);

    useEffect(() => {
        loadRoom();
    }, [loadRoom]);

    useEffect(() => {
        // Generate devil items when room is entered
        if (devilItems.length === 0) {
            const items = getRandomItems(room.floorNumber, 2, 'epic');
            setDevilItems(items);
        }
    }, [room.floorNumber, devilItems.length]);

    const handleDealMade = () => {
        setDealMade(true);
        addPoints(500 * room.floorNumber);

        Alert.alert(
            '😈 Devil Deal Available!',
            `The devil offers you powerful items... but at a cost!\n\n+${500 * room.floorNumber} points!\n\nChoose your deal:`,
            [{ text: 'Make Deal', onPress: () => {} }]
        );
    };

    const handleItemSelect = (item: Item) => {
        // Devil deal: lose 1 life for powerful item
        loseLife();
        addItem(item);
        setSelectedItem(item);

        Alert.alert(
            '😈 Deal Made!',
            `You made a deal with the devil!\n\n` +
                `You gained: ${item.name}\n` +
                `Cost: 1 Life\n\n` +
                `"Power comes at a price..."`,
            [{ text: 'Continue', onPress: onComplete }]
        );
    };

    const handleRefuseDeal = () => {
        Alert.alert('😈 Deal Refused', "You refused the devil's offer and left the room.", [
            { text: 'Continue', onPress: onComplete }
        ]);
    };

    if (dealMade && selectedItem) {
        return (
            <View style={styles.container}>
                <View style={styles.devilContainer}>
                    <Text style={styles.devilIcon}>😈</Text>
                    <Text style={styles.devilTitle}>Deal Made!</Text>
                    <Text style={styles.devilText}>You made a deal with the devil...</Text>
                    <Text style={styles.devilItem}>You gained: {selectedItem.name}</Text>
                    <Text style={styles.devilCost}>Cost: 1 Life</Text>
                    <TouchableOpacity style={styles.continueButton} onPress={onComplete}>
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (dealMade) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>😈 Devil Room</Text>
                    <Text style={styles.subtitle}>The devil offers you power... at a price</Text>
                </View>

                <View style={styles.dealsArea}>
                    {devilItems.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.dealCard} onPress={() => handleItemSelect(item)}>
                            <Text style={styles.dealIcon}>{item.icon}</Text>
                            <View style={styles.dealInfo}>
                                <Text style={styles.dealName}>{item.name}</Text>
                                <Text style={styles.dealDescription}>{item.description}</Text>
                                <Text style={styles.dealCost}>Cost: 1 Life</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.refuseButton} onPress={handleRefuseDeal}>
                        <Text style={styles.refuseButtonText}>Refuse Deal</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <RoomHeader room={room} onBack={onComplete} />

            <View style={styles.header}>
                <Text style={styles.title}>😈 Devil Room</Text>
                <Text style={styles.subtitle}>A dark chamber filled with evil energy...</Text>
                <Text style={styles.hint}>Complete the puzzle to meet the devil!</Text>
            </View>

            <View style={styles.gameArea}>
                <TileGrid room={room} onRoomComplete={handleDealMade} />
            </View>

            <HelperPanel room={room} />

            <View style={styles.footer}>
                <Text style={styles.instruction}>Solve the memory puzzle to unlock the devil's deal!</Text>
                <Text style={styles.warning}>⚠️ Devil deals cost lives but offer powerful rewards!</Text>
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
        color: '#f44336',
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
        color: '#f44336',
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
    warning: {
        color: '#f44336',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    dealsArea: {
        flex: 1,
        marginBottom: 20
    },
    dealCard: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f44336'
    },
    dealIcon: {
        fontSize: 30,
        marginRight: 15
    },
    dealInfo: {
        flex: 1
    },
    dealName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5
    },
    dealDescription: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 5
    },
    dealCost: {
        fontSize: 14,
        color: '#f44336',
        fontWeight: 'bold'
    },
    refuseButton: {
        backgroundColor: '#666',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
        alignSelf: 'center'
    },
    refuseButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    devilContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        borderRadius: 15,
        padding: 30
    },
    devilIcon: {
        fontSize: 80,
        marginBottom: 20
    },
    devilTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f44336',
        marginBottom: 15
    },
    devilText: {
        fontSize: 16,
        color: '#ccc',
        textAlign: 'center',
        marginBottom: 15
    },
    devilItem: {
        fontSize: 18,
        color: '#fff',
        marginBottom: 10
    },
    devilCost: {
        fontSize: 16,
        color: '#f44336',
        marginBottom: 30
    },
    continueButton: {
        backgroundColor: '#f44336',
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

export default DevilRoom;
