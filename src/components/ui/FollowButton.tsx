/**
 * FollowButton - زر المتابعة / إلغاء المتابعة
 * يُستخدم في صفحة الأكواد وملفات المستخدمين
 */
import React, { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Button } from '@/design';
import { toggleFollow } from '@/services/followService';

interface FollowButtonProps {
  currentUserId: string;
  targetUserId: string;
  isFollowing: boolean;
  onToggle: (isNowFollowing: boolean) => void;
  compact?: boolean;
  full?: boolean;
}

export default function FollowButton({ currentUserId, targetUserId, isFollowing, onToggle, compact = false, full }: FollowButtonProps) {
  const [loading, setLoading] = useState(false);
  const press = useCallback(async () => {
    if (currentUserId === targetUserId) return;
    setLoading(true);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    const result = await toggleFollow(currentUserId, targetUserId);
    setLoading(false);
    if (!result.error) onToggle(result.isFollowing);
  }, [currentUserId, targetUserId, onToggle]);
  if (currentUserId === targetUserId) return null;
  return (
    <Button
      label={isFollowing ? 'تتابعه' : 'متابعة'}
      icon={isFollowing ? 'checkmark' : 'person-add-outline'}
      variant={isFollowing ? 'secondary' : 'primary'}
      size={compact ? 'sm' : 'md'}
      onPress={press}
      loading={loading}
      full={full}
      accessibilityLabel={isFollowing ? 'إلغاء المتابعة' : 'متابعة'}
      accessibilityHint={isFollowing ? 'أنت تتابع هذا العضو؛ اضغط لإلغاء المتابعة' : undefined}
    />
  );
}
