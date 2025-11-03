'use client';

import { useState } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { DemoVideo } from '@/components/DemoVideo';
import GenerationForm from '@/components/GenerationForm';

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const { webApp } = useTelegramWebApp();

  return (
    <main className="min-h-screen flex items-center justify-center py-12">
      <div className="container-center">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">
            AI Video Generator
          </h1>
          <p className="text-white/80 text-lg mb-6">
            Создавайте потрясающие видео с помощью ИИ
          </p>
          
          {/* Демо видео */}
          <DemoVideo 
            src="/videos/Видео 1.mp4"
            className="mb-4 mx-auto max-w-2xl"
          />
          <p className="text-white/70 text-sm italic mb-6">
            Пример сгенерированного видео
          </p>

          {/* Кнопка открытия формы */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full max-w-sm mx-auto text-xl py-4 px-4 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out flex items-center justify-center gap-2 pulse-button"
          >
            <span>✨</span>
            <span>Создать видео</span>
          </button>
        </div>

        {/* Форма генерации */}
        {showForm && (
          <div className="mt-8 animate-fadeIn w-full">
            <GenerationForm />
          </div>
        )}

        {/* Особенности */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="feature-card">
            <h3 className="text-xl font-semibold mb-3">Veo 3</h3>
            <p className="text-white/80">
              Передовая технология генерации видео с непревзойденным качеством и реалистичностью
            </p>
          </div>
          <div className="feature-card">
            <h3 className="text-xl font-semibold mb-3">Sora 2</h3>
            <p className="text-white/80">
              Инновационный ИИ от Google для создания кинематографических видеороликов
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
