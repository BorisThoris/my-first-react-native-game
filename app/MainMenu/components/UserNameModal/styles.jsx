import { StyleSheet } from 'react-native';

// Instead of using useMemo, we define static styles with StyleSheet.create
const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
        justifyContent: 'center'
    },
    input: {
        borderColor: 'gray',
        borderWidth: 1,
        marginVertical: 10,
        padding: 8,
        width: '100%'
    },
    modal: {
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '80%'
    }
});

export default styles;
