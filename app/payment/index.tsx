import { Redirect } from 'expo-router';

/**
 * المسار القديم /payment — نظام الدفع أُلغي بالكامل (Kodax مجاني).
 * نُبقي المسار فقط حتى لا تنكسر الروابط والإشعارات القديمة،
 * ونحوّله إلى صفحة جمع الكوينات المجانية.
 */
export default function LegacyPaymentRoute() {
  return <Redirect href={'/rewards' as any} />;
}
