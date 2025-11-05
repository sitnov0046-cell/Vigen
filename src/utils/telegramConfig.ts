// Конфигурация Telegram WebApp
export function configureTelegramWebApp() {
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.expand();
    return tg;
  }
  return null;
}
