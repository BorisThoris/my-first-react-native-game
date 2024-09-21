import { StyleSheet } from 'react-native';

const shakeContainerStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: '#f7f7f7',
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 20 // Prevents title clipping
    }
});

export default shakeContainerStyles;
