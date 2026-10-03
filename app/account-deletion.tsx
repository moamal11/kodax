/**
 * معلومات حذف الحساب — عامة (/account-deletion) لرابط Google Play
 */
import React from 'react';
import LegalScreen from '@/components/legal/LegalScreen';
import { ACCOUNT_DELETION_INFO } from '@/constants/legal';

export default function AccountDeletionInfoScreen() {
  return <LegalScreen documents={ACCOUNT_DELETION_INFO} icon="trash" />;
}
