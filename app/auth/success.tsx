import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Auth Success Screen
 *
 * This is a placeholder screen that handles the kodax://auth/success deep link
 * The actual authentication is handled by the deep link listener in _layout.tsx
 * This screen just shows a loading state while the listener processes the tokens
 */
export default function AuthSuccessScreen() {
  const router = useRouter();

  useEffect(() => {
    // Give the deep link listener time to process
    // Then navigate to home (if not already navigated by auth listener)
    const timeout = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <LinearGradient
      colors={['#0a0a1a', '#0f0f2e', '#0a0a1a']}
      style={styles.container}
    >
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#818cf8" />
        <Text style={styles.text}>تم تسجيل الدخول بنجاح</Text>
        <Text style={styles.subtext}>جاري تحميل حسابك...</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e2e8f0',
    marginTop: 16,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 14,
    color: '#6b7280',
  },
});
