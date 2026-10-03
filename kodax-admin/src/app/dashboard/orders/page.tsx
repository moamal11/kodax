import { redirect } from 'next/navigation';

// نظام الدفع أُلغي — Kodax مجاني بالكامل. المسار القديم يحوّل لصفحة البلاغات.
export default function LegacyOrdersPage() {
  redirect('/dashboard/reports');
}
