import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: '#f0f0f5',
        flex: 1,
        justifyContent: 'center',
        padding: 20
    },
    subtitle: {
        color: '#666',
        fontSize: 16,
        marginBottom: 32,
        textAlign: 'center'
    },
    title: {
        color: '#333',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16
    }
});

const HomeScreen = () => {
    const router = useRouter();

    const navigateToGameMenu = useCallback(() => router.push('/GameMainMenu'), [router]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Navigation Test Screen</Text>
            <Text style={styles.subtitle}>This is a test for navigating between screens.</Text>
            <Button title="Go to our game" onPress={navigateToGameMenu} color="#6200ea" />
        </View>
    );
};

export default HomeScreen;
