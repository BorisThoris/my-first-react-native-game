import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import useDungeonStore from '../../stores/dungeonStore';
import useGameStore from '../../stores/gameStore';

const DebugPanel: React.FC = () => {
    const {
        currentFloor,
        currentRoom,
        generateNewRun,
        completeRoom,
        advanceFloor,
        generateNextFloor,
        getCurrentFloor
    } = useDungeonStore();

    const {
        addPoints,
        updateStats,
        resetGame,
        completeRoom: completeGameRoom,
        flipTile,
        cheatPreview,
        addKeys,
        addBombs
    } = useGameStore();

    const handleBeatLevel = (): void => {
        if (currentRoom) {
            completeRoom(currentRoom.id);
        }
    };

    const handleGenerateNextFloor = (): void => {
        generateNextFloor();
    };

    const handleAddPoints = (): void => {
        addPoints(100);
    };

    const handleAddLives = (): void => {
        updateStats({ lives: 10 });
    };

    const handleAddKeys = (): void => {
        addKeys(5);
    };

    const handleAddBombs = (): void => {
        addBombs(5);
    };

    const handleResetGame = (): void => {
        resetGame();
        generateNewRun();
    };

    const handleCompleteAllTiles = (): void => {
        if (currentRoom) {
            // Simulate completing all tiles in current room
            const { tiles } = currentRoom;
            const pairs = Math.floor(tiles.length / 2);

            for (let i = 0; i < pairs; i++) {
                const tile1 = tiles[i * 2];
                const tile2 = tiles[i * 2 + 1];
                if (tile1 && tile2) {
                    flipTile(tile1.id);
                    flipTile(tile2.id);
                }
            }
        }
    };

    const handleCheatPreview = (): void => {
        cheatPreview();
    };

    const handleGenerateNewRoom = (): void => {
        // This would require adding a function to generate a single room
        console.log('Generate new room - not implemented yet');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🐛 DEBUG</Text>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.button} onPress={handleBeatLevel}>
                    <Text style={styles.buttonText}>BEAT</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleGenerateNextFloor}>
                    <Text style={styles.buttonText}>FLOOR</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleAddPoints}>
                    <Text style={styles.buttonText}>+100</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleAddLives}>
                    <Text style={styles.buttonText}>+10</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleAddKeys}>
                    <Text style={styles.buttonText}>+5🔑</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleAddBombs}>
                    <Text style={styles.buttonText}>+5💣</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleCompleteAllTiles}>
                    <Text style={styles.buttonText}>ALL</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleCheatPreview}>
                    <Text style={styles.buttonText}>PREVIEW</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleResetGame}>
                    <Text style={styles.buttonText}>RESET</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.info}>
                <Text style={styles.infoText}>F:{currentFloor}</Text>
                <Text style={styles.infoText}>R:{currentRoom?.type || 'None'}</Text>
                <Text style={styles.infoText}>G:{currentRoom?.gridSize || 'N/A'}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderTopWidth: 2,
        borderTopColor: '#ff6b6b',
        zIndex: 1000,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    title: {
        color: '#ff6b6b',
        fontSize: 10,
        fontWeight: 'bold',
        marginRight: 10
    },
    buttonRow: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-around'
    },
    button: {
        backgroundColor: '#333',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: '#555',
        marginHorizontal: 1
    },
    buttonText: {
        color: '#fff',
        fontSize: 8,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    info: {
        flexDirection: 'row',
        marginLeft: 10
    },
    infoText: {
        color: '#ccc',
        fontSize: 8,
        marginLeft: 8
    }
});

export default DebugPanel;
