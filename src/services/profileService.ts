/**
 * profileService.ts
 * خدمة إدارة الملف الشخصي - Profile Management Service
 */

import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

// ===== أنواع البيانات =====
export interface ProfileData {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  province: string | null;
  gender: string | null;
  followers_count: number;
  following_count: number;
  xp: number;
  level: number;
  streak_days: number;
  last_username_change: string | null;
  created_at: string;
  is_verified?: boolean;
}

export interface ProfileUpdateData {
  full_name?: string;
  username?: string;
  avatar_url?: string;
  province?: string;
  gender?: string;
}

// ===== محافظات العراق =====
export const IRAQ_PROVINCES = [
  'بغداد',
  'البصرة',
  'نينوى',
  'أربيل',
  'النجف',
  'كربلاء',
  'ذي قار',
  'بابل',
  'ديالى',
  'الأنبار',
  'كركوك',
  'صلاح الدين',
  'واسط',
  'ميسان',
  'المثنى',
  'القادسية',
  'دهوك',
  'السليمانية',
];

// ===== خدمة الملف الشخصي =====

/**
 * جلب بيانات الملف الشخصي
 */
export async function getProfile(
  userId: string
): Promise<{ data: ProfileData | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(
        'id, username, full_name, avatar_url, province, gender, followers_count, following_count, xp, level, streak_days, last_username_change, created_at, is_verified'
      )
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { data: data as ProfileData, error: null };
  } catch (error) {
    console.error('getProfile error:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'فشل جلب الملف الشخصي',
    };
  }
}

/**
 * التحقق إذا أكمل المستخدم بياناته الإجبارية
 */
export async function checkMandatoryData(userId: string): Promise<{
  isComplete: boolean;
  missingFields: string[];
}> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, province, gender')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return {
        isComplete: false,
        missingFields: ['full_name', 'province', 'gender'],
      };
    }

    const missingFields: string[] = [];
    if (!data.full_name || data.full_name.trim() === '') {
      missingFields.push('full_name');
    }
    if (!data.province || data.province.trim() === '') {
      missingFields.push('province');
    }
    if (!data.gender || data.gender.trim() === '') {
      missingFields.push('gender');
    }

    return {
      isComplete: missingFields.length === 0,
      missingFields,
    };
  } catch {
    return {
      isComplete: false,
      missingFields: ['full_name', 'province', 'gender'],
    };
  }
}

/**
 * حفظ البيانات الإجبارية (بعد التسجيل)
 */
export async function saveMandatoryData(
  userId: string,
  data: { full_name: string; province: string; gender: string }
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.full_name.trim(),
        province: data.province,
        gender: data.gender,
      })
      .eq('id', userId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('saveMandatoryData error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل حفظ البيانات',
    };
  }
}

/**
 * تحديث الملف الشخصي
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdateData
): Promise<{ success: boolean; error: string | null }> {
  try {
    const updateData: any = {};

    if (updates.full_name !== undefined) {
      updateData.full_name = updates.full_name.trim();
    }
    if (updates.province !== undefined) {
      updateData.province = updates.province;
    }
    if (updates.gender !== undefined) {
      updateData.gender = updates.gender;
    }
    if (updates.avatar_url !== undefined) {
      updateData.avatar_url = updates.avatar_url;
    }
    if (updates.username !== undefined) {
      updateData.username = updates.username.trim();
      updateData.last_username_change = new Date().toISOString();
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('updateProfile error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل تحديث الملف الشخصي',
    };
  }
}

/**
 * التحقق إذا كان يمكن تغيير اسم المستخدم (مرة كل 7 أيام)
 */
export async function canChangeUsername(userId: string): Promise<{
  canChange: boolean;
  daysRemaining: number;
}> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('last_username_change')
      .eq('id', userId)
      .single();

    if (error) throw error;

    if (!data?.last_username_change) {
      return { canChange: true, daysRemaining: 0 };
    }

    const lastChange = new Date(data.last_username_change);
    const now = new Date();
    const diffMs = now.getTime() - lastChange.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const daysRemaining = Math.max(0, Math.ceil(7 - diffDays));

    return {
      canChange: diffDays >= 7,
      daysRemaining,
    };
  } catch {
    return { canChange: true, daysRemaining: 0 };
  }
}

/**
 * التحقق من توفر اسم المستخدم
 */
export async function isUsernameAvailable(
  username: string,
  currentUserId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.trim())
      .neq('id', currentUserId)
      .maybeSingle();

    if (error) throw error;
    return !data;
  } catch {
    return false;
  }
}

/**
 * تحديث كلمة المرور
 */
export async function updatePassword(
  newPassword: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('updatePassword error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل تحديث كلمة المرور',
    };
  }
}

/**
 * اختيار صورة من المعرض
 */
export async function pickImage(): Promise<{
  uri: string | null;
  error: string | null;
}> {
  try {
    // Android: منتقي الصور في النظام (Photo Picker) لا يحتاج أي صلاحية تخزين — الصلاحيات محجوبة في app.json
    if (Platform.OS === 'ios') {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        return { uri: null, error: 'يرجى السماح بالوصول إلى المعرض' };
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled) {
      return { uri: null, error: null };
    }

    return { uri: result.assets[0].uri, error: null };
  } catch (error) {
    console.error('pickImage error:', error);
    return {
      uri: null,
      error: error instanceof Error ? error.message : 'فشل اختيار الصورة',
    };
  }
}

/**
 * رفع صورة الملف الشخصي إلى Supabase Storage
 */
export async function uploadAvatar(
  userId: string,
  imageUri: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Read the image as base64
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const fileExt = 'jpg';
    const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`;

    // Convert blob to arraybuffer
    const arrayBuffer = await new Response(blob).arrayBuffer();

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    const avatarUrl = urlData.publicUrl;

    // Update profile with new avatar URL
    await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);

    return { url: avatarUrl, error: null };
  } catch (error) {
    console.error('uploadAvatar error:', error);
    return {
      url: null,
      error: error instanceof Error ? error.message : 'فشل رفع الصورة',
    };
  }
}

/**
 * جلب ملف شخصي لمستخدم آخر (للعرض العام)
 */
export async function getPublicProfile(userId: string): Promise<{
  data: ProfileData | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(
        'id, username, full_name, avatar_url, province, gender, followers_count, following_count, xp, level, streak_days, created_at, last_username_change, is_verified'
      )
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { data: data as ProfileData, error: null };
  } catch (error) {
    console.error('getPublicProfile error:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'فشل جلب الملف الشخصي',
    };
  }
}
