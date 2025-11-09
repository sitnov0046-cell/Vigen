import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { TelegramScript } from '@/components/TelegramScript';
import { ConditionalNavigation } from '@/components/ConditionalNavigation';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LIKS - AI Video Generator',
  description: 'Создавайте потрясающие видео с помощью ИИ в LIKS',
  other: {
    'telegram-web-app': 'https://telegram.org/js/telegram-web-app.js',
  },
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
        <ConditionalNavigation />
      </body>
    </html>
  );
}