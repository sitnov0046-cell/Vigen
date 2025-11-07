"use client";

import { useState, useEffect, useMemo } from "react";
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { BottomNavigation } from '@/components/BottomNavigation';

interface Referral {
  id: number;
  username: string;
  totalEarned: number;
  earnedToday: number;
  joinedAt: string;
}

interface ReferralBonus {
  id: number;
  amount: number;
  referralUsername: string;
  description: string;
  createdAt: string;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  referralCount: number;
  totalEarned: number;
  isCurrentUser: boolean;
}

export default function ReferralPage() {
  const { webApp } = useTelegramWebApp();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [bonusHistory, setBonusHistory] = useState<ReferralBonus[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [earnedToday, setEarnedToday] = useState(0);
  const [referralLink, setReferralLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Сортируем топ по количеству рефералов по убыванию
  const sortedLeaderboard = useMemo(() => {
    return [...leaderboard].sort((a, b) => b.referralCount - a.referralCount);
  }, [leaderboard]);

  useEffect(() => {
    const userId = webApp?.initDataUnsafe?.user?.id || 123456789;
    const username = webApp?.initDataUnsafe?.user?.username || 'testuser';

    // Генерируем реферальную ссылку
    setReferralLink(`https://t.me/your_bot?start=ref_${userId}`);

    // TODO: Загрузка данных с сервера
    fetchReferralData(userId);
  }, [webApp]);

  const fetchReferralData = async (userId: number) => {
    try {
      setLoading(true);

      // TODO: Заменить на реальные API запросы
      // const response = await fetch(`/api/referrals?userId=${userId}`);
      // const data = await response.json();

      // Временные данные для демонстрации
      setReferrals([
        { id: 1, username: 'user123', totalEarned: 50, earnedToday: 10, joinedAt: '2025-01-01' },
        { id: 2, username: 'alice_video', totalEarned: 120, earnedToday: 0, joinedAt: '2025-01-03' },
        { id: 3, username: 'bob_creator', totalEarned: 30, earnedToday: 5, joinedAt: '2025-01-05' },
      ]);

      setBonusHistory([
        { id: 1, amount: 5, referralUsername: 'bob_creator', description: 'Генерация видео', createdAt: new Date().toISOString() },
        { id: 2, amount: 10, referralUsername: 'user123', description: 'Генерация видео', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 3, amount: 15, referralUsername: 'alice_video', description: 'Покупка токенов', createdAt: new Date(Date.now() - 7200000).toISOString() },
      ]);

      // Генерируем 120 тестовых топ-рефералов
      const testLeaderboard = Array.from({ length: 120 }, (_, i) => ({
        rank: i + 1,
        username: i === 14 ? 'Вы' : `user${i + 1}`,
        referralCount: Math.floor(Math.random() * 200) + 1,
        totalEarned: Math.floor(Math.random() * 10000) + 100,
        isCurrentUser: i === 14
      }));
      setLeaderboard(testLeaderboard);

      setTotalEarned(200);
      setEarnedToday(15);
    } catch (error) {
      console.error('Ошибка загрузки реферальных данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getCommissionRate = (rank: number) => {
    if (rank === 1) return 15;
    if (rank === 2) return 13;
    if (rank === 3) return 11;
    return 10;
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return `Сегодня в ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-blue-200 to-pink-200 animate-gradient bg-300% flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-blue-200 to-pink-200 animate-gradient bg-300% pb-24">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Заголовок */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8">💰 Заработать</h1>

  {/* Карточка с общей статистикой */}
  {/* Верхний блок: заработано и кнопки */}
  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 mb-4 text-white shadow-lg">
    <p className="text-green-100 text-sm mb-2">Всего заработано</p>
    <div className="mb-4">
      <h2 className="text-5xl font-bold">{totalEarned}₽</h2>
    </div>
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
      <p className="text-white/80 text-sm mb-1">Заработано сегодня</p>
      <p className="text-white font-bold text-2xl">+{earnedToday}₽</p>
    </div>
    <div className="flex flex-col md:flex-row gap-4 mt-4">
      <button className="relative px-6 py-3 bg-white rounded-2xl font-bold text-gray-800 shadow-md hover:bg-gray-50 transition-colors flex items-center gap-2 text-lg overflow-hidden group">
        <span className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 via-pink-400 to-emerald-400 group-hover:from-indigo-500 group-hover:to-emerald-500 transition-all"></span>
        <span className="relative z-10 flex items-center gap-2">
          🔄 Обменять рубли на токены
        </span>
      </button>
      <button className="relative px-6 py-3 bg-white rounded-2xl font-bold text-gray-800 shadow-md hover:bg-gray-50 transition-colors flex items-center gap-2 text-lg overflow-hidden group">
        <span className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-pink-400 to-indigo-400 group-hover:from-emerald-500 group-hover:to-indigo-500 transition-all"></span>
        <span className="relative z-10 flex items-center gap-2">
          💸 Вывести рубли
        </span>
      </button>
    </div>
  </div>

  {/* Нижний блок: реферальная ссылка и призыв */}
  <div className="bg-white rounded-2xl p-4 mb-6 shadow flex flex-col items-start">
    <p className="text-gray-700 text-base font-semibold mb-2">Ваша реферальная ссылка</p>
    <div className="flex w-full gap-2 mb-3">
      <input
        type="text"
        value={referralLink}
        readOnly
        className="flex-1 px-3 py-2 rounded-xl bg-gray-100 text-gray-800 text-sm placeholder-gray-400 border border-gray-200 outline-none overflow-hidden text-ellipsis"
      />
      <button
        onClick={copyReferralLink}
        className="px-3 py-2 bg-white text-gray-900 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-colors whitespace-nowrap text-sm"
      >
        {copiedLink ? '✓' : '📋'}
      </button>
    </div>
    <p className="text-gray-600 text-sm mb-1">Поделитесь этой ссылкой с друзьями в сообщениях или выложите в сторис, чтобы получать бонусы за их регистрацию!</p>
    <p className="text-gray-400 text-xs">Чем больше друзей — тем больше заработок!</p>
  </div>

        {/* Лидерборд */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">🏆 Топ рефереров</h3>
            <span className="text-sm text-gray-500">Обновляется еженедельно</span>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-4 border-2 border-yellow-200">
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-bold">Бонусные ставки:</span> 🥇 15% | 🥈 13% | 🥉 11% | Остальные 10%
            </p>
            <p className="text-xs text-gray-600">
              Займите топ-3 места, чтобы получать больше за каждого реферала!
            </p>
          </div>

          {/* Скроллируемый список с топ-100 */}
          <div
            className="space-y-3 max-h-[500px] overflow-y-scroll pr-2 custom-scrollbar"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#a855f7 #f3f4f6',
              overflowY: 'scroll'
            }}
          >
            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #f3f4f6;
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: linear-gradient(to bottom, #a855f7, #ec4899);
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(to bottom, #9333ea, #db2777);
              }
            `}</style>
            {sortedLeaderboard.slice(0, 100).map((entry, i) => (
              <div
                key={entry.username}
                className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                  entry.isCurrentUser
                    ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300'
                    : i < 3
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold min-w-[3rem]">
                    {getRankEmoji(i + 1)}
                  </div>
                  <div>
                    <p className={`font-semibold ${entry.isCurrentUser ? 'text-purple-900' : 'text-gray-800'}`}>
                      {entry.username}
                    </p>
                    <p className="text-sm text-gray-600">
                      {entry.referralCount} рефералов • {entry.totalEarned}₽
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    i === 0 ? 'bg-yellow-200 text-yellow-900' :
                    i === 1 ? 'bg-gray-200 text-gray-900' :
                    i === 2 ? 'bg-orange-200 text-orange-900' :
                    'bg-blue-100 text-blue-900'
                  }`}>
                    {getCommissionRate(i + 1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {leaderboard.length >= 100 && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Показаны топ-100 рефереров
            </p>
          )}
        </div>

        {/* Список рефералов */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">👥 Ваши рефералы ({referrals.length})</h3>

          {referrals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">У вас пока нет рефералов</p>
              <p className="text-sm">Поделитесь своей реферальной ссылкой, чтобы начать зарабатывать!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-800">@{referral.username}</p>
                    <p className="text-sm text-gray-600">
                      Присоединился {new Date(referral.joinedAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+{referral.totalEarned}₽</p>
                    {referral.earnedToday > 0 && (
                      <p className="text-sm text-gray-600">(сегодня: +{referral.earnedToday}₽)</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* История бонусов */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📜 История начислений</h3>

          {bonusHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">История пуста</p>
              <p className="text-sm">Здесь будут отображаться все ваши начисления от рефералов</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bonusHistory.map((bonus) => (
                <div
                  key={bonus.id}
                  className="flex items-start justify-between p-4 border-l-4 border-green-500 bg-green-50 rounded-r-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">💰</div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Бонус от @{bonus.referralUsername}
                      </p>
                      <p className="text-sm text-gray-600">{bonus.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(bonus.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-lg">+{bonus.amount}₽</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
