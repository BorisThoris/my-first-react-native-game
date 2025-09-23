import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Room } from '../../../types/gameTypes';
import { Item } from '../../../types/itemTypes';
import { getRandomItems } from '../../../data/itemDatabase';
import useGameStore from '../../../stores/gameStore';
import MemoryGame from '../../memory/MemoryGame';

interface SecretRoomProps {
    room: Room;
    onComplete: () => void;
}

const SecretRoom: React.FC<SecretRoomProps> = ({ room, onComplete }) => {
    const [secretRevealed, setSecretRevealed] = useState(false);
    const [secretItems, setSecretItems] = useState<Item[]>([]);
    const [secretKeys, setSecretKeys] = useState(0);
    const [secretBombs, setSecretBombs] = useState(0);
    const { addItem, addKeys, addBombs, addPoints } = useGameStore();

    useEffect(() => {
        // Generate secret rewards when room is entered
        if (secretItems.length === 0) {
            const items = getRandomItems(room.floorNumber, 2, 'rare');
            setSecretItems(items);
            setSecretKeys(2);
            setSecretBombs(1);
        }
    }, [room.floorNumber, secretItems.length]);

    const handleSecretRevealed = () => {
        // Give rewards
        secretItems.forEach((item) => addItem(item));
        addKeys(secretKeys);
        addBombs(secretBombs);
        addPoints(200 * room.floorNumber);

        setSecretRevealed(true);

        Alert.alert(
            '🔍 Secret Discovered!',
            `You found a hidden secret!\n\n` +
                `Items: ${secretItems.map((item) => item.name).join(', ')}\n` +
                `Keys: +${secretKeys}\n` +
                `Bombs: +${secretBombs}\n` +
                `Points: +${200 * room.floorNumber}`,
            [{ text: 'Amazing!', onPress: onComplete }]
        );
    };

    if (secretRevealed) {
        return (
            <View style={styles.container}>
                <View style={styles.secretContainer}>
                    <Text style={styles.secretIcon}>🔍</Text>
                    <Text style={styles.secretTitle}>Secret Discovered!</Text>
                    <Text style={styles.secretText}>You found a hidden secret room with valuable treasures!</Text>
                    <View style={styles.rewardsList}>
                        {secretItems.map((item, index) => (
                            <Text key={index} style={styles.rewardItem}>
                                {item.icon} {item.name}
                            </Text>
                        ))}
                        <Text style={styles.rewardItem}>🗝️ {secretKeys} Keys</Text>
                        <Text style={styles.rewardItem}>💣 {secretBombs} Bombs</Text>
                        <Text style={styles.rewardItem}>💰 {200 * room.floorNumber} Points</Text>
                    </View>
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
            title="🔍 Secret Room"
            subtitle="A hidden chamber with mysterious secrets..."
            instruction="Solve the memory puzzle to discover the hidden secret!"
            showHelperPanel={true}
            showCheatButton={true}
            onRoomComplete={handleSecretRevealed}
            customFooter={<Text style={styles.hint}>Complete the puzzle to reveal the secret!</Text>}
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
        color: '#9C27B0',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 10
    },
    secretContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        borderRadius: 15,
        padding: 30
    },
    secretIcon: {
        fontSize: 80,
        marginBottom: 20
    },
    secretTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#9C27B0',
        marginBottom: 15
    },
    secretText: {
        fontSize: 16,
        color: '#ccc',
        textAlign: 'center',
        marginBottom: 30
    },
    rewardsList: {
        alignItems: 'center',
        marginBottom: 30
    },
    rewardItem: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 8
    },
    continueButton: {
        backgroundColor: '#9C27B0',
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

export default SecretRoom;
