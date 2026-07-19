import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard', headerLeft: () => null }} />
      <Stack.Screen name="upload" options={{ title: 'Upload Report', presentation: 'modal' }} />
      <Stack.Screen name="report/[id]/index" options={{ title: 'Report Details' }} />
      <Stack.Screen name="report/[id]/chat" options={{ title: 'AI Assistant' }} />
    </Stack>
  );
}