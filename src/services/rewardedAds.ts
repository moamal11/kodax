/**
 * Rewarded Ads — نسخة الويب
 * الإعلانات المكافئة متاحة فقط داخل تطبيق الهاتف.
 * (النسخة الفعلية في rewardedAds.native.ts)
 */

import type { RewardedAdResult, RewardedAdPurpose, RewardedAdOptions } from './rewardedAds.types';

export type { RewardedAdResult, RewardedAdPurpose, RewardedAdOptions } from './rewardedAds.types';

export function isRewardedAdsSupported(): boolean {
  return false;
}

export function prepareRewardedAds(): void {}

export async function watchRewardedAd(
  _purpose: RewardedAdPurpose = 'coins',
  _options: RewardedAdOptions = {}
): Promise<RewardedAdResult> {
  return {
    success: false,
    code: 'ad_unavailable',
    message: 'الإعلانات المكافئة متاحة داخل تطبيق Kodax على الهاتف فقط.',
  };
}
