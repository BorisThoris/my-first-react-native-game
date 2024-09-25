// app/_layout.js
import { Stack } from 'expo-router';
import React, { useMemo } from 'react';
import { GameProvider } from '../contexts/GameContext';
import { GlobalProvider } from '../contexts/GlobalStorage';

// export const unstable_settings = {
//     // Ensure any route can link back to `/`
//     initialRouteName: 'GameMainMenu/index'
// };

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
                <Stack screenOptions={screenOptions} />
            </GameProvider>
        </GlobalProvider>
    );
}
