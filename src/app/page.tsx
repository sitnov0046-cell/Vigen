'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { DemoVideo } from '@/components/DemoVideo';
import GenerationForm from '@/components/GenerationForm';
import { SplashScreen } from '@/components/SplashScreen';
import { StarryBackground } from '@/components/StarryBackground';

export default function Home() {
  const searchParams = useSearchParams();
  const [userInfo, setUserInfo] = useState<{ username?: string; photoUrl?: string; balance?: number; videosCount?: number; referralsCount?: number; publicId?: string }>({
    username: 'username',
    balance: 0,
    videosCount: 0,
    referralsCount: 0,
    publicId: 'L000000'
  });
  const [showForm, setShowForm] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [isContentReady, setIsContentReady] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { webApp } = useTelegramWebApp();
  const formRef = useRef<HTMLDivElement>(null);

  // Проверяем, нужно ли показывать splash screen
  useEffect(() => {
    // На localhost всегда показываем splash для предпросмотра
    const isLocalhost = window.location.hostname === 'localhost';
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');

    if (isLocalhost || !hasSeenSplash) {
      setShowSplash(true);
      setIsContentReady(false);
    }
    setIsMounted(true);
  }, []);

  // Проверяем query параметр для открытия формы
  useEffect(() => {
    const openForm = searchParams.get('openForm');
    if (openForm === 'true') {
      setShowForm(true);
      // Небольшая задержка для прокрутки после рендера
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      // Если нет Telegram WebApp (локальный предпросмотр), показываем моковые данные
      if (!webApp?.initDataUnsafe?.user?.id) {
        setUserInfo({
          username: 'demo_user',
          photoUrl: undefined,
          balance: 0,
          videosCount: 0,
          referralsCount: 0,
          publicId: 'L000000'
        });
        return;
      }

      const user = webApp.initDataUnsafe.user;
      const telegramId = user.id;

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
          // Устанавливаем все данные одновременно, чтобы избежать мигания
          setUserInfo({
            username: user.username,
            photoUrl: (user as any).photo_url || undefined,
            balance: data.balance,
            videosCount: data.videosCount,
            referralsCount: data.referralsCount,
            publicId: data.user?.publicId
          });
        }
      } catch (error) {
        console.error('Failed to load user stats:', error);
        // Если ошибка, показываем базовую информацию из Telegram + моковые данные для предпросмотра
        setUserInfo({
          username: user.username,
          photoUrl: (user as any).photo_url || undefined,
          balance: 0,
          videosCount: 0,
          referralsCount: 0,
          publicId: 'L000000' // Моковый ID для предпросмотра при недоступности БД
        });
      }
    };
    fetchUserInfo();
  }, [webApp]);

  // Блокируем скролл во время показа splash screen
  useEffect(() => {
    if (showSplash) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = '0';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [showSplash]);

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

  // Don't render content until client-side JS runs to prevent flash
  if (!isMounted) {
    return <div className="min-h-screen bg-[#0f172a]" />;
  }

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <StarryBackground />

      <main className={`min-h-screen flex items-center justify-center pt-20 sm:pt-16 pb-20 sm:pb-24 transition-opacity duration-500 ${
        isContentReady ? 'opacity-100' : 'opacity-0 invisible pointer-events-none'
      }`}>
        <div className="container mx-auto px-3 sm:px-5 max-w-4xl">
          {/* Блок с информацией о пользователе */}
          {/* Заголовок */}
          <div className="text-center mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-5xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg whitespace-nowrap">
              👑 Генератор видео - LIKS 👑
            </h1>
            <p className="text-white text-base sm:text-xl mb-4 sm:mb-6 drop-shadow-md">
              Создавайте потрясающие видео с помощью ИИ<br />и делитесь ими с друзьями
            </p>

            {/* Блок информации о пользователе */}
            <div className="relative flex flex-col items-center gap-2 bg-white/70 rounded-xl shadow-lg p-3 my-2 border border-blue-300 animate-fadeIn transition-all duration-300">
              <div className="flex items-center justify-center gap-3 w-full">
                {userInfo.photoUrl ? (
                  <img src={userInfo.photoUrl} alt="avatar" className="w-14 h-14 rounded-full border-2 border-white shadow object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex items-center justify-center text-xl font-bold text-gray-600 border-2 border-white shadow">
                    {(userInfo.username || 'U')[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col items-center gap-1">
                  <span className="font-bold text-sm text-gray-800">@{userInfo.username || 'username'}</span>
                  <div className="bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    <span className="text-gray-500 text-xs">ID: </span>
                    <span className="font-mono font-bold text-purple-600 text-sm">{userInfo.publicId || 'L000000'}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 w-full text-center pt-2 border-t border-gray-100">
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs">Токенов</span>
                  <span className="font-bold text-blue-700 text-sm">{userInfo.balance ?? 0}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs">Видео</span>
                  <span className="font-bold text-blue-700 text-sm">{userInfo.videosCount ?? 0}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs">Рефералов</span>
                  <span className="font-bold text-blue-700 text-sm">{userInfo.referralsCount ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Демо-видео */}
            <div className="my-6 sm:my-8">
              <DemoVideo src="/videos/Видео 1.mp4" />
              <p className="text-center text-white text-xs sm:text-sm mt-2 drop-shadow-md">
                Пример видео, сгенерированного нейросетью
              </p>
            </div>

            {/* Кнопки */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-2xl mx-auto my-3 sm:my-5">
              <button
                onClick={handleCreateVideo}
                className="flex-1 text-lg sm:text-2xl py-4 sm:py-5 px-6 sm:px-8 rounded-lg sm:rounded-xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white active:scale-95 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
              >
                <span>✨</span>
                <span>Создать видео</span>
              </button>

              <Link
                href="/instructions"
                className="flex-1 text-lg sm:text-2xl py-4 sm:py-5 px-6 sm:px-8 rounded-lg sm:rounded-xl font-bold bg-blue-600 text-white active:scale-95 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
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

          {/* Новости */}
          <div className="my-12 sm:my-16">
            <h2 className="text-lg sm:text-2xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">📰 Новости и обновления</h2>
            <div className="max-h-72 overflow-y-auto flex flex-col gap-3 sm:gap-4 pr-1 sm:pr-2 custom-scrollbar-news">
              {/* Новость 1: Появление реферальной ссылки (NEW) */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 border-l-2 sm:border-l-4 border-blue-400 flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <span className="flex flex-col items-start gap-1">
                    <span className="flex items-center gap-2 mb-1">
                      <span className="animate-fire text-xl sm:text-2xl animate-pulse leading-none -mt-1">
                        🔥
                      </span>
                      <span className="text-black text-base sm:text-xl font-extrabold tracking-widest leading-none animate-fast-pulse" style={{letterSpacing: '0.12em'}}>NEW</span>
                    </span>
                    <span className="text-sm sm:text-base text-gray-800 font-semibold">Реферальная ссылка для друзей</span>
                  </span>
                  <span className="text-xs text-gray-500 ml-2">05.11.2025</span>
                </div>
                <div className="text-gray-700 text-sm sm:text-base">
                  Теперь вы можете приглашать друзей по реферальной ссылке и получать бонусы за их активность! Делитесь ссылкой в соцсетях и мессенджерах, чтобы зарабатывать больше.
                </div>
              </div>
              {/* Новость 2: Появление топа видео */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 border-l-2 sm:border-l-4 border-blue-400 flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-base sm:text-lg text-gray-800">Топ видео теперь доступен!</span>
                  <span className="text-xs text-gray-500 ml-2">01.11.2025</span>
                </div>
                <div className="text-gray-700 text-sm sm:text-base">
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
