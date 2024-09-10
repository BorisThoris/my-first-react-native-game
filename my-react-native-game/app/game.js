import React from 'react'
import { Button, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function GameScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>This is the Game Screen</Text>
      <Button title="Go Back" onPress={() => router.back()} />
    </View>
  );
}