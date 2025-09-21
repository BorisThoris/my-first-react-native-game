import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Room } from '../../../types/gameTypes';
import useGameStore from '../../../stores/gameStore';

interface ColorMemoryProps {
    room: Room;
    onComplete: () => void;
}

const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

const ColorMemory: React.FC<ColorMemoryProps> = ({ room, onComplete }) => {
    const [colorSequence, setColorSequence] = useState<string[]>([]);
    const [playerSequence, setPlayerSequence] = useState<string[]>([]);
    const [isShowingSequence, setIsShowingSequence] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [gamePhase, setGamePhase] = useState<'show' | 'play' | 'complete'>('show');

    const { currentRoomTiles } = useGameStore();

    useEffect(() => {
        generateColorSequence();
    }, []);

    const generateColorSequence = () => {
        const sequenceLength = Math.min(4 + Math.floor(room.difficulty / 2), 8);
        const shuffled = [...colors].sort(() => Math.random() - 0.5);
        setColorSequence(shuffled.slice(0, sequenceLength));
        setPlayerSequence([]);
        setCurrentStep(0);
        setGamePhase('show');
        setIsShowingSequence(true);
    };

    useEffect(() => {
        if (gamePhase === 'show' && colorSequence.length > 0) {
            const timer = setTimeout(() => {
                if (currentStep < colorSequence.length) {
                    setCurrentStep((prev) => prev + 1);
                } else {
                    // Sequence complete, start player phase
                    setIsShowingSequence(false);
                    setGamePhase('play');
                    setCurrentStep(0);
                }
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [gamePhase, currentStep, colorSequence]);

    const handleColorPress = (color: string) => {
        if (gamePhase !== 'play' || isShowingSequence) return;

        const expectedColor = colorSequence[playerSequence.length];
        const newPlayerSequence = [...playerSequence, color];
        setPlayerSequence(newPlayerSequence);

        if (color === expectedColor) {
            if (newPlayerSequence.length === colorSequence.length) {
                // Sequence completed correctly
                setGamePhase('complete');
                setTimeout(() => {
                    onComplete();
                }, 1000);
            }
        } else {
            // Wrong color - reset
            Alert.alert('Wrong Color!', 'Try again!', [
                {
                    text: 'Retry',
                    onPress: () => {
                        setPlayerSequence([]);
                        setCurrentStep(0);
                    }
                }
            ]);
        }
    };

    const getColorStyle = (color: string, index: number) => {
        const isCurrentlyShowing = isShowingSequence && currentStep > index;
        const isPlayerSelected = playerSequence.includes(color);

        if (isCurrentlyShowing) {
            return [styles.colorTile, { backgroundColor: color, opacity: 1 }];
        }
        if (isPlayerSelected) {
            return [styles.colorTile, { backgroundColor: color, opacity: 0.8 }];
        }
        return [styles.colorTile, { backgroundColor: color, opacity: 0.3 }];
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎨 Color Memory</Text>
            <Text style={styles.instruction}>
                {gamePhase === 'show'
                    ? 'Watch the color sequence...'
                    : gamePhase === 'play'
                      ? `Repeat the colors! (${playerSequence.length}/${colorSequence.length})`
                      : 'Color sequence completed!'}
            </Text>

            <View style={styles.colorContainer}>
                {colorSequence.map((color, index) => (
                    <TouchableOpacity
                        key={`${color}-${index}`}
                        style={getColorStyle(color, index)}
                        onPress={() => handleColorPress(color)}
                        disabled={gamePhase !== 'play' || isShowingSequence}
                    >
                        <Text style={styles.colorText}>{index + 1}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {gamePhase === 'show' && (
                <Text style={styles.countdown}>
                    Step {currentStep + 1} of {colorSequence.length}
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
    colorContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: 300
    },
    colorTile: {
        width: 70,
        height: 70,
        margin: 8,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff'
    },
    colorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2
    },
    countdown: {
        color: '#FFD700',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20
    }
});

export default ColorMemory;
