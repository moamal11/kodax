import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0f0f1e' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="login" />
    </Stack>
  );
}
