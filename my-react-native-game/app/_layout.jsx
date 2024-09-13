// app/_layout.js
import { Slot } from 'expo-router';
import React from 'react';
import { GameProvider } from '../contexts/GameContext';
import { GlobalProvider } from '../contexts/GlobalStorage';

export default function Layout() {
    return (
        <GlobalProvider>
            <GameProvider>
                <Slot />
            </GameProvider>
        </GlobalProvider>
    );
}
