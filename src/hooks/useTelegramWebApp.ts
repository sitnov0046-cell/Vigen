import { useEffect, useState } from 'react';

export function useTelegramWebApp() {
  const [webApp, setWebApp] = useState<Window['Telegram']['WebApp'] | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    console.log('=== useTelegramWebApp: Инициализация ===');

    // Функция для инициализации WebApp
    const initWebApp = () => {
      console.log('window.Telegram существует?', !!window.Telegram);
      console.log('window.Telegram.WebApp существует?', !!window.Telegram?.WebApp);

      const app = window.Telegram?.WebApp;
      if (app) {
        console.log('Telegram WebApp найден!');
        console.log('initData:', app.initData);
        console.log('initDataUnsafe:', app.initDataUnsafe);
        console.log('User:', app.initDataUnsafe?.user);

        setWebApp(app);

        // Настройка viewport
        const updateViewportHeight = () => {
          const vh = app.viewportHeight || window.innerHeight;
          setViewportHeight(vh);
          app.expand(); // Расширяем приложение на весь доступный размер
        };

        // Инициализация
        app.ready();
        updateViewportHeight();
        setIsReady(true);

        // Слушаем изменения viewport
        app.onEvent('viewportChanged', updateViewportHeight);

        return () => {
          app.offEvent('viewportChanged', updateViewportHeight);
        };
      } else {
        console.warn('Telegram WebApp НЕ найден! Приложение открыто вне Telegram?');
      }
    };

    // Проверяем, загружен ли уже скрипт
    if (window.Telegram?.WebApp) {
      initWebApp();
    } else {
      // Ждём загрузки скрипта
      console.log('Ожидание загрузки Telegram WebApp скрипта...');
      const checkInterval = setInterval(() => {
        if (window.Telegram?.WebApp) {
          console.log('Telegram WebApp скрипт загружен!');
          clearInterval(checkInterval);
          initWebApp();
        }
      }, 100);

      // Очистка интервала через 10 секунд, если скрипт не загрузился
      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
        console.error('Timeout: Telegram WebApp скрипт не загрузился за 10 секунд');
      }, 10000);

      return () => {
        clearInterval(checkInterval);
        clearTimeout(timeout);
      };
    }
  }, []);

  return { webApp, isReady, viewportHeight };
}