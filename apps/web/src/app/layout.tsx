import '@/styles/globals.css';

import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import { MainLayout } from '@/components/layout/main-layout';

export const metadata: Metadata = {
  title: 'ゴールドポイントカード管理ツール',
  description: 'ヨドバシゴールドポイントカードの支払い履歴を管理・分析するツール',
};

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen">
        <MainLayout>{children}</MainLayout>
        <Toaster />
      </body>
    </html>
  );
}
