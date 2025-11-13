'use client';

import { useState, useEffect } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { TOKEN_PACKAGES } from '@/config/video-tariffs';
import { StarryBackground } from '@/components/StarryBackground';

interface PricingPlan {
  id: string;
  name: string;
  emoji: string;
  tokens: number;
  price: number;
  pricePerToken: number;
  popular?: boolean;
  discount?: string;
  color: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'mini',
    name: 'Мини',
    emoji: '🌱',
    tokens: 49,
    price: 490,
    pricePerToken: 10.00,
    color: 'from-blue-400 to-cyan-500'
  },
  {
    id: 'start',
    name: 'Старт',
    emoji: '🎯',
    tokens: 100,
    price: 990,
    pricePerToken: 9.90,
    discount: '-1%',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'standard',
    name: 'Стандарт',
    emoji: '⭐',
    tokens: 205,
    price: 1990,
    pricePerToken: 9.71,
    discount: '-3%',
    popular: true,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'pro',
    name: 'Про',
    emoji: '🚀',
    tokens: 315,
    price: 2990,
    pricePerToken: 9.49,
    discount: '-5%',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'business',
    name: 'Бизнес',
    emoji: '💼',
    tokens: 537,
    price: 4990,
    pricePerToken: 9.29,
    discount: '-7%',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'vip',
    name: 'VIP',
    emoji: '👑',
    tokens: 1112,
    price: 9990,
    pricePerToken: 8.98,
    discount: '-10%',
    color: 'from-yellow-500 to-amber-500'
  }
];

export default function PricingPage() {
  const { webApp } = useTelegramWebApp();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Проверяем, новый ли пользователь (зарегистрирован менее 4 часов назад)
    const checkNewUser = async () => {
      const userId = webApp?.initDataUnsafe?.user?.id;

      if (!userId) {
        return;
      }

      try {
        const response = await fetch(`/api/users?telegramId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          const registeredAt = new Date(data.user.createdAt);
          const now = new Date();
          const hoursSinceRegistration = (now.getTime() - registeredAt.getTime()) / (1000 * 60 * 60);

          if (hoursSinceRegistration < 4) {
            setIsNewUser(true);
            // Вычисляем оставшееся время в секундах (4 часа)
            const secondsLeft = Math.floor((4 * 60 * 60) - (hoursSinceRegistration * 60 * 60));
            setTimeLeft(secondsLeft > 0 ? secondsLeft : 0);
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      }
    };

    checkNewUser();
  }, [webApp]);

  // Таймер обратного отсчёта
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsNewUser(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePayment = (plan: PricingPlan) => {
    setSelectedPlan(plan.id);
    const finalPrice = isNewUser ? Math.round(plan.price * 0.8) : plan.price;
    const discount = isNewUser ? ' (скидка 20%)' : '';
    alert(`Оплата тарифа "${plan.name}" - ${finalPrice}₽${discount}\n\nВы получите ${plan.tokens} токенов\n\nИнтеграция с платёжной системой будет добавлена скоро!`);
    setSelectedPlan(null);
  };

  return (
    <div className="min-h-screen pt-16 pb-20">
      <StarryBackground />
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-5xl">
        {/* Заголовок */}
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">Выберите тариф</h1>
          <p className="text-white text-sm sm:text-lg">Получите токены для создания потрясающих видео с ИИ</p>

          {/* Баннер скидки для новых пользователей */}
          {isNewUser && (
            <div className="mt-4 sm:mt-6 max-w-2xl mx-auto bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl animate-pulse">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <span className="text-xl sm:text-3xl">🎉</span>
                <h3 className="text-lg sm:text-2xl font-bold text-white">Специальное предложение!</h3>
                <span className="text-xl sm:text-3xl">🎁</span>
              </div>
              <p className="text-white text-sm sm:text-lg font-semibold mb-3 sm:mb-4">
                Скидка 20% на первое пополнение для новых пользователей!
              </p>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-white/40">
                <p className="text-white text-xs sm:text-sm mb-2">⏰ Предложение действительно ещё:</p>
                <div className="text-2xl sm:text-4xl font-mono font-bold text-yellow-300 tracking-wider">
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Карточки тарифов */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8 max-w-3xl mx-auto">
          {pricingPlans.map((plan) => {
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden ${
                  plan.popular ? 'ring-2 sm:ring-4 ring-purple-500 ring-opacity-50' : ''
                }`}
              >
                {/* Бейдж "Популярный" */}
                {plan.popular && (
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-1">
                      <span>⭐</span>
                      <span>Популярный</span>
                    </div>
                  </div>
                )}

                {/* Бейдж скидки */}
                {plan.discount && (
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                      {plan.discount}
                    </div>
                  </div>
                )}

                {/* Цветной градиент сверху */}
                <div className={`h-24 sm:h-32 bg-gradient-to-r ${plan.color} relative`}>
                  <div className="absolute inset-0 bg-black opacity-10"></div>
                  <div className="relative h-full flex items-center justify-center">
                    <span className="text-5xl sm:text-7xl filter drop-shadow-lg">{plan.emoji}</span>
                  </div>
                </div>

                {/* Контент карточки */}
                <div className="p-4 sm:p-8">
                  {/* Название тарифа */}
                  <h3 className="text-xl sm:text-3xl font-bold text-gray-800 mb-2">{plan.name}</h3>

                  {/* Количество токенов */}
                  <div className="mb-4 sm:mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-5xl font-extrabold text-gray-900">
                        {plan.tokens}
                      </span>
                      <span className="text-base sm:text-xl text-gray-600">токенов</span>
                    </div>
                  </div>

                  {/* Цены */}
                  <div className="mb-4 sm:mb-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-5">
                    {/* Основная цена */}
                    {isNewUser ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg sm:text-2xl text-gray-400 line-through">
                            {plan.price}₽
                          </span>
                          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            -20%
                          </div>
                          <div className="flex items-center gap-1 bg-orange-50 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 ml-auto">
                            <span className="text-xs sm:text-sm text-orange-600">⏰</span>
                            <span className="text-xs sm:text-sm font-mono font-bold text-orange-600">
                              {formatTime(timeLeft)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-2xl sm:text-4xl font-extrabold text-green-600">
                            {Math.round(plan.price * 0.8)}
                          </span>
                          <span className="text-lg sm:text-2xl text-green-600">₽</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl sm:text-4xl font-extrabold text-gray-900">
                          {plan.price}
                        </span>
                        <span className="text-lg sm:text-2xl text-gray-600">₽</span>
                      </div>
                    )}

                    {/* Цена за токен */}
                    <div className="mb-3 pb-3 border-b border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-600">
                        <span className="font-semibold text-gray-800">
                          {plan.pricePerToken.toFixed(2)}₽
                        </span>
                        {' '}за токен
                      </p>
                    </div>

                    {/* Примеры использования */}
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>SORA 5 сек (6 т)</span>
                        <span className="font-semibold">{Math.floor(plan.tokens / 6)} видео</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SORA 10 сек (9 т)</span>
                        <span className="font-semibold">{Math.floor(plan.tokens / 9)} видео</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Veo 3 (13 т)</span>
                        <span className="font-semibold">{Math.floor(plan.tokens / 13)} видео</span>
                      </div>
                    </div>
                  </div>

                  {/* Преимущества */}
                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                      <span className="text-green-500 text-lg sm:text-xl">✓</span>
                      <span>Мгновенная активация</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                      <span className="text-green-500 text-lg sm:text-xl">✓</span>
                      <span>Без ограничений по времени</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                      <span className="text-green-500 text-lg sm:text-xl">✓</span>
                      <span>Все модели нейросетей</span>
                    </div>
                  </div>

                  {/* Кнопка оплаты */}
                  <button
                    onClick={() => handlePayment(plan)}
                    disabled={selectedPlan === plan.id}
                    className={`w-full bg-gradient-to-r ${plan.color} text-white font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-lg sm:rounded-xl shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-lg sm:text-xl`}
                  >
                    {selectedPlan === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span>
                        <span>Обработка...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>💳</span>
                        <span>Купить за {isNewUser ? Math.round(plan.price * 0.8) : plan.price}₽</span>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Дополнительная информация */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8 mb-4 sm:mb-8">
          <div className="text-center">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
              🎁 Специальное предложение
            </h3>
            <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">
              Скидка действует ограниченное время! Не упустите возможность получить токены по выгодной цене.
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Безопасная оплата</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Мгновенное зачисление</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Поддержка 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
