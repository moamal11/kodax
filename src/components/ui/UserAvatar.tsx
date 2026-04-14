/**
 * UserAvatar.tsx
 * مكون الصورة الشخصية - Reusable Avatar Component
 * يعرض avatar_url أو أول حرف من الاسم، قابل للضغط لفتح الملف الشخصي
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

interface UserAvatarProps {
  userId?: string;
  avatarUrl?: string | null;
  name: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  color?: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

const SIZES = {
  small: 32,
  medium: 40,
  large: 48,
  xlarge: 80,
};

const FONT_SIZES = {
  small: 14,
  medium: 16,
  large: 20,
  xlarge: 32,
};

export default function UserAvatar({
  userId,
  avatarUrl,
  name,
  size = 'medium',
  color = '#7c3aed',
  onPress,
  disabled = false,
  style,
}: UserAvatarProps) {
  const initial = (name || '؟').charAt(0).toUpperCase();
  const avatarSize = SIZES[size];
  const fontSize = FONT_SIZES[size];

  const handlePress = () => {
    if (disabled) return;
    if (onPress) {
      onPress();
    } else if (userId) {
      router.push(`/user/${userId}` as any);
    }
  };

  const avatarContent = avatarUrl ? (
    <Image
      source={{ uri: avatarUrl }}
      style={[
        styles.image,
        { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
      ]}
      resizeMode="cover"
    />
  ) : (
    <LinearGradient
      colors={[color, color + '99']}
      style={[
        styles.gradient,
        { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
      ]}
    >
      <Text style={[styles.initial, { fontSize }]}>{initial}</Text>
    </LinearGradient>
  );

  if (disabled || (!onPress && !userId)) {
    return <View style={style}>{avatarContent}</View>;
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={style}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
    >
      {avatarContent}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#1e1e4a',
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    color: '#fff',
    fontWeight: '700',
  },
});
