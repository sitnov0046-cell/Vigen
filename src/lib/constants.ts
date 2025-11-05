// Константы для приложения

// Цены
export const TOKENS_PER_VIDEO = 2; // Стоимость генерации одного видео в токенах
export const INITIAL_BONUS = 2; // Приветственный бонус для новых пользователей (хватает на 1 пробное видео)
export const REFERRAL_BONUS = 10; // Бонус за приглашение реферала

// Типы транзакций
export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  REFERRAL_BONUS: 'referral_bonus',
  VIDEO_GENERATION: 'video_generation',
} as const;

export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];
