import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kodax Admin - لوحة التحكم',
  description: 'لوحة تحكم Kodax لإدارة المستخدمين والطلبات',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="ltr">
      <body className="bg-kodax-dark text-white min-h-screen">{children}</body>
    </html>
  );
}
