import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface XPGainAnimationProps {
  amount: number;
  onComplete?: () => void;
}

const { width } = Dimensions.get('window');

export function XPGainAnimation({ amount, onComplete }: XPGainAnimationProps) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Scale in
    scale.value = withSpring(1, { damping: 10 });
    opacity.value = withTiming(1, { duration: 200 });

    // Float up and fade out
    translateY.value = withSequence(
      withTiming(-100, { duration: 1500 }),
      withTiming(-150, { duration: 300 }, () => {
        opacity.value = withTiming(0, { duration: 200 }, () => {
          if (onComplete) {
            runOnJS(onComplete)();
          }
        });
      }),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient
        colors={['#7c3aed', '#ec4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.badge}
      >
        <Text style={styles.text}>+{amount} XP</Text>
        <View style={styles.particles}>
          {[...Array(5)].map((_, i) => (
            <Particle key={i} index={i} />
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function Particle({ index }: { index: number }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    const angle = (index / 5) * Math.PI * 2;
    const distance = 30 + Math.random() * 20;

    translateX.value = withTiming(Math.cos(angle) * distance, { duration: 800 });
    translateY.value = withTiming(Math.sin(angle) * distance, { duration: 800 });
    opacity.value = withTiming(0, { duration: 800 });
    scale.value = withSequence(
      withTiming(1.5, { duration: 200 }),
      withTiming(0, { duration: 600 }),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.particle, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: width / 2,
    zIndex: 1000,
    marginLeft: -50,
    marginTop: -25,
  },
  badge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  particles: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
