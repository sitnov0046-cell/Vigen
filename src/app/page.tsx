'use client';

import { useState } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { DemoVideo } from '@/components/DemoVideo';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { webApp } = useTelegramWebApp();

  const handleGenerate = async () => {
    setIsGenerating(true);
    // TODO: Implement generation logic
    setIsGenerating(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center py-12">
      <div className="container-center">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
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
          <p className="text-white/70 text-sm italic">
            Пример сгенерированного видео
          </p>
        </div>

        {/* Основная секция */}
        <div className="glass-card mb-12">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Создать новое видео</h2>
              <p className="text-white/80">
                Опишите видео, которое хотите создать, и наши ИИ помогут воплотить вашу идею в жизнь
              </p>
            </div>

            <textarea
              placeholder="Например: Закат на пляже с пальмами, волны нежно накатывают на берег..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="input-field h-32 resize-none"
              disabled={isGenerating}
            />

            {!webApp && (
              <div className="flex justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="button-primary"
                >
                  {isGenerating ? 'Генерация...' : 'Сгенерировать видео'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Особенности */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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