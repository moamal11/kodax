/**
 * ProfileEditModal - مربع حوار تعديل الملف الشخصي
 * تعديل الصورة، الاسم الكامل، اسم المستخدم، كلمة المرور
 */

import React, { useState, useCallback, useEffect } from 'react';
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
  Image,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import {
  ProfileData,
  updateProfile,
  canChangeUsername,
  isUsernameAvailable,
  updatePassword,
  pickImage,
  uploadAvatar,
  IRAQ_PROVINCES,
} from '@/services/profileService';

interface ProfileEditModalProps {
  visible: boolean;
  profile: ProfileData | null;
  onClose: () => void;
  onSave: () => void;
}

export default function ProfileEditModal({
  visible,
  profile,
  onClose,
  onSave,
}: ProfileEditModalProps) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = width >= 768;

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [canEditUsername, setCanEditUsername] = useState(true);
  const [usernameDaysRemaining, setUsernameDaysRemaining] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');

  // تحميل البيانات الحالية
  useEffect(() => {
    if (profile && visible) {
      setFullName(profile.full_name || '');
      setUsername(profile.username || '');
      setAvatarPreview(profile.avatar_url);
      setAvatarUri(null);
      setPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
      setActiveTab('info');

      // التحقق من إمكانية تغيير اسم المستخدم
      canChangeUsername(profile.id).then(({ canChange, daysRemaining }) => {
        setCanEditUsername(canChange);
        setUsernameDaysRemaining(daysRemaining);
      });
    }
  }, [profile, visible]);

  // اختيار صورة
  const handlePickImage = useCallback(async () => {
    const result = await pickImage();
    if (result.uri) {
      setAvatarUri(result.uri);
      setAvatarPreview(result.uri);
    } else if (result.error) {
      setError(result.error);
    }
  }, []);

  // حفظ المعلومات الشخصية
  const handleSaveInfo = useCallback(async () => {
    if (!profile) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // رفع الصورة إن وجدت
      if (avatarUri) {
        const uploadResult = await uploadAvatar(profile.id, avatarUri);
        if (uploadResult.error) {
          setError(uploadResult.error);
          setSaving(false);
          return;
        }
      }

      // تحديث البيانات
      const updates: any = {};
      if (fullName.trim() !== profile.full_name) {
        if (fullName.trim().length < 3) {
          setError('الاسم يجب أن يكون 3 أحرف على الأقل');
          setSaving(false);
          return;
        }
        updates.full_name = fullName.trim();
      }

      if (username.trim() !== profile.username) {
        if (!canEditUsername) {
          setError(
            `لا يمكن تغيير اسم المستخدم إلا بعد ${usernameDaysRemaining} أيام`
          );
          setSaving(false);
          return;
        }
        if (username.trim().length < 3) {
          setError('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
          setSaving(false);
          return;
        }
        // التحقق من التوفر
        const available = await isUsernameAvailable(
          username.trim(),
          profile.id
        );
        if (!available) {
          setError('اسم المستخدم مستخدم بالفعل');
          setSaving(false);
          return;
        }
        updates.username = username.trim();
      }

      if (Object.keys(updates).length > 0) {
        const result = await updateProfile(profile.id, updates);
        if (!result.success) {
          setError(result.error || 'فشل التحديث');
          setSaving(false);
          return;
        }
      }

      setSuccess('تم تحديث الملف الشخصي بنجاح');
      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (err) {
      setError('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  }, [
    profile,
    fullName,
    username,
    avatarUri,
    canEditUsername,
    usernameDaysRemaining,
    onSave,
  ]);

  // تحديث كلمة المرور
  const handleUpdatePassword = useCallback(async () => {
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const result = await updatePassword(password);

    setSaving(false);

    if (result.success) {
      setSuccess('تم تحديث كلمة المرور بنجاح');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError(result.error || 'فشل تحديث كلمة المرور');
    }
  }, [password, confirmPassword]);

  if (!profile) return null;

  const userInitial = (fullName || username || 'U').charAt(0).toUpperCase();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.overlay}
        keyboardVerticalOffset={Platform.OS === 'android' ? -50 : 0}
      >
        <View
          style={[
            styles.container,
            isWeb && isLargeScreen && styles.containerWeb,
          ]}
        >
          <Animated.View
            entering={FadeInDown.springify()}
            style={[
              styles.modalContainer,
              isWeb && isLargeScreen && styles.modalContainerWeb,
            ]}
          >
            <LinearGradient
              colors={['#1e1e3a', '#151530', '#0f0f1e']}
              style={styles.modalGradient}
            >
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color="#9ca3af" />
                </TouchableOpacity>
                <Text style={styles.title}>تعديل الملف الشخصي</Text>
                <View style={{ width: 32 }} />
              </View>

              {/* Tabs */}
              <View style={styles.tabRow}>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'info' && styles.tabActive]}
                  onPress={() => {
                    setActiveTab('info');
                    setError('');
                    setSuccess('');
                  }}
                >
                  <Ionicons
                    name="person"
                    size={16}
                    color={activeTab === 'info' ? '#7c3aed' : '#6b7280'}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'info' && styles.tabTextActive,
                    ]}
                  >
                    المعلومات
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === 'password' && styles.tabActive,
                  ]}
                  onPress={() => {
                    setActiveTab('password');
                    setError('');
                    setSuccess('');
                  }}
                >
                  <Ionicons
                    name="lock-closed"
                    size={16}
                    color={activeTab === 'password' ? '#7c3aed' : '#6b7280'}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'password' && styles.tabTextActive,
                    ]}
                  >
                    كلمة المرور
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                  styles.scrollContent,
                  { paddingBottom: Platform.OS === 'android' ? 80 : 20 },
                ]}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
              >
                {activeTab === 'info' ? (
                  <>
                    {/* Avatar */}
                    <View style={styles.avatarSection}>
                      <TouchableOpacity
                        onPress={handlePickImage}
                        style={styles.avatarWrapper}
                        activeOpacity={0.8}
                      >
                        {avatarPreview ? (
                          <Image
                            source={{ uri: avatarPreview }}
                            style={styles.avatarImage}
                          />
                        ) : (
                          <LinearGradient
                            colors={['#7c3aed', '#3b82f6']}
                            style={styles.avatarPlaceholder}
                          >
                            <Text style={styles.avatarInitial}>
                              {userInitial}
                            </Text>
                          </LinearGradient>
                        )}
                        <View style={styles.cameraIcon}>
                          <Ionicons name="camera" size={16} color="#fff" />
                        </View>
                      </TouchableOpacity>
                      <Text style={styles.avatarHint}>اضغط لتغيير الصورة</Text>
                    </View>

                    {/* Full Name */}
                    <View style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>الاسم الكامل</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          Platform.OS === 'web' && ({ outline: 'none' } as any),
                        ]}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="الاسم الكامل"
                        placeholderTextColor="#4b5563"
                      />
                    </View>

                    {/* Username */}
                    <View style={styles.fieldContainer}>
                      <View style={styles.fieldLabelRow}>
                        <Text style={styles.fieldLabel}>اسم المستخدم</Text>
                        {!canEditUsername && (
                          <Text style={styles.fieldWarning}>
                            متاح بعد {usernameDaysRemaining} أيام
                          </Text>
                        )}
                      </View>
                      <TextInput
                        style={[
                          styles.textInput,
                          !canEditUsername && styles.textInputDisabled,
                          Platform.OS === 'web' && ({ outline: 'none' } as any),
                        ]}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="اسم المستخدم"
                        placeholderTextColor="#4b5563"
                        editable={canEditUsername}
                        autoCapitalize="none"
                      />
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleSaveInfo}
                      disabled={saving}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#7c3aed', '#3b82f6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.saveButtonGradient}
                      >
                        {saving ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <>
                            <Ionicons name="save" size={18} color="#fff" />
                            <Text style={styles.saveButtonText}>
                              حفظ التغييرات
                            </Text>
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {/* New Password */}
                    <View style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>كلمة المرور الجديدة</Text>
                      <View style={styles.passwordContainer}>
                        <TextInput
                          style={[
                            styles.textInput,
                            styles.passwordInput,
                            Platform.OS === 'web' &&
                              ({ outline: 'none' } as any),
                          ]}
                          value={password}
                          onChangeText={setPassword}
                          placeholder="كلمة المرور الجديدة"
                          placeholderTextColor="#4b5563"
                          secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          style={styles.eyeIcon}
                        >
                          <Ionicons
                            name={showPassword ? 'eye' : 'eye-off'}
                            size={20}
                            color="#6b7280"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>تأكيد كلمة المرور</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          Platform.OS === 'web' && ({ outline: 'none' } as any),
                        ]}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="أعد إدخال كلمة المرور"
                        placeholderTextColor="#4b5563"
                        secureTextEntry={!showPassword}
                      />
                    </View>

                    {/* Save Password Button */}
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleUpdatePassword}
                      disabled={saving || !password}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={
                          password
                            ? ['#7c3aed', '#3b82f6']
                            : ['#374151', '#374151']
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
                              name="lock-closed"
                              size={18}
                              color="#fff"
                            />
                            <Text style={styles.saveButtonText}>
                              تحديث كلمة المرور
                            </Text>
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                )}

                {/* Error/Success Messages */}
                {error ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color="#ef4444" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}
                {success ? (
                  <View style={styles.successContainer}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#10b981"
                    />
                    <Text style={styles.successText}>{success}</Text>
                  </View>
                ) : null}
              </ScrollView>
            </LinearGradient>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  containerWeb: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    maxHeight: '90%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
    borderBottomWidth: 0,
  },
  modalContainerWeb: {
    maxWidth: 500,
    width: '100%',
    maxHeight: '85%',
    borderRadius: 28,
    borderBottomWidth: 1,
    ...Platform.select({
      web: {
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  modalGradient: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  tabActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#7c3aed',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: '800',
    color: '#fff',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(124, 58, 237, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1e1e3a',
  },
  avatarHint: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 8,
  },
  fieldContainer: {
    marginBottom: 18,
  },
  fieldLabelRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: 8,
    textAlign: 'right',
  },
  fieldWarning: {
    fontSize: 11,
    color: '#f59e0b',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: '#fff',
    textAlign: 'right',
  },
  textInputDisabled: {
    opacity: 0.5,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingLeft: 44,
  },
  eyeIcon: {
    position: 'absolute',
    left: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    flex: 1,
    textAlign: 'right',
  },
  successContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 16,
  },
  successText: {
    color: '#10b981',
    fontSize: 13,
    flex: 1,
    textAlign: 'right',
  },
});
