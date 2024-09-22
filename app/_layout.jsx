// app/_layout.js
import { Stack } from 'expo-router';
import React, { useMemo } from 'react';
import { GameProvider } from '../contexts/GameContext';
import { GlobalProvider } from '../contexts/GlobalStorage';

export default function Layout() {
    const screenOptions = useMemo(
        () => ({
            headerShown: false
        }),
        []
    );

    return (
        <GlobalProvider>
            <GameProvider>
                <Stack initialRouteName="GameMainMenu/index" screenOptions={screenOptions}>
                    <Stack.Screen name="GameMainMenu/index" options={{ title: 'Game Menu' }} />
                    <Stack.Screen name="TileGame/index" options={{ title: 'Tile Game' }} />
                </Stack>
            </GameProvider>
        </GlobalProvider>
    );
}
