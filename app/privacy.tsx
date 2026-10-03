/**
 * سياسة الخصوصية — عامة (/privacy داخل التطبيق وعلى kodax.app)
 */
import React from 'react';
import LegalScreen from '@/components/legal/LegalScreen';
import { PRIVACY_POLICY } from '@/constants/legal';

export default function PrivacyScreen() {
  return <LegalScreen documents={PRIVACY_POLICY} icon="shield-checkmark" />;
}
