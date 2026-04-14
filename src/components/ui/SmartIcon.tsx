import React from 'react';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// أسماء الأيقونات اللي تنتمي لـ MaterialIcons
const MATERIAL_ICONS = new Set([
  'code',
  'calculate',
  'swap-horiz',
  'functions',
  'timeline',
  'sort',
  'search',
  'check-circle',
  'rotate-right',
  'text-format',
  'format-list-bulleted',
  'blur-on',
  'view-column',
  'grid-on',
  'devices',
  'text-fields',
  'touch-app',
  'credit-card',
  'menu',
  'refresh',
  'brightness-4',
  'format-list-numbered',
  'check-box',
  'account-tree',
  'arrow-upward',
  'grid-view',
  'link',
  'layers',
  'queue',
  'security',
  'vpn-key',
  'filter-list',
  'how-to-reg',
  'group',
  'timer',
  'content-copy',
  'person',
  'color-lens',
  'visibility',
  'list',
  'edit',
  'person-add',
  'dark-mode',
  'storage',
]);

interface SmartIconProps {
  name: string;
  size?: number;
  color?: string;
}

/**
 * أيقونة ذكية تختار تلقائياً بين Ionicons و MaterialIcons
 * حسب اسم الأيقونة
 */
export function SmartIcon({ name, size = 24, color = '#fff' }: SmartIconProps) {
  if (MATERIAL_ICONS.has(name)) {
    return <MaterialIcons name={name as any} size={size} color={color} />;
  }
  return <Ionicons name={name as any} size={size} color={color} />;
}
