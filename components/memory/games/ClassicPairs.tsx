import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Room } from '../../../types/gameTypes';
import TileGrid from '../TileGrid';

interface ClassicPairsProps {
    room: Room;
    onComplete: () => void;
}

const ClassicPairs: React.FC<ClassicPairsProps> = ({ room, onComplete }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.instruction}>Find matching pairs to clear the room!</Text>
            <TileGrid room={room} onRoomComplete={onComplete} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    instruction: {
        color: '#ccc',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20
    }
});

export default ClassicPairs;
