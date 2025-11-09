// Конфигурация тарифов для генерации видео

export interface VideoTariff {
  id: string;
  name: string;
  duration: number; // в секундах
  tokens: number; // стоимость в токенах
  model: 'sora-2' | 'veo-3-fast';
  description: string;
  popular?: boolean;
}

export const VIDEO_TARIFFS: VideoTariff[] = [
  // SORA 2 тарифы
  {
    id: 'sora-basic',
    name: 'SORA 2 - Базовый',
    duration: 5,
    tokens: 2,
    model: 'sora-2',
    description: '5 секунд видео',
  },
  {
    id: 'sora-standard',
    name: 'SORA 2 - Стандарт',
    duration: 10,
    tokens: 2,
    model: 'sora-2',
    description: '10 секунд видео',
  },
  {
    id: 'sora-extended',
    name: 'SORA 2 - Расширенный',
    duration: 15,
    tokens: 2,
    model: 'sora-2',
    description: '15 секунд видео',
  },
  // Veo 3 тариф
  {
    id: 'veo-basic',
    name: 'Veo 3 - Базовый',
    duration: 8,
    tokens: 2,
    model: 'veo-3-fast',
    description: '8 секунд видео',
  },
];

// Пакеты пополнения с бонусом х2 при первой покупке
export interface TokenPackage {
  id: string;
  name: string;
  price: number; // в рублях
  tokens: number; // базовое количество токенов
  tokensWithBonus: number; // с бонусом х2
  popular?: boolean;
  discount?: number; // процент скидки
}

export const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'starter',
    name: 'Стартовый',
    price: 499,
    tokens: 499,
    tokensWithBonus: 998,
  },
  {
    id: 'popular',
    name: 'Популярный',
    price: 999,
    tokens: 999,
    tokensWithBonus: 1998,
    popular: true,
  },
  {
    id: 'profitable',
    name: 'Выгодный',
    price: 1999,
    tokens: 1999,
    tokensWithBonus: 3998,
    discount: 5,
  },
  {
    id: 'premium',
    name: 'Премиум',
    price: 3990,
    tokens: 3990,
    tokensWithBonus: 7980,
    discount: 10,
  },
];

// Константы для расчётов
export const COST_PER_SECOND_SORA2 = 1.25; // себестоимость в рублях за секунду для Sora 2
export const COST_PER_SECOND_VEO3 = 4.15; // себестоимость в рублях за секунду для Veo 3 Fast

// Реферальная система с недельным лидербордом
export const REFERRAL_LEADERBOARD_PERCENTAGES = {
  1: 15, // 1 место - 15%
  2: 13, // 2 место - 13%
  3: 11, // 3 место - 11%
  default: 10, // Все остальные места - 10%
};

// Минимальные пороги для призовых мест
export const REFERRAL_TIER_THRESHOLDS = {
  1: 10, // Для 1 места нужно минимум 10 новых рефералов
  2: 7,  // Для 2 места нужно минимум 7 новых рефералов
  3: 5,  // Для 3 места нужно минимум 5 новых рефералов
};

/**
 * Получить процент выплаты по позиции в лидерборде с учётом минимальных порогов
 * @param position - позиция в лидерборде
 * @param newReferrals - количество новых рефералов
 */
export function getReferralPercent(position: number, newReferrals: number): number {
  // Проверяем, соответствует ли участник минимальным требованиям для своей позиции
  if (position === 1 && newReferrals >= REFERRAL_TIER_THRESHOLDS[1]) {
    return REFERRAL_LEADERBOARD_PERCENTAGES[1];
  }
  if (position === 2 && newReferrals >= REFERRAL_TIER_THRESHOLDS[2]) {
    return REFERRAL_LEADERBOARD_PERCENTAGES[2];
  }
  if (position === 3 && newReferrals >= REFERRAL_TIER_THRESHOLDS[3]) {
    return REFERRAL_LEADERBOARD_PERCENTAGES[3];
  }

  // Если не достиг минимального порога для своей позиции, получает базовые 10%
  return REFERRAL_LEADERBOARD_PERCENTAGES.default;
}
