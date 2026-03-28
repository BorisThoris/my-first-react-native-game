// app/index.tsx
import { Link } from 'expo-router';
import GameController from './DungeonExplorer/GameController';
import { Platform, View, Text, Pressable } from 'react-native';

export default function Index() {
    // For web, keep the game visible and add a small overlay button to the Three.js demo
    if (Platform.OS === 'web') {
        return (
            <View style={{ flex: 1 }}>
                <GameController />
                <View
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        borderRadius: 8,
                        paddingVertical: 8,
                        paddingHorizontal: 12
                    }}
                >
                    <Link href="/three" asChild>
                        <Pressable>
                            <Text style={{ color: '#fff' }}>Open Three.js Demo</Text>
                        </Pressable>
                    </Link>
                </View>
            </View>
        );
    }

    // On native, show a simple menu with buttons
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <Link href="/DungeonExplorer" asChild>
                <Pressable
                    style={{
                        backgroundColor: '#1e293b',
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        borderRadius: 10
                    }}
                >
                    <Text style={{ color: '#fff', fontSize: 16 }}>Play Dungeon Explorer</Text>
                </Pressable>
            </Link>
            <Link href="/three" asChild>
                <Pressable
                    style={{
                        backgroundColor: '#334155',
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        borderRadius: 10
                    }}
                >
                    <Text style={{ color: '#fff', fontSize: 16 }}>Open Three.js Demo</Text>
                </Pressable>
            </Link>
        </View>
    );
}
