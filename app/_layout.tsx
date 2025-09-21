// app/_layout.tsx
import { Stack } from 'expo-router';
import { useMemo } from 'react';

export default function Layout() {
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
    }),
    []
  );

  return <Stack screenOptions={screenOptions} />;
}
