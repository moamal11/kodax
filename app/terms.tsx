/**
 * شروط الاستخدام — عامة (/terms داخل التطبيق وعلى kodax.app)
 */
import React from 'react';
import LegalScreen from '@/components/legal/LegalScreen';
import { TERMS_OF_SERVICE } from '@/constants/legal';

export default function TermsScreen() {
  return <LegalScreen documents={TERMS_OF_SERVICE} icon="document-text" />;
}
