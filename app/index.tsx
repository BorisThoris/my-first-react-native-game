// app/index.tsx
import { Redirect } from 'expo-router';
import GameController from './DungeonExplorer/GameController';
import { Platform } from 'react-native';

export default function Index() {
    // For web, render the game directly to avoid routing issues
    if (Platform.OS === 'web') {
        return <GameController />;
    }

    // For mobile, use the redirect
    return <Redirect href="/DungeonExplorer" />;
}
