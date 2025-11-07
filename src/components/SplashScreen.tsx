'use client';

import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number;
}

export function SplashScreen({ onFinish, duration = 2500 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Начинаем fade out анимацию перед закрытием
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, duration - 500);

    // Полностью скрываем экран
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      onFinish();
    }, duration);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onFinish]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center">
        {/* Большая анимированная иконка */}
        <div className="mb-6">
          <div className="text-9xl animate-bounce filter drop-shadow-2xl">
            🎬
          </div>
        </div>

        {/* Название приложения */}
        <div className="mb-6">
          <div className="text-white font-black tracking-wider" style={{
            fontSize: '3.5rem',
            textShadow: '0 4px 12px rgba(0,0,0,0.4)',
            letterSpacing: '0.1em',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            VIGEN
          </div>
          <div className="text-white text-xl mt-2 opacity-90" style={{
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            AI Video Generator
          </div>
        </div>

        {/* Анимированный индикатор загрузки */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      {/* Декоративные элементы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl opacity-20 animate-spin-slow">✨</div>
        <div className="absolute bottom-20 right-20 text-6xl opacity-20 animate-spin-slow">🎥</div>
        <div className="absolute top-1/3 right-10 text-5xl opacity-20 animate-bounce">🌟</div>
        <div className="absolute bottom-1/3 left-20 text-5xl opacity-20 animate-bounce">💫</div>
      </div>
    </div>
  );
}
