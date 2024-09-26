import { StyleSheet } from 'react-native';

const tileStyles = StyleSheet.create({
    flippedTile: {
        backgroundColor: '#FFD700'
    },
    hiddenTile: {
        backgroundColor: '#6b8e23'
    },
    tile: {
        alignSelf: 'center',
        backgroundColor: 'purple',
        borderColor: 'white',
        borderRadius: 10,
        borderWidth: 2
    },

    tileText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold'
    }
});

export default tileStyles;
