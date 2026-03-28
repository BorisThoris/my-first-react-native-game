import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Room } from '../../../types/gameTypes';
import { Item } from '../../../types/itemTypes';
import { getRandomItems } from '../../../data/itemDatabase';
import useGameStore from '../../../stores/gameStore';
import MemoryGame from '../../memory/MemoryGame';

interface LibraryRoomProps {
    room: Room;
    onComplete: () => void;
}

const LibraryRoom: React.FC<LibraryRoomProps> = ({ room, onComplete }) => {
    const [knowledgeGained, setKnowledgeGained] = useState(false);
    const [libraryItems, setLibraryItems] = useState<Item[]>([]);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const { addItem, addPoints } = useGameStore();

    useEffect(() => {
        // Generate library items when room is entered
        if (libraryItems.length === 0) {
            const items = getRandomItems(room.floorNumber, 3, 'uncommon');
            setLibraryItems(items);
        }
    }, [room.floorNumber, libraryItems.length]);

    const handleKnowledgeGained = () => {
        setKnowledgeGained(true);
        addPoints(150 * room.floorNumber);

        Alert.alert(
            '📚 Knowledge Gained!',
            `You studied ancient texts and gained wisdom!\n\n+${150 * room.floorNumber} points!\n\nChoose a tome to study:`,
            [{ text: 'Study', onPress: () => {} }]
        );
    };

    const handleItemSelect = (item: Item) => {
        addItem(item);
        setSelectedItem(item);

        Alert.alert(
            '📖 Tome Studied!',
            `You studied: ${item.name}\n\n${item.description}\n\nYou gained new knowledge!`,
            [{ text: 'Continue', onPress: onComplete }]
        );
    };

    if (knowledgeGained && selectedItem) {
        return (
            <View style={styles.container}>
                <View style={styles.libraryContainer}>
                    <Text style={styles.libraryIcon}>📚</Text>
                    <Text style={styles.libraryTitle}>Knowledge Gained!</Text>
                    <Text style={styles.studiedItem}>You studied: {selectedItem.name}</Text>
                    <Text style={styles.studiedDescription}>{selectedItem.description}</Text>
                    <TouchableOpacity style={styles.continueButton} onPress={onComplete}>
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (knowledgeGained) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>📚 Library</Text>
                    <Text style={styles.subtitle}>Choose a tome to study:</Text>
                </View>

                <ScrollView style={styles.tomesArea}>
                    {libraryItems.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.tomeCard} onPress={() => handleItemSelect(item)}>
                            <Text style={styles.tomeIcon}>{item.icon}</Text>
                            <View style={styles.tomeInfo}>
                                <Text style={styles.tomeName}>{item.name}</Text>
                                <Text style={styles.tomeDescription}>{item.description}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    }

    return (
        <MemoryGame
            room={room}
            onComplete={onComplete}
            title="📚 Library"
            subtitle="An ancient library filled with knowledge..."
            instruction="Solve the memory puzzle to unlock ancient knowledge!"
            showHelperPanel={true}
            showCheatButton={true}
            onRoomComplete={handleKnowledgeGained}
            customFooter={<Text style={styles.hint}>Complete the memory puzzle to gain wisdom!</Text>}
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
        color: '#2196F3',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 10
    },
    tomesArea: {
        flex: 1,
        marginBottom: 20
    },
    tomeCard: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444'
    },
    tomeIcon: {
        fontSize: 30,
        marginRight: 15
    },
    tomeInfo: {
        flex: 1
    },
    tomeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5
    },
    tomeDescription: {
        fontSize: 14,
        color: '#ccc'
    },
    libraryContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        borderRadius: 15,
        padding: 30
    },
    libraryIcon: {
        fontSize: 80,
        marginBottom: 20
    },
    libraryTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2196F3',
        marginBottom: 15
    },
    studiedItem: {
        fontSize: 20,
        color: '#fff',
        marginBottom: 10
    },
    studiedDescription: {
        fontSize: 16,
        color: '#ccc',
        textAlign: 'center',
        marginBottom: 30
    },
    continueButton: {
        backgroundColor: '#2196F3',
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

export default LibraryRoom;
