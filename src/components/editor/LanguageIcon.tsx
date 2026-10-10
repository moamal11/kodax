import React from 'react';
import { MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/design';

const ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  python: 'language-python',
  web: 'web',
  javascript: 'language-javascript',
  typescript: 'language-typescript',
  cpp: 'language-cpp',
  c: 'language-c',
  java: 'language-java',
  csharp: 'language-csharp',
  go: 'language-go',
  rust: 'language-rust',
  sql: 'database',
  kotlin: 'language-kotlin',
  swift: 'language-swift',
  html: 'language-html5',
  css: 'language-css3',
  react: 'react',
  php: 'language-php',
};

/** The same recognizable language symbols in pickers, filters and the editor. */
export function LanguageIcon({ language, size = 24, color }: { language: string; size?: number; color?: string }) {
  const t = useTheme();
  const props = { size, color: color ?? t.colors.textSecondary, accessible: false };
  return language === 'dart' ? (
    <FontAwesome6 name="dart-lang" iconStyle="brand" {...props} />
  ) : (
    <MaterialCommunityIcons name={ICONS[language] ?? 'code-tags'} {...props} />
  );
}
