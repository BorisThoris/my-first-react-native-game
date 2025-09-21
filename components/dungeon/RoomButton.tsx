import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { getRoomStatus } from '../../utils/gameLogic';
import { Room } from '../../types/gameTypes';

interface RoomButtonProps {
    room: Room;
    availableRooms: Room[];
    onPress: (roomId: string) => void;
}

const RoomButton: React.FC<RoomButtonProps> = ({ room, availableRooms, onPress }) => {
    const status = getRoomStatus(room, availableRooms);
    const isAvailable = status === 'available' || status === 'completed-returnable';

    const getRoomIcon = (): string => {
        switch (room.type) {
            case 'memory-chamber':
                return '🧠';
            case 'boss':
                return '👹';
            case 'treasure':
                return '💰';
            case 'trap':
                return '⚠️';
            default:
                return '❓';
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                status === 'completed-locked' && styles.completedLocked,
                status === 'completed-returnable' && styles.completedReturnable,
                status === 'available' && styles.available,
                status === 'locked' && styles.locked
            ]}
            onPress={() => isAvailable && onPress(room.id)}
            disabled={!isAvailable}
        >
            <Text style={styles.icon}>{getRoomIcon()}</Text>
            <Text style={styles.type}>{room.type.replace('-', ' ').toUpperCase()}</Text>
            <Text style={styles.difficulty}>Difficulty: {room.difficulty}</Text>
            {status === 'completed-locked' && <Text style={styles.completedText}>✓</Text>}
            {status === 'completed-returnable' && <Text style={styles.returnableText}>↻</Text>}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: '30%',
        aspectRatio: 1,
        backgroundColor: '#333',
        borderRadius: 10,
        padding: 10,
        margin: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#555'
    },
    completedLocked: {
        backgroundColor: '#2a5a2a',
        borderColor: '#4CAF50',
        opacity: 0.7
    },
    completedReturnable: {
        backgroundColor: '#2a4a5a',
        borderColor: '#2196F3'
    },
    available: {
        backgroundColor: '#2a2a5a',
        borderColor: '#2196F3'
    },
    locked: {
        backgroundColor: '#5a2a2a',
        borderColor: '#f44336',
        opacity: 0.5
    },
    icon: {
        fontSize: 24,
        marginBottom: 5
    },
    type: {
        color: '#fff',
        fontSize: 10,
        textAlign: 'center',
        marginBottom: 2
    },
    difficulty: {
        color: '#ccc',
        fontSize: 8,
        textAlign: 'center'
    },
    completedText: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: 'bold',
        position: 'absolute',
        top: 5,
        right: 5
    },
    returnableText: {
        color: '#2196F3',
        fontSize: 16,
        fontWeight: 'bold',
        position: 'absolute',
        top: 5,
        right: 5
    }
});

export default RoomButton;

