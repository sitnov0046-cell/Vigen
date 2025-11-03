export interface TelegramWebApp {
  WebApp: {
    ready(): void;
    expand(): void;
    close(): void;
    viewportHeight?: number;
    viewportStableHeight?: number;
    onEvent(eventType: string, callback: Function): void;
    offEvent(eventType: string, callback: Function): void;
    MainButton: {
      text: string;
      isVisible: boolean;
      isActive: boolean;
      onClick(cb: Function): void;
      show(): void;
      hide(): void;
      enable(): void;
      disable(): void;
    };
    BackButton: {
      isVisible: boolean;
      onClick(cb: Function): void;
      show(): void;
      hide(): void;
    };
    initData: string;
    initDataUnsafe: {
      query_id: string;
      user: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        language_code?: string;
      };
      auth_date: string;
      hash: string;
    };
  };
}

declare global {
  interface Window {
    Telegram: TelegramWebApp;
  }
}