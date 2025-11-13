'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export function TelegramScript() {
  useEffect(() => {
    // Ждем пока Telegram WebApp загрузится
    const initTelegram = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp as any;

        // Устанавливаем цвета для Telegram WebApp
        if (tg.setHeaderColor) {
          tg.setHeaderColor('#0f172a'); // Тёмный фон
        }
        if (tg.setBackgroundColor) {
          tg.setBackgroundColor('#0f172a'); // Тёмный фон
        }

        // Отключаем вертикальные свайпы для закрытия
        if (tg.disableVerticalSwipes) {
          tg.disableVerticalSwipes();
        }

        // Расширяем приложение на весь экран
        tg.expand();

        // Делаем приложение готовым
        tg.ready();
      }
    };

    // Запускаем после небольшой задержки, чтобы скрипт успел загрузиться
    const timer = setTimeout(initTelegram, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Script
      src="https://telegram.org/js/telegram-web-app.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp as any;
          if (tg.setHeaderColor) tg.setHeaderColor('#0f172a');
          if (tg.setBackgroundColor) tg.setBackgroundColor('#0f172a');
          if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
          tg.expand();
          tg.ready();
        }
      }}
    />
  );
}