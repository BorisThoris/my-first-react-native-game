import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Room } from '../../../types/gameTypes';
import { Item } from '../../../types/itemTypes';
import { getRandomItems } from '../../../data/itemDatabase';
import useGameStore from '../../../stores/gameStore';
import MemoryGame from '../../memory/MemoryGame';

interface ChallengeRoomProps {
    room: Room;
    onComplete: () => void;
}

const ChallengeRoom: React.FC<ChallengeRoomProps> = ({ room, onComplete }) => {
    const [challengeCompleted, setChallengeCompleted] = useState(false);
    const [challengeItem, setChallengeItem] = useState<Item | null>(null);
    const [timeLimit, setTimeLimit] = useState(60 + room.floorNumber * 10);
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    const { addItem, addPoints } = useGameStore();

    useEffect(() => {
        // Generate challenge item when room is entered
        if (!challengeItem) {
            const items = getRandomItems(room.floorNumber, 1, 'rare');
            if (items.length > 0) {
                setChallengeItem(items[0]);
            }
        }
    }, [room.floorNumber, challengeItem]);

    useEffect(() => {
        // Timer countdown
        if (timeLeft > 0 && !challengeCompleted) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !challengeCompleted) {
            handleTimeUp();
        }
    }, [timeLeft, challengeCompleted]);

    const handleTimeUp = () => {
        Alert.alert('⏰ Time Up!', 'The challenge was too difficult! You failed the challenge.', [
            { text: 'Continue', onPress: onComplete }
        ]);
    };

    const handleTimeExtension = (seconds: number) => {
        setTimeLeft((prev) => prev + seconds);
        Alert.alert('⏰ Time Extended!', `You gained ${seconds} seconds!`);
    };

    const handleHint = (tileIds: string[]) => {
        // Highlight the hinted tiles (this would need to be implemented in TileGrid)
        Alert.alert('💡 Hint Used!', 'Look for the highlighted matching pair!');
    };

    const handleChallengeCompleted = () => {
        if (challengeItem) {
            addItem(challengeItem);
            addPoints(300 * room.floorNumber);
            setChallengeCompleted(true);

            const bonusPoints = Math.floor(timeLeft * 10); // Bonus for time remaining
            addPoints(bonusPoints);

            Alert.alert(
                '⚔️ Challenge Mastered!',
                `You conquered the challenge!\n\n` +
                    `Reward: ${challengeItem.name}\n` +
                    `Points: +${300 * room.floorNumber}\n` +
                    `Time Bonus: +${bonusPoints}\n` +
                    `Total: +${300 * room.floorNumber + bonusPoints}`,
                [{ text: 'Excellent!', onPress: onComplete }]
            );
        }
    };

    if (challengeCompleted) {
        return (
            <View style={styles.container}>
                <View style={styles.challengeContainer}>
                    <Text style={styles.challengeIcon}>⚔️</Text>
                    <Text style={styles.challengeTitle}>Challenge Mastered!</Text>
                    <Text style={styles.challengeItem}>{challengeItem?.name}</Text>
                    <Text style={styles.challengeDescription}>{challengeItem?.description}</Text>
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
            title="⚔️ Challenge Room"
            subtitle="A difficult test of your memory skills!"
            instruction="Complete the memory game within the time limit!"
            showHelperPanel={true}
            showCheatButton={true}
            onRoomComplete={handleChallengeCompleted}
            customFooter={
                <View>
                    <View style={styles.timerContainer}>
                        <Text style={styles.timerLabel}>Time Left:</Text>
                        <Text style={[styles.timer, timeLeft < 10 && styles.timerWarning]}>{timeLeft}s</Text>
                    </View>
                    {challengeItem && <Text style={styles.hint}>Reward: {challengeItem.name}</Text>}
                    <Text style={styles.warning}>⚠️ This is a high-difficulty challenge!</Text>
                </View>
            }
        />
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
        color: '#FF5722',
        marginBottom: 10
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 15
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    timerLabel: {
        fontSize: 16,
        color: '#fff',
        marginRight: 10
    },
    timer: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50'
    },
    timerWarning: {
        color: '#f44336'
    },
    hint: {
        fontSize: 14,
        color: '#FF5722',
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
    challengeContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        borderRadius: 15,
        padding: 30
    },
    challengeIcon: {
        fontSize: 80,
        marginBottom: 20
    },
    challengeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FF5722',
        marginBottom: 15
    },
    challengeItem: {
        fontSize: 20,
        color: '#fff',
        marginBottom: 10
    },
    challengeDescription: {
        fontSize: 16,
        color: '#ccc',
        textAlign: 'center',
        marginBottom: 30
    },
    continueButton: {
        backgroundColor: '#FF5722',
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

export default ChallengeRoom;
