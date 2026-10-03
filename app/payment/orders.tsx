import { Redirect } from 'expo-router';

/** المسار القديم /payment/orders — أُلغي مع نظام الدفع. */
export default function LegacyOrdersRoute() {
  return <Redirect href={'/rewards' as any} />;
}
