import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#4CAF50',
        borderRadius: 10,
        paddingHorizontal: 25,
        paddingVertical: 15
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    noButton: {
        backgroundColor: 'red'
    }
});

export default function ButtonComponent({ isNoButton = false, onPress, text }) {
    const buttonStyle = useMemo(() => {
        return isNoButton ? [styles.button, styles.noButton] : styles.button;
    }, [isNoButton]);

    return (
        <TouchableOpacity style={buttonStyle} onPress={onPress}>
            <Text style={styles.buttonText}>{text}</Text>
        </TouchableOpacity>
    );
}
