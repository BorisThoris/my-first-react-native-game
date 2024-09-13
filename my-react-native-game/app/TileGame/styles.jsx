import { StyleSheet } from 'react-native';

const TILE_MARGIN = 5;

const styles = StyleSheet.create({
    buttonContainer: {
        marginTop: 20
    },
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
    },
    cheaterText: {
        color: 'red',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    container: {
        alignItems: 'center',
        backgroundColor: '#f7f7f7',
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 20 // Prevents title clipping
    },
    flippedTile: {
        backgroundColor: '#FFD700'
    },
    grid: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    gridContainer: {
        alignItems: 'center',
        flex: 0.3, // Limits the grid container width
        justifyContent: 'center',
        width: '90%'
    },
    hiddenTile: {
        backgroundColor: '#6b8e23'
    },
    livesContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20
    },
    livesText: {
        color: '#ff3333',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
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
    },
    star: {
        color: '#FFD700',
        fontSize: 30,
        marginRight: 5
    },
    tile: {
        alignItems: 'center',
        borderColor: '#fff',
        borderRadius: 10,
        borderWidth: 2,
        elevation: 2,
        justifyContent: 'center',
        margin: TILE_MARGIN,
        shadowColor: '#000',
        shadowOffset: { height: 2, width: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 3
    },
    tileText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold'
    },
    title: {
        color: '#4CAF50',
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    }
});

export default styles;
