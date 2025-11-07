import { useEffect, useState } from 'react';

export function useTelegramWebApp() {
  const [webApp, setWebApp] = useState<Window['Telegram']['WebApp'] | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    // Функция для инициализации WebApp
    const initWebApp = () => {
      const app = window.Telegram?.WebApp;
      if (app) {

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
      }
    };

    // Проверяем, загружен ли уже скрипт
    if (window.Telegram?.WebApp) {
      initWebApp();
    } else {
      // Ждём загрузки скрипта
      const checkInterval = setInterval(() => {
        if (window.Telegram?.WebApp) {
          clearInterval(checkInterval);
          initWebApp();
        }
      }, 100);

      // Очистка интервала через 10 секунд, если скрипт не загрузился
      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
      }, 10000);

      return () => {
        clearInterval(checkInterval);
        clearTimeout(timeout);
      };
    }
  }, []);

  return { webApp, isReady, viewportHeight };
}