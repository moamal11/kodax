/**
 * Tooltip.tsx
 * 
 * Description: Interactive tooltip with position awareness and fade animations
 * Features: Position aware (top, bottom, left, right), arrow indicator, fade in/out, touch outside to close
 * Props: {content} - Tooltip text, {position} - Tooltip position, {children} - Trigger element
 * 
 * @example
 * <Tooltip content="This is a tooltip" position="top">
 *   <Button>Hover Me</Button>
 * </Tooltip>
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Types
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: string | React.ReactNode;
  position?: TooltipPosition;
  children: React.ReactElement;
  backgroundColor?: string;
  textColor?: string;
  maxWidth?: number;
}

export function Tooltip({
  content,
  position = 'top',
  children,
  backgroundColor = '#1a1a2e',
  textColor = '#ffffff',
  maxWidth = 250,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [tooltipLayout, setTooltipLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });
  
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const translateY = useSharedValue(position === 'top' ? 10 : -10);

  const handlePress = () => {
    setVisible(true);
    
    opacity.value = withTiming(1, { duration: 200 });
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handleClose = () => {
    opacity.value = withTiming(0, { duration: 150 });
    scale.value = withTiming(0.95, { duration: 150 });
    translateY.value = withTiming(position === 'top' ? 10 : -10, { duration: 150 });
    
    setTimeout(() => setVisible(false), 150);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const getTooltipStyle = () => {
    const base = {
      maxWidth,
    };

    switch (position) {
      case 'top':
        return {
          ...base,
          bottom: tooltipLayout.height + 12,
          left: -maxWidth / 2 + tooltipLayout.width / 2,
        };
      case 'bottom':
        return {
          ...base,
          top: tooltipLayout.height + 12,
          left: -maxWidth / 2 + tooltipLayout.width / 2,
        };
      case 'left':
        return {
          ...base,
          right: tooltipLayout.width + 12,
          top: -tooltipLayout.height / 2,
        };
      case 'right':
        return {
          ...base,
          left: tooltipLayout.width + 12,
          top: -tooltipLayout.height / 2,
        };
      default:
        return base;
    }
  };

  const getArrowStyle = (): any => {
    const base = {
      position: 'absolute' as const,
      width: 0,
      height: 0,
      borderStyle: 'solid' as const,
    };

    const arrowSize = 6;

    switch (position) {
      case 'top':
        return {
          ...base,
          bottom: -arrowSize,
          left: '50%',
          marginLeft: -arrowSize,
          borderLeftWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderTopWidth: arrowSize,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: backgroundColor,
        };
      case 'bottom':
        return {
          ...base,
          top: -arrowSize,
          left: '50%',
          marginLeft: -arrowSize,
          borderLeftWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: backgroundColor,
        };
      case 'left':
        return {
          ...base,
          right: -arrowSize,
          top: '50%',
          marginTop: -arrowSize,
          borderTopWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderLeftWidth: arrowSize,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: backgroundColor,
        };
      case 'right':
        return {
          ...base,
          left: -arrowSize,
          top: '50%',
          marginTop: -arrowSize,
          borderTopWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRightColor: backgroundColor,
        };
    }
  };

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        const { width, height, x, y } = event.nativeEvent.layout;
        setTooltipLayout({ width, height, x, y });
      }}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>

      {visible && (
        <Modal
          transparent
          visible={visible}
          onRequestClose={handleClose}
          animationType="none"
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={handleClose}
          >
            <View
              style={[
                styles.tooltipWrapper,
                {
                  top: tooltipLayout.y,
                  left: tooltipLayout.x,
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.tooltipContainer,
                  {
                    backgroundColor,
                  },
                  getTooltipStyle(),
                  animatedStyle,
                ]}
              >
                {/* Arrow */}
                <View style={getArrowStyle()} />

                {/* Content */}
                {typeof content === 'string' ? (
                  <Text style={[styles.tooltipText, { color: textColor }]}>
                    {content}
                  </Text>
                ) : (
                  content
                )}
              </Animated.View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  tooltipWrapper: {
    position: 'absolute',
  },
  tooltipContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  tooltipText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
