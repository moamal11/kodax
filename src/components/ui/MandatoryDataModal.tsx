/**
 * MandatoryDataModal - مربع حوار البيانات الإجبارية
 * يظهر مرة واحدة بعد التسجيل لإدخال الاسم والمحافظة والجنس
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { saveMandatoryData, IRAQ_PROVINCES } from '@/services/profileService';

interface MandatoryDataModalProps {
  visible: boolean;
  userId: string;
  onComplete: () => void;
}

export default function MandatoryDataModal({
  visible,
  userId,
  onComplete,
}: MandatoryDataModalProps) {
  const [fullName, setFullName] = useState('');
  const [province, setProvince] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [showProvinceList, setShowProvinceList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isValid =
    fullName.trim().length >= 3 && province !== '' && gender !== '';

  const handleSave = useCallback(async () => {
    if (!isValid) {
      setError('يرجى إكمال جميع الحقول');
      return;
    }

    setSaving(true);
    setError('');

    const result = await saveMandatoryData(userId, {
      full_name: fullName.trim(),
      province,
      gender,
    });

    setSaving(false);

    if (result.success) {
      onComplete();
    } else {
      setError(result.error || 'حدث خطأ أثناء الحفظ');
    }
  }, [isValid, fullName, province, gender, userId, onComplete]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            entering={FadeIn.duration(300)}
            style={styles.backdrop}
          />

          <Animated.View
            entering={FadeInDown.delay(150).springify()}
            style={styles.modalContainer}
          >
            <LinearGradient
              colors={['#1e1e3a', '#151530', '#0f0f1e']}
              style={styles.modalGradient}
            >
              {/* Header */}
              <View style={styles.header}>
                <LinearGradient
                  colors={['#7c3aed', '#3b82f6']}
                  style={styles.iconContainer}
                >
                  <Ionicons name="person-add" size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.title}>أكمل بياناتك</Text>
                <Text style={styles.subtitle}>
                  يرجى إدخال بياناتك لاستخدام التطبيق
                </Text>
              </View>

              {/* Full Name */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  <Ionicons name="person" size={14} color="#9ca3af" /> الاسم
                  الكامل
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    Platform.OS === 'web' && ({ outline: 'none' } as any),
                  ]}
                  placeholder="أدخل اسمك الكامل"
                  placeholderTextColor="#4b5563"
                  value={fullName}
                  onChangeText={setFullName}
                  autoFocus
                />
              </View>

              {/* Province */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  <Ionicons name="location" size={14} color="#9ca3af" />{' '}
                  المحافظة
                </Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setShowProvinceList(!showProvinceList)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.selectButtonText,
                      !province && styles.selectButtonPlaceholder,
                    ]}
                  >
                    {province || 'اختر محافظتك'}
                  </Text>
                  <Ionicons
                    name={showProvinceList ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#9ca3af"
                  />
                </TouchableOpacity>

                {showProvinceList && (
                  <Animated.View
                    entering={FadeInDown.duration(200)}
                    style={styles.provinceList}
                  >
                    <ScrollView
                      style={styles.provinceScroll}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator
                    >
                      {IRAQ_PROVINCES.map((prov) => (
                        <TouchableOpacity
                          key={prov}
                          style={[
                            styles.provinceItem,
                            province === prov && styles.provinceItemSelected,
                          ]}
                          onPress={() => {
                            setProvince(prov);
                            setShowProvinceList(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.provinceItemText,
                              province === prov &&
                                styles.provinceItemTextSelected,
                            ]}
                          >
                            {prov}
                          </Text>
                          {province === prov && (
                            <Ionicons
                              name="checkmark"
                              size={18}
                              color="#7c3aed"
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </Animated.View>
                )}
              </View>

              {/* Gender */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  <Ionicons name="male-female" size={14} color="#9ca3af" />{' '}
                  الجنس
                </Text>
                <View style={styles.genderRow}>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      gender === 'male' && styles.genderButtonSelected,
                    ]}
                    onPress={() => setGender('male')}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="male"
                      size={20}
                      color={gender === 'male' ? '#7c3aed' : '#6b7280'}
                    />
                    <Text
                      style={[
                        styles.genderText,
                        gender === 'male' && styles.genderTextSelected,
                      ]}
                    >
                      ذكر
                    </Text>
                    {gender === 'male' && (
                      <View style={styles.radioSelected}>
                        <View style={styles.radioInner} />
                      </View>
                    )}
                    {gender !== 'male' && (
                      <View style={styles.radioUnselected} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      gender === 'female' && styles.genderButtonSelected,
                    ]}
                    onPress={() => setGender('female')}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="female"
                      size={20}
                      color={gender === 'female' ? '#ec4899' : '#6b7280'}
                    />
                    <Text
                      style={[
                        styles.genderText,
                        gender === 'female' && styles.genderTextSelected,
                      ]}
                    >
                      أنثى
                    </Text>
                    {gender === 'female' && (
                      <View
                        style={[
                          styles.radioSelected,
                          { borderColor: '#ec4899' },
                        ]}
                      >
                        <View
                          style={[
                            styles.radioInner,
                            { backgroundColor: '#ec4899' },
                          ]}
                        />
                      </View>
                    )}
                    {gender !== 'female' && (
                      <View style={styles.radioUnselected} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Save Button */}
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  !isValid && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={!isValid || saving}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    isValid ? ['#7c3aed', '#3b82f6'] : ['#374151', '#374151']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#fff"
                      />
                      <Text style={styles.saveButtonText}>حفظ البيانات</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
  modalGradient: {
    padding: 28,
    borderRadius: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
    textAlign: 'right',
  },
  selectButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  selectButtonPlaceholder: {
    color: '#4b5563',
  },
  provinceList: {
    backgroundColor: 'rgba(15, 15, 30, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    marginTop: 8,
    overflow: 'hidden',
  },
  provinceScroll: {
    maxHeight: 200,
  },
  provinceItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  provinceItemSelected: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  provinceItemText: {
    fontSize: 15,
    color: '#d1d5db',
  },
  provinceItemTextSelected: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  genderButtonSelected: {
    borderColor: 'rgba(124, 58, 237, 0.5)',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  genderText: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '600',
  },
  genderTextSelected: {
    color: '#fff',
  },
  radioUnselected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4b5563',
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7c3aed',
  },
  errorContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    flex: 1,
    textAlign: 'right',
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
