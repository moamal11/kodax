/**
 * شارة التوثيق بجانب اسم المستخدم — تظهر فقط عندما يمنحها المشرف (profiles.is_verified)
 */
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function VerifiedBadge({ verified, size = 14 }: { verified?: boolean | null; size?: number }) {
  if (!verified) return null;
  return (
    <Ionicons
      name="checkmark-circle"
      size={size}
      color="#3b82f6"
      accessibilityLabel="حساب موثّق"
      style={{ marginHorizontal: 3 }}
    />
  );
}
