// app/index.jsx
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function Index() {
    const router = useRouter();

    const onNavigateToMenu = useCallback(() => router.push('/MainMenu'), [router]);
    const onNavigateToFastestTapper = useCallback(() => router.push('/FastestTapperGame'), [router]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Добре дошли! Нека започнем</Text>
            <Button title="Secret Game (Do not press!)" onPress={onNavigateToMenu} />
            <Button title="Fastest Tapper" onPress={onNavigateToFastestTapper} style={styles.button} />
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        marginTop: 20
    },
    container: {
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        flex: 1,
        justifyContent: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20
    }
});
