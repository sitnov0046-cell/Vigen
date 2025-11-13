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
    'cache-control': 'no-cache, no-store, must-revalidate',
    'pragma': 'no-cache',
    'expires': '0',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={inter.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>
        <TelegramScript />
        {children}
        <div className="pb-20">{/* Отступ для нижней навигации */}</div>
        <ConditionalNavigation />
      </body>
    </html>
  );
}