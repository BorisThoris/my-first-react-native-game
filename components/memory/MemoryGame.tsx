import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Room } from '../../types/gameTypes';
import {
    MemoryGameType,
    getRandomGameType,
    getGameTypeForDifficulty,
    MEMORY_GAME_CONFIGS
} from '../../types/memoryGameTypes';
import { useRoomState } from '../../hooks/useRoomState';
import { useRoomCompletion } from '../../hooks/useRoomCompletion';
import useGameStore from '../../stores/gameStore';
import TileGrid from './TileGrid';
import RoomHeader from '../dungeon/RoomHeader';
import HelperPanel from '../ui/HelperPanel';

// Import game components
import ClassicPairs from './games/ClassicPairs';
import SequenceMemory from './games/SequenceMemory';
import PatternMemory from './games/PatternMemory';
import ColorMemory from './games/ColorMemory';
import NumberMemory from './games/NumberMemory';

interface MemoryGameProps {
    room: Room;
    onComplete: () => void;
    onBack?: () => void;
    title?: string;
    subtitle?: string;
    instruction?: string;
    showHelperPanel?: boolean;
    showCheatButton?: boolean;
    customFooter?: React.ReactNode;
    onRoomComplete?: () => void;
    gameType?: MemoryGameType | 'random' | 'auto';
}

const MemoryGame: React.FC<MemoryGameProps> = ({
    room,
    onComplete,
    onBack,
    title,
    subtitle,
    instruction,
    showHelperPanel = true,
    showCheatButton = true,
    customFooter,
    onRoomComplete,
    gameType = 'auto'
}) => {
    const { loadRoom, saveRoom, isCompleted } = useRoomState(room);
    const { playerStats, cheatPreview, isPreviewing } = useGameStore();
    const { handleRoomCompletion } = useRoomCompletion(room);
    const [selectedGameType, setSelectedGameType] = useState<MemoryGameType | null>(null);

    useEffect(() => {
        loadRoom();
    }, [loadRoom]);

    useEffect(() => {
        // Determine game type
        let gameTypeToUse: MemoryGameType;

        if (gameType === 'random') {
            gameTypeToUse = getRandomGameType();
        } else if (gameType === 'auto') {
            // Use room's assigned memory game type, or fall back to difficulty-based selection
            if (room.memoryGameType && Object.values(MemoryGameType).includes(room.memoryGameType as MemoryGameType)) {
                gameTypeToUse = room.memoryGameType as MemoryGameType;
            } else {
                gameTypeToUse = getGameTypeForDifficulty(room.difficulty);
            }
        } else {
            gameTypeToUse = gameType as MemoryGameType;
        }

        setSelectedGameType(gameTypeToUse);
    }, [gameType, room.difficulty, room.memoryGameType]);

    const handleBackPress = (): void => {
        if (isCompleted()) {
            saveRoom();
            if (onBack) onBack();
        } else if (room.returnable) {
            saveRoom();
            if (onBack) onBack();
        } else {
            Alert.alert('Leave Room', 'Are you sure you want to leave? Progress will be lost.', [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Leave',
                    onPress: () => {
                        saveRoom();
                        if (onBack) onBack();
                    }
                }
            ]);
        }
    };

    const handleCheatPreview = (): void => {
        const success = cheatPreview();
        if (!success) {
            Alert.alert('Not Enough Points', 'You need 50 points to use cheat preview!');
        }
    };

    const handleMemoryGameComplete = () => {
        if (onRoomComplete) {
            onRoomComplete();
        } else {
            handleRoomCompletion();
            onComplete();
        }
    };

    const renderGameComponent = () => {
        if (!selectedGameType) {
            return (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading game...</Text>
                </View>
            );
        }

        const gameConfig = MEMORY_GAME_CONFIGS[selectedGameType];
        const gameTitle = title || gameConfig.title;
        const gameSubtitle = subtitle || gameConfig.subtitle;
        const gameInstruction = instruction || gameConfig.instruction;

        switch (selectedGameType) {
            case MemoryGameType.CLASSIC_PAIRS:
                return (
                    <View style={styles.gameContainer}>
                        <View style={styles.header}>
                            <Text style={styles.title}>{gameTitle}</Text>
                            <Text style={styles.subtitle}>{gameSubtitle}</Text>
                        </View>
                        <View style={styles.gameArea}>
                            <ClassicPairs room={room} onComplete={handleMemoryGameComplete} />
                        </View>
                    </View>
                );
            case MemoryGameType.SEQUENCE_MEMORY:
                return (
                    <View style={styles.gameContainer}>
                        <View style={styles.header}>
                            <Text style={styles.title}>{gameTitle}</Text>
                            <Text style={styles.subtitle}>{gameSubtitle}</Text>
                        </View>
                        <View style={styles.gameArea}>
                            <SequenceMemory room={room} onComplete={handleMemoryGameComplete} />
                        </View>
                    </View>
                );
            case MemoryGameType.PATTERN_MEMORY:
                return (
                    <View style={styles.gameContainer}>
                        <View style={styles.header}>
                            <Text style={styles.title}>{gameTitle}</Text>
                            <Text style={styles.subtitle}>{gameSubtitle}</Text>
                        </View>
                        <View style={styles.gameArea}>
                            <PatternMemory room={room} onComplete={handleMemoryGameComplete} />
                        </View>
                    </View>
                );
            case MemoryGameType.COLOR_MEMORY:
                return (
                    <View style={styles.gameContainer}>
                        <View style={styles.header}>
                            <Text style={styles.title}>{gameTitle}</Text>
                            <Text style={styles.subtitle}>{gameSubtitle}</Text>
                        </View>
                        <View style={styles.gameArea}>
                            <ColorMemory room={room} onComplete={handleMemoryGameComplete} />
                        </View>
                    </View>
                );
            case MemoryGameType.NUMBER_MEMORY:
                return (
                    <View style={styles.gameContainer}>
                        <View style={styles.header}>
                            <Text style={styles.title}>{gameTitle}</Text>
                            <Text style={styles.subtitle}>{gameSubtitle}</Text>
                        </View>
                        <View style={styles.gameArea}>
                            <NumberMemory room={room} onComplete={handleMemoryGameComplete} />
                        </View>
                    </View>
                );
            default:
                return (
                    <View style={styles.errorContainer}>
                        <Text style={styles.error}>Unknown game type</Text>
                    </View>
                );
        }
    };

    if (!room) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>Room not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <RoomHeader room={room} onBack={onBack || onComplete} />

            {renderGameComponent()}

            <View style={styles.bottomSection}>
                {showHelperPanel && <HelperPanel room={room} />}

                <View style={styles.footer}>
                    <Text style={styles.instruction}>
                        {instruction ||
                            (selectedGameType
                                ? MEMORY_GAME_CONFIGS[selectedGameType].instruction
                                : 'Complete the memory challenge!')}
                    </Text>
                    {playerStats.lives <= 0 && <Text style={styles.gameOver}>Game Over - No lives remaining!</Text>}

                    {showCheatButton && selectedGameType === MemoryGameType.CLASSIC_PAIRS && (
                        <View style={styles.cheatContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.cheatButton,
                                    (playerStats.points < 50 || isPreviewing) && styles.cheatButtonDisabled
                                ]}
                                onPress={handleCheatPreview}
                                disabled={playerStats.points < 50 || isPreviewing}
                            >
                                <Text style={styles.cheatButtonText}>👁️ Cheat Preview (50 pts)</Text>
                            </TouchableOpacity>
                            {isPreviewing && <Text style={styles.previewText}>Previewing tiles...</Text>}
                        </View>
                    )}

                    {customFooter}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a'
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10
    },
    subtitle: {
        fontSize: 16,
        color: '#ccc',
        textAlign: 'center'
    },
    gameArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200, // Ensure minimum space for the game
        maxHeight: '70%' // Prevent game from taking too much space
    },
    bottomSection: {
        flexShrink: 0, // Don't shrink the bottom section
        backgroundColor: '#1a1a1a',
        marginBottom: 60 // Add space for debug panel
    },
    footer: {
        padding: 15,
        paddingBottom: 20, // Extra padding at bottom
        backgroundColor: '#2a2a2a',
        borderTopWidth: 1,
        borderTopColor: '#444'
    },
    instruction: {
        color: '#ccc',
        fontSize: 14,
        textAlign: 'center'
    },
    gameOver: {
        color: '#f44336',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10
    },
    error: {
        color: '#f44336',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 50
    },
    gameContainer: {
        flex: 1
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        color: '#ccc',
        fontSize: 16
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cheatContainer: {
        marginTop: 15,
        alignItems: 'center'
    },
    cheatButton: {
        backgroundColor: '#FF9800',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FF6F00'
    },
    cheatButtonDisabled: {
        backgroundColor: '#666',
        borderColor: '#444'
    },
    cheatButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold'
    },
    previewText: {
        color: '#FF9800',
        fontSize: 12,
        marginTop: 5,
        fontStyle: 'italic'
    }
});

export default MemoryGame;
