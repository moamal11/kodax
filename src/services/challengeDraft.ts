/**
 * حفظ مسودة كود المستخدم لكل تحدٍ محلياً، حتى لا يضيع الكود عند الخروج
 * من الشاشة أو إغلاق التطبيق. المسودة خاصة بكل مستخدم على هذا الجهاز.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'kodax_challenge_draft_v1';

const keyFor = (userId: string | undefined, challengeId: string) =>
  `${PREFIX}:${userId ?? 'guest'}:${challengeId}`;

export async function loadChallengeDraft(
  userId: string | undefined,
  challengeId: string
): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(keyFor(userId, challengeId));
  } catch {
    return null;
  }
}

export async function saveChallengeDraft(
  userId: string | undefined,
  challengeId: string,
  code: string,
  starterCode: string
): Promise<void> {
  try {
    const key = keyFor(userId, challengeId);
    // لا داعي لحفظ الكود الابتدائي كما هو
    if (!code.trim() || code.trim() === starterCode.trim()) {
      await AsyncStorage.removeItem(key);
    } else {
      await AsyncStorage.setItem(key, code);
    }
  } catch {
    // الحفظ المحلي تحسين فقط — لا نوقف المستخدم إن فشل
  }
}
