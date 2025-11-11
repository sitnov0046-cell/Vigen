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
    tokens: 6,
    model: 'sora-2',
    description: '5 секунд видео',
  },
  {
    id: 'sora-standard',
    name: 'SORA 2 - Стандарт',
    duration: 10,
    tokens: 9,
    model: 'sora-2',
    description: '10 секунд видео',
    popular: true,
  },
  {
    id: 'sora-extended',
    name: 'SORA 2 - Расширенный',
    duration: 15,
    tokens: 12,
    model: 'sora-2',
    description: '15 секунд видео',
  },
  // Veo 3 тариф
  {
    id: 'veo-basic',
    name: 'Veo 3 - Базовый',
    duration: 8,
    tokens: 13,
    model: 'veo-3-fast',
    description: '8 секунд видео с аудио',
  },
];

// Пакеты пополнения токенов
export interface TokenPackage {
  id: string;
  name: string;
  price: number; // в рублях
  tokens: number; // количество токенов
  pricePerToken: number; // цена за токен в рублях
  popular?: boolean;
  discount?: string; // процент экономии
}

export const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'mini',
    name: 'Мини',
    price: 490,
    tokens: 49,
    pricePerToken: 10.00,
  },
  {
    id: 'start',
    name: 'Старт',
    price: 990,
    tokens: 100,
    pricePerToken: 9.90,
    discount: '-1%',
  },
  {
    id: 'standard',
    name: 'Стандарт',
    price: 1990,
    tokens: 205,
    pricePerToken: 9.71,
    discount: '-3%',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Про',
    price: 2990,
    tokens: 315,
    pricePerToken: 9.49,
    discount: '-5%',
  },
  {
    id: 'business',
    name: 'Бизнес',
    price: 4990,
    tokens: 537,
    pricePerToken: 9.29,
    discount: '-7%',
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 9990,
    tokens: 1112,
    pricePerToken: 8.98,
    discount: '-10%',
  },
];

// Константы для расчётов (себестоимость генерации)
// Курс: 83₽ за $1
export const COST_PER_SECOND_SORA2 = 1.25; // $0.015/сек × 83 = 1.245₽/сек
export const COST_PER_SECOND_VEO3 = 4.15; // $0.40 за 8 сек = $0.05/сек × 83 = 4.15₽/сек

// Стоимость генераций в токенах
export const TOKEN_COSTS = {
  'sora-5sec': 6,
  'sora-10sec': 9,
  'sora-15sec': 12,
  'veo-8sec': 13,
} as const;

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
