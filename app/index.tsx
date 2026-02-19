import { Redirect } from 'expo-router';

export default function Index() {
  // This will redirect to the auth check in _layout.tsx
  return <Redirect href="/(auth)/login" />;
}
