/**
 * /challenges — نفس متصفح التحديات في تبويب «تعلّم» (للروابط المباشرة والإشعارات القديمة).
 */
import React from 'react';
import { Screen, AppBar } from '@/design';
import { ChallengesBrowser } from '@/features/learn/ChallengesBrowser';

export default function ChallengesScreen() {
  return (
    <Screen header={<AppBar title="التحديات" subtitle="حل، تحقق على السيرفر، واكسب XP" fallback={'/learn?tab=challenges' as any} />}>
      <ChallengesBrowser />
    </Screen>
  );
}
