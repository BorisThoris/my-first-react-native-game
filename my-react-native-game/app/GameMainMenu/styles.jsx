import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
        width: '60%'
    },
    container: {
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        flex: 1,
        justifyContent: 'center',
        padding: 20
    },
    greetingText: {
        color: '#333',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20
    },
    image: {
        borderRadius: 10,
        height: 200,
        marginVertical: 20,
        width: 200
    },
    imageContainer: {},
    noOptionText: {
        color: 'red',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20
    }
});

export default styles;
