/**
 * FilterDropdown Component
 * مكون dropdown متعدد الاستخدامات للفلاتر مع دعم Web + Mobile
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface FilterOption {
  id: string;
  label: string;
  icon: string;
  color?: string;
}

interface FilterDropdownProps {
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: string;
}

export function FilterDropdown({
  value,
  options,
  onChange,
  placeholder = 'اختر',
  icon = 'funnel-outline',
}: FilterDropdownProps) {
  const [showModal, setShowModal] = useState(false);

  const selectedOption = options.find((opt) => opt.id === value);
  const displayLabel = selectedOption?.label || placeholder;

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setShowModal(false);
  };

  return (
    <>
      {/* Dropdown Button */}
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
        style={styles.dropdownButton}
      >
        <LinearGradient
          colors={['#1e293b', '#0f172a']}
          style={styles.dropdownGradient}
        >
          <Ionicons name={icon as any} size={16} color="#8b5cf6" />
          <Text style={styles.dropdownText} numberOfLines={1}>
            {displayLabel || 'اختر'}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color="#64748b"
            style={styles.dropdownIcon}
          />
        </LinearGradient>
      </TouchableOpacity>

      {/* Options Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowModal(false)}
        >
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.modalContent}
          >
            <LinearGradient
              colors={['#1e293b', '#0f172a']}
              style={styles.modalGradient}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{placeholder}</Text>
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Options List */}
              <ScrollView
                style={styles.optionsList}
                showsVerticalScrollIndicator={false}
              >
                {options.map((option, index) => {
                  const isSelected = option.id === value;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      onPress={() => handleSelect(option.id)}
                      style={[
                        styles.optionItem,
                        index === options.length - 1 && styles.lastOption,
                        isSelected && styles.selectedOption,
                      ]}
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionContent}>
                        <Ionicons
                          name={option.icon as any}
                          size={20}
                          color={option.color || '#8b5cf6'}
                        />
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.selectedText,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#8b5cf6"
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </LinearGradient>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dropdownButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  dropdownGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
  },
  dropdownText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownIcon: {
    marginLeft: 'auto',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  modalGradient: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  modalTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '700',
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    marginBottom: 8,
  },
  lastOption: {
    marginBottom: 0,
  },
  selectedOption: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionText: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '500',
  },
  selectedText: {
    color: '#e2e8f0',
    fontWeight: '600',
  },
});

export default FilterDropdown;
