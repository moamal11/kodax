/**
 * CustomModal - مكون نافذة منبثقة احترافية
 * بديل عن Alert.alert بتصميم حديث
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
// BlurView removed - not used in JSX

const { width, height } = Dimensions.get('window');

export type ModalType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'achievement';

interface ModalButton {
  text: string;
  onPress: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

interface CustomModalProps {
  visible: boolean;
  type: ModalType;
  title: string;
  message: string;
  buttons?: ModalButton[];
  onClose?: () => void;
  xpReward?: number;
  pointsReward?: number;
  showConfetti?: boolean;
}

const modalConfig: Record<
  ModalType,
  { icon: string; colors: readonly [string, string]; iconColor: string }
> = {
  success: {
    icon: 'checkmark-circle',
    colors: ['#10b981', '#059669'] as const,
    iconColor: '#10b981',
  },
  error: {
    icon: 'close-circle',
    colors: ['#ef4444', '#dc2626'] as const,
    iconColor: '#ef4444',
  },
  warning: {
    icon: 'warning',
    colors: ['#f59e0b', '#d97706'] as const,
    iconColor: '#f59e0b',
  },
  info: {
    icon: 'information-circle',
    colors: ['#3b82f6', '#2563eb'] as const,
    iconColor: '#3b82f6',
  },
  achievement: {
    icon: 'trophy',
    colors: ['#8b5cf6', '#7c3aed'] as const,
    iconColor: '#fbbf24',
  },
};

export default function CustomModal({
  visible,
  type,
  title,
  message,
  buttons = [],
  onClose,
  xpReward,
  pointsReward,
  showConfetti = false,
}: CustomModalProps) {
  const config = modalConfig[type];

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          entering={SlideInDown.springify().duration(400)}
          exiting={SlideOutDown.springify()}
          style={styles.modalContainer}
        >
          <LinearGradient
            colors={['#1a1a3e', '#252550']}
            style={styles.modalContent}
          >
            {/* Icon Header */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[config.colors[0], config.colors[1]]}
                style={styles.iconGradient}
              >
                <Ionicons name={config.icon as any} size={40} color="#fff" />
              </LinearGradient>
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Rewards Section */}
            {(xpReward || pointsReward) && (
              <View style={styles.rewardsContainer}>
                {xpReward && xpReward > 0 && (
                  <View style={styles.rewardBadge}>
                    <Ionicons name="star" size={20} color="#fbbf24" />
                    <Text style={styles.rewardText}>+{xpReward} XP</Text>
                  </View>
                )}
                {pointsReward && pointsReward > 0 && (
                  <View
                    style={[
                      styles.rewardBadge,
                      { backgroundColor: '#a78bfa20' },
                    ]}
                  >
                    <Ionicons name="diamond" size={20} color="#a78bfa" />
                    <Text style={[styles.rewardText, { color: '#a78bfa' }]}>
                      +{pointsReward} نقطة
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    button.style === 'primary' && styles.buttonPrimary,
                    button.style === 'secondary' && styles.buttonSecondary,
                    button.style === 'danger' && styles.buttonDanger,
                    buttons.length === 1 && styles.buttonFull,
                  ]}
                  onPress={button.onPress}
                >
                  {button.style === 'primary' ? (
                    <LinearGradient
                      colors={[config.colors[0], config.colors[1]]}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.buttonTextPrimary}>
                        {button.text}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <Text
                      style={[
                        styles.buttonText,
                        button.style === 'danger' && styles.buttonTextDanger,
                      ]}
                    >
                      {button.text}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// مكون مساعد للتنبيهات السريعة
export function useCustomModal() {
  const [modalState, setModalState] = React.useState<{
    visible: boolean;
    type: ModalType;
    title: string;
    message: string;
    buttons: ModalButton[];
    xpReward?: number;
    pointsReward?: number;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    buttons: [],
  });

  const showModal = (config: {
    type: ModalType;
    title: string;
    message: string;
    buttons?: ModalButton[];
    xpReward?: number;
    pointsReward?: number;
  }) => {
    setModalState({
      visible: true,
      type: config.type,
      title: config.title,
      message: config.message,
      buttons: config.buttons || [
        { text: 'حسناً', onPress: () => hideModal(), style: 'primary' },
      ],
      xpReward: config.xpReward,
      pointsReward: config.pointsReward,
    });
  };

  const hideModal = () => {
    setModalState((prev) => ({ ...prev, visible: false }));
  };

  const ModalComponent = () => (
    <CustomModal
      visible={modalState.visible}
      type={modalState.type}
      title={modalState.title}
      message={modalState.message}
      buttons={modalState.buttons}
      xpReward={modalState.xpReward}
      pointsReward={modalState.pointsReward}
      onClose={hideModal}
    />
  );

  return { showModal, hideModal, ModalComponent };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 400,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  rewardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbbf2420',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonFull: {
    flex: 1,
  },
  buttonPrimary: {},
  buttonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 14,
  },
  buttonDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingVertical: 14,
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  buttonTextPrimary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  buttonTextDanger: {
    color: '#ef4444',
  },
});
