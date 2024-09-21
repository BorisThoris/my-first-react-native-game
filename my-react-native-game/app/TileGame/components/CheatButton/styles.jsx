import { StyleSheet } from 'react-native';

const cheatButtonStyles = StyleSheet.create({
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    cheatButton: {
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        borderRadius: 10,
        elevation: 2,
        justifyContent: 'center',
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { height: 2, width: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 3
    }
});

export default cheatButtonStyles;
