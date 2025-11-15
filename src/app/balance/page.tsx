'use client';

import { useState, useEffect } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { StarryBackground } from '@/components/StarryBackground';

interface Transaction {
  id: number;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
}

export default function BalancePage() {
  const { webApp, isReady } = useTelegramWebApp();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Balance page effect triggered', { isReady, webApp });

    // Таймаут для загрузки данных - не ждем Telegram
    const timer = setTimeout(() => {
      const userId = webApp?.initDataUnsafe?.user?.id;
      console.log('Fetching with userId:', userId);

      if (userId) {
        fetchBalanceAndTransactions(userId);
      } else {
        // Для тестирования без Telegram - используем тестовый ID
        console.log('No Telegram user found, using test data');
        fetchBalanceAndTransactions(123456789);
      }
    }, 500); // Даем 500мс на инициализацию

    return () => clearTimeout(timer);
  }, [webApp, isReady]);

  const fetchBalanceAndTransactions = async (userId: number) => {
    try {
      console.log('Starting fetch for userId:', userId);
      setLoading(true);

      const url = `/api/transactions?telegramId=${userId}`;
      console.log('Fetching from:', url);
      const response = await fetch(url);
      console.log('Response status:', response.status);

      if (!response.ok) {
        // Если пользователь не найден, создадим его
        if (response.status === 404) {
          console.log('User not found, creating new user...');
          const createResponse = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              telegramId: userId.toString(),
              username: 'Test User'
            })
          });

          console.log('Create user response:', createResponse.status);

          if (createResponse.ok) {
            // Попробуем снова получить данные
            console.log('Retrying fetch...');
            const retryResponse = await fetch(`/api/transactions?telegramId=${userId}`);
            const retryData = await retryResponse.json();
            console.log('Retry data:', retryData);
            setBalance(retryData.balance || 0);
            setTransactions(retryData.transactions || []);
            setLoading(false);
            return;
          }
        }
        throw new Error(`Failed to fetch transactions: ${response.status}`);
      }

      const data = await response.json();
      console.log('Transaction data received:', data);
      setBalance(data.balance || 0);
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching balance:', error);
      // Показываем пустое состояние вместо бесконечной загрузки
      setBalance(0);
      setTransactions([]);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '💰';
      case 'referral_bonus':
        return '🎁';
      case 'video_generation':
        return '🎬';
      case 'withdrawal':
        return '💸';
      default:
        return '💳';
    }
  };

  const getTransactionTitle = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Пополнение';
      case 'referral_bonus':
        return 'Бонус за реферала';
      case 'video_generation':
        return 'Генерация видео';
      case 'withdrawal':
        return 'Списание';
      default:
        return 'Транзакция';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Сегодня в ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Вчера в ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24">
        <StarryBackground />
        <div className="text-center">
          <div className="text-5xl mb-3">⏳</div>
          <p className="text-white/90 text-base drop-shadow-lg">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-20">
      <StarryBackground />
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-2xl">
        {/* Заголовок */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-8">Баланс</h1>

        {/* Карточка баланса (оптимальное расположение) */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-8 mb-4 sm:mb-8 text-white shadow-lg flex flex-col items-center">
          <div className="mb-4 sm:mb-6 text-center">
            <p className="text-purple-100 text-xl sm:text-3xl font-bold mb-1 sm:mb-2">Доступно токенов:</p>
            <h2 className="text-3xl sm:text-5xl font-bold">{balance}</h2>
          </div>
          <div className="w-full bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-center justify-center gap-2 sm:gap-3">
            <div className="bg-white/20 rounded-full p-1.5 sm:p-2">
              <span className="text-xl sm:text-2xl">🎬</span>
            </div>
            <div className="text-center w-full">
              <p className="text-white/80 text-sm sm:text-base font-semibold mb-0.5 sm:mb-1">Этого хватит для генерации максимум:</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-white font-bold text-xl sm:text-2xl">{Math.floor(balance / 6)}</span>
                <span className="text-white font-bold text-xl sm:text-2xl">видео</span>
              </div>
            </div>          </div>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="mt-2 bg-white text-purple-600 px-6 sm:px-8 py-4 sm:py-5 rounded-lg sm:rounded-xl font-bold hover:bg-purple-50 active:bg-purple-50 transition-colors w-full text-lg sm:text-xl"
          >
            Пополнить баланс
          </button>
        </div>

        {/* История транзакций */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">История операций</h3>
          </div>

          {transactions.length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-gray-500">
              <p className="text-base sm:text-lg mb-2">История пуста</p>
              <p className="text-xs sm:text-sm">Здесь будут отображаться все ваши операции</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 sm:p-6 hover:bg-gray-50 active:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1 mr-3">
                      <div className="text-2xl sm:text-3xl flex-shrink-0">{getTransactionIcon(transaction.type)}</div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm sm:text-base text-gray-800 mb-0.5 sm:mb-1">
                          {getTransactionTitle(transaction.type)}
                        </h4>
                        {transaction.description && (
                          <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1 line-clamp-2">
                            {transaction.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className={`font-bold text-base sm:text-lg flex-shrink-0 ${
                      transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {getTransactionTitle(transaction.type) === 'Пополнение' ? `${transaction.amount} Т` : transaction.amount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
