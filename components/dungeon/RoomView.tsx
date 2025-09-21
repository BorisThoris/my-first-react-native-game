import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import RoomHeader from './RoomHeader';
import TileGrid from '../memory/TileGrid';
import { useRoomState } from '../../hooks/useRoomState';
import useGameStore from '../../stores/gameStore';
import { Room } from '../../types/gameTypes';

interface RoomViewProps {
    room: Room;
    onBack: () => void;
}

const RoomView: React.FC<RoomViewProps> = ({ room, onBack }) => {
    const { loadRoom, saveRoom, isCompleted } = useRoomState(room);
    const { playerStats } = useGameStore();

    useEffect(() => {
        loadRoom();
    }, [loadRoom]);

    const handleBackPress = (): void => {
        if (isCompleted()) {
            saveRoom();
            onBack();
        } else if (room.returnable) {
            saveRoom();
            onBack();
        } else {
            Alert.alert('Leave Room', 'Are you sure you want to leave? Progress will be lost.', [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Leave',
                    onPress: () => {
                        saveRoom();
                        onBack();
                    }
                }
            ]);
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
            <RoomHeader room={room} onBack={handleBackPress} />

            <View style={styles.gameArea}>
                <TileGrid room={room} />
            </View>

            <View style={styles.footer}>
                <Text style={styles.instruction}>Find matching pairs to clear the room!</Text>
                {playerStats.lives <= 0 && <Text style={styles.gameOver}>Game Over - No lives remaining!</Text>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a'
    },
    gameArea: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    footer: {
        padding: 15,
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
    }
});

export default RoomView;
