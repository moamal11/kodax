/**
 * EditorToolbar.tsx
 *
 * Description: Code editor action buttons toolbar
 * Features: Run, save, share, AI review, format, settings buttons with icons
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface EditorToolbarProps {
  onRun?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onAIReview?: () => void;
  onFormat?: () => void;
  onSettings?: () => void;
  isRunning?: boolean;
}

export function EditorToolbar({
  onRun,
  onSave,
  onShare,
  onAIReview,
  onFormat,
  onSettings,
  isRunning = false,
}: EditorToolbarProps) {
  return (
    <View style={styles.container}>
      {/* Run Button */}
      <TouchableOpacity
        onPress={onRun}
        disabled={isRunning}
        style={styles.primaryButton}
      >
        <LinearGradient
          colors={
            (isRunning ? ['#6b7280', '#4b5563'] : ['#8b5cf6', '#a855f7']) as [
              string,
              string,
              ...string[],
            ]
          }
          style={styles.gradient}
        >
          <MaterialIcons
            name={isRunning ? 'hourglass-empty' : 'play-arrow'}
            size={20}
            color="#ffffff"
          />
          <Text style={styles.primaryButtonText}>
            {isRunning ? 'Running...' : 'Run'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Secondary Actions */}
      <View style={styles.secondaryActions}>
        <ToolbarButton icon="save" onPress={onSave} tooltip="Save" />
        <ToolbarButton icon="share" onPress={onShare} tooltip="Share" />
        <ToolbarButton
          icon="auto-fix-high"
          onPress={onAIReview}
          tooltip="AI Review"
        />
        <ToolbarButton icon="code" onPress={onFormat} tooltip="Format" />
        <ToolbarButton
          icon="settings"
          onPress={onSettings}
          tooltip="Settings"
        />
      </View>
    </View>
  );
}

const ToolbarButton = ({
  icon,
  onPress,
  tooltip,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
  tooltip: string;
}) => (
  <TouchableOpacity style={styles.toolbarButton} onPress={onPress}>
    <MaterialIcons name={icon} size={20} color="#9ca3af" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  primaryButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  toolbarButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
