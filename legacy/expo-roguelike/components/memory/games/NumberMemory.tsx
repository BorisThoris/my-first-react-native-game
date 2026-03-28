import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Room } from '../../../types/gameTypes';

interface NumberMemoryProps {
    room: Room;
    onComplete: () => void;
}

const NumberMemory: React.FC<NumberMemoryProps> = ({ room, onComplete }) => {
    const [numberSequence, setNumberSequence] = useState<string>('');
    const [playerInput, setPlayerInput] = useState('');
    const [isShowingNumber, setIsShowingNumber] = useState(false);
    const [gamePhase, setGamePhase] = useState<'show' | 'play' | 'complete'>('show');
    const [attempts, setAttempts] = useState(0);
    const maxAttempts = 3;

    useEffect(() => {
        generateNumberSequence();
    }, []);

    const generateNumberSequence = () => {
        const sequenceLength = Math.min(4 + Math.floor(room.difficulty / 2), 8);
        let sequence = '';
        for (let i = 0; i < sequenceLength; i++) {
            sequence += Math.floor(Math.random() * 10).toString();
        }
        setNumberSequence(sequence);
        setPlayerInput('');
        setGamePhase('show');
        setIsShowingNumber(true);
        setAttempts(0);
    };

    useEffect(() => {
        if (gamePhase === 'show' && numberSequence.length > 0) {
            const timer = setTimeout(
                () => {
                    setIsShowingNumber(false);
                    setGamePhase('play');
                },
                3000 + numberSequence.length * 500
            ); // Show longer for longer sequences

            return () => clearTimeout(timer);
        }
    }, [gamePhase, numberSequence]);

    const handleSubmit = () => {
        if (playerInput === numberSequence) {
            setGamePhase('complete');
            setTimeout(() => {
                onComplete();
            }, 1000);
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= maxAttempts) {
                Alert.alert('Game Over!', `The number was: ${numberSequence}`, [
                    { text: 'Try Again', onPress: generateNumberSequence }
                ]);
            } else {
                Alert.alert('Wrong Number!', `Attempts remaining: ${maxAttempts - newAttempts}`, [
                    { text: 'Try Again', onPress: () => setPlayerInput('') }
                ]);
            }
        }
    };

    const getDisplayNumber = () => {
        if (gamePhase === 'show' && isShowingNumber) {
            return numberSequence;
        }
        return '?'.repeat(numberSequence.length);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🔢 Number Memory</Text>
            <Text style={styles.instruction}>
                {gamePhase === 'show'
                    ? 'Memorize this number:'
                    : gamePhase === 'play'
                      ? 'Enter the number you saw:'
                      : 'Number sequence completed!'}
            </Text>

            <View style={styles.numberDisplay}>
                <Text style={styles.numberText}>{getDisplayNumber()}</Text>
            </View>

            {gamePhase === 'play' && (
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.numberInput}
                        value={playerInput}
                        onChangeText={setPlayerInput}
                        placeholder="Enter number..."
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                        maxLength={numberSequence.length}
                        autoFocus
                    />
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            playerInput.length !== numberSequence.length && styles.submitButtonDisabled
                        ]}
                        onPress={handleSubmit}
                        disabled={playerInput.length !== numberSequence.length}
                    >
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            )}

            {gamePhase === 'play' && (
                <Text style={styles.attemptsText}>
                    Attempts: {attempts}/{maxAttempts}
                </Text>
            )}

            {gamePhase === 'show' && <Text style={styles.countdown}>Memorize the number...</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10
    },
    instruction: {
        color: '#ccc',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30
    },
    numberDisplay: {
        backgroundColor: '#2a2a2a',
        padding: 30,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#444',
        marginBottom: 30
    },
    numberText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFD700',
        textAlign: 'center',
        letterSpacing: 4
    },
    inputContainer: {
        width: '100%',
        maxWidth: 300,
        alignItems: 'center'
    },
    numberInput: {
        backgroundColor: '#2a2a2a',
        borderWidth: 2,
        borderColor: '#444',
        borderRadius: 8,
        padding: 15,
        fontSize: 24,
        color: '#fff',
        textAlign: 'center',
        width: '100%',
        marginBottom: 20
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#45a049'
    },
    submitButtonDisabled: {
        backgroundColor: '#666',
        borderColor: '#444'
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    attemptsText: {
        color: '#FFD700',
        fontSize: 16,
        marginTop: 20
    },
    countdown: {
        color: '#FFD700',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20
    }
});

export default NumberMemory;
