import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { TelegramScript } from '@/components/TelegramScript';
import { BottomNavigation } from '@/components/BottomNavigation';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Video Generator',
  description: 'Generate videos from text using AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={inter.className}>
      <body>
        <TelegramScript />
        {children}
        <div className="pb-20">{/* Отступ для нижней навигации */}</div>
        <BottomNavigation />
      </body>
    </html>
  );
}