/**
 * profileService.ts
 * خدمة إدارة الملف الشخصي - Profile Management Service
 */

import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isWebVisitor, publicWebDocument } from './publicWebService';

// ===== أنواع البيانات =====
export interface ProfileData {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  cover_url?: string | null;
  bio?: string | null;
  followers_visible?: boolean;
  following_visible?: boolean;
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
  avatar_url?: string | null;
  cover_url?: string | null;
  bio?: string | null;
  followers_visible?: boolean;
  following_visible?: boolean;
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
        'id, username, full_name, avatar_url, cover_url, bio, followers_visible, following_visible, province, gender, followers_count, following_count, xp, level, streak_days, last_username_change, created_at, is_verified'
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
    if (updates.cover_url !== undefined) updateData.cover_url = updates.cover_url;
    if (updates.bio !== undefined) {
      if (Array.from(updates.bio || '').length > BIO_LIMIT) throw new Error('النبذة تتجاوز 280 حرفًا');
      updateData.bio = updates.bio?.trim() || null;
    }
    if (updates.followers_visible !== undefined) updateData.followers_visible = updates.followers_visible;
    if (updates.following_visible !== undefined) updateData.following_visible = updates.following_visible;
    if (updates.username !== undefined) {
      updateData.username = updates.username.trim();
      updateData.last_username_change = new Date().toISOString();
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId).select('id').single();

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

export const BIO_LIMIT = 280;
export const PROFILE_IMAGE_LIMIT = 5 * 1024 * 1024;
export type ProfileImage = { uri: string; base64?: string | null; fileSize?: number; mimeType?: string | null };
async function pickWebProfileImage(): Promise<ProfileImage | null> {
  // expo-image-picker's web change-only handler can stay pending when a chooser is cancelled.
  const file = await new Promise<File | null>(resolve => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/png,image/jpeg,image/webp'; input.style.display = 'none';
    let done = false; let focusTimer: ReturnType<typeof setTimeout>;
    const finish = (f: File | null) => { if (done) return; done = true; clearTimeout(focusTimer); window.removeEventListener('focus', focus); input.remove(); resolve(f); };
    const focus = () => { focusTimer = setTimeout(() => { if (!input.files?.length) finish(null); }, 800); };
    input.addEventListener('change', () => finish(input.files?.[0] || null), { once: true });
    input.addEventListener('cancel', () => finish(null), { once: true });
    window.addEventListener('focus', focus); document.body.appendChild(input); input.click();
  });
  if (!file) return null;
  if (file.size > PROFILE_IMAGE_LIMIT) throw new Error('الحد الأقصى للصورة 5 ميغابايت');
  if (!['image/png','image/jpeg','image/webp'].includes(file.type)) throw new Error('اختر صورة PNG أو JPEG أو WebP');
  const uri = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader(); reader.onerror = () => reject(new Error('تعذّر قراءة الصورة')); reader.onload = () => resolve(String(reader.result)); reader.readAsDataURL(file);
  });
  await new Promise<void>((resolve, reject) => {
    const image = new window.Image(); image.onerror = () => reject(new Error('ملف الصورة غير صالح'));
    image.onload = () => image.width >= 32 && image.height >= 32 ? resolve() : reject(new Error('الصورة صغيرة جدًا')); image.src = uri;
  });
  return { uri, base64: uri.slice(uri.indexOf(',') + 1), fileSize: file.size, mimeType: file.type };
}
export async function pickProfileImage(kind: 'avatar' | 'cover' | 'attachment'): Promise<{ image: ProfileImage | null; error: string | null }> {
  try {
    if (Platform.OS === 'web') return { image: await pickWebProfileImage(), error: null };
    if (Platform.OS === 'ios' && !(await ImagePicker.requestMediaLibraryPermissionsAsync()).granted)
      return { image: null, error: 'يرجى السماح بالوصول إلى المعرض' };
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: kind !== 'attachment',
      aspect: kind === 'cover' ? [16, 9] : [1, 1], quality: 0.85, base64: true });
    if (result.canceled) return { image: null, error: null };
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > PROFILE_IMAGE_LIMIT) throw new Error('الحد الأقصى للصورة 5 ميغابايت');
    if (asset.width < 32 || asset.height < 32) throw new Error('الصورة صغيرة جدًا');
    return { image: asset, error: null };
  } catch (e) { return { image: null, error: e instanceof Error ? e.message : 'تعذّر اختيار الصورة' }; }
}
export async function validatedImageBytes(image: ProfileImage) {
  const bytes = image.base64
    ? Uint8Array.from(atob(image.base64), c => c.charCodeAt(0))
    : new Uint8Array(await (await fetch(image.uri)).arrayBuffer());
  if (!bytes.length || bytes.length > PROFILE_IMAGE_LIMIT) throw new Error('الحد الأقصى للصورة 5 ميغابايت');
  const isPng = bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
  const isJpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const isWebp = String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  const ext = isPng ? 'png' : isJpeg ? 'jpg' : isWebp ? 'webp' : null;
  if (!ext) throw new Error('اختر صورة PNG أو JPEG أو WebP');
  return { bytes, ext, contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}` };
}
async function uploadProfileImage(userId: string, bucket: string, image: ProfileImage) {
  const { bytes, ext, contentType } = await validatedImageBytes(image);
  const path = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, bytes.buffer, { contentType, upsert: false });
  if (error) throw error;
  return { bucket, path, url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl };
}
function ownedImagePath(url: string | null | undefined, bucket: string, uid: string): string | null {
  if (!url) return null;
  try {
    const base = new URL(supabase.storage.from(bucket).getPublicUrl('placeholder').data.publicUrl);
    const u = new URL(url);
    if (u.origin !== base.origin) return null;
    const prefix = `/storage/v1/object/public/${bucket}/`;
    if (!u.pathname.startsWith(prefix)) return null;
    const path = decodeURIComponent(u.pathname.slice(prefix.length));
    return path.startsWith(uid + '/') && !path.includes('..') ? path : null;
  } catch { return null; }
}
/** Upload first, commit all profile fields together, then remove replaced files. Roll back new uploads on a failed save. */
export async function saveProfileIdentity(profile: ProfileData, updates: ProfileUpdateData,
  images: { avatar?: ProfileImage | null; cover?: ProfileImage | null; removeCover?: boolean },
  onPhase?: (phase: string) => void): Promise<{ success: boolean; error: string | null; cleanupWarning?: string }> {
  const uploaded: Array<{ bucket: string; path: string; url: string }> = [];
  let committed = false;
  try {
    await retryImageCleanup(profile.id);
    const next = { ...updates };
    if (images.avatar) {
      onPhase?.('رفع الصورة الشخصية…');
      const img = await uploadProfileImage(profile.id, 'avatars', images.avatar); uploaded.push(img); next.avatar_url = img.url;
    }
    if (images.cover) {
      onPhase?.('رفع الغلاف…');
      const img = await uploadProfileImage(profile.id, 'profile-covers', images.cover); uploaded.push(img); next.cover_url = img.url;
    } else if (images.removeCover) next.cover_url = null;
    onPhase?.('حفظ الملف…');
    const result = await updateProfile(profile.id, next);
    if (!result.success) {
      // A lost HTTP response does not prove the database rejected the save.
      const actual = await getProfile(profile.id);
      const matches = actual.data && Object.entries(next).every(([key, value]) =>
        (actual.data as unknown as Record<string, unknown>)[key] === value);
      if (!matches) throw new Error(result.error || 'تعذّر حفظ الملف');
    }
    committed = true;
    const obsolete = [
      next.avatar_url !== undefined ? { bucket: 'avatars', path: ownedImagePath(profile.avatar_url, 'avatars', profile.id) } : null,
      next.cover_url !== undefined ? { bucket: 'profile-covers', path: ownedImagePath(profile.cover_url, 'profile-covers', profile.id) } : null,
    ].filter((x): x is { bucket: string; path: string } => !!x?.path);
    const pending = await cleanImages(profile.id, obsolete);
    return { success: true, error: null, cleanupWarning: pending ? 'حُفظ الملف. ستُعاد محاولة تنظيف الصورة السابقة عند الحفظ القادم.' : undefined };
  } catch (e) {
    if (committed) return { success: true, error: null, cleanupWarning: 'حُفظ الملف، وتعذّر تسجيل تنظيف الصور السابقة.' };
    const pending = await cleanImages(profile.id, uploaded);
    return { success: false, error: e instanceof Error ? e.message : 'تعذّر حفظ الملف',
      cleanupWarning: pending ? 'تعذّر تنظيف رفع لم يكتمل؛ ستُعاد المحاولة عند الحفظ القادم.' : undefined };
  }
}
type CleanupImage = { bucket: string; path: string };
async function cleanImages(uid: string, images: CleanupImage[]) {
  const key = `profile-image-cleanup:${uid}`;
  let previous: CleanupImage[] = [];
  try { previous = JSON.parse(await AsyncStorage.getItem(key) || '[]'); } catch {}
  const queued = [...previous, ...images].filter((x,i,a) => ['avatars','profile-covers'].includes(x.bucket) && x.path.startsWith(uid + '/') && !x.path.includes('..') && a.findIndex(y => y.bucket === x.bucket && y.path === x.path) === i);
  if (!queued.length) return false;
  // Keep pending paths durable until removal succeeds, including if the app closes mid-request.
  try { if (queued.length) await AsyncStorage.setItem(key, JSON.stringify(queued)); } catch {}
  const pending: CleanupImage[] = [];
  // Never delete a referenced image after an ambiguous response or a stale edit.
  // If the profile cannot be read, retain the queue until a later save can verify it.
  const current = await getProfile(uid);
  for (const img of queued) {
    if (!current.data) { pending.push(img); continue; }
    const currentURL = img.bucket === 'avatars' ? current.data.avatar_url : current.data.cover_url;
    if (ownedImagePath(currentURL, img.bucket, uid) === img.path) continue;
    try { if ((await supabase.storage.from(img.bucket).remove([img.path])).error) pending.push(img); }
    catch { pending.push(img); }
  }
  try {
    if (pending.length) await AsyncStorage.setItem(key, JSON.stringify(pending));
    else await AsyncStorage.removeItem(key);
  } catch {}
  return pending.length > 0;
}
async function retryImageCleanup(uid: string) { await cleanImages(uid, []); }

/**
 * جلب ملف شخصي لمستخدم آخر (للعرض العام)
 */
export async function getPublicProfile(identifier: string): Promise<{
  data: ProfileData | null;
  error: string | null;
}> {
  try {
    if (await isWebVisitor()) return { data: await publicWebDocument('user', identifier), error: null };
    let query = supabase
      .from('profiles')
      .select(
        'id, username, full_name, avatar_url, cover_url, bio, followers_visible, following_visible, province, gender, followers_count, following_count, xp, level, streak_days, created_at, last_username_change, is_verified'
      )
      ;
    query=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)?query.eq('id',identifier):query.ilike('username',identifier.replace(/[\\%_]/g,'\\$&'));
    const {data,error}=await query.maybeSingle();

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
