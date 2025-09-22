// app/_layout.tsx
import { Stack } from 'expo-router';
import { useMemo } from 'react';
import { Platform } from 'react-native';

export default function Layout() {
    const screenOptions = useMemo(
        () => ({
            headerShown: false,
            // Web-specific options
            ...(Platform.OS === 'web' && {
                presentation: 'card',
                animation: 'slide_from_right'
            })
        }),
        []
    );

    return (
        <Stack screenOptions={screenOptions}>
            <Stack.Screen name="index" />
            <Stack.Screen name="DungeonExplorer" />
        </Stack>
    );
}
