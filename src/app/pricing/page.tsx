'use client';

import { useState } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { BottomNavigation } from '@/components/BottomNavigation';
import { TOKENS_PER_VIDEO } from '@/lib/constants';

interface PricingPlan {
  id: string;
  name: string;
  emoji: string;
  generations: number;
  tokens: number;
  priceWithDiscount: number;
  priceWithoutDiscount: number;
  popular?: boolean;
  color: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'amateur',
    name: 'Любительский',
    emoji: '🎬',
    generations: 10,
    tokens: 20,
    priceWithDiscount: 499,
    priceWithoutDiscount: 690,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'creative',
    name: 'Творческий',
    emoji: '🎨',
    generations: 25,
    tokens: 50,
    priceWithDiscount: 999,
    priceWithoutDiscount: 1490,
    popular: true,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'advanced',
    name: 'Продвинутый',
    emoji: '🚀',
    generations: 60,
    tokens: 120,
    priceWithDiscount: 1990,
    priceWithoutDiscount: 2990,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'professional',
    name: 'Профессиональный',
    emoji: '👑',
    generations: 120,
    tokens: 240,
    priceWithDiscount: 3990,
    priceWithoutDiscount: 5586,
    color: 'from-yellow-500 to-amber-500'
  }
];

export default function PricingPage() {
  const { webApp } = useTelegramWebApp();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const calculateDiscount = (withDiscount: number, withoutDiscount: number) => {
    return Math.round(((withoutDiscount - withDiscount) / withoutDiscount) * 100);
  };

  const handlePayment = (plan: PricingPlan) => {
    setSelectedPlan(plan.id);
    // Здесь будет интеграция с платёжной системой
    alert(`Оплата тарифа "${plan.name}" - ${plan.priceWithDiscount}₽\n\nИнтеграция с платёжной системой будет добавлена скоро!`);
    setSelectedPlan(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-24">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Выберите тариф</h1>
          <p className="text-gray-600 text-lg">Получите токены для создания потрясающих видео</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md">
            <span className="text-2xl">💎</span>
            <span className="font-semibold text-gray-700">
              1 генерация = {TOKENS_PER_VIDEO} токена
            </span>
          </div>
        </div>

        {/* Карточки тарифов */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {pricingPlans.map((plan) => {
            const discount = calculateDiscount(plan.priceWithDiscount, plan.priceWithoutDiscount);

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  plan.popular ? 'ring-4 ring-purple-500 ring-opacity-50' : ''
                }`}
              >
                {/* Бейдж "Популярный" */}
                {plan.popular && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                      <span>⭐</span>
                      <span>Популярный</span>
                    </div>
                  </div>
                )}

                {/* Цветной градиент сверху */}
                <div className={`h-32 bg-gradient-to-r ${plan.color} relative`}>
                  <div className="absolute inset-0 bg-black opacity-10"></div>
                  <div className="relative h-full flex items-center justify-center">
                    <span className="text-7xl filter drop-shadow-lg">{plan.emoji}</span>
                  </div>
                </div>

                {/* Контент карточки */}
                <div className="p-8">
                  {/* Название тарифа */}
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">{plan.name}</h3>

                  {/* Количество генераций */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-5xl font-extrabold text-gray-900">
                        {plan.generations}
                      </span>
                      <span className="text-xl text-gray-600">генераций</span>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {plan.tokens} токенов
                    </p>
                  </div>

                  {/* Цены */}
                  <div className="mb-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-5">
                    {/* Цена со скидкой */}
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-extrabold text-gray-900">
                        {plan.priceWithDiscount}
                      </span>
                      <span className="text-2xl text-gray-600">₽</span>
                    </div>

                    {/* Старая цена и скидка */}
                    <div className="flex items-center gap-3">
                      <span className="text-lg text-gray-400 line-through">
                        {plan.priceWithoutDiscount}₽
                      </span>
                      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{discount}%
                      </div>
                    </div>

                    {/* Цена за генерацию */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-800">
                          {Math.round(plan.priceWithDiscount / plan.generations)}₽
                        </span>
                        {' '}за генерацию
                      </p>
                    </div>
                  </div>

                  {/* Преимущества */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-700">
                      <span className="text-green-500 text-xl">✓</span>
                      <span>Мгновенная активация</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <span className="text-green-500 text-xl">✓</span>
                      <span>Без ограничений по времени</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <span className="text-green-500 text-xl">✓</span>
                      <span>Все модели нейросетей</span>
                    </div>
                  </div>

                  {/* Кнопка оплаты */}
                  <button
                    onClick={() => handlePayment(plan)}
                    disabled={selectedPlan === plan.id}
                    className={`w-full bg-gradient-to-r ${plan.color} text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-lg`}
                  >
                    {selectedPlan === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span>
                        <span>Обработка...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>💳</span>
                        <span>Оплатить {plan.priceWithDiscount}₽</span>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Дополнительная информация */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              🎁 Специальное предложение
            </h3>
            <p className="text-gray-600 mb-4">
              Скидка действует ограниченное время! Не упустите возможность получить токены по выгодной цене.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
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

      <BottomNavigation />
    </div>
  );
}
