import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../ui/Button';
import { Room } from '../../types/gameTypes';

interface RoomHeaderProps {
    room: Room;
    onBack: () => void;
}

const RoomHeader: React.FC<RoomHeaderProps> = ({ room, onBack }) => {
    return (
        <View style={styles.container}>
            <Button title="← Back" onPress={onBack} style={styles.backButton} textStyle={styles.backButtonText} />

            <View style={styles.roomInfo}>
                <Text style={styles.title}>
                    {room.type.replace('-', ' ').toUpperCase()}
                    {room.returnable && <Text style={styles.returnableIndicator}> ↻</Text>}
                </Text>
                <Text style={styles.difficulty}>Difficulty: {room.difficulty}</Text>
                {room.returnable && <Text style={styles.returnableHint}>This room can be revisited</Text>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#2a2a2a',
        borderBottomWidth: 1,
        borderBottomColor: '#444'
    },
    backButton: {
        backgroundColor: '#444',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
        marginRight: 15
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16
    },
    roomInfo: {
        flex: 1
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    difficulty: {
        color: '#ccc',
        fontSize: 14
    },
    returnableIndicator: {
        color: '#2196F3',
        fontSize: 16
    },
    returnableHint: {
        color: '#2196F3',
        fontSize: 12,
        fontStyle: 'italic'
    }
});

export default RoomHeader;

