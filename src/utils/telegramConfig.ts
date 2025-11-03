import { useEffect } from 'react';

interface TelegramWebAppConfig {
  viewportHeight: number;
  backgroundColor?: string;
  headerColor?: string;
}

export function configureTelegramWebApp({ 
  viewportHeight, 
  backgroundColor = '#1e1e1e',
  headerColor = '#2e2e2e'
}: TelegramWebAppConfig) {
  useEffect(() => {
    // Установка высоты viewport
    document.documentElement.style.setProperty('--tg-viewport-height', `${viewportHeight}px`);
    
    // Установка цветов
    document.documentElement.style.setProperty('--tg-theme-bg-color', backgroundColor);
    document.documentElement.style.setProperty('--tg-theme-header-bg-color', headerColor);

    // Добавление специальных стилей для Telegram Web App
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --tg-viewport-stable-height: ${viewportHeight}px;
      }

      body {
        height: var(--tg-viewport-height);
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }

      /* Стили для адаптивности в Telegram */
      @media (display-mode: standalone), (display-mode: fullscreen) {
        body {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [viewportHeight, backgroundColor, headerColor]);
}