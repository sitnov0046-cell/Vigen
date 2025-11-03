import { useEffect, useState } from 'react';

export function useTelegramWebApp() {
  const [webApp, setWebApp] = useState<Window['Telegram']['WebApp'] | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
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
  }, []);

  return { webApp, isReady, viewportHeight };
}