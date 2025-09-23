import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Room } from '../../../types/gameTypes';
import useGameStore from '../../../stores/gameStore';

interface SequenceMemoryProps {
    room: Room;
    onComplete: () => void;
}

const SequenceMemory: React.FC<SequenceMemoryProps> = ({ room, onComplete }) => {
    const [sequence, setSequence] = useState<string[]>([]);
    const [playerSequence, setPlayerSequence] = useState<string[]>([]);
    const [isShowingSequence, setIsShowingSequence] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [gamePhase, setGamePhase] = useState<'show' | 'play' | 'complete'>('show');

    const { currentRoomTiles, flipTile, matchedTiles, flippedTiles } = useGameStore();

    useEffect(() => {
        generateSequence();
    }, []);

    const generateSequence = () => {
        const tiles = currentRoomTiles.slice(0, Math.min(room.gridSize * 2, currentRoomTiles.length));
        const sequenceLength = Math.min(4 + Math.floor(room.difficulty / 2), tiles.length);
        const shuffled = [...tiles].sort(() => Math.random() - 0.5);
        setSequence(shuffled.slice(0, sequenceLength).map((tile) => tile.id));
        setPlayerSequence([]);
        setCurrentStep(0);
        setGamePhase('show');
        setIsShowingSequence(true);
    };

    useEffect(() => {
        if (gamePhase === 'show' && sequence.length > 0) {
            const timer = setTimeout(() => {
                if (currentStep < sequence.length) {
                    // Highlight the current tile in sequence
                    const tileId = sequence[currentStep];
                    flipTile(tileId);

                    setTimeout(() => {
                        // Unflip after showing
                        flipTile(tileId);
                        setCurrentStep((prev) => prev + 1);
                    }, 800);
                } else {
                    // Sequence complete, start player phase
                    setIsShowingSequence(false);
                    setGamePhase('play');
                    setCurrentStep(0);
                }
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [gamePhase, currentStep, sequence]);

    const handleTilePress = (tileId: string) => {
        if (gamePhase !== 'play' || isShowingSequence) return;

        const expectedTileId = sequence[playerSequence.length];
        if (tileId === expectedTileId) {
            const newPlayerSequence = [...playerSequence, tileId];
            setPlayerSequence(newPlayerSequence);

            if (newPlayerSequence.length === sequence.length) {
                // Sequence completed correctly
                setGamePhase('complete');
                setTimeout(() => {
                    onComplete();
                }, 1000);
            }
        } else {
            // Wrong tile - reset
            Alert.alert('Wrong Sequence!', 'Try again!', [
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

    const getTileStyle = (tileId: string) => {
        if (isShowingSequence && sequence[currentStep] === tileId) {
            return styles.highlightedTile;
        }
        if (playerSequence.includes(tileId)) {
            return styles.correctTile;
        }
        return styles.normalTile;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎵 Sequence Memory</Text>
            <Text style={styles.instruction}>
                {gamePhase === 'show'
                    ? 'Watch the sequence carefully...'
                    : gamePhase === 'play'
                      ? `Repeat the sequence! (${playerSequence.length}/${sequence.length})`
                      : 'Sequence completed!'}
            </Text>

            <View style={styles.tileContainer}>
                {currentRoomTiles.slice(0, room.gridSize * 2).map((tile) => (
                    <TouchableOpacity
                        key={tile.id}
                        style={[styles.tile, getTileStyle(tile.id)]}
                        onPress={() => handleTilePress(tile.id)}
                        disabled={gamePhase !== 'play' || isShowingSequence}
                    >
                        <Text style={styles.tileText}>{tile.shape}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {gamePhase === 'show' && (
                <Text style={styles.countdown}>
                    Step {currentStep + 1} of {sequence.length}
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
        width: 60,
        height: 60,
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
    tileText: {
        fontSize: 24,
        color: '#fff'
    },
    countdown: {
        color: '#FFD700',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20
    }
});

export default SequenceMemory;
