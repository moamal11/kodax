/**
 * Rewarded Ads (Android / iOS)
 *
 * التدفق:
 *  1. السيرفر يُنشئ جلسة إعلان لمرة واحدة (يتحقق من الحد اليومي والفاصل الزمني).
 *  2. نحمّل إعلان Rewarded ونعرضه. رقم الجلسة يُرسل كـ customData لـ AdMob SSV.
 *  3. لا تُمنح المكافأة إلا بعد حدث EARNED_REWARD (اكتمال الإعلان) —
 *     وليس عند الضغط على الإعلان أو تثبيت أي تطبيق.
 *  4. بعد الإغلاق نطلب من السيرفر اعتماد الجلسة. إذا كان التحقق من جهة الخادم
 *     (SSV) مفعلاً، السيرفر هو من يضيف الرصيد وننتظر التأكيد.
 */

import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { coinService, coinMessage } from './coinService';
import type { RewardedAdResult, RewardedAdPurpose, RewardedAdOptions } from './rewardedAds.types';

export type { RewardedAdResult, RewardedAdPurpose, RewardedAdOptions } from './rewardedAds.types';

// تحميل آمن للوحدة الأصلية: إذا كانت النسخة المثبتة لا تحتوي على AdMob
// (نسخة قديمة أو Expo Go) تبقى الإعلانات "غير متاحة" بدل أن يتعطل التطبيق.
type AdsModule = typeof import('react-native-google-mobile-ads');
let Ads: AdsModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Ads = require('react-native-google-mobile-ads') as AdsModule;
} catch (e) {
  console.warn('[ads] native module not available');
  Ads = null;
}

// وحدات الإعلان المكافئ
// الحقيقية (Android): ca-app-pub-7553202956815424/1403641578
// الاختبار الرسمية من Google: لا تُحتسب ولا تعرّض حساب AdMob للخطر أثناء التطوير.
const REAL_REWARDED_UNIT_ANDROID = 'ca-app-pub-7553202956815424/1403641578';
const TEST_REWARDED_UNIT_ANDROID = 'ca-app-pub-3940256099942544/5224354917';

// إعلانات الاختبار في: وضع التطوير (__DEV__) + بناءات development/preview
// (EXPO_PUBLIC_ADMOB_USE_TEST_ADS=true في eas.json). الإنتاج فقط يعرض الإعلان الحقيقي.
const USE_TEST_ADS =
  __DEV__ || process.env.EXPO_PUBLIC_ADMOB_USE_TEST_ADS === 'true';

function resolveUnitId(): string | null {
  if (!Ads) return null;
  if (Platform.OS === 'android') {
    return USE_TEST_ADS
      ? TEST_REWARDED_UNIT_ANDROID
      : process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID ||
          REAL_REWARDED_UNIT_ANDROID;
  }
  // iOS: لا توجد وحدة حقيقية بعد — إعلانات اختبار فقط في التطوير
  return USE_TEST_ADS
    ? Ads.TestIds.REWARDED
    : process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS || null;
}

const UNIT_ID: string | null = resolveUnitId();

if (__DEV__) {
  console.log(
    `[ads] rewarded unit: ${UNIT_ID ?? 'none'} (${USE_TEST_ADS ? 'TEST' : 'LIVE'})`
  );
}

const LOAD_TIMEOUT_MS = 15000;

let initPromise: Promise<boolean> | null = null;
let showingAd = false;

function initAds(): Promise<boolean> {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        // نموذج الموافقة (UMP) — مطلوب لمستخدمي المناطق التي تشترطه.
        if (!Ads) return false;
        await Ads.AdsConsent.gatherConsent().catch(() => null);
        await Ads.default().initialize();
        return true;
      } catch (e) {
        console.warn('[ads] init failed', e);
        initPromise = null;
        return false;
      }
    })();
  }
  return initPromise;
}

export function isRewardedAdsSupported(): boolean {
  return !!UNIT_ID;
}

/** يُستدعى مبكراً (اختياري) لتسريع أول إعلان. */
export function prepareRewardedAds(): void {
  if (UNIT_ID) initAds();
}

/**
 * انتظار اعتماد الجلسة على السيرفر (AdMob SSV) — لكل الأغراض.
 * الجلسة نفسها هي مصدر الحقيقة: لا نستنتج من تغيّر الرصيد.
 */
async function waitForSessionRewarded(sessionId: string): Promise<boolean> {
  for (let i = 0; i < 8; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const st = await coinService.adSessionStatus(sessionId);
    if (st.success && st.status === 'rewarded') return true;
    if (st.success && st.status === 'expired') return false;
  }
  return false;
}

async function startSession(purpose: RewardedAdPurpose, options: RewardedAdOptions) {
  if (purpose === 'ai_quota') return coinService.startAiAdSession();
  if (purpose === 'solution') return coinService.startSolutionAdSession(options.challengeId ?? '');
  return coinService.startAdSession();
}

/** النتيجة النهائية بعد اعتماد الجلسة (بالتطبيق حين يُسمح، أو بـ SSV) */
async function finishResult(purpose: RewardedAdPurpose, claim: any): Promise<RewardedAdResult> {
  if (purpose === 'solution') return { success: true, reward: 0, solutionUnlocked: true };
  if (purpose === 'ai_quota') {
    const q = claim?.quota ?? (await coinService.getAIQuota());
    return {
      success: true,
      reward: 0,
      aiQuota: q ?? undefined,
      bonusUnlocked: claim?.bonus_unlocked ?? (!!q && q.ads.progress === 0 && q.ads.bonuses_earned > 0),
    };
  }
  const balance = claim?.balance ?? (await coinService.getState()).state?.balance;
  return {
    success: true,
    reward: claim?.reward ?? undefined,
    bonus: claim?.bonus ?? 0,
    balance,
    watched: claim?.watched,
  };
}

export async function watchRewardedAd(
  purpose: RewardedAdPurpose = 'coins',
  options: RewardedAdOptions = {}
): Promise<RewardedAdResult> {
  if (!UNIT_ID || !Ads) {
    return {
      success: false,
      code: 'ad_unavailable',
      message: 'الإعلانات غير متاحة حالياً.',
    };
  }
  const { AdEventType, RewardedAd, RewardedAdEventType } = Ads;
  const unitId: string = UNIT_ID;
  if (showingAd) {
    return { success: false, code: 'busy', message: 'يوجد إعلان قيد العرض.' };
  }

  // 1. جلسة لمرة واحدة من السيرفر (الغرض والتحدي يُحفظان في الجلسة، فلا يمكن تغييرهما بعد الإعلان)
  const session = await startSession(purpose, options);
  if (purpose === 'solution' && session.success && session.reveal_ready) {
    return { success: true, reward: 0, solutionUnlocked: true }; // الحل متاح أصلاً (حلّ التحدي)
  }
  if (!session.success || !session.session_id) {
    return {
      success: false,
      code: session.code || 'unknown',
      message: coinMessage(session.code, session),
      retryAfter: session.retry_after,
    };
  }
  const sessionId: string = session.session_id;
  coinService.track('ad_requested', { purpose });

  const ready = await initAds();
  if (!ready) {
    coinService.track('ad_failed', { purpose, reason: 'init' });
    return {
      success: false,
      code: 'ad_unavailable',
      message: 'تعذّر تحميل الإعلان. حاول لاحقاً.',
    };
  }

  const {
    data: { session: authSession },
  } = await supabase.auth.getSession();

  showingAd = true;
  try {
    const earned = await new Promise<'earned' | 'closed' | 'error' | 'timeout'>(
      (resolve) => {
        const ad = RewardedAd.createForAdRequest(unitId, {
          serverSideVerificationOptions: {
            userId: authSession?.user?.id,
            customData: sessionId,
          },
        });

        let didEarn = false;
        let settled = false;
        const unsubs: Array<() => void> = [];
        const finish = (v: 'earned' | 'closed' | 'error' | 'timeout') => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          unsubs.forEach((u) => u());
          resolve(v);
        };

        const timer = setTimeout(() => finish('timeout'), LOAD_TIMEOUT_MS);

        unsubs.push(
          ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
            clearTimeout(timer);
            coinService.track('ad_shown', { purpose });
            ad.show().catch(() => finish('error'));
          })
        );
        unsubs.push(
          ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
            didEarn = true;
          })
        );
        unsubs.push(
          ad.addAdEventListener(AdEventType.CLOSED, () => {
            finish(didEarn ? 'earned' : 'closed');
          })
        );
        unsubs.push(
          ad.addAdEventListener(AdEventType.ERROR, () => finish('error'))
        );

        ad.load();
      }
    );

    if (earned === 'timeout' || earned === 'error') {
      coinService.track('ad_failed', { purpose, reason: earned });
      return {
        success: false,
        code: 'ad_unavailable',
        message: 'لا يوجد إعلان متاح الآن. حاول بعد قليل.',
      };
    }
    if (earned === 'closed') {
      coinService.track('ad_closed_early', { purpose });
      return {
        success: false,
        code: 'not_completed',
        message: 'أُغلق الإعلان قبل نهايته، لذلك لم تُمنح المكافأة.',
      };
    }
    coinService.track('ad_completed', { purpose });

    // 2. الاعتماد: السيرفر وحده يمنح المكافأة (التطبيق يطلب فقط؛ مع SSV ينتظر تأكيد AdMob)
    const claim = await coinService.claimAdReward(sessionId);
    if (claim.success && claim.duplicate) {
      // اعتُمدت الجلسة قبل طلب التطبيق (SSV أسرع) — المكافأة مُنحت مرة واحدة
      return finishResult(purpose, null);
    }
    if (claim.success) return finishResult(purpose, claim);
    if (claim.code === 'pending_verification' && (await waitForSessionRewarded(sessionId))) {
      return finishResult(purpose, null);
    }
    return {
      success: false,
      code: claim.code || 'unknown',
      message:
        claim.code === 'pending_verification'
          ? 'لم يصل تأكيد الإعلان بعد. إذا اكتمل الإعلان ستظهر المكافأة خلال دقائق.'
          : coinMessage(claim.code, claim),
    };
  } finally {
    showingAd = false;
  }
}
