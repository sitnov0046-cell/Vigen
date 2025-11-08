'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { DemoVideo } from '@/components/DemoVideo';
import GenerationForm from '@/components/GenerationForm';
import { SplashScreen } from '@/components/SplashScreen';

export default function Home() {
  // MOCK: Пример данных пользователя для предпросмотра
  const mockUser = {
    username: 'preview_user',
    photoUrl: 'https://i.pravatar.cc/100?img=3',
    tokens: 42,
    videos: 7,
    referrals: 3
  };
  const [userInfo, setUserInfo] = useState<{ username?: string; photoUrl?: string; balance?: number; videosCount?: number; referralsCount?: number }>({});
  const [showForm, setShowForm] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isContentReady, setIsContentReady] = useState(false);
  const { webApp } = useTelegramWebApp();
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!webApp?.initDataUnsafe?.user?.id) {
        return;
      }

      const user = webApp.initDataUnsafe.user;
      const telegramId = user.id;

      setUserInfo((prev) => ({
        ...prev,
        username: user.username,
        photoUrl: (user as any).photo_url || undefined
      }));

      try {
        // Используем endpoint register, который автоматически создаёт пользователя если его нет
        const registerRes = await fetch('/api/user/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            telegramId: telegramId,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
          }),
        });

        if (registerRes.ok) {
          const data = await registerRes.json();
          setUserInfo((prev) => ({
            ...prev,
            balance: data.balance,
            videosCount: data.videosCount,
            referralsCount: data.referralsCount
          }));
        }
      } catch (error) {
        console.error('Failed to load user stats:', error);
      }
    };
    fetchUserInfo();
  }, [webApp]);

  useEffect(() => {
    // Проверяем, показывали ли мы уже splash screen в этой сессии
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setShowSplash(false);
      setIsContentReady(true);
    }
  }, []);

  const handleSplashFinish = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
    setIsContentReady(true);
  };

  const handleCreateVideo = () => {
    if (!showForm) {
      setShowForm(true);
      // Даём время на рендер формы, затем прокручиваем
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      // Если форма уже открыта, просто прокручиваем к ней
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

      <main className={`min-h-screen bg-gradient-to-br from-purple-200 via-blue-200 to-pink-200 animate-gradient bg-300% flex items-center justify-center py-12 pb-24 transition-opacity duration-500 ${
        isContentReady ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="container mx-auto px-5 max-w-4xl">
          {/* Блок с информацией о пользователе */}
          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-3 whitespace-nowrap">
              Генератор видео - VIGEN
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Создавайте потрясающие видео с помощью ИИ и делитесь ими с друзьями
            </p>

            {/* Блок информации о пользователе */}
            <div className="relative flex items-center gap-5 bg-white/80 rounded-3xl shadow-xl p-5 my-5 border-2 border-transparent bg-clip-padding animate-fadeIn">
              {userInfo.photoUrl || mockUser.photoUrl ? (
                <img src={userInfo.photoUrl || mockUser.photoUrl} alt="avatar" className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover transition-transform duration-300 hover:scale-105" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex items-center justify-center text-3xl font-bold text-gray-600 border-4 border-white shadow-lg">
                  {(userInfo.username || mockUser.username)[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex flex-col justify-center gap-1">
                <span className="font-bold text-xl text-gray-800 tracking-wide drop-shadow-sm">@{userInfo.username || mockUser.username}</span>
                <span className="text-gray-500 text-base">Токенов:
                  <span className="ml-2 font-bold text-blue-700">{userInfo.balance ?? mockUser.tokens}</span>
                </span>
                <span className="text-gray-500 text-base">Сгенерировано видео:
                  <span className="ml-2 font-bold text-blue-700">{userInfo.videosCount ?? mockUser.videos}</span>
                </span>
                <span className="text-gray-500 text-base">Приглашено рефералов:
                  <span className="ml-2 font-bold text-blue-700">{userInfo.referralsCount ?? mockUser.referrals}</span>
                </span>
              </div>
            </div>

            {/* Демо видео */}
            <div className="my-5">
              <DemoVideo
                src="/videos/Видео 1.mp4"
                className="mb-4 mx-auto max-w-2xl"
              />
              <p className="text-gray-500 text-sm italic mb-6">
                Пример сгенерированного видео
              </p>
            </div>

            {/* Кнопки */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto my-5">
              <button
                onClick={handleCreateVideo}
                className="flex-1 text-xl py-4 px-6 rounded-xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-2xl flex items-center justify-center gap-2"
              >
                <span>✨</span>
                <span>Создать видео</span>
              </button>

              <Link
                href="/instructions"
                className="flex-1 text-xl py-4 px-6 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-2xl flex items-center justify-center gap-2"
              >
                <span>📖</span>
                <span>Инструкция</span>
              </Link>
            </div>
          </div>

          {/* Форма генерации */}
          {showForm && (
            <div ref={formRef} className="mt-8 animate-fadeIn w-full">
              <GenerationForm />
            </div>
          )}

          {/* Особенности */}
          {/* Новости */}
          <div className="my-5">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📰 Новости и обновления</h2>
            <div className="max-h-72 overflow-y-auto flex flex-col gap-4 pr-2 custom-scrollbar-news">
              {/* Новость 1: Появление реферальной ссылки (NEW) */}
              <div className="bg-white rounded-2xl shadow-lg p-4 border-l-4 border-blue-400 flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <span className="flex flex-col items-start gap-1">
                    <span className="flex items-center gap-2 mb-1">
                      <span className="animate-fire text-2xl animate-pulse leading-none -mt-1">
                        🔥
                      </span>
                      <span className="text-black text-xl font-extrabold tracking-widest leading-none animate-fast-pulse" style={{letterSpacing: '0.12em'}}>NEW</span>
                    </span>
                    <span className="text-base text-gray-800 font-semibold">Реферальная ссылка для друзей</span>
                  </span>
                  <span className="text-xs text-gray-500 ml-2">05.11.2025</span>
                </div>
                <div className="text-gray-700 text-base">
                  Теперь вы можете приглашать друзей по реферальной ссылке и получать бонусы за их активность! Делитесь ссылкой в соцсетях и мессенджерах, чтобы зарабатывать больше.
                </div>
              </div>
              {/* Новость 2: Появление топа видео */}
              <div className="bg-white rounded-2xl shadow-lg p-4 border-l-4 border-blue-400 flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-lg text-gray-800">Топ видео теперь доступен!</span>
                  <span className="text-xs text-gray-500 ml-2">01.11.2025</span>
                </div>
                <div className="text-gray-700 text-base">
                  В приложении появился новый раздел <b>Топ видео</b> — теперь вы можете смотреть лучшие работы пользователей, вдохновляться и делиться своими видео с другими! Попробуйте попасть в топ недели!
                </div>
              </div>
            </div>
            <style jsx>{`
              @keyframes fire {
                0% { filter: blur(1px) brightness(1.2) drop-shadow(0 0 6px #ff9800); opacity: 0.7; transform: scale(1) rotate(-2deg); }
                30% { filter: blur(2px) brightness(1.5) drop-shadow(0 0 12px #ff5722); opacity: 1; transform: scale(1.1) rotate(2deg); }
                60% { filter: blur(1.5px) brightness(1.3) drop-shadow(0 0 10px #ff9800); opacity: 0.8; transform: scale(1.05) rotate(-1deg); }
                100% { filter: blur(1px) brightness(1.2) drop-shadow(0 0 6px #ff9800); opacity: 0.7; transform: scale(1) rotate(-2deg); }
              }
              @keyframes fastPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
              .animate-fire {
                animation: fire 1.2s infinite linear;
                pointer-events: none;
                z-index: 0;
              }
              .animate-fast-pulse {
                animation: fastPulse 0.8s ease-in-out infinite;
              }
              .animate-bounce {
                animation: bounce 1.2s infinite;
              }
              .custom-scrollbar-news::-webkit-scrollbar {
                width: 8px;
              }
              .custom-scrollbar-news::-webkit-scrollbar-track {
                background: #f3f4f6;
                border-radius: 10px;
              }
              .custom-scrollbar-news::-webkit-scrollbar-thumb {
                background: linear-gradient(to bottom, #a855f7, #ec4899);
                border-radius: 10px;
              }
              .custom-scrollbar-news::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(to bottom, #9333ea, #db2777);
              }
            `}</style>
          </div>
        </div>
      </main>
    </>
  );
}
