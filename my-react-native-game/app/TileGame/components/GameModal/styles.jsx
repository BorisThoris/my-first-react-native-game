import { StyleSheet } from 'react-native';

const modalStyles = StyleSheet.create({
    modalButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 5,
        padding: 10
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    modalContainer: {
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        flex: 1,
        justifyContent: 'center'
    },
    modalText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center'
    },
    modalView: {
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        elevation: 5,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            height: 2,
            width: 0
        },
        shadowOpacity: 0.25,
        shadowRadius: 4
    }
});

export default modalStyles;
