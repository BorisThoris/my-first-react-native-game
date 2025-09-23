import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Room } from '../../../types/gameTypes';
import useGameStore from '../../../stores/gameStore';

interface PatternMemoryProps {
    room: Room;
    onComplete: () => void;
}

const PatternMemory: React.FC<PatternMemoryProps> = ({ room, onComplete }) => {
    const [pattern, setPattern] = useState<boolean[]>([]);
    const [playerPattern, setPlayerPattern] = useState<boolean[]>([]);
    const [isShowingPattern, setIsShowingPattern] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [gamePhase, setGamePhase] = useState<'show' | 'play' | 'complete'>('show');

    const { currentRoomTiles } = useGameStore();

    useEffect(() => {
        generatePattern();
    }, []);

    const generatePattern = () => {
        const patternLength = Math.min(6 + Math.floor(room.difficulty / 2), 12);
        const newPattern = Array.from({ length: patternLength }, () => Math.random() > 0.5);
        setPattern(newPattern);
        setPlayerPattern([]);
        setCurrentStep(0);
        setGamePhase('show');
        setIsShowingPattern(true);
    };

    useEffect(() => {
        if (gamePhase === 'show' && pattern.length > 0) {
            const timer = setTimeout(() => {
                if (currentStep < pattern.length) {
                    setCurrentStep((prev) => prev + 1);
                } else {
                    // Pattern complete, start player phase
                    setIsShowingPattern(false);
                    setGamePhase('play');
                    setCurrentStep(0);
                }
            }, 600);

            return () => clearTimeout(timer);
        }
    }, [gamePhase, currentStep, pattern]);

    const handleTilePress = (index: number) => {
        if (gamePhase !== 'play' || isShowingPattern) return;

        const newPlayerPattern = [...playerPattern, true];
        setPlayerPattern(newPlayerPattern);

        // Check if this position should be filled
        const shouldBeFilled = pattern[newPlayerPattern.length - 1];
        if (!shouldBeFilled) {
            // Wrong - this position should be empty
            Alert.alert('Wrong Pattern!', 'This position should be empty!', [
                {
                    text: 'Retry',
                    onPress: () => {
                        setPlayerPattern([]);
                        setCurrentStep(0);
                    }
                }
            ]);
            return;
        }

        if (newPlayerPattern.length === pattern.length) {
            // Check if all required positions are filled
            const allCorrect = pattern.every((shouldFill, index) => {
                if (shouldFill) {
                    return newPlayerPattern[index] === true;
                }
                return true; // Empty positions are always correct
            });

            if (allCorrect) {
                setGamePhase('complete');
                setTimeout(() => {
                    onComplete();
                }, 1000);
            } else {
                Alert.alert('Wrong Pattern!', 'Try again!', [
                    {
                        text: 'Retry',
                        onPress: () => {
                            setPlayerPattern([]);
                            setCurrentStep(0);
                        }
                    }
                ]);
            }
        }
    };

    const getTileStyle = (index: number) => {
        const isInPattern = pattern[index];
        const isPlayerFilled = playerPattern[index];
        const isCurrentlyShowing = isShowingPattern && currentStep > index;

        if (isCurrentlyShowing && isInPattern) {
            return styles.highlightedTile;
        }
        if (isPlayerFilled) {
            return isInPattern ? styles.correctTile : styles.wrongTile;
        }
        return styles.normalTile;
    };

    const getTileText = (index: number) => {
        const isInPattern = pattern[index];
        const isPlayerFilled = playerPattern[index];
        const isCurrentlyShowing = isShowingPattern && currentStep > index;

        if (isCurrentlyShowing && isInPattern) {
            return '●';
        }
        if (isPlayerFilled) {
            return '●';
        }
        return '○';
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🔮 Pattern Memory</Text>
            <Text style={styles.instruction}>
                {gamePhase === 'show'
                    ? 'Watch the pattern carefully...'
                    : gamePhase === 'play'
                      ? `Recreate the pattern! (${playerPattern.length}/${pattern.length})`
                      : 'Pattern completed!'}
            </Text>

            <View style={styles.tileContainer}>
                {pattern.map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.tile, getTileStyle(index)]}
                        onPress={() => handleTilePress(index)}
                        disabled={gamePhase !== 'play' || isShowingPattern}
                    >
                        <Text style={styles.tileText}>{getTileText(index)}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {gamePhase === 'show' && (
                <Text style={styles.countdown}>
                    Step {currentStep + 1} of {pattern.length}
                </Text>
            )}
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
    tileContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: 300
    },
    tile: {
        width: 50,
        height: 50,
        margin: 5,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#444'
    },
    normalTile: {
        backgroundColor: '#2a2a2a'
    },
    highlightedTile: {
        backgroundColor: '#FFD700',
        borderColor: '#FFA000'
    },
    correctTile: {
        backgroundColor: '#4CAF50',
        borderColor: '#45a049'
    },
    wrongTile: {
        backgroundColor: '#F44336',
        borderColor: '#d32f2f'
    },
    tileText: {
        fontSize: 20,
        color: '#fff'
    },
    countdown: {
        color: '#FFD700',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20
    }
});

export default PatternMemory;
